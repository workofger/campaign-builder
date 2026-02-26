# Campaign Builder 🚀

**AI-guided Meta Ads campaign creation for Partrunner driver recruitment.**

An internal conversational wizard that walks the team through creating Meta Ads campaigns — from objective selection to audience targeting, budget configuration, AI-generated creatives, and launch.

![Screenshot placeholder](https://placehold.co/1200x628/000000/FDD238?text=Campaign+Builder)

## Tech Stack

- **Vite** + **React 18** + **TypeScript** + **Tailwind CSS**
- **Lucide React** for icons
- **date-fns** for date utilities
- Path alias: `@/` → `src/`

## Getting Started

```bash
git clone https://github.com/workofger/campaign-builder.git
cd campaign-builder
npm install
npm run dev
```

## Environment Variables

Create a `.env.local` file:

```env
VITE_META_APP_ID=your_meta_app_id
VITE_META_ACCESS_TOKEN=your_access_token
VITE_META_AD_ACCOUNT_ID=act_your_account_id
VITE_GEMINI_API_KEY=your_gemini_key
```

## Architecture

```
src/
├── components/       # UI components
│   └── steps/        # Wizard step components
├── data/             # Constants, mock data
├── hooks/            # Custom hooks (useWizard, useToast)
├── lib/              # SDK configs (Meta, Gemini)
├── services/         # API services (stubs)
└── types/            # TypeScript types
```

### Wizard Flow

1. **Objective** — Campaign type selection (recruitment, fleet, reactivation, brand)
2. **Audience** — Location, vehicle type, demographics, interests
3. **Budget** — Daily/lifetime budget, dates, bid strategy
4. **Creative** — Ad copy, Gemini AI image generation, ad preview
5. **Review** — Summary, reach estimates, launch/export

### Aurora 🌅

The conversational agent "Aurora" guides users through each step with contextual suggestions and feedback.

## Roadmap

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Wizard UI + conversational flow | ✅ |
| 2 | Meta Marketing API integration | 🔜 |
| 3 | Gemini image generation | 🔜 |
| 4 | Analytics dashboard | 📋 |

## Branding

- **Colors:** `#FDD238` (yellow), `#000000` (black), `#FFFFFF` (white) — exclusively
- **Fonts:** Bebas Neue (titles), Barlow (body)
- **Logo:** Partrunner full color on dark backgrounds

---

Built for [Partrunner](https://partrunner.com) 🟡⬛
