# FitMind AI — website + Telegram bot

Это обычный JS-сайт, интегрированный с Telegram-ботом.

Бот используется для:
- входа пользователя в продукт
- ссылки на сайт
- уведомлений и напоминаний
- быстрых команд
- возврата пользователя обратно в веб-интерфейс

## Структура проекта

```bash
site/      # React + Vite сайт
server/    # Express API + Prisma + PostgreSQL
bot/       # Telegram bot на grammY
shared/    # общие типы
```

Старые каталоги `frontend/` и `backend/` оставлены как ранний черновик Mini App. Дальше используй `site/`, `server/` и `bot/`.

## Что уже есть

### site/
- обычный React/Vite сайт
- Telegram Login Widget
- onboarding profile
- демо-анализ еды
- сохранение demo meals после логина
- генерация тренировок
- медитации
- leaderboard

### server/
- Express API
- проверка Telegram Login hash
- Prisma client
- PostgreSQL schema
- сохранение пользователя после Telegram login
- сохранение профиля
- сохранение meal entries
- сохранение тренировок
- начисление очков за еду, тренировки и медитации
- leaderboard из БД

### bot/
- `/start`
- `/site`
- `/login`
- `/workout`
- `/food`
- `/rating`
- кнопки ведут на обычный сайт

## Безопасность

Токен, который был отправлен в чат, нужно считать скомпрометированным.

Сделай так:
1. зайди в BotFather
2. отзови старый токен
3. выпусти новый
4. положи новый токен только в `.env`
5. не коммить `.env` в GitHub

## Быстрый старт

### 1. Запусти PostgreSQL и Redis

```bash
docker compose up -d
```

### 2. Создай `.env`

Скопируй `.env.example` в `.env` и заполни:

```env
SITE_URL=http://localhost:5173
API_URL=http://localhost:4000
BOT_TOKEN=your_new_bot_token
TELEGRAM_BOT_TOKEN=your_new_bot_token
TELEGRAM_BOT_USERNAME=your_bot_username
TELEGRAM_LOGIN_BOT_NAME=your_bot_username
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fitmind
```

### 3. Подготовь БД

```bash
cd server
npm install
npm run db:generate
npm run db:migrate -- --name init
```

Для просмотра БД:

```bash
npm run db:studio
```

### 4. Запусти API

```bash
cd server
npm run dev
```

### 5. Запусти сайт

```bash
cd site
npm install
VITE_API_URL=http://localhost:4000 VITE_TELEGRAM_BOT_NAME=your_bot_username npm run dev
```

### 6. Запусти бота

```bash
cd bot
npm install
SITE_URL=http://localhost:5173 BOT_TOKEN=your_new_bot_token npm run dev
```

## Telegram Login

Для работы Telegram Login нужно в BotFather привязать домен сайта к боту. Для локальной разработки через Telegram Login обычно нужен публичный HTTPS URL, например через ngrok или другой tunnel.

Пример:

```bash
ngrok http 5173
```

После этого публичный домен нужно указать в BotFather для Telegram Login.

## Что делать следующим шагом

1. Реальная загрузка фото еды
2. Хранение фото в S3 / Cloudflare R2
3. Подключение vision model для анализа еды
4. Реальный дневник питания
5. Экран истории тренировок
6. Streak-система
7. Уведомления через бота
8. Подписка и платежи
