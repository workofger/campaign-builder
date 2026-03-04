import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { StepIndicator } from '@/components/StepIndicator';
import { ToastContainer } from '@/components/Toast';
import { LoginPage } from '@/components/LoginPage';
import { Spinner } from '@/components/Spinner';
import { MetaCampaignDetail } from '@/components/MetaCampaignDetail';
import { ObjectiveStep } from '@/components/steps/ObjectiveStep';
import { AudienceStep } from '@/components/steps/AudienceStep';
import { BudgetStep } from '@/components/steps/BudgetStep';
import { CreativeStep } from '@/components/steps/CreativeStep';
import { ReviewStep } from '@/components/steps/ReviewStep';
import { useWizard } from '@/hooks/useWizard';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';
import { apiGet, apiPost, apiPatch } from '@/services/apiClient';
import { fetchMetaCampaigns, type MetaCampaignItem } from '@/services/metaAdsService';
import type { CampaignConfig } from '@/types/campaign';

interface CampaignRow {
  id: string;
  name: string;
  status: string;
  objective_type: string;
  objective_label: string | null;
  config: CampaignConfig;
  created_at: string;
  updated_at: string;
}

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [campaigns, setCampaigns] = useState<CampaignConfig[]>([]);
  const [metaCampaigns, setMetaCampaigns] = useState<MetaCampaignItem[]>([]);
  const [metaCampaignsLoading, setMetaCampaignsLoading] = useState(false);
  const [selectedMetaCampaignId, setSelectedMetaCampaignId] = useState<string | null>(null);
  const { state, updateConfig, goToStep, nextStep, prevStep, reset } = useWizard();
  const { toasts, addToast, removeToast } = useToast();
  const { user, profile, loading, isAuthenticated, signInWithGoogle, signInWithEmail, signOut } =
    useAuth();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const loadCampaigns = useCallback(async () => {
    try {
      const res = await apiGet<{ data: CampaignRow[] }>('/api/campaigns');
      const mapped = res.data.map((row) => ({
        ...row.config,
        id: row.id,
        name: row.name,
        status: row.config.status || (row.status as CampaignConfig['status']),
      }));
      setCampaigns(mapped);
    } catch {
      setCampaigns([]);
    }
  }, []);

  const loadMetaCampaigns = useCallback(async () => {
    setMetaCampaignsLoading(true);
    try {
      const data = await fetchMetaCampaigns();
      setMetaCampaigns(data);
    } catch {
      setMetaCampaigns([]);
    } finally {
      setMetaCampaignsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;

    apiGet<{ data: CampaignRow[] }>('/api/campaigns')
      .then((res) => {
        if (cancelled) return;
        const mapped = res.data.map((row) => ({
          ...row.config,
          id: row.id,
          name: row.name,
          status: row.config.status || (row.status as CampaignConfig['status']),
        }));
        setCampaigns(mapped);
      })
      .catch(() => {
        if (!cancelled) setCampaigns([]);
      });

    return () => { cancelled = true; };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;

    loadMetaCampaigns();

    return () => { cancelled = true; };
  }, [isAuthenticated, loadMetaCampaigns]);

  const handleNewCampaign = () => {
    setSelectedMetaCampaignId(null);
    reset();
  };

  const handleSelectCampaign = (id: string) => {
    setSelectedMetaCampaignId(null);
    const campaign = campaigns.find((c) => c.id === id);
    if (campaign) {
      updateConfig(campaign);
      addToast(`Cargando: ${campaign.name}`, 'info');
    }
  };

  const handleSelectMetaCampaign = (id: string) => {
    setSelectedMetaCampaignId(id);
  };

  const handleSaveCampaign = useCallback(
    async (config: CampaignConfig) => {
      try {
        const existing = campaigns.find((c) => c.id === config.id);
        if (existing) {
          await apiPatch(`/api/campaigns/${config.id}`, {
            name: config.name,
            config,
            objectiveType: config.objective?.type || 'driver_recruitment',
            objectiveLabel: config.objective?.label,
          });
        } else {
          const res = await apiPost<{ data: CampaignRow }>('/api/campaigns', {
            name: config.name || 'Nueva campaña',
            objectiveType: config.objective?.type || 'driver_recruitment',
            objectiveLabel: config.objective?.label,
            config,
          });
          updateConfig({ id: res.data.id });
        }
        await loadCampaigns();
      } catch (err) {
        addToast(
          `Error al guardar: ${err instanceof Error ? err.message : 'desconocido'}`,
          'error'
        );
      }
    },
    [campaigns, loadCampaigns, updateConfig, addToast]
  );

  const renderStep = () => {
    switch (state.currentStep) {
      case 'objective':
        return (
          <ObjectiveStep config={state.config} onUpdate={updateConfig} onNext={nextStep} />
        );
      case 'audience':
        return (
          <AudienceStep
            config={state.config}
            onUpdate={updateConfig}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 'budget':
        return (
          <BudgetStep
            config={state.config}
            onUpdate={updateConfig}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 'creative':
        return (
          <CreativeStep
            config={state.config}
            onUpdate={updateConfig}
            onNext={nextStep}
            onPrev={prevStep}
            onToast={addToast}
          />
        );
      case 'review':
        return (
          <ReviewStep
            config={state.config}
            onPrev={prevStep}
            onToast={addToast}
            onSave={handleSaveCampaign}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <LoginPage onSignInWithGoogle={signInWithGoogle} onSignInWithEmail={signInWithEmail} />
    );
  }

  return (
    <div
      className={`h-screen flex flex-col ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}
    >
      <Header
        darkMode={darkMode}
        onToggleDark={() => setDarkMode(!darkMode)}
        userName={profile?.fullName}
        userEmail={user?.email}
        userAvatar={profile?.avatarUrl}
        onSignOut={signOut}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          campaigns={campaigns}
          metaCampaigns={metaCampaigns}
          metaCampaignsLoading={metaCampaignsLoading}
          onNewCampaign={handleNewCampaign}
          onSelectCampaign={handleSelectCampaign}
          onSelectMetaCampaign={handleSelectMetaCampaign}
          activeCampaignId={state.config.id}
          activeMetaCampaignId={selectedMetaCampaignId || undefined}
        />
        <main className="flex-1 flex flex-col overflow-hidden">
          <StepIndicator
            currentStep={state.currentStep}
            completedSteps={state.completedSteps}
            onStepClick={goToStep}
          />
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">{renderStep()}</div>
        </main>
      </div>
      {selectedMetaCampaignId && (
        <MetaCampaignDetail
          campaignId={selectedMetaCampaignId}
          onClose={() => setSelectedMetaCampaignId(null)}
          onToast={addToast}
          onRefreshList={loadMetaCampaigns}
        />
      )}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
