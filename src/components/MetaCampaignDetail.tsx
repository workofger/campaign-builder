import { useState, useEffect } from 'react';
import {
  X, Loader2, Play, Pause, Copy, BarChart3,
  Users, MapPin, Calendar, DollarSign, Zap, ChevronDown, ChevronRight,
} from 'lucide-react';
import {
  fetchCampaignDetail,
  updateMetaCampaign,
  duplicateMetaCampaign,
  type MetaCampaignFull,
  type MetaAdSetDetail,
  type MetaAdDetail,
} from '@/services/metaAdsService';

interface Props {
  campaignId: string;
  onClose: () => void;
  onToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onRefreshList: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Activa',
  PAUSED: 'Pausada',
  DELETED: 'Eliminada',
  ARCHIVED: 'Archivada',
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-500/20 text-green-400',
  PAUSED: 'bg-yellow-500/20 text-yellow-400',
  DELETED: 'bg-red-500/20 text-red-400',
  ARCHIVED: 'bg-white/10 text-white/40',
};

const OBJECTIVE_LABELS: Record<string, string> = {
  OUTCOME_LEADS: 'Generación de leads',
  OUTCOME_ENGAGEMENT: 'Interacción',
  OUTCOME_AWARENESS: 'Reconocimiento',
  OUTCOME_SALES: 'Ventas',
  OUTCOME_TRAFFIC: 'Tráfico',
  LINK_CLICKS: 'Clics en enlace',
  CONVERSIONS: 'Conversiones',
  LEAD_GENERATION: 'Generación de leads',
  BRAND_AWARENESS: 'Reconocimiento de marca',
  REACH: 'Alcance',
  POST_ENGAGEMENT: 'Interacción',
  VIDEO_VIEWS: 'Visualizaciones de video',
};

function formatMoney(centavos: string | undefined): string {
  if (!centavos) return '—';
  return `$${(Number(centavos) / 100).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`;
}

function formatDate(iso: string | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
}

function TargetingSummary({ targeting }: { targeting: Record<string, unknown> }) {
  const geo = targeting.geo_locations as Record<string, unknown> | undefined;
  const regions = (geo?.regions as Array<{ name: string }>) || [];
  const countries = (geo?.countries as string[]) || [];
  const ageMin = targeting.age_min as number | undefined;
  const ageMax = targeting.age_max as number | undefined;
  const genders = targeting.genders as number[] | undefined;
  const flexSpec = targeting.flexible_spec as Array<Record<string, unknown>> | undefined;
  const automation = targeting.targeting_automation as Record<string, unknown> | undefined;

  const genderLabel = !genders
    ? 'Todos'
    : genders.includes(1) && genders.includes(2)
      ? 'Todos'
      : genders.includes(1)
        ? 'Hombres'
        : 'Mujeres';

  return (
    <div className="space-y-2 text-sm">
      {automation?.advantage_audience === 1 && (
        <div className="flex items-center gap-1.5 text-pr-yellow">
          <Zap size={14} />
          <span className="font-semibold">Advantage+ Audience activo</span>
        </div>
      )}
      <div className="flex items-center gap-1.5 text-white/70">
        <MapPin size={14} className="text-white/40" />
        {regions.length > 0
          ? regions.map((r) => r.name).join(', ')
          : countries.length > 0
            ? countries.join(', ')
            : 'Sin ubicaciones'}
      </div>
      <div className="flex items-center gap-1.5 text-white/70">
        <Users size={14} className="text-white/40" />
        {ageMin && ageMax ? `${ageMin}–${ageMax} años` : 'Todas las edades'} · {genderLabel}
      </div>
      {flexSpec && flexSpec.length > 0 && (
        <div className="text-white/50 text-xs">
          Intereses: {flexSpec.map((f) => {
            const interests = f.interests as Array<{ name: string }> | undefined;
            return interests?.map((i) => i.name).join(', ');
          }).filter(Boolean).join('; ')}
        </div>
      )}
    </div>
  );
}

