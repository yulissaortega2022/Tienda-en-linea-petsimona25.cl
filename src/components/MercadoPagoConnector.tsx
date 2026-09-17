import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Zap,
  Save,
  Globe,
  DollarSign,
  Copy,
  Check,
  Lock,
  Smartphone,
  Eye,
  EyeOff,
  HelpCircle,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react';
import { PaymentCredentials } from '../types';
import {
  getStoredPaymentConfig,
  saveStoredPaymentConfig,
  testMercadoPagoAPIKey,
  MERCADOPAGO_CONFIG_UPDATED_EVENT,
} from '../services/mercadoPagoService';

interface MercadoPagoConnectorProps {
  onShowToast?: (msg: string) => void;
}

export const MercadoPagoConnector: React.FC<MercadoPagoConnectorProps> = ({ onShowToast }) => {
  const [config, setConfig] = useState<PaymentCredentials>(() => getStoredPaymentConfig());

  // Form Fields
  const [accountName, setAccountName] = useState(config.accountName || 'petsimona25');
  const [accessToken, setAccessToken] = useState(config.mercadoPagoAccessToken || '');
  const [publicKey, setPublicKey] = useState(config.mercadoPagoPublicKey || '');
  const [clientId, setClientId] = useState(config.mercadoPagoClientId || '7829104829104829');
  const [clientSecret, setClientSecret] = useState(config.mercadoPagoClientSecret || '');
  const [environment, setEnvironment] = useState<'sandbox' | 'live'>(config.mercadoPagoEnvironment || 'live');

  // UI state
  const [showToken, setShowToken] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    sellerInfo?: {
      id: string;
      nickname: string;
      site_id: string;
      email?: string;
      reputation?: string;
    };
  } | null>(() => {
    if (config.lastTestStatus) {
      return {
        success: config.lastTestStatus === 'success',
        message: config.lastTestMessage || 'Credenciales de Pago configuradas previamente.',
        sellerInfo: config.mercadoPagoCollectorId
          ? {
              id: config.mercadoPagoCollectorId,
              nickname: config.mercadoPagoNickname || config.accountName || 'PETSIMONA25',
              site_id: 'MLC',
            }
          : undefined,
      };
    }
    return null;
  });

  // Sync on external updates
  useEffect(() => {
    const handleUpdate = (e: any) => {
      const updated = e.detail || getStoredPaymentConfig();
      setConfig(updated);
      setAccountName(updated.accountName || 'petsimona25');
      setAccessToken(updated.mercadoPagoAccessToken || '');
      setPublicKey(updated.mercadoPagoPublicKey || '');
      setClientId(updated.mercadoPagoClientId || '7829104829104829');
      setClientSecret(updated.mercadoPagoClientSecret || '');
      setEnvironment(updated.mercadoPagoEnvironment || 'live');
    };
    window.addEventListener(MERCADOPAGO_CONFIG_UPDATED_EVENT, handleUpdate);
    return () => window.removeEventListener(MERCADOPAGO_CONFIG_UPDATED_EVENT, handleUpdate);
  }, []);

  const webhookUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/api/mercadopago/webhook`
      : 'https://petsimona25.cl/api/mercadopago/webhook';

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleTestConnection = async () => {
    if (!accessToken.trim()) {
      setTestResult({
        success: false,
        message: 'Por favor ingresa tu credencial Access Token antes de realizar la prueba.',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const tempCreds: PaymentCredentials = {
        ...config,
        accountName,
        mercadoPagoAccessToken: accessToken.trim(),
        mercadoPagoPublicKey: publicKey.trim(),
        mercadoPagoClientId: clientId.trim(),
        mercadoPagoClientSecret: clientSecret.trim(),
        mercadoPagoEnvironment: environment,
      };

      const res = await testMercadoPagoAPIKey(tempCreds);
      setTestResult(res);

      if (res.success) {
        if (onShowToast) {
          onShowToast('✓ Credenciales de pago de Mercado Pago Chile verificadas con éxito');
        }
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: 'Error al verificar credenciales: ' + (err?.message || 'Error de red'),
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const updated: PaymentCredentials = {
      ...config,
      accountName: accountName.trim() || 'petsimona25',
      mercadoPagoAccessToken: accessToken.trim(),
      mercadoPagoPublicKey: publicKey.trim(),
      mercadoPagoClientId: clientId.trim(),
      mercadoPagoClientSecret: clientSecret.trim(),
      mercadoPagoEnvironment: environment,
      lastTestedAt: testResult ? new Date().toISOString() : config.lastTestedAt,
      lastTestStatus: testResult ? (testResult.success ? 'success' : 'failed') : config.lastTestStatus,
      lastTestMessage: testResult ? testResult.message : config.lastTestMessage,
    };

    saveStoredPaymentConfig(updated);
    setConfig(updated);

    setTimeout(() => {
      setIsSaving(false);
      if (onShowToast) {
        onShowToast('✓ Credenciales de pago guardadas y sincronizadas con el Checkout.');
      }
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-900 via-blue-900 to-indigo-900 text-white p-6 rounded-3xl border-2 border-sky-400 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-6 translate-y-6">
          <CreditCard className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-sky-500 text-white rounded-2xl flex items-center justify-center shadow-lg ring-4 ring-sky-300/30 shrink-0">
              <CreditCard className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-black tracking-tight text-white">
                  Credenciales de Pago (Mercado Pago Chile) 💳
                </h3>
                <span className="bg-sky-400 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-xs">
                  Chile • CLP
                </span>
                <span
                  className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                    environment === 'live' ? 'bg-emerald-400 text-emerald-950' : 'bg-amber-400 text-amber-950'
                  }`}
                >
                  {environment === 'live' ? '● Producción (Live)' : '○ Sandbox (Pruebas)'}
                </span>
              </div>
              <p className="text-xs text-sky-200 mt-1 max-w-xl">
                Ingresa o actualiza tus <strong>credenciales de pago</strong> (Access Token y Public Key) para procesar pagos seguros con Webpay Plus, tarjetas de débito, crédito y transferencias bancarias en <strong>petsimona25</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://www.mercadopago.cl/developers/panel/credentials"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-black px-4 py-2.5 rounded-xl border border-white/20 transition-all flex items-center gap-1.5 backdrop-blur-xs"
            >
              <span>Obtener Credenciales en Mercado Pago</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Grid: Form + Instructions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Credentials Form (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSaveCredentials} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Key className="w-4 h-4 text-sky-600" />
                  <span>Agregar Credenciales de Pago</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Ingresa las credenciales de tu cuenta de Mercado Pago Desarrolladores.
                </p>
              </div>

              {/* Environment toggle */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setEnvironment('sandbox')}
                  className={`px-3 py-1 text-xs font-black rounded-lg transition-all cursor-pointer ${
                    environment === 'sandbox' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sandbox
                </button>
                <button
                  type="button"
                  onClick={() => setEnvironment('live')}
                  className={`px-3 py-1 text-xs font-black rounded-lg transition-all cursor-pointer ${
                    environment === 'live' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Producción
                </button>
              </div>
            </div>

            {/* Test Status Banner */}
            {testResult && (
              <div
                className={`p-4 rounded-2xl border-2 flex items-start gap-3 transition-all ${
                  testResult.success
                    ? 'bg-emerald-50 text-emerald-950 border-emerald-300'
                    : 'bg-rose-50 text-rose-950 border-rose-300'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1 text-xs">
                  <p className="font-bold leading-snug">{testResult.message}</p>
                  {testResult.sellerInfo && (
                    <div className="flex items-center gap-3 pt-1 text-[11px] font-mono text-emerald-800">
                      <span>Cuenta: <strong>@{testResult.sellerInfo.nickname}</strong></span>
                      <span>ID: <strong>{testResult.sellerInfo.id}</strong></span>
                      <span>Sitio: <strong>{testResult.sellerInfo.site_id}</strong></span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Field: Access Token */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-800 uppercase flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-sky-600" />
                  <span>Mercado Pago Access Token (Credencial Privada) *</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1 cursor-pointer"
                >
                  {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showToken ? 'Ocultar' : 'Mostrar'}</span>
                </button>
              </div>

              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  required
                  placeholder={
                    environment === 'live'
                      ? 'APP_USR-7829104829104829-082219-xxxxxxxxxxxx-781053984'
                      : 'TEST-7829104829104829-082219-xxxxxxxxxxxx-781053984'
                  }
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-sky-500 font-mono text-xs text-slate-900 bg-slate-50/50 outline-hidden transition-colors"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Credencial privada utilizada en el servidor para crear preferencias de pago y procesar Checkout Pro.
              </p>
            </div>

            {/* Field: Public Key */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-800 uppercase flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-sky-600" />
                <span>Mercado Pago Public Key (Credencial Pública) *</span>
              </label>

              <input
                type="text"
                required
                placeholder={
                  environment === 'live'
                    ? 'APP_USR-xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
                    : 'TEST-xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
                }
                value={publicKey}
                onChange={(e) => setPublicKey(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-sky-500 font-mono text-xs text-slate-900 bg-slate-50/50 outline-hidden transition-colors"
              />
              <p className="text-[11px] text-slate-500">
                Credencial pública del frontend para inicializar el Checkout de cobro en el navegador.
              </p>
            </div>

            {/* Grid: Client ID & Account Descriptor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-700 uppercase block">
                  Application ID (Client ID)
                </label>
                <input
                  type="text"
                  placeholder="7829104829104829"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 focus:border-sky-500 font-mono text-xs text-slate-900 bg-slate-50/50 outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-700 uppercase block">
                  Nombre Fantasía en Extracto Bancario
                </label>
                <input
                  type="text"
                  placeholder="PETSIMONA25"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 focus:border-sky-500 font-bold text-xs text-slate-900 bg-slate-50/50 outline-hidden"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
              <button
                type="button"
                disabled={isTesting || !accessToken.trim()}
                onClick={handleTestConnection}
                className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black px-5 py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 text-sky-600 ${isTesting ? 'animate-spin' : ''}`} />
                <span>{isTesting ? 'Validando Credenciales...' : 'Probar Credenciales de Pago'}</span>
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 text-white text-xs font-black uppercase tracking-wider px-7 py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Guardar Credenciales de Pago</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Webhook Configuration Box */}
          <div className="bg-slate-900 text-white p-5 rounded-3xl space-y-3 shadow-sm border border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-black uppercase tracking-wider text-yellow-300">
                  Webhook / IPN de Notificaciones Automáticas
                </h4>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(webhookUrl, 'webhook')}
                className="text-[11px] font-bold bg-white/10 hover:bg-white/20 text-yellow-300 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copiedField === 'webhook' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedField === 'webhook' ? 'Copiado' : 'Copiar URL'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Registra esta URL en tu panel de Mercado Pago en la sección <strong>Notificaciones Webhook</strong> para recibir confirmaciones de pago en tiempo real y actualizar el estado de confección de tus pedidos:
            </p>

            <div className="bg-black/50 p-3 rounded-xl font-mono text-xs text-emerald-400 select-all overflow-x-auto border border-slate-800">
              {webhookUrl}
            </div>
          </div>
        </div>

        {/* Right Column: Step-by-Step Instructions & Features (1 col) */}
        <div className="space-y-5">
          {/* Step by Step Guide */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-sky-600" />
              <span>¿Cómo obtener tus credenciales de Mercado Pago?</span>
            </h4>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 font-black text-center flex items-center justify-center shrink-0">
                  1
                </span>
                <p>
                  Inicia sesión en <a href="https://www.mercadopago.cl/developers" target="_blank" rel="noopener noreferrer" className="text-sky-600 font-bold hover:underline">Mercado Pago Developers Chile</a> con tu cuenta oficial de vendedor de petsimona25.
                </p>
              </div>

              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 font-black text-center flex items-center justify-center shrink-0">
                  2
                </span>
                <p>
                  Dirígete a <strong>Tus Integraciones &gt; Crear Aplicación</strong> o selecciona tu aplicación existente de la tienda.
                </p>
              </div>

              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 font-black text-center flex items-center justify-center shrink-0">
                  3
                </span>
                <p>
                  Entra en <strong>Credenciales de Producción</strong> y copia el <strong>Access Token</strong> y la <strong>Public Key</strong>.
                </p>
              </div>

              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 font-black text-center flex items-center justify-center shrink-0">
                  4
                </span>
                <p>
                  Pégalos en el formulario de la izquierda y presiona <strong>Probar Conexión con API</strong> para verificar.
                </p>
              </div>
            </div>
          </div>

          {/* Payment Methods Supported Card */}
          <div className="bg-sky-50 p-5 rounded-3xl border-2 border-sky-200 space-y-3">
            <h5 className="text-xs font-black uppercase tracking-wider text-sky-950 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Medios de Pago Activos con Mercado Pago</span>
            </h5>

            <ul className="space-y-2 text-xs text-sky-900 font-medium">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span><strong>Webpay Plus:</strong> Débito (Redcompra) y Crédito (Visa, Mastercard, Amex).</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span><strong>Hasta 12 cuotas:</strong> Configurado en preferencias de pago.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span><strong>Transferencias Khipu / Servipag:</strong> Soportado vía Checkout Pro.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span><strong>Dinero en Cuenta MP:</strong> Pago instantáneo con saldo de Mercado Pago.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
