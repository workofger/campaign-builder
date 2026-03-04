import { Hono } from 'hono';
import { supabaseAdmin } from '../lib/supabase.js';
import {
  createCampaign,
  createAdSet,
  createAd,
  estimateReach,
  listCampaigns,
  getCampaignDetail,
  updateCampaign,
  updateAdSet,
  duplicateCampaign,
  type CampaignLaunchParams,
} from '../lib/meta-api.js';
import type { AppEnv } from '../types.js';

const meta = new Hono<AppEnv>();

// ---------------------------------------------------------------------------
// Cache for Meta campaign list (avoids hammering the API on every page load)
// ---------------------------------------------------------------------------
let metaCampaignsCache: { data: unknown; timestamp: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

// ---------------------------------------------------------------------------
// GET /api/meta/campaigns — list all campaigns from Meta ad account
// ---------------------------------------------------------------------------
meta.get('/meta/campaigns', async (c) => {
  try {
    if (metaCampaignsCache && Date.now() - metaCampaignsCache.timestamp < CACHE_TTL_MS) {
      return c.json({ data: metaCampaignsCache.data });
    }
    const campaigns = await listCampaigns();
    metaCampaignsCache = { data: campaigns, timestamp: Date.now() };
    return c.json({ data: campaigns });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch Meta campaigns';
    console.error('Meta campaigns error:', message);
    if (metaCampaignsCache) return c.json({ data: metaCampaignsCache.data });
    return c.json({ error: message }, 500);
  }
});

// ---------------------------------------------------------------------------
// GET /api/meta/campaigns/:id — full detail (campaign + adsets + ads + insights)
// ---------------------------------------------------------------------------
meta.get('/meta/campaigns/:id', async (c) => {
  const campaignId = c.req.param('id');
  try {
    const detail = await getCampaignDetail(campaignId);
    return c.json({ data: detail });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch campaign detail';
    return c.json({ error: message }, 500);
  }
});

// ---------------------------------------------------------------------------
// POST /api/meta/campaigns/:id/update — update campaign fields
// ---------------------------------------------------------------------------
meta.post('/meta/campaigns/:id/update', async (c) => {
  const campaignId = c.req.param('id');
  const updates = await c.req.json();
  try {
    const result = await updateCampaign(campaignId, updates);
    metaCampaignsCache = null;
    return c.json({ data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update campaign';
    return c.json({ error: message }, 500);
  }
});

// ---------------------------------------------------------------------------
// POST /api/meta/adsets/:id/update — update ad set fields
// ---------------------------------------------------------------------------
meta.post('/meta/adsets/:id/update', async (c) => {
  const adsetId = c.req.param('id');
  const updates = await c.req.json();
  try {
    const result = await updateAdSet(adsetId, updates);
    return c.json({ data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update ad set';
    return c.json({ error: message }, 500);
  }
});

// ---------------------------------------------------------------------------
// POST /api/meta/campaigns/:id/duplicate — relaunch / copy campaign
// ---------------------------------------------------------------------------
meta.post('/meta/campaigns/:id/duplicate', async (c) => {
  const campaignId = c.req.param('id');
  const { name, status } = await c.req.json();
  try {
    const result = await duplicateCampaign(campaignId, { name, status });
    metaCampaignsCache = null;
    return c.json({ data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to duplicate campaign';
    return c.json({ error: message }, 500);
  }
});

// ---------------------------------------------------------------------------
// POST /api/campaigns/:id/launch — launch a local campaign to Meta
// ---------------------------------------------------------------------------
meta.post('/campaigns/:id/launch', async (c) => {
  const user = c.get('user');
  const campaignId = c.req.param('id');

  const { data: campaign, error: fetchError } = await supabaseAdmin
    .from('campaigns')
    .select('*')
    .eq('id', campaignId)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !campaign) {
    return c.json({ error: 'Campaign not found' }, 404);
  }

  const config = campaign.config as Record<string, unknown>;
  const audience = config.audience as Record<string, unknown>;
  const budget = config.budget as Record<string, unknown>;
  const creative = config.creative as Record<string, unknown>;

  const useAdvantage = (config.useAdvantage as boolean) ?? true;

  const params: CampaignLaunchParams = {
    name: campaign.name,
    objectiveType: campaign.objective_type,
    useAdvantage,
    budgetType: (budget.type as string) === 'lifetime' ? 'lifetime' : 'daily',
    budgetAmount: budget.amount as number,
    startDate: budget.startDate as string,
    endDate: budget.endDate as string,
    bidStrategy: (budget.bidStrategy as string) || 'LOWEST_COST_WITHOUT_CAP',
    audience: {
      locations: (audience.locations as string[]) || [],
      vehicleTypes: (audience.vehicleTypes as string[]) || [],
      ageMin: (audience.ageRange as number[])?.[0] ?? 21,
      ageMax: (audience.ageRange as number[])?.[1] ?? 55,
      gender: (audience.gender as string) || 'all',
      interests: (audience.interests as string[]) || [],
      useAdvantageAudience: useAdvantage,
    },
    creative: {
      headline: (creative.headline as string) || '',
      primaryText: (creative.primaryText as string) || '',
      description: (creative.description as string) || '',
      cta: (creative.cta as string) || 'APPLY_NOW',
      imageUrl: (creative.selectedImage as string) || '',
    },
  };

  await supabaseAdmin
    .from('campaigns')
    .update({ status: 'launching' })
    .eq('id', campaignId);

  try {
    const metaCampaign = await createCampaign(params);
    const metaAdSet = await createAdSet(metaCampaign.id, params);
    const metaAd = await createAd(metaAdSet.id, params);

    await supabaseAdmin
      .from('campaigns')
      .update({
        status: 'active',
        meta_campaign_id: metaCampaign.id,
        meta_adset_id: metaAdSet.id,
        meta_ad_id: metaAd.id,
        launched_at: new Date().toISOString(),
      })
      .eq('id', campaignId);

    await supabaseAdmin.from('campaign_launches').insert({
      campaign_id: campaignId,
      user_id: user.id,
      status: 'success',
      meta_response: { campaign: metaCampaign, adSet: metaAdSet, ad: metaAd },
    });

    metaCampaignsCache = null;

    return c.json({
      success: true,
      metaCampaignId: metaCampaign.id,
      metaAdSetId: metaAdSet.id,
      metaAdId: metaAd.id,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';

    await supabaseAdmin
      .from('campaigns')
      .update({ status: 'error' })
      .eq('id', campaignId);

    await supabaseAdmin.from('campaign_launches').insert({
      campaign_id: campaignId,
      user_id: user.id,
      status: 'error',
      error_message: message,
    });

    return c.json({ error: message }, 500);
  }
});

// ---------------------------------------------------------------------------
// POST /api/campaigns/:id/estimate — reach estimate
// ---------------------------------------------------------------------------
meta.post('/campaigns/:id/estimate', async (c) => {
  const user = c.get('user');
  const campaignId = c.req.param('id');

  const { data: campaign, error: fetchError } = await supabaseAdmin
    .from('campaigns')
    .select('*')
    .eq('id', campaignId)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !campaign) {
    return c.json({ error: 'Campaign not found' }, 404);
  }

  const config = campaign.config as Record<string, unknown>;
  const audience = config.audience as Record<string, unknown>;
  const budget = config.budget as Record<string, unknown>;
  const useAdvantage = (config.useAdvantage as boolean) ?? true;

  try {
    const estimate = await estimateReach({
      name: campaign.name,
      objectiveType: campaign.objective_type,
      useAdvantage,
      budgetType: (budget.type as string) === 'lifetime' ? 'lifetime' : 'daily',
      budgetAmount: budget.amount as number,
      startDate: budget.startDate as string,
      endDate: budget.endDate as string,
      bidStrategy: (budget.bidStrategy as string) || 'LOWEST_COST_WITHOUT_CAP',
      audience: {
        locations: (audience.locations as string[]) || [],
        vehicleTypes: (audience.vehicleTypes as string[]) || [],
        ageMin: (audience.ageRange as number[])?.[0] ?? 21,
        ageMax: (audience.ageRange as number[])?.[1] ?? 55,
        gender: (audience.gender as string) || 'all',
        interests: (audience.interests as string[]) || [],
        useAdvantageAudience: useAdvantage,
      },
      creative: { headline: '', primaryText: '', description: '', cta: '', imageUrl: '' },
    });

    return c.json({ data: estimate });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: message }, 500);
  }
});

export default meta;
