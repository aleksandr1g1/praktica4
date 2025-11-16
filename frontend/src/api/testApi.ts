import api from './axios';
import { Test, Question, TestResult } from '../types';

export const testApi = {
  getTests: async (): Promise<{ tests: Test[] }> => {
    const response = await api.get('/tests');
    return response.data;
  },

  getTest: async (
    id: string
  ): Promise<{ test: Test; questions: Question[] }> => {
    const response = await api.get(`/tests/${id}`);
    return response.data;
  },

  startTest: async (testId: string): Promise<{ testResultId: string }> => {
    const response = await api.post('/tests/start', { testId });
    return response.data;
  },

  submitAnswer: async (data: {
    testResultId: string;
    questionId: string;
    selectedAnswer: number;
  }): Promise<void> => {
    await api.post('/tests/answer', data);
  },

  completeTest: async (data: {
    testResultId: string;
    timeSpent: number;
    shouldSave: boolean;
  }): Promise<{
    result: {
      score: number;
      totalQuestions: number;
      percentage: string;
      timeSpent: number;
    };
  }> => {
    const response = await api.post('/tests/complete', data);
    return response.data;
  },

  getUserResults: async (): Promise<{ results: TestResult[] }> => {
    const response = await api.get('/results');
    return response.data;
  },

  getResultDetail: async (id: string): Promise<{ result: any }> => {
    const response = await api.get(`/results/${id}`);
    return response.data;
  },
};


