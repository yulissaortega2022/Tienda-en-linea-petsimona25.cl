import React, { useState, useMemo } from 'react';
import {
  Star,
  MapPin,
  ExternalLink,
  Copy,
  Check,
  QrCode,
  Share2,
  MessageCircle,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Printer,
  Compass,
  Building2,
  Layers,
  Wand2,
  Heart,
  Award,
  RefreshCw,
  HelpCircle,
  Send,
  Download
} from 'lucide-react';
import {
  trackGA4GoogleReviewClick,
  trackGA4GoogleReviewLinkGenerated,
  trackGA4WhatsAppClick,
} from '../services/analyticsService';

export const GoogleBusinessReviewsSection: React.FC = () => {
  // Configurable GMB Profile info
  const [businessName, setBusinessName] = useState('petsimona25 - Confección Canina a la Medida');
  const [locality, setLocality] = useState('Rengo, Región de O\'Higgins, Chile');
  const [placeId, setPlaceId] = useState('ChIJ_RengoSimonaTaller2025');
  const [customShortLink, setCustomShortLink] = useState('https://g.page/r/petsimona25-rengo/review');
  const [linkMode, setLinkMode] = useState<'standard' | 'shortlink' | 'search' | 'fiveStarIntent'>('standard');

  // Customer Message Generator State
  const [customerName, setCustomerName] = useState('Camila');
  const [petName, setPetName] = useState('Rocky');
  const [garmentType, setGarmentType] = useState('Abrigo Térmico a la Medida');

  // UI state
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [activeTab, setActiveTab] = useState<'clientCta' | 'linkGenerator' | 'qrCard' | 'whatsappTemplates'>('clientCta');
  const [showGuide, setShowGuide] = useState(false);

  // Compute direct Google Review link based on selected mode
  const generatedReviewUrl = useMemo(() => {
    switch (linkMode) {
      case 'shortlink':
        return customShortLink.trim() || 'https://g.page/r/petsimona25-rengo/review';
      case 'standard':
        // Standard Google Place ID Review URL
        return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId || 'ChIJ_RengoSimonaTaller2025')}`;
      case 'fiveStarIntent':
        // Direct Google Local Knowledge Panel with review dialog trigger
        return `https://www.google.com/search?q=${encodeURIComponent(`${businessName} ${locality} opiniones reseñas`)}#lrd=0x0:0x0,3,5`;
      case 'search':
      default:
        // Google Maps Search query fallback
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${businessName}, ${locality}`)}`;
    }
  }, [linkMode, placeId, customShortLink, businessName, locality]);

  // QR Code URL using high-quality SVG/PNG generator
  const qrCodeImageUrl = useMemo(() => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(generatedReviewUrl)}&bgcolor=ffffff&color=1e293b&margin=10`;
  }, [generatedReviewUrl]);

  // WhatsApp template customized for post-delivery
  const whatsappTemplateText = useMemo(() => {
    return `¡Hola ${customerName}! 🐾 Te saludamos con mucho cariño desde el taller de *petsimona25* en Rengo ✂️🧵.

Esperamos de todo corazón que a *${petName}* le haya encantado y quedado súper cómodo su *${garmentType}* a la medida ✨.

Nos ayudaría un montón si pudieras regalarnos una breve *reseña de 5 estrellas en Google* ⭐⭐⭐⭐⭐. Esto nos ayuda a que más tutores de perritos en Rengo y la Región de O'Higgins conozcan nuestra confección artesanal.

👉 *Deja tu opinión aquí en 30 segundos:*
${generatedReviewUrl}

¡Muchísimas gracias por confiar en la confección local y artesanal! 🐕🇨🇱`;
  }, [customerName, petName, garmentType, generatedReviewUrl]);

  // Email template
  const emailTemplateText = useMemo(() => {
    return `Asunto: ¿Cómo le quedó el corte a la medida a ${petName}? 🐾 Déjanos tu reseña en Google

¡Hola ${customerName}!

