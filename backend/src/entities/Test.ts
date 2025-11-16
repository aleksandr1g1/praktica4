import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Question } from './Question';
import { TestResult } from './TestResult';

@Entity('tests')
export class Test {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // Название теста (видно только психологу и админу)

  @Column()
  displayName: string; // Отображаемое название для пользователей (например, "Тест 1")

  @Column('text')
  description: string;

  @Column('text', { nullable: true })
  methodicalRecommendations: string; // Методические рекомендации

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  totalQuestions: number; // Общее количество вопросов

  @Column({ default: 60 })
  timeLimit: number; // Ограничение по времени в минутах (0 = без ограничения)

  @OneToMany(() => Question, (question: any) => question.test, { cascade: true })
  questions: Question[];

  @OneToMany(() => TestResult, (result: any) => result.test)
  results: TestResult[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

