import { Router, Request, Response } from 'express';
import QuestionPaper from '../models/QuestionPaper';
import { generatePDF } from '../services/pdf.service';
import redis from '../config/redis';

const router = Router();

// GET /api/question-papers/assignment/:assignmentId
router.get(
  '/assignment/:assignmentId',
  async (req: Request, res: Response) => {
    try {
      const { assignmentId } = req.params;

      // Check Redis cache first
      const cached = await redis.get(`qp:${assignmentId}`);
      if (cached) {
        return res.json({
          success: true,
          data: JSON.parse(cached),
          cached: true,
        });
      }

      // Cache miss: query MongoDB
      const paper = await QuestionPaper.findOne({
        assignmentId,
      }).sort({ createdAt: -1 });

      if (!paper)
        return res.status(404).json({
          success: false,
          message: 'Paper not found. It may still be generating.',
        });

      // Cache for 1 hour
      await redis.setex(
        `qp:${assignmentId}`,
        3600,
        JSON.stringify(paper.toObject())
      );

      res.json({ success: true, data: paper });
    } catch (err: any) {
      res
        .status(500)
        .json({ success: false, message: err.message });
    }
  }
);

// GET /api/question-papers/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const paper = await QuestionPaper.findById(req.params.id);
    if (!paper)
      return res
        .status(404)
        .json({ success: false, message: 'Not found' });
    res.json({ success: true, data: paper });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/question-papers/:id/pdf
router.get('/:id/pdf', async (req: Request, res: Response) => {
  try {
    const paper = await QuestionPaper.findById(req.params.id);
    if (!paper)
      return res
        .status(404)
        .json({ success: false, message: 'Not found' });

    const pdfBuffer = await generatePDF(paper);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${paper.title.replace(/\s+/g, '_')}.pdf"`
    );
    res.send(pdfBuffer);
  } catch (err: any) {
    console.error('PDF error:', err);
    res
      .status(500)
      .json({ success: false, message: 'PDF generation failed' });
  }
});

export default router;