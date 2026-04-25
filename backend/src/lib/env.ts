import 'dotenv/config';

export const env = {
  port: Number(process.env.PORT || 4000),
  appUrl: process.env.APP_URL || '',
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  telegramBotUsername: process.env.TELEGRAM_BOT_USERNAME || '',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret'
};
