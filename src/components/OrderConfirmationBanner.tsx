import React, { useState } from 'react';
import { CheckCircle, ShieldCheck, Copy, Check, MessageSquare, X, Heart, Leaf, Truck, ChevronUp, ChevronDown } from 'lucide-react';

export interface CompletedOrder {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  commune: string;
  courierName: string;
  trackingNumber?: string;
  paymentMethod: string;
  grandTotal: number;
  itemsCount: number;
  date: string;
}

interface OrderConfirmationBannerProps {
  order: CompletedOrder;
  onClose: () => void;
  onOpenTracking?: (codeOrOrder: string) => void;
}

export const OrderConfirmationBanner: React.FC<OrderConfirmationBannerProps> = ({ order, onClose, onOpenTracking }) => {
  const [copied, setCopied] = useState(false);
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const trackingCode = order.trackingNumber || `BX-${order.orderNumber.replace(/\D/g, '') || '7482910'}194`;

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleCopyTracking = () => {
    navigator.clipboard.writeText(trackingCode);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 3000);
  };

  const whatsappText = encodeURIComponent(
    `Hola Constanza (petsimona25), realicé la compra del Pedido #${order.orderNumber} (Código seguimiento: ${trackingCode}) por $${order.grandTotal.toLocaleString('es-CL')} CLP a ${order.commune} vía ${order.courierName}. ¡Adjunto mis datos para la confección!`
  );

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white p-3.5 rounded-2xl shadow-2xl border-2 border-emerald-400 flex items-center gap-3 animate-fade-in">
        <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-400">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <span className="text-[10px] text-emerald-400 uppercase font-black tracking-wider block">Pedido Confirmado</span>
          <span className="text-xs font-black text-white font-mono">{order.orderNumber}</span>
        </div>
        <button
          onClick={() => setIsMinimized(false)}
          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold ml-2 flex items-center gap-1 cursor-pointer"
        >
          <span>Ver Detalles</span>
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-2 border-emerald-400 relative space-y-6 my-6">
        
        {/* Top Floating Controls */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-xs font-bold flex items-center gap-1 cursor-pointer"
            title="Minimizar confirmación"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Celebration Header */}
        <div className="text-center space-y-3 pt-2">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-200 shadow-md">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-extrabold text-[11px] uppercase tracking-wider">
              <Leaf className="w-3.5 h-3.5 text-emerald-600" />
              <span>Compra Sostenible Confirmada</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              ¡Gracias por tu Compra, {order.customerName}! 🐾
            </h3>
          </div>

          <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-sm mx-auto">
            Tu apoyo directo impulsa la <strong className="text-orange-600">confección artesanal chilena</strong>, el uso de telas hipoalergénicas y la moda de bajo impacto ambiental desde Rengo.
          </p>
        </div>

        {/* Order Details Ticket Box */}
        <div className="bg-slate-900 text-slate-200 p-5 rounded-2xl border border-slate-700 space-y-3 font-medium text-xs">
          
          <div className="flex justify-between items-center pb-3 border-b border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Número de Pedido:</span>
              <span className="text-lg font-black font-mono text-yellow-400">{order.orderNumber}</span>
            </div>

            <button
              onClick={handleCopyOrderNumber}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-extrabold rounded-xl border border-slate-600 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copiar N°</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-slate-400 block font-bold">Cliente:</span>
              <span className="text-white font-bold">{order.customerName}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-bold">Destino:</span>
              <span className="text-white font-bold">{order.commune}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-bold">Empresa Courier:</span>
              <span className="text-orange-400 font-bold">{order.courierName}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-bold">Método de Pago:</span>
              <span className="text-sky-300 font-bold uppercase">{order.paymentMethod}</span>
            </div>
          </div>

          {/* Tracking Code Highlight in receipt */}
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center justify-between gap-2">
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
                Código de Seguimiento Logístico:
              </span>
              <span className="font-mono font-black text-amber-300 text-xs">
                {trackingCode}
              </span>
            </div>
            <button
              onClick={handleCopyTracking}
              className="p-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
              title="Copiar código de seguimiento"
            >
              {copiedTracking ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedTracking ? 'Copiado' : 'Copiar'}</span>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm">
            <span className="font-extrabold text-slate-300">Total Transacción:</span>
            <span className="font-mono font-black text-emerald-400 text-base">
              ${order.grandTotal.toLocaleString('es-CL')} CLP
            </span>
          </div>
        </div>

        {/* Action Buttons: Live Tracking & WhatsApp Direct */}
        <div className="space-y-2">
          {onOpenTracking && (
            <button
              onClick={() => {
                onClose();
                onOpenTracking(trackingCode);
              }}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-3.5 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer active:scale-98"
            >
              <Truck className="w-4 h-4" />
              <span>Rastrear Envío y Llegada a Destino 📦</span>
            </button>
          )}

          <a
            href={`https://wa.me/56972374764?text=${whatsappText}`}
            target="_blank"
            rel="noreferrer"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3.5 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 fill-white" />
            <span>Enviar Confirmación a WhatsApp petsimona25</span>
          </a>

          <a
            href="#google-business-reviews"
            onClick={onClose}
            className="w-full bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-black py-2.5 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>⭐ Generar Enlace Reseña Google Maps (Rengo)</span>
          </a>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Cerrar y Continuar Navegando
          </button>
        </div>

      </div>
    </div>
  );
};
