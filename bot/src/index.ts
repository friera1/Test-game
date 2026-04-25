import 'dotenv/config';
import { Bot, InlineKeyboard } from 'grammy';

const token = process.env.BOT_TOKEN;
const appUrl = process.env.APP_URL || 'https://your-miniapp-domain.com';

if (!token) {
  throw new Error('BOT_TOKEN is required');
}

const bot = new Bot(token);

bot.command('start', async (ctx) => {
  const keyboard = new InlineKeyboard().webApp('Open FitMind AI', appUrl);
  await ctx.reply(
    'Welcome to FitMind AI. Track food, get workouts, meditate, and climb the leaderboard.',
    { reply_markup: keyboard }
  );
});

bot.command('app', async (ctx) => {
  const keyboard = new InlineKeyboard().webApp('Launch Mini App', appUrl);
  await ctx.reply('Open the app:', { reply_markup: keyboard });
});

bot.command('profile', async (ctx) => {
  await ctx.reply('Profile module is connected to the Mini App dashboard.');
});

bot.command('rating', async (ctx) => {
  await ctx.reply('Leaderboard preview: You are currently #3 with 360 points.');
});

bot.catch((err) => {
  console.error('Bot error:', err.error);
});

bot.start();
console.log('Bot started');
