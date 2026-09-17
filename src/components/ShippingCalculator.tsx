import React, { useState } from 'react';
import { Truck, MapPin, Calculator, ShieldCheck, Clock, CheckCircle, Info, Sparkles, Navigation, Layers, ExternalLink } from 'lucide-react';

export interface CourierOption {
  id: 'blueexpress' | 'chilexpress' | 'starken' | 'correos';
  name: string;
  tagline: string;
  logoColor: string;
  accentBadge: string;
  basePrice: number;
  deliveryTime: string;
  features: string[];
}

export const COURIERS: CourierOption[] = [
  {
    id: 'blueexpress',
    name: 'Blue Express',
    tagline: 'Red de Puntos y Entregas Ágiles en Todo Chile',
    logoColor: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    accentBadge: 'bg-blue-600 text-white',
    basePrice: 3490,
    deliveryTime: '24 a 48 Horas',
    features: ['Entrega a domicilio', 'Red Puntos BlueExpress', 'Seguimiento por WhatsApp']
  },
  {
    id: 'chilexpress',
    name: 'Chilexpress',
    tagline: 'Envío Express Prioritario y Sucursales',
    logoColor: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
    accentBadge: 'bg-amber-500 text-slate-900 font-black',
    basePrice: 3900,
    deliveryTime: '24 Horas Express',
    features: ['Despacho prioritario', 'Retiro en Sucursal', 'Seguimiento en línea 24/7']
  },
  {
    id: 'starken',
    name: 'Starken',
    tagline: 'Cobertura Nacional y Envíos por Cobrar',
    logoColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    accentBadge: 'bg-emerald-600 text-white',
    basePrice: 3600,
    deliveryTime: '24 a 72 Horas',
    features: ['Envío a domicilio o agencias', 'Opción Envío por Cobrar', 'Respaldo Starken']
  },
  {
    id: 'correos',
    name: 'Correos de Chile',
    tagline: 'Cobertura del Estado a Comunidades y Zonas Extremas',
    logoColor: 'text-red-400 border-red-500/30 bg-red-500/10',
    accentBadge: 'bg-red-600 text-white',
    basePrice: 3200,
    deliveryTime: '48 a 96 Horas',
    features: ['Mayor cobertura en zonas rurales', 'Precios económicos', 'Casilleros y sucursales']
  }
];

export interface ShippingZone {
  id: string;
  name: string;
  region: string;
  communes: string[];
  prices: Record<'blueexpress' | 'chilexpress' | 'starken' | 'correos', number>;
  deliveryTime: string;
  badge?: string;
}

