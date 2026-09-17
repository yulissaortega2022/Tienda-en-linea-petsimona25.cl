import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  Download,
  Share2,
  Palette,
  ShieldCheck,
  Scissors,
  Dog,
  ExternalLink,
} from 'lucide-react';
import {
  BRAND_LOGOS,
  getActiveBrandLogo,
  setActiveBrandLogo,
  BRAND_LOGO_CHANGED_EVENT,
  BrandLogoOption,
} from '../services/brandLogoService';

interface BrandLogoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (msg: string) => void;
}

export const BrandLogoModal: React.FC<BrandLogoModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [activeLogo, setActiveLogoState] = useState<BrandLogoOption>(() => getActiveBrandLogo());

  useEffect(() => {
    const handleLogoChange = (e: any) => {
      setActiveLogoState(e.detail || getActiveBrandLogo());
    };
    window.addEventListener(BRAND_LOGO_CHANGED_EVENT, handleLogoChange);
    return () => window.removeEventListener(BRAND_LOGO_CHANGED_EVENT, handleLogoChange);
  }, []);

  if (!isOpen) return null;

  const handleSelectLogo = (logo: BrandLogoOption) => {
    const updated = setActiveBrandLogo(logo.id);
    setActiveLogoState(updated);
    if (onShowToast) {
      onShowToast(`✓ Logotipo "${logo.name}" activado en toda la tienda petsimona25.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-amber-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-orange-950 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-lg">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-500/30">
                Identidad Visual Oficial
              </span>
              <h2 className="text-xl font-black text-white tracking-tight">
                Logotipo Profesional petsimona25 ✨
              </h2>
            </div>
          </div>
          <p className="text-xs text-amber-100/80 max-w-xl">
            Diseños generados con inteligencia artificial basados en la paleta cálida (terracota, oro ámbar y carbón) y la esencia de alta costura artesanal canina en Rengo.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Grid of Logos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {BRAND_LOGOS.map((logo) => {
              const isSelected = activeLogo.id === logo.id;
              return (
                <div
                  key={logo.id}
                  onClick={() => handleSelectLogo(logo)}
                  className={`group relative rounded-2xl border-2 p-4 cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/40 shadow-lg ring-4 ring-amber-300/40'
                      : 'border-slate-200 bg-white hover:border-amber-300 hover:shadow-md'
                  }`}
                >
                  {/* Top Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 font-black'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {logo.tag}
                    </span>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Activo</span>
                      </span>
                    )}
                  </div>

                  {/* Logo Image Preview */}
                  <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 mb-3 flex items-center justify-center p-2 group-hover:scale-[1.02] transition-transform">
                    <img
                      src={logo.src}
                      alt={logo.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain drop-shadow-sm rounded-xl"
                    />
                  </div>

                  {/* Info */}
                  <div className="space-y-1">
                    <h3 className="text-xs font-black text-slate-900 group-hover:text-amber-900 transition-colors">
                      {logo.name}
                    </h3>
                    <p className="text-[11px] font-bold text-amber-700">
                      {logo.subtitle}
                    </p>
                    <p className="text-[10px] text-slate-500 leading-tight pt-1">
                      {logo.description}
                    </p>
                  </div>

                  {/* Select button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectLogo(logo);
                    }}
                    className={`mt-4 w-full py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-amber-500 hover:text-white text-slate-700'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Logotipo Seleccionado</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Activar este Logo</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Palette & Atelier Harmony Card */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-5 rounded-2xl border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0">
                <Scissors className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <h4 className="font-black text-slate-900">
                  Paleta de Color &amp; Tipografía Sincronizada
                </h4>
                <p className="text-slate-600 text-[11px]">
                  Tonos: <strong>Terracota (#EA580C)</strong>, <strong>Oro Ámbar (#F59E0B)</strong>, y <strong>Negro Carbón (#0F172A)</strong>.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-black px-5 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 shadow-sm"
            >
              Listo, Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
