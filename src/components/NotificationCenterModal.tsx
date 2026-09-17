import React, { useState, useEffect } from 'react';
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Trash2,
  ExternalLink,
  Sparkles,
  Tag,
  Truck,
  PackageCheck,
  Settings,
  Volume2,
  VolumeX,
  ShieldCheck,
  AlertCircle,
  Copy,
  ArrowRight,
  Send,
  Zap
} from 'lucide-react';
import { PushNotificationItem, PushNotificationCategory, PushNotificationPreferences } from '../types';
import {
  getStoredNotifications,
  saveStoredNotifications,
  getPushPreferences,
  savePushPreferences,
  getBrowserPushPermission,
  requestBrowserPushPermission,
  sendWebPushNotification,
  broadcastPromotionPush,
  broadcastStockRestockedPush,
  subscribeNotificationEvents
} from '../services/pushNotificationService';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTracking?: (orderNumber?: string) => void;
  onSelectProduct?: (productId?: string) => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  onOpenTracking,
  onSelectProduct,
}) => {
  const [notifications, setNotifications] = useState<PushNotificationItem[]>(getStoredNotifications());
  const [preferences, setPreferences] = useState<PushNotificationPreferences>(getPushPreferences());
  const [activeCategory, setActiveCategory] = useState<'todas' | PushNotificationCategory>('todas');
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(getBrowserPushPermission());
  const [showSettings, setShowSettings] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  useEffect(() => {
    setNotifications(getStoredNotifications());
    setPreferences(getPushPreferences());
    setPermissionStatus(getBrowserPushPermission());

    const unsubscribe = subscribeNotificationEvents((updated) => {
      setNotifications(updated);
    });

    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (activeCategory === 'todas') return true;
    return n.category === activeCategory;
  });

  const handleRequestPermission = async () => {
    setIsRequestingPermission(true);
    try {
      const res = await requestBrowserPushPermission();
      setPermissionStatus(res);
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const handleMarkAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updated);
    saveStoredNotifications(updated);
  };

  const handleMarkAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    saveStoredNotifications(updated);
  };

  const handleClearAll = () => {
    setNotifications([]);
    saveStoredNotifications([]);
  };

  const handleTogglePreference = (key: keyof PushNotificationPreferences) => {
    const updated = { ...preferences, [key]: !preferences[key] };
    setPreferences(updated);
    savePushPreferences(updated);
  };

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2500);
  };

  const handleSendTestPush = () => {
    sendWebPushNotification({
      title: '🔔 ¡Prueba de Notificación Web Push!',
      body: 'El servicio de notificaciones en tiempo real de petsimona25 está funcionando al 100%.',
      category: 'sistema',
      linkUrl: '#catalogo',
      actionLabel: 'Ver Catálogo',
    });
  };

  const getCategoryBadge = (category: PushNotificationCategory) => {
    switch (category) {
      case 'promocion':
        return {
          label: 'Promoción',
          color: 'bg-amber-100 text-amber-900 border-amber-300',
          icon: Tag,
        };
      case 'stock':
        return {
          label: 'Stock Disponible',
          color: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          icon: PackageCheck,
        };
      case 'pedido':
        return {
          label: 'Pedido en Vivo',
          color: 'bg-blue-100 text-blue-900 border-blue-300',
          icon: Truck,
        };
      case 'sistema':
      default:
        return {
          label: 'Sistema',
          color: 'bg-slate-100 text-slate-900 border-slate-300',
          icon: Bell,
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border-2 border-orange-300 relative my-6 max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 border-b-4 border-orange-500 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-md">
                <Bell className="w-6 h-6" />
              </div>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white tracking-tight">
                  Centro de Notificaciones Push 🔔
                </h3>
                <span className="bg-orange-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                  Web Push
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Alertas en tiempo real de promociones, reposición de stock y pedidos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                showSettings
                  ? 'bg-orange-500 text-white border-orange-400'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-700'
              }`}
              title="Configurar preferencias de notificaciones"
            >
              <Settings className="w-5 h-5" />
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Browser Push Permission Banner */}
        <div className="bg-slate-100 border-b border-slate-200 p-3 sm:px-5 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 text-xs text-slate-700 w-full sm:w-auto">
            {permissionStatus === 'granted' ? (
              <span className="flex items-center gap-1.5 text-emerald-800 font-black bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Web Push del Navegador: ACTIVO ✅</span>
              </span>
            ) : permissionStatus === 'denied' ? (
              <span className="flex items-center gap-1.5 text-amber-800 font-bold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Permiso bloqueado en el navegador (Actívalo en tu barra de URL)</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-slate-700 font-bold">
                <Zap className="w-4 h-4 text-orange-500 shrink-0" />
                <span>Recibe avisos de pedidos y ofertas aunque cierres la pestaña</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {permissionStatus !== 'granted' && (
              <button
                type="button"
                onClick={handleRequestPermission}
                disabled={isRequestingPermission}
                className="bg-orange-500 hover:bg-orange-600 text-white font-black text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>{isRequestingPermission ? 'Activando...' : 'Activar Web Push 🔔'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSendTestPush}
              className="bg-slate-900 hover:bg-slate-800 text-yellow-300 font-black text-xs px-3 py-1.5 rounded-xl border border-slate-700 transition-all flex items-center gap-1 cursor-pointer"
              title="Probar notificación en tu navegador"
            >
              <Send className="w-3 h-3 text-yellow-400" />
              <span>Probar Alerta</span>
            </button>
          </div>
        </div>

        {/* Settings Drawer (Collapsible) */}
        {showSettings && (
          <div className="bg-amber-50/90 border-b-2 border-amber-200 p-4 sm:p-5 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-orange-600" />
                <span>Preferencias de Alertas Web Push</span>
              </h4>
              <button
                onClick={() => setShowSettings(false)}
                className="text-[11px] text-amber-800 hover:text-amber-950 font-bold underline"
              >
                Ocultar ajustes
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-amber-200 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-orange-500" />
                  <span className="font-bold text-slate-800">Promociones &amp; Cupones</span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.promotions}
                  onChange={() => handleTogglePreference('promotions')}
                  className="w-4 h-4 text-orange-600 rounded-sm focus:ring-orange-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-amber-200 cursor-pointer">
                <div className="flex items-center gap-2">
                  <PackageCheck className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-800">Reposición de Stock</span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.stockAlerts}
                  onChange={() => handleTogglePreference('stockAlerts')}
                  className="w-4 h-4 text-orange-600 rounded-sm focus:ring-orange-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-amber-200 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-slate-800">Seguimiento de Pedidos</span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.orderUpdates}
                  onChange={() => handleTogglePreference('orderUpdates')}
                  className="w-4 h-4 text-orange-600 rounded-sm focus:ring-orange-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-amber-200 cursor-pointer">
                <div className="flex items-center gap-2">
                  {preferences.sound ? (
                    <Volume2 className="w-4 h-4 text-orange-600" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-slate-400" />
                  )}
                  <span className="font-bold text-slate-800">Sonido de Campana</span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.sound}
                  onChange={() => handleTogglePreference('sound')}
                  className="w-4 h-4 text-orange-600 rounded-sm focus:ring-orange-500 cursor-pointer"
                />
              </label>
            </div>
          </div>
        )}

        {/* Category Filters Bar */}
        <div className="p-3 sm:px-5 bg-white border-b border-slate-200 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-black">
            <button
              onClick={() => setActiveCategory('todas')}
              className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                activeCategory === 'todas'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todas ({notifications.length})
            </button>

            <button
              onClick={() => setActiveCategory('promocion')}
              className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1 cursor-pointer ${
                activeCategory === 'promocion'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Promociones</span>
            </button>

            <button
              onClick={() => setActiveCategory('stock')}
              className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1 cursor-pointer ${
                activeCategory === 'stock'
                  ? 'bg-emerald-600 text-white font-black shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <PackageCheck className="w-3.5 h-3.5" />
              <span>Stock</span>
            </button>

            <button
              onClick={() => setActiveCategory('pedido')}
              className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1 cursor-pointer ${
                activeCategory === 'pedido'
                  ? 'bg-blue-600 text-white font-black shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Pedidos</span>
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
                title="Marcar todas como leídas"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Leídas</span>
              </button>
            )}

            {notifications.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-[11px] text-red-600 hover:text-red-800 font-bold flex items-center gap-1 cursor-pointer"
                title="Limpiar todas las notificaciones"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Vaciar</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1 bg-slate-50">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif) => {
              const badge = getCategoryBadge(notif.category);
              const BadgeIcon = badge.icon;

              return (
                <div
                  key={notif.id}
                  onClick={() => handleMarkAsRead(notif.id)}
                  className={`p-4 rounded-2xl border transition-all relative ${
                    notif.read
                      ? 'bg-white border-slate-200 shadow-2xs'
                      : 'bg-orange-50/80 border-orange-300 shadow-xs ring-1 ring-orange-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${badge.color}`}
                      >
                        <BadgeIcon className="w-4 h-4" />
                      </div>

                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${badge.color}`}
                          >
                            {badge.label}
                          </span>

                          <span className="text-[11px] text-slate-400 font-bold">
                            {notif.timestamp}
                          </span>

                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                          )}
                        </div>

                        <h4 className="text-sm font-black text-slate-900">
                          {notif.title}
                        </h4>

                        <p className="text-xs text-slate-600 font-medium leading-relaxed">
                          {notif.body}
                        </p>

                        {/* Interactive contextual action row */}
                        <div className="pt-2 flex items-center gap-2 flex-wrap">
                          {/* Discount coupon copy button */}
                          {notif.discountCode && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyCoupon(notif.discountCode!);
                              }}
                              className="bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-[11px] px-3 py-1 rounded-lg border border-slate-900 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-2xs"
                            >
                              {copiedCoupon === notif.discountCode ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                                  <span>¡Cupón {notif.discountCode} Copiado!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5 text-slate-900" />
                                  <span>Copiar Cupón {notif.discountCode}</span>
                                </>
                              )}
                            </button>
                          )}

                          {/* Order tracking jump button */}
                          {notif.orderNumber && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notif.id);
                                onClose();
                                if (onOpenTracking) {
                                  onOpenTracking(notif.orderNumber);
                                }
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-black text-[11px] px-3 py-1 rounded-lg flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-2xs"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>Rastrear Pedido ({notif.orderNumber})</span>
                            </button>
                          )}

                          {/* Product stock jump button */}
                          {notif.productId && (
                            <a
                              href="#catalogo"
                              onClick={() => {
                                handleMarkAsRead(notif.id);
                                onClose();
                                if (onSelectProduct) {
                                  onSelectProduct(notif.productId);
                                }
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] px-3 py-1 rounded-lg flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-2xs"
                            >
                              <PackageCheck className="w-3.5 h-3.5" />
                              <span>Ver en Catálogo</span>
                            </a>
                          )}

                          {notif.linkUrl && !notif.orderNumber && !notif.productId && (
                            <a
                              href={notif.linkUrl}
                              onClick={() => {
                                handleMarkAsRead(notif.id);
                                onClose();
                              }}
                              className="text-[11px] font-black text-orange-600 hover:text-orange-800 flex items-center gap-1 hover:underline"
                            >
                              <span>{notif.actionLabel || 'Ver más detalles'}</span>
                              <ArrowRight className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {!notif.read && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notif.id);
                        }}
                        className="text-slate-400 hover:text-emerald-600 p-1 cursor-pointer"
                        title="Marcar como leída"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-6 space-y-3">
              <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Bell className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-black text-slate-800">
                No tienes notificaciones en esta sección
              </h4>
              <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
                Aquí aparecerán las alertas automáticas cuando haya promociones especiales, reposición de telas y despacho de tus pedidos.
              </p>
              <button
                type="button"
                onClick={handleSendTestPush}
                className="bg-orange-500 hover:bg-orange-600 text-white font-black text-xs px-4 py-2 rounded-xl transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Generar Alerta de Prueba</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 p-3.5 sm:px-5 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
            <ShieldCheck className="w-4 h-4 text-orange-500" />
            <span>Servicio Web Push oficial de petsimona25.cl</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
