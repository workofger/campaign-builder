import { useState, useCallback } from 'react';
import type { WizardStep, WizardState, CampaignConfig } from '@/types/campaign';
import { createDefaultConfig, WIZARD_STEPS } from '@/data/constants';

const STEP_ORDER: WizardStep[] = WIZARD_STEPS.map((s) => s.key);
const DRAFT_KEY = 'campaign-builder-draft';

function loadDraft(): CampaignConfig | null {
  try {
    const saved = sessionStorage.getItem(DRAFT_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function saveDraft(config: CampaignConfig) {
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(config));
  } catch { /* noop */ }
}

function clearDraft() {
  sessionStorage.removeItem(DRAFT_KEY);
}

export function useWizard() {
  const [state, setState] = useState<WizardState>(() => {
    const draft = loadDraft();
    return {
      currentStep: draft ? 'objective' : 'objective',
      config: draft || createDefaultConfig(),
      completedSteps: [],
    };
  });

  const updateConfig = useCallback((updates: Partial<CampaignConfig>) => {
    setState((prev) => {
      const config = { ...prev.config, ...updates, updatedAt: new Date().toISOString() };
      saveDraft(config);
      return { ...prev, config };
    });
  }, []);

  const goToStep = useCallback((step: WizardStep) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  }, []);

  const nextStep = useCallback(() => {
    setState((prev) => {
      const idx = STEP_ORDER.indexOf(prev.currentStep);
      if (idx < STEP_ORDER.length - 1) {
        const completed = prev.completedSteps.includes(prev.currentStep)
          ? prev.completedSteps
          : [...prev.completedSteps, prev.currentStep];
        return { ...prev, currentStep: STEP_ORDER[idx + 1], completedSteps: completed };
      }
      return prev;
    });
  }, []);

  const prevStep = useCallback(() => {
    setState((prev) => {
      const idx = STEP_ORDER.indexOf(prev.currentStep);
      if (idx > 0) return { ...prev, currentStep: STEP_ORDER[idx - 1] };
      return prev;
    });
  }, []);

  const reset = useCallback(() => {
    clearDraft();
    setState({
      currentStep: 'objective',
      config: createDefaultConfig(),
      completedSteps: [],
    });
  }, []);

  return { state, updateConfig, goToStep, nextStep, prevStep, reset };
}
