import React, { useState, useEffect } from 'react';
import { Mail, Gift, Sparkles, CheckCircle, Dog, Heart, Users, Bell, TrendingUp, Copy, Check, ChevronLeft, ChevronRight, MapPin, Zap, ShieldCheck } from 'lucide-react';
import { saveSubscriber, getStoredSubscribers } from '../services/newsletterService';

interface RecentMember {
  id: string;
  name: string;
  petName: string;
  breed: string;
  city: string;
  timeAgo: string;
}

const DEFAULT_MEMBERS: RecentMember[] = [
  { id: '1', name: 'Valentina P.', petName: 'Toby', breed: 'Poodle Toy', city: 'Rancagua', timeAgo: 'Hace 3 min' },
  { id: '2', name: 'Gonzalo M.', petName: 'Luna', breed: 'Yorkshire Terrier', city: 'Santiago', timeAgo: 'Hace 7 min' },
  { id: '3', name: 'Fernanda R.', petName: 'Coco', breed: 'Teckel / Salchicha', city: 'Rengo', timeAgo: 'Hace 12 min' },
  { id: '4', name: 'Felipe S.', petName: 'Max', breed: 'Bulldog Francés', city: 'Viña del Mar', timeAgo: 'Hace 18 min' },
  { id: '5', name: 'Camila T.', petName: 'Bella', breed: 'Bichón Maltés', city: 'Concepción', timeAgo: 'Hace 25 min' },
  { id: '6', name: 'Matías L.', petName: 'Simón', breed: 'Mestizo rescatado', city: 'La Serena', timeAgo: 'Hace 34 min' },
];

