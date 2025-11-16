-- Создание базы данных и пользователя для системы психологического тестирования

-- Создание базы данных
CREATE DATABASE psychological_tests;

-- Создание пользователя (если не существует)
DO
$$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'postgres') THEN
        CREATE USER postgres WITH PASSWORD 'postgres';
    END IF;
END
$$;

-- Предоставление прав
GRANT ALL PRIVILEGES ON DATABASE psychological_tests TO postgres;
ALTER DATABASE psychological_tests OWNER TO postgres;

-- Подключение к созданной базе данных
\c psychological_tests;

-- Предоставление прав на схему
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- Таблицы будут созданы автоматически через TypeORM при первом запуске backend

-- Примечание: После запуска backend, выполните скрипт создания администратора:
-- cd backend && npx ts-node src/scripts/create-admin.ts