export const SHIPPING_ZONES: ShippingZone[] = [
  {
    id: 'rengo-pickup',
    name: 'Retiro en Taller (Rengo)',
    region: "Región de O'Higgins",
    communes: ['Rengo (Retiro en Taller artesanal)'],
    prices: {
      blueexpress: 0,
      chilexpress: 0,
      starken: 0,
      correos: 0
    },
    deliveryTime: 'Inmediato (Previa coordinación)',
    badge: '¡GRATIS!'
  },
  {
    id: 'rengo-local',
    name: 'Rengo Urbano / Rosario / San Juan',
    region: "Región de O'Higgins",
    communes: ['Rengo Urbano', 'Rosario', 'San Juan', 'Esmeralda', 'Pelequén'],
    prices: {
      blueexpress: 1900,
      chilexpress: 2200,
      starken: 1900,
      correos: 1800
    },
    deliveryTime: '24 Horas Directo',
    badge: 'Despacho Local'
  },
  {
    id: 'cachapoal-near',
    name: 'Comunas Cercanas Cachapoal',
    region: "Región de O'Higgins",
    communes: [
      'Requínoa',
      'Malloa',
      'Rancagua',
      'Machalí',
      'Olivar',
      'Quinta de Tilcoco',
      'Coinco',
      'Graneros',
      'San Vicente de Tagua Tagua',
      'Doñihue',
      'Coltauco'
    ],
    prices: {
      blueexpress: 2790,
      chilexpress: 3200,
      starken: 2900,
      correos: 2600
    },
    deliveryTime: '24 a 48 Horas',
    badge: 'Preferencial'
  },
  {
    id: 'ohiggins-rest',
    name: "Resto Región de O'Higgins",
    region: "Región de O'Higgins",
    communes: [
      'San Fernando',
      'Chimbarongo',
      'Santa Cruz',
      'Pichilemu',
      'Peralillo',
      'Palmilla',
      'Nancagua',
      'Placilla',
      'Pumanque',
      'Marchigüe',
      'Litueche',
      'Navidad',
      'Paredones'
    ],
    prices: {
      blueexpress: 3290,
      chilexpress: 3800,
      starken: 3500,
      correos: 3100
    },
    deliveryTime: '48 Horas'
  },
  {
    id: 'rm-santiago',
    name: 'Región Metropolitana (Santiago)',
    region: 'Región Metropolitana',
    communes: [
      'Maipú',
      'Santiago Centro',
      'San Bernardo',
      'Puente Alto',
      'Providencia',
      'Las Condes',
      'La Florida',
      'Ñuñoa',
      'Pudahuel',
      'Quilicura',
      'Otras comunas RM'
    ],
    prices: {
      blueexpress: 3490,
      chilexpress: 3900,
      starken: 3600,
      correos: 3200
    },
    deliveryTime: '24 a 48 Horas',
    badge: 'Especial Maipú'
  },
  {
    id: 'centro-chile',
    name: 'Zona Centro (Valparaíso / Maule / Ñuble)',
    region: 'Valparaíso, Maule, Ñuble',
    communes: [
      'Valparaíso',
      'Viña del Mar',
      'Rancagua Norte',
      'Curicó',
      'Talca',
      'Linares',
      'Chillán',
      'Quillota',
      'San Antonio'
    ],
    prices: {
      blueexpress: 3990,
      chilexpress: 4500,
      starken: 4200,
      correos: 3800
    },
    deliveryTime: '2 a 3 Días Hábiles'
  },
  {
    id: 'norte-sur',
    name: 'Zona Norte y Sur (Biobío a Los Lagos / Coquimbo)',
    region: 'Coquimbo, Biobío, Araucanía, Los Ríos, Los Lagos',
    communes: [
      'La Serena / Coquimbo',
      'Concepción / Talcahuano',
      'Los Ángeles',
      'Temuco',
      'Valdivia',
      'Osorno',
      'Puerto Montt',
      'Copiapó',
      'Antofagasta'
    ],
    prices: {
      blueexpress: 4890,
      chilexpress: 5500,
      starken: 5200,
      correos: 4700
    },
    deliveryTime: '2 a 4 Días Hábiles'
  },
  {
    id: 'extremo',
    name: 'Zonas Extremas (Arica, Iquique, Magallanes, Aysén)',
    region: 'Arica, Tarapacá, Aysén, Magallanes',
    communes: ['Arica', 'Iquique', 'Calama', 'Coyhaique', 'Punta Arenas', 'Isla de Pascua'],
    prices: {
      blueexpress: 6490,
      chilexpress: 7200,
      starken: 6800,
      correos: 5900
    },
    deliveryTime: '3 a 5 Días Hábiles'
  }
];

