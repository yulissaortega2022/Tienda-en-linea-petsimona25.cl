import React, { useState } from 'react';
import { MapPin, Navigation, Compass, ExternalLink, ShieldCheck, Clock, Phone, Key, Sparkles, CheckCircle, Info, Truck } from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useAdvancedMarkerRef } from '@vis.gl/react-google-maps';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

// Coordinate landmarks for petsimona25 in Rengo & Rosario
export const LOCATIONS = [
  {
    id: 'silos',
    title: 'Taller Artesanal #petsimona25 (Sector Los Silos)',
    category: 'Taller de Confección & Retiro Presencial',
    address: 'Sector Los Silos s/n, Rengo, Región de O\'Higgins, Chile',
    coords: { lat: -34.4075, lng: -70.8638 },
    description: 'Punto central de corte, toma de medidas y confección a mano con telas hipoalergénicas.',
    badge: 'Taller Principal',
    badgeColor: 'bg-orange-500 text-white'
  },
  {
    id: 'rosario',
    title: 'Punto de Cobertura Rosario (Rengo)',
    category: 'Zona de Despacho Preferente',
    address: 'Localidad de Rosario, Comuna de Rengo, Chile',
    coords: { lat: -34.3789, lng: -70.8575 },
    description: 'Atención directa y despacho local express para perritos en Rosario y alrededores.',
    badge: 'Zona Rosario',
    badgeColor: 'bg-yellow-400 text-slate-900'
  },
  {
    id: 'rengo-centro',
    title: 'Rengo Centro (Plaza de Armas)',
    category: 'Referencia Geográfica',
    address: 'Plaza de Armas de Rengo, O\'Higgins',
    coords: { lat: -34.4167, lng: -70.8667 },
    description: 'Punto céntrico para entregas coordinadas vía WhatsApp.',
    badge: 'Rengo Centro',
    badgeColor: 'bg-emerald-500 text-slate-950'
  }
];

interface MarkerWithInfoProps {
  key?: string;
  loc: typeof LOCATIONS[0];
  isSelected: boolean;
  onSelect: () => void;
}

