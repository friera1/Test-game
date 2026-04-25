import 'dotenv/config';
import { Bot, InlineKeyboard } from 'grammy';

const token = process.env.BOT_TOKEN;
const siteUrl = process.env.SITE_URL || 'https://your-site-domain.com';

if (!token) {
  throw new Error('BOT_TOKEN is required');
}

const bot = new Bot(token);

function siteKeyboard() {
  return new InlineKeyboard().url('Open FitMind site', siteUrl);
}

bot.command('start', async (ctx) => {
  await ctx.reply(
    'Welcome to FitMind AI. Open the website to track food, get workouts, meditate, and see the leaderboard.',
    { reply_markup: siteKeyboard() }
  );
});

bot.command('site', async (ctx) => {
  await ctx.reply('Open the website:', { reply_markup: siteKeyboard() });
});

bot.command('login', async (ctx) => {
  await ctx.reply('Use Telegram Login on the website to sign in securely.', {
    reply_markup: siteKeyboard()
  });
});

bot.command('workout', async (ctx) => {
  await ctx.reply('Today: full-body session, 20 minutes. Open the website for the full plan.', {
    reply_markup: siteKeyboard()
  });
});

bot.command('food', async (ctx) => {
  await ctx.reply('Upload a meal photo on the website to estimate calories.', {
    reply_markup: siteKeyboard()
  });
});

bot.command('rating', async (ctx) => {
  await ctx.reply('Leaderboard preview: you are currently #3 with 360 points.', {
    reply_markup: siteKeyboard()
  });
});

bot.catch((err) => {
  console.error('Bot error:', err.error);
});

bot.start();
console.log('Bot started');
