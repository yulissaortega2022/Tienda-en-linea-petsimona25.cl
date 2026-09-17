import React, { useState, useEffect } from 'react';
import { ShoppingBag, Sparkles, Settings, Dog, Instagram, Facebook, Globe, Menu, X, Scissors, Truck, Search, Bell, ShieldCheck, Zap, Lock, Palette, QrCode, Smartphone, Share2 } from 'lucide-react';
import { PaymentCredentials } from '../types';
import { getActiveBrandLogo, BRAND_LOGO_CHANGED_EVENT, BrandLogoOption } from '../services/brandLogoService';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenPaymentConfig: () => void;
  onOpenAdminPanel: () => void;
  onOpenTracking?: () => void;
  onOpenNotificationCenter?: () => void;
  onOpenBrandLogoModal?: () => void;
  onOpenShareQr?: (tab?: 'qr' | 'apk') => void;
  unreadNotificationCount?: number;
  currency: 'CLP' | 'USD' | 'MXN' | 'COP';
  onChangeCurrency: (curr: 'CLP' | 'USD' | 'MXN' | 'COP') => void;
  paymentConfig: PaymentCredentials;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  onOpenPaymentConfig,
  onOpenAdminPanel,
  onOpenTracking,
  onOpenNotificationCenter,
  onOpenBrandLogoModal,
  onOpenShareQr,
  unreadNotificationCount = 0,
  currency,
  onChangeCurrency,
  paymentConfig,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeLogo, setActiveLogo] = useState<BrandLogoOption>(() => getActiveBrandLogo());

  useEffect(() => {
    const handleLogoUpdate = (e: any) => {
      setActiveLogo(e.detail || getActiveBrandLogo());
    };
    window.addEventListener(BRAND_LOGO_CHANGED_EVENT, handleLogoUpdate);
    return () => window.removeEventListener(BRAND_LOGO_CHANGED_EVENT, handleLogoUpdate);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-orange-200 shadow-sm">
      {/* Top Banner with Trust & Impulse Psychology Triggers */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white px-4 py-1.5 text-xs font-bold border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          {/* Trust Guarantee & Free Shipping Trigger */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 font-black text-amber-400">
              <Zap className="w-3.5 h-3.5 fill-amber-400" />
              <span>ENVÍO GRATIS sobre $45.000</span>
            </span>
            <span className="hidden md:inline text-slate-500">•</span>
            <span className="hidden md:flex items-center gap-1 text-emerald-400 font-extrabold text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              100% Calce Ergonómico Garantizado
            </span>
            <span className="hidden lg:inline text-slate-500">•</span>
            <span className="hidden lg:flex items-center gap-1 text-slate-300 text-[11px]">
              <Dog className="w-3 h-3 text-orange-400" />
              Taller Artesanal Rengo, Chile
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {/* Notification Center Link */}
            {onOpenNotificationCenter && (
              <button
                type="button"
                onClick={onOpenNotificationCenter}
                className="bg-slate-800/80 hover:bg-slate-800 text-yellow-300 px-2.5 py-0.5 rounded-full font-black text-[11px] flex items-center gap-1 transition-all cursor-pointer border border-yellow-400/40"
              >
                <Bell className="w-3 h-3 text-yellow-300" />
                <span>Alertas 🔔</span>
                {unreadNotificationCount > 0 && (
                  <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-black ml-0.5">
                    {unreadNotificationCount}
                  </span>
                )}
              </button>
            )}

            {/* Quick Live Tracking Link in top banner */}
            {onOpenTracking && (
              <button
                type="button"
                onClick={onOpenTracking}
                className="bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 px-2.5 py-0.5 rounded-full font-black text-[11px] flex items-center gap-1 transition-all cursor-pointer border border-emerald-500/40"
              >
                <Truck className="w-3 h-3 text-emerald-400" />
                <span>Rastrear Envío 📦</span>
              </button>
            )}

            {/* Share QR & APK Link in top banner */}
            {onOpenShareQr && (
              <button
                type="button"
                onClick={() => onOpenShareQr('qr')}
                className="bg-amber-950/90 hover:bg-amber-900 text-amber-300 px-2.5 py-0.5 rounded-full font-black text-[11px] flex items-center gap-1 transition-all cursor-pointer border border-amber-400/40"
                title="Compartir enlace con código QR o descargar como APK Android"
              >
                <QrCode className="w-3 h-3 text-amber-300" />
                <span>QR &amp; APK 📲</span>
              </button>
            )}

            {/* Social Links */}
            <div className="hidden sm:flex items-center gap-2 text-slate-300">
              <a
                href="https://instagram.com/petsimona25"
                target="_blank"
                rel="noreferrer"
                className="hover:text-amber-400 transition-colors flex items-center gap-1 text-[11px]"
                title="Instagram @petsimona25"
              >
                <Instagram className="w-3 h-3" />
                <span>Instagram</span>
              </a>
              <a
                href="https://tiktok.com/@petsimona25"
                target="_blank"
                rel="noreferrer"
                className="hover:text-amber-400 transition-colors flex items-center gap-1 text-[11px]"
                title="TikTok @petsimona25"
              >
                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.38a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.64a6.34 6.34 0 0 0 10.82 4.48A6.3 6.3 0 0 0 15.8 15V8.5a8.28 8.28 0 0 0 4.79 1.51V6.56a4.8 4.8 0 0 1-1-.13z"/>
                </svg>
                <span>TikTok</span>
              </a>
            </div>

            <div className="h-3 w-px bg-slate-700 hidden sm:block" />

            <div className="flex items-center gap-1 bg-emerald-950/90 text-emerald-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-emerald-500/40">
              <Lock className="w-2.5 h-2.5 text-emerald-400" />
              <span>Pago Seguro SSL</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-600 to-amber-700 p-0.5 shadow-md group-hover:scale-105 transition-transform overflow-hidden ring-2 ring-amber-300/60">
              <img
                src={activeLogo.src}
                alt="petsimona25 logo oficial"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-2xl bg-white"
              />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>petsimona25</span>
                <span className="text-[10px] uppercase tracking-widest font-black px-2 py-0.5 bg-amber-100 text-amber-950 rounded-full border border-amber-300">
                  A la Medida
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-bold">
                Alta Costura Canina • Rengo, Chile
              </p>
            </div>
          </a>

          {/* Quick Logo Customizer / Palette Badge */}
          {onOpenBrandLogoModal && (
            <button
              type="button"
              onClick={onOpenBrandLogoModal}
              className="hidden sm:flex items-center gap-1 text-[10px] font-black text-amber-800 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded-xl border border-amber-200 transition-colors cursor-pointer"
              title="Ver variantes del Logotipo Oficial petsimona25"
            >
              <Palette className="w-3 h-3 text-amber-600" />
              <span>Logotipo</span>
            </button>
          )}
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-4 font-bold text-sm text-slate-700">
          <a href="#medidas-form" className="text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 transition-all flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-black text-xs uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
            Diseño a Medida
          </a>
          <a href="#catalogo" className="hover:text-orange-600 transition-colors text-slate-800 font-extrabold">
            Catálogo
          </a>
          <a href="#tutorial-medidas" className="hover:text-orange-600 transition-colors">
            Guía Medidas
          </a>
          <a href="#historia" className="text-emerald-800 hover:text-emerald-600 transition-colors flex items-center gap-1 font-extrabold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 text-xs">
            🏞️ Historia
          </a>
          <a href="#calculadora-envios" className="hover:text-orange-600 transition-colors text-slate-700">
            🚚 Envíos
          </a>
          <a href="#blog" className="hover:text-orange-600 transition-colors">
            Blog
          </a>
          <a href="#testimonios" className="hover:text-orange-600 transition-colors">
            Reseñas
          </a>

          {/* Tracking Trigger in Nav */}
          {onOpenTracking && (
            <button
              type="button"
              onClick={onOpenTracking}
              className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-950 font-black rounded-full border border-amber-200 text-xs flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
              title="Rastrear estado de tu pedido con código"
            >
              <Truck className="w-3.5 h-3.5 text-amber-700" />
              <span>Rastreo</span>
            </button>
          )}

          {/* QR & APK Trigger in Nav */}
          {onOpenShareQr && (
            <button
              type="button"
              onClick={() => onOpenShareQr('qr')}
              className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-950 font-black rounded-full border border-amber-200 text-xs flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
              title="Compartir enlace con código QR y descargar como APK"
            >
              <QrCode className="w-3.5 h-3.5 text-amber-700" />
              <span>QR / APK</span>
            </button>
          )}
        </nav>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Share QR & APK Tool */}
          {onOpenShareQr && (
            <button
              type="button"
              onClick={() => onOpenShareQr('qr')}
              className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition-colors relative cursor-pointer"
              title="Compartir enlace con Código QR o Instalar APK Android"
            >
              <QrCode className="w-4 h-4 text-slate-700" />
              <span className="sr-only">Compartir QR y APK</span>
            </button>
          )}

          {/* Currency Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full border border-slate-200 text-xs font-bold text-slate-700">
            <Globe className="w-3.5 h-3.5 text-slate-400 ml-1" />
            {(['CLP', 'USD', 'MXN', 'COP'] as const).map((curr) => (
              <button
                key={curr}
                onClick={() => onChangeCurrency(curr)}
                className={`px-2.5 py-0.5 rounded-full transition-all cursor-pointer ${
                  currency === curr
                    ? 'bg-slate-900 text-yellow-400 shadow-xs font-black'
                    : 'hover:bg-slate-200 text-slate-600'
                }`}
              >
                {curr === 'CLP' ? '$ CLP' : curr}
              </button>
            ))}
          </div>

          {/* Notification Center Bell Trigger */}
          {onOpenNotificationCenter && (
            <button
              onClick={onOpenNotificationCenter}
              className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition-colors relative cursor-pointer"
              title="Centro de Notificaciones & Alertas Web Push"
            >
              <Bell className="w-4 h-4 text-slate-700" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] w-4.5 h-4.5 flex items-center justify-center rounded-full border-2 border-white font-black animate-pulse">
                  {unreadNotificationCount}
                </span>
              )}
            </button>
          )}

          {/* Payment Credentials */}
          <button
            onClick={onOpenPaymentConfig}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition-colors relative cursor-pointer"
            title="Agregar Credenciales de Pago (Mercado Pago & PayPal)"
          >
            <Settings className="w-4 h-4 text-slate-700" />
            <span className="sr-only">Agregar Credenciales de Pago</span>
          </button>

          {/* Admin Panel Button */}
          <button
            onClick={onOpenAdminPanel}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-yellow-400 rounded-full border border-slate-700 text-xs font-black transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Panel Dueña - Control de Producción"
          >
            <Scissors className="w-3.5 h-3.5 text-orange-400" />
            <span className="hidden sm:inline">Taller 👑</span>
          </button>

          {/* High-Impulse Cart Drawer Trigger */}
          <button
            onClick={onOpenCart}
            id="cart-btn"
            className="relative bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white px-3.5 py-2 rounded-full shadow-lg shadow-orange-500/25 transition-all active:scale-95 flex items-center gap-2 cursor-pointer border border-amber-300/40"
          >
            <ShoppingBag className="w-4 h-4 text-white" />
            <span className="text-xs font-black hidden sm:inline">Carrito</span>
            {cartCount > 0 ? (
              <span className="bg-slate-950 text-yellow-300 text-[11px] font-black px-2 py-0.5 rounded-full border border-yellow-400 shadow-xs">
                {cartCount}
              </span>
            ) : (
              <span className="bg-orange-700/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                0
              </span>
            )}
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
            aria-label="Abrir menú de navegación"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b-2 border-orange-200 px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-150">
          <div className="grid grid-cols-2 gap-2 text-xs font-bold">
            <a
              href="#medidas-form"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-orange-600 text-white flex items-center gap-2 font-black"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>A la Medida</span>
            </a>
            <a
              href="#catalogo"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-slate-100 text-slate-900 flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4 text-orange-600" />
              <span>Catálogo</span>
            </a>
            <a
              href="#tutorial-medidas"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-slate-100 text-slate-900 flex items-center gap-2"
            >
              <span>Guía Medidas</span>
            </a>
            <a
              href="#historia"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-emerald-50 text-emerald-900 flex items-center gap-2"
            >
              <span>🏞️ Historia</span>
            </a>
            <a
              href="#calculadora-envios"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-slate-100 text-slate-900 flex items-center gap-2"
            >
              <span>🚚 Envíos</span>
            </a>
            <a
              href="#blog"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-slate-100 text-slate-900 flex items-center gap-2"
            >
              <span>Blog &amp; Tips</span>
            </a>
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            {onOpenShareQr && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenShareQr('qr');
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
                <span>Compartir Código QR &amp; App APK 📲</span>
              </button>
            )}

            {onOpenTracking && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenTracking();
                }}
                className="w-full py-2 px-3 rounded-xl bg-emerald-50 text-emerald-900 font-bold text-xs flex items-center justify-center gap-2 border border-emerald-200 cursor-pointer"
              >
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>Rastrear Mi Envío 📦</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

