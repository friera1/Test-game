import fs from 'fs/promises';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const VISION_MODEL = process.env.VISION_MODEL || 'gpt-4.1-mini';

export async function analyzeFoodPhoto({ filePath, mimeType }) {
  if (!OPENAI_API_KEY || !filePath) {
    return mockFoodVisionAnalysis();
  }

  try {
    const fileBuffer = await fs.readFile(filePath);
    const base64Image = fileBuffer.toString('base64');
    const imageUrl = `data:${mimeType};base64,${base64Image}`;

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: VISION_MODEL,
        input: [
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: [
                  'Analyze this meal photo for a fitness nutrition app.',
                  'Return ONLY valid JSON with this exact shape:',
                  '{',
                  '  "title": string,',
                  '  "ingredients": string[],',
                  '  "estimatedWeightGrams": number,',
                  '  "calories": number,',
                  '  "protein": number,',
                  '  "fat": number,',
                  '  "carbs": number,',
                  '  "confidence": number',
                  '}',
                  'Use approximate values. If unsure, make conservative estimates.'
                ].join('\n')
              },
              {
                type: 'input_image',
                image_url: imageUrl,
                detail: 'low'
              }
            ]
          }
        ],
        text: {
          format: {
            type: 'json_object'
          }
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Vision API error:', errorText);
      return mockFoodVisionAnalysis();
    }

    const data = await response.json();
    const outputText = data.output_text || extractOutputText(data);
    const parsed = JSON.parse(outputText);
    return normalizeFoodAnalysis(parsed);
  } catch (error) {
    console.error('Food vision fallback:', error);
    return mockFoodVisionAnalysis();
  }
}

export function mockFoodVisionAnalysis() {
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

function extractOutputText(data) {
  const output = data.output || [];
  for (const item of output) {
    for (const content of item.content || []) {
      if (content.type === 'output_text' && content.text) return content.text;
    }
  }
  throw new Error('No output_text found in vision response');
}

function normalizeFoodAnalysis(value) {
  return {
    title: String(value.title || 'Unknown meal'),
    ingredients: Array.isArray(value.ingredients) ? value.ingredients.map(String) : [],
    estimatedWeightGrams: toNumber(value.estimatedWeightGrams, 0),
    calories: Math.round(toNumber(value.calories, 0)),
    protein: toNumber(value.protein, 0),
    fat: toNumber(value.fat, 0),
    carbs: toNumber(value.carbs, 0),
    confidence: Math.max(0, Math.min(1, toNumber(value.confidence, 0.5)))
  };
}

function toNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}
