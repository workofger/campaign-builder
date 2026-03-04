import { useState, useRef } from 'react';
import { Wand2, Upload, Image as ImageIcon, MessageSquare, ChevronDown, ChevronRight } from 'lucide-react';
import { AuroraMessage } from '@/components/AuroraMessage';
import { Spinner } from '@/components/Spinner';
import { CTA_OPTIONS } from '@/data/constants';
import { generateMultipleImages, uploadImage, buildImagePrompt } from '@/services/geminiService';
import type { CampaignConfig, AdCreative, AdFormat, CTAType } from '@/types/campaign';

interface Props {
  config: CampaignConfig;
  onUpdate: (updates: Partial<CampaignConfig>) => void;
  onNext: () => void;
  onPrev: () => void;
  onToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const PROMPT_PRESETS = [
  { label: 'Conductor con vehículo', prompt: 'A happy professional driver standing next to their delivery vehicle, looking confident and successful. Yellow and black brand colors. Professional photography style.' },
  { label: 'Entrega exitosa', prompt: 'A driver completing a successful delivery, handing a package to a smiling customer at their doorstep. Warm lighting, professional style. Yellow accents.' },
  { label: 'Flota de vehículos', prompt: 'A fleet of delivery vehicles (vans, trucks) lined up in a modern logistics hub. Professional corporate photography. Yellow and black brand colors, clean modern aesthetic.' },
  { label: 'Ganancias / ingresos', prompt: 'A driver checking earnings on their phone with a satisfied expression, standing near their vehicle. Modern aspirational style showing financial success. Yellow highlights.' },
  { label: 'Cityscape logística', prompt: 'Aerial view of a busy Mexican city with delivery vehicles navigating streets. Modern logistics visualization. Yellow route lines overlaid. Professional advertising photography.' },
  { label: 'Equipo de trabajo', prompt: 'A diverse group of delivery drivers posing together, wearing professional attire, looking united and motivated. Team spirit photography. Yellow and black brand elements.' },
];

export function CreativeStep({ config, onUpdate, onNext, onPrev, onToast }: Props) {
  const [generating, setGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [useCustomPrompt, setUseCustomPrompt] = useState(false);
  const [showPromptPresets, setShowPromptPresets] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateCreative = (updates: Partial<AdCreative>) => {
    onUpdate({ creative: { ...config.creative, ...updates } });
  };

  const handleGenerate = async () => {
    const prompt = useCustomPrompt && customPrompt.trim()
      ? customPrompt.trim()
      : buildImagePrompt(config);

    setGenerating(true);
    try {
      const results = await generateMultipleImages(
        { ...config },
        4,
        useCustomPrompt ? customPrompt.trim() : undefined
      );
      const urls = results.map((r) => r.url);
      setGeneratedImages((prev) => [...prev, ...urls]);
      onToast(`${urls.length} imágenes generadas con éxito`, 'success');
    } catch {
      onToast('Error al generar imágenes. Intenta de nuevo.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await uploadImage(file, config.id);
      setGeneratedImages((prev) => [...prev, result.url]);
      onToast('Imagen subida con éxito', 'success');
    } catch {
      onToast('Error al subir imagen', 'error');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const selectImage = (url: string) => {
    updateCreative({ selectedImage: url, images: [...config.creative.images, url] });
  };

  const removeImage = (url: string) => {
    setGeneratedImages((prev) => prev.filter((u) => u !== url));
    if (config.creative.selectedImage === url) {
      updateCreative({ selectedImage: undefined });
    }
  };

  const suggestedHeadline = config.objective?.type === 'driver_recruitment'
    ? '¡Únete a Partrunner y gana más!'
    : config.objective?.type === 'fleet_acquisition'
      ? 'Tu flotilla, nuestro alcance'
      : config.objective?.type === 'reactivation'
        ? '¡Te extrañamos! Vuelve a Partrunner'
        : 'Partrunner — Logística que mueve a México';

  return (
    <div className="max-w-4xl mx-auto">
      <AuroraMessage
        message={`¡Hora de crear el anuncio! Te sugiero este headline: "${suggestedHeadline}". Personaliza el copy y genera imágenes con instrucciones específicas. ✨`}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Copy section */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
          <h3 className="text-pr-yellow font-display text-lg">COPY DEL ANUNCIO</h3>

          <div>
            <label className="text-xs text-white/50 mb-1 block">Headline</label>
            <input
              value={config.creative.headline}
              onChange={e => updateCreative({ headline: e.target.value })}
              placeholder={suggestedHeadline}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-white/50 mb-1 block">Texto principal</label>
            <textarea
              rows={3}
              value={config.creative.primaryText}
              onChange={e => updateCreative({ primaryText: e.target.value })}
              placeholder="Gana hasta $15,000 semanales como conductor independiente..."
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm resize-none"
            />
          </div>

          <div>
            <label className="text-xs text-white/50 mb-1 block">Descripción</label>
            <input
              value={config.creative.description}
              onChange={e => updateCreative({ description: e.target.value })}
              placeholder="Registro rápido • Pagos semanales • Sin comisiones ocultas"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/50 mb-1 block">CTA</label>
              <select
                value={config.creative.cta}
                onChange={e => updateCreative({ cta: e.target.value as CTAType })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
              >
                {CTA_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Formato</label>
              <select
                value={config.creative.format}
                onChange={e => updateCreative({ format: e.target.value as AdFormat })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="single_image">Imagen única</option>
                <option value="carousel">Carrusel</option>
                <option value="video">Video</option>
              </select>
            </div>
          </div>
        </div>

        {/* Image section */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
          <h3 className="text-pr-yellow font-display text-lg">IMÁGENES</h3>

          {/* Custom prompt toggle */}
          <div
            className={`border rounded-lg p-3 transition-all ${
              useCustomPrompt ? 'border-pr-yellow/40 bg-pr-yellow/5' : 'border-white/10 bg-white/5'
            }`}
          >
            <button
              onClick={() => setUseCustomPrompt(!useCustomPrompt)}
              className="w-full flex items-center gap-2 text-left"
            >
              <MessageSquare size={16} className={useCustomPrompt ? 'text-pr-yellow' : 'text-white/40'} />
              <span className={`text-sm font-medium flex-1 ${useCustomPrompt ? 'text-pr-yellow' : 'text-white/60'}`}>
                Instrucciones personalizadas
              </span>
              {useCustomPrompt ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>

            {useCustomPrompt && (
              <div className="mt-3 space-y-2">
                <textarea
                  rows={3}
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Describe exactamente lo que quieres en la imagen: escena, personas, vehículos, estilo, colores, composición..."
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm resize-none placeholder:text-white/30"
                />
                <div>
                  <button
                    onClick={() => setShowPromptPresets(!showPromptPresets)}
                    className="text-xs text-pr-yellow/70 hover:text-pr-yellow flex items-center gap-1"
                  >
                    {showPromptPresets ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    Plantillas rápidas
                  </button>
                  {showPromptPresets && (
                    <div className="mt-2 grid grid-cols-2 gap-1.5">
                      {PROMPT_PRESETS.map((preset) => (
                        <button
                          key={preset.label}
                          onClick={() => setCustomPrompt(preset.prompt)}
                          className="text-left text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-2.5 py-1.5 text-white/60 hover:text-white/80 transition-colors"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Generate / Upload buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex-1 flex items-center justify-center gap-2 bg-pr-yellow text-black font-semibold py-2.5 rounded-lg hover:bg-pr-yellow/90 transition-colors disabled:opacity-50"
            >
              {generating ? <Spinner size="sm" /> : <Wand2 size={16} />}
              {generating ? 'Generando...' : 'Generar con IA'}
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-white/10 text-white/70 px-4 py-2.5 rounded-lg hover:bg-white/20 transition-colors"
            >
              <Upload size={16} />
              Subir
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
            />
          </div>

          {/* Generated images grid */}
          {generatedImages.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {generatedImages.map((url, i) => (
                <div key={i} className="relative group">
                  <button
                    onClick={() => selectImage(url)}
                    className={`w-full relative rounded-lg overflow-hidden border-2 transition-all aspect-video ${
                      config.creative.selectedImage === url
                        ? 'border-pr-yellow'
                        : 'border-transparent hover:border-white/30'
                    }`}
                  >
                    <img src={url} alt={`Generated ${i + 1}`} className="w-full h-full object-cover" />
                    {config.creative.selectedImage === url && (
                      <div className="absolute top-1 right-1 bg-pr-yellow text-black text-xs px-1.5 py-0.5 rounded font-semibold">
                        ✓
                      </div>
                    )}
                  </button>
                  <button
                    onClick={() => removeImage(url)}
                    className="absolute top-1 left-1 bg-black/60 text-white/70 hover:text-white text-xs w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {!generatedImages.length && (
            <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
              <ImageIcon size={32} className="mx-auto text-white/20 mb-2" />
              <p className="text-white/40 text-sm">
                {useCustomPrompt
                  ? 'Escribe tus instrucciones arriba y genera imágenes'
                  : 'Genera imágenes con IA o sube las tuyas'}
              </p>
            </div>
          )}

          {/* Ad Preview */}
          {(config.creative.headline || config.creative.selectedImage) && (
            <div>
              <p className="text-xs text-white/50 mb-2">Vista previa — Facebook Feed</p>
              <div className="bg-white rounded-lg overflow-hidden text-black">
                <div className="p-3 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-pr-yellow" />
                  <div>
                    <p className="text-xs font-semibold">Partrunner</p>
                    <p className="text-[10px] text-black/50">Sponsored</p>
                  </div>
                </div>
                <p className="px-3 pb-2 text-xs">{config.creative.primaryText || 'Texto del anuncio...'}</p>
                {config.creative.selectedImage && (
                  <img src={config.creative.selectedImage} alt="Preview" className="w-full aspect-video object-cover" />
                )}
                <div className="p-3 border-t flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-black/50 uppercase">partrunner.com</p>
                    <p className="text-xs font-semibold">{config.creative.headline || 'Headline...'}</p>
                    <p className="text-[10px] text-black/60">{config.creative.description || 'Descripción...'}</p>
                  </div>
                  <button className="bg-black/10 text-xs font-semibold px-3 py-1.5 rounded">
                    {CTA_OPTIONS.find(c => c.value === config.creative.cta)?.label || 'CTA'}
                  </button>
                </div>
              </div>
            </div>
          )}
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
          Revisar campaña →
        </button>
      </div>
    </div>
  );
}
