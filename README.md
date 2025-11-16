# Система психологического тестирования

Веб-приложение для прохождения психологических тестов (Тест Равена) с функционалом для пользователей, психологов и администраторов.

## Технологии

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL
- TypeORM
- JWT авторизация
- Multer (загрузка файлов)

### Frontend
- React 18
- TypeScript
- React Router v6
- Zustand (управление состоянием)
- Axios
- Vite

## Возможности

### Для пользователей
- Регистрация и авторизация
- Прохождение психологических тестов
- Счётчик вопросов при прохождении
- Выбор: сохранять результат или нет
- Просмотр сохраненных результатов

### Для психологов
- Просмотр всех результатов пользователей
- Детальная статистика по тестам
- Статистика по каждому пользователю
- Методические рекомендации по тестам
- Общая статистика системы

### Для администраторов
- Все возможности психолога
- Создание новых тестов
- Добавление вопросов с изображениями
- Редактирование тестов
- Управление пользователями (активация/деактивация)
- Очистка результатов из базы данных

## Установка и запуск

### Требования
- Node.js 18+
- PostgreSQL 14+
- npm или yarn

### 1. Клонирование репозитория

```bash
git clone <repository-url>
cd praktica
```

### 2. Настройка базы данных

Создайте базу данных PostgreSQL:

```bash
# Войдите в PostgreSQL
sudo -u postgres psql

# Создайте базу данных и пользователя
CREATE DATABASE psychological_tests;
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE psychological_tests TO postgres;
\q
```

### 3. Настройка backend

```bash
cd backend

# Установка зависимостей
npm install

# Настройка переменных окружения
cp .env.example .env
# Отредактируйте .env файл с вашими настройками

# База данных будет автоматически инициализирована при первом запуске
```

### 4. Настройка frontend

```bash
cd frontend

# Установка зависимостей
npm install
```

### 5. Запуск приложения

#### Вариант 1: Запуск backend и frontend отдельно

Терминал 1 (Backend):
```bash
cd backend
npm run dev
```

Терминал 2 (Frontend):
```bash
cd frontend
npm run dev
```

#### Вариант 2: Запуск всего сразу из корневой папки

```bash
# Установка всех зависимостей
npm run install:all

# Запуск backend и frontend одновременно
npm run dev
```

### 6. Доступ к приложению

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Health check: http://localhost:5000/api/health

## Создание администратора и психолога

Роли психолога и администратора создаются вручную в базе данных.

### Способ 1: Через psql

```bash
sudo -u postgres psql psychological_tests

-- Создаем админа (сначала зарегистрируйтесь через интерфейс, затем измените роль)
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';

-- Создаем психолога
UPDATE users SET role = 'psychologist' WHERE email = 'psychologist@example.com';
```

### Способ 2: Создание тестовых пользователей через скрипт

Создайте файл `create-admin.ts` в папке `backend/src/scripts/`:

```typescript
import { AppDataSource } from '../config/database';
import { User, UserRole } from '../entities/User';
import bcrypt from 'bcryptjs';

async function createAdminAndPsychologist() {
  await AppDataSource.initialize();

  const userRepository = AppDataSource.getRepository(User);

  // Создаем админа
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = userRepository.create({
    email: 'admin@test.com',
    username: 'admin',
    password: adminPassword,
    role: UserRole.ADMIN,
    firstName: 'Администратор',
    lastName: 'Системы',
  });
  await userRepository.save(admin);

  // Создаем психолога
  const psychPassword = await bcrypt.hash('psych123', 10);
  const psychologist = userRepository.create({
    email: 'psychologist@test.com',
    username: 'psychologist',
    password: psychPassword,
    role: UserRole.PSYCHOLOGIST,
    firstName: 'Психолог',
    lastName: 'Тестовый',
  });
  await userRepository.save(psychologist);

  console.log('✅ Админ и психолог созданы успешно!');
  console.log('Админ: admin@test.com / admin123');
  console.log('Психолог: psychologist@test.com / psych123');

  await AppDataSource.destroy();
}

createAdminAndPsychologist().catch(console.error);
```

