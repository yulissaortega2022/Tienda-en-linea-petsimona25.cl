import React, { useState } from 'react';
import { Sparkles, Ruler, ShieldCheck, Heart, Award, ArrowRight, Flame, CheckCircle, Truck, ShoppingBag, Star, Lock, QrCode, Dog } from 'lucide-react';
import { TopQrScanner } from './TopQrScanner';

import yorkieImg from '../assets/images/yorkie_hero_photo_1789595183926.jpg';
import chihuahuaImg from '../assets/images/chihuahua_dog_photo_1789595573607.jpg';
import foxTerrierImg from '../assets/images/fox_terrier_dog_photo_1789595584977.jpg';
import galgoImg from '../assets/images/capa_galgo_photo_1789595596453.jpg';
import salchichaImg from '../assets/images/salchicha_dog_photo_1789595194154.jpg';

interface HeroProps {
  onOpenShareQr?: (tab?: 'qr' | 'apk') => void;
  onOpenCustomDomain?: () => void;
  onOpenVisualCatalog?: () => void;
}

export type FeaturedBreedKey = 'yorkshire' | 'chihuahua' | 'foxterrier' | 'galgo' | 'salchicha';

interface BreedHeroSpotlight {
  id: FeaturedBreedKey;
  name: string;
  badge: string;
  tagline: string;
  image: string;
  quote: string;
  author: string;
  keyFeature: string;
  sizeHint: string;
  pillLabel: string;
}

const BREED_SPOTLIGHTS: BreedHeroSpotlight[] = [
  {
    id: 'yorkshire',
    name: 'Yorkshire Terrier',
    badge: 'Portada Oficial • Perro Pequeño Insignia',
    tagline: 'Manto sedoso, cuello delicado y calce mini sin enredos',
    image: yorkieImg,
    quote: '"A mi Yorkie le quedaba grande toda la ropa común y le rozaba las axilas. En petsimona25 le hicieron su suéter con forro de seda a la medida exacta."',
    author: 'Camila V. y "Milo" (Yorkshire Terrier, 2.4 kg)',
    keyFeature: 'Forro anti-estática para pelaje largo y cierre suave en tráquea',
    sizeHint: 'Tallas XXS - XS (2.0 a 3.5 kg)',
    pillLabel: '🐶 Yorkshire (Portada)',
  },
  {
    id: 'chihuahua',
    name: 'Chihuahua & Razas Toy',
    badge: 'Micro-Calce • Fotografía de Taller',
    tagline: 'Corte ultra liviano térmico anti-ahogo para tráquea sensible',
    image: chihuahuaImg,
    quote: '"Por fin una prenda que abriga a mi chihuahua sin ahogarlo ni pesarle. Es súper delicado de cuello y el broche plano es perfecto."',
    author: 'Sofía M. y "Tito" (Chihuahua Toy, 1.8 kg)',
    keyFeature: 'Broches planos pluma y cuello abierto anti-presión traqueal',
    sizeHint: 'Micro y XXS (1.0 a 2.8 kg)',
    pillLabel: '🐾 Chihuahua',
  },
  {
    id: 'foxterrier',
    name: 'Fox Terrier (Chileno & Wire)',
    badge: 'Todoterreno Ágil • Fotografía Real',
    tagline: 'Chaqueta ergonómica reforzada para máxima energía y saltos',
    image: foxTerrierImg,
    quote: '"Los Fox Terrier son pura energía. Esta chaqueta aguanta carreras por el pasto, no se le gira en el lomo y lo protege de la lluvia."',
    author: 'Rodrigo P. y "Cholo" (Fox Terrier Chileno, 7.2 kg)',
    keyFeature: 'Sisa flexible en omóplatos y tela ripstop impermeable con reflectantes',
    sizeHint: 'Pecho atlético 42-56 cm',
    pillLabel: '🐕 Fox Terrier',
  },
  {
    id: 'galgo',
    name: 'Capas para Perros Galgos',
    badge: 'Alta Costura • Capas Térmicas & Impermeables',
    tagline: 'Silueta curva lumbar con cuello cisne térmico y pecho profundo en quilla',
    image: galgoImg,
    quote: '"Las capas para galgos de petsimona25 son una maravilla: cubren su pecho profundo y el lomo arqueado sin dejar pasar el viento frío."',
    author: 'Francisca L. y "Luna" (Galgo Italiano, 5.2 kg)',
    keyFeature: 'Patrón anatómico en S con cuello cisne polar y pechera en quilla',
    sizeHint: 'Lomo curvo 40-70 cm y tórax hondo',
    pillLabel: '🧥 Capas Galgos',
  },
  {
    id: 'salchicha',
    name: 'Perro Salchicha (Teckel)',
    badge: 'Columna Larga • Pecho Quilla',
    tagline: 'Corte extralargo en lomo y ventral alto anti-arrastre',
    image: salchichaImg,
    quote: '"Por fin un abrigo que cubre toda la espalda de mi salchicha sin arrastrar en la guatita al caminar. ¡100% recomendado!"',
    author: 'Matías O. y "Max" (Dachshund Mini, 4.8 kg)',
    keyFeature: 'Patrón longitudinal extendido + holgura en pecho prominente',
    sizeHint: 'Largo 38-52 cm con pecho profundo',
    pillLabel: '🌭 Salchicha',
  },
];

