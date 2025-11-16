import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { testApi } from '../api/testApi';
import { Test } from '../types';
import toast from 'react-hot-toast';
import './TestList.css';

export const TestList = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const data = await testApi.getTests();
      setTests(data.tests);
    } catch (error) {
      toast.error('Ошибка загрузки тестов');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Загрузка тестов...</p>
      </div>
    );
  }

  return (
    <div className="test-list-page">
      <div className="container">
        <div className="page-header">
          <h1>Доступные тесты</h1>
          <p>Выберите тест для прохождения</p>
        </div>

        {tests.length === 0 ? (
          <div className="empty-state">
            <p>Пока нет доступных тестов</p>
          </div>
        ) : (
          <div className="tests-grid">
            {tests.map((test) => (
              <div key={test.id} className="test-card">
                <div className="test-card-header">
                  <h3>{test.displayName}</h3>
                  <div className="test-badges">
                    <span className="badge badge-info">
                      {test.totalQuestions} вопросов
                    </span>
                    {test.timeLimit > 0 && (
                      <span className="badge badge-warning">
                        {test.timeLimit} мин
                      </span>
                    )}
                  </div>
                </div>

                <p className="test-description">{test.description}</p>

                <div className="test-card-footer">
                  <Link
                    to={`/tests/${test.id}`}
                    className="btn btn-primary btn-block"
                  >
                    Начать тест
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


