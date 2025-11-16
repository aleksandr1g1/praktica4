import { useState, useEffect } from 'react';
import { adminApi } from '../api/adminApi';
import { testApi } from '../api/testApi';
import { Test } from '../types';
import toast from 'react-hot-toast';
import './Admin.css';

export const Admin = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'tests' | 'users' | 'create'>(
    'tests'
  );
  const [loading, setLoading] = useState(true);

  // Форма создания теста
  const [testForm, setTestForm] = useState({
    name: '',
    displayName: '',
    description: '',
    methodicalRecommendations: '',
    timeLimit: 60,
  });

  // Форма добавления вопроса
  const [questionForm, setQuestionForm] = useState({
    testId: '',
    questionNumber: 1,
    questionText: '',
    numberOfOptions: 6,
    correctAnswer: 1,
    image: null as File | null,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [testsData, usersData] = await Promise.all([
        testApi.getTests(),
        adminApi.getUsers(),
      ]);
      setTests(testsData.tests);
      setUsers(usersData.users);
    } catch (error) {
      toast.error('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.createTest(testForm);
      toast.success('Тест создан успешно!');
      setTestForm({
        name: '',
        displayName: '',
        description: '',
        methodicalRecommendations: '',
        timeLimit: 60,
      });
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Ошибка создания теста');
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('testId', questionForm.testId);
      formData.append('questionNumber', questionForm.questionNumber.toString());
      formData.append('questionText', questionForm.questionText);
      formData.append(
        'numberOfOptions',
        questionForm.numberOfOptions.toString()
      );
      formData.append('correctAnswer', questionForm.correctAnswer.toString());
      if (questionForm.image) {
        formData.append('image', questionForm.image);
      }

      await adminApi.addQuestion(formData);
      toast.success('Вопрос добавлен успешно!');
      setQuestionForm({
        testId: questionForm.testId,
        questionNumber: questionForm.questionNumber + 1,
        questionText: '',
        numberOfOptions: 6,
        correctAnswer: 1,
        image: null,
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Ошибка добавления вопроса');
    }
  };

  const handleDeleteTest = async (testId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот тест?')) return;

    try {
      await adminApi.deleteTest(testId);
      toast.success('Тест удален');
      fetchData();
    } catch (error) {
      toast.error('Ошибка удаления теста');
    }
  };

  const handleClearResults = async (testId: string) => {
    if (!confirm('Вы уверены, что хотите очистить результаты этого теста?'))
      return;

    try {
      await adminApi.clearTestResults(testId);
      toast.success('Результаты очищены');
    } catch (error) {
      toast.error('Ошибка очистки результатов');
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    try {
      await adminApi.toggleUserStatus(userId);
      toast.success('Статус пользователя изменен');
      fetchData();
    } catch (error) {
      toast.error('Ошибка изменения статуса');
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="container">
        <div className="page-header">
          <h1>Панель администратора</h1>
          <p>Управление тестами и пользователями</p>
        </div>

        <div className="admin-tabs">
          <button
            className={`tab ${activeTab === 'tests' ? 'active' : ''}`}
            onClick={() => setActiveTab('tests')}
          >
            Тесты
          </button>
          <button
            className={`tab ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            Создать тест
          </button>
          <button
            className={`tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Пользователи
          </button>
        </div>

        <div className="admin-content">
          {activeTab === 'tests' && (
            <div className="tests-management">
              <h2>Управление тестами</h2>
              {tests.length === 0 ? (
                <div className="empty-state">
                  <p>Нет созданных тестов</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Название</th>
                        <th>Отображаемое название</th>
                        <th>Вопросов</th>
                        <th>Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tests.map((test) => (
                        <tr key={test.id}>
                          <td>{test.name || test.displayName}</td>
                          <td>{test.displayName}</td>
                          <td>{test.totalQuestions}</td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="btn btn-sm btn-secondary"
                                onClick={() => handleClearResults(test.id)}
                              >
                                Очистить результаты
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDeleteTest(test.id)}
                              >
                                Удалить
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'create' && (
            <div className="create-section">
              <div className="form-section">
                <h2>Создать новый тест</h2>
                <form onSubmit={handleCreateTest} className="admin-form">
                  <div className="form-group">
                    <label className="form-label">
                      Название теста (для психолога и админа)
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={testForm.name}
                      onChange={(e) =>
                        setTestForm({ ...testForm, name: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Отображаемое название (для пользователей)
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={testForm.displayName}
                      onChange={(e) =>
                        setTestForm({
                          ...testForm,
                          displayName: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Описание</label>
                    <textarea
                      className="form-textarea"
                      value={testForm.description}
                      onChange={(e) =>
                        setTestForm({
                          ...testForm,
                          description: e.target.value,
                        })
                      }
                      required
                    ></textarea>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Методические рекомендации
                    </label>
                    <textarea
                      className="form-textarea"
                      value={testForm.methodicalRecommendations}
                      onChange={(e) =>
                        setTestForm({
                          ...testForm,
                          methodicalRecommendations: e.target.value,
                        })
                      }
                    ></textarea>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Ограничение времени (минуты)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={testForm.timeLimit}
                      onChange={(e) =>
                        setTestForm({
                          ...testForm,
                          timeLimit: parseInt(e.target.value),
                        })
                      }
                      min="0"
                    />
                  </div>

                  <button type="submit" className="btn btn-primary">
                    Создать тест
                  </button>
                </form>
              </div>

              {tests.length > 0 && (
                <div className="form-section">
                  <h2>Добавить вопрос к тесту</h2>
                  <form onSubmit={handleAddQuestion} className="admin-form">
                    <div className="form-group">
                      <label className="form-label">Выберите тест</label>
                      <select
                        className="form-select"
                        value={questionForm.testId}
                        onChange={(e) =>
                          setQuestionForm({
                            ...questionForm,
                            testId: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="">Выберите тест</option>
                        {tests.map((test) => (
                          <option key={test.id} value={test.id}>
                            {test.displayName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Номер вопроса</label>
                      <input
                        type="number"
                        className="form-input"
                        value={questionForm.questionNumber}
                        onChange={(e) =>
                          setQuestionForm({
                            ...questionForm,
                            questionNumber: parseInt(e.target.value),
                          })
                        }
                        min="1"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        Текст вопроса (опционально)
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        value={questionForm.questionText}
                        onChange={(e) =>
                          setQuestionForm({
                            ...questionForm,
                            questionText: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        Изображение вопроса
                      </label>
                      <input
                        type="file"
                        className="form-input"
                        accept="image/*"
                        onChange={(e) =>
                          setQuestionForm({
                            ...questionForm,
                            image: e.target.files?.[0] || null,
                          })
                        }
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">
                          Количество вариантов ответа
                        </label>
                        <input
                          type="number"
                          className="form-input"
                          value={questionForm.numberOfOptions}
                          onChange={(e) =>
                            setQuestionForm({
                              ...questionForm,
                              numberOfOptions: parseInt(e.target.value),
                            })
                          }
                          min="2"
                          max="8"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Правильный ответ</label>
                        <input
                          type="number"
                          className="form-input"
                          value={questionForm.correctAnswer}
                          onChange={(e) =>
                            setQuestionForm({
                              ...questionForm,
                              correctAnswer: parseInt(e.target.value),
                            })
                          }
                          min="1"
                          max={questionForm.numberOfOptions}
                          required
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary">
                      Добавить вопрос
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="users-management">
              <h2>Управление пользователями</h2>
              {users.length === 0 ? (
                <div className="empty-state">
                  <p>Нет пользователей</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Email</th>
                        <th>Username</th>
                        <th>Роль</th>
                        <th>Статус</th>
                        <th>Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td>{user.email}</td>
                          <td>{user.username}</td>
                          <td>
                            <span className="badge badge-info">
                              {user.role}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                user.isActive
                                  ? 'badge-success'
                                  : 'badge-error'
                              }`}
                            >
                              {user.isActive ? 'Активен' : 'Заблокирован'}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-secondary"
                              onClick={() => handleToggleUserStatus(user.id)}
                            >
                              {user.isActive ? 'Заблокировать' : 'Активировать'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


