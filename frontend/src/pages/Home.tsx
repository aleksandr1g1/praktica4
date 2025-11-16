import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import './Home.css';

export const Home = () => {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="container">
          <h1 className="hero-title">
            Система психологического тестирования
          </h1>
          <p className="hero-subtitle">
            Профессиональная платформа для проведения психологических тестов
            и оценки результатов
          </p>
          <div className="hero-buttons">
            <Link to="/tests" className="btn btn-primary btn-lg">
              Начать тестирование
            </Link>
            {!isAuthenticated && (
              <Link to="/register" className="btn btn-secondary btn-lg">
                Регистрация
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="features-section">
        <div className="container">
          <h2 className="section-title">О системе</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📝</div>
              <h3>Профессиональные тесты</h3>
              <p>
                Система включает проверенные психологические тесты, включая
                Тест Равена для оценки интеллектуальных способностей
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Детальная статистика</h3>
              <p>
                Психологи получают доступ к подробной статистике по всем
                пользователям и результатам тестирования
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Конфиденциальность</h3>
              <p>
                Пользователи могут решать, сохранять ли результаты тестирования.
                Все данные защищены
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">⚙️</div>
              <h3>Удобное управление</h3>
              <p>
                Администраторы могут добавлять новые тесты, редактировать
                вопросы и управлять результатами
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="roles-section">
        <div className="container">
          <h2 className="section-title">Роли пользователей</h2>
          <div className="roles-grid">
            <div className="role-card">
              <h3>👤 Пользователь</h3>
              <ul>
                <li>Прохождение психологических тестов</li>
                <li>Выбор сохранения результатов</li>
                <li>Просмотр своих результатов</li>
                <li>Счётчик вопросов при прохождении</li>
              </ul>
            </div>

            <div className="role-card">
              <h3>👨‍⚕️ Психолог</h3>
              <ul>
                <li>Просмотр всех результатов пользователей</li>
                <li>Детальная статистика по тестам</li>
                <li>Методические рекомендации</li>
                <li>Анализ результатов тестирования</li>
              </ul>
            </div>

            <div className="role-card">
              <h3>⚙️ Администратор</h3>
              <ul>
                <li>Создание и редактирование тестов</li>
                <li>Добавление вопросов с изображениями</li>
                <li>Управление пользователями</li>
                <li>Очистка данных из базы</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {isAuthenticated && (
        <div className="quick-actions">
          <div className="container">
            <h2 className="section-title">Быстрые действия</h2>
            <div className="actions-grid">
              {user?.role === 'user' && (
                <>
                  <Link to="/tests" className="action-card">
                    <div className="action-icon">📝</div>
                    <h3>Пройти тест</h3>
                    <p>Начните новое тестирование</p>
                  </Link>
                  <Link to="/results" className="action-card">
                    <div className="action-icon">📊</div>
                    <h3>Мои результаты</h3>
                    <p>Посмотрите свои результаты</p>
                  </Link>
                </>
              )}
              {(user?.role === 'psychologist' || user?.role === 'admin') && (
                <>
                  <Link to="/psychologist" className="action-card">
                    <div className="action-icon">📈</div>
                    <h3>Статистика</h3>
                    <p>Просмотр всех результатов</p>
                  </Link>
                  <Link to="/tests" className="action-card">
                    <div className="action-icon">📝</div>
                    <h3>Тесты</h3>
                    <p>Список всех тестов</p>
                  </Link>
                </>
              )}
              {user?.role === 'admin' && (
                <Link to="/admin" className="action-card">
                  <div className="action-icon">⚙️</div>
                  <h3>Админ-панель</h3>
                  <p>Управление системой</p>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


