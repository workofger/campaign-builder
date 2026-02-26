// Meta Marketing API Service — Stub implementation
// TODO: Replace mock data with real Meta Marketing API v21.0 calls

import type { MetaCampaign, MetaAdSet, MetaAd, MetaAudience, MetaApiResponse, CampaignConfig } from '@/types/campaign';

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function createCampaign(config: CampaignConfig): Promise<MetaApiResponse<MetaCampaign>> {
  // TODO: POST to /{ad_account_id}/campaigns
  await delay(1500);
  return {
    data: {
      id: `camp_${Date.now()}`,
      name: config.name,
      objective: config.objective?.type || 'OUTCOME_LEADS',
      status: 'PAUSED',
      daily_budget: config.budget.type === 'daily' ? String(config.budget.amount * 100) : undefined,
      lifetime_budget: config.budget.type === 'lifetime' ? String(config.budget.amount * 100) : undefined,
    }
  };
}

export async function createAdSet(campaignId: string, config: CampaignConfig): Promise<MetaApiResponse<MetaAdSet>> {
  // TODO: POST to /{ad_account_id}/adsets
  await delay(1000);
  return {
    data: {
      id: `adset_${Date.now()}`,
      name: `${config.name} - Ad Set`,
      campaign_id: campaignId,
      targeting: {
        geo_locations: { cities: config.audience.locations },
        age_min: config.audience.ageRange[0],
        age_max: config.audience.ageRange[1],
        interests: config.audience.interests,
      },
      bid_strategy: config.budget.bidStrategy.toUpperCase(),
    }
  };
}

export async function createAd(adSetId: string, config: CampaignConfig): Promise<MetaApiResponse<MetaAd>> {
  // TODO: POST to /{ad_account_id}/ads
  await delay(1000);
  return {
    data: {
      id: `ad_${Date.now()}`,
      name: `${config.name} - Ad`,
      adset_id: adSetId,
      creative: { id: `cr_${Date.now()}` },
      status: 'PAUSED',
    }
  };
}

export async function createCustomAudience(name: string, description: string): Promise<MetaApiResponse<MetaAudience>> {
  // TODO: POST to /{ad_account_id}/customaudiences
  await delay(800);
  return {
    data: {
      id: `aud_${Date.now()}`,
      name,
      approximate_count: Math.floor(Math.random() * 50000) + 10000,
      data_source: { type: 'FILE_IMPORTED' },
    }
  };
}

export async function estimateReach(config: CampaignConfig): Promise<{ reach: number; impressions: number; cpc: number }> {
  // TODO: GET from /{ad_account_id}/reachestimate
  await delay(600);
  const base = config.audience.locations.length * 15000;
  const vehicleMultiplier = config.audience.vehicleTypes.length * 0.3 + 0.4;
  const budgetMultiplier = config.budget.amount / 500;
  const reach = Math.floor(base * vehicleMultiplier * budgetMultiplier);
  return {
    reach,
    impressions: Math.floor(reach * 3.2),
    cpc: +(Math.random() * 5 + 2).toFixed(2),
  };
}

export async function launchCampaign(config: CampaignConfig): Promise<{ success: boolean; campaignId: string }> {
  const campaignRes = await createCampaign(config);
  const adSetRes = await createAdSet(campaignRes.data.id, config);
  await createAd(adSetRes.data.id, config);
  return { success: true, campaignId: campaignRes.data.id };
}
