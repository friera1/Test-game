import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { prisma } from './lib/prisma.js';
import { analyzeFoodPhoto } from './services/foodVision.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT || 4000);
const SITE_URL = process.env.SITE_URL || 'http://localhost:5173';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

const upload = multer({
  dest: UPLOAD_DIR,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Only image files are allowed'));
    cb(null, true);
  }
});

app.use(cors({ origin: SITE_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(UPLOAD_DIR));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/api/auth/telegram', async (req, res) => {
  try {
    const telegramUser = req.body || {};
    const valid = verifyTelegramLogin(telegramUser, TELEGRAM_BOT_TOKEN);
    if (!valid) return res.status(401).json({ ok: false, error: 'Invalid Telegram auth payload' });

    const user = await prisma.user.upsert({
      where: { telegramId: String(telegramUser.id) },
      update: {
        username: telegramUser.username || null,
        firstName: telegramUser.first_name || null,
        photoUrl: telegramUser.photo_url || null
      },
      create: {
        telegramId: String(telegramUser.id),
        username: telegramUser.username || null,
        firstName: telegramUser.first_name || null,
        photoUrl: telegramUser.photo_url || null
      },
      include: { profile: true }
    });

    return res.json({ ok: true, user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, error: 'Auth verification failed' });
  }
});

app.get('/api/users/:telegramId', async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { telegramId: String(req.params.telegramId) },
    include: { profile: true, meals: { orderBy: { createdAt: 'desc' }, take: 10 } }
  });
  if (!user) return res.status(404).json({ ok: false, error: 'User not found' });
  res.json({ ok: true, user });
});

