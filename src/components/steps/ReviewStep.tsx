import { useState } from 'react';
import { Download, Rocket } from 'lucide-react';
import { AuroraMessage } from '@/components/AuroraMessage';
import { Spinner } from '@/components/Spinner';
import { launchCampaign, estimateReach } from '@/services/metaAdsService';
import type { CampaignConfig } from '@/types/campaign';
import { useEffect } from 'react';

interface Props {
  config: CampaignConfig;
  onPrev: () => void;
  onToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export function ReviewStep({ config, onPrev, onToast }: Props) {
  const [launching, setLaunching] = useState(false);
  const [estimates, setEstimates] = useState<{ reach: number; impressions: number; cpc: number } | null>(null);

  useEffect(() => {
    estimateReach(config).then(setEstimates);
  }, [config]);

  const handleLaunch = async () => {
    setLaunching(true);
    try {
      const result = await launchCampaign(config);
      if (result.success) {
        onToast(`¡Campaña creada! ID: ${result.campaignId}`, 'success');
      }
    } catch {
      onToast('Error al crear campaña', 'error');
    } finally {
      setLaunching(false);
    }
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campaign-${config.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onToast('Configuración exportada', 'info');
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-3">
      <h3 className="text-pr-yellow font-display text-sm mb-3">{title}</h3>
      {children}
    </div>
  );

  const Row = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between py-1">
      <span className="text-white/50 text-sm">{label}</span>
      <span className="text-white text-sm font-medium">{value}</span>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <AuroraMessage message="¡Todo listo! Revisa el resumen de tu campaña. Si todo se ve bien, podemos lanzarla. 🚀" />

      {/* Estimates */}
      {estimates && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Alcance estimado', value: estimates.reach.toLocaleString('es-MX') },
            { label: 'Impresiones', value: estimates.impressions.toLocaleString('es-MX') },
            { label: 'CPC estimado', value: `$${estimates.cpc} MXN` },
          ].map(s => (
            <div key={s.label} className="bg-pr-yellow/10 border border-pr-yellow/30 rounded-xl p-4 text-center">
              <p className="text-pr-yellow font-display text-2xl">{s.value}</p>
              <p className="text-white/50 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <Section title="OBJETIVO">
        <Row label="Tipo" value={config.objective?.label || 'No seleccionado'} />
        <Row label="Nombre" value={config.name} />
      </Section>

      <Section title="AUDIENCIA">
        <Row label="Ubicaciones" value={config.audience.locations.join(', ') || 'Ninguna'} />
        <Row label="Vehículos" value={config.audience.vehicleTypes.join(', ') || 'Ninguno'} />
        <Row label="Edad" value={`${config.audience.ageRange[0]} — ${config.audience.ageRange[1]} años`} />
        <Row label="Género" value={config.audience.gender === 'all' ? 'Todos' : config.audience.gender} />
        <Row label="Intereses" value={config.audience.interests.join(', ') || 'Ninguno'} />
      </Section>

      <Section title="PRESUPUESTO">
        <Row label="Tipo" value={config.budget.type === 'daily' ? 'Diario' : 'Total'} />
        <Row label="Monto" value={`$${config.budget.amount.toLocaleString('es-MX')} MXN`} />
        <Row label="Período" value={`${config.budget.startDate} → ${config.budget.endDate}`} />
        <Row label="Estrategia" value={config.budget.bidStrategy.replace('_', ' ')} />
      </Section>

      <Section title="CREATIVO">
        <Row label="Headline" value={config.creative.headline || '—'} />
        <Row label="Formato" value={config.creative.format.replace('_', ' ')} />
        <Row label="CTA" value={config.creative.cta.replace('_', ' ')} />
        {config.creative.selectedImage && (
          <img src={config.creative.selectedImage} alt="Selected" className="mt-2 rounded-lg w-full aspect-video object-cover" />
        )}
      </Section>

      <div className="mt-6 flex flex-col sm:flex-row justify-between gap-3">
        <button onClick={onPrev} className="text-white/60 hover:text-white px-4 py-2 transition-colors">
          ← Atrás
        </button>
        <div className="flex gap-3">
          <button
            onClick={exportJSON}
            className="flex items-center gap-2 bg-white/10 text-white px-4 py-2.5 rounded-lg hover:bg-white/20 transition-colors"
          >
            <Download size={16} />
            Exportar JSON
          </button>
          <button
            onClick={handleLaunch}
            disabled={launching}
            className="flex items-center gap-2 bg-pr-yellow text-black font-semibold px-6 py-2.5 rounded-lg hover:bg-pr-yellow/90 transition-colors disabled:opacity-50"
          >
            {launching ? <Spinner size="sm" /> : <Rocket size={16} />}
            {launching ? 'Creando...' : 'Crear Campaña'}
          </button>
        </div>
      </div>
    </div>
  );
}
