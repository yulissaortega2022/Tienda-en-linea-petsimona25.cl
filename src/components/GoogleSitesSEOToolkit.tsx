import React, { useState } from 'react';
import { Copy, Check, Code, Search, Globe, Layers, ArrowUpRight, ShieldCheck, HelpCircle, CheckCircle2, Download, FileCode, Sparkles, Terminal } from 'lucide-react';

export const GoogleSitesSEOToolkit: React.FC = () => {
  const [copiedSitesCode, setCopiedSitesCode] = useState(false);
  const [copiedMetaCode, setCopiedMetaCode] = useState(false);
  const [copiedFullHtml, setCopiedFullHtml] = useState(false);
  const [copiedEmbedWidget, setCopiedEmbedWidget] = useState(false);
  const [activeTab, setActiveTab] = useState<'iframe' | 'fullhtml' | 'meta' | 'widget'>('fullhtml');
  const [userVerificationCode, setUserVerificationCode] = useState('petsimona25_gsc_token_123456');

  const currentAppUrl = typeof window !== 'undefined' ? window.location.origin : 'https://petsimona25.cl';

  const googleSitesEmbedHtml = `<iframe 
  src="${currentAppUrl}" 
  width="100%" 
  height="950px" 
  style="border:none; border-radius:20px; box-shadow:0 12px 30px rgba(0,0,0,0.12);" 
  title="petsimona25.cl - Ropa para Mascotas a la Medida Rengo Chile"
  allow="camera; microphone; payment; geolocation"
  loading="lazy">
</iframe>`;

  const metaTagHtml = `<meta name="google-site-verification" content="${userVerificationCode}" />`;

  const standaloneCompleteHtml = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>petsimona25.cl | Ropa para Mascotas a la Medida - Rengo, Chile</title>
    
    <!-- Meta Tags Principales -->
    <meta name="description" content="petsimona25.cl - Confección artesanal y eco-sustentable de ropa para perros chicos y medianos hecha a la medida en Rengo, Región de O'Higgins, Chile. Telas reutilizables, fundadora educadora diferencial maipucina. Envíos a todo Chile. WhatsApp +56972374764." />
    <meta name="keywords" content="petsimona25, petsimona25.cl, #petsimona25, ropa para perros Rengo, ropa mascotas a la medida Chile, confeccion canina Rengo, abrigos para perros, capas impermeables caninas" />
    <meta name="author" content="petsimona25.cl - Confección Artesanal" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <link rel="canonical" href="https://petsimona25.cl" />
    <meta name="theme-color" content="#d97706" />
    <meta name="google-site-verification" content="${userVerificationCode}" />

    <!-- Open Graph (Redes Sociales) -->
    <meta property="og:site_name" content="petsimona25.cl" />
    <meta property="og:title" content="petsimona25.cl | Ropa para Mascotas a la Medida en Rengo, Chile" />
    <meta property="og:description" content="Confección artesanal eco-sustentable con telas reutilizables para perros chicos y medianos en Rengo. Envíos a todo Chile." />
    <meta property="og:url" content="https://petsimona25.cl" />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=1200" />

    <!-- Schema.org Microdatos -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "ClothingStore",
      "name": "petsimona25",
      "legalName": "petsimona25.cl Confección Artesanal",
      "url": "https://petsimona25.cl",
      "telephone": "+56972374764",
      "priceRange": "$$",
      "currenciesAccepted": "CLP",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Rengo",
        "addressRegion": "Región del Libertador Bernardo O'Higgins",
        "addressCountry": "CL"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": -34.4064,
        "longitude": -70.8587
      }
    }
    <\/script>
    
    <!-- Tailwind CSS CDN para renderizado instantáneo -->
    <script src="https://cdn.tailwindcss.com"><\/script>
  </head>
  <body class="bg-amber-50 text-slate-900 font-sans antialiased min-h-screen flex flex-col justify-between">
    <!-- Header -->
    <header class="bg-white/90 backdrop-blur-md sticky top-0 z-40 border-b border-amber-200/80 px-4 py-3 sm:px-8 flex items-center justify-between shadow-xs">
      <div class="flex items-center gap-3">
        <span class="text-2xl">🐾</span>
        <div>
          <span class="text-xl font-black text-amber-900 tracking-tight">petsimona25<span class="text-amber-600">.cl</span></span>
          <span class="hidden sm:inline-block ml-2 text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-md">Rengo, Chile</span>
        </div>
      </div>
      <a href="https://wa.me/56972374764?text=Hola!%20Vengo%20desde%20petsimona25.cl%20para%20cotizar%20ropa%20a%20la%20medida" target="_blank" rel="noreferrer" class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5">
        <span>WhatsApp Directo</span>
        <span>💬</span>
      </a>
    </header>

    <!-- Hero / Catálogo Embebido -->
    <main class="max-w-7xl mx-auto px-4 py-8 sm:px-6 w-full space-y-8 flex-1">
      <section class="text-center space-y-3">
        <h1 class="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Ropa de Mascotas Hecha a la Medida 🧵
        </h1>
        <p class="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base">
          Confección artesanal y sustentable para perros chicos y medianos en Rengo, Chile.
        </p>
      </section>

      <!-- App Frame -->
      <div class="w-full bg-white rounded-3xl border-2 border-amber-200 overflow-hidden shadow-xl" style="height: 850px;">
        <iframe src="${currentAppUrl}" width="100%" height="100%" style="border:none;" title="petsimona25.cl"></iframe>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-slate-900 text-slate-400 text-xs py-6 text-center border-t border-slate-800">
      <p>© 2026 petsimona25.cl - Confección Artesanal Sustentable en Rengo, Región de O'Higgins. WhatsApp: +56 9 7237 4764</p>
    </footer>
  </body>
