// Meta Marketing API SDK Configuration
// Tokens are configured via environment variables

export const META_CONFIG = {
  appId: import.meta.env.VITE_META_APP_ID || '',
  accessToken: import.meta.env.VITE_META_ACCESS_TOKEN || '',
  adAccountId: import.meta.env.VITE_META_AD_ACCOUNT_ID || '',
  apiVersion: 'v21.0',
  baseUrl: 'https://graph.facebook.com',
} as const;

export const GEMINI_CONFIG = {
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
  model: 'gemini-2.0-flash-exp',
  baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
} as const;

export function getMetaApiUrl(endpoint: string): string {
  return `${META_CONFIG.baseUrl}/${META_CONFIG.apiVersion}/${endpoint}`;
}
