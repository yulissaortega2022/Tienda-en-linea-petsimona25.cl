import React, { useState } from 'react';
import { X, Bell, Mail, CheckCircle2, Sparkles, Dog, ShieldCheck, ArrowRight, Heart, AlertCircle, Clock, Scissors } from 'lucide-react';
import { Product } from '../types';
import { registerStockAlertSubscription } from '../services/stockAlertService';

interface StockNotificationModalProps {
  product: Product | null;
  selectedSize?: string;
  isOpen: boolean;
  onClose: () => void;
  onGoToCustomOrder?: () => void;
  onSuccessToast?: (msg: string) => void;
}

export const StockNotificationModal: React.FC<StockNotificationModalProps> = ({
  product,
  selectedSize = 'M',
  isOpen,
  onClose,
  onGoToCustomOrder,
  onSuccessToast,
}) => {
  const [email, setEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [petName, setPetName] = useState('');
  const [sizePreference, setSizePreference] = useState(selectedSize);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Reset form on open
  React.useEffect(() => {
    if (isOpen && product) {
      setSizePreference(selectedSize || product.sizes[0] || 'M');
      setIsSuccess(false);
      setErrorMessage('');
      setIsSubmitting(false);
    }
  }, [isOpen, product, selectedSize]);

  if (!isOpen || !product) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !email.includes('@') || !email.includes('.')) {
      setErrorMessage('Por favor ingresa un correo electrónico válido.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = registerStockAlertSubscription({
        productId: product.id,
        productName: product.name,
        customerEmail: email,
        customerName: customerName.trim() || undefined,
        petName: petName.trim() || undefined,
        selectedSize: sizePreference,
        productImageUrl: product.imageUrl,
      });

      setIsSubmitting(false);
      setIsSuccess(true);

      if (onSuccessToast) {
        onSuccessToast(`🔔 ¡Aviso configurado! Te notificaremos a ${email} cuando vuelva "${product.name}".`);
      }
    } catch (err) {
      console.error('Error subscribing to stock alert:', err);
      setErrorMessage('Ocurrió un error al guardar tu solicitud. Intenta nuevamente.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-2 border-orange-200 relative animate-scale-up my-6 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="text-center py-4 space-y-5 animate-scale-up">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-200 shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-950 font-black text-xs uppercase tracking-wider">
                <Bell className="w-3.5 h-3.5 text-emerald-700" />
                <span>Alerta Automática Activada</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                ¡Te avisaremos apenas haya stock! 🐕
              </h3>
              <p className="text-sm text-slate-600 font-medium max-w-md mx-auto leading-relaxed">
                Hemos registrado tu correo <strong className="text-slate-900 font-black">{email}</strong>. En cuanto Constanza cosa nuevas unidades de <strong className="text-orange-600 font-black">"{product.name}"</strong> (Talla {sizePreference}) en el taller de Rengo, recibirás un correo electrónico de inmediato.
              </p>
            </div>

            {/* Product Summary Pill */}
            <div className="p-4 rounded-2xl bg-amber-50/80 border-2 border-amber-200 flex items-center gap-4 text-left">
              <img
                src={product.imageUrl}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-xl object-cover border border-amber-300 shadow-xs shrink-0"
              />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-black uppercase text-orange-700 block">
                  {product.category} • Talla {sizePreference}
                </span>
                <h4 className="text-xs font-black text-slate-900 truncate">
                  {product.name}
                </h4>
                <p className="text-xs font-mono font-black text-slate-800">
                  ${product.price.toLocaleString('es-CL')} CLP
                </p>
              </div>
            </div>

            {/* Alternative Custom Tailoring callout */}
            {product.isCustomizable && onGoToCustomOrder && (
              <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 text-left space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-orange-950 uppercase">
                  <Scissors className="w-4 h-4 text-orange-600" />
                  <span>¿No quieres esperar reposición?</span>
                </div>
                <p className="text-xs text-orange-900 font-medium">
                  Podemos confeccionarlo <strong>a la medida exacta de tu mascota</strong> hoy mismo en nuestro taller artesanal.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onGoToCustomOrder();
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-black text-orange-700 hover:text-orange-900 underline cursor-pointer"
                >
                  <span>Ir al Formulario de Confección a la Medida</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full bg-slate-900 hover:bg-slate-800 text-yellow-300 font-black px-6 py-3.5 rounded-2xl shadow-lg transition-all text-xs uppercase tracking-wider cursor-pointer"
            >
              Entendido, Continuar Navegando
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Header */}
            <div className="border-b-2 border-orange-200 pb-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-2.5 bg-orange-500 text-white rounded-2xl shadow-sm">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-950 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border border-amber-300">
                    <Clock className="w-3 h-3 text-amber-700" />
                    <span>Aviso de Reposición por Email</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    Avisarme cuando vuelva el stock 🐕
                  </h3>
                </div>
              </div>
            </div>

            {/* Product Card Snippet */}
            <div className="p-3.5 rounded-2xl bg-amber-50/60 border-2 border-amber-200/90 flex items-center gap-3.5">
              <img
                src={product.imageUrl}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-xl object-cover border border-amber-300 shadow-xs shrink-0"
              />
              <div className="min-w-0 flex-1 space-y-0.5">
                <span className="text-[10px] font-black uppercase text-red-600 bg-red-100 px-2 py-0.5 rounded-md inline-block">
                  Actualmente Agotado
                </span>
                <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                  {product.name}
                </h4>
                <p className="text-xs font-mono font-black text-slate-800">
                  ${product.price.toLocaleString('es-CL')} CLP
                </p>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-100 border border-red-300 text-red-800 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email (Required) */}
              <div>
                <label className="text-xs font-black text-slate-900 uppercase tracking-wider block mb-1">
                  Tu Correo Electrónico *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    placeholder="ejemplo@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-slate-50 focus:bg-white"
                  />
                </div>
                <span className="text-[11px] text-slate-500 font-medium mt-1 block">
                  Te llegará un email automático en el segundo en que Constanza reponga este artículo.
                </span>
              </div>

              {/* Size preference & Pet details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Preferred Size */}
                <div>
                  <label className="text-[11px] font-black text-slate-900 uppercase tracking-wider block mb-1">
                    Talla Deseada
                  </label>
                  <select
                    value={sizePreference}
                    onChange={(e) => setSizePreference(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border-2 border-slate-200 text-xs font-bold text-slate-900 bg-slate-50 focus:bg-white cursor-pointer"
                  >
                    {product.sizes.map((sz) => (
                      <option key={sz} value={sz}>
                        {sz}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Customer Name (Optional) */}
                <div>
                  <label className="text-[11px] font-black text-slate-900 uppercase tracking-wider block mb-1">
                    Tu Nombre
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Constanza"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border-2 border-slate-200 text-xs font-bold text-slate-900 bg-slate-50 focus:bg-white"
                  />
                </div>

                {/* Pet Name (Optional) */}
                <div>
                  <label className="text-[11px] font-black text-slate-900 uppercase tracking-wider block mb-1">
                    Nombre Mascota
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Ej. Simona"
                      value={petName}
                      onChange={(e) => setPetName(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl border-2 border-slate-200 text-xs font-bold text-slate-900 bg-slate-50 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Reassurance notes */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Sin Spam • Privacidad 100% Protegida</span>
                </div>
                <p>
                  Solo utilizaremos tu correo para enviarte la notificación de disponibilidad de este artículo específico.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 hover:from-orange-500 hover:to-amber-500 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-orange-500/25 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Bell className="w-4 h-4 text-white" />
                <span>{isSubmitting ? 'Registrando...' : 'Avisarme cuando vuelva el stock'}</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
