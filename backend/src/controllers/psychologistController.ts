import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { TestResult, TestStatus } from '../entities/TestResult';
import { Test } from '../entities/Test';
import { User } from '../entities/User';
import { AuthRequest } from '../middleware/auth';

export class PsychologistController {
  // Получить все результаты всех пользователей
  static async getAllResults(req: AuthRequest, res: Response) {
    try {
      const testResultRepository = AppDataSource.getRepository(TestResult);

      const results = await testResultRepository.find({
        where: { status: TestStatus.COMPLETED, isSaved: true },
        relations: ['test', 'user'],
        order: { completedAt: 'DESC' },
      });

      const resultsData = results.map((r: any) => ({
        id: r.id,
        testName: r.test.name,
        testDisplayName: r.test.displayName,
        userName: r.user
          ? `${r.user.firstName} ${r.user.lastName} (${r.user.username})`
          : 'Гость',
        userId: r.userId,
        score: r.score,
        totalQuestions: r.totalQuestions,
        percentage: r.percentage,
        timeSpent: r.timeSpent,
        completedAt: r.completedAt,
      }));

      res.json({ results: resultsData });
    } catch (error) {
      console.error('Ошибка получения всех результатов:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  }

  // Получить статистику по тесту
  static async getTestStatistics(req: AuthRequest, res: Response) {
    try {
      const { testId } = req.params;

      const testRepository = AppDataSource.getRepository(Test);
      const testResultRepository = AppDataSource.getRepository(TestResult);

      const test = await testRepository.findOne({ where: { id: testId } });

      if (!test) {
        return res.status(404).json({ message: 'Тест не найден' });
      }

      const results = await testResultRepository.find({
        where: {
          testId,
          status: TestStatus.COMPLETED,
          isSaved: true,
        },
        relations: ['user'],
      });

      if (results.length === 0) {
        return res.json({
          test: {
            id: test.id,
            name: test.name,
            displayName: test.displayName,
          },
          statistics: {
            totalAttempts: 0,
            averageScore: 0,
            averagePercentage: 0,
            averageTime: 0,
            maxScore: 0,
            minScore: 0,
          },
          results: [],
        });
      }

      const totalAttempts = results.length;
      const averageScore =
        results.reduce((sum: any, r: any) => sum + r.score, 0) / totalAttempts;
      const averagePercentage =
        results.reduce((sum: any, r: any) => sum + r.percentage, 0) / totalAttempts;
      const averageTime =
        results.reduce((sum: any, r: any) => sum + (r.timeSpent || 0), 0) /
        totalAttempts;
      const maxScore = Math.max(...results.map((r: any) => r.score));
      const minScore = Math.min(...results.map((r: any) => r.score));

      res.json({
        test: {
          id: test.id,
          name: test.name,
          displayName: test.displayName,
          methodicalRecommendations: test.methodicalRecommendations,
        },
        statistics: {
          totalAttempts,
          averageScore: averageScore.toFixed(2),
          averagePercentage: averagePercentage.toFixed(2),
          averageTime: averageTime.toFixed(0),
          maxScore,
          minScore,
        },
        results: results.map((r: any) => ({
          id: r.id,
          userName: r.user
            ? `${r.user.firstName} ${r.user.lastName} (${r.user.username})`
            : 'Гость',
          score: r.score,
          percentage: r.percentage,
          timeSpent: r.timeSpent,
          completedAt: r.completedAt,
        })),
      });
    } catch (error) {
      console.error('Ошибка получения статистики теста:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  }

  // Получить статистику по пользователю
  static async getUserStatistics(req: AuthRequest, res: Response) {
    try {
      const { userId } = req.params;

      const userRepository = AppDataSource.getRepository(User);
      const testResultRepository = AppDataSource.getRepository(TestResult);

      const user = await userRepository.findOne({ where: { id: userId } });

      if (!user) {
        return res
          .status(404)
          .json({ message: 'Пользователь не найден' });
      }

      const results = await testResultRepository.find({
        where: {
          userId,
          status: TestStatus.COMPLETED,
          isSaved: true,
        },
        relations: ['test'],
        order: { completedAt: 'DESC' },
      });

      const totalTests = results.length;
      const averagePercentage =
        totalTests > 0
          ? results.reduce((sum: any, r: any) => sum + r.percentage, 0) / totalTests
          : 0;

      res.json({
        user: {
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
        statistics: {
          totalTests,
          averagePercentage: averagePercentage.toFixed(2),
        },
        results: results.map((r: any) => ({
          id: r.id,
          testName: r.test.name,
          testDisplayName: r.test.displayName,
          score: r.score,
          totalQuestions: r.totalQuestions,
          percentage: r.percentage,
          timeSpent: r.timeSpent,
          completedAt: r.completedAt,
        })),
      });
    } catch (error) {
      console.error('Ошибка получения статистики пользователя:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  }

  // Получить детальный результат с ответами
  static async getDetailedResult(req: AuthRequest, res: Response) {
    try {
      const { resultId } = req.params;

      const testResultRepository = AppDataSource.getRepository(TestResult);

      const result = await testResultRepository.findOne({
        where: { id: resultId },
        relations: ['test', 'user', 'answers', 'answers.question'],
      });

      if (!result) {
        return res.status(404).json({ message: 'Результат не найден' });
      }

      res.json({
        result: {
          id: result.id,
          testName: result.test.name,
          testDisplayName: result.test.displayName,
          methodicalRecommendations: result.test.methodicalRecommendations,
          userName: result.user
            ? `${result.user.firstName} ${result.user.lastName} (${result.user.username})`
            : 'Гость',
          score: result.score,
          totalQuestions: result.totalQuestions,
          percentage: result.percentage,
          timeSpent: result.timeSpent,
          completedAt: result.completedAt,
          answers: result.answers.map((a: any) => ({
            questionNumber: a.question.questionNumber,
            selectedAnswer: a.selectedAnswer,
            correctAnswer: a.question.correctAnswer,
            isCorrect: a.isCorrect,
          })),
        },
      });
    } catch (error) {
      console.error('Ошибка получения детального результата:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  }

  // Получить общую статистику по всем тестам
  static async getOverallStatistics(req: AuthRequest, res: Response) {
    try {
      const testRepository = AppDataSource.getRepository(Test);
      const testResultRepository = AppDataSource.getRepository(TestResult);
      const userRepository = AppDataSource.getRepository(User);

      const totalTests = await testRepository.count();
      const totalUsers = await userRepository.count();
      const totalResults = await testResultRepository.count({
        where: {
          status: TestStatus.COMPLETED,
          isSaved: true,
        },
      });

      const tests = await testRepository.find();
      const testStats = [];

      for (const test of tests) {
        const results = await testResultRepository.count({
          where: {
            testId: test.id,
            status: TestStatus.COMPLETED,
            isSaved: true,
          },
        });

        testStats.push({
          testName: test.name,
          testDisplayName: test.displayName,
          attemptsCount: results,
        });
      }

      res.json({
        totalTests,
        totalUsers,
        totalResults,
        testStatistics: testStats,
      });
    } catch (error) {
      console.error('Ошибка получения общей статистики:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  }
}

