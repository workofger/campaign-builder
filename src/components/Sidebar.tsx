import { Plus, FileText, Radio, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import type { CampaignConfig } from '@/types/campaign';
import type { MetaCampaignItem } from '@/services/metaAdsService';

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Activa',
  PAUSED: 'Pausada',
  DELETED: 'Eliminada',
  ARCHIVED: 'Archivada',
  draft: 'Borrador',
  ready: 'Lista',
  launching: 'Lanzando',
  active: 'Activa',
  paused: 'Pausada',
  error: 'Error',
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'text-pr-success',
  PAUSED: 'text-pr-yellow',
  DELETED: 'text-pr-danger/50',
  ARCHIVED: 'text-white/30',
  draft: 'text-white/50',
  ready: 'text-pr-link',
  launching: 'text-pr-yellow',
  active: 'text-pr-success',
  error: 'text-pr-danger',
};

interface SidebarProps {
  campaigns: CampaignConfig[];
  metaCampaigns: MetaCampaignItem[];
  metaCampaignsLoading: boolean;
  onNewCampaign: () => void;
  onSelectCampaign: (id: string) => void;
  onSelectMetaCampaign: (id: string) => void;
  activeCampaignId?: string;
  activeMetaCampaignId?: string;
}

export function Sidebar({
  campaigns,
  metaCampaigns,
  metaCampaignsLoading,
  onNewCampaign,
  onSelectCampaign,
  onSelectMetaCampaign,
  activeCampaignId,
  activeMetaCampaignId,
}: SidebarProps) {
  const [metaExpanded, setMetaExpanded] = useState(true);
  const [localExpanded, setLocalExpanded] = useState(true);

  return (
    <aside className="w-64 bg-black border-r border-pr-yellow/20 flex-shrink-0 hidden lg:flex flex-col font-sans">
      <div className="p-4">
        <button
          onClick={onNewCampaign}
          className="w-full flex items-center gap-2 bg-pr-yellow text-black font-semibold py-2 px-4 rounded-lg hover:bg-pr-yellow/90 transition-colors"
        >
          <Plus size={18} />
          Nueva campaña
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-2 space-y-2">
        {/* Local campaigns */}
        <button
          onClick={() => setLocalExpanded(!localExpanded)}
          className="w-full flex items-center gap-1 px-2 py-1 text-xs text-white/50 uppercase font-semibold tracking-wider hover:text-white/70"
        >
          {localExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          Mis campañas ({campaigns.length})
        </button>
        {localExpanded && campaigns.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelectCampaign(c.id)}
            className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              c.id === activeCampaignId
                ? 'bg-pr-yellow/20 text-pr-yellow'
                : 'text-white/70 hover:bg-white/5'
            }`}
          >
            <FileText size={14} className="flex-shrink-0" />
            <div className="truncate flex-1">
              <p className="text-sm truncate">{c.name || 'Sin nombre'}</p>
              <p className={`text-xs ${STATUS_COLORS[c.status] || 'opacity-50'}`}>
                {STATUS_LABELS[c.status] || c.status}
              </p>
            </div>
          </button>
        ))}
        {localExpanded && campaigns.length === 0 && (
          <p className="px-3 py-2 text-xs text-white/30">Sin campañas aún</p>
        )}

        {/* Meta campaigns */}
        <button
          onClick={() => setMetaExpanded(!metaExpanded)}
          className="w-full flex items-center gap-1 px-2 py-1 text-xs text-white/50 uppercase font-semibold tracking-wider hover:text-white/70 mt-2"
        >
          {metaExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          Meta Ads ({metaCampaignsLoading ? '...' : metaCampaigns.length})
        </button>
        {metaExpanded && metaCampaignsLoading && (
          <p className="px-3 py-2 text-xs text-white/30 animate-pulse">Cargando campañas de Meta...</p>
        )}
        {metaExpanded && !metaCampaignsLoading && metaCampaigns.map((mc) => {
          const budget = mc.daily_budget
            ? `$${(Number(mc.daily_budget) / 100).toLocaleString()}/día`
            : mc.lifetime_budget
              ? `$${(Number(mc.lifetime_budget) / 100).toLocaleString()} total`
              : '';

          return (
            <button
              key={mc.id}
              onClick={() => onSelectMetaCampaign(mc.id)}
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                mc.id === activeMetaCampaignId
                  ? 'bg-pr-link/20 text-pr-link'
                  : 'text-white/50 hover:bg-white/5'
              }`}
            >
              <Radio size={14} className="flex-shrink-0 text-pr-link" />
              <div className="truncate flex-1">
                <p className="text-sm truncate text-white/70">{mc.name}</p>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${STATUS_COLORS[mc.status] || 'opacity-50'}`}>
                    {STATUS_LABELS[mc.status] || mc.status}
                  </span>
                  {budget && <span className="text-xs text-white/30">{budget}</span>}
                </div>
              </div>
            </button>
          );
        })}
        {metaExpanded && !metaCampaignsLoading && metaCampaigns.length === 0 && (
          <p className="px-3 py-2 text-xs text-white/30">Sin campañas en Meta</p>
        )}
      </div>
    </aside>
  );
}
