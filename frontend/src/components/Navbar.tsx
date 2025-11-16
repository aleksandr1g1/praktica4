import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import './Navbar.css';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            Психологическое тестирование
          </Link>

          <div className="navbar-links">
            <Link to="/">Главная</Link>
            <Link to="/tests">Тесты</Link>

            {isAuthenticated ? (
              <>
                {user?.role === 'user' && (
                  <Link to="/results">Мои результаты</Link>
                )}
                {(user?.role === 'psychologist' || user?.role === 'admin') && (
                  <Link to="/psychologist">Статистика</Link>
                )}
                {user?.role === 'admin' && (
                  <Link to="/admin">Админ-панель</Link>
                )}
                <div className="navbar-user">
                  <span>
                    {user?.firstName || user?.username}
                    {' '}
                    <span className="user-role">({user?.role})</span>
                  </span>
                  <button onClick={handleLogout} className="btn-logout">
                    Выйти
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login">Войти</Link>
                <Link to="/register" className="btn-register">
                  Регистрация
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};