export const SubscriptionSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [petName, setPetName] = useState('');
  const [breed, setBreed] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [city, setCity] = useState('Rengo');
  const [plan, setPlan] = useState<'newsletter_vip' | 'monthly_box'>('newsletter_vip');
  
  const [subscribedCoupon, setSubscribedCoupon] = useState<string | null>(null);
  const [memberNumber, setMemberNumber] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  // Live Counter & Notifications State
  const [subscriberCount, setSubscriberCount] = useState<number>(1485);
  const [recentMembers, setRecentMembers] = useState<RecentMember[]>(DEFAULT_MEMBERS);
  const [currentNotificationIndex, setCurrentNotificationIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showLiveToast, setShowLiveToast] = useState<boolean>(true);

  // Fetch initial stats from server
  useEffect(() => {
    fetch('/api/subscribers/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.totalCount) {
          setSubscriberCount(data.totalCount);
        }
        if (data.recentMembers && data.recentMembers.length > 0) {
          setRecentMembers(data.recentMembers);
        }
      })
      .catch(() => {
        // Fallback to local default state
      });
  }, []);

  // Automatic Notification Ticker / Carousel
  useEffect(() => {
    if (isPaused || recentMembers.length === 0) return;
    const interval = setInterval(() => {
      setCurrentNotificationIndex((prev) => (prev + 1) % recentMembers.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused, recentMembers.length]);

  // Listen to subscriber updates from other parts of the app
  useEffect(() => {
    const handleUpdate = () => {
      const stored = getStoredSubscribers();
      setSubscriberCount(1480 + stored.length);
    };
    window.addEventListener('petsimona25_subscribers_updated', handleUpdate);
    return () => window.removeEventListener('petsimona25_subscribers_updated', handleUpdate);
  }, []);

  const handleCopyCoupon = () => {
    if (subscribedCoupon) {
      navigator.clipboard.writeText(subscribedCoupon);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setLoading(true);
    try {
      // 1. Save directly to client-side localStorage
      const localResult = saveSubscriber({
        email,
        petName: petName || 'Consentido',
        breed: breed || 'Perro / Gato',
        name: ownerName || 'Pet Lover',
        city: city || 'Rengo',
        plan,
        source: 'web_newsletter_section',
      });

      const couponCode = localResult.subscriber.discountCode || `SIMONA15-${Math.floor(1000 + Math.random() * 9000)}`;

      // 2. Also dispatch to server API
      let serverCount = 1480 + localResult.total;
      try {
        const res = await fetch('/api/subscribers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            petName: petName || 'Consentido',
            breed: breed || 'Perro / Gato',
            name: ownerName || 'Pet Lover',
            city: city || 'Rengo',
            plan,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.totalCount) serverCount = data.totalCount;
        }
      } catch (apiErr) {
        console.warn('Server sync error (localStorage saved successfully):', apiErr);
      }

      setSubscribedCoupon(couponCode);
      setMemberNumber(serverCount);
      setSubscriberCount(serverCount);

      // Prepend user to live members notification
      const myMember: RecentMember = {
        id: localResult.subscriber.id,
        name: ownerName || email.split('@')[0],
        petName: petName || 'Mascota',
        breed: breed || 'Perrito regalón',
        city: city || 'Rengo',
        timeAgo: '¡Recién ahora!',
      };
      setRecentMembers((prev) => [myMember, ...prev]);
      setCurrentNotificationIndex(0);
    } catch (err) {
      console.error('Error in subscription:', err);
      setSubscribedCoupon('SIMONA15');
      setSubscriberCount((prev) => prev + 1);
      setMemberNumber(subscriberCount + 1);
    } finally {
      setLoading(false);
    }
  };

  const currentMember = recentMembers[currentNotificationIndex] || DEFAULT_MEMBERS[0];
  const milestoneTarget = 1500;
  const progressPercent = Math.min(100, Math.round((subscriberCount / milestoneTarget) * 100));

  return (
    <section id="suscripcion" className="py-16 bg-slate-900 text-white relative overflow-hidden border-b-2 border-slate-800">
      {/* Background Decorative Circles */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-yellow-400/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
        
        {/* TOP BANNER NOTIFICATION TICKER: Live Counter & Recent Subscriptions */}
        <div 
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="bg-slate-800/90 border-2 border-yellow-400/30 rounded-3xl p-4 sm:p-5 shadow-2xl backdrop-blur-md transition-all hover:border-yellow-400/60"
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            
            {/* Live Counter Badge */}
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-slate-950 shadow-md">
                  <Users className="w-6 h-6" />
                </div>
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-900"></span>
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {subscriberCount.toLocaleString('es-CL')}
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] uppercase font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    En Vivo
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-bold">
                  Familias y mascotas unidas al <strong className="text-yellow-400">Club Petsimona25</strong>
                </p>
              </div>
            </div>

            {/* LIVE ROTATING NOTIFICATION TICKER */}
            <div className="flex-1 w-full bg-slate-900/80 border border-slate-700/80 rounded-2xl px-4 py-2.5 flex items-center justify-between gap-3 min-h-[52px]">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center shrink-0">
                  <Dog className="w-4 h-4" />
                </div>

                <div className="min-w-0 text-left">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black text-white truncate">
                      {currentMember.name}
                    </span>
                    <span className="text-[11px] text-slate-300 font-medium">
                      sumó a <strong className="text-yellow-300">"{currentMember.petName}"</strong> ({currentMember.breed})
                    </span>
                    <span className="bg-slate-800 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5 text-orange-400" />
                      {currentMember.city}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold block">
                    {currentMember.timeAgo} • Obtuvo 15% OFF de bienvenida 🎁
                  </span>
                </div>
              </div>

              {/* Ticker Controls */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setCurrentNotificationIndex((prev) => (prev - 1 + recentMembers.length) % recentMembers.length)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  title="Notificación anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentNotificationIndex((prev) => (prev + 1) % recentMembers.length)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  title="Siguiente notificación"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Community Goal Mini-Bar */}
            <div className="w-full lg:w-56 bg-slate-900/60 border border-slate-700/60 p-2.5 rounded-2xl shrink-0">
              <div className="flex items-center justify-between text-[11px] font-black mb-1">
                <span className="text-slate-300 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-yellow-400" />
                  Meta 1.500 Miembros
                </span>
                <span className="text-yellow-400">{progressPercent}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-linear-to-r from-yellow-400 to-orange-500 h-full rounded-full transition-all duration-700" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-[9px] text-slate-400 block mt-1 text-center font-medium">
                Faltan solo {Math.max(0, milestoneTarget - subscriberCount)} para liberar cupón 20%
              </span>
            </div>

          </div>
        </div>

        {/* MAIN SUBSCRIPTION CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text */}
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2 bg-slate-800 border border-slate-700 px-3.5 py-1 rounded-full text-xs font-black text-yellow-400 uppercase tracking-wider">
              <Gift className="w-4 h-4 text-yellow-400" />
              <span>Beneficio Exclusivo Petsimona25 🎁</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight">
              Únete a más de <span className="text-yellow-400">{subscriberCount.toLocaleString('es-CL')} Mascotas</span> Felices
            </h2>

            <p className="text-slate-300 text-sm sm:text-base font-medium leading-relaxed">
              Forma parte de la comunidad artesanal <strong className="text-white font-extrabold">petsimona25 (@petsimona25)</strong>. Recibe promociones de temporada confeccionadas en Rengo para tu consentido, guías de ajuste ergonómico y entérate antes que nadie de nuevos lanzamientos en tallas especiales.
            </p>

            {/* Highlights Grid */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-black text-white">Cupón Inmediato</h4>
                  <p className="text-[11px] text-slate-400 font-medium">15% OFF listo para tu primer pedido</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-black text-white">Caja Atuendo Mensual</h4>
                  <p className="text-[11px] text-slate-400 font-medium">Opción de ropa sorpresa a la medida</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-black text-white">Asesoría de Medidas</h4>
                  <p className="text-[11px] text-slate-400 font-medium">Ayuda personalizada por WhatsApp</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-black text-white">Despacho a Todo Chile</h4>
                  <p className="text-[11px] text-slate-400 font-medium">Envío Gratis desde $45.000 CLP</p>
                </div>
              </div>
            </div>

            {/* Avatars Social Proof Pill */}
            <div className="flex items-center gap-3 pt-2">
              <div className="flex -space-x-2 overflow-hidden">
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-slate-900 object-cover"
                  src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=120"
                  alt="Mascota club"
                  referrerPolicy="no-referrer"
                />
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-slate-900 object-cover"
                  src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=120"
                  alt="Mascota club"
                  referrerPolicy="no-referrer"
                />
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-slate-900 object-cover"
                  src="https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&q=80&w=120"
                  alt="Mascota club"
                  referrerPolicy="no-referrer"
                />
                <div className="inline-flex h-8 w-8 rounded-full ring-2 ring-slate-900 bg-orange-500 text-white font-black text-[10px] items-center justify-center">
                  +1.4k
                </div>
              </div>
              <p className="text-xs text-slate-400 font-bold">
                ⭐ <span className="text-white font-extrabold">4.9/5 de satisfacción</span> en ropa artesanal a la medida
              </p>
            </div>
          </div>

          {/* Right Form Card */}
          <div className="lg:col-span-6 bg-slate-800/90 p-6 sm:p-8 rounded-3xl border-2 border-slate-700 shadow-2xl relative">
            
            {subscribedCoupon ? (
              <div className="text-center space-y-4 py-4 animate-scale-up">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-300 rounded-full flex items-center justify-center mx-auto border border-emerald-400/40 shadow-lg">
                  <Gift className="w-8 h-8" />
                </div>

                <div>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-black uppercase px-3 py-1 rounded-full inline-block mb-2">
                    Miembro #{memberNumber || subscriberCount} del Club 🎉
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white">
                    ¡Bienvenido/a al Club petsimona25!
                  </h3>
                </div>

                <p className="text-xs text-slate-300 font-medium max-w-md mx-auto">
                  Hemos registrado a tu consentido <strong className="text-yellow-400 font-bold">{petName || 'tu mascota'}</strong>. Aquí tienes tu cupón exclusivo del 15% de descuento listo para aplicar en el carrito:
                </p>

                {/* Coupon Box with 1-Click Copy */}
                <div className="bg-yellow-400 text-slate-900 p-4 rounded-2xl shadow-xl border-2 border-dashed border-slate-900 max-w-sm mx-auto space-y-2">
                  <div className="font-mono font-black text-2xl tracking-widest">
                    {subscribedCoupon}
                  </div>
                  <button
                    onClick={handleCopyCoupon}
                    type="button"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-black py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>¡Código Copiado al Portapapeles!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-yellow-400" />
                        <span>Copiar Código (15% OFF)</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 font-medium">
                  Se envió una confirmación a <span className="text-white font-bold">{email}</span>. Puedes ingresar este código en el carrito antes de pagar.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-4">
                <div className="border-b border-slate-700 pb-3 flex items-center justify-between">
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <Dog className="w-5 h-5 text-yellow-400" />
                    Registro de Suscripción VIP
                  </h3>
                  <span className="text-[10px] bg-yellow-400/20 text-yellow-300 font-black px-2.5 py-1 rounded-full uppercase border border-yellow-400/30">
                    15% Descuento
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-black uppercase text-slate-300 block mb-1">
                      Tu Nombre
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Constanza"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border-2 border-slate-700 text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-yellow-400 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black uppercase text-slate-300 block mb-1">
                      Ciudad / Comuna
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Rengo, Santiago, Rancagua"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border-2 border-slate-700 text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-yellow-400 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-slate-300 block mb-1">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="tucorreo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border-2 border-slate-700 text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-yellow-400 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-black uppercase text-slate-300 block mb-1">
                      Nombre Mascota
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Simona"
                      value={petName}
                      onChange={(e) => setPetName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border-2 border-slate-700 text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-yellow-400 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black uppercase text-slate-300 block mb-1">
                      Raza o Tipo
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Frenchie, Salchicha"
                      value={breed}
                      onChange={(e) => setBreed(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border-2 border-slate-700 text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-yellow-400 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-slate-300 block mb-1">
                    Modalidad de Suscripción:
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPlan('newsletter_vip')}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-black border-2 transition-all ${
                        plan === 'newsletter_vip'
                          ? 'bg-orange-500 text-white border-orange-400 shadow-md'
                          : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      Boletín Ofertas VIP
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlan('monthly_box')}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-black border-2 transition-all ${
                        plan === 'monthly_box'
                          ? 'bg-orange-500 text-white border-orange-400 shadow-md'
                          : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      Caja Atuendo Mensual
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-black py-3.5 rounded-2xl shadow-lg transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Sparkles className="w-4 h-4 text-slate-900" />
                  {loading ? 'Procesando registro...' : `Unirme y Desbloquear 15% OFF (#${subscriberCount + 1})`}
                </button>

                <p className="text-[10px] text-slate-400 text-center font-medium">
                  🔒 Cuidamos tu privacidad. No enviamos spam, solo promociones y guías de cuidado artesanal.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

