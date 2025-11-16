import { Router } from 'express';
import { PsychologistController } from '../controllers/psychologistController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../entities/User';

const router = Router();

// Все роуты требуют авторизации с ролью психолога или админа
router.use(authenticate, authorize(UserRole.PSYCHOLOGIST, UserRole.ADMIN));

router.get('/results/all', PsychologistController.getAllResults);
router.get('/statistics/test/:testId', PsychologistController.getTestStatistics);
router.get('/statistics/user/:userId', PsychologistController.getUserStatistics);
router.get('/results/:resultId/detailed', PsychologistController.getDetailedResult);
router.get('/statistics/overall', PsychologistController.getOverallStatistics);

export default router;


