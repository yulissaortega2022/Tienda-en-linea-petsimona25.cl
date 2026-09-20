import React, { useState, useEffect } from 'react';
import {
  X,
  Globe,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Server,
  Sparkles,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import {
  getActiveDomain,
  setActiveDomain,
  DEFAULT_OFFICIAL_DOMAIN,
  DOMAIN_PRESETS,
  getDnsInstructionsForDomain,
  sanitizeDomainUrl,
} from '../services/customDomainService';

interface CustomDomainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDomainUpdated?: (newDomain: string) => void;
}

export const CustomDomainModal: React.FC<CustomDomainModalProps> = ({
  isOpen,
  onClose,
  onDomainUpdated,
}) => {
  const [currentDomain, setCurrentDomain] = useState<string>(DEFAULT_OFFICIAL_DOMAIN);
  const [inputDomain, setInputDomain] = useState<string>('');
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const active = getActiveDomain();
      setCurrentDomain(active);
      setInputDomain(active);
      setSaveSuccess(false);
      setValidationError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectPreset = (url: string) => {
    setInputDomain(url);
    setValidationError(null);
  };

  const handleSave = () => {
    const raw = inputDomain.trim();
    if (!raw) {
      setValidationError('Por favor ingresa un dominio válido (ejemplo: https://petsimona25.cl)');
      return;
    }

    try {
      const sanitized = sanitizeDomainUrl(raw);
      // Basic check
      if (!sanitized.includes('petsimona25') && !sanitized.includes('.')) {
        setValidationError('El dominio debe contener al menos un punto y preferentemente "petsimona25".');
        return;
      }

      const updated = setActiveDomain(sanitized);
      setCurrentDomain(updated);
      setSaveSuccess(true);
      setValidationError(null);

      if (onDomainUpdated) {
        onDomainUpdated(updated);
      }

      setTimeout(() => {
        setSaveSuccess(false);
      }, 3500);
    } catch (err) {
      setValidationError('Formato de dominio inválido. Intenta con https://petsimona25.cl');
    }
  };

  const handleResetDefault = () => {
    const updated = setActiveDomain(DEFAULT_OFFICIAL_DOMAIN);
    setCurrentDomain(updated);
    setInputDomain(updated);
    setSaveSuccess(true);
    setValidationError(null);
    if (onDomainUpdated) onDomainUpdated(updated);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(id);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const dnsData = getDnsInstructionsForDomain(currentDomain);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl shadow-2xl border-2 border-orange-300 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white p-5 flex items-center justify-between border-b-2 border-orange-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-slate-950 shadow-md">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight text-white">
                  Configurar Dominio Personalizado
                </h3>
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                  petsimona25
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Cambia el dominio vigente utilizado en Códigos QR, Enlaces Compartidos, PWA y SEO
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Current Active Domain Banner */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-orange-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div>
              <span className="text-[10px] uppercase font-black tracking-wider text-orange-800 block">
                Dominio Vigente Activo en la App:
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono text-base font-black text-slate-900 break-all">
                  {currentDomain}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Activo
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleResetDefault}
              className="text-xs font-bold text-orange-700 hover:text-orange-900 underline flex items-center gap-1 shrink-0 self-start sm:self-auto cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Restablecer Predeterminado
            </button>
          </div>

          {/* Success Notification */}
          {saveSuccess && (
            <div className="bg-emerald-500 text-white p-3.5 rounded-2xl flex items-center gap-3 font-bold text-xs shadow-md animate-fade-in">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-black text-sm">¡Dominio personalizado actualizado exitosamente!</p>
                <p className="text-emerald-100 text-[11px]">
                  Todos los códigos QR, enlaces de descarga y metas de compartir ahora apuntan a: {currentDomain}
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {validationError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl flex items-center gap-2 text-xs font-bold">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Preset Buttons */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wide block">
              Dominios Sugeridos petsimona25:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DOMAIN_PRESETS.map((preset) => {
                const isSelected = inputDomain === preset.url;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset.url)}
                    className={`text-left p-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50/80 shadow-xs'
                        : 'border-slate-200 hover:border-orange-300 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-900">{preset.url}</span>
                      {preset.isRecommended && (
                        <span className="text-[9px] font-black uppercase tracking-wider bg-orange-600 text-white px-1.5 py-0.5 rounded">
                          Oficial
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium mt-1">{preset.tag}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom URL Input */}
          <div className="space-y-2">
            <label htmlFor="custom-domain-input" className="text-xs font-black text-slate-800 uppercase tracking-wide block">
              O ingresa tu dominio personalizado específico:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  id="custom-domain-input"
                  type="text"
                  value={inputDomain}
                  onChange={(e) => {
                    setInputDomain(e.target.value);
                    setValidationError(null);
                  }}
                  placeholder="https://petsimona25.cl"
                  className="w-full font-mono text-sm px-4 py-2.5 rounded-xl border-2 border-slate-300 focus:border-orange-500 focus:outline-none text-slate-900 bg-white"
                />
              </div>
              <button
                type="button"
                onClick={handleSave}
                className="bg-orange-600 hover:bg-orange-700 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <span>Aplicar Dominio</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              * El cambio se guarda en tu navegador y propaga inmediatamente la URL a todo el catálogo, QR codes y metadatos.
            </p>
          </div>

          {/* DNS Configuration Guide Box */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 space-y-4 border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-amber-400" />
                <h4 className="font-black text-xs uppercase tracking-wider text-amber-300">
                  Guía de Registros DNS para Vincular ({dnsData.domainName})
                </h4>
              </div>
              <span className="text-[10px] text-slate-400 font-bold">NIC Chile / Cloudflare / Google Sites</span>
            </div>

            <div className="space-y-2.5">
              {dnsData.records.map((rec, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="bg-slate-800 text-amber-400 font-mono font-black text-[10px] px-2 py-0.5 rounded">
                      {rec.type}
                    </span>
                    <span className="text-slate-400 font-medium">Host: <strong className="text-white font-mono">{rec.host}</strong></span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-300 font-mono text-[11px] break-all">{rec.pointsTo}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(rec.pointsTo, `rec-${idx}`)}
                    className="text-[10px] font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg flex items-center gap-1 self-end sm:self-auto cursor-pointer transition-colors"
                  >
                    {copiedItem === `rec-${idx}` ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-400" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>

            <div className="text-[11px] text-slate-400 pt-1 space-y-1">
              <p>💡 <strong>En Google Sites:</strong> Ve a Configuración ⚙️ → Dominios personalizados → Ingresa <code className="text-amber-300 font-mono">{dnsData.domainName}</code> y asigna el CNAME apuntando a <code className="text-amber-300 font-mono">ghs.googlehosted.com</code>.</p>
              <p>💡 <strong>En NIC Chile:</strong> Ingresa a nic.cl, selecciona tu dominio <code className="text-amber-300 font-mono">petsimona25.cl</code> y configura los servidores de nombres (DNS) o registros DNS con los valores mostrados arriba.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Configuración segura y persistente en el navegador</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-5 py-2 rounded-xl transition-colors cursor-pointer"
          >
            Listo / Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
