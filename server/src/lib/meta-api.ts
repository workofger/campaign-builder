const API_VERSION = 'v21.0';
const BASE_URL = 'https://graph.facebook.com';

function getConfig() {
  const accessToken = process.env.META_ACCESS_TOKEN;
  const adAccountId = process.env.META_AD_ACCOUNT_ID;
  if (!accessToken || !adAccountId) {
    throw new Error('Missing META_ACCESS_TOKEN or META_AD_ACCOUNT_ID');
  }
  return { accessToken, adAccountId };
}

function apiUrl(endpoint: string): string {
  return `${BASE_URL}/${API_VERSION}/${endpoint}`;
}

interface MetaErrorResponse {
  error?: { message: string; type: string; code: number };
}

async function metaFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const { accessToken } = getConfig();

  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    ...((options.headers as Record<string, string>) || {}),
  };

  if (options.method === 'POST' || options.method === 'PATCH') {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, { ...options, headers });
  const data = (await res.json()) as T & MetaErrorResponse;

  if (!res.ok || data.error) {
    const msg = data.error?.message || `Meta API error: ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MetaCampaignListItem {
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
  targeting_optimization?: string;
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
  campaign: MetaCampaignListItem;
  adsets: MetaAdSetDetail[];
  ads: MetaAdDetail[];
  insights: MetaInsights | null;
}

export interface MetaReachEstimate {
  data: {
    users_lower_bound: number;
    users_upper_bound: number;
  };
}

export interface CampaignLaunchParams {
  name: string;
  objectiveType: string;
  useAdvantage: boolean;
  budgetType: 'daily' | 'lifetime';
  budgetAmount: number;
  startDate: string;
  endDate: string;
  bidStrategy: string;
  audience: {
    locations: string[];
    vehicleTypes: string[];
    ageMin: number;
    ageMax: number;
    gender: string;
    interests: string[];
    useAdvantageAudience: boolean;
  };
  creative: {
    headline: string;
    primaryText: string;
    description: string;
    cta: string;
    imageUrl: string;
    linkUrl?: string;
  };
}

// ---------------------------------------------------------------------------
// Objective mapping
// ---------------------------------------------------------------------------

const OBJECTIVE_MAP: Record<string, string> = {
  driver_recruitment: 'OUTCOME_LEADS',
  fleet_acquisition: 'OUTCOME_LEADS',
  reactivation: 'OUTCOME_ENGAGEMENT',
  brand_awareness: 'OUTCOME_AWARENESS',
};

// ---------------------------------------------------------------------------
// List campaigns
// ---------------------------------------------------------------------------

export async function listCampaigns(limit = 50): Promise<MetaCampaignListItem[]> {
  const { adAccountId } = getConfig();
  const fields = [
    'id', 'name', 'objective', 'status',
    'daily_budget', 'lifetime_budget',
    'start_time', 'stop_time',
    'created_time', 'updated_time',
    'advantage_state_info',
    'special_ad_categories',
  ].join(',');
  const url = apiUrl(`${adAccountId}/campaigns?fields=${fields}&limit=${limit}`);
  const res = await metaFetch<{ data: MetaCampaignListItem[] }>(url);
  return res.data || [];
}

// ---------------------------------------------------------------------------
// Full campaign detail (campaign → adsets → ads → insights)
// ---------------------------------------------------------------------------

export async function getCampaignDetail(campaignId: string): Promise<MetaCampaignFull> {
  const campaignFields = [
    'id', 'name', 'objective', 'status',
    'daily_budget', 'lifetime_budget',
    'start_time', 'stop_time',
    'created_time', 'updated_time',
    'advantage_state_info', 'special_ad_categories',
  ].join(',');

  const adsetFields = [
    'id', 'name', 'status',
    'daily_budget', 'lifetime_budget',
    'start_time', 'end_time',
    'billing_event', 'optimization_goal',
    'bid_strategy', 'targeting', 'targeting_optimization',
  ].join(',');

  const adFields = [
    'id', 'name', 'status',
    'creative{id,name,title,body,image_url,thumbnail_url,object_story_spec,asset_feed_spec}',
  ].join(',');

  const insightFields = [
    'impressions', 'clicks', 'spend', 'reach',
    'ctr', 'cpc', 'cpm', 'actions',
    'date_start', 'date_stop',
  ].join(',');

  const [campaign, adsetsRes, adsRes, insightsRes] = await Promise.all([
    metaFetch<MetaCampaignListItem>(apiUrl(`${campaignId}?fields=${campaignFields}`)),
    metaFetch<{ data: MetaAdSetDetail[] }>(apiUrl(`${campaignId}/adsets?fields=${adsetFields}&limit=50`)),
    metaFetch<{ data: MetaAdDetail[] }>(apiUrl(`${campaignId}/ads?fields=${adFields}&limit=100`)),
    metaFetch<{ data: MetaInsights[] }>(
      apiUrl(`${campaignId}/insights?fields=${insightFields}&date_preset=maximum`)
    ).catch(() => ({ data: [] })),
  ]);

  return {
    campaign,
    adsets: adsetsRes.data || [],
    ads: adsRes.data || [],
    insights: insightsRes.data?.[0] || null,
  };
}

// ---------------------------------------------------------------------------
// Create Advantage+ campaign
// ---------------------------------------------------------------------------

export async function createCampaign(params: CampaignLaunchParams): Promise<{ id: string }> {
  const { adAccountId } = getConfig();

  const budgetField = params.budgetType === 'daily' ? 'daily_budget' : 'lifetime_budget';
  const budgetCentavos = Math.round(params.budgetAmount * 100);

  const body: Record<string, unknown> = {
    name: params.name,
    objective: OBJECTIVE_MAP[params.objectiveType] || 'OUTCOME_LEADS',
    status: 'PAUSED',
    special_ad_categories: ['EMPLOYMENT'],
    [budgetField]: budgetCentavos,
    bid_strategy: params.bidStrategy?.toUpperCase() || 'LOWEST_COST_WITHOUT_CAP',
  };

  return metaFetch<{ id: string }>(apiUrl(`${adAccountId}/campaigns`), {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// ---------------------------------------------------------------------------
// Create ad set (with Advantage+ audience & placement support)
// ---------------------------------------------------------------------------

export async function createAdSet(
  campaignId: string,
  params: CampaignLaunchParams
): Promise<{ id: string }> {
  const { adAccountId } = getConfig();

  const targeting: Record<string, unknown> = {
    geo_locations: {
      regions: params.audience.locations.map((loc) => ({ name: loc, country: 'MX' })),
    },
  };

  if (params.audience.useAdvantageAudience || params.useAdvantage) {
    targeting.targeting_automation = { advantage_audience: 1 };
    targeting.age_min = Math.max(18, Math.min(params.audience.ageMin, 25));
    targeting.age_max = 65;
  } else {
    targeting.age_min = params.audience.ageMin;
    targeting.age_max = params.audience.ageMax;

    if (params.audience.gender !== 'all') {
      targeting.genders = [params.audience.gender === 'male' ? 1 : 2];
    }

    if (params.audience.interests.length > 0) {
      targeting.flexible_spec = [
        { interests: params.audience.interests.map((i) => ({ name: i })) },
      ];
    }
  }

  const body: Record<string, unknown> = {
    name: `${params.name} - Ad Set`,
    campaign_id: campaignId,
    status: 'PAUSED',
    targeting,
    start_time: params.startDate,
    end_time: params.endDate,
    billing_event: 'IMPRESSIONS',
    optimization_goal: 'LEAD_GENERATION',
  };

  return metaFetch<{ id: string }>(apiUrl(`${adAccountId}/adsets`), {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// ---------------------------------------------------------------------------
// Create ad with creative
// ---------------------------------------------------------------------------

export async function createAd(
  adSetId: string,
  params: CampaignLaunchParams
): Promise<{ id: string }> {
  const { adAccountId } = getConfig();

  const creativePayload = {
    name: `${params.name} - Creative`,
    object_story_spec: {
      link_data: {
        message: params.creative.primaryText,
        link: params.creative.linkUrl || 'https://partrunner.com',
        name: params.creative.headline,
        description: params.creative.description,
        call_to_action: { type: params.creative.cta.toUpperCase() },
        image_url: params.creative.imageUrl,
      },
    },
  };

  const creativeRes = await metaFetch<{ id: string }>(apiUrl(`${adAccountId}/adcreatives`), {
    method: 'POST',
    body: JSON.stringify(creativePayload),
  });

  return metaFetch<{ id: string }>(apiUrl(`${adAccountId}/ads`), {
    method: 'POST',
    body: JSON.stringify({
      name: `${params.name} - Ad`,
      adset_id: adSetId,
      creative: { creative_id: creativeRes.id },
      status: 'PAUSED',
    }),
  });
}

// ---------------------------------------------------------------------------
// Update campaign / adset / ad
// ---------------------------------------------------------------------------

export async function updateCampaign(
  campaignId: string,
  updates: Record<string, unknown>
): Promise<{ success: boolean }> {
  return metaFetch<{ success: boolean }>(apiUrl(campaignId), {
    method: 'POST',
    body: JSON.stringify(updates),
  });
}

export async function updateAdSet(
  adsetId: string,
  updates: Record<string, unknown>
): Promise<{ success: boolean }> {
  return metaFetch<{ success: boolean }>(apiUrl(adsetId), {
    method: 'POST',
    body: JSON.stringify(updates),
  });
}

export async function updateAd(
  adId: string,
  updates: Record<string, unknown>
): Promise<{ success: boolean }> {
  return metaFetch<{ success: boolean }>(apiUrl(adId), {
    method: 'POST',
    body: JSON.stringify(updates),
  });
}

// ---------------------------------------------------------------------------
// Duplicate (relaunch) a campaign
// ---------------------------------------------------------------------------

export async function duplicateCampaign(
  campaignId: string,
  overrides?: { name?: string; status?: string }
): Promise<{ copied_campaign_id: string }> {
  const body: Record<string, unknown> = {};
  if (overrides?.name) body.rename = { name: overrides.name };
  if (overrides?.status) body.status_option = overrides.status;

  return metaFetch<{ copied_campaign_id: string }>(apiUrl(`${campaignId}/copies`), {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// ---------------------------------------------------------------------------
// Reach estimate
// ---------------------------------------------------------------------------

export async function estimateReach(params: CampaignLaunchParams): Promise<{
  usersLowerBound: number;
  usersUpperBound: number;
}> {
  const { adAccountId } = getConfig();

  const targeting: Record<string, unknown> = {
    age_min: params.audience.ageMin,
    age_max: params.audience.ageMax,
    geo_locations: {
      regions: params.audience.locations.map((loc) => ({ name: loc, country: 'MX' })),
    },
  };

  if (params.audience.useAdvantageAudience) {
    targeting.targeting_automation = { advantage_audience: 1 };
  }

  const targetingSpec = encodeURIComponent(JSON.stringify(targeting));
  const url = apiUrl(`${adAccountId}/reachestimate?targeting_spec=${targetingSpec}`);
  const res = await metaFetch<MetaReachEstimate>(url);

  return {
    usersLowerBound: res.data.users_lower_bound,
    usersUpperBound: res.data.users_upper_bound,
  };
}
