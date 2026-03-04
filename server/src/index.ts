import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { authMiddleware } from './middleware/auth.js';
import campaigns from './routes/campaigns.js';
import meta from './routes/meta.js';
import gemini from './routes/gemini.js';
import admin from './routes/admin.js';
import type { AppEnv } from './types.js';

const app = new Hono<AppEnv>();

const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';

app.use('*', logger());
app.use(
  '/api/*',
  cors({
    origin: allowedOrigin,
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use('/api/*', authMiddleware);

app.route('/api/campaigns', campaigns);
app.route('/api', meta);
app.route('/api/creatives', gemini);
app.route('/api/admin', admin);

const port = Number(process.env.PORT) || 3001;

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Campaign Builder API running on http://localhost:${info.port}`);
});
