import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  QrCode,
  Smartphone,
  Share2,
  Copy,
  Check,
  Download,
  ExternalLink,
  MessageCircle,
  Sparkles,
  Info,
  ShieldCheck,
  Globe,
  Scissors,
  ShoppingBag,
  Truck,
  Home,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import {
  SHARE_SECTIONS,
  OFFICIAL_DOMAIN,
  getBaseShareUrl,
  generateQrDataUrl,
  downloadBrandedQrImage,
  subscribePwaInstallAvailability,
  promptPwaInstall,
  isAppAlreadyInstalled,
  downloadAndroidLauncherPackage,
  QR_SIZE_PRESETS,
  getSavedQrSize,
  setSavedQrSize,
} from '../services/shareQrService';
import { getActiveDomain, subscribeDomainChanges } from '../services/customDomainService';
import pwaWebApkBanner from '../assets/images/pet_apparel_pwa_1789670605527.jpg';

interface ShareQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'qr' | 'apk';
  onOpenCustomDomain?: () => void;
  onOpenVisualCatalog?: () => void;
}

export const ShareQrModal: React.FC<ShareQrModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'qr',
  onOpenCustomDomain,
  onOpenVisualCatalog,
}) => {
  const [activeTab, setActiveTab] = useState<'qr' | 'apk'>(defaultTab);
  const [selectedSectionId, setSelectedSectionId] = useState<string>('home');
  const [useOfficialDomain, setUseOfficialDomain] = useState<boolean>(true);
  const [activeDomain, setActiveDomain] = useState<string>(getActiveDomain());
  const [qrSizePx, setQrSizePx] = useState<number>(() => getSavedQrSize());
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [canInstallPwa, setCanInstallPwa] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [installStatusMsg, setInstallStatusMsg] = useState<string | null>(null);

  // Sync defaultTab when opened
  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
      setIsInstalled(isAppAlreadyInstalled());
      setActiveDomain(getActiveDomain());
      setQrSizePx(getSavedQrSize());
    }
  }, [isOpen, defaultTab]);

  // Track PWA install availability and custom domain changes
  useEffect(() => {
    const unsubscribePwa = subscribePwaInstallAvailability((available) => {
      setCanInstallPwa(available);
    });
    const unsubscribeDomain = subscribeDomainChanges((newDomain) => {
      setActiveDomain(newDomain);
    });
    return () => {
      unsubscribePwa();
      unsubscribeDomain();
    };
  }, []);

  // Compute selected full URL
  const selectedSection = SHARE_SECTIONS.find((s) => s.id === selectedSectionId) || SHARE_SECTIONS[0];
  const baseUrl = useOfficialDomain ? activeDomain : getBaseShareUrl();
  const fullShareUrl = selectedSection.path === '/' ? baseUrl : `${baseUrl}${selectedSection.path}`;

  const handleSelectQrSize = (size: number) => {
    setQrSizePx(size);
    setSavedQrSize(size);
  };

  // Generate QR code whenever URL, tab or size changes
  useEffect(() => {
    let isCurrent = true;
    setIsGenerating(true);

    generateQrDataUrl(fullShareUrl, {
      width: Math.max(qrSizePx * 1.5, 360),
      colorDark: activeTab === 'apk' ? '#0f172a' : '#1e293b',
      colorLight: '#ffffff',
    })
      .then((dataUri) => {
        if (isCurrent) {
          setQrDataUrl(dataUri);
          setIsGenerating(false);
        }
      })
      .catch(() => {
        if (isCurrent) setIsGenerating(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [fullShareUrl, activeTab, qrSizePx]);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullShareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      // Fallback
      const input = document.createElement('input');
      input.value = fullShareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShareWhatsApp = () => {
    const text =
      activeTab === 'apk'
        ? `📲 ¡Hola! Te invito a instalar la App de petsimona25 en tu celular Android 🐾 Ropa a la medida para mascotas hecha en Rengo, Chile. Abre el enlace e instálala en 1 toque:\n\n${fullShareUrl}`
        : `🐾 ¡Hola! Te comparto la tienda oficial de petsimona25.cl: Alta costura canina y ropa a la medida para mascotas en Rengo, Chile 👗✨\n\nConoce más aquí: ${fullShareUrl}`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'petsimona25.cl - Ropa para Mascotas a la Medida',
          text:
            activeTab === 'apk'
              ? 'Instala la aplicación oficial de petsimona25 en tu celular Android.'
              : 'Confección artesanal y sustentable de ropa a la medida para mascotas en Rengo, Chile.',
          url: fullShareUrl,
        });
      } catch (err) {
        // User cancelled or not supported
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDownloadQr = () => {
    const title = activeTab === 'apk' ? 'Instalar App Android' : selectedSection.name;
    downloadBrandedQrImage(fullShareUrl, `petsimona25 - ${title}`);
  };

  const handleInstallClick = async () => {
    setInstallStatusMsg(null);
    if (canInstallPwa) {
      const outcome = await promptPwaInstall();
      if (outcome === 'accepted') {
        setInstallStatusMsg('🎉 ¡Gracias por instalar petsimona25 en tu dispositivo!');
        setIsInstalled(true);
      } else {
        setInstallStatusMsg('Instalación cancelada. Puedes volver a intentarlo en cualquier momento.');
      }
    } else {
      setInstallStatusMsg(
        'En Android: abre el menú de Chrome (⋮) y presiona "Instalar aplicación" o "Agregar a la pantalla principal".'
      );
    }
  };

  return (
    <div
      id="share-qr-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="share-qr-modal-container"
        className="bg-white rounded-3xl shadow-2xl border-2 border-amber-200 max-w-2xl w-full overflow-hidden my-6 transition-all animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-300 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 ring-2 ring-amber-400/40 flex items-center justify-center p-2.5 text-amber-300">
              {activeTab === 'qr' ? <QrCode className="w-7 h-7" /> : <Smartphone className="w-7 h-7" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Compartir petsimona25
                </h2>
                <span className="bg-amber-400 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  QR &amp; APK
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300">
                Código QR para escanear en cualquier celular o instalar como App Android (APK).
              </p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex gap-2 mt-4 bg-slate-950/60 p-1 rounded-2xl border border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab('qr')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                activeTab === 'qr'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Código QR de Página Web</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('apk')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                activeTab === 'apk'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Smartphone className="w-4 h-4 text-emerald-300" />
              <span>Compartir como APK (Android)</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* TAB 1: CODIGO QR WEB */}
          {activeTab === 'qr' && (
            <div className="space-y-5">
              {/* Section Selector */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-2">
                  ¿Qué enlace deseas compartir?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SHARE_SECTIONS.map((sec) => (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => setSelectedSectionId(sec.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        selectedSectionId === sec.id
                          ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-500/20 shadow-xs'
                          : 'border-slate-200 hover:border-amber-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black text-slate-900 line-clamp-1">
                          {sec.name}
                        </span>
                        {selectedSectionId === sec.id && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-2 leading-tight">
                        {sec.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* QR Display Card */}
              <div className="bg-gradient-to-b from-amber-50/50 to-orange-50/30 rounded-2xl p-4 sm:p-6 border border-amber-200 flex flex-col sm:flex-row items-center gap-6">
                {/* QR Canvas / Image Preview */}
                <div className="relative group shrink-0 flex flex-col items-center">
                  <div
                    style={{
                      width: `${Math.min(qrSizePx, 240)}px`,
                      height: `${Math.min(qrSizePx, 240)}px`,
                      maxWidth: '100%',
                    }}
                    className="bg-white rounded-2xl p-3 shadow-md border-2 border-amber-300/80 flex items-center justify-center relative overflow-hidden transition-all"
                  >
                    {isGenerating ? (
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-medium">Generando QR...</span>
                      </div>
                    ) : (
                      <>
                        <img
                          src={qrDataUrl}
                          alt="Código QR petsimona25"
                          className="w-full h-full object-contain"
                        />
                        {/* Center Paw Badge */}
                        <div className="absolute inset-0 m-auto w-10 h-10 bg-amber-600 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white text-base pointer-events-none">
                          🐾
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* QR Size Selector Buttons */}
                  <div className="mt-2.5 w-full">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-500 mb-1">
                      <span className="flex items-center gap-1 text-slate-700">
                        <Sliders className="w-3 h-3 text-amber-600" />
                        Tamaño:
                      </span>
                      <span className="text-amber-700 font-mono font-black">{qrSizePx}px</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                      {QR_SIZE_PRESETS.map((sz) => (
                        <button
                          key={sz.id}
                          type="button"
                          onClick={() => handleSelectQrSize(sz.dimensionPx)}
                          className={`py-1 text-[10px] font-black rounded-lg transition-all cursor-pointer text-center ${
                            qrSizePx === sz.dimensionPx
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'bg-white hover:bg-amber-50 text-slate-700 border border-amber-200'
                          }`}
                          title={sz.description}
                        >
                          {sz.id.toUpperCase()} ({sz.dimensionPx}px)
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Info & Action Buttons */}
                <div className="flex-1 space-y-3.5 w-full">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-amber-800 block">
                      Enlace Destino
                    </span>
                    <div className="mt-1 flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 break-all">
                      <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate">{fullShareUrl}</span>
                    </div>
                  </div>

                  {/* Domain Selector & Customizer */}
                  <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 text-xs gap-2">
                    <div className="flex items-center gap-1.5 text-slate-700 truncate">
                      <Globe className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="font-mono text-slate-900 font-bold truncate">
                        {activeDomain.replace(/^https?:\/\//, '')}
                      </span>
                    </div>
                    {onOpenCustomDomain ? (
                      <button
                        type="button"
                        onClick={onOpenCustomDomain}
                        className="text-xs font-black text-amber-700 hover:text-amber-900 underline shrink-0 cursor-pointer"
                      >
                        Personalizar Dominio
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setUseOfficialDomain(!useOfficialDomain)}
                        className="text-xs font-black text-amber-700 hover:text-amber-900 underline cursor-pointer"
                      >
                        {useOfficialDomain ? 'Oficial' : 'Vista'}
                      </button>
                    )}
                  </div>

                  {/* Action Buttons Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs ${
                        copied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? '¡Enlace Copiado!' : 'Copiar Enlace'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleShareWhatsApp}
                      className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white transition-all cursor-pointer shadow-xs"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Enviar por WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNativeShare}
                      className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-600 text-slate-950 transition-all cursor-pointer shadow-xs"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Compartir en Móvil</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadQr}
                      className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-black bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 transition-all cursor-pointer shadow-xs"
                    >
                      <Download className="w-4 h-4 text-amber-600" />
                      <span>Descargar Imagen QR</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Tips for Store Owner */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-start gap-2.5 text-xs text-slate-600">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  <strong>💡 Tip para el taller en Rengo:</strong> Puedes imprimir la imagen QR descargada y pegarla en el mesón de atención o incluirla en las tarjetas de presentación y etiquetas de despacho de tus prendas.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: COMPARTIR COMO APK (ANDROID) */}
          {activeTab === 'apk' && (
            <div className="space-y-5">
              {/* Master Promotional Banner: Artisan Pet Clothing & PWA / WebAPK */}
              <div className="relative rounded-3xl overflow-hidden border-2 border-emerald-400/50 shadow-xl bg-slate-950 group">
                <div className="relative h-48 sm:h-56 w-full overflow-hidden">
                  <img
                    src={pwaWebApkBanner}
                    alt="Banner Promocional: Ropa para Mascotas Artesanal en Taller Rengo - PWA WebAPK"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 select-none"
                    referrerPolicy="no-referrer"
                  />
                  {/* Subtle Gradient Overlays for optimal text contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-900/30" />
                  <div className="absolute inset-0 bg-radial-at-t from-transparent via-black/20 to-black/70" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-slate-950" />
                        Confección Artesanal a la Medida
                      </span>
                      <span className="bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
                        App Móvil PWA &amp; WebAPK
                      </span>
                    </div>
                    <span className="bg-slate-900/80 backdrop-blur-md text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-400/30 hidden sm:inline-flex items-center gap-1">
                      <span>🧵 Taller Rengo, Chile</span>
                    </span>
                  </div>

                  {/* Bottom Text & Pitch */}
                  <div className="absolute bottom-3 left-3 right-3 text-white space-y-1">
                    <h3 className="text-base sm:text-xl font-black text-white tracking-tight leading-snug drop-shadow-md flex items-center gap-2">
                      <span>Ropa para Mascotas Artesanal en tu Celular</span>
                      <span className="text-amber-400">🐾</span>
                    </h3>
                    <p className="text-xs text-slate-200 font-medium line-clamp-2 max-w-xl drop-shadow-sm">
                      Lleva el taller de costura personalizado en tu bolsillo: suéteres térmicos, capas impermeables y arneses ergonómicos con calce exacto para Yorkshire, Chihuahuas, Galgos y más.
                    </p>
                  </div>
                </div>

                {/* Banner Footer Micro-Features */}
                <div className="bg-slate-900/95 border-t border-emerald-500/30 px-4 py-2.5 grid grid-cols-3 gap-2 text-center text-[10px] sm:text-[11px] font-bold text-emerald-200">
                  <div className="flex items-center justify-center gap-1">
                    <span>⚡</span>
                    <span className="truncate">Instalación en 1 Clic</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 border-x border-slate-800 px-1">
                    <span>📶</span>
                    <span className="truncate">Funciona Sin Conexión</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 text-amber-300">
                    <span>🔔</span>
                    <span className="truncate">Alertas de Despacho</span>
                  </div>
                </div>
              </div>

              {/* Highlight Card: WebAPK Android Technology */}
              <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white rounded-2xl p-5 border-2 border-emerald-500/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                  <Smartphone className="w-32 h-32 text-emerald-400" />
                </div>

                <div className="relative z-10 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-emerald-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Android WebAPK Certificado
                    </span>
                    <span className="text-xs text-emerald-300 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Sin tiendas pesadas • Instalación Segura
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-black text-white">
                    Instala la App de petsimona25 en tu celular Android
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                    Gracias al estándar oficial <strong>PWA &amp; Google WebAPK</strong>, tu teléfono Android crea un paquete de aplicación nativo (.apk) con ícono de Simona 🐾, acceso sin conexión, seguimiento de envíos y notificaciones Web Push.
                  </p>

                  {/* Primary Call to Action Button */}
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    {isInstalled ? (
                      <div className="bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>¡La App ya está instalada en tu dispositivo!</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleInstallClick}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black px-5 py-3 rounded-xl text-sm shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                      >
                        <Smartphone className="w-4 h-4 text-slate-950" />
                        <span>📱 Instalar App / APK en este Dispositivo</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleShareWhatsApp}
                      className="bg-slate-800 hover:bg-slate-700 text-yellow-300 font-bold px-4 py-3 rounded-xl text-xs flex items-center gap-2 border border-yellow-400/30 transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-400" />
                      <span>Compartir APK por WhatsApp</span>
                    </button>
                  </div>

                  {installStatusMsg && (
                    <p className="text-xs text-amber-300 bg-amber-950/60 p-2.5 rounded-xl border border-amber-500/30">
                      {installStatusMsg}
                    </p>
                  )}
                </div>
              </div>

              {/* 2-Column: QR to Install on Mobile + Direct APK Tools */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Mobile QR for Android Scan */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col items-center text-center space-y-3">
                  <div className="w-44 h-44 bg-white p-2 rounded-2xl border-2 border-emerald-300 shadow-sm flex items-center justify-center relative">
                    {isGenerating ? (
                      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <img
                          src={qrDataUrl}
                          alt="QR para instalar APK Android"
                          className="w-full h-full object-contain"
                        />
                        <div className="absolute inset-0 m-auto w-9 h-9 bg-emerald-600 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white text-xs pointer-events-none">
                          📱
                        </div>
                      </>
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-900 block">
                      Escanea con tu celular Android
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Abre con la cámara o Google Lens para instalar el APK en 1 toque.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => downloadBrandedQrImage(fullShareUrl, 'Instalar App Android petsimona25')}
                    className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar QR de Instalación APK</span>
                  </button>
                </div>

                {/* Additional APK Package Tools */}
                <div className="space-y-3">
                  {/* Download HTML Launcher Package */}
                  <div className="p-3.5 bg-white rounded-2xl border border-slate-200 hover:border-amber-300 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-black text-slate-900 block">
                          Descargar Acceso Instalador (.html)
                        </span>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Archivo lanzador que puedes transferir por Bluetooth, WhatsApp o cable a teléfonos Android.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => downloadAndroidLauncherPackage(fullShareUrl)}
                        className="bg-amber-100 hover:bg-amber-200 text-amber-900 p-2 rounded-xl transition-colors cursor-pointer shrink-0"
                        title="Descargar paquete lanzador"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Compilar APK para Google Play Store */}
                  <div className="p-3.5 bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-black text-slate-900 block">
                          Generar APK con PWABuilder
                        </span>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Herramienta oficial para empaquetar tu PWA como un archivo .apk firmado para publicar en Google Play Store.
                        </p>
                      </div>
                      <a
                        href={`https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(fullShareUrl)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-emerald-100 hover:bg-emerald-200 text-emerald-900 p-2 rounded-xl transition-colors cursor-pointer shrink-0 inline-flex items-center"
                        title="Abrir generador oficial de APK"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  {/* Ver Manifiesto Web */}
                  <div className="p-3.5 bg-white rounded-2xl border border-slate-200 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-black text-slate-900 block">
                        Manifest PWA (manifest.json)
                      </span>
                      <p className="text-[11px] text-slate-500">
                        Configurado con íconos 512x512, tema #d97706 y modo standalone.
                      </p>
                    </div>
                    <a
                      href="/manifest.json"
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-slate-600 hover:text-slate-900 underline flex items-center gap-1"
                    >
                      <span>Ver JSON</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Step-by-Step Android Guide */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                  Pasos para instalar en cualquier Android:
                </span>
                <ol className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-slate-700">
                  <li className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[11px] flex items-center justify-center mb-1.5">
                      1
                    </span>
                    <strong>Abre en Chrome:</strong> Escanea el código QR o entra a <em>petsimona25.cl</em> desde tu celular.
                  </li>
                  <li className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[11px] flex items-center justify-center mb-1.5">
                      2
                    </span>
                    <strong>Toca el menú (⋮):</strong> Selecciona <em>"Instalar aplicación"</em> o <em>"Agregar a la pantalla principal"</em>.
                  </li>
                  <li className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[11px] flex items-center justify-center mb-1.5">
                      3
                    </span>
                    <strong>¡Listo!:</strong> La App se instala como APK nativo con ícono en tu menú y alertas automáticas de pedidos.
                  </li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>petsimona25.cl • Confección Artesanal a la Medida en Rengo, Chile</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
