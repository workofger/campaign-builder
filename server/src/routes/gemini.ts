import { Hono } from 'hono';
import { supabaseAdmin } from '../lib/supabase.js';
import { generateImage, generateMultipleImages } from '../lib/gemini-api.js';
import type { AppEnv } from '../types.js';

const gemini = new Hono<AppEnv>();

gemini.post('/generate', async (c) => {
  const user = c.get('user');
  const { prompt, count = 4, campaignId } = await c.req.json();

  if (!prompt || typeof prompt !== 'string') {
    return c.json({ error: 'prompt is required' }, 400);
  }

  try {
    const images = count === 1
      ? [await generateImage(prompt)]
      : await generateMultipleImages(prompt, Math.min(count, 8));

    if (campaignId) {
      const rows = images.map((img) => ({
        campaign_id: campaignId,
        user_id: user.id,
        image_url: img.url,
        prompt: img.prompt,
        source: 'ai' as const,
      }));

      await supabaseAdmin.from('creatives').insert(rows);
    }

    return c.json({ data: images });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Image generation failed';
    return c.json({ error: message }, 500);
  }
});

gemini.post('/upload', async (c) => {
  const user = c.get('user');
  const body = await c.req.parseBody();
  const file = body.file;

  if (!file || !(file instanceof File)) {
    return c.json({ error: 'file is required' }, 400);
  }

  const ext = file.name.split('.').pop() || 'png';
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

  const buffer = await file.arrayBuffer();

  const { error: uploadError } = await supabaseAdmin.storage
    .from('creatives')
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (uploadError) {
    return c.json({ error: uploadError.message }, 500);
  }

  const { data: urlData } = supabaseAdmin.storage
    .from('creatives')
    .getPublicUrl(path);

  const campaignId = typeof body.campaignId === 'string' ? body.campaignId : null;

  await supabaseAdmin.from('creatives').insert({
    campaign_id: campaignId,
    user_id: user.id,
    image_url: urlData.publicUrl,
    source: 'upload',
  });

  return c.json({ data: { url: urlData.publicUrl, path } }, 201);
});

export default gemini;
