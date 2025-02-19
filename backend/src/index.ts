import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import config from './config';
import campaignRoutes from './routes/campaignRoutes';
import { errorHandler, AppError } from './middleware/errorHandler';

const app = express();

// Middleware
app.use(cors({
  origin: config.corsOrigin,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Routes
app.use('/api', campaignRoutes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// 404 handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Cannot ${req.method} ${req.path}`, 404));
});

// Error handling
app.use(errorHandler);

// Start server
const server = app.listen(config.port, () => {
  console.log(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
}); 