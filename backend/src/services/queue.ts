import { Queue, Worker, Job } from 'bullmq';
import redis from '../config/redis';
import { generateQuestionPaper } from './ai.service';
import Assignment from '../models/Assignment';
import QuestionPaper from '../models/QuestionPaper';
import { WebSocketManager } from './websocket';

// Create the queue
export const generationQueue = new Queue('question-generation', {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: false,
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
  },
});

// Start the worker that processes jobs
export function startWorker() {
  const worker = new Worker(
    'question-generation',
    async (job: Job) => {
      const { assignmentId } = job.data;
      const ws = WebSocketManager.getInstance();

      try {
        // Step 1: Update status
        await Assignment.findByIdAndUpdate(assignmentId, {
          status: 'processing',
        });

        ws.sendToAssignment(assignmentId, {
          type: 'progress',
          status: 'processing',
          message: 'Analyzing requirements...',
          progress: 10,
        });

        // Step 2: Fetch assignment from DB
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) throw new Error('Assignment not found');

        ws.sendToAssignment(assignmentId, {
          type: 'progress',
          status: 'processing',
          message: 'Building AI prompt...',
          progress: 25,
        });

        // Small delay for UX
        await new Promise((r) => setTimeout(r, 800));

        ws.sendToAssignment(assignmentId, {
          type: 'progress',
          status: 'processing',
          message: 'Generating questions with AI...',
          progress: 40,
        });

        // Step 3: Call AI service
        const result = await generateQuestionPaper(assignment);

        ws.sendToAssignment(assignmentId, {
          type: 'progress',
          status: 'processing',
          message: 'Structuring question paper...',
          progress: 75,
        });

        await new Promise((r) => setTimeout(r, 500));

        ws.sendToAssignment(assignmentId, {
          type: 'progress',
          status: 'processing',
          message: 'Saving and validating...',
          progress: 90,
        });

        // Step 4: Save to MongoDB
        const paper = new QuestionPaper({
          assignmentId,
          ...result,
        });
        await paper.save();

        // Step 5: Cache in Redis (1 hour TTL)
        await redis.setex(
          `qp:${assignmentId}`,
          3600,
          JSON.stringify(paper.toObject())
        );

        // Step 6: Update assignment status
        await Assignment.findByIdAndUpdate(assignmentId, {
          status: 'completed',
        });

        // Step 7: Notify frontend
        ws.sendToAssignment(assignmentId, {
          type: 'completed',
          status: 'completed',
          message: 'Question paper generated successfully!',
          progress: 100,
          questionPaperId: paper._id,
        });

        return { questionPaperId: paper._id };
      } catch (err: any) {
        console.error(`Job failed for ${assignmentId}:`, err.message);

        await Assignment.findByIdAndUpdate(assignmentId, {
          status: 'failed',
        });

        ws.sendToAssignment(assignmentId, {
          type: 'failed',
          status: 'failed',
          message: err.message || 'Generation failed. Please try again.',
          progress: 0,
        });

        throw err;
      }
    },
    { connection: redis, concurrency: 2 }
  );

  worker.on('completed', (job) =>
    console.log(`✅ Job ${job.id} completed`)
  );
  worker.on('failed', (job, err) =>
    console.error(`❌ Job ${job?.id} failed:`, err.message)
  );

  return worker;
}