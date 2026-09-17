import React, { useState, useEffect } from 'react';
import {
  X,
  Key,
  ShieldCheck,
  Check,
  DollarSign,
  Settings,
  Save,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  CreditCard,
  Lock,
  Sparkles,
  Zap,
  Globe,
  HelpCircle,
  Copy,
  Info,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Building,
  UserCheck,
} from 'lucide-react';
import { PaymentCredentials } from '../types';
import {
  testMercadoPagoAPIKey,
  saveStoredPaymentConfig,
  validateMercadoPagoAccessToken,
  validateMercadoPagoPublicKey,
  validatePayPalCredentials,
} from '../services/mercadoPagoService';

interface PaymentConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: PaymentCredentials;
  onSaveConfig: (updated: PaymentCredentials) => void;
}

export const PaymentConfigModal: React.FC<PaymentConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [activeTab, setActiveTab] = useState<'mercadopago' | 'paypal'>('mercadopago');

  // Form State - Mercado Pago
  const [accountName, setAccountName] = useState(config.accountName || 'petsimona25');
  const [mpPublicKey, setMpPublicKey] = useState(config.mercadoPagoPublicKey || '');
  const [mpAccessToken, setMpAccessToken] = useState(config.mercadoPagoAccessToken || '');
  const [mpClientId, setMpClientId] = useState(config.mercadoPagoClientId || '7829104829104829');
  const [mpClientSecret, setMpClientSecret] = useState(config.mercadoPagoClientSecret || '');
  const [mpEnvironment, setMpEnvironment] = useState<'sandbox' | 'live'>(config.mercadoPagoEnvironment || 'live');
  const [showAccessToken, setShowAccessToken] = useState(false);

  // Form State - PayPal
  const [paypalClientId, setPaypalClientId] = useState(config.paypalClientId || '');
  const [paypalEmail, setPaypalEmail] = useState(config.paypalEmail || 'contacto@petsimona25.cl');
  const [paypalMerchantId, setPaypalMerchantId] = useState(config.paypalMerchantId || '');
  const [paypalMode, setPaypalMode] = useState<'sandbox' | 'live'>(config.paypalMode || 'live');
  const [showPaypalClientId, setShowPaypalClientId] = useState(false);

  // Validation States
  const [validationErrors, setValidationErrors] = useState<{
    mpAccessToken?: string;
    mpPublicKey?: string;
    paypalClientId?: string;
    paypalEmail?: string;
    general?: string;
  }>({});

  // Action status
  const [isTestingMP, setIsTestingMP] = useState(false);
  const [mpTestResult, setMpTestResult] = useState<{
    success: boolean;
    message: string;
    sellerInfo?: any;
  } | null>(() => {
    if (config.lastTestStatus) {
      return {
        success: config.lastTestStatus === 'success',
        message: config.lastTestMessage || '',
      };
    }
    return null;
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  // Reset or sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setAccountName(config.accountName || 'petsimona25');
      setMpPublicKey(config.mercadoPagoPublicKey || '');
      setMpAccessToken(config.mercadoPagoAccessToken || '');
      setMpClientId(config.mercadoPagoClientId || '7829104829104829');
      setMpClientSecret(config.mercadoPagoClientSecret || '');
      setMpEnvironment(config.mercadoPagoEnvironment || 'live');
      setPaypalClientId(config.paypalClientId || '');
      setPaypalEmail(config.paypalEmail || 'contacto@petsimona25.cl');
      setPaypalMerchantId(config.paypalMerchantId || '');
      setPaypalMode(config.paypalMode || 'live');
      setValidationErrors({});
      setSavedSuccess(false);
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  // Real-time Mercado Pago validation helper
  const mpTokenValidation = mpAccessToken.trim()
    ? validateMercadoPagoAccessToken(mpAccessToken, mpEnvironment)
    : null;

  const mpPublicValidation = mpPublicKey.trim()
    ? validateMercadoPagoPublicKey(mpPublicKey, mpEnvironment)
    : null;

  // Real-time PayPal validation helper
  const paypalValidation = validatePayPalCredentials(paypalClientId, paypalEmail);

  // Live Test Mercado Pago Connection
  const handleTestMercadoPago = async () => {
    const tokenVal = validateMercadoPagoAccessToken(mpAccessToken, mpEnvironment);
    if (!tokenVal.isValid) {
      setValidationErrors((prev) => ({
        ...prev,
        mpAccessToken: tokenVal.error || 'Access Token no válido',
      }));
      setMpTestResult({
        success: false,
        message: tokenVal.error || 'Verifica el formato del Access Token antes de probar.',
      });
      return;
    }

    setValidationErrors((prev) => ({ ...prev, mpAccessToken: undefined }));
    setIsTestingMP(true);
    setMpTestResult(null);

    try {
      const tempCreds: PaymentCredentials = {
        ...config,
        accountName,
        mercadoPagoPublicKey: mpPublicKey.trim(),
        mercadoPagoAccessToken: mpAccessToken.trim(),
        mercadoPagoClientId: mpClientId.trim(),
        mercadoPagoClientSecret: mpClientSecret.trim(),
        mercadoPagoEnvironment: mpEnvironment,
      };

      const result = await testMercadoPagoAPIKey(tempCreds);
      setMpTestResult(result);
    } catch (err: any) {
      setMpTestResult({
        success: false,
        message: 'Error de comunicación: ' + (err?.message || 'No fue posible contactar a Mercado Pago'),
      });
    } finally {
      setIsTestingMP(false);
    }
  };

  // Validate entire form before saving
  const validateForm = (): boolean => {
    const errors: {
      mpAccessToken?: string;
      mpPublicKey?: string;
      paypalClientId?: string;
      paypalEmail?: string;
      general?: string;
    } = {};

    // Validate Mercado Pago if provided
    if (mpAccessToken.trim()) {
      const tokenVal = validateMercadoPagoAccessToken(mpAccessToken, mpEnvironment);
      if (!tokenVal.isValid) {
        errors.mpAccessToken = tokenVal.error;
      }
    }

    if (mpPublicKey.trim()) {
      const pubVal = validateMercadoPagoPublicKey(mpPublicKey, mpEnvironment);
      if (!pubVal.isValid) {
        errors.mpPublicKey = pubVal.error;
      }
    }

    // Validate PayPal
    if (paypalClientId.trim() || paypalEmail.trim()) {
      const ppVal = validatePayPalCredentials(paypalClientId, paypalEmail);
      if (!ppVal.isValid) {
        if (ppVal.errors.clientId) errors.paypalClientId = ppVal.errors.clientId;
        if (ppVal.errors.email) errors.paypalEmail = ppVal.errors.email;
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const updated: PaymentCredentials = {
      ...config,
      accountName: accountName.trim() || 'petsimona25',
      mercadoPagoPublicKey: mpPublicKey.trim(),
      mercadoPagoAccessToken: mpAccessToken.trim(),
      mercadoPagoClientId: mpClientId.trim(),
      mercadoPagoClientSecret: mpClientSecret.trim(),
      mercadoPagoEnvironment: mpEnvironment,
      paypalClientId: paypalClientId.trim(),
      paypalEmail: paypalEmail.trim(),
      paypalMerchantId: paypalMerchantId.trim(),
      paypalMode,
      currency: config.currency || 'CLP',
      lastTestedAt: mpTestResult ? new Date().toISOString() : config.lastTestedAt,
      lastTestStatus: mpTestResult ? (mpTestResult.success ? 'success' : 'failed') : config.lastTestStatus,
      lastTestMessage: mpTestResult ? mpTestResult.message : config.lastTestMessage,
    };

    // 1. Guardar en storage local y sincronizar con backend
    saveStoredPaymentConfig(updated);

    // 2. Actualizar estado global en React inmediatamente para el checkout
    onSaveConfig(updated);

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const webhookUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/api/mercadopago/webhook`
      : 'https://petsimona25.cl/api/mercadopago/webhook';

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-8 shadow-2xl border-2 border-orange-200 relative animate-scale-up space-y-6 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          aria-label="Cerrar ventana"
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start sm:items-center gap-3 border-b-2 border-orange-100 pb-4">
          <div className="p-3 bg-gradient-to-tr from-sky-600 via-blue-600 to-indigo-600 text-white rounded-2xl shadow-md shrink-0">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Agregar Credenciales de Pago 💳
              </h3>
              <span className="bg-sky-100 text-sky-900 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-sky-300">
                Chile (CLP) &amp; Global (USD)
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Cuenta Oficial: <strong className="text-slate-900 font-black">@{accountName}</strong> • Sincronización instantánea con el Checkout de la tienda.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('mercadopago')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'mercadopago'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Mercado Pago Chile (Webpay / Tarjetas)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('paypal')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'paypal'
                ? 'bg-blue-700 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>PayPal Internacional (USD)</span>
          </button>
        </div>

        {/* Validation Errors Notice if any */}
        {Object.keys(validationErrors).length > 0 && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-900 text-xs font-bold flex items-start gap-2.5 animate-in fade-in duration-200">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-black text-rose-950">Por favor corrige los siguientes campos antes de guardar:</p>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] font-semibold text-rose-800">
                {validationErrors.mpAccessToken && <li>Mercado Pago Access Token: {validationErrors.mpAccessToken}</li>}
                {validationErrors.mpPublicKey && <li>Mercado Pago Public Key: {validationErrors.mpPublicKey}</li>}
                {validationErrors.paypalClientId && <li>PayPal Client ID: {validationErrors.paypalClientId}</li>}
                {validationErrors.paypalEmail && <li>PayPal Email: {validationErrors.paypalEmail}</li>}
              </ul>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* TAB 1: MERCADO PAGO */}
          {activeTab === 'mercadopago' && (
            <div className="space-y-5">
              <div className="p-5 rounded-3xl bg-gradient-to-b from-sky-50/90 to-blue-50/40 border-2 border-sky-200 space-y-4 shadow-xs">
                {/* Mode Selector & Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-sky-200/80 pb-3.5">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-sky-500 shadow-xs" />
                    <div>
                      <h4 className="text-sm font-black text-sky-950">
                        Mercado Pago Checkout Pro &amp; Webpay Plus
                      </h4>
                      <p className="text-[11px] text-sky-800 font-medium">
                        Acepta Redcompra, Débito, Crédito y Transferencias en pesos chilenos (CLP).
                      </p>
                    </div>
                  </div>

                  {/* Mode switch (Sandbox / Live) */}
                  <div className="flex items-center gap-1 text-[10px] font-black bg-white p-1 rounded-xl border border-sky-200 shadow-2xs self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setMpEnvironment('sandbox');
                        setValidationErrors((prev) => ({ ...prev, mpAccessToken: undefined, mpPublicKey: undefined }));
                      }}
                      className={`px-3 py-1.5 rounded-lg uppercase transition-all cursor-pointer ${
                        mpEnvironment === 'sandbox'
                          ? 'bg-sky-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Sandbox (Pruebas)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMpEnvironment('live');
                        setValidationErrors((prev) => ({ ...prev, mpAccessToken: undefined, mpPublicKey: undefined }));
                      }}
                      className={`px-3 py-1.5 rounded-lg uppercase transition-all cursor-pointer ${
                        mpEnvironment === 'live'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Producción (Live)
                    </button>
                  </div>
                </div>

                {/* Test Feedback Status Box */}
                {mpTestResult && (
                  <div
                    className={`p-3.5 rounded-2xl text-xs font-bold border-2 flex items-start gap-2.5 animate-in fade-in duration-200 ${
                      mpTestResult.success
                        ? 'bg-emerald-50 text-emerald-950 border-emerald-300'
                        : 'bg-rose-50 text-rose-950 border-rose-300'
                    }`}
                  >
                    {mpTestResult.success ? (
                      <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <p className="leading-snug">{mpTestResult.message}</p>
                      {mpTestResult.sellerInfo && (
                        <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-emerald-800 pt-0.5">
                          <span>
                            ID Vendedor: <strong>{mpTestResult.sellerInfo.id}</strong>
                          </span>
                          <span>
                            Usuario: <strong>@{mpTestResult.sellerInfo.nickname || accountName}</strong>
                          </span>
                          <span>
                            Estado: <strong className="text-emerald-700">Verificado MLC</strong>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Input Fields */}
                <div className="space-y-3.5">
                  {/* Access Token Field */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-black text-slate-800 uppercase flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5 text-sky-600" />
                        <span>Mercado Pago Access Token (Credencial Privada) *</span>
                      </label>
                      <span className="text-[10px] text-slate-500 font-mono font-bold">
                        {mpEnvironment === 'live' ? (
                          <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            Prefijo: APP_USR-...
                          </span>
                        ) : (
                          <span className="text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                            Prefijo: TEST-...
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="relative">
                      <input
                        type={showAccessToken ? 'text' : 'password'}
                        placeholder={
                          mpEnvironment === 'live'
                            ? 'APP_USR-7829104829104829-082219-xxxxxxxxxxxx-781053984'
                            : 'TEST-7829104829104829-082219-xxxxxxxxxxxx-781053984'
                        }
                        value={mpAccessToken}
                        onChange={(e) => {
                          setMpAccessToken(e.target.value);
                          if (validationErrors.mpAccessToken) {
                            setValidationErrors((prev) => ({ ...prev, mpAccessToken: undefined }));
                          }
                        }}
                        className={`w-full px-3.5 py-2.5 pr-10 rounded-xl border-2 text-xs font-mono font-bold text-slate-900 bg-white outline-hidden transition-all ${
                          validationErrors.mpAccessToken
                            ? 'border-rose-400 bg-rose-50/30 focus:border-rose-600'
                            : mpTokenValidation && mpTokenValidation.isValid
                            ? 'border-emerald-300 focus:border-emerald-500'
                            : 'border-slate-200 focus:border-sky-500'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowAccessToken(!showAccessToken)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                        title={showAccessToken ? 'Ocultar credencial' : 'Mostrar credencial'}
                      >
                        {showAccessToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {validationErrors.mpAccessToken ? (
                      <p className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{validationErrors.mpAccessToken}</span>
                      </p>
                    ) : mpTokenValidation?.isValid ? (
                      <p className="text-[10px] text-emerald-700 font-bold mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                        <span>Formato de Access Token válido para {mpEnvironment === 'live' ? 'Producción' : 'Sandbox'}.</span>
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-500 mt-1">
                        Credencial privada para generar el checkout y procesar pagos de forma segura en el servidor.
                      </p>
                    )}
                  </div>

                  {/* Public Key Field */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-black text-slate-800 uppercase flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-sky-600" />
                        <span>Mercado Pago Public Key (Credencial Pública)</span>
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono">Frontend / Checkout</span>
                    </div>

                    <input
                      type="text"
                      placeholder={
                        mpEnvironment === 'live'
                          ? 'APP_USR-xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
                          : 'TEST-xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
                      }
                      value={mpPublicKey}
                      onChange={(e) => {
                        setMpPublicKey(e.target.value);
                        if (validationErrors.mpPublicKey) {
                          setValidationErrors((prev) => ({ ...prev, mpPublicKey: undefined }));
                        }
                      }}
                      className={`w-full px-3.5 py-2.5 rounded-xl border-2 text-xs font-mono font-bold text-slate-900 bg-white outline-hidden transition-all ${
                        validationErrors.mpPublicKey
                          ? 'border-rose-400 bg-rose-50/30 focus:border-rose-600'
                          : mpPublicValidation && mpPublicValidation.isValid
                          ? 'border-emerald-300 focus:border-emerald-500'
                          : 'border-slate-200 focus:border-sky-500'
                      }`}
                    />

                    {validationErrors.mpPublicKey ? (
                      <p className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{validationErrors.mpPublicKey}</span>
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-500 mt-1">
                        Clave pública para inicializar componentes de pago y tokenización en el navegador.
                      </p>
                    )}
                  </div>

                  {/* Client ID & Store Descriptor */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">
                        Application ID (Client ID)
                      </label>
                      <input
                        type="text"
                        value={mpClientId}
                        onChange={(e) => setMpClientId(e.target.value)}
                        placeholder="7829104829104829"
                        className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 text-xs font-mono font-bold text-slate-900 bg-white outline-hidden focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">
                        Nombre de la Tienda / Descriptor
                      </label>
                      <input
                        type="text"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        placeholder="petsimona25"
                        className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 text-xs font-bold text-slate-900 bg-white outline-hidden focus:border-sky-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Test Connection Button */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-sky-200/60">
                  <div className="flex items-center gap-1.5 text-[11px] text-sky-900 font-bold">
                    <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>Verifica tus credenciales en vivo antes de guardar.</span>
                  </div>

                  <button
                    type="button"
                    disabled={isTestingMP || !mpAccessToken.trim()}
                    onClick={handleTestMercadoPago}
                    className="bg-sky-600 hover:bg-sky-700 active:scale-95 text-white text-xs font-black px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTestingMP ? 'animate-spin' : ''}`} />
                    <span>{isTestingMP ? 'Validando Credenciales...' : 'Probar Credenciales de Pago'}</span>
                  </button>
                </div>
              </div>

              {/* Webhook and Developers Guide Card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-sky-600" />
                    <span>URL Webhook / IPN de Notificaciones (Automático)</span>
                  </h5>
                  <button
                    type="button"
                    onClick={handleCopyWebhook}
                    className="text-[10px] text-sky-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copiedWebhook ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedWebhook ? '¡Copiado!' : 'Copiar URL'}</span>
                  </button>
                </div>

                <div className="p-2.5 bg-slate-900 text-yellow-300 font-mono text-[11px] rounded-xl overflow-x-auto select-all">
                  {webhookUrl}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>¿Dónde obtener tus credenciales de Mercado Pago Chile?</span>
                  <a
                    href="https://www.mercadopago.cl/developers/panel/credentials"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-600 font-bold hover:underline inline-flex items-center gap-1"
                  >
                    <span>Panel de Desarrolladores MP</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PAYPAL */}
          {activeTab === 'paypal' && (
            <div className="space-y-4">
              <div className="p-5 rounded-3xl bg-gradient-to-b from-blue-50/90 to-indigo-50/40 border-2 border-blue-200 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-200 pb-3">
                  <div>
                    <h4 className="text-sm font-black text-blue-950 flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-blue-700 shadow-xs" />
                      PayPal Smart Checkout (Internacional)
                    </h4>
                    <p className="text-[11px] text-blue-800 font-medium">
                      Pasarela para clientes internacionales y pagos en dólares (USD).
                    </p>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] font-black bg-white p-1 rounded-xl border border-blue-200 shadow-2xs self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setPaypalMode('sandbox')}
                      className={`px-3 py-1.5 rounded-lg uppercase transition-all cursor-pointer ${
                        paypalMode === 'sandbox'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Sandbox
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaypalMode('live')}
                      className={`px-3 py-1.5 rounded-lg uppercase transition-all cursor-pointer ${
                        paypalMode === 'live'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Live
                    </button>
                  </div>
                </div>

                <div className="space-y-3.5">
                  {/* PayPal Client ID */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-black text-blue-950 uppercase flex items-center gap-1">
                        <Key className="w-3.5 h-3.5 text-blue-700" />
                        <span>PayPal Client ID *</span>
                      </label>
                      <span className="text-[10px] text-blue-700 font-mono font-bold">
                        {paypalMode === 'live' ? 'Cuenta Live' : 'Cuenta Sandbox'}
                      </span>
                    </div>

                    <div className="relative">
                      <input
                        type={showPaypalClientId ? 'text' : 'password'}
                        value={paypalClientId}
                        onChange={(e) => {
                          setPaypalClientId(e.target.value);
                          if (validationErrors.paypalClientId) {
                            setValidationErrors((prev) => ({ ...prev, paypalClientId: undefined }));
                          }
                        }}
                        placeholder="AXpetsimona25_PayPal_Client_ID_Production_Verified..."
                        className={`w-full px-3.5 py-2.5 pr-10 rounded-xl border-2 text-xs font-mono font-bold text-blue-950 bg-white outline-hidden transition-all ${
                          validationErrors.paypalClientId
                            ? 'border-rose-400 bg-rose-50/30 focus:border-rose-600'
                            : 'border-blue-200 focus:border-blue-600'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPaypalClientId(!showPaypalClientId)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                      >
                        {showPaypalClientId ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {validationErrors.paypalClientId && (
                      <p className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{validationErrors.paypalClientId}</span>
                      </p>
                    )}
                  </div>

                  {/* PayPal Business Email */}
                  <div>
                    <label className="text-[11px] font-black text-blue-950 uppercase flex items-center gap-1 mb-1">
                      <Mail className="w-3.5 h-3.5 text-blue-700" />
                      <span>Correo Electrónico de Cuenta PayPal Business</span>
                    </label>
                    <input
                      type="email"
                      value={paypalEmail}
                      onChange={(e) => {
                        setPaypalEmail(e.target.value);
                        if (validationErrors.paypalEmail) {
                          setValidationErrors((prev) => ({ ...prev, paypalEmail: undefined }));
                        }
                      }}
                      placeholder="contacto@petsimona25.cl"
                      className={`w-full px-3.5 py-2.5 rounded-xl border-2 text-xs font-bold text-slate-900 bg-white outline-hidden transition-all ${
                        validationErrors.paypalEmail
                          ? 'border-rose-400 bg-rose-50/30 focus:border-rose-600'
                          : 'border-blue-200 focus:border-blue-600'
                      }`}
                    />
                    {validationErrors.paypalEmail ? (
                      <p className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{validationErrors.paypalEmail}</span>
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-500 mt-1">
                        Dirección de correo asociada a la cuenta oficial receptora de fondos PayPal.
                      </p>
                    )}
                  </div>

                  {/* Optional Merchant ID */}
                  <div>
                    <label className="text-[11px] font-black text-slate-700 uppercase flex items-center gap-1 mb-1">
                      <Building className="w-3.5 h-3.5 text-slate-500" />
                      <span>Merchant Account ID (Opcional)</span>
                    </label>
                    <input
                      type="text"
                      value={paypalMerchantId}
                      onChange={(e) => setPaypalMerchantId(e.target.value)}
                      placeholder="PS25_MERCHANT_CL"
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-xs font-mono font-bold text-slate-900 bg-white outline-hidden focus:border-blue-600"
                    />
                  </div>
                </div>

                <div className="p-3 bg-blue-100/70 border border-blue-300 rounded-2xl text-[11px] text-blue-900 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-700 shrink-0" />
                  <span>
                    Al guardar, los compradores extranjeros podrán elegir <strong>PayPal Smart Checkout</strong> durante el proceso de compra.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Footer Security Notice */}
          <div className="p-3.5 bg-emerald-50 border-2 border-emerald-200 rounded-2xl text-xs text-emerald-950 font-medium flex items-center gap-2.5 shadow-2xs">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              Las credenciales de pago se almacenan con cifrado seguro y se sincronizan instantáneamente con el flujo de compra para <strong className="font-bold">petsimona25 (@petsimona25)</strong>.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-3 rounded-xl border-2 border-slate-200 text-xs font-bold text-slate-700 uppercase hover:bg-slate-100 transition-colors cursor-pointer text-center"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className={`w-full sm:w-auto px-7 py-3 rounded-xl text-white font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
                savedSuccess
                  ? 'bg-emerald-600'
                  : 'bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700'
              }`}
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>¡Credenciales Guardadas y Activas!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Guardar y Aplicar al Checkout</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
