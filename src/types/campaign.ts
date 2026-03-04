export type CampaignObjectiveType =
  | 'driver_recruitment'
  | 'fleet_acquisition'
  | 'reactivation'
  | 'brand_awareness';

export interface CampaignObjective {
  type: CampaignObjectiveType;
  label: string;
  description: string;
  icon: string;
  recommendedBudget: number;
  recommendedDuration: number;
}

export interface AudienceTarget {
  locations: string[];
  vehicleTypes: string[];
  ageRange: [number, number];
  gender: 'all' | 'male' | 'female';
  interests: string[];
  customAudienceFile?: string;
}

export type BudgetType = 'daily' | 'lifetime';
export type BidStrategy = 'lowest_cost' | 'cost_cap' | 'bid_cap';

export interface BudgetConfig {
  type: BudgetType;
  amount: number;
  startDate: string;
  endDate: string;
  bidStrategy: BidStrategy;
  bidAmount?: number;
}

export type AdFormat = 'single_image' | 'carousel' | 'video';
export type CTAType = 'apply_now' | 'learn_more' | 'sign_up' | 'contact_us' | 'send_whatsapp';

export interface AdCreative {
  headline: string;
  primaryText: string;
  description: string;
  cta: CTAType;
  format: AdFormat;
  images: string[];
  selectedImage?: string;
}

export interface CampaignConfig {
  id: string;
  name: string;
  objective: CampaignObjective | null;
  audience: AudienceTarget;
  budget: BudgetConfig;
  creative: AdCreative;
  useAdvantage: boolean;
  status: 'draft' | 'review' | 'launched';
  createdAt: string;
  updatedAt: string;
}

export type WizardStep = 'objective' | 'audience' | 'budget' | 'creative' | 'review';

export interface WizardState {
  currentStep: WizardStep;
  config: CampaignConfig;
  completedSteps: WizardStep[];
}

export interface ChatMessage {
  id: string;
  role: 'aurora' | 'user';
  content: string;
  timestamp: string;
  component?: string;
}

// Meta API types
export interface MetaApiResponse<T> {
  data: T;
  paging?: { cursors: { before: string; after: string }; next?: string };
  error?: { message: string; type: string; code: number };
}

export interface MetaCampaign {
  id: string;
  name: string;
  objective: string;
  status: string;
  daily_budget?: string;
  lifetime_budget?: string;
}

export interface MetaAdSet {
  id: string;
  name: string;
  campaign_id: string;
  targeting: Record<string, unknown>;
  bid_strategy: string;
  daily_budget?: string;
}

export interface MetaAd {
  id: string;
  name: string;
  adset_id: string;
  creative: { id: string };
  status: string;
}

export interface MetaAudience {
  id: string;
  name: string;
  approximate_count: number;
  data_source: { type: string };
}
