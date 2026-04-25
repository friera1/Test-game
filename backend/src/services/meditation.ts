import type { MeditationRecommendation } from '../../../shared/types.js';

export function recommendMeditation(mode: 'sleep' | 'stress' | 'focus' | 'recovery' = 'stress'): MeditationRecommendation {
  const presets: Record<string, MeditationRecommendation> = {
    sleep: {
      title: 'Wind-down before sleep',
      category: 'sleep',
      durationMin: 10,
      scriptPreview: 'Slow breathing, body scan, softer exhale and release of tension.'
    },
    stress: {
      title: 'Reset after a stressful day',
      category: 'stress',
      durationMin: 7,
      scriptPreview: 'Notice your breath, relax shoulders, observe thoughts without reacting.'
    },
    focus: {
      title: 'Deep focus primer',
      category: 'focus',
      durationMin: 5,
      scriptPreview: 'Anchor attention on breathing and return gently when distracted.'
    },
    recovery: {
      title: 'Recovery and gratitude',
      category: 'recovery',
      durationMin: 8,
      scriptPreview: 'Slow down, scan muscles, appreciate what your body did today.'
    }
  };

  return presets[mode];
}
