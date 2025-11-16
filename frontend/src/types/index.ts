export interface User {
  id: string;
  email: string;
  username: string;
  role: 'user' | 'psychologist' | 'admin';
  firstName?: string;
  lastName?: string;
}

export interface Test {
  id: string;
  name?: string;
  displayName: string;
  description: string;
  totalQuestions: number;
  timeLimit: number;
  isActive?: boolean;
  methodicalRecommendations?: string;
}

export interface Question {
  id: string;
  questionNumber: number;
  imagePath?: string;
  questionText?: string;
  numberOfOptions: number;
  correctAnswer?: number;
}

export interface TestResult {
  id: string;
  testDisplayName?: string;
  testName?: string;
  userName?: string;
  userId?: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpent?: number;
  completedAt: Date;
}

export interface Answer {
  questionNumber: number;
  selectedAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
}

export interface TestSession {
  testResultId: string;
  testId: string;
  currentQuestionIndex: number;
  answers: Map<string, number>;
  startTime: number;
}

export interface Statistics {
  totalAttempts: number;
  averageScore: number;
  averagePercentage: number;
  averageTime: number;
  maxScore: number;
  minScore: number;
}


