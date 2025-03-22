import express, { Request, Response, NextFunction, Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import compression from 'compression';
import { env } from './config/env.config';
import { connectDB } from './config/db.config';
import { errorHandler } from './middlewares/errorhandler.middleware';
import { apiLimiter } from './middlewares/ratelimiter.middlewares';
import authRoutes from './routes/auth.routes';
import postRoutes from './routes/post.routes';
import commentRoutes from './routes/comment.routes';
import adminRoutes from './routes/admin.routes';
import { notFoundHandler } from './middlewares/notfound.middlewares';

connectDB();

const app: Application = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(cookieParser());

app.use(helmet());

app.use(mongoSanitize());

app.use(apiLimiter);

app.use(hpp());

app.use(
  cors({
    origin: env.NODE_ENV === 'production' ? env.FRONTEND_URL : true,
    credentials: true,
  }),
);

app.use(compression());

if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Habsblog API, API is running correctly',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/admin', adminRoutes);

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

app.use(errorHandler);
app.use(notFoundHandler);

const PORT = env.PORT;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${env.NODE_ENV} mode on port ${PORT}`);
});

process.on('unhandledRejection', (err: Error) => {
  console.error(`Error: ${err.message}`);

  server.close(() => process.exit(1));
});