function AdSetCard({ adset }: { adset: MetaAdSetDetail }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-white/5"
      >
        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <span className="flex-1 text-sm font-medium truncate">{adset.name}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[adset.status] || 'bg-white/10 text-white/50'}`}>
          {STATUS_LABELS[adset.status] || adset.status}
        </span>
      </button>
      {expanded && (
        <div className="px-4 pb-3 space-y-3 border-t border-white/5 pt-3">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-white/40">Presupuesto</span>
              <p className="text-white/80">{formatMoney(adset.daily_budget || adset.lifetime_budget)}{adset.daily_budget ? '/día' : ' total'}</p>
            </div>
            <div>
              <span className="text-white/40">Optimización</span>
              <p className="text-white/80">{adset.optimization_goal?.replace(/_/g, ' ')}</p>
            </div>
            <div>
              <span className="text-white/40">Inicio</span>
              <p className="text-white/80">{formatDate(adset.start_time)}</p>
            </div>
            <div>
              <span className="text-white/40">Fin</span>
              <p className="text-white/80">{formatDate(adset.end_time)}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-white/40 mb-1">Segmentación</p>
            <TargetingSummary targeting={adset.targeting} />
          </div>
        </div>
      )}
    </div>
  );
}

function AdCard({ ad }: { ad: MetaAdDetail }) {
  const imageUrl = ad.creative?.image_url || ad.creative?.thumbnail_url;
  const storySpec = ad.creative?.object_story_spec as Record<string, unknown> | undefined;
  const linkData = storySpec?.link_data as Record<string, unknown> | undefined;

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-3">
      <div className="flex gap-3">
        {imageUrl && (
          <img src={imageUrl} alt="" className="w-16 h-16 rounded object-cover flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{ad.name}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[ad.status] || 'bg-white/10 text-white/50'}`}>
            {STATUS_LABELS[ad.status] || ad.status}
          </span>
          {linkData?.name && (
            <p className="text-xs text-white/50 mt-1 truncate">
              {linkData.name as string}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function MetaCampaignDetail({ campaignId, onClose, onToast, onRefreshList }: Props) {
  const [detail, setDetail] = useState<MetaCampaignFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchCampaignDetail(campaignId)
      .then(setDetail)
      .catch((err) => onToast(err.message || 'Error cargando campaña', 'error'))
      .finally(() => setLoading(false));
  }, [campaignId, onToast]);

  const handleToggleStatus = async () => {
    if (!detail) return;
    const newStatus = detail.campaign.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    setActionLoading(true);
    try {
      await updateMetaCampaign(campaignId, { status: newStatus });
      setDetail({
        ...detail,
        campaign: { ...detail.campaign, status: newStatus },
      });
      onToast(`Campaña ${newStatus === 'ACTIVE' ? 'activada' : 'pausada'}`, 'success');
      onRefreshList();
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Error', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDuplicate = async () => {
    if (!detail) return;
    setActionLoading(true);
    try {
      const result = await duplicateMetaCampaign(
        campaignId,
        `${detail.campaign.name} (copia)`
      );
      onToast(`Campaña duplicada: ${result.copied_campaign_id}`, 'success');
      onRefreshList();
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Error', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
        <Loader2 className="animate-spin text-pr-yellow" size={32} />
      </div>
    );
  }

  if (!detail) return null;

  const { campaign, adsets, ads, insights } = detail;
  const advantageState = campaign.advantage_state_info?.advantage_state;
  const isAdvantage = advantageState && advantageState !== 'DISABLED';
  const budget = campaign.daily_budget || campaign.lifetime_budget;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex justify-end">
      <div className="w-full max-w-lg bg-zinc-900 border-l border-white/10 h-full overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-zinc-900 border-b border-white/10 px-5 py-4 flex items-center gap-3 z-10">
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <X size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-lg text-pr-yellow truncate">{campaign.name}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[campaign.status] || ''}`}>
                {STATUS_LABELS[campaign.status] || campaign.status}
              </span>
              {isAdvantage && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 flex items-center gap-1">
                  <Zap size={10} /> Advantage+
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleToggleStatus}
              disabled={actionLoading}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 ${
                campaign.status === 'ACTIVE'
                  ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                  : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
              }`}
            >
              {campaign.status === 'ACTIVE' ? <Pause size={16} /> : <Play size={16} />}
              {campaign.status === 'ACTIVE' ? 'Pausar' : 'Activar'}
            </button>
            <button
              onClick={handleDuplicate}
              disabled={actionLoading}
              className="flex-1 flex items-center justify-center gap-2 bg-white/10 text-white/70 py-2 rounded-lg font-semibold text-sm hover:bg-white/20 transition-colors disabled:opacity-50"
            >
              <Copy size={16} />
              Duplicar / Relanzar
            </button>
          </div>

          {/* Overview */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-white/40 text-xs mb-1">
                <BarChart3 size={12} />
                Objetivo
              </div>
              <p className="text-sm text-white/80">
                {OBJECTIVE_LABELS[campaign.objective] || campaign.objective}
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-white/40 text-xs mb-1">
                <DollarSign size={12} />
                Presupuesto
              </div>
              <p className="text-sm text-white/80">
                {formatMoney(budget)}
                {campaign.daily_budget ? '/día' : ' total'}
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-white/40 text-xs mb-1">
                <Calendar size={12} />
                Periodo
              </div>
              <p className="text-sm text-white/80">
                {formatDate(campaign.start_time)} → {formatDate(campaign.stop_time)}
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-white/40 text-xs mb-1">
                <Users size={12} />
                Ad Sets
              </div>
              <p className="text-sm text-white/80">{adsets.length} conjuntos · {ads.length} anuncios</p>
            </div>
          </div>

          {/* Insights */}
          {insights && (
            <div>
              <h3 className="text-pr-yellow font-display text-sm mb-2">RESULTADOS</h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Alcance', value: Number(insights.reach || 0).toLocaleString('es-MX') },
                  { label: 'Impresiones', value: Number(insights.impressions || 0).toLocaleString('es-MX') },
                  { label: 'Clics', value: Number(insights.clicks || 0).toLocaleString('es-MX') },
                  { label: 'Gasto', value: `$${Number(insights.spend || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}` },
                  { label: 'CTR', value: `${Number(insights.ctr || 0).toFixed(2)}%` },
                  { label: 'CPC', value: `$${Number(insights.cpc || 0).toFixed(2)}` },
                ].map((m) => (
                  <div key={m.label} className="bg-white/5 rounded-lg p-2 text-center">
                    <p className="text-xs text-white/40">{m.label}</p>
                    <p className="text-sm font-semibold text-white/90">{m.value}</p>
                  </div>
                ))}
              </div>
              {insights.actions && insights.actions.length > 0 && (
                <div className="mt-2 bg-white/5 rounded-lg p-3">
                  <p className="text-xs text-white/40 mb-1">Acciones</p>
                  <div className="space-y-1">
                    {insights.actions.slice(0, 8).map((a) => (
                      <div key={a.action_type} className="flex justify-between text-xs">
                        <span className="text-white/60">{a.action_type.replace(/_/g, ' ')}</span>
                        <span className="text-white/80 font-medium">{Number(a.value).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Advantage+ Info */}
          {campaign.advantage_state_info && (
            <div>
              <h3 className="text-pr-yellow font-display text-sm mb-2">ADVANTAGE+</h3>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { label: 'Presupuesto', state: campaign.advantage_state_info.advantage_budget_state },
                  { label: 'Audiencia', state: campaign.advantage_state_info.advantage_audience_state },
                  { label: 'Ubicaciones', state: campaign.advantage_state_info.advantage_placement_state },
                ].map((item) => (
                  <div key={item.label} className={`rounded-lg p-2 text-center ${
                    item.state === 'ENABLED' ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-white/40'
                  }`}>
                    <p className="text-[10px] opacity-70">{item.label}</p>
                    <p className="font-semibold">{item.state === 'ENABLED' ? 'ON' : 'OFF'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ad Sets */}
          {adsets.length > 0 && (
            <div>
              <h3 className="text-pr-yellow font-display text-sm mb-2">CONJUNTOS DE ANUNCIOS ({adsets.length})</h3>
              <div className="space-y-2">
                {adsets.map((adset) => (
                  <AdSetCard key={adset.id} adset={adset} />
                ))}
              </div>
            </div>
          )}

          {/* Ads */}
          {ads.length > 0 && (
            <div>
              <h3 className="text-pr-yellow font-display text-sm mb-2">ANUNCIOS ({ads.length})</h3>
              <div className="space-y-2">
                {ads.map((ad) => (
                  <AdCard key={ad.id} ad={ad} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
