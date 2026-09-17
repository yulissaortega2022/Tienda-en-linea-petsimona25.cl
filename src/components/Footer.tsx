import React, { useState, useEffect } from 'react';
import { Dog, Heart, Instagram, Facebook, ShieldCheck, Truck, Cookie, Palette, QrCode } from 'lucide-react';
import { saveCookiePreferences } from '../services/cookieConsentService';
import { getActiveBrandLogo, BRAND_LOGO_CHANGED_EVENT, BrandLogoOption } from '../services/brandLogoService';

interface FooterProps {
  onOpenTracking?: () => void;
  onOpenBrandLogoModal?: () => void;
  onOpenShareQr?: (tab?: 'qr' | 'apk') => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenTracking, onOpenBrandLogoModal, onOpenShareQr }) => {
  const [activeLogo, setActiveLogo] = useState<BrandLogoOption>(() => getActiveBrandLogo());

  useEffect(() => {
    const handleLogoUpdate = (e: any) => {
      setActiveLogo(e.detail || getActiveBrandLogo());
    };
    window.addEventListener(BRAND_LOGO_CHANGED_EVENT, handleLogoUpdate);
    return () => window.removeEventListener(BRAND_LOGO_CHANGED_EVENT, handleLogoUpdate);
  }, []);

  return (
    <footer className="bg-slate-900 text-slate-300 border-t-2 border-slate-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 p-0.5 ring-2 ring-amber-400/30 overflow-hidden shrink-0">
                <img
                  src={activeLogo.src}
                  alt="petsimona25 logo"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <div>
                <span className="text-xl font-black text-white block leading-none">petsimona25</span>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Alta Costura Canina</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Taller de alta costura para perros chicos y medianos hecha a la medida. Amamos a las mascotas y diseñamos ropa ergonómica con insumos hipoalergénicos. Dominio oficial: <strong>petsimona25.cl</strong>
            </p>
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-black text-yellow-400">
                Síguela en redes: @petsimona25
              </p>
              {onOpenBrandLogoModal && (
                <button
                  type="button"
                  onClick={onOpenBrandLogoModal}
                  className="text-[10px] text-amber-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded-lg border border-amber-400/30 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Palette className="w-2.5 h-2.5" />
                  <span>Logotipo</span>
                </button>
              )}
            </div>
          </div>

          {/* Nav Col 1 */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-white uppercase tracking-widest">
              Navegación &amp; Servicios
            </h4>
            <ul className="space-y-1.5 text-xs font-medium">
              <li><a href="#medidas-form" className="hover:text-yellow-400 transition-colors">Pedido A la Medida</a></li>
              <li><a href="#tutorial-medidas" className="hover:text-yellow-400 transition-colors">Tutorial de Medidas</a></li>
              <li><a href="#catalogo" className="hover:text-yellow-400 transition-colors">Catálogo de Prendas</a></li>
              <li>
                {onOpenTracking ? (
                  <button
                    onClick={onOpenTracking}
                    className="hover:text-yellow-400 transition-colors text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Truck className="w-3.5 h-3.5 text-orange-400" />
                    <span>Rastrear Envío Logístico 📦</span>
                  </button>
                ) : (
                  <a href="#calculadora-envios" className="hover:text-yellow-400 transition-colors">Rastrear Envío</a>
                )}
              </li>
              <li><a href="#suscripcion" className="hover:text-yellow-400 transition-colors">Club Suscripción 15% OFF</a></li>
              <li><a href="#testimonios" className="hover:text-yellow-400 transition-colors">Reseñas de Clientes</a></li>
              <li><a href="#google-business-reviews" className="hover:text-yellow-400 transition-colors text-blue-300 font-bold">⭐ Google My Business Rengo</a></li>
              {onOpenShareQr && (
                <li>
                  <button
                    type="button"
                    onClick={() => onOpenShareQr('qr')}
                    className="hover:text-yellow-400 transition-colors text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5 text-amber-400" />
                    <span>Código QR &amp; App Móvil (APK) 📲</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Nav Col 2 */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-white uppercase tracking-widest">
              Pasarelas de Pago &amp; Couriers
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400 font-medium">
              <li>✓ Mercado Pago Checkout Pro</li>
              <li>✓ PayPal Smart Checkout</li>
              <li>✓ Tarjetas de Crédito / Débito (Webpay)</li>
              <li>✓ Blue Express • Chilexpress • Starken</li>
              <li>✓ Correos de Chile • Retiro en Rengo</li>
              <li>✓ Garantía de Ajuste A la Medida</li>
            </ul>
          </div>

          {/* Social Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-widest">
              Redes @petsimona25
            </h4>
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com/petsimona25"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-orange-500 text-white transition-colors border border-slate-700 cursor-pointer"
                title="Instagram @petsimona25"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://tiktok.com/@petsimona25"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-orange-500 text-yellow-400 hover:text-white transition-colors border border-slate-700 cursor-pointer"
                title="TikTok @petsimona25"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.38a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.64a6.34 6.34 0 0 0 10.82 4.48A6.3 6.3 0 0 0 15.8 15V8.5a8.28 8.28 0 0 0 4.79 1.51V6.56a4.8 4.8 0 0 1-1-.13z"/>
                </svg>
              </a>
              <a
                href="https://facebook.com/petsimona25"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-orange-500 text-white transition-colors border border-slate-700 cursor-pointer"
                title="Facebook @petsimona25"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Adaptado para Google Sites &amp; Google Search Console.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800 text-xs text-center text-slate-400 font-medium flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>© {new Date().getFullYear()} petsimona25 (@petsimona25 - petsimona25.cl). Todos los derechos reservados.</p>
          
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                saveCookiePreferences({ consentGiven: false });
                window.location.reload();
              }}
              className="text-slate-400 hover:text-amber-400 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
              title="Ajustar cookies y privacidad de seguimiento"
            >
              <Cookie className="w-3.5 h-3.5 text-amber-400" />
              <span>Configuración de Cookies</span>
            </button>

            <p className="flex items-center gap-1">
              Hecho con <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> para consentir a tus mascotas.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