export const Hero: React.FC<HeroProps> = ({
  onOpenShareQr,
  onOpenCustomDomain,
  onOpenVisualCatalog,
}) => {
  const [selectedBreed, setSelectedBreed] = useState<FeaturedBreedKey>('yorkshire');
  const currentSpotlight = BREED_SPOTLIGHTS.find((b) => b.id === selectedBreed) || BREED_SPOTLIGHTS[0];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-amber-50/80 via-orange-50/50 to-amber-100/30 pt-6 sm:pt-8 pb-16 border-b-2 border-orange-200">
      {/* Subtle Warm Background Glow */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-orange-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-24 w-96 h-96 bg-yellow-400/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top High-Impact Scannable QR Code Banner */}
        <TopQrScanner
          onOpenFullModal={onOpenShareQr}
          onOpenCustomDomain={onOpenCustomDomain}
          onOpenVisualCatalog={onOpenVisualCatalog}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6">
            {/* Scarcity & High Value Psychological Pill */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 text-white font-black text-xs sm:text-sm shadow-md border border-slate-800">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-yellow-300">Taller Rengo, Chile</span>
                <span className="text-slate-300">• Confección Ergonómica 100%</span>
              </div>

              <a
                href="#medidas-form"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-700 hover:to-orange-700 text-white shadow-lg border-2 border-yellow-300 ring-2 ring-orange-500/30 transition-all transform hover:scale-102 active:scale-95 group cursor-pointer"
                title="Quedan 4 cupos disponibles esta semana - Clic para registrarte en el formulario a la medida"
              >
                <Flame className="w-4 h-4 fill-yellow-300 text-yellow-300 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-xs sm:text-sm font-black text-yellow-300 tracking-tight uppercase">
                  4 CUPOS DISPONIBLES
                </span>
                <span className="text-[11px] sm:text-xs font-black bg-yellow-400 text-slate-950 px-2.5 py-0.5 rounded-lg flex items-center gap-1 shadow-xs group-hover:bg-yellow-300 transition-colors">
                  Registrarse en el formulario ✍️
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </a>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Ropa para Mascotas{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 underline decoration-yellow-400 decoration-wavy decoration-2">
                Hecha a la Medida
              </span>
            </h1>

            {/* Specialized breeds callout */}
            <div className="p-3.5 bg-gradient-to-r from-amber-100/90 to-orange-100/80 rounded-2xl border-2 border-amber-300/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-black uppercase tracking-wider text-amber-950">
                <div className="flex items-center gap-2">
                  <Dog className="w-4 h-4 text-orange-600" />
                  <span>Razas Especializadas en Portada:</span>
                </div>
                <span className="text-[11px] text-orange-700 bg-white/80 px-2.5 py-0.5 rounded-full border border-orange-200 font-bold">
                  Fotografías Reales de Taller
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {BREED_SPOTLIGHTS.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setSelectedBreed(b.id)}
                    className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                      selectedBreed === b.id
                        ? 'bg-orange-600 text-white shadow-md ring-2 ring-orange-300 scale-105'
                        : 'bg-white text-slate-800 hover:bg-orange-50 border border-orange-200'
                    }`}
                  >
                    <span>{b.pillLabel}</span>
                    {selectedBreed === b.id && <CheckCircle className="w-3.5 h-3.5 text-yellow-200" />}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                👉 <strong>{currentSpotlight.name}:</strong> {currentSpotlight.tagline}. ({currentSpotlight.keyFeature}).
              </p>
            </div>

            <p className="text-base sm:text-lg text-slate-700 leading-relaxed max-w-2xl font-medium">
              En <strong className="font-extrabold text-orange-600">petsimona25.cl</strong> confeccionamos prendas ecológicas con calce anatómico para <strong className="text-emerald-800 font-extrabold">perros pequeños y medianos</strong> desde Rengo, Región de O'Higgins 🇨🇱. Ingresa sus medidas y dile adiós a la ropa que aprieta o lastima sus axilas.
            </p>

            {/* High-Conversion Impulse CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href="#medidas-form"
                className="inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 hover:from-orange-500 hover:to-amber-500 text-white font-black uppercase tracking-widest px-7 py-4 rounded-2xl shadow-xl shadow-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/50 transition-all transform hover:-translate-y-0.5 active:scale-95 text-sm sm:text-base border border-orange-400/50 animate-pulse-glow"
              >
                <Ruler className="w-5 h-5 text-yellow-200" />
                <span>Ingresar Medidas ({currentSpotlight.name}) ⚡</span>
                <ArrowRight className="w-5 h-5 ml-1" />
              </a>

              <a
                href="#catalogo"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-orange-50 text-slate-900 font-extrabold px-5 py-4 rounded-2xl border-2 border-orange-300 shadow-md hover:shadow-lg transition-all text-sm group"
              >
                <ShoppingBag className="w-4 h-4 text-orange-600 group-hover:scale-110 transition-transform" />
                <span>Ver Catálogo</span>
              </a>

              {onOpenShareQr && (
                <button
                  type="button"
                  onClick={() => onOpenShareQr('qr')}
                  className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-yellow-300 font-black px-4 py-4 rounded-2xl border border-slate-700 shadow-md hover:shadow-lg transition-all text-xs sm:text-sm cursor-pointer"
                  title="Compartir enlace con código QR o instalar APK Android"
                >
                  <QrCode className="w-4 h-4 text-yellow-400 shrink-0" />
                  <span>QR &amp; APK 📲</span>
                </button>
              )}
            </div>

            {/* Psychological Trust Trinity (Verde Confianza / Oro Satisfacción / Azul Seguridad) */}
            <div className="pt-5 grid grid-cols-1 sm:grid-cols-3 gap-3.5 border-t-2 border-orange-200/80 max-w-2xl">
              {/* Trust 1: Calce Ergonómico Garantizado (Verde Esmeralda) */}
              <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200/90 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-emerald-950">Garantía de Calce</h4>
                  <p className="text-[11px] text-emerald-800 font-semibold leading-tight">Reajuste 100% sin costo si no le queda</p>
                </div>
              </div>

              {/* Trust 2: Telas Hipoalergénicas y 5 Estrellas (Oro y Afecto) */}
              <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-amber-50 border border-amber-200/90 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-xs">
                  <Star className="w-5 h-5 fill-slate-950 text-slate-950" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-amber-950">5.0 Estrellas</h4>
                  <p className="text-[11px] text-amber-800 font-semibold leading-tight">Telas suaves anti-rozadura</p>
                </div>
              </div>

              {/* Trust 3: Pago Protegido & Despacho Seguro (Azul Marino Pizarra) */}
              <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-100 border border-slate-300 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-yellow-300 flex items-center justify-center shrink-0 shadow-xs">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">Compra 100% Segura</h4>
                  <p className="text-[11px] text-slate-600 font-semibold leading-tight">Webpay, Mercado Pago &amp; Envíos</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Hero Visual Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white group">
              <img
                src={currentSpotlight.image}
                alt={`Ropa a la medida para ${currentSpotlight.name} en petsimona25`}
                referrerPolicy="no-referrer"
                className="w-full h-[450px] object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-900/35 to-transparent flex flex-col justify-end p-5 text-white">
                <div className="bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-amber-400/40 space-y-1.5 shadow-xl">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <span className="text-[11px] text-yellow-300 font-black uppercase tracking-wider flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      {currentSpotlight.badge}
                    </span>
                    <span className="bg-emerald-500/30 text-emerald-300 border border-emerald-400/50 text-[10px] font-black px-2 py-0.5 rounded-full">
                      Calce Anatómico 100%
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-100 leading-snug">
                    {currentSpotlight.quote}
                  </h3>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-700/80 text-xs">
                    <p className="text-orange-200 font-bold italic">
                      — {currentSpotlight.author}
                    </p>
                    <span className="text-yellow-400 font-black text-[10px]">
                      {currentSpotlight.sizeHint}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Breed Selector Quick Pills on Image */}
            <div className="absolute top-3 left-3 right-3 flex flex-wrap justify-center gap-1.5 z-20">
              {BREED_SPOTLIGHTS.map((spot) => (
                <button
                  key={spot.id}
                  type="button"
                  onClick={() => setSelectedBreed(spot.id)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-black shadow-lg backdrop-blur-md transition-all cursor-pointer ${
                    selectedBreed === spot.id
                      ? 'bg-amber-500 text-slate-950 border-2 border-white ring-2 ring-amber-400 scale-105'
                      : 'bg-slate-900/85 text-white hover:bg-slate-900 border border-white/20'
                  }`}
                >
                  {spot.id === 'yorkshire' && '🐶 Yorkshire'}
                  {spot.id === 'chihuahua' && '🐾 Chihuahua'}
                  {spot.id === 'foxterrier' && '🐕 Fox Terrier'}
                  {spot.id === 'galgo' && '🧥 Capas Galgos'}
                  {spot.id === 'salchicha' && '🌭 Salchicha'}
                </button>
              ))}
            </div>

            {/* Visual Thumbnail Strip of all 4+ Featured Breeds */}
            <div className="mt-3 p-2 bg-white/90 backdrop-blur-xs rounded-2xl border-2 border-orange-200/80 shadow-md">
              <div className="flex items-center justify-between px-2 pb-1.5 text-[11px] font-black text-slate-700">
                <span>📸 Galería Fotográfica de Taller:</span>
                <span className="text-orange-600 font-bold">Toca para cambiar foto</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {BREED_SPOTLIGHTS.map((spot) => (
                  <button
                    key={`thumb-${spot.id}`}
                    type="button"
                    onClick={() => setSelectedBreed(spot.id)}
                    className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all group/thumb cursor-pointer ${
                      selectedBreed === spot.id
                        ? 'border-orange-600 ring-2 ring-orange-400 scale-105 shadow-md'
                        : 'border-slate-200 opacity-80 hover:opacity-100 hover:border-orange-300'
                    }`}
                    title={`Ver fotografía de ${spot.name}`}
                  >
                    <img
                      src={spot.image}
                      alt={spot.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-slate-950/80 text-white text-[9px] font-black py-0.5 text-center truncate px-0.5">
                      {spot.id === 'yorkshire' ? 'Yorkie' : spot.id === 'chihuahua' ? 'Chihuahua' : spot.id === 'foxterrier' ? 'Fox Terr.' : spot.id === 'galgo' ? 'Capas' : 'Salchicha'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Floating Impulse & Quality Badges */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <div className="bg-white p-2.5 rounded-2xl shadow-md border border-orange-200 flex items-center gap-2.5 flex-1">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-slate-950 font-black text-base shadow-xs shrink-0">
                  ✂️
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900">Medidas de Precisión</p>
                  <p className="text-[10px] text-orange-600 font-bold">Cuello • Pecho • Largo</p>
                </div>
              </div>

              <div className="bg-slate-900 text-white p-2.5 rounded-2xl shadow-md border border-slate-700 flex items-center gap-2.5 flex-1">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-black shrink-0">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-black text-yellow-300">Despacho a todo Chile</p>
                  <p className="text-[10px] text-slate-300">Chilexpress, Blue Express</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};


