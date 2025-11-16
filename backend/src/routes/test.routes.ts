import { Router } from 'express';
import { TestController } from '../controllers/testController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Публичные роуты (доступны без авторизации для гостей)
router.get('/tests', TestController.getTests);
router.get('/tests/:id', TestController.getTest);
router.post('/tests/start', TestController.startTest);
router.post('/tests/answer', TestController.submitAnswer);
router.post('/tests/complete', TestController.completeTest);

// Защищенные роуты (требуют авторизации)
router.get('/results', authenticate, TestController.getUserResults);
router.get('/results/:id', authenticate, TestController.getResultDetail);

export default router;


