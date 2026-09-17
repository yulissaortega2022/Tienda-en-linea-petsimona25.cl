import React, { useState, useEffect } from 'react';
import { Smartphone, X, Sparkles, Download, CheckCircle2, ChevronRight, ShieldCheck } from 'lucide-react';
import {
  subscribePwaInstallAvailability,
  promptPwaInstall,
  isAppAlreadyInstalled,
} from '../services/shareQrService';
import pwaWebApkBanner from '../assets/images/pet_apparel_pwa_1789670605527.jpg';

interface PwaInstallBannerProps {
  onOpenApkModal?: () => void;
}

export const PwaInstallBanner: React.FC<PwaInstallBannerProps> = ({ onOpenApkModal }) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [canInstall, setCanInstall] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [installSuccess, setInstallSuccess] = useState<boolean>(false);

  useEffect(() => {
    // Check if already standalone / installed
    if (isAppAlreadyInstalled()) {
      setIsInstalled(true);
      return;
    }

    const dismissed = sessionStorage.getItem('petsimona25_pwa_banner_dismissed');
    if (dismissed) return;

    // Listen to browser PWA install event
    const unsubscribe = subscribePwaInstallAvailability((available) => {
      setCanInstall(available);
    });

    // Show after a gentle delay for pleasant user experience
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 4500);

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('petsimona25_pwa_banner_dismissed', 'true');
  };

  const handleInstallClick = async () => {
    if (canInstall) {
      const outcome = await promptPwaInstall();
      if (outcome === 'accepted') {
        setInstallSuccess(true);
        setTimeout(() => {
          setIsVisible(false);
        }, 3000);
      }
    } else if (onOpenApkModal) {
      onOpenApkModal();
    }
  };

  if (!isVisible || isInstalled) return null;

  return (
    <aside
      aria-label="Instalar aplicación PWA WebAPK"
      className="fixed bottom-4 right-4 sm:right-6 z-40 max-w-md w-[calc(100vw-2rem)] bg-slate-950/95 backdrop-blur-md rounded-3xl border-2 border-emerald-400/60 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300 ring-4 ring-emerald-500/10 text-white"
    >
      {/* Top Banner Image with Handcrafted Pet Clothing & Workshop Atmosphere */}
      <div className="relative h-28 sm:h-32 w-full overflow-hidden bg-slate-900 group">
        <img
          src={pwaWebApkBanner}
          alt="Confección artesanal de ropa para mascotas en taller de Rengo - App PWA WebAPK"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 select-none"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />

        {/* Badges Over Image */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
          <span className="bg-amber-400 text-slate-950 font-black text-[9px] uppercase px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-slate-950" />
            Confección Artesanal
          </span>
          <span className="bg-emerald-500 text-slate-950 font-black text-[9px] uppercase px-2 py-0.5 rounded-full shadow-md">
            PWA / WebAPK Oficial
          </span>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-2.5 right-2.5 bg-slate-950/70 hover:bg-slate-900 text-slate-300 hover:text-white p-1 rounded-full border border-white/20 transition-colors cursor-pointer"
          aria-label="Cerrar banner de instalación"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Image Subtitle */}
        <div className="absolute bottom-1.5 left-3 right-3 text-left">
          <p className="text-[11px] font-black text-amber-300 tracking-wide drop-shadow-md">
            🐾 petsimona25.cl • Hecho en Rengo, Chile
          </p>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-3.5 sm:p-4 space-y-3 text-left">
        <div>
          <h4 className="text-xs sm:text-sm font-black text-white tracking-tight flex items-center gap-1.5">
            <span>{installSuccess ? '🎉 ¡App Instalada con Éxito!' : 'Instala la App en tu Celular Android / Móvil'}</span>
          </h4>
          <p className="text-[11px] sm:text-xs text-slate-300 font-normal mt-0.5 leading-snug">
            {installSuccess
              ? 'Encuentra el ícono de petsimona25 en tu pantalla de inicio con acceso sin conexión.'
              : 'Accede a la confección a la medida, catálogo sin conexión y notificaciones de despacho directo en tu pantalla de inicio.'}
          </p>
        </div>

        {/* Features Chips */}
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-300 flex-wrap">
          <span className="bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-500/30 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            Google WebAPK Certificado
          </span>
          <span className="bg-slate-900 px-2 py-0.5 rounded-md border border-slate-700 text-slate-300">
            ⚡ 0 MB en Tiendas
          </span>
        </div>

        {/* Actions */}
        {!installSuccess && (
          <div className="flex items-center gap-2 pt-0.5">
            <button
              type="button"
              onClick={handleInstallClick}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-xs py-2.5 px-3.5 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5 text-slate-950" />
              <span>Instalar App Móvil</span>
            </button>

            {onOpenApkModal && (
              <button
                type="button"
                onClick={onOpenApkModal}
                className="bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white font-bold text-xs py-2.5 px-3 rounded-xl border border-amber-400/30 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Ver QR &amp; APK</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
