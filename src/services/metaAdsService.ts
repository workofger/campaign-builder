import { apiGet, apiPost } from '@/services/apiClient';
import type { CampaignConfig } from '@/types/campaign';

// ---------------------------------------------------------------------------
// Campaign list
// ---------------------------------------------------------------------------

export interface MetaCampaignItem {
  id: string;
  name: string;
  objective: string;
  status: string;
  daily_budget?: string;
  lifetime_budget?: string;
  start_time?: string;
  stop_time?: string;
  created_time: string;
  updated_time: string;
  advantage_state_info?: {
    advantage_state: string;
    advantage_budget_state: string;
    advantage_audience_state: string;
    advantage_placement_state: string;
  };
  special_ad_categories?: string[];
}

export async function fetchMetaCampaigns(): Promise<MetaCampaignItem[]> {
  const res = await apiGet<{ data: MetaCampaignItem[] }>('/api/meta/campaigns');
  return res.data;
}

// ---------------------------------------------------------------------------
// Campaign detail (full hierarchy)
// ---------------------------------------------------------------------------

export interface MetaAdSetDetail {
  id: string;
  name: string;
  status: string;
  daily_budget?: string;
  lifetime_budget?: string;
  start_time?: string;
  end_time?: string;
  billing_event: string;
  optimization_goal: string;
  bid_strategy?: string;
  targeting: Record<string, unknown>;
}

export interface MetaAdDetail {
  id: string;
  name: string;
  status: string;
  creative: {
    id: string;
    name?: string;
    title?: string;
    body?: string;
    image_url?: string;
    thumbnail_url?: string;
    object_story_spec?: Record<string, unknown>;
    asset_feed_spec?: Record<string, unknown>;
  };
}

export interface MetaInsights {
  impressions?: string;
  clicks?: string;
  spend?: string;
  reach?: string;
  ctr?: string;
  cpc?: string;
  cpm?: string;
  actions?: Array<{ action_type: string; value: string }>;
  date_start: string;
  date_stop: string;
}

export interface MetaCampaignFull {
  campaign: MetaCampaignItem;
  adsets: MetaAdSetDetail[];
  ads: MetaAdDetail[];
  insights: MetaInsights | null;
}

export async function fetchCampaignDetail(campaignId: string): Promise<MetaCampaignFull> {
  const res = await apiGet<{ data: MetaCampaignFull }>(`/api/meta/campaigns/${campaignId}`);
  return res.data;
}

// ---------------------------------------------------------------------------
// Campaign actions
// ---------------------------------------------------------------------------

export async function updateMetaCampaign(
  campaignId: string,
  updates: Record<string, unknown>
): Promise<void> {
  await apiPost(`/api/meta/campaigns/${campaignId}/update`, updates);
}

export async function updateMetaAdSet(
  adsetId: string,
  updates: Record<string, unknown>
): Promise<void> {
  await apiPost(`/api/meta/adsets/${adsetId}/update`, updates);
}

export async function duplicateMetaCampaign(
  campaignId: string,
  name?: string
): Promise<{ copied_campaign_id: string }> {
  const res = await apiPost<{ data: { copied_campaign_id: string } }>(
    `/api/meta/campaigns/${campaignId}/duplicate`,
    { name, status: 'PAUSED' }
  );
  return res.data;
}

// ---------------------------------------------------------------------------
// Local campaign actions
// ---------------------------------------------------------------------------

export async function estimateReach(
  campaignId: string
): Promise<{ usersLowerBound: number; usersUpperBound: number }> {
  const res = await apiPost<{ data: { usersLowerBound: number; usersUpperBound: number } }>(
    `/api/campaigns/${campaignId}/estimate`
  );
  return res.data;
}

export async function launchCampaign(
  campaignId: string
): Promise<{ success: boolean; metaCampaignId: string }> {
  return apiPost<{ success: boolean; metaCampaignId: string }>(
    `/api/campaigns/${campaignId}/launch`
  );
}

export function buildMockEstimate(config: CampaignConfig): {
  reach: number;
  impressions: number;
  cpc: number;
} {
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
