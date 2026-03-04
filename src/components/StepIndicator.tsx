import { Check } from 'lucide-react';
import { WIZARD_STEPS } from '@/data/constants';
import type { WizardStep } from '@/types/campaign';

interface StepIndicatorProps {
  currentStep: WizardStep;
  completedSteps: WizardStep[];
  onStepClick: (step: WizardStep) => void;
}

export function StepIndicator({ currentStep, completedSteps, onStepClick }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-1 sm:gap-2 px-4 py-3 bg-black/50 border-b border-pr-yellow/10 overflow-x-auto font-sans">
      {WIZARD_STEPS.map((step, i) => {
        const isActive = step.key === currentStep;
        const isCompleted = completedSteps.includes(step.key);
        return (
          <div key={step.key} className="flex items-center gap-1 sm:gap-2">
            {i > 0 && <div className={`w-4 sm:w-8 h-px ${isCompleted || isActive ? 'bg-pr-yellow' : 'bg-white/20'}`} />}
            <button
              onClick={() => onStepClick(step.key)}
              className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-pr-yellow text-black'
                  : isCompleted
                    ? 'bg-pr-yellow/20 text-pr-yellow'
                    : 'bg-white/5 text-white/40'
              }`}
            >
              {isCompleted && !isActive ? (
                <Check size={14} />
              ) : (
                <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-xs">
                  {step.number}
                </span>
              )}
              <span className="hidden sm:inline">{step.label}</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
