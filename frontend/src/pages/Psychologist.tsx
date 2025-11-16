import { useState, useEffect } from 'react';
import { psychologistApi } from '../api/psychologistApi';
import { testApi } from '../api/testApi';
import { TestResult, Test } from '../types';
import toast from 'react-hot-toast';
import './Psychologist.css';

export const Psychologist = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [selectedTest, setSelectedTest] = useState<string>('');
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'all' | 'test'>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resultsData, testsData, statsData] = await Promise.all([
        psychologistApi.getAllResults(),
        testApi.getTests(),
        psychologistApi.getOverallStatistics(),
      ]);

      setResults(resultsData.results);
      setTests(testsData.tests);
      setStatistics(statsData);
    } catch (error) {
      toast.error('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const handleTestSelect = async (testId: string) => {
    if (!testId) {
      setView('all');
      return;
    }

    try {
      const data = await psychologistApi.getTestStatistics(testId);
      setSelectedTest(testId);
      setStatistics(data);
      setView('test');
    } catch (error) {
      toast.error('Ошибка загрузки статистики теста');
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Загрузка данных...</p>
      </div>
    );
  }

  return (
    <div className="psychologist-page">
      <div className="container">
        <div className="page-header">
          <h1>Статистика и результаты</h1>
          <p>Просмотр всех результатов тестирования</p>
        </div>

        <div className="statistics-overview">
          <div className="stat-card">
            <div className="stat-icon">📝</div>
            <div className="stat-content">
              <div className="stat-value">{statistics?.totalTests || 0}</div>
              <div className="stat-label">Всего тестов</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <div className="stat-value">{statistics?.totalUsers || 0}</div>
              <div className="stat-label">Пользователей</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-value">{statistics?.totalResults || 0}</div>
              <div className="stat-label">Результатов</div>
            </div>
          </div>
        </div>

        <div className="filter-section">
          <label className="form-label">Фильтр по тесту:</label>
          <select
            className="form-select"
            value={selectedTest}
            onChange={(e) => handleTestSelect(e.target.value)}
          >
            <option value="">Все тесты</option>
            {tests.map((test) => (
              <option key={test.id} value={test.id}>
                {test.displayName}
              </option>
            ))}
          </select>
        </div>

        {view === 'test' && statistics && (
          <div className="test-statistics">
            <h2>Статистика по тесту: {statistics.test?.displayName}</h2>
            <div className="test-stats-grid">
              <div className="test-stat">
                <span className="label">Всего попыток:</span>
                <span className="value">
                  {statistics.statistics?.totalAttempts}
                </span>
              </div>
              <div className="test-stat">
                <span className="label">Средний балл:</span>
                <span className="value">
                  {statistics.statistics?.averageScore}
                </span>
              </div>
              <div className="test-stat">
                <span className="label">Средний процент:</span>
                <span className="value">
                  {statistics.statistics?.averagePercentage}%
                </span>
              </div>
              <div className="test-stat">
                <span className="label">Среднее время:</span>
                <span className="value">
                  {formatTime(parseInt(statistics.statistics?.averageTime || '0'))}
                </span>
              </div>
            </div>

            {statistics.test?.methodicalRecommendations && (
              <div className="methodical-recommendations">
                <h3>Методические рекомендации:</h3>
                <p>{statistics.test.methodicalRecommendations}</p>
              </div>
            )}
          </div>
        )}

        <div className="results-section">
          <h2>Результаты тестирования</h2>
          {results.length === 0 ? (
            <div className="empty-state">
              <p>Нет результатов</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Пользователь</th>
                    <th>Тест</th>
                    <th>Балл</th>
                    <th>Процент</th>
                    <th>Время</th>
                    <th>Дата</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result) => (
                    <tr key={result.id}>
                      <td>{result.userName}</td>
                      <td>{result.testDisplayName}</td>
                      <td>
                        {result.score} / {result.totalQuestions}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            result.percentage >= 80
                              ? 'badge-success'
                              : result.percentage >= 60
                              ? 'badge-warning'
                              : 'badge-error'
                          }`}
                        >
                          {result.percentage.toFixed(1)}%
                        </span>
                      </td>
                      <td>
                        {result.timeSpent
                          ? formatTime(result.timeSpent)
                          : '-'}
                      </td>
                      <td>{formatDate(result.completedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


