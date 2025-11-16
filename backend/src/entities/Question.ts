import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Test } from './Test';
import { Answer } from './Answer';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Test, (test: any) => test.questions, { onDelete: 'CASCADE' })
  test: Test;

  @Column()
  testId: string;

  @Column()
  questionNumber: number; // Порядковый номер вопроса

  @Column({ nullable: true })
  imagePath: string; // Путь к картинке вопроса

  @Column('text', { nullable: true })
  questionText: string; // Текст вопроса (опционально)

  @Column()
  numberOfOptions: number; // Количество вариантов ответа (6-8)

  @Column()
  correctAnswer: number; // Правильный ответ (число от 1 до numberOfOptions)

  @OneToMany(() => Answer, (answer: any) => answer.question)
  answers: Answer[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

