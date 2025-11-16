import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { Test } from '../entities/Test';
import { Question } from '../entities/Question';
import { TestResult, TestStatus } from '../entities/TestResult';
import { Answer } from '../entities/Answer';
import { AuthRequest } from '../middleware/auth';
import { UserRole } from '../entities/User';

export class TestController {
  // Получить список тестов (для пользователей без названий)
  static async getTests(req: AuthRequest, res: Response) {
    try {
      const testRepository = AppDataSource.getRepository(Test);
      const tests = await testRepository.find({
        where: { isActive: true },
        order: { createdAt: 'DESC' },
      });

      // Для обычных пользователей скрываем реальное название
      const testsData = tests.map((test: any) => {
        if (
          req.user?.role === UserRole.USER ||
          !req.user
        ) {
          return {
            id: test.id,
            displayName: test.displayName,
            description: test.description,
            totalQuestions: test.totalQuestions,
            timeLimit: test.timeLimit,
          };
        }
        return test;
      });

      res.json({ tests: testsData });
    } catch (error) {
      console.error('Ошибка получения тестов:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  }

  // Получить один тест с вопросами
  static async getTest(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const testRepository = AppDataSource.getRepository(Test);
      const questionRepository = AppDataSource.getRepository(Question);

      const test = await testRepository.findOne({
        where: { id, isActive: true },
      });

      if (!test) {
        return res.status(404).json({ message: 'Тест не найден' });
      }

      const questions = await questionRepository.find({
        where: { testId: id },
        order: { questionNumber: 'ASC' },
      });

      // Для обычных пользователей скрываем правильные ответы и реальное название
      let testData: any = { ...test };
      if (req.user?.role === UserRole.USER || !req.user) {
        testData = {
          id: test.id,
          displayName: test.displayName,
          description: test.description,
          totalQuestions: test.totalQuestions,
          timeLimit: test.timeLimit,
        };
      }

      const questionsData = questions.map((q: any) => {
        if (req.user?.role === UserRole.USER || !req.user) {
          return {
            id: q.id,
            questionNumber: q.questionNumber,
            imagePath: q.imagePath,
            questionText: q.questionText,
            numberOfOptions: q.numberOfOptions,
          };
        }
        return q;
      });

      res.json({
        test: testData,
        questions: questionsData,
      });
    } catch (error) {
      console.error('Ошибка получения теста:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  }

  // Начать прохождение теста
  static async startTest(req: AuthRequest, res: Response) {
    try {
      const { testId } = req.body;
      const userId = req.user?.id;

      const testRepository = AppDataSource.getRepository(Test);
      const testResultRepository = AppDataSource.getRepository(TestResult);

      const test = await testRepository.findOne({
        where: { id: testId, isActive: true },
      });

      if (!test) {
        return res.status(404).json({ message: 'Тест не найден' });
      }

      // Создаем новый результат теста
      const testResult = testResultRepository.create({
        userId: userId || undefined,
        testId: testId,
        status: TestStatus.IN_PROGRESS,
        totalQuestions: test.totalQuestions,
      });

      await testResultRepository.save(testResult);

      res.json({
        message: 'Тестирование началось',
        testResultId: testResult.id,
      });
    } catch (error) {
      console.error('Ошибка начала теста:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  }

  // Сохранить ответ на вопрос
  static async submitAnswer(req: AuthRequest, res: Response) {
    try {
      const { testResultId, questionId, selectedAnswer } = req.body;

      const testResultRepository = AppDataSource.getRepository(TestResult);
      const questionRepository = AppDataSource.getRepository(Question);
      const answerRepository = AppDataSource.getRepository(Answer);

      const testResult = await testResultRepository.findOne({
        where: { id: testResultId },
      });

      if (!testResult) {
        return res
          .status(404)
          .json({ message: 'Результат теста не найден' });
      }

      // Проверяем, не авторизованный пользователь или владелец результата
      if (req.user && testResult.userId && testResult.userId !== req.user.id) {
        return res.status(403).json({ message: 'Недостаточно прав' });
      }

      const question = await questionRepository.findOne({
        where: { id: questionId },
      });

      if (!question) {
        return res.status(404).json({ message: 'Вопрос не найден' });
      }

      // Проверяем, есть ли уже ответ на этот вопрос
      const existingAnswer = await answerRepository.findOne({
        where: {
          testResultId: testResultId,
          questionId: questionId,
        },
      });

      if (existingAnswer) {
        // Обновляем существующий ответ
        existingAnswer.selectedAnswer = selectedAnswer;
        existingAnswer.isCorrect = selectedAnswer === question.correctAnswer;
        await answerRepository.save(existingAnswer);
      } else {
        // Создаем новый ответ
        const answer = answerRepository.create({
          testResultId: testResultId,
          questionId: questionId,
          selectedAnswer: selectedAnswer,
          isCorrect: selectedAnswer === question.correctAnswer,
        });
        await answerRepository.save(answer);
      }

      res.json({ message: 'Ответ сохранен' });
    } catch (error) {
      console.error('Ошибка сохранения ответа:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  }

  // Завершить тест
  static async completeTest(req: AuthRequest, res: Response) {
    try {
      const { testResultId, timeSpent, shouldSave } = req.body;

      const testResultRepository = AppDataSource.getRepository(TestResult);
      const answerRepository = AppDataSource.getRepository(Answer);

      const testResult = await testResultRepository.findOne({
        where: { id: testResultId },
        relations: ['test'],
      });

      if (!testResult) {
        return res
          .status(404)
          .json({ message: 'Результат теста не найден' });
      }

      // Проверяем права доступа
      if (req.user && testResult.userId && testResult.userId !== req.user.id) {
        return res.status(403).json({ message: 'Недостаточно прав' });
      }

      // Подсчитываем результаты
      const answers = await answerRepository.find({
        where: { testResultId: testResultId },
      });

      const correctAnswers = answers.filter((a: any) => a.isCorrect).length;
      const percentage =
        testResult.totalQuestions > 0
          ? (correctAnswers / testResult.totalQuestions) * 100
          : 0;

      testResult.status = TestStatus.COMPLETED;
      testResult.score = correctAnswers;
      testResult.percentage = percentage;
      testResult.timeSpent = timeSpent;
      testResult.completedAt = new Date();
      testResult.isSaved = shouldSave;

      await testResultRepository.save(testResult);

      res.json({
        message: 'Тест завершен',
        result: {
          score: correctAnswers,
          totalQuestions: testResult.totalQuestions,
          percentage: percentage.toFixed(2),
          timeSpent: timeSpent,
        },
      });
    } catch (error) {
      console.error('Ошибка завершения теста:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  }

  // Получить результаты пользователя
  static async getUserResults(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Не авторизован' });
      }

      const testResultRepository = AppDataSource.getRepository(TestResult);

      const results = await testResultRepository.find({
        where: {
          userId: req.user.id,
          status: TestStatus.COMPLETED,
          isSaved: true,
        },
        relations: ['test'],
        order: { completedAt: 'DESC' },
      });

      const resultsData = results.map((r: any) => ({
        id: r.id,
        testDisplayName: r.test.displayName,
        score: r.score,
        totalQuestions: r.totalQuestions,
        percentage: r.percentage,
        timeSpent: r.timeSpent,
        completedAt: r.completedAt,
      }));

      res.json({ results: resultsData });
    } catch (error) {
      console.error('Ошибка получения результатов:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  }

  // Получить детальную информацию о результате
  static async getResultDetail(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const testResultRepository = AppDataSource.getRepository(TestResult);

      const result = await testResultRepository.findOne({
        where: { id },
        relations: ['test', 'user', 'answers', 'answers.question'],
      });

      if (!result) {
        return res
          .status(404)
          .json({ message: 'Результат не найден' });
      }

      // Проверяем права доступа
      if (req.user?.role === UserRole.USER) {
        if (result.userId !== req.user.id) {
          return res.status(403).json({ message: 'Недостаточно прав' });
        }
      }

      res.json({ result });
    } catch (error) {
      console.error('Ошибка получения детального результата:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  }
}