app.post('/api/profile', async (req, res) => {
  try {
    const { telegramId, age, heightCm, weightKg, goal, activityLevel, equipment, restrictions } = req.body || {};
    if (!telegramId) return res.status(400).json({ ok: false, error: 'telegramId is required' });

    const user = await prisma.user.findUnique({ where: { telegramId: String(telegramId) } });
    if (!user) return res.status(404).json({ ok: false, error: 'User not found' });

    const targetCalories = estimateDailyCalories({ age, heightCm, weightKg, goal, activityLevel });
    const profile = await prisma.userProfile.upsert({
      where: { userId: user.id },
      update: {
        age: toIntOrNull(age),
        heightCm: toIntOrNull(heightCm),
        weightKg: toFloatOrNull(weightKg),
        goal: goal || null,
        activityLevel: activityLevel || null,
        equipment: Array.isArray(equipment) ? equipment.join(',') : equipment || null,
        restrictions: Array.isArray(restrictions) ? restrictions.join(',') : restrictions || null,
        targetCalories
      },
      create: {
        userId: user.id,
        age: toIntOrNull(age),
        heightCm: toIntOrNull(heightCm),
        weightKg: toFloatOrNull(weightKg),
        goal: goal || null,
        activityLevel: activityLevel || null,
        equipment: Array.isArray(equipment) ? equipment.join(',') : equipment || null,
        restrictions: Array.isArray(restrictions) ? restrictions.join(',') : restrictions || null,
        targetCalories
      }
    });

    res.json({ ok: true, profile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Failed to save profile' });
  }
});

app.post('/api/nutrition/analyze-photo', async (req, res) => {
  try {
    const { telegramId } = req.body || {};
    const { result, meal } = await analyzeAndSaveMeal({ telegramId });
    res.json({ result, meal, note: 'No photo was uploaded, so the mock food analysis was used.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Failed to analyze meal' });
  }
});

app.post('/api/nutrition/upload-photo', upload.single('photo'), async (req, res) => {
  try {
    const telegramId = req.body?.telegramId;
    const file = req.file;
    if (!file) return res.status(400).json({ ok: false, error: 'photo file is required' });

    const publicPhotoUrl = `/uploads/${file.filename}`;
    const { result, meal } = await analyzeAndSaveMeal({
      telegramId,
      photoUrl: publicPhotoUrl,
      filePath: file.path,
      mimeType: file.mimetype
    });

    res.json({
      ok: true,
      result,
      meal,
      uploadedFile: {
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        photoUrl: publicPhotoUrl
      },
      note: process.env.OPENAI_API_KEY
        ? 'Photo analyzed through the configured vision pipeline.'
        : 'Photo uploaded, but OPENAI_API_KEY is missing, so mock analysis was used.'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Failed to upload and analyze meal photo' });
  }
});

app.get('/api/nutrition/meals/:telegramId', async (req, res) => {
  const user = await prisma.user.findUnique({ where: { telegramId: String(req.params.telegramId) } });
  if (!user) return res.status(404).json({ ok: false, error: 'User not found' });
  const meals = await prisma.mealEntry.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 30 });
  res.json({ ok: true, meals });
});

app.post('/api/workouts/generate', async (req, res) => {
  try {
    const body = req.body || {};
    const beginner = !body.activityLevel || body.activityLevel === 'low';
    const workout = {
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
    };

    let savedWorkout = null;
    if (body.telegramId) {
      const user = await prisma.user.findUnique({ where: { telegramId: String(body.telegramId) } });
      if (user) {
        savedWorkout = await prisma.workoutSession.create({
          data: { userId: user.id, title: workout.title, difficulty: workout.difficulty, durationMin: workout.durationMin, payload: workout }
        });
      }
    }

    res.json({ workout, savedWorkout });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Failed to generate workout' });
  }
});

app.post('/api/workouts/:id/complete', async (req, res) => {
  const workout = await prisma.workoutSession.update({
    where: { id: Number(req.params.id) },
    data: { completed: true, completedAt: new Date() }
  });
  await prisma.leaderboardEntry.create({ data: { userId: workout.userId, points: 10, reason: 'workout_completed', period: 'weekly' } });
  res.json({ ok: true, workout });
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

app.post('/api/meditations/complete', async (req, res) => {
  try {
    const { telegramId, title = 'Reset after a stressful day', category = 'stress', durationMin = 7 } = req.body || {};
    if (!telegramId) return res.status(400).json({ ok: false, error: 'telegramId is required' });
    const user = await prisma.user.findUnique({ where: { telegramId: String(telegramId) } });
    if (!user) return res.status(404).json({ ok: false, error: 'User not found' });

    const meditation = await prisma.meditationSession.create({
      data: { userId: user.id, title, category, durationMin, completed: true, completedAt: new Date() }
    });
    await prisma.leaderboardEntry.create({ data: { userId: user.id, points: 5, reason: 'meditation_completed', period: 'weekly' } });
    res.json({ ok: true, meditation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Failed to complete meditation' });
  }
});

app.get('/api/leaderboard', async (_req, res) => {
  const rows = await prisma.leaderboardEntry.groupBy({
    by: ['userId'],
    where: { period: 'weekly' },
    _sum: { points: true },
    orderBy: { _sum: { points: 'desc' } },
    take: 20
  });
  const users = await prisma.user.findMany({ where: { id: { in: rows.map((row) => row.userId) } } });
  const entries = rows.map((row, index) => {
    const user = users.find((u) => u.id === row.userId);
    return { rank: index + 1, name: user?.firstName || user?.username || `User ${row.userId}`, points: row._sum.points || 0 };
  });
  res.json({ entries });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

async function analyzeAndSaveMeal({ telegramId, photoUrl = null, filePath = null, mimeType = null }) {
  const result = await analyzeFoodPhoto({ filePath, mimeType });
  let meal = null;

  if (telegramId) {
    const user = await prisma.user.findUnique({ where: { telegramId: String(telegramId) } });
    if (user) {
      meal = await prisma.mealEntry.create({
        data: {
          userId: user.id,
          title: result.title,
          ingredients: result.ingredients,
          estimatedWeightGrams: result.estimatedWeightGrams,
          calories: result.calories,
          protein: result.protein,
          fat: result.fat,
          carbs: result.carbs,
          confidence: result.confidence,
          photoUrl
        }
      });
      await prisma.leaderboardEntry.create({ data: { userId: user.id, points: 5, reason: 'meal_logged', period: 'weekly' } });
    }
  }

  return { result, meal };
}

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

function estimateDailyCalories(profile) {
  const weight = Number(profile.weightKg || 70);
  const height = Number(profile.heightCm || 170);
  const age = Number(profile.age || 30);
  const base = 10 * weight + 6.25 * height - 5 * age + 5;
  const activityMap = { low: 1.2, moderate: 1.45, high: 1.7 };
  const goalMap = { lose_weight: -350, maintain: 0, gain_muscle: 250, endurance: 150 };
  const activity = activityMap[profile.activityLevel] || activityMap.moderate;
  const goal = goalMap[profile.goal] || 0;
  return Math.max(1200, Math.round(base * activity + goal));
}

function toIntOrNull(value) {
  if (value === undefined || value === null || value === '') return null;
  return Number.parseInt(value, 10);
}

function toFloatOrNull(value) {
  if (value === undefined || value === null || value === '') return null;
  return Number.parseFloat(value);
}
