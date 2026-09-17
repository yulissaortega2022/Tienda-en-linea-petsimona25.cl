import React, { useState, useEffect } from 'react';
import { Cookie, ShieldCheck, Check, Settings, X, ChevronRight, Lock, Eye } from 'lucide-react';
import {
  CookiePreferences,
  getCookiePreferences,
  saveCookiePreferences,
  getTrackingSettings,
  COOKIE_CONSENT_UPDATED_EVENT,
} from '../services/cookieConsentService';

interface CookieConsentBannerProps {
  onOpenSettingsModal?: () => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = () => {
  const [prefs, setPrefs] = useState<CookiePreferences>(() => getCookiePreferences());
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [trackingSettings, setTrackingSettings] = useState(() => getTrackingSettings());

  // Granular settings in banner
  const [analyticsAllowed, setAnalyticsAllowed] = useState(true);
  const [marketingAllowed, setMarketingAllowed] = useState(true);
  const [prefsAllowed, setPrefsAllowed] = useState(true);

  useEffect(() => {
    const current = getCookiePreferences();
    const settings = getTrackingSettings();
    setTrackingSettings(settings);

    // If banner enabled in tracking settings and user hasn't accepted yet
    if (settings.cookieBannerEnabled && !current.consentGiven) {
      // Small timeout for smooth entry animation
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setShowBanner(false);
    }

    const handleConsentUpdated = (e: any) => {
      const updated = e.detail || getCookiePreferences();
      setPrefs(updated);
      if (updated.consentGiven) {
        setShowBanner(false);
      }
    };

    window.addEventListener(COOKIE_CONSENT_UPDATED_EVENT, handleConsentUpdated);
    return () => window.removeEventListener(COOKIE_CONSENT_UPDATED_EVENT, handleConsentUpdated);
  }, []);

  const handleAcceptAll = () => {
    saveCookiePreferences({
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    });
    setShowBanner(false);
  };

  const handleRejectNonEssential = () => {
    saveCookiePreferences({
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    });
    setShowBanner(false);
  };

  const handleSaveCustom = () => {
    saveCookiePreferences({
      necessary: true,
      analytics: analyticsAllowed,
      marketing: marketingAllowed,
      preferences: prefsAllowed,
    });
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div
      id="petsimona25-cookie-banner"
      className="fixed bottom-3 left-3 right-3 sm:left-6 sm:right-auto sm:max-w-xl z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-5 sm:p-6 rounded-3xl border-2 border-amber-400/60 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
              <Cookie className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                <span>Configuración de Cookies &amp; Privacidad</span>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 font-extrabold px-2 py-0.5 rounded-full border border-amber-400/40">
                  #petsimona25
                </span>
              </h4>
              <p className="text-[11px] text-slate-300 font-medium">
                Respetamos tu privacidad y personalizamos tu experiencia de compra a la medida.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowBanner(false)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            title="Cerrar aviso temporalmente"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Short description */}
        <p className="text-xs text-slate-300 leading-relaxed font-normal">
          Utilizamos cookies esenciales para el funcionamiento de la tienda, cookies analíticas de <strong>Google Analytics 4</strong> para saber qué abrigos gustan más y píxeles de medición para ofrecerte ofertas exclusivas en Rengo y todo Chile.
        </p>

        {/* Detailed toggles */}
        {showDetails && (
          <div className="space-y-3 pt-2 border-t border-slate-800">
            {/* Essential */}
            <div className="flex items-center justify-between p-2.5 bg-slate-800/80 rounded-xl border border-slate-700">
              <div className="space-y-0.5">
                <span className="text-xs font-black text-amber-300 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-400" /> Esenciales y Carrito (Obligatorias)
                </span>
                <p className="text-[10px] text-slate-400">
                  Necesarias para guardar tus medidas de corte, el carrito y procesar pedidos seguros.
                </p>
              </div>
              <span className="text-[10px] font-black text-emerald-400 bg-emerald-950/60 px-2 py-1 rounded-lg border border-emerald-700">
                Siempre Activas
              </span>
            </div>

            {/* Analytics */}
            <div className="flex items-center justify-between p-2.5 bg-slate-800/80 rounded-xl border border-slate-700">
              <div className="space-y-0.5">
                <span className="text-xs font-black text-white flex items-center gap-1">
                  <Eye className="w-3 h-3 text-blue-400" /> Análisis y Métricas (Google Analytics 4)
                </span>
                <p className="text-[10px] text-slate-400">
                  Nos ayuda a mejorar la navegación, el tutorial de medidas y tiempos de carga.
                </p>
              </div>
              <input
                type="checkbox"
                checked={analyticsAllowed}
                onChange={(e) => setAnalyticsAllowed(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>

            {/* Marketing */}
            <div className="flex items-center justify-between p-2.5 bg-slate-800/80 rounded-xl border border-slate-700">
              <div className="space-y-0.5">
                <span className="text-xs font-black text-white flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-purple-400" /> Marketing &amp; Píxel de Redes
                </span>
                <p className="text-[10px] text-slate-400">
                  Permite mostrarte promociones relevantes en Instagram, Facebook y Google.
                </p>
              </div>
              <input
                type="checkbox"
                checked={marketingAllowed}
                onChange={(e) => setMarketingAllowed(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center justify-center gap-1 py-1 cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{showDetails ? 'Ocultar opciones' : 'Personalizar opciones'}</span>
          </button>

          <div className="flex items-center gap-2">
            {showDetails ? (
              <button
                type="button"
                onClick={handleSaveCustom}
                className="flex-1 sm:flex-none bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-black px-3.5 py-2 rounded-xl border border-slate-700 transition-all cursor-pointer"
              >
                Guardar Selección
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRejectNonEssential}
                className="flex-1 sm:flex-none bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-700 transition-all cursor-pointer"
              >
                Solo Esenciales
              </button>
            )}

            <button
              type="button"
              onClick={handleAcceptAll}
              className="flex-1 sm:flex-none bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 text-xs font-black px-4 py-2 rounded-xl transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 text-slate-950" />
              <span>Aceptar Todas</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