Запустите скрипт:
```bash
cd backend
npx ts-node src/scripts/create-admin.ts
```

## Структура проекта

```
praktica/
├── backend/
│   ├── src/
│   │   ├── config/          # Конфигурация (БД)
│   │   ├── entities/        # Модели базы данных
│   │   ├── controllers/     # Контроллеры
│   │   ├── routes/          # Роуты API
│   │   ├── middleware/      # Middleware (auth)
│   │   ├── utils/           # Утилиты
│   │   └── index.ts         # Точка входа
│   ├── uploads/             # Загруженные изображения
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── api/            # API клиенты
│   │   ├── components/     # React компоненты
│   │   ├── pages/          # Страницы
│   │   ├── store/          # Zustand store
│   │   ├── types/          # TypeScript типы
│   │   ├── App.tsx         # Главный компонент
│   │   ├── main.tsx        # Точка входа
│   │   └── index.css       # Глобальные стили
│   ├── package.json
│   └── vite.config.ts
│
├── package.json            # Корневой package.json
└── README.md
```

## API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/auth/profile` - Получить профиль
- `PUT /api/auth/profile` - Обновить профиль

### Тесты (публичные)
- `GET /api/tests` - Список тестов
- `GET /api/tests/:id` - Получить тест с вопросами
- `POST /api/tests/start` - Начать тест
- `POST /api/tests/answer` - Сохранить ответ
- `POST /api/tests/complete` - Завершить тест

### Результаты (авторизация)
- `GET /api/results` - Результаты пользователя
- `GET /api/results/:id` - Детальный результат

### Психолог
- `GET /api/psychologist/results/all` - Все результаты
- `GET /api/psychologist/statistics/test/:testId` - Статистика по тесту
- `GET /api/psychologist/statistics/user/:userId` - Статистика пользователя
- `GET /api/psychologist/statistics/overall` - Общая статистика

### Администратор
- `POST /api/admin/tests` - Создать тест
- `PUT /api/admin/tests/:id` - Обновить тест
- `DELETE /api/admin/tests/:id` - Удалить тест
- `POST /api/admin/questions` - Добавить вопрос
- `PUT /api/admin/questions/:id` - Обновить вопрос
- `DELETE /api/admin/questions/:id` - Удалить вопрос
- `DELETE /api/admin/results/test/:testId` - Очистить результаты теста
- `DELETE /api/admin/results/all` - Очистить все результаты
- `GET /api/admin/users` - Список пользователей
- `PUT /api/admin/users/:id/toggle-status` - Изменить статус пользователя

## Особенности реализации

### Безопасность
- JWT токены для аутентификации
- Хеширование паролей с bcrypt
- Защита роутов по ролям
- Валидация данных

### Роли пользователей
1. **User** - обычный пользователь (создается через регистрацию)
2. **Psychologist** - психолог (создается вручную)
3. **Admin** - администратор (создается вручную)

### Особенности тестирования
- Название теста скрыто от пользователей
- Счётчик прогресса при прохождении
- Возможность сохранения/несохранения результата
- Временные ограничения на тест
- Загрузка изображений для вопросов

## Production

Для production окружения:

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
# Разверните содержимое dist/ на веб-сервере
```

### Переменные окружения для production

Обязательно измените в `.env`:
- `JWT_SECRET` - на надежный секретный ключ
- `DB_PASSWORD` - на надежный пароль базы данных
- `NODE_ENV=production`

## Поддержка

При возникновении проблем:
1. Проверьте, что PostgreSQL запущен
2. Убедитесь, что база данных создана
3. Проверьте настройки в `.env`
4. Проверьте логи backend в консоли

## Лицензия

MIT


