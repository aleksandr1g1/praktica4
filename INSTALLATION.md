# Подробная инструкция по установке

## Шаг 1: Установка PostgreSQL

### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Fedora (ваша система)
```bash
sudo dnf install postgresql postgresql-server
sudo postgresql-setup --initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### macOS
```bash
brew install postgresql
brew services start postgresql
```

## Шаг 2: Настройка базы данных

```bash
# Войти в PostgreSQL
sudo -u postgres psql

# В psql выполнить:
CREATE DATABASE psychological_tests;
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE psychological_tests TO postgres;
ALTER DATABASE psychological_tests OWNER TO postgres;
\q
```

## Шаг 3: Клонирование и установка зависимостей

```bash
# Перейти в папку проекта
cd /home/lovesosa/praktica

# Установить зависимости корневого проекта
npm install

# Установить зависимости backend
cd backend
npm install

# Установить зависимости frontend
cd ../frontend
npm install

# Вернуться в корень
cd ..
```

## Шаг 4: Настройка переменных окружения

Backend уже настроен с файлом `.env`. Проверьте настройки:

```bash
cat backend/.env
```

Если нужно изменить настройки базы данных, отредактируйте файл:
```bash
nano backend/.env
```

## Шаг 5: Создание администратора и психолога

```bash
cd backend
npx ts-node src/scripts/create-admin.ts
cd ..
```

Это создаст:
- **Админ**: email: `admin@test.com`, пароль: `admin123`
- **Психолог**: email: `psychologist@test.com`, пароль: `psych123`

## Шаг 6: Запуск приложения

### Вариант А: Запуск из корня (рекомендуется)

```bash
# Из папки /home/lovesosa/praktica
npm run dev
```

Это запустит backend и frontend одновременно.

### Вариант Б: Запуск отдельно

**Терминал 1 - Backend:**
```bash
cd backend
npm run dev
```

**Терминал 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Шаг 7: Проверка работы

1. Откройте браузер и перейдите на http://localhost:3000
2. Вы должны увидеть главную страницу системы
3. Попробуйте войти как админ (admin@test.com / admin123)

## Возможные проблемы и решения

### Проблема: PostgreSQL не запускается

**Решение для Fedora:**
```bash
sudo systemctl status postgresql
sudo journalctl -u postgresql -n 50
```

Если база не инициализирована:
```bash
sudo postgresql-setup --initdb
sudo systemctl start postgresql
```

### Проблема: Ошибка подключения к базе данных

Проверьте настройки pg_hba.conf:
```bash
sudo nano /var/lib/pgsql/data/pg_hba.conf
```

Убедитесь, что есть строка:
```
local   all             all                                     md5
```

Перезапустите PostgreSQL:
```bash
sudo systemctl restart postgresql
```

### Проблема: Порт 5000 или 3000 занят

Измените порты в конфигурации:
- Backend: в `backend/.env` измените `PORT=5000` на другой порт
- Frontend: в `frontend/vite.config.ts` измените `port: 3000` на другой порт

### Проблема: "Cannot find module"

Переустановите зависимости:
```bash
rm -rf node_modules backend/node_modules frontend/node_modules
npm run install:all
```

## Создание примера теста (Тест Равена)

После запуска приложения:

1. Войдите как администратор (admin@test.com / admin123)
2. Перейдите в "Админ-панель"
3. Во вкладке "Создать тест" заполните:
   - Название теста: "Прогрессивные матрицы Равена"
   - Отображаемое название: "Тест 1"
   - Описание: "Тест для оценки невербального интеллекта"
   - Методические рекомендации: "Тест состоит из матриц с пропущенным элементом. Необходимо выбрать правильный вариант из предложенных."
   - Ограничение времени: 45 минут
4. Нажмите "Создать тест"
5. Добавьте вопросы с изображениями матриц

## Тестирование системы

### Тест 1: Регистрация пользователя
1. Выйдите из системы
2. Нажмите "Регистрация"
3. Зарегистрируйте нового пользователя
4. Проверьте, что вы автоматически вошли

### Тест 2: Прохождение теста
1. Войдите как обычный пользователь
2. Перейдите в "Тесты"
3. Выберите тест и начните его прохождение
4. Ответьте на вопросы
5. Выберите "Сохранить" при завершении

### Тест 3: Просмотр статистики (психолог)
1. Войдите как психолог (psychologist@test.com / psych123)
2. Перейдите в "Статистика"
3. Проверьте, что видны результаты всех пользователей

### Тест 4: Управление тестами (администратор)
1. Войдите как админ (admin@test.com / admin123)
2. Перейдите в "Админ-панель"
3. Попробуйте создать новый тест
4. Добавьте вопрос с изображением
5. Проверьте управление пользователями

## Production развертывание

### 1. Настройка переменных окружения
```bash
# backend/.env
NODE_ENV=production
JWT_SECRET=<сгенерируйте длинный случайный ключ>
DB_PASSWORD=<надежный пароль>
```

### 2. Сборка
```bash
# Backend
cd backend
npm run build

# Frontend
cd ../frontend
npm run build
```

### 3. Запуск
```bash
# Backend (используйте PM2 или systemd)
cd backend
npm start

# Frontend - разверните папку dist/ на Nginx/Apache
```

## Дополнительные команды

```bash
# Посмотреть логи PostgreSQL
sudo journalctl -u postgresql -f

# Войти в базу данных
psql -U postgres -d psychological_tests

# Посмотреть таблицы
\dt

# Посмотреть пользователей
SELECT email, username, role FROM users;

# Создать backup базы данных
pg_dump -U postgres psychological_tests > backup.sql

# Восстановить базу данных
psql -U postgres psychological_tests < backup.sql
```

## Контакты и поддержка

Если возникли проблемы, проверьте:
1. Логи backend в терминале
2. Консоль браузера (F12)
3. Статус PostgreSQL: `sudo systemctl status postgresql`
4. Файлы логов: `backend/npm-debug.log`


