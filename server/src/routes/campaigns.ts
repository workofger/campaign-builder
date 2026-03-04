import { Hono } from 'hono';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireRole } from '../middleware/auth.js';
import type { AppEnv } from '../types.js';

const campaigns = new Hono<AppEnv>();

campaigns.get('/', async (c) => {
  const user = c.get('user');

  const query = supabaseAdmin
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false });

  if (user.role !== 'admin') {
    query.eq('user_id', user.id);
  }

  const { data, error } = await query;

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ data });
});

campaigns.get('/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  const { data, error } = await supabaseAdmin
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) return c.json({ error: error.message }, 404);
  return c.json({ data });
});

campaigns.post('/', async (c) => {
  const user = c.get('user');
  const body = await c.req.json();

  const { data, error } = await supabaseAdmin
    .from('campaigns')
    .insert({
      user_id: user.id,
      name: body.name,
      objective_type: body.objectiveType,
      objective_label: body.objectiveLabel,
      config: body.config,
      status: body.status || 'draft',
    })
    .select()
    .single();

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ data }, 201);
});

campaigns.patch('/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const body = await c.req.json();

  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.status !== undefined) updates.status = body.status;
  if (body.config !== undefined) updates.config = body.config;
  if (body.objectiveType !== undefined) updates.objective_type = body.objectiveType;
  if (body.objectiveLabel !== undefined) updates.objective_label = body.objectiveLabel;
  if (body.metaCampaignId !== undefined) updates.meta_campaign_id = body.metaCampaignId;
  if (body.metaAdsetId !== undefined) updates.meta_adset_id = body.metaAdsetId;
  if (body.metaAdId !== undefined) updates.meta_ad_id = body.metaAdId;
  if (body.launchedAt !== undefined) updates.launched_at = body.launchedAt;

  const { data, error } = await supabaseAdmin
    .from('campaigns')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ data });
});

export default campaigns;
