import React, { useState, useEffect } from 'react';
import { Bell, X, Sparkles, ShieldCheck, Check } from 'lucide-react';
import { getBrowserPushPermission, requestBrowserPushPermission } from '../services/pushNotificationService';

interface WebPushPermissionBannerProps {
  onOpenNotificationCenter?: () => void;
}

export const WebPushPermissionBanner: React.FC<WebPushPermissionBannerProps> = ({
  onOpenNotificationCenter,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isGranted, setIsGranted] = useState(false);

  useEffect(() => {
    // Check permission status
    const permission = getBrowserPushPermission();
    const hasDismissed = sessionStorage.getItem('petsimona25_push_banner_dismissed');

    if (permission === 'default' && !hasDismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleActivate = async () => {
    const res = await requestBrowserPushPermission();
    if (res === 'granted') {
      setIsGranted(true);
      setTimeout(() => {
        setIsVisible(false);
      }, 2500);
    } else {
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('petsimona25_push_banner_dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Notificaciones del sitio"
      className="fixed bottom-20 left-4 sm:left-6 z-40 max-w-sm w-[calc(100vw-2rem)] bg-slate-900 text-white p-4 rounded-3xl border-2 border-orange-400 shadow-2xl animate-fade-in space-y-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-md shrink-0">
            {isGranted ? <Check className="w-5 h-5" /> : <Bell className="w-5 h-5 animate-bounce" />}
          </div>
          <div>
            <h4 className="text-xs font-black text-white tracking-tight flex items-center gap-1.5">
              <span>{isGranted ? '¡Notificaciones Activadas!' : '¿Activar Alertas Web Push? 🔔'}</span>
            </h4>
            <p className="text-[11px] text-slate-300 font-medium">
              {isGranted
                ? 'Te avisaremos de tus despachos y promociones.'
                : 'Recibe el estado de tu pedido en tiempo real y avisos de stock.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {!isGranted && (
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleActivate}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs py-2 px-3 rounded-xl shadow-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Activar Alertas</span>
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Más tarde
          </button>
        </div>
      )}
    </aside>
  );
};
