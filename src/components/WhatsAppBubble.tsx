import React, { useState } from 'react';
import { MessageCircle, X, Send, Sparkles, PhoneCall, Bot, ShieldCheck, Mail, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';
import { OFFICIAL_WHATSAPP_NUMBER_RAW, OFFICIAL_WHATSAPP_PHONE, OFFICIAL_NOTIFICATION_EMAIL, generateWhatsAppBotUrl } from '../services/pushNotificationService';

export const WhatsAppBubble: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'bot' | 'human'>('bot');
  const [customQuery, setCustomQuery] = useState('');

  const quickOptions = [
    {
      id: 'medidas',
      label: '📏 Asesoría de 3 Medidas (Cuello, Pecho, Largo)',
      type: 'medidas' as const,
      preview: '¿Cómo medir a mi Yorkie/perrito para que le quede perfecto?',
    },
    {
      id: 'envios',
      label: '🚚 Envíos a mi Comuna (Blue Express / Chilexpress)',
      type: 'envios' as const,
      preview: 'Cotizar tiempo y despacho gratis sobre $45.000 CLP.',
    },
    {
      id: 'personalizado',
      label: '✂️ Confección Especial a la Medida',
      type: 'personalizado' as const,
      preview: 'Solicitar corte ergonómico en telas hipoalergénicas.',
    },
    {
      id: 'pedido',
      label: '📦 Rastrear Estado de mi Pedido',
      type: 'pedido' as const,
      preview: 'Consultar avance de costura o código de seguimiento.',
    },
  ];

  const handleLaunchWhatsApp = (type: 'medidas' | 'envios' | 'personalizado' | 'pedido' | 'general', param?: string) => {
    const url = generateWhatsAppBotUrl(type, param || customQuery);
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-auto">
      {/* Popover Card */}
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border-2 border-emerald-500 overflow-hidden animate-scale-up">
          {/* Header */}
          <div className="bg-emerald-600 text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-white text-emerald-600 flex items-center justify-center font-black shadow-md">
                    <Bot className="w-6 h-6" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-300 border-2 border-emerald-600 rounded-full animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-black text-sm text-white">Simona Bot 🐾</h4>
                    <span className="bg-emerald-800 text-emerald-200 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                      <ShieldCheck className="w-2.5 h-2.5 text-yellow-300" /> Autorizado
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-100 font-medium">
                    Atención Pública Oficial petsimona25.cl
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-emerald-100 hover:text-white p-1.5 rounded-full hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center gap-2 mt-3 bg-emerald-700/60 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('bot')}
                className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  activeTab === 'bot' ? 'bg-white text-emerald-800 shadow-xs' : 'text-emerald-100 hover:text-white'
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Bot Automatizado (24/7)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('human')}
                className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  activeTab === 'human' ? 'bg-white text-emerald-800 shadow-xs' : 'text-emerald-100 hover:text-white'
                }`}
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Con Constanza (Taller)</span>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 bg-emerald-50/40 space-y-3">
            {activeTab === 'bot' ? (
              <>
                {/* Bot Greeting */}
                <div className="bg-white p-3 rounded-2xl shadow-xs border border-emerald-100 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-yellow-500" /> Respuestas Instantáneas
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">Rengo, Chile</span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">
                    ¡Hola! Soy el bot de atención pública de <strong>petsimona25.cl</strong>. Selecciona tu consulta o escribe tu mensaje para responderte al instante por WhatsApp:
                  </p>
                </div>

                {/* Quick Interactive Prompt Chips */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block px-1">
                    Temas Frecuentes Disponibles:
                  </span>
                  {quickOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleLaunchWhatsApp(opt.type)}
                      className="w-full text-left p-2.5 bg-white hover:bg-emerald-100/70 border border-slate-200 hover:border-emerald-300 rounded-xl transition-all flex items-center justify-between group cursor-pointer shadow-2xs"
                    >
                      <div className="space-y-0.5 pr-2">
                        <span className="text-xs font-black text-slate-800 group-hover:text-emerald-800 block">
                          {opt.label}
                        </span>
                        <span className="text-[10px] text-slate-500 block line-clamp-1">
                          {opt.preview}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </button>
                  ))}
                </div>

                {/* Custom Query Input */}
                <div className="space-y-1.5 pt-1">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="O escribe tu consulta personalizada..."
                      value={customQuery}
                      onChange={(e) => setCustomQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && customQuery.trim()) {
                          handleLaunchWhatsApp('general', customQuery);
                        }
                      }}
                      className="w-full bg-white border border-emerald-200 focus:border-emerald-500 rounded-xl pl-3 pr-10 py-2.5 text-xs text-slate-900 font-medium outline-hidden shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => handleLaunchWhatsApp('general', customQuery)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Human Direct Attention Tab */
              <div className="bg-white p-4 rounded-2xl shadow-xs border border-emerald-100 space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=150"
                    alt="Constanza y Simona"
                    className="w-12 h-12 rounded-2xl object-cover border border-emerald-300"
                  />
                  <div>
                    <h5 className="font-black text-xs text-slate-900">Constanza S.</h5>
                    <p className="text-[11px] text-slate-500 font-medium">Fundadora &amp; Educadora Diferencial</p>
                    <p className="text-[10px] text-emerald-700 font-bold">Taller Artesanal Los Silos, Rengo</p>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  Atención humana directa para perritos con necesidades especiales, medidas fuera de estándar o dudas sobre telas hipoalergénicas.
                </p>

                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] font-mono text-emerald-900 font-bold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                    {OFFICIAL_WHATSAPP_PHONE}
                  </span>
                  <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-md">
                    Activo Hoy
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleLaunchWhatsApp('general', 'Hola Constanza, quisiera atención humana personalizada para confección a medida')}
                  className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  Abrir WhatsApp Directo
                </button>
              </div>
            )}

            {/* Notification sync footer */}
            <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[10px] text-emerald-900 font-medium px-1">
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3 text-emerald-700" />
                <span>Alertas sinc.: <strong>{OFFICIAL_NOTIFICATION_EMAIL}</strong></span>
              </span>
              <span className="text-emerald-700 font-bold">✓ En línea</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative group bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center border-2 border-white cursor-pointer"
        aria-label="Atención Directa por WhatsApp y Bot Autorizado"
      >
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-yellow-400 border-2 border-white"></span>
        </span>
        <MessageCircle className="w-7 h-7 fill-current text-white" />
        <span className="hidden group-hover:inline-block ml-2 text-xs font-black uppercase tracking-wider pr-1">
          WhatsApp &amp; Bot
        </span>
      </button>
    </div>
  );
};
