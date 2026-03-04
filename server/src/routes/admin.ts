import { Hono } from 'hono';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireRole } from '../middleware/auth.js';
import type { AppEnv } from '../types.js';

const admin = new Hono<AppEnv>();

admin.use('*', requireRole('admin'));

admin.get('/users', async (c) => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, email, full_name, role, avatar_url, created_at')
    .order('created_at', { ascending: false });

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ data });
});

admin.patch('/users/:id/role', async (c) => {
  const targetId = c.req.param('id');
  const { role } = await c.req.json();
  const user = c.get('user');

  if (targetId === user.id) {
    return c.json({ error: 'Cannot change your own role' }, 400);
  }

  if (role !== 'admin' && role !== 'member') {
    return c.json({ error: 'Role must be "admin" or "member"' }, 400);
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({ role })
    .eq('id', targetId)
    .select()
    .single();

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ data });
});

admin.get('/campaigns', async (c) => {
  const { data, error } = await supabaseAdmin
    .from('campaigns')
    .select('*, profiles(email, full_name)')
    .order('created_at', { ascending: false });

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ data });
});

admin.get('/launches', async (c) => {
  const { data, error } = await supabaseAdmin
    .from('campaign_launches')
    .select('*, campaigns(name), profiles(email, full_name)')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ data });
});

export default admin;
