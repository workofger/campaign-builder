import { Plus, FileText } from 'lucide-react';
import type { CampaignConfig } from '@/types/campaign';

interface SidebarProps {
  campaigns: CampaignConfig[];
  onNewCampaign: () => void;
  onSelectCampaign: (id: string) => void;
  activeCampaignId?: string;
}

export function Sidebar({ campaigns, onNewCampaign, onSelectCampaign, activeCampaignId }: SidebarProps) {
  return (
    <aside className="w-64 bg-black border-r border-pr-yellow/20 flex-shrink-0 hidden lg:flex flex-col">
      <div className="p-4">
        <button
          onClick={onNewCampaign}
          className="w-full flex items-center gap-2 bg-pr-yellow text-black font-semibold py-2 px-4 rounded-lg hover:bg-pr-yellow/90 transition-colors"
        >
          <Plus size={18} />
          Nueva campaña
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-2">
        <p className="px-2 py-1 text-xs text-white/50 uppercase font-semibold tracking-wider">Historial</p>
        {campaigns.map(c => (
          <button
            key={c.id}
            onClick={() => onSelectCampaign(c.id)}
            className={`w-full text-left px-3 py-2 rounded-lg mb-1 flex items-center gap-2 transition-colors ${
              c.id === activeCampaignId
                ? 'bg-pr-yellow/20 text-pr-yellow'
                : 'text-white/70 hover:bg-white/5'
            }`}
          >
            <FileText size={14} />
            <div className="truncate">
              <p className="text-sm truncate">{c.name || 'Sin nombre'}</p>
              <p className="text-xs opacity-50">{c.status}</p>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}
