import { useState, useCallback } from 'react';
import type { WizardStep, WizardState, CampaignConfig } from '@/types/campaign';
import { createDefaultConfig, WIZARD_STEPS } from '@/data/constants';

const STEP_ORDER: WizardStep[] = WIZARD_STEPS.map(s => s.key);

export function useWizard() {
  const [state, setState] = useState<WizardState>({
    currentStep: 'objective',
    config: createDefaultConfig(),
    completedSteps: [],
  });

  const updateConfig = useCallback((updates: Partial<CampaignConfig>) => {
    setState(prev => ({
      ...prev,
      config: { ...prev.config, ...updates, updatedAt: new Date().toISOString() },
    }));
  }, []);

  const goToStep = useCallback((step: WizardStep) => {
    setState(prev => ({ ...prev, currentStep: step }));
  }, []);

  const nextStep = useCallback(() => {
    setState(prev => {
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
    setState(prev => {
      const idx = STEP_ORDER.indexOf(prev.currentStep);
      if (idx > 0) return { ...prev, currentStep: STEP_ORDER[idx - 1] };
      return prev;
    });
  }, []);

  const reset = useCallback(() => {
    setState({
      currentStep: 'objective',
      config: createDefaultConfig(),
      completedSteps: [],
    });
  }, []);

  return { state, updateConfig, goToStep, nextStep, prevStep, reset };
}
