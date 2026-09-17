import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  PauseCircle,
  PlayCircle,
  Key,
  ShieldCheck,
  Download,
  FileCode,
  FileSpreadsheet,
  Search,
  Filter,
  Eye,
  Copy,
  Check,
  Clock,
  Sparkles,
  Truck,
  DollarSign,
  Tag,
  Sliders,
  ChevronDown,
  ChevronUp,
  X,
  AlertTriangle,
  Send,
  Zap,
} from 'lucide-react';
import { Product, MercadoLibreConfig, MercadoLibreItemSync, MercadoLibreLog } from '../types';
import {
  getMercadoLibreConfig,
  saveMercadoLibreConfig,
  getMercadoLibreSyncMap,
  getMercadoLibreLogs,
  clearMercadoLibreLogs,
  testMercadoLibreConnection,
  syncProductToMercadoLibre,
  syncAllProductsToMercadoLibre,
  pauseMercadoLibreItem,
  reactivateMercadoLibreItem,
  exportMercadoLibreJSON,
  exportMercadoLibreCSV,
  formatProductForMercadoLibre,
  MERCADOLIBRE_SYNC_UPDATED_EVENT,
} from '../services/mercadoLibreService';

interface MercadoLibreSyncManagerProps {
  products: Product[];
  onOpenProductEdit?: (product: Product) => void;
}