export const ShippingCalculator: React.FC = () => {
  const [selectedZoneId, setSelectedZoneId] = useState<string>('rengo-local');
  const [selectedCommune, setSelectedCommune] = useState<string>('Rengo Urbano');
  const [selectedCourierId, setSelectedCourierId] = useState<'blueexpress' | 'chilexpress' | 'starken' | 'correos'>('blueexpress');
  const [cartSubtotal, setCartSubtotal] = useState<number>(24900);
  const [activeTab, setActiveTab] = useState<'calculator' | 'comparison'>('calculator');

  const currentZone = SHIPPING_ZONES.find((z) => z.id === selectedZoneId) || SHIPPING_ZONES[1];
  const currentCourier = COURIERS.find((c) => c.id === selectedCourierId) || COURIERS[0];

  const handleZoneChange = (zoneId: string) => {
    setSelectedZoneId(zoneId);
    const zone = SHIPPING_ZONES.find((z) => z.id === zoneId);
    if (zone && zone.communes.length > 0) {
      setSelectedCommune(zone.communes[0]);
    }
  };

  const isFreeShipping = cartSubtotal >= 45000;
  const rawPrice = currentZone.prices[selectedCourierId];
  const finalShippingPrice = isFreeShipping && rawPrice > 0 ? 0 : rawPrice;

  return (
    <section id="calculadora-envios" className="py-16 bg-slate-900 text-white relative overflow-hidden">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
        {/* Title Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-yellow-400 font-black text-xs uppercase tracking-wider">
            <Truck className="w-4 h-4 text-yellow-400" />
            <span>Tarifario Oficial &amp; Courier Partner petsimona25.cl</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Empresas de Envíos y Tarifas a Todo Chile 🇨🇱
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed font-medium">
            Compara valores reales de despacho entre <strong className="text-blue-400 font-bold">Blue Express</strong>, <strong className="text-yellow-400 font-bold">Chilexpress</strong>, <strong className="text-emerald-400 font-bold">Starken</strong> y <strong className="text-red-400 font-bold">Correos de Chile</strong> desde nuestro taller en Rengo.
          </p>
        </div>

        {/* Courier Showcase Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {COURIERS.map((courier) => {
            const isSelected = selectedCourierId === courier.id;
            return (
              <button
                key={courier.id}
                onClick={() => setSelectedCourierId(courier.id)}
                className={`p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'border-yellow-400 bg-slate-800 shadow-xl scale-[1.02]'
                    : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-black uppercase px-2 py-0.5 rounded-md ${courier.logoColor}`}>
                      {courier.name}
                    </span>
                    {isSelected && <CheckCircle className="w-4 h-4 text-yellow-400" />}
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium leading-tight">{courier.tagline}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800/80 flex justify-between items-center text-[10px] text-slate-400 font-bold">
                  <span>Desde ${courier.basePrice.toLocaleString('es-CL')} CLP</span>
                  <span className="text-yellow-400">{courier.deliveryTime}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Free Shipping Alert Banner */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-4 sm:p-5 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 border-2 border-yellow-300/40">
          <div className="flex items-center gap-3 text-slate-900 text-center sm:text-left">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-md">
              <Sparkles className="w-7 h-7 text-orange-600 animate-pulse" />
            </div>
            <div>
              <p className="font-black text-base uppercase tracking-wider text-slate-900">
                ¡Promoción de Envío GRATIS a Todo Chile! 🎉
              </p>
              <p className="text-xs text-slate-900 font-bold opacity-90">
                En compras superiores a <strong>$45.000 CLP</strong>, el costo de envío es 100% GRATUITO en cualquiera de los couriers.
              </p>
            </div>
          </div>
          <a
            href="#catalogo"
            className="bg-slate-900 hover:bg-slate-800 text-yellow-400 font-black text-xs px-6 py-3 rounded-2xl tracking-wider uppercase transition-all shadow-md shrink-0"
          >
            Ver Catálogo
          </a>
        </div>

        {/* Interactive Calculator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Form */}
          <div className="lg:col-span-5 bg-slate-800/90 rounded-3xl p-6 sm:p-8 border-2 border-slate-700 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-700 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500/20 rounded-2xl flex items-center justify-center border border-orange-500/30">
                  <Calculator className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Calculadora de Tarifa</h3>
                  <p className="text-xs text-slate-400 font-medium">Cotiza según courier y destino</p>
                </div>
              </div>
            </div>

            {/* Courier Selection Dropdown */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-300 uppercase tracking-wider block">
                1. Selecciona Empresa de Courier *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {COURIERS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCourierId(c.id)}
                    className={`px-3 py-2.5 rounded-xl border-2 text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
                      selectedCourierId === c.id
                        ? 'bg-yellow-400 border-yellow-400 text-slate-900 font-black shadow-md'
                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Zone Selector */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-300 uppercase tracking-wider block">
                2. Selecciona Zona / Región *
              </label>
              <select
                value={selectedZoneId}
                onChange={(e) => handleZoneChange(e.target.value)}
                className="w-full bg-slate-900 border-2 border-slate-700 focus:border-yellow-400 text-white text-xs font-bold rounded-2xl px-4 py-3 outline-hidden transition-all"
              >
                {SHIPPING_ZONES.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name} (${zone.prices[selectedCourierId] === 0 ? 'GRATIS' : `${zone.prices[selectedCourierId].toLocaleString('es-CL')} CLP`})
                  </option>
                ))}
              </select>
            </div>

            {/* Commune Selector */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-300 uppercase tracking-wider block">
                3. Selecciona Comuna Específica *
              </label>
              <select
                value={selectedCommune}
                onChange={(e) => setSelectedCommune(e.target.value)}
                className="w-full bg-slate-900 border-2 border-slate-700 focus:border-yellow-400 text-yellow-300 text-xs font-bold rounded-2xl px-4 py-3 outline-hidden transition-all"
              >
                {currentZone.communes.map((commune) => (
                  <option key={commune} value={commune}>
                    📍 {commune}
                  </option>
                ))}
              </select>
            </div>

            {/* Optional Subtotal Test Slider */}
            <div className="space-y-2 bg-slate-900 p-4 rounded-2xl border border-slate-700">
              <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                <span>Monto estimado del pedido:</span>
                <span className="text-yellow-400 font-mono font-black">${cartSubtotal.toLocaleString('es-CL')} CLP</span>
              </div>
              <input
                type="range"
                min="10000"
                max="80000"
                step="5000"
                value={cartSubtotal}
                onChange={(e) => setCartSubtotal(Number(e.target.value))}
                className="w-full accent-orange-500 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 font-medium italic">
                {isFreeShipping
                  ? '¡Felicidades! Superas los $45.000 CLP, obtienes Envío GRATUITO.'
                  : `Te faltan $${(45000 - cartSubtotal).toLocaleString('es-CL')} CLP para envío GRATIS.`}
              </p>
            </div>

            {/* Calculated Result Box */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-5 rounded-2xl border-2 border-orange-500/40 space-y-3 shadow-inner">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-black tracking-wider block">Tarifa {currentCourier.name}:</span>
                  <span className="text-[11px] text-orange-400 font-bold">{selectedCommune}</span>
                </div>
                <span className="text-2xl font-black text-orange-400 font-mono">
                  {finalShippingPrice === 0 ? (
                    <span className="text-emerald-400 font-extrabold uppercase tracking-wide">¡GRATIS!</span>
                  ) : (
                    `$${finalShippingPrice.toLocaleString('es-CL')} CLP`
                  )}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800 text-xs space-y-1.5 font-medium text-slate-300">
                <p className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                  <span>Tiempo Estimado: <strong className="text-white">{currentCourier.deliveryTime}</strong></span>
                </p>
                <p className="flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                  <span>Courier Elegido: <strong className="text-yellow-400 font-bold">{currentCourier.name}</strong></span>
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                  <span>Origen: <strong className="text-white">Taller petsimona25 (Rengo, Chile)</strong></span>
                </p>
              </div>
            </div>

            {/* Direct WhatsApp Query button */}
            <a
              href={`https://wa.me/56972374764?text=Hola%20petsimona25,%20quisiera%20cotizar%20env%C3%ADo%20v%C3%ADa%20${encodeURIComponent(currentCourier.name)}%20hacia%20la%20comuna%20de%20${encodeURIComponent(selectedCommune)}`}
              target="_blank"
              rel="noreferrer"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3.5 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg"
            >
              <span>Coordinar Despacho {currentCourier.name} por WhatsApp</span>
            </a>
          </div>

          {/* Right Column: Comparative Rates Table across all 4 Couriers */}
          <div className="lg:col-span-7 bg-slate-800/90 rounded-3xl p-6 sm:p-8 border-2 border-slate-700 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-700 pb-4 gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-400/20 rounded-2xl flex items-center justify-center border border-yellow-400/30">
                  <Navigation className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Cuadro Comparativo de Couriers</h3>
                  <p className="text-xs text-slate-400 font-medium">Precios por zona para Blue Express, Chilexpress, Starken y Correos</p>
                </div>
              </div>
              <span className="text-[11px] font-black text-emerald-400 bg-slate-900 border border-slate-700 px-3 py-1 rounded-full uppercase">
                4 Empresas Integradas
              </span>
            </div>

            {/* Comprehensive Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-700">
              <table className="w-full text-left text-xs font-medium text-slate-300">
                <thead className="bg-slate-900 text-slate-200 uppercase text-[10px] sm:text-[11px] font-black border-b border-slate-700">
                  <tr>
                    <th className="p-3">Zona / Destino</th>
                    <th className="p-3 text-center text-blue-400">Blue Express</th>
                    <th className="p-3 text-center text-yellow-400">Chilexpress</th>
                    <th className="p-3 text-center text-emerald-400">Starken</th>
                    <th className="p-3 text-center text-red-400">Correos Chile</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/80 bg-slate-800/50">
                  {SHIPPING_ZONES.map((zone) => {
                    const isSelected = zone.id === selectedZoneId;
                    return (
                      <tr
                        key={zone.id}
                        onClick={() => handleZoneChange(zone.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-orange-500/20 text-white font-bold' : 'hover:bg-slate-700/50'
                        }`}
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-1.5 font-bold">
                            {isSelected && <CheckCircle className="w-3.5 h-3.5 text-yellow-400 shrink-0" />}
                            <span>{zone.name}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{zone.deliveryTime}</p>
                        </td>

                        {/* Blue Express */}
                        <td className={`p-3 text-center font-mono font-black ${selectedCourierId === 'blueexpress' ? 'bg-blue-500/20 text-blue-300' : 'text-slate-200'}`}>
                          {zone.prices.blueexpress === 0 ? 'GRATIS' : `$${zone.prices.blueexpress.toLocaleString('es-CL')}`}
                        </td>

                        {/* Chilexpress */}
                        <td className={`p-3 text-center font-mono font-black ${selectedCourierId === 'chilexpress' ? 'bg-yellow-500/20 text-yellow-300' : 'text-slate-200'}`}>
                          {zone.prices.chilexpress === 0 ? 'GRATIS' : `$${zone.prices.chilexpress.toLocaleString('es-CL')}`}
                        </td>

                        {/* Starken */}
                        <td className={`p-3 text-center font-mono font-black ${selectedCourierId === 'starken' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-200'}`}>
                          {zone.prices.starken === 0 ? 'GRATIS' : `$${zone.prices.starken.toLocaleString('es-CL')}`}
                        </td>

                        {/* Correos de Chile */}
                        <td className={`p-3 text-center font-mono font-black ${selectedCourierId === 'correos' ? 'bg-red-500/20 text-red-300' : 'text-slate-200'}`}>
                          {zone.prices.correos === 0 ? 'GRATIS' : `$${zone.prices.correos.toLocaleString('es-CL')}`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Courier Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300 pt-2 font-medium">
              <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-700 flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white text-xs">Despachos con Seguimiento en Vivo</h4>
                  <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                    Enviamos el número de OT o número de seguimiento directo a tu WhatsApp apenas entregamos el paquete al courier.
                  </p>
                </div>
              </div>

              <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-700 flex items-start gap-2.5">
                <Info className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white text-xs">Entregas Locales en Rengo &amp; Alrededores</h4>
                  <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                    Delivery directo en Rengo, Rosario, Pelequén, Requínoa y Malloa. También opción de retiro presencial en taller.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
