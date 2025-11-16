import { useLocation, useNavigate } from 'react-router-dom';
import './TestResult.css';

export const TestResult = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { result, shouldSave } = location.state || {};

  if (!result) {
    navigate('/tests');
    return null;
  }

  const getResultColor = (percentage: number) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'error';
  };

  const getResultMessage = (percentage: number) => {
    if (percentage >= 80) return 'Отличный результат!';
    if (percentage >= 60) return 'Хороший результат';
    if (percentage >= 40) return 'Удовлетворительный результат';
    return 'Попробуйте еще раз';
  };

  const percentage = parseFloat(result.percentage);
  const resultColor = getResultColor(percentage);

  return (
    <div className="test-result-page">
      <div className="container">
        <div className="result-card">
          <div className={`result-icon result-${resultColor}`}>
            {resultColor === 'success' ? '🎉' : resultColor === 'warning' ? '👍' : '📊'}
          </div>

          <h1 className="result-title">Тест завершен!</h1>
          <p className="result-message">{getResultMessage(percentage)}</p>

          <div className="result-stats">
            <div className="stat-item">
              <div className="stat-value">{result.score}</div>
              <div className="stat-label">Правильных ответов</div>
            </div>

            <div className="stat-item">
              <div className="stat-value">{result.totalQuestions}</div>
              <div className="stat-label">Всего вопросов</div>
            </div>

            <div className="stat-item">
              <div className={`stat-value stat-${resultColor}`}>
                {percentage.toFixed(1)}%
              </div>
              <div className="stat-label">Процент правильных</div>
            </div>

            {result.timeSpent && (
              <div className="stat-item">
                <div className="stat-value">
                  {Math.floor(result.timeSpent / 60)}:
                  {(result.timeSpent % 60).toString().padStart(2, '0')}
                </div>
                <div className="stat-label">Время прохождения</div>
              </div>
            )}
          </div>

          {shouldSave ? (
            <div className="result-info success">
              <p>✓ Результат сохранен в вашем профиле</p>
            </div>
          ) : (
            <div className="result-info">
              <p>ℹ️ Результат не был сохранен</p>
            </div>
          )}

          <div className="result-actions">
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/tests')}
            >
              Все тесты
            </button>
            {shouldSave && (
              <button
                className="btn btn-primary"
                onClick={() => navigate('/results')}
              >
                Мои результаты
              </button>
            )}
            <button
              className="btn btn-primary"
              onClick={() => navigate('/')}
            >
              На главную
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


