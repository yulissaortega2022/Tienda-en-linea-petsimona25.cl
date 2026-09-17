import React from 'react';
import { Instagram, Facebook, Dog, Heart, Sparkles, Share2 } from 'lucide-react';

export const SocialMediaBar: React.FC = () => {
  return (
    <section className="py-12 bg-orange-50/50 border-b-2 border-orange-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-orange-200 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-yellow-400 text-slate-900 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider">
              <Share2 className="w-4 h-4 text-slate-900" />
              <span>Comunidad Oficial @petsimona25</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Síguenos en Redes Sociales 🐕
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Usa el hashtag <strong className="text-orange-600 font-bold">#PetSimonaAMedida</strong> en Instagram, TikTok o Facebook para aparecer en nuestra galería oficial de clientes VIP.
            </p>
          </div>

          {/* Social Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Instagram */}
            <a
              href="https://instagram.com/petsimona25"
              target="_blank"
              rel="noreferrer"
              className="p-5 rounded-2xl bg-orange-50 border-2 border-orange-200 hover:border-orange-400 hover:shadow-lg transition-all group flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform">
                <Instagram className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-base flex items-center gap-1">
                  Instagram
                  <span className="text-xs text-orange-600 font-bold">@petsimona25</span>
                </h4>
                <p className="text-xs text-slate-600 font-medium">
                  Fotos diarias de perritos luciendo sus abrigos a la medida.
                </p>
              </div>
            </a>

            {/* TikTok */}
            <a
              href="https://tiktok.com/@petsimona25"
              target="_blank"
              rel="noreferrer"
              className="p-5 rounded-2xl bg-slate-900 text-white border-2 border-slate-800 hover:border-yellow-400 hover:shadow-lg transition-all group flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-800 text-yellow-400 flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform border border-slate-700">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.38a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.64a6.34 6.34 0 0 0 10.82 4.48A6.3 6.3 0 0 0 15.8 15V8.5a8.28 8.28 0 0 0 4.79 1.51V6.56a4.8 4.8 0 0 1-1-.13z"/>
                </svg>
              </div>
              <div>
                <h4 className="font-black text-white text-base flex items-center gap-1">
                  TikTok
                  <span className="text-xs text-yellow-400 font-bold">@petsimona25</span>
                </h4>
                <p className="text-xs text-slate-300 font-medium">
                  Videos del proceso de confección, corte y prueba de ropa.
                </p>
              </div>
            </a>

            {/* Facebook */}
            <a
              href="https://facebook.com/petsimona25"
              target="_blank"
              rel="noreferrer"
              className="p-5 rounded-2xl bg-slate-100 border-2 border-slate-300 hover:border-slate-500 hover:shadow-lg transition-all group flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform">
                <Facebook className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-base flex items-center gap-1">
                  Facebook
                  <span className="text-xs text-slate-600 font-bold">@petsimona25</span>
                </h4>
                <p className="text-xs text-slate-600 font-medium">
                  Noticias, eventos de mascotas y promociones exclusivas.
                </p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