function MarkerWithInfo({ loc, isSelected, onSelect }: MarkerWithInfoProps) {
  const [markerRef, marker] = useAdvancedMarkerRef();

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={loc.coords}
        onClick={onSelect}
        title={loc.title}
      >
        <Pin
          background={loc.id === 'silos' ? '#ea580c' : loc.id === 'rosario' ? '#eab308' : '#10b981'}
          borderColor="#ffffff"
          glyphColor="#ffffff"
        />
      </AdvancedMarker>

      {isSelected && (
        <InfoWindow anchor={marker} onCloseClick={onSelect}>
          <div className="p-2 space-y-1 text-slate-900 max-w-xs">
            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${loc.badgeColor}`}>
              {loc.badge}
            </span>
            <h4 className="font-black text-xs leading-snug">{loc.title}</h4>
            <p className="text-[10px] text-slate-600 font-medium leading-tight">{loc.address}</p>
            <div className="pt-1.5 text-[10px] font-mono text-slate-500">
              Coordenadas: {loc.coords.lat}, {loc.coords.lng}
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

export const WorkshopMap: React.FC = () => {
  const [activeLocationId, setActiveLocationId] = useState<string>('silos');

  const selectedLoc = LOCATIONS.find((l) => l.id === activeLocationId) || LOCATIONS[0];

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${selectedLoc.coords.lat},${selectedLoc.coords.lng}`;
  const googleDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${selectedLoc.coords.lat},${selectedLoc.coords.lng}`;

  return (
    <section id="ubicacion-taller" className="py-16 bg-slate-900 text-white relative overflow-hidden">
      {/* Background Subtle Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative space-y-10">
        
        {/* Title Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-orange-400 font-black text-xs uppercase tracking-wider">
            <Compass className="w-4 h-4 text-orange-400 animate-spin-slow" />
            <span>Ubicación Geográfica &amp; Referencias Rengo</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Taller Artesanal en Rengo, Los Silos y Rosario 📍
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed font-medium">
            Confeccionamos cada prenda a la medida directamente en nuestro taller ubicado en <strong className="text-orange-400">Sector Los Silos, Rengo y cobertura en Rosario</strong>, Región de O'Higgins.
          </p>
        </div>

        {/* Location Selector Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {LOCATIONS.map((loc) => {
            const isSelected = activeLocationId === loc.id;
            return (
              <button
                key={loc.id}
                onClick={() => setActiveLocationId(loc.id)}
                className={`p-5 rounded-3xl border-2 text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'border-orange-500 bg-slate-800 shadow-xl scale-[1.02]'
                    : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${loc.badgeColor}`}>
                      {loc.badge}
                    </span>
                    {isSelected && <CheckCircle className="w-4 h-4 text-orange-400" />}
                  </div>
                  <h3 className="text-sm font-black text-white leading-snug">{loc.title}</h3>
                  <p className="text-xs text-slate-400 font-medium mt-1 leading-relaxed">{loc.address}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-[11px] font-mono text-slate-400">
                  <span>Lat: {loc.coords.lat}</span>
                  <span>Lng: {loc.coords.lng}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Interactive Map Block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Main Interactive Map Viewer Container */}
          <div className="lg:col-span-8 bg-slate-800 rounded-3xl border-2 border-slate-700 overflow-hidden shadow-2xl relative min-h-[420px] flex flex-col">
            
            {hasValidKey ? (
              <div className="w-full h-[450px] relative">
                <APIProvider apiKey={API_KEY} version="weekly">
                  <Map
                    defaultCenter={selectedLoc.coords}
                    center={selectedLoc.coords}
                    defaultZoom={14}
                    mapId="DEMO_MAP_ID"
                    internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                    style={{ width: '100%', height: '100%' }}
                  >
                    {LOCATIONS.map((loc) => (
                      <MarkerWithInfo
                        key={loc.id}
                        loc={loc}
                        isSelected={activeLocationId === loc.id}
                        onSelect={() => setActiveLocationId(loc.id)}
                      />
                    ))}
                  </Map>
                </APIProvider>
              </div>
            ) : (
              /* Fallback Interactive Embed & OSM Map View when Google Maps key is not set */
              <div className="w-full h-[450px] relative bg-slate-950 flex flex-col justify-between overflow-hidden group">
                {/* OpenStreetMap iframe fallback centered on Rengo Los Silos / Rosario */}
                <iframe
                  title="Mapa de Ubicación Rengo Los Silos"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight={0}
                  marginWidth={0}
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedLoc.coords.lng - 0.035}%2C${selectedLoc.coords.lat - 0.025}%2C${selectedLoc.coords.lng + 0.035}%2C${selectedLoc.coords.lat + 0.025}&layer=mapnik&marker=${selectedLoc.coords.lat}%2C${selectedLoc.coords.lng}`}
                  className="w-full h-full opacity-90 contrast-125"
                ></iframe>

                {/* Top Badge Overlay */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 pointer-events-none">
                  <div className="bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-700 shadow-lg text-xs font-extrabold flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-400" />
                    <span>{selectedLoc.title}</span>
                  </div>

                  <span className="bg-orange-500 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-md">
                    Coordenadas Exactas
                  </span>
                </div>

                {/* Bottom Floating Coordinates Ribbon */}
                <div className="absolute bottom-4 left-4 right-4 bg-slate-900/95 backdrop-blur-md p-4 rounded-2xl border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="font-mono text-slate-300 text-center sm:text-left">
                    <span className="text-orange-400 font-bold block">GPS Coordinates:</span>
                    <span>Lat: {selectedLoc.coords.lat} | Lng: {selectedLoc.coords.lng}</span>
                  </div>

                  <a
                    href={googleDirectionsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-orange-600 hover:bg-orange-500 text-white font-black px-4 py-2.5 rounded-xl uppercase text-[11px] tracking-wider flex items-center gap-1.5 transition-all shadow-md shrink-0"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Cómo Llegar en Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

          </div>

          {/* Right Info Panel */}
          <div className="lg:col-span-4 bg-slate-800/90 rounded-3xl p-6 sm:p-8 border-2 border-slate-700 space-y-6 flex flex-col justify-between shadow-2xl">
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-700 pb-4">
                <div className="w-10 h-10 bg-orange-500/20 rounded-2xl flex items-center justify-center border border-orange-500/30">
                  <MapPin className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Detalles del Punto</h3>
                  <p className="text-xs text-slate-400 font-medium">Comuna de Rengo, O'Higgins</p>
                </div>
              </div>

              <div className="space-y-3 text-xs font-medium text-slate-300">
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-700 space-y-1">
                  <span className="text-[10px] uppercase font-black text-orange-400 block tracking-wider">Dirección &amp; Referencia:</span>
                  <p className="font-bold text-white text-sm">{selectedLoc.address}</p>
                </div>

                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-700 space-y-1">
                  <span className="text-[10px] uppercase font-black text-yellow-400 block tracking-wider">Información del Punto:</span>
                  <p className="text-slate-300 text-xs leading-relaxed">{selectedLoc.description}</p>
                </div>

                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-700 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Entrega Local:</span>
                    <span className="text-emerald-400 font-bold">Rengo, Rosario, Pelequén</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Retiro en Taller:</span>
                    <span className="text-yellow-400 font-bold">Previa coordinación WA</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp & Map Buttons */}
            <div className="space-y-2 pt-2">
              <a
                href={`https://wa.me/56972374764?text=Hola%20petsimona25,%20quisiera%20coordinar%20retiro%20o%20visita%20en%20el%20taller%20de%20Rengo%20(${encodeURIComponent(selectedLoc.title)})`}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3.5 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                <Phone className="w-4 h-4" />
                <span>Coordinar Visita / Retiro por WhatsApp</span>
              </a>

              <a
                href={googleDirectionsUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-slate-900 hover:bg-slate-950 text-orange-400 border border-slate-700 font-black py-3 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Abrir Rengo en Google Maps</span>
              </a>
            </div>

          </div>

        </div>

        {/* Setup Helper Note if Google Maps API Key setup needed */}
        {!hasValidKey && (
          <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <Key className="w-5 h-5 text-yellow-400 shrink-0" />
              <div>
                <strong className="text-white block font-bold">¿Deseas activar la vista satelital interactiva de Google Maps?</strong>
                <span>Puedes agregar la variable de entorno <code className="text-yellow-400 font-mono">GOOGLE_MAPS_PLATFORM_KEY</code> en Settings → Secrets.</span>
              </div>
            </div>
            <a
              href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-[11px] uppercase tracking-wider whitespace-nowrap"
            >
              Obtener Clave Google Maps
            </a>
          </div>
        )}

      </div>
    </section>
  );
};
