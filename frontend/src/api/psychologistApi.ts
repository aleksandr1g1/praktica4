import api from './axios';
import { TestResult, Statistics } from '../types';

export const psychologistApi = {
  getAllResults: async (): Promise<{ results: TestResult[] }> => {
    const response = await api.get('/psychologist/results/all');
    return response.data;
  },

  getTestStatistics: async (
    testId: string
  ): Promise<{ test: any; statistics: Statistics; results: TestResult[] }> => {
    const response = await api.get(`/psychologist/statistics/test/${testId}`);
    return response.data;
  },

  getUserStatistics: async (userId: string) => {
    const response = await api.get(`/psychologist/statistics/user/${userId}`);
    return response.data;
  },

  getDetailedResult: async (resultId: string) => {
    const response = await api.get(
      `/psychologist/results/${resultId}/detailed`
    );
    return response.data;
  },

  getOverallStatistics: async () => {
    const response = await api.get('/psychologist/statistics/overall');
    return response.data;
  },
};


