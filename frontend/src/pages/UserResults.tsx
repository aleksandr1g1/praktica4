import { useState, useEffect } from 'react';
import { testApi } from '../api/testApi';
import { TestResult } from '../types';
import toast from 'react-hot-toast';
import './UserResults.css';

export const UserResults = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const data = await testApi.getUserResults();
      setResults(data.results);
    } catch (error) {
      toast.error('Ошибка загрузки результатов');
    } finally {
      setLoading(false);
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

  const getResultBadge = (percentage: number) => {
    if (percentage >= 80) return 'badge-success';
    if (percentage >= 60) return 'badge-warning';
    return 'badge-error';
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Загрузка результатов...</p>
      </div>
    );
  }

  return (
    <div className="user-results-page">
      <div className="container">
        <div className="page-header">
          <h1>Мои результаты</h1>
          <p>История пройденных тестов</p>
        </div>

        {results.length === 0 ? (
          <div className="empty-state">
            <p>У вас пока нет сохраненных результатов</p>
          </div>
        ) : (
          <div className="results-list">
            {results.map((result) => (
              <div key={result.id} className="result-item">
                <div className="result-header">
                  <h3>{result.testDisplayName}</h3>
                  <span
                    className={`badge ${getResultBadge(result.percentage)}`}
                  >
                    {result.percentage.toFixed(1)}%
                  </span>
                </div>

                <div className="result-stats">
                  <div className="stat">
                    <span className="stat-label">Правильных ответов:</span>
                    <span className="stat-value">
                      {result.score} / {result.totalQuestions}
                    </span>
                  </div>

                  {result.timeSpent && (
                    <div className="stat">
                      <span className="stat-label">Время:</span>
                      <span className="stat-value">
                        {formatTime(result.timeSpent)}
                      </span>
                    </div>
                  )}

                  <div className="stat">
                    <span className="stat-label">Дата:</span>
                    <span className="stat-value">
                      {formatDate(result.completedAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


