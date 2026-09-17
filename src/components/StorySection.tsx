import React from 'react';
import { Heart, Leaf, MapPin, Award, Sparkles, ShieldCheck, MessageCircle, ExternalLink } from 'lucide-react';
import founderImg from '../assets/images/founder_simona_photo_1789595561233.jpg';

export const StorySection: React.FC = () => {
  const whatsappUrl = `https://wa.me/56972374764?text=${encodeURIComponent('Hola! Leí la inspiradora historia de la fundadora maipucina de petsimona25 en Rengo y quisiera cotizar ropa a la medida para mi mascota 🐕')}`;

  return (
    <section id="historia" className="py-20 bg-emerald-900 text-white relative overflow-hidden border-b-2 border-emerald-800">
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-96 h-96 bg-emerald-800/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Header Badge */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-400 text-slate-900 font-black text-xs uppercase tracking-wider shadow-lg">
            <Heart className="w-4 h-4 text-red-600 fill-red-600" />
            <span>Historia Emprendedora &amp; Eco-Sustentable #petsimona25</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            De Maipú a Rengo: Una Historia de Amor, Naturaleza y Reinvención 🏞️
          </h2>
          <p className="text-emerald-100 text-base font-medium leading-relaxed">
            Conoce a la creadora de <strong className="text-yellow-400 font-bold">petsimona25</strong>, educadora diferencial maipucina que transformó la adversidad en un taller artesanal de alta costura canina ecológica en la Región de O'Higgins, Chile.
          </p>
        </div>

        {/* Content Card Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Visual Showcase Box */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-emerald-950 p-4 rounded-3xl border-2 border-emerald-700 shadow-2xl space-y-4 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-lg border border-emerald-800">
                <img
                  src={founderImg}
                  alt="Fundadora de petsimona25 con Simona en su taller artesanal de Rengo Chile"
                  referrerPolicy="no-referrer"
                  className="w-full h-88 object-cover"
                />
                <div className="absolute top-3 left-3 bg-amber-500 text-slate-950 font-black text-[11px] px-3 py-1 rounded-full shadow-md flex items-center gap-1.5 border border-amber-300">
                  <span>✨ Handmade by @petsimona25</span>
                </div>
                <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-xs text-yellow-300 font-black text-[11px] px-3.5 py-1 rounded-full border border-yellow-500/50 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-red-400" /> Taller en Rengo, Región de O'Higgins 🇨🇱
                </div>
              </div>

              {/* Highlights grid */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-emerald-900/80 rounded-2xl border border-emerald-700/60 text-center space-y-1">
                  <Leaf className="w-5 h-5 text-emerald-400 mx-auto" />
                  <span className="text-xs font-black text-white block">100% Eco-Materiales</span>
                  <span className="text-[10px] text-emerald-200 font-medium block">Telas Reutilizables</span>
                </div>

                <div className="p-3 bg-emerald-900/80 rounded-2xl border border-emerald-700/60 text-center space-y-1">
                  <Award className="w-5 h-5 text-yellow-400 mx-auto" />
                  <span className="text-xs font-black text-white block">Educadora Diferencial</span>
                  <span className="text-[10px] text-emerald-200 font-medium block">Vocación &amp; Paciencia</span>
                </div>
              </div>
            </div>
          </div>

          {/* Narrative Text Column */}
          <div className="lg:col-span-7 space-y-6 text-emerald-50 font-medium">
            <div className="space-y-4">
              <h3 className="text-2xl font-black text-yellow-400 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-yellow-400 shrink-0" />
                Superación, Vocación y Amor por los Animales
              </h3>

              <p className="text-sm sm:text-base leading-relaxed text-emerald-100">
                Originaria de la comuna de <strong>Maipú (Santiago)</strong> y de profesión <strong>Educadora Diferencial</strong>, nuestra fundadora dedicó años de su vida a la enseñanza inclusiva. Sin embargo, tras enfrentar un grave quebranto de salud que devino en una condición de discapacidad física, debió pausar su labor en las aulas y reinventarse desde el corazón.
              </p>

              <p className="text-sm sm:text-base leading-relaxed text-emerald-100">
                Buscando la tranquilidad del aire puro y la magia del campo, decidió trasladarse a vivir a <strong>Rengo, Región de O'Higgins 🏞️</strong>. Fue entre verdes paisajes y en compañía de sus queridas mascotas donde nació el proyecto <strong className="text-yellow-300 font-black">petsimona25</strong>.
              </p>

              <p className="text-sm sm:text-base leading-relaxed text-emerald-100">
                Inspirada en el bienestar animal y preocupada por la contaminación textil, comenzó a diseñar y confeccionar <strong>ropa hecha a la medida para perros chicos y medianos</strong> utilizando <em>materiales eco-reutilizables y sustentables</em> ♻️. Cada prenda se diseña meticulosamente para no presionar articulaciones, garantizando total libertad de movimiento a perritos con necesidades especiales, de edad avanzada o de anatomías complejas (como Pugs, Bulldogs Franceses o Salchichas).
              </p>
            </div>

            {/* Values Pill Badges */}
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="px-3.5 py-1.5 bg-emerald-800 text-yellow-300 border border-emerald-600 rounded-full text-xs font-black">
                🌱 Conciencia Ambiental
              </span>
              <span className="px-3.5 py-1.5 bg-emerald-800 text-emerald-200 border border-emerald-600 rounded-full text-xs font-black">
                🐾 Bienestar Animal Ergonómico
              </span>
              <span className="px-3.5 py-1.5 bg-emerald-800 text-yellow-300 border border-emerald-600 rounded-full text-xs font-black">
                🇨🇱 Hecho en Rengo, Región de O'Higgins
              </span>
              <span className="px-3.5 py-1.5 bg-emerald-800 text-emerald-200 border border-emerald-600 rounded-full text-xs font-black">
                #petsimona25
              </span>
            </div>

            {/* Direct Contact & Website Link CTA */}
            <div className="p-5 bg-slate-900/90 rounded-3xl border-2 border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
              <div className="space-y-1">
                <span className="text-[11px] font-black text-yellow-400 uppercase tracking-wider block">
                  Atención Directa por la Creadora
                </span>
                <p className="text-xs text-slate-300">
                  ¿Tienes dudas de medidas para tu perrito chico o mediano? Contáctanos por WhatsApp al <strong>+56 9 7237 4764</strong>.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-black px-5 py-2.5 rounded-2xl text-xs uppercase tracking-wider shadow-lg transition-all flex items-center gap-2 active:scale-95"
                >
                  <MessageCircle className="w-4 h-4 fill-current" /> WhatsApp +56972374764
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
