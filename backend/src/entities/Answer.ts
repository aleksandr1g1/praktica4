import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { TestResult } from './TestResult';
import { Question } from './Question';

@Entity('answers')
export class Answer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => TestResult, (result: any) => result.answers, {
    onDelete: 'CASCADE',
  })
  testResult: TestResult;

  @Column()
  testResultId: string;

  @ManyToOne(() => Question, (question: any) => question.answers, {
    onDelete: 'CASCADE',
  })
  question: Question;

  @Column()
  questionId: string;

  @Column()
  selectedAnswer: number; // Выбранный ответ пользователя

  @Column({ default: false })
  isCorrect: boolean; // Правильный ли ответ

  @CreateDateColumn()
  createdAt: Date;
}

