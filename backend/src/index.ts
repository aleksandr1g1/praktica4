import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { AppDataSource } from './config/database';

// Routes
import authRoutes from './routes/auth.routes';
import testRoutes from './routes/test.routes';
import adminRoutes from './routes/admin.routes';
import psychologistRoutes from './routes/psychologist.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploaded images
app.use(
  '/uploads',
  express.static(path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads'))
);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', testRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/psychologist', psychologistRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Сервер работает' });
});

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error('Ошибка:', err);
    res.status(err.status || 500).json({
      message: err.message || 'Внутренняя ошибка сервера',
      error: process.env.NODE_ENV === 'development' ? err : {},
    });
  }
);

// Initialize database and start server
AppDataSource.initialize()
  .then(() => {
    console.log('✅ База данных подключена');

    app.listen(PORT, () => {
      console.log(`🚀 Сервер запущен на порту ${PORT}`);
      console.log(`📍 API доступен по адресу: http://localhost:${PORT}/api`);
    });
  })
  .catch((error) => {
    console.error('❌ Ошибка подключения к базе данных:', error);
    process.exit(1);
  });

export default app;


