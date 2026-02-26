import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { StepIndicator } from '@/components/StepIndicator';
import { ToastContainer } from '@/components/Toast';
import { ObjectiveStep } from '@/components/steps/ObjectiveStep';
import { AudienceStep } from '@/components/steps/AudienceStep';
import { BudgetStep } from '@/components/steps/BudgetStep';
import { CreativeStep } from '@/components/steps/CreativeStep';
import { ReviewStep } from '@/components/steps/ReviewStep';
import { useWizard } from '@/hooks/useWizard';
import { useToast } from '@/hooks/useToast';
import { MOCK_CAMPAIGNS } from '@/data/constants';
import type { CampaignConfig } from '@/types/campaign';

const STORAGE_KEY = 'campaign-builder-history';

function loadCampaigns(): CampaignConfig[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : MOCK_CAMPAIGNS;
  } catch {
    return MOCK_CAMPAIGNS;
  }
}

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [campaigns, setCampaigns] = useState<CampaignConfig[]>(loadCampaigns);
  const { state, updateConfig, goToStep, nextStep, prevStep, reset } = useWizard();
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
  }, [campaigns]);

  const handleNewCampaign = () => {
    reset();
  };

  const handleSelectCampaign = (id: string) => {
    const campaign = campaigns.find(c => c.id === id);
    if (campaign) {
      updateConfig(campaign);
      addToast(`Cargando: ${campaign.name}`, 'info');
    }
  };

  const renderStep = () => {
    switch (state.currentStep) {
      case 'objective':
        return <ObjectiveStep config={state.config} onUpdate={updateConfig} onNext={nextStep} />;
      case 'audience':
        return <AudienceStep config={state.config} onUpdate={updateConfig} onNext={nextStep} onPrev={prevStep} />;
      case 'budget':
        return <BudgetStep config={state.config} onUpdate={updateConfig} onNext={nextStep} onPrev={prevStep} />;
      case 'creative':
        return <CreativeStep config={state.config} onUpdate={updateConfig} onNext={nextStep} onPrev={prevStep} onToast={addToast} />;
      case 'review':
        return <ReviewStep config={state.config} onPrev={prevStep} onToast={addToast} />;
    }
  };

  return (
    <div className={`h-screen flex flex-col ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <Header darkMode={darkMode} onToggleDark={() => setDarkMode(!darkMode)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          campaigns={campaigns}
          onNewCampaign={handleNewCampaign}
          onSelectCampaign={handleSelectCampaign}
          activeCampaignId={state.config.id}
        />
        <main className="flex-1 flex flex-col overflow-hidden">
          <StepIndicator
            currentStep={state.currentStep}
            completedSteps={state.completedSteps}
            onStepClick={goToStep}
          />
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {renderStep()}
          </div>
        </main>
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
