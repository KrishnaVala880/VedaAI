import dotenv from 'dotenv';
dotenv.config(); // ✅ MUST BE FIRST

import express from 'express';
import cors from 'cors';
import http from 'http';

import { connectDB } from './config/database';
import { WebSocketManager } from './services/websocket';
import { startWorker } from './services/queue';
import assignmentRoutes from './routes/assignment.routes';
import questionPaperRoutes from './routes/questionPaper.routes';


const app = express();
const server = http.createServer(app);

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/assignments', assignmentRoutes);
app.use('/api/question-papers', questionPaperRoutes);
app.get('/api/health', (_, res) =>
  res.json({ status: 'ok', time: new Date().toISOString() })
);

// Start
const PORT = process.env.PORT || 5000;

async function bootstrap() {
  await connectDB();
  WebSocketManager.getInstance(server);
  startWorker();

  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🔌 WebSocket on ws://localhost:${PORT}/ws`);
  });
}

bootstrap().catch(console.error);