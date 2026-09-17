import React, { useState } from 'react';
import { Star, MessageSquare, Plus, CheckCircle, Dog, Camera, X } from 'lucide-react';
import { Review } from '../types';

interface ReviewsSectionProps {
  reviews: Review[];
  onAddReview: (review: Omit<Review, 'id' | 'date' | 'verified'>) => void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews, onAddReview }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [petName, setPetName] = useState('');
  const [breed, setBreed] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [productName, setProductName] = useState('Chaqueta Impermeable A la Medida');
  const [photoUrl, setPhotoUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!petName || !ownerName || !comment) {
      alert('Por favor completa todos los campos.');
      return;
    }

    const defaultPhotos = [
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80&w=400',
    ];

    onAddReview({
      petName,
      breed: breed || 'Mascota Feliz',
      ownerName,
      rating,
      comment,
      photoUrl: photoUrl.trim() || defaultPhotos[Math.floor(Math.random() * defaultPhotos.length)],
      productName,
    });

    // Reset & close
    setPetName('');
    setBreed('');
    setOwnerName('');
    setComment('');
    setPhotoUrl('');
    setModalOpen(false);
  };

  return (
    <section id="testimonios" className="py-16 bg-white border-b-2 border-orange-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-orange-200 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-yellow-400 text-slate-900 font-black text-xs uppercase tracking-wider">
              <Star className="w-4 h-4 fill-slate-900 text-slate-900" />
              <span>Experiencias Reales petsimona25</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Reseñas y Testimonios de Clientes 🐕
            </h2>
            <p className="text-slate-600 text-sm max-w-xl font-medium">
              Descubre por qué cientos de dueños de mascotas en Rengo, la Región de O'Higgins y todo Chile confían en nuestra confección ergonómica a la medida.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <a
              href="#google-business-reviews"
              className="inline-flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border-2 border-blue-200 font-black uppercase tracking-wider px-5 py-3.5 rounded-2xl shadow-xs transition-all text-xs shrink-0 cursor-pointer"
            >
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-500" />
              <span>Ver Perfil Google Maps (4.9 ⭐)</span>
            </a>

            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest px-6 py-3.5 rounded-2xl shadow-md transition-all text-xs sm:text-sm shrink-0 cursor-pointer"
            >
              <Plus className="w-5 h-5 text-white" />
              Escribir una Reseña con Foto
            </button>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-orange-50/50 rounded-3xl p-6 border-2 border-orange-200 shadow-md flex flex-col justify-between space-y-4 hover:shadow-xl transition-all"
            >
              <div className="space-y-3">
                {/* Pet Photo & Header */}
                <div className="flex items-center gap-3">
                  <img
                    src={rev.photoUrl}
                    alt={`Mascota ${rev.petName} (${rev.breed}) usando prenda confeccionada a la medida de petsimona25 en Rengo Chile`}
                    title={`Mascota ${rev.petName} - Cliente de petsimona25.cl`}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-orange-300 shadow-xs"
                  />
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                      {rev.petName}
                      <span className="text-[11px] font-black text-orange-700 bg-orange-200/80 px-2 py-0.5 rounded-full">
                        {rev.breed}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 font-bold">
                      Dueño: {rev.ownerName}
                    </p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < rev.rating
                            ? 'fill-yellow-400 text-yellow-500'
                            : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  {rev.verified && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      Compra Verificada
                    </span>
                  )}
                </div>

                {/* Comment */}
                <p className="text-xs text-slate-700 font-medium leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              {rev.productName && (
                <div className="pt-3 border-t-2 border-orange-100 text-[11px] text-slate-500 font-bold">
                  Prenda: <strong className="text-slate-900">{rev.productName}</strong>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Review Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border-2 border-orange-200 relative animate-scale-up">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-slate-900 mb-1">
              Dejar una Reseña para petsimona25 🐕
            </h3>
            <p className="text-xs text-slate-500 font-medium mb-4">
              Cuéntanos la experiencia de tu peludo con su prenda a la medida.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-slate-900 uppercase block mb-1">
                    Nombre Mascota *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Rocky"
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-900 uppercase block mb-1">
                    Raza *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Bulldog Francés"
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 text-sm font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-slate-900 uppercase block mb-1">
                    Tu Nombre *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Camila M."
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-900 uppercase block mb-1">
                    Calificación *
                  </label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 text-sm font-bold"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5/5 Excelente)</option>
                    <option value={4}>⭐⭐⭐⭐ (4/5 Muy Bueno)</option>
                    <option value={3}>⭐⭐⭐ (3/5 Bueno)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-900 uppercase block mb-1">
                  Tu Experiencia o Comentario *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Escribe cómo le quedó la prenda, la calidad de la tela, el tiempo de entrega..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 text-xs font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-900 uppercase block mb-1">
                  URL Foto de tu Mascota (Opcional)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 text-xs font-medium"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border-2 border-slate-200 text-xs font-black text-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-wider"
                >
                  Publicar Reseña
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
