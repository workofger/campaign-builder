// Gemini Image Generation Service — Stub implementation
// TODO: Replace with real Gemini API calls when VITE_GEMINI_API_KEY is set

import type { CampaignConfig } from '@/types/campaign';

const PLACEHOLDER_IMAGES = [
  'https://placehold.co/1200x628/FDD238/000000?text=Campaña+Partrunner',
  'https://placehold.co/1200x628/000000/FDD238?text=Únete+como+Conductor',
  'https://placehold.co/1200x628/FDD238/000000?text=Gana+Más+con+Partrunner',
  'https://placehold.co/1200x628/000000/FFFFFF?text=Tu+Vehículo+Tu+Negocio',
];

export function buildImagePrompt(config: CampaignConfig): string {
  const vehicleMap: Record<string, string> = {
    Moto: 'motorcycle delivery rider',
    Sedan: 'sedan car driver',
    Van: 'delivery van driver',
    Camión: 'truck driver',
    Rabón: 'medium truck driver',
    Tortón: 'heavy truck driver',
    Tráiler: 'trailer truck driver',
  };

  const vehicles = config.audience.vehicleTypes
    .map(v => vehicleMap[v] || v)
    .join(', ');

  const cities = config.audience.locations.slice(0, 3).join(', ');

  const objectiveMap: Record<string, string> = {
    driver_recruitment: 'recruiting new drivers, showing opportunity and earnings',
    fleet_acquisition: 'fleet partnership, professional logistics',
    reactivation: 'welcoming back drivers, second chance',
    brand_awareness: 'brand recognition, modern logistics company',
  };

  const objective = config.objective?.type
    ? objectiveMap[config.objective.type]
    : 'driver recruitment';

  return [
    `Create a professional ad image for Partrunner, a Mexican logistics company.`,
    `Theme: ${objective}.`,
    vehicles ? `Featuring: ${vehicles}.` : '',
    cities ? `Location context: ${cities}, Mexico.` : '',
    `Brand colors: yellow (#FDD238) and black (#000000).`,
    `Style: modern, professional, aspirational. Show real people working.`,
    `The image should be 1200x628 pixels, suitable for Facebook/Instagram ads.`,
    `Do NOT include any text or logos in the image.`,
  ].filter(Boolean).join(' ');
}

export async function generateCampaignImage(
  prompt: string,
  _style?: string
): Promise<{ url: string; prompt: string }> {
  // TODO: Call Gemini API with prompt
  // POST to https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent
  // with image generation parameters

  await new Promise(r => setTimeout(r, 2000));

  const randomImage = PLACEHOLDER_IMAGES[Math.floor(Math.random() * PLACEHOLDER_IMAGES.length)];

  return {
    url: randomImage,
    prompt,
  };
}

export async function generateMultipleImages(
  config: CampaignConfig,
  count: number = 4
): Promise<Array<{ url: string; prompt: string }>> {
  const basePrompt = buildImagePrompt(config);
  const results: Array<{ url: string; prompt: string }> = [];

  for (let i = 0; i < count; i++) {
    const result = await generateCampaignImage(basePrompt);
    result.url = PLACEHOLDER_IMAGES[i % PLACEHOLDER_IMAGES.length];
    results.push(result);
  }

  return results;
}
