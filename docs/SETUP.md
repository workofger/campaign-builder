# Campaign Builder — Setup Guide

Everything you need to configure before running the project locally or deploying to production.

---

## 1. Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Git**

---

## 2. Accounts & Credentials

### 2.1 Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. From **Project Settings > API**, copy:
   - **Project URL** → `SUPABASE_URL` / `VITE_SUPABASE_URL`
   - **anon (public) key** → `VITE_SUPABASE_ANON_KEY`
   - **service_role (secret) key** → `SUPABASE_SERVICE_ROLE_KEY` (backend only, never expose in frontend)
3. **Enable Google OAuth:**
   - Go to **Authentication > Providers > Google**.
   - Enable the toggle and paste your Google OAuth **Client ID** and **Client Secret**.
   - See `docs/DEPLOY.md` step 2 for detailed instructions on creating Google OAuth credentials.
4. **Configure Redirect URLs:**
   - In **Authentication > URL Configuration**:
     - **Site URL**: `http://localhost:5173` (or your production URL)
     - **Redirect URLs**: add `http://localhost:5173` and your production URL
5. **Run the SQL migration:**
   - Go to **SQL Editor** in the Supabase dashboard.
   - Paste the contents of `supabase/migrations/001_initial_schema.sql` and execute.
6. **Storage bucket** (already exists for logos):
   - The project already uses the `Imagenes` bucket at `lrzcturtxtzhdzqacefy.supabase.co`.
   - For creative uploads, create a new bucket called `creatives` with public read access.

### 2.2 Meta for Developers

1. Go to [developers.facebook.com](https://developers.facebook.com).
2. Create a **Business App** (type: Business).
3. Add the **Marketing API** product.
4. From **App Dashboard > Settings > Basic**, copy:
   - **App ID** → `META_APP_ID`
5. Create a **System User** in your Business Manager:
   - Go to [business.facebook.com](https://business.facebook.com) > **Settings > System Users**.
   - Create a system user with **Admin** role.
   - Generate a token with these permissions:
     - `ads_management`
     - `ads_read`
     - `business_management`
   - Copy the token → `META_ACCESS_TOKEN`
6. Get your **Ad Account ID**:
   - Go to **Business Settings > Ad Accounts**.
   - Copy the account ID (format: `act_XXXXXXXXX`) → `META_AD_ACCOUNT_ID`

> **Important:** System User tokens are long-lived but can expire. Set a reminder to rotate them before expiration. In production, consider implementing the token refresh flow.

### 2.3 Google AI Studio (Gemini)

1. Go to [aistudio.google.com](https://aistudio.google.com).
2. Click **Get API Key** and create a new key.
3. Copy the key → `GEMINI_API_KEY`

> The project uses the `gemini-2.0-flash-exp` model for image generation. Ensure your API key has access to this model.

### 2.4 Railway

1. Go to [railway.app](https://railway.app) and sign in with GitHub.
2. Create a **New Project** and select the `workofger/campaign-builder` repository.
3. Create **two services** inside the project:
   - **frontend** — Root directory: `/`, Build: `npm run build`, serves `dist/`
   - **api** — Root directory: `/server`, Build: `npm run build`, Start: `npm start`
4. Set environment variables for each service (see section 3 below).
5. Generate a domain for each service (or use a custom domain).

---

## 3. Environment Variables

### 3.1 Frontend (`.env.local`)

Create a `.env.local` file in the project root:

```env
# Supabase (public keys only)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# API Server URL
VITE_API_URL=http://localhost:3001
```

### 3.2 API Server (`server/.env`)

Create a `.env` file inside the `server/` directory:

```env
# Supabase (service role — NEVER expose to frontend)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...

# Meta Marketing API
META_APP_ID=123456789
META_ACCESS_TOKEN=EAAxxxxxxx...
META_AD_ACCOUNT_ID=act_123456789

# Gemini API
GEMINI_API_KEY=AIzaSy...

# Server config
PORT=3001
ALLOWED_ORIGIN=http://localhost:5173
```

### 3.3 Railway Environment Variables

Set these in the Railway dashboard for each service:

**Frontend service:**
| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `VITE_API_URL` | Railway-generated URL for the api service |

**API service:**
| Variable | Value |
|----------|-------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |
| `META_APP_ID` | Meta App ID |
| `META_ACCESS_TOKEN` | Meta System User Token |
| `META_AD_ACCOUNT_ID` | Meta Ad Account ID (`act_XXX`) |
| `GEMINI_API_KEY` | Google AI API key |
| `PORT` | `3001` |
| `ALLOWED_ORIGIN` | Railway-generated URL for the frontend service |

---

## 4. Local Development

```bash
# Clone the repo
git clone https://github.com/workofger/campaign-builder.git
cd campaign-builder

# Install frontend dependencies
npm install

# Install API server dependencies
cd server && npm install && cd ..

# Start both services (in separate terminals)
npm run dev          # Frontend on http://localhost:5173
cd server && npm run dev  # API on http://localhost:3001
```

---

## 5. Database Setup

1. Open the Supabase SQL Editor.
2. Run `supabase/migrations/001_initial_schema.sql`.
3. Verify the tables were created: `profiles`, `campaigns`, `campaign_launches`, `creatives`.
4. Verify RLS policies are active on all tables.
5. Test the trigger: create a user via Supabase Auth — a `profiles` row should appear automatically.

---

## 6. Supabase Storage Setup

For creative image uploads:

1. Go to **Storage** in the Supabase dashboard.
2. Create a new bucket: `creatives`.
3. Set the bucket to **Public** (images need to be accessible in Meta Ads).
4. Add a storage policy allowing authenticated users to upload:
   - **INSERT**: `auth.uid() IS NOT NULL`
   - **SELECT**: public (no policy needed for public buckets)

---

## 7. Security Checklist

- [ ] `SUPABASE_SERVICE_ROLE_KEY` is ONLY in the API server, never in frontend code
- [ ] `META_ACCESS_TOKEN` is ONLY in the API server, never in frontend code
- [ ] `GEMINI_API_KEY` is ONLY in the API server, never in frontend code
- [ ] `.env.local` and `server/.env` are in `.gitignore`
- [ ] RLS is enabled on all Supabase tables
- [ ] Email domain restriction is configured in Supabase Auth
- [ ] CORS `ALLOWED_ORIGIN` matches only the frontend domain
