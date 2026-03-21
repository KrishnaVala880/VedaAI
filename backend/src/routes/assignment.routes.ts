import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Assignment from '../models/Assignment';
import { generationQueue } from '../services/queue';
import { z } from 'zod';

const router = Router();

// File upload config
const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    const dir = 'uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_, file, cb) => {
    const allowed = ['.pdf', '.txt', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  },
});

// Validation schema
const createSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  subject: z.string().min(1, 'Subject is required').max(100),
  grade: z.string().min(1, 'Grade is required'),
  board: z.string().optional().default('CBSE'),
  dueDate: z.string().refine(
    (d) => new Date(d) > new Date(),
    { message: 'Due date must be in the future' }
  ),
  duration: z.number().min(1, 'Duration must be at least 1 minute'),
  totalMarks: z.number().min(1, 'Total marks must be at least 1'),
  questionTypes: z
    .array(
      z.object({
        type: z.enum([
          'mcq',
          'short_answer',
          'long_answer',
          'true_false',
          'fill_blanks',
          'diagram',
          'numerical',
        ]),
        count: z.number().min(1, 'At least 1 question'),
        marksEach: z.number().min(1, 'At least 1 mark'),
      })
    )
    .min(1, 'At least one question type required'),
  additionalInstructions: z.string().optional().default(''),
});

// POST /api/assignments - Create assignment and start generation
router.post(
  '/',
  upload.single('file'),
  async (req: Request, res: Response) => {
    try {
      const body = { ...req.body };

      // Parse stringified fields (from FormData)
      if (typeof body.questionTypes === 'string')
        body.questionTypes = JSON.parse(body.questionTypes);
      if (typeof body.duration === 'string')
        body.duration = parseInt(body.duration);
      if (typeof body.totalMarks === 'string')
        body.totalMarks = parseInt(body.totalMarks);

      // Validate
      const validated = createSchema.parse(body);

      // Handle file
      let fileUrl: string | undefined;
      let fileText: string | undefined;
      if (req.file) {
        fileUrl = `/uploads/${req.file.filename}`;
        if (req.file.originalname.endsWith('.txt')) {
          fileText = fs.readFileSync(req.file.path, 'utf-8');
        }
      }

      // Save to MongoDB
      const assignment = new Assignment({
        ...validated,
        fileUrl,
        fileText,
        status: 'draft',
      });
      await assignment.save();

      // Add to BullMQ queue
      await generationQueue.add('generate', {
        assignmentId: assignment._id.toString(),
      });

      assignment.status = 'processing';
      await assignment.save();

      res.status(201).json({ success: true, data: assignment });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res
          .status(400)
          .json({ success: false, errors: err.errors });
      }
      res
        .status(500)
        .json({ success: false, message: err.message });
    }
  }
);

// GET /api/assignments - List all
router.get('/', async (_req: Request, res: Response) => {
  try {
    const assignments = await Assignment.find().sort({
      createdAt: -1,
    });
    res.json({ success: true, data: assignments });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/assignments/:id - Get one
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const doc = await Assignment.findById(req.params.id);
    if (!doc)
      return res
        .status(404)
        .json({ success: false, message: 'Not found' });
    res.json({ success: true, data: doc });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/assignments/:id/regenerate
router.post('/:id/regenerate', async (req: Request, res: Response) => {
  try {
    const doc = await Assignment.findById(req.params.id);
    if (!doc)
      return res
        .status(404)
        .json({ success: false, message: 'Not found' });

    doc.status = 'processing';
    await doc.save();

    await generationQueue.add('generate', {
      assignmentId: doc._id.toString(),
    });

    res.json({ success: true, message: 'Regeneration started' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});
// DELETE /api/assignments/:id - Delete assignment
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const doc = await Assignment.findByIdAndDelete(req.params.id);

    if (!doc) {
      return res
        .status(404)
        .json({ success: false, message: 'Not found' });
    }

    // Delete associated question papers (optional)
    try {
      const QP = require('../models/QuestionPaper').default;
      await QP.deleteMany({ assignmentId: req.params.id });
    } catch (e) {
      // ignore if model doesn't exist
    }

    // Clear Redis cache (optional)
    try {
      const redisClient = require('../config/redis').default;
      await redisClient.del(`qp:${req.params.id}`);
    } catch (e) {
      // ignore if redis not configured
    }

    res.json({
      success: true,
      message: 'Assignment deleted successfully',
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});
export default router;