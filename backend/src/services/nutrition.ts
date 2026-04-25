import type { ActivityLevel, Goal, UserProfile, FoodAnalysisResult } from '../../../shared/types.js';

const activityMultiplier: Record<ActivityLevel, number> = {
  low: 1.2,
  moderate: 1.45,
  high: 1.7
};

const goalAdjustment: Record<Goal, number> = {
  lose_weight: -350,
  maintain: 0,
  gain_muscle: 250,
  endurance: 150
};

export function estimateDailyCalories(profile: UserProfile): number {
  const weight = profile.weightKg ?? 70;
  const height = profile.heightCm ?? 170;
  const age = profile.age ?? 30;
  const base = 10 * weight + 6.25 * height - 5 * age + 5;
  const activity = activityMultiplier[profile.activityLevel ?? 'moderate'];
  const adjustment = goalAdjustment[profile.goal ?? 'maintain'];
  return Math.max(1200, Math.round(base * activity + adjustment));
}

export function mockAnalyzeFood(): FoodAnalysisResult {
  return {
    title: 'Chicken rice bowl',
    ingredients: ['chicken breast', 'rice', 'vegetables', 'olive oil'],
    estimatedWeightGrams: 420,
    calories: 610,
    protein: 42,
    fat: 18,
    carbs: 69,
    confidence: 0.76
  };
}
