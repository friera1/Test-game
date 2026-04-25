import type { UserProfile, WorkoutPlan } from '../../../shared/types.js';

export function buildStarterWorkout(profile: UserProfile): WorkoutPlan {
  const beginner = !profile.activityLevel || profile.activityLevel === 'low';

  return {
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
}
