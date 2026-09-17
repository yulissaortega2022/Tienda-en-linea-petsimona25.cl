import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  X,
  MessageCircle,
  Mail,
  Printer,
  Copy,
  Check,
  Scissors,
  Sparkles,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Dog,
  Cat,
  Ruler,
  Clock,
  Send,
  Loader2,
} from 'lucide-react';
import {
  PurchaseValidationReport,
  sendValidationReportToWhatsApp,
  sendValidationReportToEmail,
  copyValidationReportToClipboard,
} from '../services/purchaseValidationService';
import { OFFICIAL_WHATSAPP_PHONE } from '../services/whatsappBusinessService';
import { OFFICIAL_NOTIFICATION_EMAIL } from '../services/pushNotificationService';

interface PurchaseValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: PurchaseValidationReport | null;
  onConfirmAddToCart?: () => void;
  onModifyMeasurements?: () => void;
  onApplyBreedTypical?: () => void;
  onSwapNeckChest?: () => void;
}

export const PurchaseValidationModal: React.FC<PurchaseValidationModalProps> = ({
  isOpen,
  onClose,
  report,
  onConfirmAddToCart,
  onModifyMeasurements,
  onApplyBreedTypical,
  onSwapNeckChest,
}) => {
  const [customerEmail, setCustomerEmail] = useState(report?.customerEmail || '');
  const [customerPhone, setCustomerPhone] = useState(report?.customerPhone || '');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSuccessMessage, setEmailSuccessMessage] = useState<string | null>(null);
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);
  const [whatsAppSuccessMessage, setWhatsAppSuccessMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !report) return null;

  const isOptimal = report.analysis.status === 'optimal' && !report.analysis.hasErrors;
  const hasErrors = report.analysis.hasErrors;
  const isUnusual = report.analysis.isUnusual && !hasErrors;

  const handleSendWhatsApp = async () => {
    setSendingWhatsApp(true);
    setWhatsAppSuccessMessage(null);
    try {
      const res = await sendValidationReportToWhatsApp(report, {
        customerPhone: customerPhone.trim() || undefined,
        directOpen: true,
      });
      setWhatsAppSuccessMessage(
        `✓ Notificación enviada y lista para abrir en WhatsApp (${OFFICIAL_WHATSAPP_PHONE}).`
      );
    } catch (e) {
      setWhatsAppSuccessMessage('Reporte preparado para WhatsApp.');
    } finally {
      setSendingWhatsApp(false);
    }
  };

  const handleSendEmail = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSendingEmail(true);
    setEmailSuccessMessage(null);
    try {
      const target = customerEmail.trim() || OFFICIAL_NOTIFICATION_EMAIL;
      const res = await sendValidationReportToEmail(report, target);
      setEmailSuccessMessage(res.message);
    } catch (err) {
      setEmailSuccessMessage('Error al despachar el correo. Se registró copia local.');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleCopy = async () => {
    const ok = await copyValidationReportToClipboard(report);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-8 shadow-2xl border-2 border-orange-300 space-y-6 max-h-[92vh] overflow-y-auto relative my-4">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors"
          title="Cerrar ventana"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header / Official Certificate Stamp */}
        <div className="border-b border-slate-200 pb-5 pr-10">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-orange-100 text-orange-800 border border-orange-200">
              <Scissors className="w-3.5 h-3.5 text-orange-600" />
              Taller de Alta Costura petsimona25 • Rengo, Chile
            </span>
            <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
              Folio: {report.id}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Reporte de Validación de Compra 📋
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            Ficha técnica de patronaje anatómico y verificación de medidas antes del corte artesanal.
          </p>
        </div>

        {/* Compatibility Score & Status Banner */}
        <div
          className={`p-4 sm:p-5 rounded-2xl border-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs ${
            hasErrors
              ? 'bg-red-50 border-red-300 text-red-950'
              : isUnusual
              ? 'bg-amber-50 border-amber-300 text-amber-950'
              : 'bg-emerald-50 border-emerald-300 text-emerald-950'
          }`}
        >
          <div className="flex items-start gap-3">
            {hasErrors ? (
              <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            ) : isUnusual ? (
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            ) : (
              <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-black text-sm sm:text-base">
                  {report.verdictTitle}
                </span>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                    hasErrors
                      ? 'bg-red-200 text-red-900'
                      : isUnusual
                      ? 'bg-amber-200 text-amber-900'
                      : 'bg-emerald-200 text-emerald-900'
                  }`}
                >
                  {hasErrors ? 'Riesgo Alto' : isUnusual ? 'Contextura Única' : 'Calce Seguro'}
                </span>
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                {report.verdictDescription}
              </p>
            </div>
          </div>

          <div className="sm:text-right shrink-0 bg-white/80 backdrop-blur-xs px-4 py-2.5 rounded-xl border border-current/20 shadow-2xs">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Índice Anatómico
            </p>
            <p
              className={`text-2xl font-black ${
                hasErrors ? 'text-red-600' : isUnusual ? 'text-amber-600' : 'text-emerald-600'
              }`}
            >
              {report.analysis.compatibilityScore}%
            </p>
            <p className="text-[10px] font-semibold text-slate-600">
              {report.analysis.suggestedStandardSize}
            </p>
          </div>
        </div>

        {/* Pet & Garment Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Pet Info Box */}
          <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200 space-y-2">
            <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 text-orange-950">
              {report.petType === 'cat' ? <Cat className="w-4 h-4 text-orange-600" /> : <Dog className="w-4 h-4 text-orange-600" />}
              Ficha de la Mascota
            </h4>
            <div className="space-y-1 text-slate-700">
              <p>
                <strong className="text-slate-900">Nombre:</strong> {report.petName}
              </p>
              <p>
                <strong className="text-slate-900">Raza Seleccionada:</strong> {report.breed}
              </p>
              <p>
                <strong className="text-slate-900">Rango de Peso Habitual:</strong> {report.benchmark.typicalWeight}
              </p>
              <p className="text-[11px] text-slate-500 italic pt-1">
                {report.benchmark.tailorAdvice}
              </p>
            </div>
          </div>

          {/* Garment Customization Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 text-slate-900">
              <Sparkles className="w-4 h-4 text-yellow-600" />
              Prenda & Confección
            </h4>
            <div className="space-y-1 text-slate-700">
              <p>
                <strong className="text-slate-900">Modelo:</strong> {report.garmentType}
              </p>
              <p>
                <strong className="text-slate-900">Color Seleccionado:</strong> {report.fabricColor}
              </p>
              {report.embroideryText && (
                <p className="text-orange-700 font-bold">
                  <strong className="text-slate-900">Bordado Personalizado:</strong> "{report.embroideryText}" (+$4.000 CLP)
                </p>
              )}
              <p className="pt-1 text-sm font-black text-slate-900">
                Total Prenda: ${report.price.toLocaleString('es-CL')} {report.currency}
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Measurement Comparison Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
              <Ruler className="w-4 h-4 text-orange-600" />
              Comparativa Técnica: Medidas vs Estándar de {report.benchmark.name}
            </h4>
            <span className="text-[11px] font-bold text-slate-500">
              Unidad: {report.measurements.unit.toUpperCase()}
            </span>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs shadow-2xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-700 font-black border-b border-slate-200 text-[11px] uppercase">
                <tr>
                  <th className="py-2.5 px-3">Punto Anatómico</th>
                  <th className="py-2.5 px-3">Medida Ingresada</th>
                  <th className="py-2.5 px-3">Estándar Raza</th>
                  <th className="py-2.5 px-3">Estado de Calce</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {/* Cuello */}
                <tr>
                  <td className="py-2.5 px-3 font-bold text-slate-900">
                    1. Cuello (Base)
                  </td>
                  <td className="py-2.5 px-3 font-black text-slate-900">
                    {report.measurements.neck} {report.measurements.unit}
                    {report.measurements.unit === 'in' ? ` (~${report.measurementsInCm.neck} cm)` : ''}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                    {report.benchmark.neckRange}
                  </td>
                  <td className="py-2.5 px-3">
                    {report.analysis.issues.some((i) => i.field === 'neck') ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-100 text-amber-800">
                        Inusual vs Raza
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-800">
                        ✓ Armónico
                      </span>
                    )}
                  </td>
                </tr>

                {/* Pecho */}
                <tr className={report.analysis.issues.some((i) => i.type === 'inverted_neck_chest') ? 'bg-red-50' : ''}>
                  <td className="py-2.5 px-3 font-bold text-slate-900">
                    2. Pecho (Tórax Clave)
                  </td>
                  <td className="py-2.5 px-3 font-black text-slate-900">
                    {report.measurements.chest} {report.measurements.unit}
                    {report.measurements.unit === 'in' ? ` (~${report.measurementsInCm.chest} cm)` : ''}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                    {report.benchmark.chestRange}
                  </td>
                  <td className="py-2.5 px-3">
                    {report.analysis.issues.some((i) => i.type === 'inverted_neck_chest') ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-red-600 text-white">
                        ❌ Menor o igual al Cuello
                      </span>
                    ) : report.analysis.issues.some((i) => i.field === 'chest') ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-100 text-amber-800">
                        Inusual vs Raza
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-800">
                        ✓ Armónico
                      </span>
                    )}
                  </td>
                </tr>

                {/* Largo */}
                <tr>
                  <td className="py-2.5 px-3 font-bold text-slate-900">
                    3. Largo de Lomo (Espalda)
                  </td>
                  <td className="py-2.5 px-3 font-black text-slate-900">
                    {report.measurements.bodyLength} {report.measurements.unit}
                    {report.measurements.unit === 'in' ? ` (~${report.measurementsInCm.bodyLength} cm)` : ''}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                    {report.benchmark.lengthRange}
                  </td>
                  <td className="py-2.5 px-3">
                    {report.analysis.issues.some((i) => i.field === 'bodyLength') ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-100 text-amber-800">
                        Inusual vs Raza
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-800">
                        ✓ Armónico
                      </span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Tailor Advice Note */}
        <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 text-xs text-orange-950 space-y-1">
          <p className="font-black text-orange-900 flex items-center gap-1.5">
            <Scissors className="w-4 h-4 text-orange-600" />
            Dictamen del Taller Artesanal (Constanza S. • petsimona25 Rengo):
          </p>
          <p className="leading-relaxed text-slate-700">
            {report.analysis.tailorRecommendation}
          </p>
        </div>

        {/* ===================================================================== */}
        {/* NOTIFICACIONES: WHATSAPP Y CORREO ELECTRÓNICO                         */}
        {/* ===================================================================== */}
        <div className="space-y-3 pt-2 border-t-2 border-dashed border-slate-200">
          <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Send className="w-4 h-4 text-orange-600" />
              Notificación Oficial del Reporte (WhatsApp & Correo)
            </span>
            <span className="text-[11px] text-slate-500 font-normal">
              Notifica al Taller y a tu bandeja
            </span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* CANAL 1: WHATSAPP NOTIFICATION */}
            <div className="p-4 rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-900 font-black text-xs">
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Notificación a WhatsApp</span>
                </div>
                <span className="text-[10px] font-black text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded-md">
                  {OFFICIAL_WHATSAPP_PHONE}
                </span>
              </div>

              <p className="text-[11px] text-emerald-950 leading-relaxed">
                Envía la ficha técnica formateada al WhatsApp oficial del taller para coordinar el inicio de corte y seguimiento.
              </p>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 block">
                  Tu WhatsApp (Opcional, para recibir copia):
                </label>
                <input
                  type="tel"
                  placeholder="+56 9 1234 5678"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-emerald-300 text-xs font-bold text-slate-800 bg-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <button
                type="button"
                onClick={handleSendWhatsApp}
                disabled={sendingWhatsApp}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition-transform active:scale-95 disabled:opacity-75"
              >
                {sendingWhatsApp ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <MessageCircle className="w-3.5 h-3.5" />
                )}
                <span>📲 Notificar Validación por WhatsApp</span>
              </button>

              {whatsAppSuccessMessage && (
                <p className="text-[11px] font-bold text-emerald-800 flex items-center gap-1 bg-emerald-100 p-2 rounded-lg">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-700" />
                  <span>{whatsAppSuccessMessage}</span>
                </p>
              )}
            </div>

            {/* CANAL 2: CORREO ELECTRÓNICO NOTIFICATION */}
            <div className="p-4 rounded-2xl border-2 border-sky-200 bg-sky-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sky-950 font-black text-xs">
                  <Mail className="w-4 h-4 text-sky-600" />
                  <span>Notificación a Correo 📧</span>
                </div>
                <span className="text-[10px] font-black text-sky-800 bg-sky-200/80 px-2 py-0.5 rounded-md">
                  {OFFICIAL_NOTIFICATION_EMAIL}
                </span>
              </div>

              <p className="text-[11px] text-sky-950 leading-relaxed">
                Despacha un email con la ficha técnica completa al taller y a tu casilla de correo para respaldar las medidas.
              </p>

              <form onSubmit={handleSendEmail} className="space-y-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">
                    Correo del Tutor / Comprador:
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="tu-correo@ejemplo.cl"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-sky-300 text-xs font-bold text-slate-800 bg-white focus:outline-hidden focus:border-sky-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sendingEmail}
                  className="w-full py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition-transform active:scale-95 disabled:opacity-75"
                >
                  {sendingEmail ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Mail className="w-3.5 h-3.5" />
                  )}
                  <span>📧 Enviar Reporte por Correo</span>
                </button>
              </form>

              {emailSuccessMessage && (
                <p className="text-[11px] font-bold text-sky-900 flex items-center gap-1 bg-sky-100 p-2 rounded-lg">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-sky-700" />
                  <span>{emailSuccessMessage}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Correction Actions if Errors or Inversion */}
        {hasErrors && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-300 space-y-2">
            <p className="text-xs font-bold text-red-900">
              💡 Para proceder con la compra, aplica una de estas soluciones rápidas:
            </p>
            <div className="flex flex-wrap gap-2">
              {report.analysis.issues.some((i) => i.type === 'inverted_neck_chest') && onSwapNeckChest && (
                <button
                  type="button"
                  onClick={() => {
                    onSwapNeckChest();
                    onClose();
                  }}
                  className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs"
                >
                  Invertir Pecho y Cuello
                </button>
              )}
              {onApplyBreedTypical && (
                <button
                  type="button"
                  onClick={() => {
                    onApplyBreedTypical();
                    onClose();
                  }}
                  className="px-3 py-2 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-950 font-black text-xs border border-orange-300"
                >
                  Ajustar a valores estándar de {report.benchmark.name}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Action Toolbar */}
        <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
              <span>{copied ? '¡Copiado al Portapapeles!' : 'Copiar Ficha'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs transition-colors"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Imprimir Ficha</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onModifyMeasurements && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onModifyMeasurements();
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
              >
                Modificar Medidas
              </button>
            )}

            {!hasErrors && onConfirmAddToCart && (
              <button
                type="button"
                onClick={() => {
                  onConfirmAddToCart();
                  onClose();
                }}
                className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-md transition-transform active:scale-95 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Agregar al Carrito con Validación Confirmada</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