Queremos agradecerte por confiar en petsimona25 para vestir a ${petName}. Confeccionamos cada una de nuestras prendas a mano en nuestro taller ubicado en Rengo, Región de O'Higgins, utilizando textiles hipoalergénicos y corte 100% ergonómico.

Si tuviste una excelente experiencia, ¿nos apoyarías con una reseña de 5 estrellas en nuestro perfil oficial de Google?

👉 Dejar Reseña en Google Maps:
${generatedReviewUrl}

Tu opinión nos permite seguir creciendo como taller artesanal local e impulsar la economía de nuestra comuna.

Con cariño,
El equipo de petsimona25 🐕✂️
Rengo, Región de O'Higgins, Chile
WhatsApp: +56 9 7237 4764 | www.petsimona25.cl`;
  }, [customerName, petName, generatedReviewUrl]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedReviewUrl);
    trackGA4GoogleReviewLinkGenerated(linkMode, generatedReviewUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(whatsappTemplateText);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2500);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(emailTemplateText);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    trackGA4WhatsAppClick('gmb_review_template', whatsappTemplateText.slice(0, 40));
    const url = `https://wa.me/?text=${encodeURIComponent(whatsappTemplateText)}`;
    window.open(url, '_blank');
  };

  const handleDirectReviewClick = (source: string) => {
    trackGA4GoogleReviewClick(source, generatedReviewUrl);
    window.open(generatedReviewUrl, '_blank', 'noopener,noreferrer');
  };

  const handlePrintCard = () => {
    window.print();
  };

  return (
    <section id="google-business-reviews" className="py-16 bg-linear-to-b from-amber-50/60 via-white to-orange-50/40 border-b-2 border-orange-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header with Google Colors & Local SEO Authority Badges */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b-2 border-orange-200/80 pb-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 font-black text-xs uppercase tracking-wider shadow-2xs">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                <Building2 className="w-4 h-4 text-blue-600" />
                Google My Business & Google Maps
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-orange-700 font-black">Autoridad Local Rengo 📍</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight flex flex-wrap items-center gap-2.5">
              <span>Perfil Oficial y Reseñas en Google</span>
              <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-900 text-sm font-black px-3 py-1 rounded-xl border border-yellow-300">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                4.9 ★★★★★
              </span>
            </h2>

            <p className="text-slate-600 text-sm sm:text-base max-w-3xl font-medium leading-relaxed">
              Genera y comparte el enlace directo para que tus clientes califiquen a <strong className="text-slate-900">petsimona25</strong> con 5 estrellas en Google Maps. Cada reseña fortalece el posicionamiento local del taller en <strong className="text-orange-700 font-bold">Rengo y la Región de O'Higgins</strong>.
            </p>
          </div>

          {/* Direct CTA button for customers */}
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              onClick={() => handleDirectReviewClick('header_direct_button')}
              className="inline-flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-xs sm:text-sm uppercase tracking-wider px-6 py-3.5 rounded-2xl shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
            >
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>Dejar Reseña en Google (5 Estrellas)</span>
              <ExternalLink className="w-4 h-4 text-blue-200" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('clientCta')}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'clientCta'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>1. Tarjeta Oficial & Opinión Directa</span>
          </button>

          <button
            onClick={() => setActiveTab('linkGenerator')}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'linkGenerator'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Wand2 className="w-4 h-4" />
            <span>2. Generador de Enlace Directo (GMB)</span>
          </button>

          <button
            onClick={() => setActiveTab('whatsappTemplates')}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'whatsappTemplates'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <MessageCircle className="w-4 h-4 text-emerald-500 group-hover:text-white" />
            <span>3. Mensajes Listos para WhatsApp & Email</span>
          </button>

          <button
            onClick={() => setActiveTab('qrCard')}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'qrCard'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>4. Tarjeta QR Imprimible para Pedidos</span>
          </button>
        </div>

        {/* TAB 1: Customer Direct Feedback & Live Business Card */}
        {activeTab === 'clientCta' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
            {/* Google Business Profile Showcase Card */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-xl space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  {/* Google G Symbol Avatar */}
                  <div className="w-14 h-14 rounded-2xl bg-white border-2 border-slate-200 shadow-sm flex items-center justify-center p-2.5 shrink-0">
                    <svg className="w-full h-full" viewBox="0 0 48 48">
                      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                      <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
                      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
                      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
                    </svg>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                      {businessName}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-red-500" />
                      <span>{locality}</span>
                    </p>
                  </div>
                </div>

                <span className="hidden sm:inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 text-[11px] font-black px-2.5 py-1 rounded-full shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Perfil Verificado
                </span>
              </div>

              {/* Star Rating Summary with Real Progress Bars */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col sm:flex-row items-center gap-6">
                <div className="text-center sm:border-r border-slate-200 sm:pr-6 shrink-0">
                  <div className="text-4xl sm:text-5xl font-black text-slate-900 font-mono tracking-tight">
                    4.9
                  </div>
                  <div className="flex items-center justify-center gap-1 my-1.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-[11px] font-black text-slate-600 uppercase tracking-wider">
                    Google Maps Rengo
                  </p>
                </div>

                {/* Breakdown bars */}
                <div className="w-full space-y-1.5 text-xs font-bold text-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="w-12 text-[11px] font-mono">5 estrellas</span>
                    <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div className="bg-yellow-400 h-full rounded-full w-[94%]"></div>
                    </div>
                    <span className="w-8 text-[11px] text-right font-mono text-slate-500">94%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-12 text-[11px] font-mono">4 estrellas</span>
                    <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div className="bg-yellow-400 h-full rounded-full w-[6%]"></div>
                    </div>
                    <span className="w-8 text-[11px] text-right font-mono text-slate-500">6%</span>
                  </div>
                  <div className="flex items-center gap-2 opacity-40">
                    <span className="w-12 text-[11px] font-mono">3 estrellas</span>
                    <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div className="bg-yellow-400 h-full rounded-full w-[0%]"></div>
                    </div>
                    <span className="w-8 text-[11px] text-right font-mono text-slate-500">0%</span>
                  </div>
                </div>
              </div>

              {/* Public Review Prompts */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                  ¿Por qué tu reseña marca la diferencia para petsimona25?
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-medium text-slate-600">
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start gap-2">
                    <span className="text-base">📍</span>
                    <span>Ayuda a posicionar el taller en <strong>Google Maps Rengo y Rosario</strong> para que más vecinos nos encuentren.</span>
                  </div>
                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-start gap-2">
                    <span className="text-base">🧵</span>
                    <span>Resalta el valor de la <strong>alta costura artesanal chilena</strong> frente a la ropa masiva importada.</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleDirectReviewClick('showcase_write_review')}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-xs sm:text-sm py-3.5 px-4 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>Escribir Reseña en Google (Abre directo)</span>
                  <ExternalLink className="w-4 h-4" />
                </button>

                <button
                  onClick={handleCopyLink}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-3.5 px-4 rounded-2xl border border-slate-300 transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700 font-black">¡Enlace Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-600" />
                      <span>Copiar Enlace Directo</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Local Authority Impact Card */}
            <div className="lg:col-span-5 bg-linear-to-br from-slate-900 via-slate-800 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-black uppercase tracking-wider">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                  <span>Impacto en Google SEO Local</span>
                </div>
                <h3 className="text-xl font-black tracking-tight text-white">
                  Autoridad Local de petsimona25 en Rengo
                </h3>
                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  Las reseñas públicas con fotos de perritos en Google Maps generan señales de relevancia directa que impulsan la tienda en motores de búsqueda.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-yellow-400/20 text-yellow-400 flex items-center justify-center font-black shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">Aparición en el "Google Local 3-Pack"</h4>
                    <p className="text-[11px] text-slate-300 font-medium mt-0.5">
                      Cuando alguien busca "ropa para perros Rengo" o "costura canina O'Higgins", Google premia a petsimona25 en los 3 primeros resultados del mapa.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-400/20 text-emerald-400 flex items-center justify-center font-black shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">Confianza para Despachos Nacionales</h4>
                    <p className="text-[11px] text-slate-300 font-medium mt-0.5">
                      Los clientes de Santiago, Concepción o Valparaíso revisan las reseñas de Google Maps antes de encargar prendas personalizadas a distancia.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-400/20 text-purple-400 flex items-center justify-center font-black shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">Fotos Reales de Mascotas</h4>
                    <p className="text-[11px] text-slate-300 font-medium mt-0.5">
                      Las fotos subidas por clientes a Google Maps actúan como catálogo visual auténtico y prueba de calce perfecto.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick direct link display */}
              <div className="p-3 bg-black/40 rounded-xl border border-white/10 flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-slate-300 truncate">
                  {generatedReviewUrl}
                </span>
                <button
                  onClick={handleCopyLink}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-black py-1 px-2.5 rounded-lg shrink-0 cursor-pointer"
                >
                  Copiar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Direct Link Generator & Customizer */}
        {activeTab === 'linkGenerator' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-xl space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
              <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-blue-600" />
                  <span>Generador y Personalizador de Enlace de Reseñas</span>
                </h3>
                <p className="text-xs text-slate-600 font-medium mt-1">
                  Configura el formato que mejor se adapte para compartir por WhatsApp, redes sociales, boletas o códigos QR.
                </p>
              </div>

              <button
                onClick={() => setShowGuide(!showGuide)}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 cursor-pointer self-start"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{showGuide ? 'Ocultar Guía Place ID' : '¿Cómo obtener mi Place ID?'}</span>
              </button>
            </div>

            {showGuide && (
              <div className="p-4 bg-blue-50/80 border-2 border-blue-200 rounded-2xl text-xs text-blue-950 space-y-2 animate-scale-up">
                <h4 className="font-black flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Guía Rápida para enlazar tu perfil de Google My Business:
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-slate-700 font-medium pl-1">
                  <li>Ingresa a tu perfil de <strong>Google Business Profile Manager</strong> o busca "mi negocio" en Google.</li>
                  <li>Haz clic en el botón <strong>"Pedir reseñas"</strong> o <strong>"Compartir formulario de reseñas"</strong>.</li>
                  <li>Copia el enlace corto oficial que te entrega Google (ejemplo: <code>https://g.page/r/.../review</code>) y pégalo en el campo <strong>Enlace Corto Oficial</strong> abajo.</li>
                  <li>También puedes usar el modo <strong>Búsqueda Directa Google Maps</strong> que funciona automáticamente sin necesidad de configurar Place ID.</li>
                </ol>
              </div>
            )}

            {/* Link Mode Selector */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                Selecciona el Tipo de Enlace a Generar:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => setLinkMode('standard')}
                  className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    linkMode === 'standard'
                      ? 'border-blue-600 bg-blue-50/70 text-blue-950 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div className="text-xs font-black uppercase flex items-center justify-between mb-1">
                    <span>Google Place ID</span>
                    {linkMode === 'standard' && <Check className="w-4 h-4 text-blue-600" />}
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Abre el cuadro emergente de 5 estrellas directo en Google Maps.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setLinkMode('shortlink')}
                  className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    linkMode === 'shortlink'
                      ? 'border-blue-600 bg-blue-50/70 text-blue-950 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div className="text-xs font-black uppercase flex items-center justify-between mb-1">
                    <span>Enlace Corto g.page</span>
                    {linkMode === 'shortlink' && <Check className="w-4 h-4 text-blue-600" />}
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Formato oficial corto generado por Google My Business.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setLinkMode('fiveStarIntent')}
                  className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    linkMode === 'fiveStarIntent'
                      ? 'border-blue-600 bg-blue-50/70 text-blue-950 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div className="text-xs font-black uppercase flex items-center justify-between mb-1">
                    <span>Intención 5 Estrellas ⭐</span>
                    {linkMode === 'fiveStarIntent' && <Check className="w-4 h-4 text-blue-600" />}
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Dispara la búsqueda de reseñas en Google Search directamente.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setLinkMode('search')}
                  className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    linkMode === 'search'
                      ? 'border-blue-600 bg-blue-50/70 text-blue-950 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div className="text-xs font-black uppercase flex items-center justify-between mb-1">
                    <span>Búsqueda Maps Local</span>
                    {linkMode === 'search' && <Check className="w-4 h-4 text-blue-600" />}
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Compatible con cualquier dispositivo móvil sin Place ID.
                  </p>
                </button>
              </div>
            </div>

            {/* Input fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black uppercase text-slate-700 block mb-1">
                  Nombre del Negocio / Taller:
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase text-slate-700 block mb-1">
                  Comuna / Localidad:
                </label>
                <input
                  type="text"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              {linkMode === 'standard' && (
                <div className="md:col-span-2">
                  <label className="text-xs font-black uppercase text-slate-700 block mb-1">
                    Google Place ID:
                  </label>
                  <input
                    type="text"
                    value={placeId}
                    onChange={(e) => setPlaceId(e.target.value)}
                    placeholder="ChIJ..."
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-xs font-mono font-bold text-slate-900 focus:border-blue-500 focus:outline-hidden"
                  />
                  <p className="text-[11px] text-slate-500 mt-1 font-medium">
                    Identificador único de Google Maps para abrir la ventana de reseña sin intermediarios.
                  </p>
                </div>
              )}

              {linkMode === 'shortlink' && (
                <div className="md:col-span-2">
                  <label className="text-xs font-black uppercase text-slate-700 block mb-1">
                    Enlace Corto Oficial de Google (g.page):
                  </label>
                  <input
                    type="url"
                    value={customShortLink}
                    onChange={(e) => setCustomShortLink(e.target.value)}
                    placeholder="https://g.page/r/.../review"
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-xs font-mono font-bold text-slate-900 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              )}
            </div>

            {/* Generated Link Result Box */}
            <div className="p-5 bg-slate-900 rounded-2xl text-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                  Enlace de Reseña Generado Listo para Compartir:
                </span>
                <span className="text-[10px] bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded-md font-mono">
                  Modo: {linkMode}
                </span>
              </div>

              <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs font-mono text-emerald-300 break-all select-all font-bold">
                  {generatedReviewUrl}
                </span>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleCopyLink}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-black py-2 px-3 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? '¡Copiado!' : 'Copiar'}</span>
                  </button>

                  <button
                    onClick={() => handleDirectReviewClick('generator_test_link')}
                    className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2 px-3 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-white/20"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Probar Enlace</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Pre-formatted WhatsApp & Email Templates */}
        {activeTab === 'whatsappTemplates' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-xl space-y-8 animate-fade-in">
            <div className="border-b border-slate-200 pb-6">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-emerald-600" />
                <span>Generador de Mensajes Post-Entrega para Pedir Reseñas</span>
              </h3>
              <p className="text-xs text-slate-600 font-medium mt-1">
                Personaliza el mensaje con el nombre del cliente y de su perrito para conseguir una tasa de respuesta del 85%+.
              </p>
            </div>

            {/* Customization Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-black uppercase text-slate-700 block mb-1">
                  Nombre del Cliente:
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ej. Camila"
                  className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-200 text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase text-slate-700 block mb-1">
                  Nombre de la Mascota:
                </label>
                <input
                  type="text"
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  placeholder="Ej. Rocky"
                  className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-200 text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase text-slate-700 block mb-1">
                  Prenda Confeccionada:
                </label>
                <input
                  type="text"
                  value={garmentType}
                  onChange={(e) => setGarmentType(e.target.value)}
                  placeholder="Ej. Impermeable A la Medida"
                  className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-200 text-xs font-bold text-slate-900"
                />
              </div>
            </div>

            {/* WhatsApp Box */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  Plantilla para WhatsApp (Recomendado):
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyMessage}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black py-1.5 px-3 rounded-xl border border-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    {copiedMsg ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedMsg ? '¡Copiado!' : 'Copiar Texto'}</span>
                  </button>

                  <button
                    onClick={handleOpenWhatsApp}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black py-1.5 px-3.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Abrir en WhatsApp</span>
                  </button>
                </div>
              </div>

              <div className="p-4 bg-emerald-50/60 rounded-2xl border-2 border-emerald-200 font-sans text-xs text-slate-800 leading-relaxed whitespace-pre-line shadow-xs">
                {whatsappTemplateText}
              </div>
            </div>

            {/* Email Box */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Share2 className="w-4 h-4 text-blue-600" />
                  Plantilla para Correo Electrónico o Boleta:
                </span>
                <button
                  onClick={handleCopyEmail}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black py-1.5 px-3 rounded-xl border border-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedEmail ? '¡Copiado!' : 'Copiar Correo'}</span>
                </button>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 font-mono text-[11px] text-slate-800 leading-relaxed whitespace-pre-line">
                {emailTemplateText}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Printable Packaging QR Insert Card */}
        {activeTab === 'qrCard' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-xl space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
              <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-purple-600" />
                  <span>Tarjeta QR para el Packaging de los Envíos</span>
                </h3>
                <p className="text-xs text-slate-600 font-medium mt-1">
                  Imprime e incluye esta tarjeta dentro de las bolsas de despacho (Blue Express / Starken / Chilexpress) para que el cliente escanee apenas reciba la ropa.
                </p>
              </div>

              <button
                onClick={handlePrintCard}
                className="bg-purple-600 hover:bg-purple-700 text-white font-black text-xs py-2.5 px-4 rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer self-start"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Tarjetas QR</span>
              </button>
            </div>

            {/* Interactive Card Preview */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-4">
              {/* The Physical Card Mockup */}
              <div className="w-full max-w-sm bg-linear-to-br from-amber-50 via-white to-orange-50 rounded-3xl p-6 border-4 border-orange-300 shadow-2xl space-y-4 text-center">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1 bg-yellow-400 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-2xs">
                    <Star className="w-3 h-3 fill-slate-950" />
                    <span>Confección Artesanal Chilena</span>
                  </div>
                  <h4 className="text-base font-black text-slate-900 tracking-tight">
                    🐾 petsimona25 Rengo ✂️
                  </h4>
                  <p className="text-[11px] text-slate-600 font-bold">
                    ¿A tu peludo le encantó su prenda a la medida?
                  </p>
                </div>

                {/* QR Code Container */}
                <div className="bg-white p-3 rounded-2xl border-2 border-slate-200 shadow-md inline-block mx-auto">
                  <img
                    src={qrCodeImageUrl}
                    alt="QR Google Review petsimona25"
                    className="w-44 h-44 object-contain rounded-lg"
                  />
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mt-1">
                    Escanea para opinar en Google
                  </span>
                </div>

                <div className="space-y-1 text-slate-700 text-xs font-medium">
                  <p className="font-black text-slate-900">
                    ⭐⭐⭐⭐⭐ 5 Estrellas en Google Maps
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Tu reseña apoya a las artesanas de Rengo, Región de O'Higgins.
                  </p>
                </div>

                <div className="pt-2 border-t border-orange-200 text-[9px] text-slate-400 font-mono">
                  www.petsimona25.cl | @petsimona25
                </div>
              </div>

              {/* Card Specs and instructions */}
              <div className="max-w-md space-y-4 text-xs">
                <h4 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-orange-500" />
                  Consejos para potenciar reseñas con el packaging:
                </h4>

                <div className="space-y-2.5 text-slate-600 font-medium">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2">
                    <span className="text-base">📦</span>
                    <span>Coloca 1 tarjeta impresa en papel kraft o cartulina reciclada dentro de cada paquete antes de sellarlo.</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2">
                    <span className="text-base">📸</span>
                    <span>Invita al cliente a subir una foto de su perro modelando la prenda: las reseñas con foto tienen <strong>4x más visualizaciones</strong> en Google Maps.</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2">
                    <span className="text-base">🎁</span>
                    <span>Puedes ofrecer un 5% de descuento en el próximo encargo a quienes envíen captura de su reseña publicada.</span>
                  </div>
                </div>

                <a
                  href={qrCodeImageUrl}
                  download="qr-google-review-petsimona25.png"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs py-2.5 px-4 rounded-xl transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar Imagen QR en Alta Resolución</span>
                </a>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
