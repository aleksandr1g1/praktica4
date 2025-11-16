#!/bin/bash

# Скрипт для настройки PostgreSQL доступа

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}Настройка PostgreSQL для работы с приложением${NC}\n"

# Создание резервной копии pg_hba.conf
echo -e "${YELLOW}Создание резервной копии конфигурации...${NC}"
sudo cp /var/lib/pgsql/data/pg_hba.conf /var/lib/pgsql/data/pg_hba.conf.backup
echo -e "${GREEN}✓ Резервная копия создана${NC}"

# Настройка аутентификации
echo -e "\n${YELLOW}Настройка метода аутентификации...${NC}"
sudo sed -i 's/local.*all.*all.*peer/local   all             all                                     md5/g' /var/lib/pgsql/data/pg_hba.conf
sudo sed -i 's/host.*all.*all.*127.0.0.1.*ident/host    all             all             127.0.0.1\/32            md5/g' /var/lib/pgsql/data/pg_hba.conf
sudo sed -i 's/host.*all.*all.*::1.*ident/host    all             all             ::1\/128                 md5/g' /var/lib/pgsql/data/pg_hba.conf

echo -e "${GREEN}✓ Настройка выполнена${NC}"

# Перезапуск PostgreSQL
echo -e "\n${YELLOW}Перезапуск PostgreSQL...${NC}"
sudo systemctl restart postgresql

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ PostgreSQL перезапущен успешно${NC}"
else
    echo -e "${RED}✗ Ошибка перезапуска PostgreSQL${NC}"
    exit 1
fi

echo -e "\n${GREEN}Настройка PostgreSQL завершена!${NC}\n"


