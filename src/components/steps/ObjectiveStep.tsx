import { AuroraMessage } from '@/components/AuroraMessage';
import { OBJECTIVES } from '@/data/constants';
import type { CampaignObjective, CampaignConfig } from '@/types/campaign';

interface Props {
  config: CampaignConfig;
  onUpdate: (updates: Partial<CampaignConfig>) => void;
  onNext: () => void;
}

export function ObjectiveStep({ config, onUpdate, onNext }: Props) {
  const handleSelect = (obj: CampaignObjective) => {
    onUpdate({
      objective: obj,
      name: config.name || `${obj.label} — ${new Date().toLocaleDateString('es-MX', { month: 'short', year: 'numeric' })}`,
      budget: { ...config.budget, amount: obj.recommendedBudget },
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <AuroraMessage message="¡Hola! Soy Aurora, tu asistente para crear campañas de Meta Ads. 🚀 ¿Qué tipo de campaña quieres crear hoy?" />

      <div className="grid gap-3 sm:grid-cols-2">
        {OBJECTIVES.map(obj => {
          const isSelected = config.objective?.type === obj.type;
          return (
            <button
              key={obj.type}
              onClick={() => handleSelect(obj)}
              className={`text-left p-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-pr-yellow bg-pr-yellow/10'
                  : 'border-white/10 hover:border-white/30 bg-white/5'
              }`}
            >
              <div className="text-2xl mb-2">{obj.icon}</div>
              <h3 className={`font-semibold mb-1 ${isSelected ? 'text-pr-yellow' : 'text-white'}`}>
                {obj.label}
              </h3>
              <p className="text-xs text-white/60 leading-relaxed">{obj.description}</p>
              <div className="mt-3 flex gap-3 text-xs text-white/40">
                <span>💰 ${obj.recommendedBudget}/día</span>
                <span>📅 {obj.recommendedDuration} días</span>
              </div>
            </button>
          );
        })}
      </div>

      {config.objective && (
        <div className="mt-6">
          <AuroraMessage message={`Excelente elección. "${config.objective.label}" es perfecta para tu objetivo. Configuré un presupuesto de $${config.objective.recommendedBudget} MXN/día y ${config.objective.recommendedDuration} días como punto de partida. ¡Vamos a definir tu audiencia!`} />
          <div className="flex justify-end">
            <button
              onClick={onNext}
              className="bg-pr-yellow text-black font-semibold px-6 py-2.5 rounded-lg hover:bg-pr-yellow/90 transition-colors"
            >
              Continuar →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
