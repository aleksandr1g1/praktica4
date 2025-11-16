# Запуск с помощью Docker

Это руководство поможет вам запустить систему психологического тестирования с помощью Docker.

## Требования

- Docker
- Docker Compose

## Установка Docker

### Ubuntu/Debian
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### Fedora
```bash
sudo dnf install docker docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

После установки перезагрузите систему или выполните:
```bash
newgrp docker
```

## Запуск приложения

### 1. Запуск всех сервисов

```bash
# Из корневой директории проекта
docker-compose up -d
```

Это запустит:
- PostgreSQL базу данных на порту 5432
- Backend сервер на порту 5000
- Frontend на порту 80

### 2. Проверка статуса

```bash
docker-compose ps
```

### 3. Просмотр логов

```bash
# Все сервисы
docker-compose logs -f

# Конкретный сервис
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### 4. Создание администратора

После запуска контейнеров создайте администратора:

```bash
docker-compose exec backend npx ts-node src/scripts/create-admin.ts
```

## Доступ к приложению

- Frontend: http://localhost
- Backend API: http://localhost:5000/api
- PostgreSQL: localhost:5432

## Управление

### Остановка сервисов

```bash
docker-compose stop
```

### Полная остановка и удаление контейнеров

```bash
docker-compose down
```

### Удаление с данными (будьте осторожны!)

```bash
docker-compose down -v
```

### Перезапуск после изменений

```bash
docker-compose down
docker-compose up -d --build
```

### Подключение к базе данных

```bash
docker-compose exec postgres psql -U postgres -d psychological_tests
```

## Backup и восстановление

### Создание backup

```bash
docker-compose exec postgres pg_dump -U postgres psychological_tests > backup.sql
```

### Восстановление из backup

```bash
cat backup.sql | docker-compose exec -T postgres psql -U postgres psychological_tests
```

## Решение проблем

### Порты заняты

Если порты 80, 5000 или 5432 заняты, измените их в `docker-compose.yml`:

```yaml
services:
  frontend:
    ports:
      - "8080:80"  # Измените 8080 на нужный порт
  
  backend:
    ports:
      - "5001:5000"  # Измените 5001 на нужный порт
  
  postgres:
    ports:
      - "5433:5432"  # Измените 5433 на нужный порт
```

### Проблемы с правами

```bash
sudo chown -R $USER:$USER backend/uploads
```

### Пересоздание контейнеров

```bash
docker-compose down
docker-compose up -d --build --force-recreate
```

## Production настройки

Для production окружения измените в `docker-compose.yml`:

```yaml
backend:
  environment:
    - NODE_ENV=production
    - JWT_SECRET=<длинный_случайный_ключ>
    - DB_PASSWORD=<надежный_пароль>
```

И в `postgres`:

```yaml
postgres:
  environment:
    POSTGRES_PASSWORD: <надежный_пароль>
```


