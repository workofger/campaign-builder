import { Zap } from 'lucide-react';
import { AuroraMessage } from '@/components/AuroraMessage';
import type { CampaignConfig, BudgetConfig, BudgetType, BidStrategy } from '@/types/campaign';

interface Props {
  config: CampaignConfig;
  onUpdate: (updates: Partial<CampaignConfig>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function BudgetStep({ config, onUpdate, onNext, onPrev }: Props) {
  const updateBudget = (updates: Partial<BudgetConfig>) => {
    onUpdate({ budget: { ...config.budget, ...updates } });
  };

  const suggested = config.objective?.recommendedBudget || 500;

  return (
    <div className="max-w-2xl mx-auto">
      <AuroraMessage
        message={`Basándome en tu objetivo "${config.objective?.label || ''}" y audiencia, te recomiendo un presupuesto diario de $${suggested} MXN. Puedes ajustarlo según tus necesidades. 💰`}
      />

      {/* Advantage+ Toggle */}
      <div className={`border rounded-xl p-4 mb-4 transition-all cursor-pointer ${
        config.useAdvantage
          ? 'bg-blue-500/10 border-blue-500/30'
          : 'bg-white/5 border-white/10'
      }`}
        onClick={() => onUpdate({ useAdvantage: !config.useAdvantage })}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${config.useAdvantage ? 'bg-blue-500/20' : 'bg-white/10'}`}>
              <Zap size={20} className={config.useAdvantage ? 'text-blue-400' : 'text-white/40'} />
            </div>
            <div>
              <p className={`font-semibold text-sm ${config.useAdvantage ? 'text-blue-400' : 'text-white/70'}`}>
                Advantage+ Campaign
              </p>
              <p className="text-xs text-white/40 mt-0.5">
                Meta AI optimiza automáticamente audiencia, ubicaciones y presupuesto para maximizar resultados
              </p>
            </div>
          </div>
          <div className={`w-11 h-6 rounded-full relative transition-colors ${config.useAdvantage ? 'bg-blue-500' : 'bg-white/20'}`}>
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${config.useAdvantage ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </div>
        </div>
        {config.useAdvantage && (
          <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
            <div className="bg-blue-500/10 rounded-lg p-2 text-center text-blue-300">
              <p className="font-semibold">Audience</p>
              <p className="text-blue-300/60">Auto-optimizada</p>
            </div>
            <div className="bg-blue-500/10 rounded-lg p-2 text-center text-blue-300">
              <p className="font-semibold">Placements</p>
              <p className="text-blue-300/60">Todas las plataformas</p>
            </div>
            <div className="bg-blue-500/10 rounded-lg p-2 text-center text-blue-300">
              <p className="font-semibold">Budget</p>
              <p className="text-blue-300/60">A nivel campaña</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-5">
        {/* Budget type toggle */}
        <div>
          <label className="text-sm font-medium text-white/70 mb-2 block">Tipo de presupuesto</label>
          <div className="flex gap-2">
            {(['daily', 'lifetime'] as BudgetType[]).map(type => (
              <button
                key={type}
                onClick={() => updateBudget({ type })}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  config.budget.type === type
                    ? 'bg-pr-yellow text-black'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                {type === 'daily' ? 'Presupuesto diario' : 'Presupuesto total'}
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="text-sm font-medium text-white/70 mb-2 block">
            Monto ({config.budget.type === 'daily' ? 'por día' : 'total'}) — MXN
          </label>
          <input
            type="number"
            min={100}
            step={100}
            value={config.budget.amount}
            onChange={e => updateBudget({ amount: +e.target.value })}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white text-lg font-semibold"
          />
          <div className="flex gap-2 mt-2">
            {[300, 500, 1000, 2000, 5000].map(amt => (
              <button
                key={amt}
                onClick={() => updateBudget({ amount: amt })}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  config.budget.amount === amt
                    ? 'bg-pr-yellow text-black'
                    : 'bg-white/10 text-white/50 hover:bg-white/20'
                }`}
              >
                ${amt.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-white/70 mb-2 block">Fecha inicio</label>
            <input
              type="date"
              value={config.budget.startDate}
              onChange={e => updateBudget({ startDate: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-white/70 mb-2 block">Fecha fin</label>
            <input
              type="date"
              value={config.budget.endDate}
              onChange={e => updateBudget({ endDate: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
        </div>

        {/* Bid strategy */}
        <div>
          <label className="text-sm font-medium text-white/70 mb-2 block">Estrategia de puja</label>
          <div className="grid grid-cols-3 gap-2">
            {([
              { value: 'lowest_cost', label: 'Menor costo', desc: 'Maximiza resultados' },
              { value: 'cost_cap', label: 'Costo objetivo', desc: 'Controla CPA' },
              { value: 'bid_cap', label: 'Puja máxima', desc: 'Control total' },
            ] as const).map(opt => (
              <button
                key={opt.value}
                onClick={() => updateBudget({ bidStrategy: opt.value as BidStrategy })}
                className={`p-3 rounded-lg text-left transition-all ${
                  config.budget.bidStrategy === opt.value
                    ? 'bg-pr-yellow/20 border-pr-yellow border'
                    : 'bg-white/5 border border-white/10 hover:border-white/30'
                }`}
              >
                <p className={`text-sm font-medium ${config.budget.bidStrategy === opt.value ? 'text-pr-yellow' : 'text-white'}`}>
                  {opt.label}
                </p>
                <p className="text-xs text-white/40 mt-0.5">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <button onClick={onPrev} className="text-white/60 hover:text-white px-4 py-2 transition-colors">
          ← Atrás
        </button>
        <button
          onClick={onNext}
          className="bg-pr-yellow text-black font-semibold px-6 py-2.5 rounded-lg hover:bg-pr-yellow/90 transition-colors"
        >
          Continuar →
        </button>
      </div>
    </div>
  );
}
