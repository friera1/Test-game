# FitMind AI Telegram Mini App

Стартовый каркас Telegram Mini App для:
- распознавания еды по фото и оценки калорий
- персональных тренировок
- медитаций
- рейтингов и streak-механики

## Стек

### Frontend
- React + Vite + TypeScript
- Telegram WebApp SDK
- Tailwind-ready структура

### Backend
- Node.js + Fastify + TypeScript
- JWT/Telegram initData verification placeholder
- REST API для профиля, питания, тренировок, медитаций и рейтингов

### Bot
- grammY
- команды `/start`, `/app`, `/profile`, `/rating`

## Важно по безопасности

Вы **не должны** хранить реальный bot token в репозитории.
Токен, который был отправлен в чат, нужно:
1. отозвать через BotFather
2. выпустить новый
3. положить только в `.env`

## Структура

```
fitmind-telegram-app/
  frontend/
  backend/
  bot/
  shared/
  .env.example
  docker-compose.yml
```

## Быстрый старт

1. Скопируйте `.env.example` в `.env`
2. Заполните переменные окружения
3. Поднимите postgres/redis через docker compose
4. Установите зависимости отдельно в `frontend`, `backend`, `bot`
5. Запустите dev-сервисы

## Что уже заложено

- каркас главного экрана Mini App
- типы доменных сущностей
- API endpoints-заглушки
- Telegram bot с кнопкой запуска webapp
- пример логики расчета дневной цели калорий
- пример генерации тренировочного плана

## Что делать дальше

### Приоритет 1
- Подключить PostgreSQL через Prisma
- Реализовать проверку `initData`
- Добавить загрузку фото в S3 / Cloudflare R2
- Подключить vision model для распознавания еды

### Приоритет 2
- Реализовать дневник питания
- Добавить персонализацию тренировок
- Добавить streak и leaderboards

### Приоритет 3
- Платежи
- Реферальную систему
- Групповые челленджи

## Пример production-модулей AI

- FoodVisionService: классификация еды, ингредиентов, порций
- NutritionService: расчет калорий и БЖУ
- WorkoutPlannerService: генерация недельных планов
- MeditationService: рекомендации практик
