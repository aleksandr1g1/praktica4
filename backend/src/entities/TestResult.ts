import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User';
import { Test } from './Test';
import { Answer } from './Answer';

export enum TestStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
}

@Entity('test_results')
export class TestResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user: any) => user.testResults, { onDelete: 'CASCADE' })
  user: User;

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => Test, (test: any) => test.results, { onDelete: 'CASCADE' })
  test: Test;

  @Column()
  testId: string;

  @Column({
    type: 'enum',
    enum: TestStatus,
    default: TestStatus.IN_PROGRESS,
  })
  status: TestStatus;

  @Column({ default: 0 })
  score: number; // Количество правильных ответов

  @Column({ default: 0 })
  totalQuestions: number;

  @Column({ type: 'float', default: 0 })
  percentage: number; // Процент правильных ответов

  @Column({ default: false })
  isSaved: boolean; // Пользователь решил сохранить результат

  @Column({ type: 'int', nullable: true })
  timeSpent: number; // Время прохождения в секундах

  @OneToMany(() => Answer, (answer: any) => answer.testResult, { cascade: true })
  answers: Answer[];

  @Column({ type: 'jsonb', nullable: true })
  interpretation: object; // Интерпретация результатов

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;
}

