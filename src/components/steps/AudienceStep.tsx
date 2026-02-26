import { AuroraMessage } from '@/components/AuroraMessage';
import { MEXICAN_STATES, VEHICLE_TYPES, INTERESTS } from '@/data/constants';
import type { CampaignConfig, AudienceTarget } from '@/types/campaign';

interface Props {
  config: CampaignConfig;
  onUpdate: (updates: Partial<CampaignConfig>) => void;
  onNext: () => void;
  onPrev: () => void;
}

function MultiSelect({ label, options, selected, onChange }: {
  label: string; options: string[]; selected: string[]; onChange: (v: string[]) => void;
}) {
  const toggle = (item: string) => {
    onChange(selected.includes(item) ? selected.filter(s => s !== item) : [...selected, item]);
  };
  return (
    <div className="mb-5">
      <label className="text-sm font-medium text-white/70 mb-2 block">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => toggle(opt)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              selected.includes(opt)
                ? 'bg-pr-yellow text-black'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export function AudienceStep({ config, onUpdate, onNext, onPrev }: Props) {
  const updateAudience = (updates: Partial<AudienceTarget>) => {
    onUpdate({ audience: { ...config.audience, ...updates } });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <AuroraMessage message="Ahora definamos a quién quieres llegar. Selecciona las ubicaciones, tipos de vehículo e intereses de tu audiencia objetivo. 🎯" />

      <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-1">
        <MultiSelect
          label="📍 Ubicaciones"
          options={MEXICAN_STATES}
          selected={config.audience.locations}
          onChange={(locations) => updateAudience({ locations })}
        />

        <MultiSelect
          label="🚗 Tipo de vehículo"
          options={VEHICLE_TYPES}
          selected={config.audience.vehicleTypes}
          onChange={(vehicleTypes) => updateAudience({ vehicleTypes })}
        />

        <MultiSelect
          label="💡 Intereses"
          options={INTERESTS}
          selected={config.audience.interests}
          onChange={(interests) => updateAudience({ interests })}
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-white/70 mb-2 block">Rango de edad</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={18}
                max={65}
                value={config.audience.ageRange[0]}
                onChange={e => updateAudience({ ageRange: [+e.target.value, config.audience.ageRange[1]] })}
                className="w-20 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
              />
              <span className="text-white/40">—</span>
              <input
                type="number"
                min={18}
                max={65}
                value={config.audience.ageRange[1]}
                onChange={e => updateAudience({ ageRange: [config.audience.ageRange[0], +e.target.value] })}
                className="w-20 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-white/70 mb-2 block">Género</label>
            <select
              value={config.audience.gender}
              onChange={e => updateAudience({ gender: e.target.value as AudienceTarget['gender'] })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="all">Todos</option>
              <option value="male">Masculino</option>
              <option value="female">Femenino</option>
            </select>
          </div>
        </div>

        <div className="pt-3">
          <label className="text-sm font-medium text-white/70 mb-2 block">📁 Audiencia personalizada (CSV)</label>
          <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
            <p className="text-white/40 text-sm">Arrastra un archivo CSV o haz clic para subir</p>
            <p className="text-white/30 text-xs mt-1">Próximamente</p>
          </div>
        </div>
      </div>

      {config.audience.locations.length > 0 && config.audience.vehicleTypes.length > 0 && (
        <div className="mt-4">
          <AuroraMessage
            message={`Perfecto. Audiencia configurada: ${config.audience.locations.length} ubicaciones, ${config.audience.vehicleTypes.length} tipos de vehículo. Estimamos un alcance potencial de ${(config.audience.locations.length * config.audience.vehicleTypes.length * 5000).toLocaleString('es-MX')} personas. ¡Vamos al presupuesto!`}
          />
        </div>
      )}

      <div className="mt-6 flex justify-between">
        <button onClick={onPrev} className="text-white/60 hover:text-white px-4 py-2 transition-colors">
          ← Atrás
        </button>
        <button
          onClick={onNext}
          disabled={!config.audience.locations.length || !config.audience.vehicleTypes.length}
          className="bg-pr-yellow text-black font-semibold px-6 py-2.5 rounded-lg hover:bg-pr-yellow/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Continuar →
        </button>
      </div>
    </div>
  );
}