export const MercadoLibreSyncManager: React.FC<MercadoLibreSyncManagerProps> = ({
  products,
  onOpenProductEdit,
}) => {
  // Config & state
  const [config, setConfig] = useState<MercadoLibreConfig>(() => getMercadoLibreConfig());
  const [syncMap, setSyncMap] = useState<Record<string, MercadoLibreItemSync>>(() => getMercadoLibreSyncMap());
  const [logs, setLogs] = useState<MercadoLibreLog[]>(() => getMercadoLibreLogs());

  // UI state
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'synced' | 'paused' | 'pending'>('all');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; sellerInfo?: any } | null>(null);
  
  // Bulk sync state
  const [isBulkSyncing, setIsBulkSyncing] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0, currentName: '' });
  
  // Action notifications
  const [actionAlert, setActionAlert] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);

  // Payload inspect modal
  const [inspectPayloadProduct, setInspectPayloadProduct] = useState<Product | null>(null);
  const [copiedPayload, setCopiedPayload] = useState(false);

  // Single item syncing state
  const [syncingItemId, setSyncingItemId] = useState<string | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setSyncMap(getMercadoLibreSyncMap());
      setConfig(getMercadoLibreConfig());
      setLogs(getMercadoLibreLogs());
    };
    window.addEventListener(MERCADOLIBRE_SYNC_UPDATED_EVENT, handleUpdate);
    return () => window.removeEventListener(MERCADOLIBRE_SYNC_UPDATED_EVENT, handleUpdate);
  }, []);

  const showAlert = (type: 'success' | 'info' | 'error', message: string) => {
    setActionAlert({ type, message });
    setTimeout(() => {
      setActionAlert(null);
    }, 4500);
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setTestResult(null);
    try {
      const res = await testMercadoLibreConnection(config);
      setTestResult(res);
      if (res.success) {
        showAlert('success', '✓ Conexión con Mercado Libre Chile verificada con éxito.');
      } else {
        showAlert('error', 'Error en la conexión con Mercado Libre: ' + res.message);
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err?.message || 'Fallo de conexión' });
      showAlert('error', 'Error de red al conectar con la API de Mercado Libre');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = saveMercadoLibreConfig(config);
    setConfig(updated);
    setIsConfigOpen(false);
    showAlert('success', '✓ Credenciales y ajustes de Mercado Libre Chile guardados con éxito.');
  };

  const handleSyncSingleProduct = async (product: Product) => {
    setSyncingItemId(product.id);
    try {
      const res = await syncProductToMercadoLibre(product, config);
      setSyncMap((prev) => ({ ...prev, [product.id]: res }));
      showAlert('success', `✓ Artículo "${product.name}" sincronizado con Mercado Libre (${res.mlItemId}).`);
    } catch (err) {
      showAlert('error', `Error al sincronizar "${product.name}".`);
    } finally {
      setSyncingItemId(null);
    }
  };

  const handleTogglePause = async (product: Product, currentlySynced: boolean) => {
    setSyncingItemId(product.id);
    try {
      if (currentlySynced) {
        const res = await pauseMercadoLibreItem(product.id);
        if (res) {
          setSyncMap((prev) => ({ ...prev, [product.id]: res }));
          showAlert('info', `Publicación de "${product.name}" pausada en Mercado Libre.`);
        }
      } else {
        const res = await reactivateMercadoLibreItem(product.id);
        if (res) {
          setSyncMap((prev) => ({ ...prev, [product.id]: res }));
          showAlert('success', `Publicación de "${product.name}" reactivada con éxito.`);
        }
      }
    } catch (err) {
      showAlert('error', 'Error al modificar estado de publicación.');
    } finally {
      setSyncingItemId(null);
    }
  };

  const handleBulkSync = async () => {
    if (!products.length) return;
    setIsBulkSyncing(true);
    setBulkProgress({ current: 0, total: products.length, currentName: '' });

    try {
      const updatedMap = await syncAllProductsToMercadoLibre(products, (curr, tot, name) => {
        setBulkProgress({ current: curr, total: tot, currentName: name });
      });
      setSyncMap(updatedMap);
      showAlert('success', `🎉 ¡Sincronización masiva completada! ${products.length} artículos conectados a Mercado Libre Chile.`);
    } catch (err) {
      showAlert('error', 'Ocurrió un inconveniente durante la sincronización masiva.');
    } finally {
      setIsBulkSyncing(false);
    }
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const syncInfo = syncMap[p.id];
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (syncInfo?.mlItemId && syncInfo.mlItemId.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === 'all') return true;
    if (statusFilter === 'synced') return syncInfo?.status === 'synced';
    if (statusFilter === 'paused') return syncInfo?.status === 'paused';
    if (statusFilter === 'pending') return !syncInfo || syncInfo.status === 'not_connected' || syncInfo.status === 'pending';

    return true;
  });

  const syncedCount = products.filter((p) => syncMap[p.id]?.status === 'synced').length;
  const pausedCount = products.filter((p) => syncMap[p.id]?.status === 'paused').length;
  const pendingCount = products.length - (syncedCount + pausedCount);

  return (
    <div className="space-y-6">
      {/* Alert Notification Toast */}
      {actionAlert && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between border-2 animate-in fade-in slide-in-from-top-2 duration-200 text-xs font-black shadow-md ${
            actionAlert.type === 'success'
              ? 'bg-emerald-50 text-emerald-950 border-emerald-300'
              : actionAlert.type === 'info'
              ? 'bg-blue-50 text-blue-950 border-blue-300'
              : 'bg-rose-50 text-rose-950 border-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionAlert.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : actionAlert.type === 'info' ? (
              <Sparkles className="w-5 h-5 text-blue-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{actionAlert.message}</span>
          </div>
          <button
            onClick={() => setActionAlert(null)}
            className="p-1 hover:bg-black/5 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Banner */}
      <div className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 rounded-3xl p-6 text-slate-950 shadow-xl border-2 border-yellow-300 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/50 backdrop-blur-md flex items-center justify-center border-2 border-white/70 shadow-inner shrink-0">
            <ShoppingBag className="w-9 h-9 text-slate-950" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                Conexión de Artículos Mercado Libre Chile (MLC)
              </h3>
              <span className="bg-slate-950 text-yellow-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-xs">
                API Oficial REST v2
              </span>
            </div>
            <p className="text-xs text-slate-900 font-medium mt-1 max-w-2xl leading-relaxed">
              Publica, actualiza precios, sincroniza stock y administra las publicaciones de ropa artesanal a la medida directamente en tu cuenta de vendedor de <strong>Mercado Libre Chile</strong>.
            </p>
          </div>
        </div>

        {/* Action Controls in Header */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <button
            type="button"
            onClick={() => setIsConfigOpen(!isConfigOpen)}
            className="flex-1 lg:flex-initial bg-white/80 hover:bg-white text-slate-900 text-xs font-black px-4 py-3 rounded-2xl border border-white/60 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Sliders className="w-4 h-4 text-amber-700" />
            <span>{isConfigOpen ? 'Ocultar Credenciales' : 'Ajustes API'}</span>
            {isConfigOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <button
            type="button"
            disabled={isBulkSyncing}
            onClick={handleBulkSync}
            className="flex-1 lg:flex-initial bg-slate-950 hover:bg-slate-800 text-yellow-400 text-xs font-black px-5 py-3 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isBulkSyncing ? 'animate-spin' : ''}`} />
            <span>{isBulkSyncing ? 'Sincronizando...' : 'Sincronizar Todo el Catálogo'}</span>
          </button>
        </div>
      </div>

      {/* Progress bar during bulk sync */}
      {isBulkSyncing && (
        <div className="bg-white rounded-2xl p-4 border-2 border-yellow-300 shadow-md space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-black text-slate-800">
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
              Sincronizando catálogo con la API de Mercado Libre...
            </span>
            <span className="font-mono text-amber-700">
              {bulkProgress.current} / {bulkProgress.total} ({Math.round((bulkProgress.current / bulkProgress.total) * 100)}%)
            </span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 transition-all duration-300 rounded-full"
              style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
            />
          </div>
          {bulkProgress.currentName && (
            <p className="text-[11px] text-slate-500 font-bold truncate">
              Publicando: <span className="text-slate-800">{bulkProgress.currentName}</span>
            </p>
          )}
        </div>
      )}

      {/* Expandable Configuration & Credentials Form */}
      {isConfigOpen && (
        <div className="bg-white rounded-3xl p-6 border-2 border-yellow-200 shadow-md space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-600" />
              <h4 className="font-black text-slate-900 text-base">Credenciales &amp; Parámetros API Mercado Libre</h4>
            </div>
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTestingConnection}
              className="bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-black px-3.5 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingConnection ? 'animate-spin' : ''}`} />
              <span>{isTestingConnection ? 'Probando...' : 'Probar Conexión'}</span>
            </button>
          </div>

          {testResult && (
            <div
              className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center gap-2.5 ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-rose-50 border-rose-300 text-rose-950'
              }`}
            >
              {testResult.success ? (
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <div className="space-y-0.5">
                <p>{testResult.message}</p>
                {testResult.sellerInfo && (
                  <p className="text-[11px] font-mono text-emerald-800">
                    Vendedor: <strong>{testResult.sellerInfo.nickname}</strong> • ID: {testResult.sellerInfo.id} • Reputación: {testResult.sellerInfo.seller_reputation}
                  </p>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                  App ID (Client ID) *
                </label>
                <input
                  type="text"
                  required
                  value={config.appId}
                  onChange={(e) => setConfig({ ...config, appId: e.target.value })}
                  placeholder="Ej. 7829104829104829"
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-amber-500 rounded-xl p-3 text-xs font-mono font-bold text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                  Seller ID / User ID *
                </label>
                <input
                  type="text"
                  required
                  value={config.sellerId}
                  onChange={(e) => setConfig({ ...config, sellerId: e.target.value })}
                  placeholder="Ej. 781053984"
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-amber-500 rounded-xl p-3 text-xs font-mono font-bold text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                  Sitio Regional Mercado Libre
                </label>
                <input
                  type="text"
                  disabled
                  value="MLC (Mercado Libre Chile - CLP)"
                  className="w-full bg-slate-100 border-2 border-slate-200 rounded-xl p-3 text-xs font-black text-slate-600 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                Access Token (Bearer Authorization) *
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={config.accessToken}
                  onChange={(e) => setConfig({ ...config, accessToken: e.target.value })}
                  placeholder="APP_USR-xxxxxxxxxxxxxxxxxxxx-xxxxxx-xxxxxxxxxxxxxxxx-xxxxxxxx"
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-amber-500 rounded-xl p-3 pr-10 text-xs font-mono font-bold text-slate-900 outline-none"
                />
                <Key className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
              </div>
              <p className="text-[10px] text-slate-400 font-medium mt-1">
                Obtén tus credenciales API en <a href="https://developers.mercadolibre.cl" target="_blank" rel="noreferrer" className="text-amber-700 underline font-bold">developers.mercadolibre.cl</a>.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div>
                <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                  Tipo de Publicación
                </label>
                <select
                  value={config.listingType}
                  onChange={(e) => setConfig({ ...config, listingType: e.target.value as any })}
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-amber-500 rounded-xl p-2.5 text-xs font-bold text-slate-900 outline-none"
                >
                  <option value="gold_special">Clásica (Mayor Exposición, menor comisión)</option>
                  <option value="gold_pro">Premium (Hasta 6 y 12 cuotas sin interés)</option>
                  <option value="gold_premium">Gold Premium</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                  Modo de Envíos
                </label>
                <select
                  value={config.shippingMode}
                  onChange={(e) => setConfig({ ...config, shippingMode: e.target.value as any })}
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-amber-500 rounded-xl p-2.5 text-xs font-bold text-slate-900 outline-none"
                >
                  <option value="me2">Mercado Envíos Chile (ME2 Colecta/Dropoff)</option>
                  <option value="custom">Envíos por pagar (Starken/Blue Express)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                  Umbral Envío Gratis (CLP)
                </label>
                <input
                  type="number"
                  value={config.freeShippingThreshold}
                  onChange={(e) => setConfig({ ...config, freeShippingThreshold: Number(e.target.value) })}
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-amber-500 rounded-xl p-2.5 text-xs font-mono font-bold text-slate-900 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-xs font-black text-slate-900 block">Sincronización Automática</span>
                  <span className="text-[10px] text-slate-500">Actualiza Mercado Libre al cambiar precio o stock</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.autoSync}
                  onChange={(e) => setConfig({ ...config, autoSync: e.target.checked })}
                  className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-xs font-black text-slate-900 block">Permitir Retiro en Taller</span>
                  <span className="text-[10px] text-slate-500">Retiro presencial en Los Silos, Rengo</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.allowLocalPickup}
                  onChange={(e) => setConfig({ ...config, allowLocalPickup: e.target.checked })}
                  className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsConfigOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Guardar Configuración</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">
            Catálogo Total
          </span>
          <span className="text-2xl font-black text-slate-900">{products.length}</span>
          <p className="text-[10px] text-slate-500 font-bold">Artículos en taller</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-black tracking-wider text-emerald-600 block">
            Sincronizados
          </span>
          <span className="text-2xl font-black text-emerald-700">{syncedCount}</span>
          <p className="text-[10px] text-emerald-600 font-bold">Activos en Mercado Libre</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-black tracking-wider text-amber-600 block">
            Pausados
          </span>
          <span className="text-2xl font-black text-amber-700">{pausedCount}</span>
          <p className="text-[10px] text-amber-600 font-bold">Sin stock temporal</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-black tracking-wider text-blue-600 block">
            Pendientes
          </span>
          <span className="text-2xl font-black text-blue-700">{pendingCount}</span>
          <p className="text-[10px] text-blue-600 font-bold">Listos para publicar</p>
        </div>
      </div>

      {/* Products Table with Mercado Libre Status & Controls */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5 sm:p-6">
        {/* Filters and Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre o ID MLC..."
              className="w-full bg-slate-50 border-2 border-slate-200 focus:border-amber-500 rounded-xl pl-10 pr-4 py-2 text-xs font-bold text-slate-800 outline-none transition-colors"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({products.length})
            </button>
            <button
              onClick={() => setStatusFilter('synced')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                statusFilter === 'synced' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Activos ({syncedCount})
            </button>
            <button
              onClick={() => setStatusFilter('paused')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                statusFilter === 'paused' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pausados ({pausedCount})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                statusFilter === 'pending' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pendientes ({pendingCount})
            </button>
          </div>

          {/* Export buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => exportMercadoLibreJSON(products)}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
              title="Exportar archivo JSON para API de Mercado Libre"
            >
              <FileCode className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">JSON</span>
            </button>

            <button
              type="button"
              onClick={() => exportMercadoLibreCSV(products)}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
              title="Descargar planilla CSV masiva para Mercado Libre"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Planilla CSV</span>
            </button>
          </div>
        </div>

        {/* Table of Articles */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 uppercase font-black border-b border-slate-200">
                <th className="p-3.5 rounded-l-xl">Prenda / Artículo</th>
                <th className="p-3.5">Categoría MLC</th>
                <th className="p-3.5">Precio CLP</th>
                <th className="p-3.5">Stock</th>
                <th className="p-3.5">ID Mercado Libre</th>
                <th className="p-3.5">Estado API</th>
                <th className="p-3.5">Última Sincro</th>
                <th className="p-3.5 rounded-r-xl text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 font-bold">
                    No se encontraron artículos con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const syncInfo = syncMap[product.id];
                  const isSynced = syncInfo?.status === 'synced';
                  const isPaused = syncInfo?.status === 'paused';
                  const isBusy = syncingItemId === product.id;

                  return (
                    <tr key={product.id} className="hover:bg-amber-50/30 transition-colors group">
                      {/* Product details */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 shadow-xs"
                          />
                          <div>
                            <p className="font-black text-slate-900 line-clamp-1">{product.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold">
                              {product.category} • Tallas: {product.sizes?.join(', ') || 'A la medida'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* MLC Category */}
                      <td className="p-3.5">
                        <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold border border-slate-200">
                          MLC1071 (Perros)
                        </span>
                      </td>

                      {/* Price */}
                      <td className="p-3.5 font-mono font-black text-slate-900 text-sm">
                        ${product.price.toLocaleString('es-CL')}
                      </td>

                      {/* Stock */}
                      <td className="p-3.5">
                        <span
                          className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md ${
                            (product.stock || 10) <= 2
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {product.stock || 10} un.
                        </span>
                      </td>

                      {/* Mercado Libre ID */}
                      <td className="p-3.5 font-mono text-[11px] font-black text-blue-700">
                        {syncInfo?.mlItemId ? (
                          <div className="flex items-center gap-1">
                            <span>{syncInfo.mlItemId}</span>
                            {syncInfo.permalink && (
                              <a
                                href={syncInfo.permalink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-amber-600 hover:text-amber-700 p-0.5 rounded hover:bg-amber-100 transition-colors"
                                title="Abrir en Mercado Libre Chile"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 font-normal">Sin publicar</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        {isSynced ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 text-[10px] font-black px-2.5 py-1 rounded-full border border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Publicado</span>
                          </span>
                        ) : isPaused ? (
                          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 text-[10px] font-black px-2.5 py-1 rounded-full border border-amber-300">
                            <PauseCircle className="w-3.5 h-3.5 text-amber-600" />
                            <span>Pausado</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-full">
                            <span>No Conectado</span>
                          </span>
                        )}
                      </td>

                      {/* Last Sync */}
                      <td className="p-3.5 text-[10px] text-slate-500 font-medium">
                        {syncInfo?.lastSync ? (
                          <span title={syncInfo.lastSync}>
                            {new Date(syncInfo.lastSync).toLocaleTimeString('es-CL', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })} ({new Date(syncInfo.lastSync).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })})
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Inspect JSON */}
                          <button
                            type="button"
                            onClick={() => setInspectPayloadProduct(product)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Ver JSON Payload para la API"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Pause / Reactivate */}
                          {(isSynced || isPaused) && (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleTogglePause(product, isSynced)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                isSynced
                                  ? 'text-amber-600 hover:bg-amber-100'
                                  : 'text-emerald-600 hover:bg-emerald-100'
                              }`}
                              title={isSynced ? 'Pausar en Mercado Libre' : 'Reactivar en Mercado Libre'}
                            >
                              {isSynced ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                            </button>
                          )}

                          {/* Sync / Publish */}
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleSyncSingleProduct(product)}
                            className="bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black text-[11px] px-3 py-1.5 rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer active:scale-95 disabled:opacity-50"
                          >
                            <RefreshCw className={`w-3 h-3 ${isBusy ? 'animate-spin' : ''}`} />
                            <span>{isSynced ? 'Actualizar' : 'Publicar'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* JSON Payload Modal Inspector */}
      {inspectPayloadProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border-2 border-yellow-300 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-amber-600" />
                <div>
                  <h4 className="font-black text-slate-900 text-sm">
                    Payload API Mercado Libre: {inspectPayloadProduct.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono">
                    POST https://api.mercadolibre.com/items
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectPayloadProduct(null)}
                className="p-1.5 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-950 p-4 rounded-2xl font-mono text-xs text-yellow-300 border border-slate-800">
              <pre>{JSON.stringify(formatProductForMercadoLibre(inspectPayloadProduct, config), null, 2)}</pre>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-500 font-medium">
                Listo para enviar mediante cURL o Postman a Mercado Libre Chile (MLC).
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(
                    JSON.stringify(formatProductForMercadoLibre(inspectPayloadProduct, config), null, 2)
                  );
                  setCopiedPayload(true);
                  setTimeout(() => setCopiedPayload(false), 2000);
                }}
                className="bg-slate-900 hover:bg-slate-800 text-yellow-400 font-black text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {copiedPayload ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedPayload ? '¡Copiado!' : 'Copiar Payload JSON'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Logs Table */}
      <div className="bg-slate-50 rounded-3xl p-5 border border-slate-200 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <h5 className="font-black text-slate-800 text-xs uppercase tracking-wider">
              Historial de Sincronizaciones &amp; Logs de la API
            </h5>
          </div>
          <button
            type="button"
            onClick={() => clearMercadoLibreLogs()}
            className="text-[11px] font-bold text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            Limpiar Registro
          </button>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {logs.length === 0 ? (
            <p className="text-xs text-slate-400 font-medium py-3 text-center">
              No hay registros recientes de la API de Mercado Libre.
            </p>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs flex items-start justify-between gap-3 shadow-2xs"
              >
                <div className="flex items-start gap-2">
                  <span
                    className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      log.status === 'success'
                        ? 'bg-emerald-500'
                        : log.status === 'warning'
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                  />
                  <div>
                    <p className="text-slate-800 font-medium leading-relaxed">{log.details}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 font-mono">
                      <span>Acción: <strong>{log.action}</strong></span>
                      {log.mlItemId && <span>• ID: <strong>{log.mlItemId}</strong></span>}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-mono shrink-0 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleTimeString('es-CL', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
