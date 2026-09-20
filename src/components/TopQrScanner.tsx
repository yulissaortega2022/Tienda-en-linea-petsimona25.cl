import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Smartphone,
  Download,
  Copy,
  Check,
  ExternalLink,
  Maximize2,
  ChevronDown,
  ChevronUp,
  Camera,
  Share2,
  Sparkles,
  ShoppingBag,
  Scissors,
  Home,
  Truck,
  CheckCircle2,
  Globe,
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
  QR_SIZE_PRESETS,
  getSavedQrSize,
  setSavedQrSize,
} from '../services/shareQrService';
import { getActiveDomain, subscribeDomainChanges } from '../services/customDomainService';
import pwaWebApkBanner from '../assets/images/pwa_webapk_banner_1789667892724.jpg';

interface TopQrScannerProps {
  onOpenFullModal?: (tab?: 'qr' | 'apk') => void;
  onOpenCustomDomain?: () => void;
  onOpenVisualCatalog?: () => void;
}

export const TopQrScanner: React.FC<TopQrScannerProps> = ({
  onOpenFullModal,
  onOpenCustomDomain,
  onOpenVisualCatalog,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [selectedSectionId, setSelectedSectionId] = useState<string>('home');
  const [useOfficialDomain, setUseOfficialDomain] = useState<boolean>(true);
  const [activeDomain, setActiveDomain] = useState<string>(getActiveDomain());
  const [qrSizePx, setQrSizePx] = useState<number>(() => getSavedQrSize());
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [canInstallPwa, setCanInstallPwa] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  useEffect(() => {
    const unsubPwa = subscribePwaInstallAvailability((available) => {
      setCanInstallPwa(available);
    });
    const unsubDomain = subscribeDomainChanges((newDomain) => {
      setActiveDomain(newDomain);
    });
    return () => {
      unsubPwa();
      unsubDomain();
    };
  }, []);

  const selectedSection = SHARE_SECTIONS.find((s) => s.id === selectedSectionId) || SHARE_SECTIONS[0];
  const baseUrl = useOfficialDomain ? activeDomain : getBaseShareUrl();
  const fullShareUrl = selectedSection.path === '/' ? baseUrl : `${baseUrl}${selectedSection.path}`;

  const handleSelectQrSize = (size: number) => {
    setQrSizePx(size);
    setSavedQrSize(size);
  };

  // Generate QR code whenever the URL or size changes
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    generateQrDataUrl(fullShareUrl, {
      width: Math.max(qrSizePx * 1.5, 360),
      colorDark: '#0f172a',
      colorLight: '#ffffff',
    })
      .then((url) => {
        if (isMounted) {
          setQrDataUrl(url);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error in TopQrScanner:', err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [fullShareUrl, qrSizePx]);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(fullShareUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = fullShareUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch (err) {
      console.warn('Copy failed', err);
    }
  };

  const handleDownloadPoster = async () => {
    try {
      setIsDownloading(true);
      await downloadBrandedQrImage(
        fullShareUrl,
        selectedSection.name.replace(/[^a-zA-Z0-9 áéíóúÁÉÍÓÚ]/g, '').trim() || 'petsimona25.cl',
        'Ropa a la Medida • Taller en Rengo, Chile'
      );
    } catch (err) {
      console.error('Error downloading QR:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'petsimona25.cl | Ropa para Mascotas a la Medida',
          text: `¡Mira la ropa a la medida para mascotas de petsimona25 en Rengo! Entra aquí:`,
          url: fullShareUrl,
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="w-full mb-8" id="qr-superior-escaner">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-orange-600 to-amber-600 p-1 shadow-2xl border-2 border-yellow-300 ring-4 ring-orange-500/20">
        <div className="relative rounded-[22px] bg-slate-950/95 backdrop-blur-xl p-4 sm:p-6 text-white">
          
          {/* Header Bar inside Card */}
          <div className="flex items-center justify-between gap-3 border-b border-slate-800/80 pb-3 mb-4">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-yellow-300 border border-amber-400/40 text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5 text-yellow-400" />
                  Escanear con Cámara o Google Lens
                </span>
                <span className="hidden sm:inline-block text-xs text-slate-300 font-semibold">
                  • petsimona25.cl en tu Móvil 📲
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {onOpenCustomDomain && (
                <button
                  type="button"
                  onClick={onOpenCustomDomain}
                  className="flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-yellow-200 bg-slate-900 hover:bg-slate-800 px-2.5 py-1 rounded-lg border border-amber-500/40 transition-colors cursor-pointer"
                  title="Cambiar dominio vigente de la app"
                >
                  <Globe className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Dominio:</span>
                  <span className="font-mono text-white text-[10px] truncate max-w-[120px]">
                    {activeDomain.replace(/^https?:\/\//, '')}
                  </span>
                </button>
              )}

              {onOpenVisualCatalog && (
                <button
                  type="button"
                  onClick={onOpenVisualCatalog}
                  className="flex items-center gap-1 text-[11px] font-bold text-white bg-orange-600 hover:bg-orange-500 px-2.5 py-1 rounded-lg shadow-xs transition-colors cursor-pointer"
                  title="Abrir catálogo visual con fotos y lookbook"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Catálogo Visual 📸</span>
                </button>
              )}

              {onOpenFullModal && (
                <button
                  type="button"
                  onClick={() => onOpenFullModal('apk')}
                  className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-yellow-200 bg-slate-900 hover:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 transition-colors cursor-pointer"
                  title="Opciones avanzadas e instalador APK Android"
                >
                  <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                  <span>Instalar APK</span>
                </button>
              )}

              {/* Minimize / Expand Toggle */}
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 text-xs font-bold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                title={isExpanded ? 'Minimizar escáner QR' : 'Mostrar escáner QR grande'}
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="w-4 h-4 text-amber-400" />
                    <span className="hidden md:inline">Ocultar</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 text-amber-400" />
                    <span>Ver QR Grande</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Main Scannable Content (Expanded) */}
          {isExpanded ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              
              {/* Left Column: BIG HIGH-CONTRAST QR CODE */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <div className="relative group">
                  {/* Outer Glowing Scanner Frame */}
                  <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-amber-400 rounded-3xl blur-md opacity-70 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="relative p-4 sm:p-5 bg-white rounded-2xl shadow-2xl border-4 border-amber-400 flex flex-col items-center justify-center">
                    
                    {/* Scanner Targeting Corner Reticles */}
                    <div className="absolute top-2 left-2 w-5 h-5 border-t-4 border-l-4 border-orange-600 rounded-tl-sm pointer-events-none"></div>
                    <div className="absolute top-2 right-2 w-5 h-5 border-t-4 border-r-4 border-orange-600 rounded-tr-sm pointer-events-none"></div>
                    <div className="absolute bottom-2 left-2 w-5 h-5 border-b-4 border-l-4 border-orange-600 rounded-bl-sm pointer-events-none"></div>
                    <div className="absolute bottom-2 right-2 w-5 h-5 border-b-4 border-r-4 border-orange-600 rounded-br-sm pointer-events-none"></div>

                    {/* QR Code Canvas / Image - Dynamic Size according to qrSizePx */}
                    <div
                      style={{
                        width: `${Math.min(qrSizePx, 280)}px`,
                        height: `${Math.min(qrSizePx, 280)}px`,
                        maxWidth: '100%',
                      }}
                      className="relative flex items-center justify-center bg-white transition-all duration-300"
                    >
                      {isLoading ? (
                        <div className="flex flex-col items-center gap-2 text-slate-400 text-xs font-bold animate-pulse">
                          <QrCode className="w-10 h-10 text-orange-500 animate-spin" />
                          <span>Generando QR en alta resolución...</span>
                        </div>
                      ) : qrDataUrl ? (
                        <>
                          <img
                            src={qrDataUrl}
                            alt={`Código QR para escanear petsimona25.cl - ${selectedSection.name}`}
                            className="w-full h-full object-contain select-none"
                          />
                          {/* Centered Brand Stamp inside QR */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-11 h-11 bg-white rounded-full shadow-lg border-2 border-orange-600 flex items-center justify-center">
                              <span className="text-base" role="img" aria-label="patita">🐾</span>
                            </div>
                          </div>
                        </>
                      ) : null}
                    </div>

                    {/* Under QR Caption */}
                    <div className="mt-2 text-center">
                      <p className="text-[11px] font-black text-slate-900 flex items-center justify-center gap-1">
                        <Camera className="w-3 h-3 text-orange-600" />
                        <span>Apunta la cámara de tu celular</span>
                      </p>
                      <p className="text-[10px] text-slate-500 font-semibold">
                        Compatible con iPhone, Android &amp; Google Lens
                      </p>
                    </div>

                    {/* QR Size Selector Controls */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 w-full flex flex-col items-center gap-1.5">
                      <div className="flex items-center justify-between w-full text-[10px] font-black uppercase text-slate-500">
                        <span className="flex items-center gap-1 text-slate-700">
                          <Sliders className="w-3 h-3 text-orange-600" />
                          Tamaño de QR:
                        </span>
                        <span className="text-orange-600 font-mono font-black">{qrSizePx}px</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1 w-full">
                        {QR_SIZE_PRESETS.map((sz) => (
                          <button
                            key={sz.id}
                            type="button"
                            onClick={() => handleSelectQrSize(sz.dimensionPx)}
                            className={`py-1 px-1 text-[10px] font-black rounded-lg transition-all cursor-pointer text-center ${
                              qrSizePx === sz.dimensionPx
                                ? 'bg-orange-600 text-white shadow-xs'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                            title={sz.description}
                          >
                            {sz.id.toUpperCase()} ({sz.dimensionPx}px)
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sub-label under QR */}
                <div className="mt-3 flex items-center gap-2 text-[11px] text-amber-200/90 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Resolución optimizada para escaneo rápido en pantallas</span>
                </div>
              </div>

              {/* Right Column: Title, Explanations, Selector, and Fast Actions */}
              <div className="lg:col-span-7 space-y-4">
                <div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-snug">
                    Escanea y Compra desde tu Celular{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-300 to-orange-400">
                      o Instala como App Móvil
                    </span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed font-normal">
                    Lleva el taller de confección canina de <strong className="text-yellow-300 font-bold">Rengo, Chile</strong> en tu bolsillo. Escanea para calcular medidas con tu cinta métrica directamente junto a tu mascota.
                  </p>
                </div>

                {/* Section Quick Chooser (Updates the QR instantly!) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                    <span>Elige qué sección abrir al escanear:</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {SHARE_SECTIONS.map((section) => {
                      const isSelected = selectedSectionId === section.id;
                      return (
                        <button
                          key={section.id}
                          type="button"
                          onClick={() => setSelectedSectionId(section.id)}
                          className={`p-2 rounded-xl text-left transition-all text-xs font-bold flex flex-col gap-0.5 border cursor-pointer ${
                            isSelected
                              ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white border-yellow-300 shadow-md ring-2 ring-orange-400/40'
                              : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          <span className="truncate">{section.name}</span>
                          <span className="text-[10px] opacity-75 truncate">{section.description.split('.')[0]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* URL Indicator & Switcher */}
                <div className="bg-slate-900/90 rounded-2xl p-3 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                      Enlace codificado en el QR:
                    </span>
                    <span className="text-xs font-mono font-bold text-yellow-300 truncate block">
                      {fullShareUrl}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setUseOfficialDomain(!useOfficialDomain)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-semibold cursor-pointer transition-colors"
                      title="Alternar entre dominio oficial petsimona25.cl y URL actual"
                    >
                      {useOfficialDomain ? '🌐 Oficial .cl' : '⚡ URL Actual'}
                    </button>

                    <button
                      type="button"
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1 text-[11px] px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black cursor-pointer shadow-xs transition-colors"
                      title="Copiar enlace al portapapeles"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-slate-950" />
                          <span>¡Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-950" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Action Buttons Row */}
                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleDownloadPoster}
                    disabled={isDownloading}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-4 h-4 text-slate-950" />
                    <span>{isDownloading ? 'Descargando...' : 'Descargar Imagen QR HD (PNG)'}</span>
                  </button>

                  {onOpenFullModal && (
                    <button
                      type="button"
                      onClick={() => onOpenFullModal('apk')}
                      className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-500/40 font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all cursor-pointer"
                    >
                      <Smartphone className="w-4 h-4 text-emerald-400" />
                      <span>Instalar como App (APK)</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleNativeShare}
                    className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs px-3 py-2.5 rounded-xl transition-all cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Compartir</span>
                  </button>

                  {onOpenFullModal && (
                    <button
                      type="button"
                      onClick={() => onOpenFullModal('qr')}
                      className="inline-flex items-center gap-1 text-slate-400 hover:text-white text-xs font-semibold px-2 py-2 transition-colors cursor-pointer ml-auto"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Ampliar</span>
                    </button>
                  )}
                </div>

                {/* Promotional Banner Card for Handcrafted Pet Clothing & PWA / WebAPK */}
                <div
                  onClick={() => onOpenFullModal?.('apk')}
                  className="relative rounded-2xl overflow-hidden border-2 border-emerald-500/40 bg-slate-900/90 hover:border-emerald-400 transition-all cursor-pointer group shadow-lg"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onOpenFullModal?.('apk');
                    }
                  }}
                >
                  <div className="flex flex-col sm:flex-row items-center gap-3 p-3">
                    <div className="w-full sm:w-28 h-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border border-emerald-400/40 relative shadow-sm">
                      <img
                        src={pwaWebApkBanner}
                        alt="Ropa de mascotas artesanal banner promocional PWA WebAPK"
                        className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500 select-none"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                      <span className="absolute bottom-1 left-1.5 text-[9px] bg-emerald-600 text-white font-black px-1.5 py-0.2 rounded shadow">
                        WebAPK
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 space-y-1 text-left">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="bg-amber-400 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Confección Artesanal
                        </span>
                        <span className="text-[10px] text-emerald-300 font-bold">
                          • Rengo, Chile
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-black text-white group-hover:text-yellow-300 transition-colors truncate">
                        Instala la App Oficial de Ropa para Mascotas
                      </h4>
                      <p className="text-[11px] text-slate-300 line-clamp-1">
                        Prendas a medida, cálculo ergonómico por raza y notificaciones de despacho directo en tu Android.
                      </p>
                    </div>

                    <div className="shrink-0 self-end sm:self-center">
                      <span className="bg-gradient-to-r from-emerald-500 to-teal-500 group-hover:from-emerald-400 group-hover:to-teal-400 text-slate-950 font-black text-[11px] px-3 py-1.5 rounded-xl shadow-md transition-all flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-slate-950" />
                        <span>Abrir Instalador</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Android / iPhone quick tips */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
                  <div className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-xl border border-slate-800/80">
                    <span className="text-base">🤖</span>
                    <div>
                      <strong className="text-white block font-bold">Android / Chrome:</strong>
                      <span className="text-slate-400">Escanea y toca "Agregar a la pantalla principal" para usar como App nativa.</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-xl border border-slate-800/80">
                    <span className="text-base">🍎</span>
                    <div>
                      <strong className="text-white block font-bold">iPhone / Safari:</strong>
                      <span className="text-slate-400">Escanea con tu cámara, abre en Safari y pulsa Compartir &gt; "Agregar a Inicio".</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            /* Minimized Bar when collapsed */
            <div className="flex items-center justify-between gap-4 py-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white p-1 shadow-md border border-amber-400 flex items-center justify-center shrink-0">
                  {qrDataUrl && <img src={qrDataUrl} alt="QR" className="w-full h-full object-contain" />}
                </div>
                <div>
                  <h3 className="text-sm font-black text-yellow-300">
                    Código QR Disponible para Escaneo Móvil
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedSection.name} • {fullShareUrl}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsExpanded(true)}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                >
                  <QrCode className="w-3.5 h-3.5 text-slate-950" />
                  <span>Mostrar Imagen Grande</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
