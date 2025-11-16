#!/bin/bash

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Установка системы психологического тестирования${NC}"
echo -e "${GREEN}================================${NC}\n"

# Функция для проверки успешности команды
check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $1${NC}"
    else
        echo -e "${RED}✗ Ошибка: $1${NC}"
        exit 1
    fi
}

# 1. Проверка и установка Node.js
echo -e "${YELLOW}Шаг 1: Проверка Node.js и npm...${NC}"
if command -v node &> /dev/null && command -v npm &> /dev/null; then
    echo -e "${GREEN}✓ Node.js $(node --version) уже установлен${NC}"
    echo -e "${GREEN}✓ npm $(npm --version) уже установлен${NC}"
else
    echo -e "${YELLOW}Node.js не найден. Устанавливаю...${NC}"
    echo -e "${YELLOW}Требуется пароль администратора:${NC}"
    sudo dnf install nodejs npm -y
    check_status "Установка Node.js и npm"
fi

# 2. Проверка PostgreSQL
echo -e "\n${YELLOW}Шаг 2: Проверка PostgreSQL...${NC}"
if command -v psql &> /dev/null; then
    echo -e "${GREEN}✓ PostgreSQL уже установлен${NC}"
else
    echo -e "${YELLOW}PostgreSQL не найден. Устанавливаю...${NC}"
    echo -e "${YELLOW}Требуется пароль администратора:${NC}"
    sudo dnf install postgresql postgresql-server -y
    check_status "Установка PostgreSQL"
    
    echo -e "${YELLOW}Инициализация PostgreSQL...${NC}"
    sudo postgresql-setup --initdb
    check_status "Инициализация PostgreSQL"
    
    echo -e "${YELLOW}Запуск PostgreSQL...${NC}"
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    check_status "Запуск PostgreSQL"
fi

# 3. Проверка статуса PostgreSQL
echo -e "\n${YELLOW}Шаг 3: Проверка статуса PostgreSQL...${NC}"
sudo systemctl status postgresql --no-pager | head -5

# 4. Создание базы данных
echo -e "\n${YELLOW}Шаг 4: Создание базы данных...${NC}"
echo -e "${YELLOW}Выполнение SQL команд...${NC}"

sudo -u postgres psql -c "SELECT 1 FROM pg_database WHERE datname='psychological_tests'" | grep -q 1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ База данных psychological_tests уже существует${NC}"
else
    sudo -u postgres psql << EOF
CREATE DATABASE psychological_tests;
ALTER DATABASE psychological_tests OWNER TO postgres;
\q
EOF
    check_status "Создание базы данных"
fi

# 5. Установка зависимостей
echo -e "\n${YELLOW}Шаг 5: Установка зависимостей проекта...${NC}"

echo -e "${YELLOW}Установка зависимостей backend...${NC}"
cd /home/lovesosa/praktica/backend
npm install
check_status "Установка зависимостей backend"

echo -e "${YELLOW}Установка зависимостей frontend...${NC}"
cd /home/lovesosa/praktica/frontend
npm install
check_status "Установка зависимостей frontend"

# 6. Создание администратора
echo -e "\n${YELLOW}Шаг 6: Создание администратора и психолога...${NC}"
cd /home/lovesosa/praktica/backend
npx ts-node src/scripts/create-admin.ts
check_status "Создание администратора и психолога"

# Готово!
echo -e "\n${GREEN}================================${NC}"
echo -e "${GREEN}✓ Установка завершена успешно!${NC}"
echo -e "${GREEN}================================${NC}\n"

echo -e "Тестовые аккаунты:"
echo -e "  ${GREEN}Админ:${NC} admin@test.com / admin123"
echo -e "  ${GREEN}Психолог:${NC} psychologist@test.com / psych123\n"

echo -e "Для запуска приложения выполните:"
echo -e "  ${YELLOW}cd /home/lovesosa/praktica${NC}"
echo -e "  ${YELLOW}npm run dev${NC}\n"

echo -e "Затем откройте браузер: ${GREEN}http://localhost:3000${NC}\n"


