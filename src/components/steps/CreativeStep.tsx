import { useState } from 'react';
import { Wand2, Upload, Image as ImageIcon } from 'lucide-react';
import { AuroraMessage } from '@/components/AuroraMessage';
import { Spinner } from '@/components/Spinner';
import { CTA_OPTIONS } from '@/data/constants';
import { generateMultipleImages } from '@/services/geminiService';
import type { CampaignConfig, AdCreative, AdFormat, CTAType } from '@/types/campaign';

interface Props {
  config: CampaignConfig;
  onUpdate: (updates: Partial<CampaignConfig>) => void;
  onNext: () => void;
  onPrev: () => void;
  onToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export function CreativeStep({ config, onUpdate, onNext, onPrev, onToast }: Props) {
  const [generating, setGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  const updateCreative = (updates: Partial<AdCreative>) => {
    onUpdate({ creative: { ...config.creative, ...updates } });
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const results = await generateMultipleImages(config, 4);
      const urls = results.map(r => r.url);
      setGeneratedImages(urls);
      onToast('Imágenes generadas con éxito', 'success');
    } catch {
      onToast('Error al generar imágenes', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const selectImage = (url: string) => {
    updateCreative({ selectedImage: url, images: [...config.creative.images, url] });
  };

  const suggestedHeadline = config.objective?.type === 'driver_recruitment'
    ? '¡Únete a Partrunner y gana más!'
    : config.objective?.type === 'fleet_acquisition'
      ? 'Tu flotilla, nuestro alcance'
      : config.objective?.type === 'reactivation'
        ? '¡Te extrañamos! Vuelve a Partrunner'
        : 'Partrunner — Logística que mueve a México';

  return (
    <div className="max-w-3xl mx-auto">
      <AuroraMessage
        message={`¡Hora de crear el anuncio! Te sugiero este headline: "${suggestedHeadline}". Puedes editarlo y generar imágenes con IA. ✨`}
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

          <div className="flex gap-2">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex-1 flex items-center justify-center gap-2 bg-pr-yellow text-black font-semibold py-2.5 rounded-lg hover:bg-pr-yellow/90 transition-colors disabled:opacity-50"
            >
              {generating ? <Spinner size="sm" /> : <Wand2 size={16} />}
              {generating ? 'Generando...' : 'Generar con IA'}
            </button>
            <button className="flex items-center gap-2 bg-white/10 text-white/70 px-4 py-2.5 rounded-lg hover:bg-white/20 transition-colors">
              <Upload size={16} />
              Subir
            </button>
          </div>

          {generatedImages.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {generatedImages.map((url, i) => (
                <button
                  key={i}
                  onClick={() => selectImage(url)}
                  className={`relative rounded-lg overflow-hidden border-2 transition-all aspect-video ${
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
              ))}
            </div>
          )}

          {!generatedImages.length && (
            <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
              <ImageIcon size={32} className="mx-auto text-white/20 mb-2" />
              <p className="text-white/40 text-sm">Genera imágenes con IA o sube las tuyas</p>
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
                    <p className="text-[10px] text-black/50">Sponsored · 🌎</p>
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
