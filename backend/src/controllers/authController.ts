import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { AppDataSource } from '../config/database';
import { User, UserRole } from '../entities/User';
import { generateToken } from '../utils/jwt';
import { AuthRequest } from '../middleware/auth';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { email, username, password, firstName, lastName } = req.body;

      const userRepository = AppDataSource.getRepository(User);

      // Проверяем существование пользователя
      const existingUser = await userRepository.findOne({
        where: [{ email }, { username }],
      });

      if (existingUser) {
        return res.status(400).json({
          message: 'Пользователь с таким email или username уже существует',
        });
      }

      // Хешируем пароль
      const hashedPassword = await bcrypt.hash(password, 10);

      // Создаем нового пользователя (только с ролью USER)
      const user = userRepository.create({
        email,
        username,
        password: hashedPassword,
        firstName,
        lastName,
        role: UserRole.USER,
      });

      await userRepository.save(user);

      // Генерируем токен
      const token = generateToken(user.id);

      res.status(201).json({
        message: 'Пользователь успешно зарегистрирован',
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { login, password } = req.body;

      const userRepository = AppDataSource.getRepository(User);

      // Ищем пользователя по email или username
      const user = await userRepository.findOne({
        where: [{ email: login }, { username: login }],
      });

      if (!user) {
        return res
          .status(401)
          .json({ message: 'Неверный логин или пароль' });
      }

      // Проверяем пароль
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res
          .status(401)
          .json({ message: 'Неверный логин или пароль' });
      }

      if (!user.isActive) {
        return res
          .status(403)
          .json({ message: 'Аккаунт заблокирован' });
      }

      // Генерируем токен
      const token = generateToken(user.id);

      res.json({
        message: 'Успешный вход',
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    } catch (error) {
      console.error('Ошибка входа:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  }

  static async getProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Не авторизован' });
      }

      res.json({
        user: {
          id: req.user.id,
          email: req.user.email,
          username: req.user.username,
          role: req.user.role,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
        },
      });
    } catch (error) {
      console.error('Ошибка получения профиля:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  }

  static async updateProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Не авторизован' });
      }

      const { firstName, lastName } = req.body;
      const userRepository = AppDataSource.getRepository(User);

      req.user.firstName = firstName || req.user.firstName;
      req.user.lastName = lastName || req.user.lastName;

      await userRepository.save(req.user);

      res.json({
        message: 'Профиль обновлен',
        user: {
          id: req.user.id,
          email: req.user.email,
          username: req.user.username,
          role: req.user.role,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
        },
      });
    } catch (error) {
      console.error('Ошибка обновления профиля:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  }
}


