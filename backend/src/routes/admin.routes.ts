import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../entities/User';
import { upload } from '../utils/fileUpload';

const router = Router();

// Все роуты требуют авторизации с ролью админа
router.use(authenticate, authorize(UserRole.ADMIN));

// Управление тестами
router.post('/tests', AdminController.createTest);
router.put('/tests/:id', AdminController.updateTest);
router.delete('/tests/:id', AdminController.deleteTest);

// Управление вопросами
router.post('/questions', upload.single('image'), AdminController.addQuestion);
router.put(
  '/questions/:id',
  upload.single('image'),
  AdminController.updateQuestion
);
router.delete('/questions/:id', AdminController.deleteQuestion);

// Управление результатами
router.delete('/results/test/:testId', AdminController.clearTestResults);
router.delete('/results/all', AdminController.clearAllResults);
router.delete('/results/:id', AdminController.deleteResult);

// Управление пользователями
router.get('/users', AdminController.getUsers);
router.put('/users/:id/toggle-status', AdminController.toggleUserStatus);

export default router;


