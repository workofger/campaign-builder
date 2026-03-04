import { apiPost, apiUpload } from '@/services/apiClient';
import type { CampaignConfig } from '@/types/campaign';

interface GeneratedImage {
  url: string;
  prompt: string;
}

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
    .map((v) => vehicleMap[v] || v)
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
  ]
    .filter(Boolean)
    .join(' ');
}

export async function generateMultipleImages(
  config: CampaignConfig,
  count: number = 4,
  customPrompt?: string
): Promise<GeneratedImage[]> {
  const prompt = customPrompt || buildImagePrompt(config);
  const res = await apiPost<{ data: GeneratedImage[] }>('/api/creatives/generate', {
    prompt,
    count,
    campaignId: config.id,
  });
  return res.data;
}

export async function uploadImage(file: File, campaignId?: string): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('file', file);
  if (campaignId) formData.append('campaignId', campaignId);

  const res = await apiUpload<{ data: { url: string } }>('/api/creatives/upload', formData);
  return res.data;
}
