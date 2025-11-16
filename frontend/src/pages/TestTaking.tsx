import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { testApi } from '../api/testApi';
import { Test, Question } from '../types';
import toast from 'react-hot-toast';
import './TestTaking.css';

export const TestTaking = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [testResultId, setTestResultId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [startTime] = useState(Date.now());
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (id) {
      loadTest();
    }
  }, [id]);

  const loadTest = async () => {
    try {
      const data = await testApi.getTest(id!);
      setTest(data.test);
      setQuestions(data.questions);

      // Начинаем тест
      const startData = await testApi.startTest(id!);
      setTestResultId(startData.testResultId);
    } catch (error) {
      toast.error('Ошибка загрузки теста');
      navigate('/tests');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = async (answer: number) => {
    const currentQuestion = questions[currentQuestionIndex];

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: answer,
    }));

    // Сохраняем ответ на сервер
    try {
      await testApi.submitAnswer({
        testResultId,
        questionId: currentQuestion.id,
        selectedAnswer: answer,
      });
    } catch (error) {
      toast.error('Ошибка сохранения ответа');
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowSaveDialog(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleComplete = async (shouldSave: boolean) => {
    setCompleting(true);
    try {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);

      const result = await testApi.completeTest({
        testResultId,
        timeSpent,
        shouldSave,
      });

      toast.success('Тест завершен!');
      navigate('/test-result', {
        state: {
          result: result.result,
          shouldSave,
        },
      });
    } catch (error) {
      toast.error('Ошибка завершения теста');
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Загрузка теста...</p>
      </div>
    );
  }

  if (!test || questions.length === 0) {
    return (
      <div className="container">
        <div className="empty-state">Тест не найден</div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="test-taking-page">
      <div className="container">
        <div className="test-header">
          <h1>{test.displayName}</h1>
          <div className="test-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="progress-text">
              Вопрос {currentQuestionIndex + 1} из {questions.length}
            </p>
          </div>
        </div>

        <div className="question-card">
          <div className="question-header">
            <span className="question-number">
              Вопрос {currentQuestion.questionNumber}
            </span>
          </div>

          {currentQuestion.imagePath && (
            <div className="question-image">
              <img
                src={`/uploads/${currentQuestion.imagePath}`}
                alt={`Вопрос ${currentQuestion.questionNumber}`}
                onLoad={() => {
                  console.log('✅ Изображение загружено:', currentQuestion.imagePath);
                }}
                onError={(e) => {
                  console.error('❌ Ошибка загрузки изображения:', currentQuestion.imagePath);
                  console.error('URL:', `/uploads/${currentQuestion.imagePath}`);
                  // Не скрываем изображение, чтобы показать что-то пользователю
                  e.currentTarget.style.border = '2px solid red';
                  e.currentTarget.alt = `Ошибка загрузки: ${currentQuestion.imagePath}`;
                }}
                style={{ 
                  maxWidth: '100%',
                  height: 'auto',
                  display: 'block',
                  margin: '0 auto'
                }}
              />
            </div>
          )}

          {currentQuestion.questionText && (
            <p className="question-text">{currentQuestion.questionText}</p>
          )}

          <div className="answer-options">
            {Array.from(
              { length: currentQuestion.numberOfOptions },
              (_, i) => i + 1
            ).map((option) => (
              <button
                key={option}
                className={`answer-option ${
                  answers[currentQuestion.id] === option ? 'selected' : ''
                }`}
                onClick={() => handleAnswerSelect(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="test-navigation">
          <button
            className="btn btn-secondary"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            ← Назад
          </button>

          <button
            className="btn btn-primary"
            onClick={handleNext}
            disabled={!answers[currentQuestion.id]}
          >
            {currentQuestionIndex === questions.length - 1
              ? 'Завершить'
              : 'Далее →'}
          </button>
        </div>
      </div>

      {showSaveDialog && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Завершение теста</h2>
            <p>Вы ответили на все вопросы. Хотите сохранить результаты?</p>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => handleComplete(false)}
                disabled={completing}
              >
                Не сохранять
              </button>
              <button
                className="btn btn-primary"
                onClick={() => handleComplete(true)}
                disabled={completing}
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


