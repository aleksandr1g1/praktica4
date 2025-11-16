import api from './axios';

export const adminApi = {
  // Тесты
  createTest: async (data: any) => {
    const response = await api.post('/admin/tests', data);
    return response.data;
  },

  updateTest: async (id: string, data: any) => {
    const response = await api.put(`/admin/tests/${id}`, data);
    return response.data;
  },

  deleteTest: async (id: string) => {
    const response = await api.delete(`/admin/tests/${id}`);
    return response.data;
  },

  // Вопросы
  addQuestion: async (formData: FormData) => {
    const response = await api.post('/admin/questions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateQuestion: async (id: string, formData: FormData) => {
    const response = await api.put(`/admin/questions/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteQuestion: async (id: string) => {
    const response = await api.delete(`/admin/questions/${id}`);
    return response.data;
  },

  // Результаты
  clearTestResults: async (testId: string) => {
    const response = await api.delete(`/admin/results/test/${testId}`);
    return response.data;
  },

  clearAllResults: async () => {
    const response = await api.delete('/admin/results/all');
    return response.data;
  },

  deleteResult: async (id: string) => {
    const response = await api.delete(`/admin/results/${id}`);
    return response.data;
  },

  // Пользователи
  getUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  toggleUserStatus: async (id: string) => {
    const response = await api.put(`/admin/users/${id}/toggle-status`);
    return response.data;
  },
};


