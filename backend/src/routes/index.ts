import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { estimateDailyCalories, mockAnalyzeFood } from '../services/nutrition.js';
import { buildStarterWorkout } from '../services/workouts.js';
import { recommendMeditation } from '../services/meditation.js';

export async function registerRoutes(app: FastifyInstance) {
  app.get('/health', async () => ({ ok: true }));

  app.get('/api/profile/demo', async () => {
    const profile = {
      telegramId: '123456789',
      firstName: 'Demo',
      goal: 'lose_weight',
      activityLevel: 'moderate',
      age: 29,
      heightCm: 175,
      weightKg: 82
    } as const;

    return {
      profile,
      targetCalories: estimateDailyCalories(profile)
    };
  });

  app.post('/api/nutrition/analyze-photo', async () => {
    return {
      result: mockAnalyzeFood(),
      note: 'This is a starter mock. Replace with vision pipeline and editable portion controls.'
    };
  });

  app.post('/api/workouts/generate', async (request) => {
    const schema = z.object({
      activityLevel: z.enum(['low', 'moderate', 'high']).optional(),
      age: z.number().optional(),
      heightCm: z.number().optional(),
      weightKg: z.number().optional(),
      goal: z.enum(['lose_weight', 'maintain', 'gain_muscle', 'endurance']).optional()
    });

    const body = schema.parse(request.body ?? {});
    return { workout: buildStarterWorkout({ telegramId: 'demo', ...body }) };
  });

  app.get('/api/meditations/recommend', async () => {
    return { meditation: recommendMeditation('stress') };
  });

  app.get('/api/leaderboard', async () => {
    return {
      entries: [
        { rank: 1, name: 'Alex', points: 420 },
        { rank: 2, name: 'Mira', points: 390 },
        { rank: 3, name: 'You', points: 360 }
      ]
    };
  });
}
