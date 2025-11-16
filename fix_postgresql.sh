#!/bin/bash

echo "Настройка PostgreSQL для приложения..."

# Создание резервной копии
sudo cp /var/lib/pgsql/data/pg_hba.conf /var/lib/pgsql/data/pg_hba.conf.backup.$(date +%Y%m%d_%H%M%S)

# Настройка метода аутентификации
sudo sed -i 's/local   all             all                                     peer/local   all             all                                     trust/g' /var/lib/pgsql/data/pg_hba.conf
sudo sed -i 's/host    all             all             127.0.0.1\/32            ident/host    all             all             127.0.0.1\/32            trust/g' /var/lib/pgsql/data/pg_hba.conf
sudo sed -i 's/host    all             all             ::1\/128                 ident/host    all             all             ::1\/128                 trust/g' /var/lib/pgsql/data/pg_hba.conf

# Перезапуск PostgreSQL
sudo systemctl restart postgresql

echo "✅ PostgreSQL настроен!"
echo ""
echo "Теперь создаём базу данных..."

# Создание базы данных
psql -U postgres -c "CREATE DATABASE psychological_tests;" 2>/dev/null || echo "База данных уже существует"

echo ""
echo "✅ Готово! Можно запускать приложение"


