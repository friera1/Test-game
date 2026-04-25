export type Goal = 'lose_weight' | 'maintain' | 'gain_muscle' | 'endurance';
export type ActivityLevel = 'low' | 'moderate' | 'high';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface UserProfile {
  telegramId: string;
  firstName?: string;
  username?: string;
  age?: number;
  heightCm?: number;
  weightKg?: number;
  goal?: Goal;
  activityLevel?: ActivityLevel;
  equipment?: string[];
  restrictions?: string[];
  targetCalories?: number;
}

export interface FoodAnalysisResult {
  title: string;
  ingredients: string[];
  estimatedWeightGrams: number;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  confidence: number;
}

export interface WorkoutExercise {
  name: string;
  sets: number;
  reps: string;
  restSec: number;
  notes?: string;
}

export interface WorkoutPlan {
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  durationMin: number;
  exercises: WorkoutExercise[];
}

export interface MeditationRecommendation {
  title: string;
  category: 'sleep' | 'stress' | 'focus' | 'recovery';
  durationMin: number;
  scriptPreview: string;
}
