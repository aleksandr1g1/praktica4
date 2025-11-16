import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { User } from '../entities/User';
import { Test } from '../entities/Test';
import { Question } from '../entities/Question';
import { TestResult } from '../entities/TestResult';
import { Answer } from '../entities/Answer';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'psychological_tests',
  synchronize: true, // В продакшене использовать миграции!
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Test, Question, TestResult, Answer],
  subscribers: [],
  migrations: [],
});