</html>`;

  const miniWidgetHtml = `<!-- Widget Flotante de Pedidos a la Medida petsimona25.cl -->
<div id="petsimona25-widget" style="position:fixed; bottom:20px; right:20px; z-index:99999; font-family:system-ui, -apple-system, sans-serif;">
  <a href="${currentAppUrl}" target="_blank" rel="noopener noreferrer" style="display:flex; align-items:center; gap:10px; background:linear-gradient(135deg, #d97706, #b45309); color:white; padding:12px 18px; border-radius:50px; text-decoration:none; font-weight:800; font-size:13px; box-shadow:0 8px 20px rgba(217,119,6,0.4); border:2px solid #fef3c7;">
    <span style="font-size:18px;">🐾</span>
    <span>Ropa a la Medida | petsimona25.cl</span>
  </a>
</div>`;

  const handleCopySites = () => {
    navigator.clipboard.writeText(googleSitesEmbedHtml);
    setCopiedSitesCode(true);
    setTimeout(() => setCopiedSitesCode(false), 2500);
  };

  const handleCopyMeta = () => {
    navigator.clipboard.writeText(metaTagHtml);
    setCopiedMetaCode(true);
    setTimeout(() => setCopiedMetaCode(false), 2500);
  };

  const handleCopyFullHtml = () => {
    navigator.clipboard.writeText(standaloneCompleteHtml);
    setCopiedFullHtml(true);
    setTimeout(() => setCopiedFullHtml(false), 2500);
  };

  const handleCopyWidget = () => {
    navigator.clipboard.writeText(miniWidgetHtml);
    setCopiedEmbedWidget(true);
    setTimeout(() => setCopiedEmbedWidget(false), 2500);
  };

  const handleDownloadIndexHtml = () => {
    const blob = new Blob([standaloneCompleteHtml], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'index.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <section id="google-sites-seo" className="py-16 bg-slate-900 text-white border-b-2 border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-yellow-400 font-black text-xs uppercase tracking-wider">
            <Globe className="w-4 h-4 text-yellow-400" />
            <span>Centro de Código HTML &amp; Posicionamiento #petsimona25</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Código HTML Completo para tu Página Web 🌐
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed font-medium">
            Aquí tienes todo el código <strong className="text-yellow-400 font-bold">HTML5 listo</strong> para alojar en cualquier servidor (cPanel, Google Sites, Netlify, Vercel, WordPress, Shopify o hosting propio) con todas las meta etiquetas SEO, microdatos Schema.org y catálogo responsivo.
          </p>
        </div>

        {/* Master HTML Code Generator & Exporter */}
        <div className="bg-slate-800/90 rounded-3xl p-6 sm:p-8 border-2 border-amber-500/50 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center font-black shadow-lg">
                <FileCode className="w-6 h-6 text-slate-950" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <span>Exportador de Código HTML</span>
                  <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-amber-500/40">
                    HTML5 Estándar
                  </span>
                </h3>
                <p className="text-xs text-slate-300 font-medium">
                  Selecciona el formato que necesitas para copiarlo o descargarlo como archivo <code className="text-yellow-300">index.html</code>
                </p>
              </div>
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownloadIndexHtml}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-lg cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Descargar index.html Listo</span>
            </button>
          </div>

          {/* Format Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-slate-700 pb-3">
            <button
              onClick={() => setActiveTab('fullhtml')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'fullhtml'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Code className="w-4 h-4" />
              <span>1. Página Web Completa (index.html)</span>
            </button>

            <button
              onClick={() => setActiveTab('iframe')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'iframe'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>2. Código Iframe Google Sites (Embed)</span>
            </button>

            <button
              onClick={() => setActiveTab('meta')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'meta'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>3. Meta Tags &amp; Search Console</span>
            </button>

            <button
              onClick={() => setActiveTab('widget')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'widget'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>4. Botón Flotante Widget</span>
            </button>
          </div>

          {/* Active Tab View */}
          <div className="space-y-4">
            {activeTab === 'fullhtml' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-300 font-medium">
                    Código fuente completo en un solo archivo con diseño responsivo, metaetiquetas para redes sociales, microdatos para Google y la aplicación integrada:
                  </p>
                  <button
                    onClick={handleCopyFullHtml}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md cursor-pointer shrink-0"
                  >
                    {copiedFullHtml ? (
                      <>
                        <Check className="w-4 h-4 text-slate-950" /> Copiado al portapapeles
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" /> Copiar Todo el Código HTML
                      </>
                    )}
                  </button>
                </div>

                <div className="relative bg-slate-950 p-4 rounded-2xl border-2 border-slate-700 font-mono text-xs text-amber-300 max-h-80 overflow-y-auto">
                  <pre className="whitespace-pre">{standaloneCompleteHtml}</pre>
                </div>
              </div>
            )}

            {activeTab === 'iframe' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <p className="text-xs text-slate-300 font-medium">
                    Código de incrustación 100% responsivo para <strong>Google Sites</strong>. Soporta IA, cookies de sesión, calculadora de medidas y enlaces a WhatsApp:
                  </p>
                  <button
                    onClick={handleCopySites}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md cursor-pointer shrink-0"
                  >
                    {copiedSitesCode ? (
                      <>
                        <Check className="w-4 h-4 text-slate-950" /> ¡Código Iframe Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" /> Copiar Código para Google Sites
                      </>
                    )}
                  </button>
                </div>

                <div className="relative bg-slate-950 p-4 rounded-2xl border-2 border-slate-700 font-mono text-xs text-yellow-300 overflow-x-auto shadow-inner">
                  <pre>{googleSitesEmbedHtml}</pre>
                </div>

                {/* Step-by-Step Google Sites Embed Mini-Guide */}
                <div className="p-4 bg-slate-900 rounded-2xl border border-slate-700 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-wide">
                    <Sparkles className="w-4 h-4" />
                    <span>Instrucciones Rápidas de Inserción en Google Sites</span>
                  </div>
                  <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside font-medium leading-relaxed">
                    <li>Abre tu sitio en <strong className="text-white">sites.google.com</strong> en modo de edición.</li>
                    <li>En el panel lateral derecho, ve a la pestaña <strong className="text-amber-300">Insertar</strong> y presiona <strong className="text-amber-300">Incorporar (&lt;/&gt;)</strong>.</li>
                    <li>Selecciona la pestaña <strong className="text-white">"Incorporar código"</strong> y pega el bloque de código de arriba.</li>
                    <li>Presiona <strong className="text-white">Siguiente</strong> y luego <strong className="text-white">Insertar</strong>.</li>
                    <li>Estira el contenedor con los puntos de agarre para que ocupe todo el ancho de la página y presiona <strong className="text-emerald-400 font-bold">Publicar</strong>.</li>
                  </ol>
                </div>
              </div>
            )}

            {activeTab === 'meta' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-300 uppercase block">
                    Tu código de verificación de Google Search Console:
                  </label>
                  <input
                    type="text"
                    value={userVerificationCode}
                    onChange={(e) => setUserVerificationCode(e.target.value)}
                    placeholder="Ej: google-site-verification=abc123xyz"
                    className="w-full bg-slate-950 border-2 border-slate-700 focus:border-yellow-400 rounded-xl px-4 py-2.5 text-xs text-yellow-300 font-mono outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300 font-medium">Etiqueta a pegar dentro de &lt;head&gt;:</span>
                  <button
                    onClick={handleCopyMeta}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md cursor-pointer shrink-0"
                  >
                    {copiedMetaCode ? (
                      <>
                        <Check className="w-4 h-4 text-slate-950" /> Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" /> Copiar Meta Tag
                      </>
                    )}
                  </button>
                </div>

                <div className="relative bg-slate-950 p-4 rounded-2xl border-2 border-slate-700 font-mono text-xs text-yellow-300">
                  <pre>{metaTagHtml}</pre>
                </div>
              </div>
            )}

            {activeTab === 'widget' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-300 font-medium">
                    Botón flotante en la esquina inferior derecha para enlazar a <strong>petsimona25.cl</strong> desde cualquier blog o sitio web:
                  </p>
                  <button
                    onClick={handleCopyWidget}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md cursor-pointer shrink-0"
                  >
                    {copiedEmbedWidget ? (
                      <>
                        <Check className="w-4 h-4 text-slate-950" /> Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" /> Copiar Widget Flotante
                      </>
                    )}
                  </button>
                </div>

                <div className="relative bg-slate-950 p-4 rounded-2xl border-2 border-slate-700 font-mono text-xs text-yellow-300 overflow-x-auto">
                  <pre>{miniWidgetHtml}</pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 5 Steps Interactive Visual Guide */}
        <div className="bg-slate-800/90 rounded-3xl p-6 sm:p-8 border-2 border-emerald-500/40 shadow-2xl space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-700 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-yellow-400 text-slate-900 flex items-center justify-center font-black">
              <CheckCircle2 className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <h3 className="text-xl font-black text-yellow-400">
                Pasos Exactos para Indexar petsimona25.cl en Google Search Console
              </h3>
              <p className="text-xs text-slate-300 font-medium">
                Sigue esta ruta paso a paso para verificar el sitio y solicitar la indexación rápida de Google
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Step 1 */}
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-700 space-y-2">
              <span className="w-7 h-7 bg-orange-500 text-white font-black text-xs rounded-full flex items-center justify-center">1</span>
              <h4 className="font-bold text-sm text-yellow-300">Crear Propiedad en Search Console</h4>
              <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                Ingresa a <a href="https://search.google.com/search-console" target="_blank" rel="noreferrer" className="text-orange-400 underline font-bold">search.google.com</a> e inicia sesión con tu cuenta Google. Elige "Prefijo de la URL" e ingresa <code className="text-yellow-400 bg-slate-800 px-1 py-0.5 rounded">https://petsimona25.cl</code>.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-700 space-y-2">
              <span className="w-7 h-7 bg-orange-500 text-white font-black text-xs rounded-full flex items-center justify-center">2</span>
              <h4 className="font-bold text-sm text-yellow-300">Seleccionar Método "Etiqueta HTML"</h4>
              <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                Google te mostrará varios métodos de verificación. Selecciona <strong>"Etiqueta HTML"</strong>. Google te dará una línea como: <code className="text-emerald-400 block text-[10px] truncate mt-1">&lt;meta name="google-site-verification" content="..." /&gt;</code>
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-900 p-4 rounded-2xl border border-emerald-500/60 space-y-2 bg-emerald-950/20">
              <span className="w-7 h-7 bg-emerald-500 text-slate-900 font-black text-xs rounded-full flex items-center justify-center">3</span>
              <h4 className="font-bold text-sm text-emerald-300">¿Dónde va este código? (¡Muy importante!)</h4>
              <p className="text-[11px] text-slate-200 leading-relaxed font-medium">
                <strong>Opción A (Google Sites):</strong> Ve a Configuración ⚙️ → Dominios personalizados / Análisis de la sitio.
                <br />
                <strong>Opción B (Código HTML):</strong> Debe pegarse dentro de la etiqueta <code className="text-yellow-300 font-mono">&lt;head&gt;</code> en el archivo <code className="text-yellow-300 font-mono">/index.html</code> (¡ya te dejamos la línea lista en el código!).
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-700 space-y-2">
              <span className="w-7 h-7 bg-orange-500 text-white font-black text-xs rounded-full flex items-center justify-center">4</span>
              <h4 className="font-bold text-sm text-yellow-300">Presionar "Verificar" en Google</h4>
              <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                Vuelve al panel de Google Search Console y haz clic en el botón verde <strong>"Verificar"</strong>. Google comprobará que la etiqueta está presente y te confirmará la propiedad del dominio.
              </p>
            </div>

            {/* Step 5 */}
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-700 space-y-2">
              <span className="w-7 h-7 bg-orange-500 text-white font-black text-xs rounded-full flex items-center justify-center">5</span>
              <h4 className="font-bold text-sm text-yellow-300">Enviar Sitemap &amp; Pedir Indexación</h4>
              <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                En la columna izquierda de Search Console ve a <strong>Sitemaps</strong> y envía: <code className="text-yellow-400 bg-slate-800 px-1 py-0.5 rounded">sitemap.xml</code>. Luego usa la herramienta "Inspección de URLs" para pedir indexación prioritaria.
              </p>
            </div>
          </div>
        </div>

        {/* SEO Google Imágenes Optimization Hub */}
        <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-8 border-2 border-yellow-400/50 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-yellow-400 to-amber-500 text-slate-950 flex items-center justify-center font-black shadow-lg">
                <Search className="w-6 h-6 text-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-yellow-400">
                    Optimizador Automático para Google Imágenes 📸
                  </h3>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                    Activo 100%
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-medium">
                  Todas las fotografías de catálogo incluyen automáticamente etiquetas <code className="text-yellow-300 bg-slate-800 px-1 py-0.5 rounded">alt</code>, <code className="text-yellow-300 bg-slate-800 px-1 py-0.5 rounded">title</code>, <code className="text-yellow-300 bg-slate-800 px-1 py-0.5 rounded">itemProp="thumbnail"</code> y microdatos Schema.org ImageObject según su nombre y categoría.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-slate-300 font-bold bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                ⭐ Posicionamiento en Chile (Google.cl)
              </span>
            </div>
          </div>

          {/* Key Advantages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-700 space-y-2">
              <div className="text-yellow-400 font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Alt Tags Descriptivos</span>
              </div>
              <p className="text-[12px] text-slate-300 font-medium leading-relaxed">
                Genera textos alternativos sin 'keyword stuffing', combinando nombre comercial, tipo de prenda (abrigo, impermeable, etc.), talla objetivo (perros chicos y medianos) y origen local en Rengo.
              </p>
            </div>

            <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-700 space-y-2">
              <div className="text-yellow-400 font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Microdatos Schema ImageObject</span>
              </div>
              <p className="text-[12px] text-slate-300 font-medium leading-relaxed">
                Cada tarjeta de producto implementa <code className="text-yellow-300">itemScope itemType="https://schema.org/ImageObject"</code> para permitir a Google rastrear autor, pie de foto y resolución nítida.
              </p>
            </div>

            <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-700 space-y-2">
              <div className="text-yellow-400 font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Carga Rápida &amp; Lazy Loading</span>
              </div>
              <p className="text-[12px] text-slate-300 font-medium leading-relaxed">
                Imágenes optimizadas con atributo nativo <code className="text-yellow-300">loading="lazy"</code> y política de referencia segura para lograr el 100% de puntuación en Google Core Web Vitals.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};


