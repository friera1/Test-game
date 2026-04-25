import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';

const app = express();
const PORT = Number(process.env.PORT || 4000);
const SITE_URL = process.env.SITE_URL || 'http://localhost:5173';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

app.use(cors({ origin: SITE_URL, credentials: true }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/auth/telegram', (req, res) => {
  try {
    const user = req.body || {};
    const valid = verifyTelegramLogin(user, TELEGRAM_BOT_TOKEN);

    if (!valid) {
      return res.status(401).json({ ok: false, error: 'Invalid Telegram auth payload' });
    }

    return res.json({
      ok: true,
      user: {
        id: user.id,
        first_name: user.first_name,
        username: user.username,
        photo_url: user.photo_url || null
      }
    });
  } catch (error) {
    return res.status(500).json({ ok: false, error: 'Auth verification failed' });
  }
});

app.post('/api/nutrition/analyze-photo', (_req, res) => {
  res.json({
    result: {
      title: 'Chicken rice bowl',
      ingredients: ['chicken breast', 'rice', 'vegetables', 'olive oil'],
      estimatedWeightGrams: 420,
      calories: 610,
      protein: 42,
      fat: 18,
      carbs: 69,
      confidence: 0.76
    },
    note: 'Starter mock. Next step: upload image file + vision model + editable portion data.'
  });
});

app.post('/api/workouts/generate', (req, res) => {
  const body = req.body || {};
  const beginner = !body.activityLevel || body.activityLevel === 'low';

  res.json({
    workout: {
      title: beginner ? 'Starter full-body workout' : 'Adaptive strength session',
      difficulty: beginner ? 'easy' : 'medium',
      durationMin: beginner ? 20 : 35,
      exercises: beginner
        ? [
            { name: 'Bodyweight squats', sets: 3, reps: '12', restSec: 45 },
            { name: 'Push-ups on knees', sets: 3, reps: '8-10', restSec: 45 },
            { name: 'Glute bridge', sets: 3, reps: '12', restSec: 30 },
            { name: 'Plank', sets: 3, reps: '30 sec', restSec: 30 }
          ]
        : [
            { name: 'Goblet squats', sets: 4, reps: '10', restSec: 60 },
            { name: 'Push-ups', sets: 4, reps: '10-15', restSec: 60 },
            { name: 'Romanian deadlift', sets: 3, reps: '12', restSec: 75 },
            { name: 'Plank shoulder taps', sets: 3, reps: '20 total', restSec: 45 }
          ]
    }
  });
});

app.get('/api/meditations/recommend', (_req, res) => {
  res.json({
    meditation: {
      title: 'Reset after a stressful day',
      category: 'stress',
      durationMin: 7,
      scriptPreview: 'Notice your breath, relax shoulders, observe thoughts without reacting.'
    }
  });
});

app.get('/api/leaderboard', (_req, res) => {
  res.json({
    entries: [
      { rank: 1, name: 'Alex', points: 420 },
      { rank: 2, name: 'Mira', points: 390 },
      { rank: 3, name: 'You', points: 360 }
    ]
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

function verifyTelegramLogin(data, botToken) {
  if (!botToken || !data || !data.hash) return false;

  const checkString = Object.keys(data)
    .filter((key) => key !== 'hash' && data[key] !== undefined && data[key] !== null)
    .sort()
    .map((key) => `${key}=${data[key]}`)
    .join('\n');

  const secretKey = crypto.createHash('sha256').update(botToken).digest();
  const hmac = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');
  return hmac === data.hash;
}
