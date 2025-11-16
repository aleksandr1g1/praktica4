import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { Test } from '../entities/Test';
import { Question } from '../entities/Question';
import { TestResult } from '../entities/TestResult';
import { Answer } from '../entities/Answer';
import { User } from '../entities/User';
import { AuthRequest } from '../middleware/auth';
import fs from 'fs';
import path from 'path';

export class AdminController {
  // Создать новый тест
  static async createTest(req: AuthRequest, res: Response) {
    try {
      const {
        name,
        displayName,
        description,
        methodicalRecommendations,
        timeLimit,
      } = req.body;

      const testRepository = AppDataSource.getRepository(Test);

      const test = testRepository.create({
        name,
        displayName,
        description,
        methodicalRecommendations,
        timeLimit: timeLimit || 60,
        totalQuestions: 0,
      });

      await testRepository.save(test);

      res.status(201).json({
        message: 'Тест успешно создан',
        test,
      });
    } catch (error) {
      console.error('Ошибка создания теста:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  }

  // Обновить тест
  static async updateTest(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const {
        name,
        displayName,
        description,
        methodicalRecommendations,
        timeLimit,
        isActive,
      } = req.body;

      const testRepository = AppDataSource.getRepository(Test);

      const test = await testRepository.findOne({ where: { id } });

      if (!test) {
        return res.status(404).json({ message: 'Тест не найден' });
      }

      test.name = name || test.name;
      test.displayName = displayName || test.displayName;
      test.description = description || test.description;
      test.methodicalRecommendations =
        methodicalRecommendations || test.methodicalRecommendations;
      test.timeLimit = timeLimit !== undefined ? timeLimit : test.timeLimit;
      test.isActive = isActive !== undefined ? isActive : test.isActive;

      await testRepository.save(test);

      res.json({
        message: 'Тест успешно обновлен',
        test,
      });
    } catch (error) {
      console.error('Ошибка обновления теста:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  }

  // Удалить тест
  static async deleteTest(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const testRepository = AppDataSource.getRepository(Test);
      const questionRepository = AppDataSource.getRepository(Question);

      const test = await testRepository.findOne({ where: { id } });

      if (!test) {
        return res.status(404).json({ message: 'Тест не найден' });
      }

      // Удаляем изображения вопросов
      const questions = await questionRepository.find({
        where: { testId: id },
      });

      for (const question of questions) {
        if (question.imagePath) {
          const imagePath = path.join(
            process.cwd(),
            process.env.UPLOAD_DIR || 'uploads',
            question.imagePath
          );
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        }
      }

      await testRepository.remove(test);

      res.json({ message: 'Тест успешно удален' });
    } catch (error) {
      console.error('Ошибка удаления теста:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  }

  // Добавить вопрос к тесту
  static async addQuestion(req: AuthRequest, res: Response) {
    try {
      const {
        testId,
        questionNumber,
        questionText,
        numberOfOptions,
        correctAnswer,
      } = req.body;

      const testRepository = AppDataSource.getRepository(Test);
      const questionRepository = AppDataSource.getRepository(Question);

      const test = await testRepository.findOne({ where: { id: testId } });

      if (!test) {
        return res.status(404).json({ message: 'Тест не найден' });
      }

      const imagePath = req.file ? req.file.filename : null;

      const question = questionRepository.create({
        testId,
        questionNumber,
        questionText,
        numberOfOptions,
        correctAnswer,
        imagePath,
      });

      await questionRepository.save(question);

      // Обновляем общее количество вопросов
      test.totalQuestions = await questionRepository.count({
        where: { testId },
      });
      await testRepository.save(test);

      res.status(201).json({
        message: 'Вопрос успешно добавлен',
        question,
      });
    } catch (error) {
      console.error('Ошибка добавления вопроса:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  }

  // Обновить вопрос
  static async updateQuestion(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { questionNumber, questionText, numberOfOptions, correctAnswer } =
        req.body;

      const questionRepository = AppDataSource.getRepository(Question);

      const question = await questionRepository.findOne({ where: { id } });

      if (!question) {
        return res.status(404).json({ message: 'Вопрос не найден' });
      }

      if (req.file) {
        // Удаляем старое изображение
        if (question.imagePath) {
          const oldImagePath = path.join(
            process.cwd(),
            process.env.UPLOAD_DIR || 'uploads',
            question.imagePath
          );
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        question.imagePath = req.file.filename;
      }

      question.questionNumber =
        questionNumber !== undefined ? questionNumber : question.questionNumber;
      question.questionText = questionText || question.questionText;
      question.numberOfOptions =
        numberOfOptions !== undefined
          ? numberOfOptions
          : question.numberOfOptions;
      question.correctAnswer =
        correctAnswer !== undefined ? correctAnswer : question.correctAnswer;

      await questionRepository.save(question);

      res.json({
        message: 'Вопрос успешно обновлен',
        question,
      });
    } catch (error) {
      console.error('Ошибка обновления вопроса:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  }

  // Удалить вопрос
  static async deleteQuestion(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const questionRepository = AppDataSource.getRepository(Question);
      const testRepository = AppDataSource.getRepository(Test);

      const question = await questionRepository.findOne({ where: { id } });

      if (!question) {
        return res.status(404).json({ message: 'Вопрос не найден' });
      }

      const testId = question.testId;

      // Удаляем изображение
      if (question.imagePath) {
        const imagePath = path.join(
          process.cwd(),
          process.env.UPLOAD_DIR || 'uploads',
          question.imagePath
        );
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      await questionRepository.remove(question);

      // Обновляем общее количество вопросов
      const test = await testRepository.findOne({ where: { id: testId } });
      if (test) {
        test.totalQuestions = await questionRepository.count({
          where: { testId },
        });
        await testRepository.save(test);
      }

      res.json({ message: 'Вопрос успешно удален' });
    } catch (error) {
      console.error('Ошибка удаления вопроса:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  }

  // Очистить результаты теста
  static async clearTestResults(req: AuthRequest, res: Response) {
    try {
      const { testId } = req.params;

      const testResultRepository = AppDataSource.getRepository(TestResult);
      const answerRepository = AppDataSource.getRepository(Answer);

      const results = await testResultRepository.find({
        where: { testId },
      });

      for (const result of results) {
        await answerRepository.delete({ testResultId: result.id });
      }

      await testResultRepository.delete({ testId });

      res.json({ message: 'Результаты теста успешно удалены' });
    } catch (error) {
      console.error('Ошибка очистки результатов:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  }

  // Удалить все результаты
  static async clearAllResults(req: AuthRequest, res: Response) {
    try {
      const testResultRepository = AppDataSource.getRepository(TestResult);
      const answerRepository = AppDataSource.getRepository(Answer);

      await answerRepository.clear();
      await testResultRepository.clear();

      res.json({ message: 'Все результаты успешно удалены' });
    } catch (error) {
      console.error('Ошибка очистки всех результатов:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  }

  // Удалить результат
  static async deleteResult(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const testResultRepository = AppDataSource.getRepository(TestResult);
      const answerRepository = AppDataSource.getRepository(Answer);

      const result = await testResultRepository.findOne({ where: { id } });

      if (!result) {
        return res.status(404).json({ message: 'Результат не найден' });
      }

      await answerRepository.delete({ testResultId: id });
      await testResultRepository.remove(result);

      res.json({ message: 'Результат успешно удален' });
    } catch (error) {
      console.error('Ошибка удаления результата:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  }

  // Получить всех пользователей
  static async getUsers(req: AuthRequest, res: Response) {
    try {
      const userRepository = AppDataSource.getRepository(User);

      const users = await userRepository.find({
        select: ['id', 'email', 'username', 'role', 'firstName', 'lastName', 'isActive', 'createdAt'],
        order: { createdAt: 'DESC' },
      });

      res.json({ users });
    } catch (error) {
      console.error('Ошибка получения пользователей:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  }

  // Управление пользователем (активация/деактивация)
  static async toggleUserStatus(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const userRepository = AppDataSource.getRepository(User);

      const user = await userRepository.findOne({ where: { id } });

      if (!user) {
        return res.status(404).json({ message: 'Пользователь не найден' });
      }

      user.isActive = !user.isActive;
      await userRepository.save(user);

      res.json({
        message: `Пользователь ${user.isActive ? 'активирован' : 'деактивирован'}`,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          isActive: user.isActive,
        },
      });
    } catch (error) {
      console.error('Ошибка изменения статуса пользователя:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  }
}


