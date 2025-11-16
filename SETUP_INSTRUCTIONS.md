# Инструкция по установке и настройке

Выполните эти команды последовательно в терминале:

## 1. Установка Node.js и npm (требуется пароль)

```bash
sudo dnf install nodejs npm -y
```

Проверьте установку:
```bash
node --version
npm --version
```

## 2. Установка PostgreSQL (требуется пароль)

```bash
sudo dnf install postgresql postgresql-server -y
```

## 3. Инициализация PostgreSQL

```bash
sudo postgresql-setup --initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## 4. Создание базы данных

```bash
sudo -u postgres psql
```

В psql выполните:
```sql
CREATE DATABASE psychological_tests;
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE psychological_tests TO postgres;
ALTER DATABASE psychological_tests OWNER TO postgres;
\q
```

## 5. Настройка доступа к PostgreSQL

Отредактируйте файл pg_hba.conf:
```bash
sudo nano /var/lib/pgsql/data/pg_hba.conf
```

Найдите строки с `local` и измените метод аутентификации на `md5`:
```
local   all             all                                     md5
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
```

Перезапустите PostgreSQL:
```bash
sudo systemctl restart postgresql
```

## 6. Установка зависимостей проекта

```bash
cd /home/lovesosa/praktica

# Установка зависимостей backend
cd backend
npm install

# Установка зависимостей frontend
cd ../frontend
npm install

# Возврат в корень
cd ..
```

## 7. Создание администратора и психолога

```bash
cd backend
npx ts-node src/scripts/create-admin.ts
cd ..
```

Это создаст:
- **Админ**: admin@test.com / admin123
- **Психолог**: psychologist@test.com / psych123

## 8. Запуск приложения

```bash
npm run dev
```

Откройте браузер: http://localhost:3000

---

## Альтернативный способ через команды по одной

Если хотите выполнять по одной команде, скопируйте и вставляйте из списка выше.

## Проверка статуса PostgreSQL

```bash
sudo systemctl status postgresql
```

## Вход в базу данных для проверки

```bash
psql -U postgres -d psychological_tests
```

В psql:
```sql
\dt  -- показать таблицы
\q   -- выйти
```


