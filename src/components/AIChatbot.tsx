import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles, RefreshCw, HelpCircle, Heart, ExternalLink, Search, CheckCircle2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  usedGoogleSearch?: boolean;
  groundingSources?: { title: string; uri: string }[];
  searchQueries?: string[];
}

const FAQ_CHIPS = [
  "🧼 Cuidados telas reutilizables",
  "🐕 Mantenimiento de ropa canina",
  "🌧️ Limpieza de impermeables y polares",
  "🌿 Evitar nudos y cuidar piel",
  "📏 ¿Cómo mido a mi perrito?",
  "🚚 Valores y couriers de envío",
  "🐶 Ropa para Yorkie y Salchicha",
  "💳 Medios de pago aceptados"
];

export const AIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: '¡Hola! Soy Simona Bot 🐾, tu asistente experta de petsimona25.cl con Búsqueda de Google integrada 🔍.\n\nPuedes consultarme sobre toma de medidas, envíos, y especialmente sobre cuidados específicos de telas reutilizables y consejos de mantenimiento higiénico de prendas caninas según recomendaciones actuales de expertos.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query })
      });

      const data = await response.json();
      const botReply = data.reply || '¡Gracias por consultar! Confeccionamos ropa a la medida desde Rengo con despacho a todo Chile.';

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        usedGoogleSearch: data.usedGoogleSearch || Boolean(data.groundingSources?.length),
        groundingSources: data.groundingSources || [],
        searchQueries: data.searchQueries || []
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Chatbot error:', err);
      const errorMsg: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        sender: 'bot',
        text: 'Lo siento, tuve un problema de conexión temporal. Recuerda que puedes escribirle directamente a Constanza por WhatsApp al +56972374764 🐾.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-900 p-4 rounded-full shadow-2xl border-2 border-yellow-300 flex items-center gap-3 transition-all hover:scale-105 group active:scale-95"
          aria-label="Abrir Chatbot Preguntas Frecuentes"
        >
          <div className="relative">
            <Bot className="w-7 h-7 text-slate-900 group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse"></span>
          </div>
          <div className="text-left hidden sm:block pr-1">
            <span className="text-[10px] uppercase font-black tracking-wider block text-slate-900 opacity-90">Preguntas Frecuentes IA</span>
            <span className="text-xs font-black text-slate-950 block">Simona Bot 🐾</span>
          </div>
        </button>
      )}

      {/* Chat Window Drawer / Modal */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border-2 border-orange-200 flex flex-col overflow-hidden animate-scale-up">
          
          {/* Header */}
          <div className="bg-slate-900 p-4 text-white flex items-center justify-between border-b-2 border-orange-500">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-orange-500 to-amber-400 rounded-2xl flex items-center justify-center border border-yellow-300 text-slate-900 shadow-sm">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-sm text-white">Simona Bot 🐾</h3>
                  <span className="bg-emerald-500 text-slate-950 text-[9px] font-black uppercase px-2 py-0.2 rounded-full">
                    IA Activa
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 font-medium">Asistente oficial petsimona25.cl</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick FAQ Suggestion Chips */}
          <div className="p-2.5 bg-orange-50/80 border-b border-orange-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <span className="text-[10px] font-black text-slate-500 uppercase shrink-0 pl-1">FAQ Sugeridas:</span>
            {FAQ_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                disabled={isLoading}
                className="text-[10px] font-bold text-slate-800 bg-white hover:bg-orange-500 hover:text-white border border-orange-200 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors shadow-2xs"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {msg.sender === 'bot' ? (
                  <div className="w-7 h-7 bg-slate-900 text-yellow-400 rounded-full flex items-center justify-center shrink-0 border border-slate-700">
                    <Bot className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-7 h-7 bg-orange-500 text-white rounded-full flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-xs font-medium leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-orange-500 text-white rounded-tr-none shadow-xs'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-xs'
                  }`}
                >
                  {/* Google Search Grounding Badge for Bot Messages */}
                  {msg.sender === 'bot' && msg.id !== 'welcome' && (
                    <div className="mb-2 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-800 text-[10px] font-black w-fit">
                      <Search className="w-3 h-3 text-blue-600 animate-pulse" />
                      <span>Google Search &amp; Expertos Veterinarios</span>
                    </div>
                  )}

                  <div className="whitespace-pre-line">{msg.text}</div>

                  {/* Grounding Sources */}
                  {msg.groundingSources && msg.groundingSources.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1">
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                        Fuentes consultadas:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {msg.groundingSources.map((src, sIdx) => (
                          <a
                            key={sIdx}
                            href={src.uri}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[9px] font-bold text-blue-700 bg-blue-50/80 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-md truncate max-w-full transition-colors"
                          >
                            <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                            <span className="truncate">{src.title}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <span
                    className={`block text-[9px] mt-1.5 font-bold ${
                      msg.sender === 'user' ? 'text-orange-100 text-right' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 bg-slate-900 text-yellow-400 rounded-full flex items-center justify-center shrink-0 border border-slate-700">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none text-xs text-slate-500 flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-orange-500" />
                  <span>Simona Bot está escribiendo...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Direct WhatsApp Contact Banner inside Chat */}
          <div className="bg-emerald-50 border-t border-emerald-200 px-3.5 py-2.5 flex items-center justify-between text-[11px] font-bold text-emerald-950">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Bot Autorizado para WhatsApp &amp; Web</span>
            </div>
            <a
              href="https://wa.me/56972374764?text=Hola%20Simona%20Bot%20%F0%9F%90%BE%20y%20Constanza%20@petsimona25,%20solicito%20atenci%C3%B3n%20p%C3%BAblica%20autorizada"
              target="_blank"
              rel="noreferrer"
              className="text-white bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1 rounded-lg font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-xs transition-colors"
            >
              <span>+56 9 7237 4764</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Footer Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Escribe tu duda sobre ropa o envíos..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 bg-slate-100 border border-slate-200 focus:border-orange-500 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-900 outline-hidden"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="p-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white rounded-2xl transition-all shadow-md shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
};
