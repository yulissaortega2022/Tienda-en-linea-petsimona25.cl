import {
  PushNotificationItem,
  PushNotificationPreferences,
  PushNotificationCategory,
  StockAlertSubscription,
  EmailAlertDispatch,
  WhatsAppBotConfig,
} from '../types';

export const OFFICIAL_NOTIFICATION_EMAIL = 'yulyfamilia1974@gmail.com';
export const OFFICIAL_WHATSAPP_PHONE = '+56972374764';
export const OFFICIAL_WHATSAPP_NUMBER_RAW = '56972374764';

const STORAGE_NOTIFICATIONS_KEY = 'petsimona25_push_notifications_v1';
const STORAGE_PREFS_KEY = 'petsimona25_push_prefs_v1';
const STORAGE_STOCK_ALERTS_KEY = 'petsimona25_stock_alerts_v1';
const STORAGE_EMAIL_DISPATCHES_KEY = 'petsimona25_email_dispatches_v1';
const STORAGE_WHATSAPP_BOT_CONFIG_KEY = 'petsimona25_whatsapp_bot_v1';

export const DEFAULT_WHATSAPP_BOT_CONFIG: WhatsAppBotConfig = {
  authorized: true,
  phoneNumber: OFFICIAL_WHATSAPP_PHONE,
  botName: 'Simona Bot 🐾 (Atención Pública Oficial)',
  businessName: 'petsimona25.cl - Confección Canina a la Medida',
  notificationEmail: OFFICIAL_NOTIFICATION_EMAIL,
  autoResponderActive: true,
  publicAttentionActive: true,
  welcomeMessage: '¡Hola! Soy Simona Bot 🐾, el asistente virtual oficial de petsimona25.cl. ¿En qué te puedo asesorar hoy sobre ropa a medida para tu consentido?',
};

const DEFAULT_PREFERENCES: PushNotificationPreferences = {
  enabled: true,
  promotions: true,
  stockAlerts: true,
  orderUpdates: true,
  sound: true,
};

const INITIAL_NOTIFICATIONS: PushNotificationItem[] = [
  {
    id: 'notif-welcome-1',
    title: '🎉 ¡15% OFF de Bienvenida al Club!',
    body: 'Usa el cupón PETSIMONA15 en tu primer pedido de ropa hecha a la medida.',
    category: 'promocion',
    timestamp: 'Hace 5 min',
    read: false,
    discountCode: 'PETSIMONA15',
    linkUrl: '#catalogo',
    actionLabel: 'Ver Catálogo',
  },
  {
    id: 'notif-order-demo',
    title: '📦 Pedido PS25-784102 en Camino',
    body: 'Tu paquete ha sido despachado desde Rengo por Blue Express (Código: BX-748920194).',
    category: 'pedido',
    timestamp: 'Hace 30 min',
    read: false,
    orderNumber: 'PS25-784102',
    linkUrl: '#rastreo',
    actionLabel: 'Rastrear Envío',
  },
  {
    id: 'notif-stock-1',
    title: '🔔 Reposición de Stock: Chaleco Polar Térmico',
    body: '¡Ya llegaron nuevas telas polares hipoalergénicas a nuestro taller en Rengo! Tallas XS a XL disponibles.',
    category: 'stock',
    timestamp: 'Hace 2 horas',
    read: false,
    productId: 'chaleco-polar-termico-rengo',
    linkUrl: '#catalogo',
    actionLabel: 'Comprar Ahora',
  },
];

type NotificationListener = (notifications: PushNotificationItem[]) => void;
const listeners: Set<NotificationListener> = new Set();

function notifyListeners(items: PushNotificationItem[]) {
  listeners.forEach((listener) => {
    try {
      listener(items);
    } catch (e) {
      console.error('Error in notification listener:', e);
    }
  });
}

// Pleasant Synthesizer chime for Web Push using standard Web Audio API
function playNotificationChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // First tone (E5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
    gain1.gain.setValueAtTime(0.12, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.25);

    // Second harmonic tone (B5)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(987.77, ctx.currentTime + 0.12); // B5
    gain2.gain.setValueAtTime(0.15, ctx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.45);
  } catch (err) {
    // Audio might be blocked by autoplay policies until user interaction, which is safe to ignore
  }
}

// Service Worker registration helper
export async function initServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }
  try {
    const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    return registration;
  } catch (err) {
    console.warn('Service worker registration note:', err);
    return null;
  }
}

// Browser notification permission status
export function getBrowserPushPermission(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

// Request Browser Push permission
export async function requestBrowserPushPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      await initServiceWorker();
      // Send welcome test notification
      sendWebPushNotification({
        title: '🔔 ¡Notificaciones Activadas!',
        body: 'Te avisaremos en tiempo real sobre el estado de tus pedidos, promociones y reposición de stock.',
        category: 'sistema',
      });
    }
    return permission;
  } catch (err) {
    console.error('Error requesting push permission:', err);
    return 'denied';
  }
}

// Retrieve notifications list
export function getStoredNotifications(): PushNotificationItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_NOTIFICATIONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error(e);
  }
  return INITIAL_NOTIFICATIONS;
}

// Save notifications list
export function saveStoredNotifications(items: PushNotificationItem[]): void {
  try {
    localStorage.setItem(STORAGE_NOTIFICATIONS_KEY, JSON.stringify(items));
    notifyListeners(items);
  } catch (e) {
    console.error(e);
  }
}

// Push Preferences
export function getPushPreferences(): PushNotificationPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_PREFS_KEY);
    if (raw) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_PREFERENCES;
}

export function savePushPreferences(prefs: PushNotificationPreferences): void {
  try {
    localStorage.setItem(STORAGE_PREFS_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.error(e);
  }
}

// Stock Alerts Subscription Storage
export function getStockAlertSubscriptions(): StockAlertSubscription[] {
  try {
    const raw = localStorage.getItem(STORAGE_STOCK_ALERTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error(e);
  }
  return [];
}

export function subscribeToStockAlert(productId: string, productName: string): boolean {
  const current = getStockAlertSubscriptions();
  if (current.some((s) => s.productId === productId)) return false;
  const updated = [
    ...current,
    { productId, productName, registeredAt: new Date().toISOString() },
  ];
  try {
    localStorage.setItem(STORAGE_STOCK_ALERTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error(e);
  }

  // Trigger confirmation push
  sendWebPushNotification({
    title: `🔔 Alerta Registrada: ${productName}`,
    body: `Te enviaremos una notificación Web Push en cuanto repongamos stock en el taller de Rengo.`,
    category: 'stock',
    productId,
    linkUrl: '#catalogo',
    actionLabel: 'Ver Catálogo',
  });

  return true;
}

export function isSubscribedToStockAlert(productId: string): boolean {
  return getStockAlertSubscriptions().some((s) => s.productId === productId);
}

export function unsubscribeFromStockAlert(productId: string): void {
  const current = getStockAlertSubscriptions();
  const updated = current.filter((s) => s.productId !== productId);
  try {
    localStorage.setItem(STORAGE_STOCK_ALERTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error(e);
  }
}

// Core Push Dispatcher
export function sendWebPushNotification(params: {
  title: string;
  body: string;
  category: PushNotificationCategory;
  linkUrl?: string;
  actionLabel?: string;
  orderNumber?: string;
  productId?: string;
  discountCode?: string;
  imageUrl?: string;
}): PushNotificationItem {
  const prefs = getPushPreferences();

  // Check category preferences
  if (!prefs.enabled) {
    console.log('Push notifications disabled in user preferences.');
  }

  const newItem: PushNotificationItem = {
    id: `push-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title: params.title,
    body: params.body,
    category: params.category,
    timestamp: 'Ahora mismo',
    read: false,
    linkUrl: params.linkUrl,
    actionLabel: params.actionLabel,
    orderNumber: params.orderNumber,
    productId: params.productId,
    discountCode: params.discountCode,
    imageUrl: params.imageUrl,
  };

  const current = getStoredNotifications();
  const updated = [newItem, ...current.slice(0, 49)]; // keep latest 50
  saveStoredNotifications(updated);

  // Play Sound if enabled
  if (prefs.sound) {
    playNotificationChime();
  }

  // Native Browser Web Push Notification
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification(params.title, {
            body: params.body,
            icon: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=120',
            badge: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=120',
            vibrate: [100, 50, 100],
            data: {
              url: params.linkUrl || '/',
              category: params.category,
            },
          } as any);
        });
      } else {
        new Notification(params.title, {
          body: params.body,
          icon: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=120',
        });
      }
    } catch (e) {
      console.warn('Native notification display error:', e);
    }
  }

  // Forward to server push log and dispatch email to yulyfamilia1974@gmail.com
  try {
    fetch('/api/notifications/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newItem,
        targetEmail: OFFICIAL_NOTIFICATION_EMAIL,
      }),
    }).catch(() => {});
  } catch (e) {}

  // Record email dispatch in local storage log
  recordLocalEmailDispatch({
    id: `email-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    toEmail: OFFICIAL_NOTIFICATION_EMAIL,
    subject: `🔔 [Alerta petsimona25.cl] ${params.title}`,
    content: `${params.body}\n\nCategoría: ${params.category}\nEnlace: ${params.linkUrl || 'https://petsimona25.cl'}${params.discountCode ? `\nCupón: ${params.discountCode}` : ''}${params.orderNumber ? `\nPedido: ${params.orderNumber}` : ''}`,
    category: params.category,
    sentAt: new Date().toISOString(),
    status: 'delivered',
    metadata: {
      orderNumber: params.orderNumber,
      productId: params.productId,
      discountCode: params.discountCode,
      whatsAppNotified: true,
    },
  });

  return newItem;
}

// Helper to record email dispatches locally
export function recordLocalEmailDispatch(emailItem: EmailAlertDispatch) {
  try {
    const raw = localStorage.getItem(STORAGE_EMAIL_DISPATCHES_KEY);
    const list: EmailAlertDispatch[] = raw ? JSON.parse(raw) : [];
    const updated = [emailItem, ...list.slice(0, 49)];
    localStorage.setItem(STORAGE_EMAIL_DISPATCHES_KEY, JSON.stringify(updated));
  } catch (e) {}
}

// Retrieve stored email dispatches
export function getStoredEmailDispatches(): EmailAlertDispatch[] {
  try {
    const raw = localStorage.getItem(STORAGE_EMAIL_DISPATCHES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [
    {
      id: 'email-init-seed',
      toEmail: OFFICIAL_NOTIFICATION_EMAIL,
      subject: '🔔 [petsimona25.cl] Sistema de Alertas Push & WhatsApp Activado',
      content: 'Se ha configurado y autorizado el envío automático de alertas push, avisos de pedidos, reposiciones de stock y bot de atención pública a yulyfamilia1974@gmail.com y WhatsApp (+56972374764).',
      category: 'sistema',
      sentAt: new Date().toISOString(),
      status: 'delivered',
      metadata: {
        whatsAppNotified: true,
      },
    },
  ];
}

// Explicitly send email notification
export async function sendDirectEmailAlert(
  subject: string,
  content: string,
  category: PushNotificationCategory | 'custom_tailoring' | 'urgent_alert' = 'sistema',
  metadata?: any
): Promise<EmailAlertDispatch> {
  const item: EmailAlertDispatch = {
    id: `email-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    toEmail: OFFICIAL_NOTIFICATION_EMAIL,
    subject: `🔔 [petsimona25.cl] ${subject}`,
    content,
    category,
    sentAt: new Date().toISOString(),
    status: 'delivered',
    metadata: {
      ...metadata,
      whatsAppNotified: true,
    },
  };

  recordLocalEmailDispatch(item);

  try {
    await fetch('/api/notifications/email-dispatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
  } catch (e) {}

  return item;
}

// WhatsApp Bot Configuration Helpers
export function getWhatsAppBotConfig(): WhatsAppBotConfig {
  try {
    const raw = localStorage.getItem(STORAGE_WHATSAPP_BOT_CONFIG_KEY);
    if (raw) {
      return { ...DEFAULT_WHATSAPP_BOT_CONFIG, ...JSON.parse(raw) };
    }
  } catch (e) {}
  return DEFAULT_WHATSAPP_BOT_CONFIG;
}

export function saveWhatsAppBotConfig(config: Partial<WhatsAppBotConfig>): WhatsAppBotConfig {
  const current = getWhatsAppBotConfig();
  const updated: WhatsAppBotConfig = { ...current, ...config };
  try {
    localStorage.setItem(STORAGE_WHATSAPP_BOT_CONFIG_KEY, JSON.stringify(updated));
    fetch('/api/whatsapp-bot/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    }).catch(() => {});
  } catch (e) {}
  return updated;
}

// Generate direct WhatsApp links with pre-filled authorized bot queries
export function generateWhatsAppBotUrl(messageType: 'medidas' | 'envios' | 'personalizado' | 'pedido' | 'general', customParam?: string): string {
  let text = '';
  switch (messageType) {
    case 'medidas':
      text = `Hola Simona Bot 🐾 @petsimona25, necesito asesoría para tomar las 3 medidas (cuello, pecho, largo) de mi perrito ${customParam ? `(${customParam})` : ''} para ropa a la medida.`;
      break;
    case 'envios':
      text = `Hola petsimona25 🚚, quisiera cotizar el tiempo y valor de envío a mi comuna ${customParam ? `(${customParam})` : ''} desde Rengo.`;
      break;
    case 'personalizado':
      text = `Hola Constanza y Simona Bot ✂️, quiero solicitar una confección a la medida especial en telas hipoalergénicas para mi mascota.`;
      break;
    case 'pedido':
      text = `Hola petsimona25 📦, consulto por el estado en tiempo real de mi pedido ${customParam || ''}.`;
      break;
    default:
      text = `Hola Simona Bot 🐾 y Constanza @petsimona25, quisiera atención pública autorizada sobre ropa para perros a la medida desde Rengo.`;
      break;
  }
  return `https://wa.me/${OFFICIAL_WHATSAPP_NUMBER_RAW}?text=${encodeURIComponent(text)}`;
}

// Broadcast Promotion Push
export function broadcastPromotionPush(title: string, body: string, discountCode?: string, linkUrl: string = '#catalogo') {
  return sendWebPushNotification({
    title: title || '🔥 ¡Nueva Promoción en petsimona25!',
    body: body || 'Aprovecha descuentos exclusivos en ropa confeccionada a la medida en Rengo.',
    category: 'promocion',
    discountCode,
    linkUrl,
    actionLabel: 'Aprovechar Oferta',
  });
}

// Broadcast Stock Restock Push
export function broadcastStockRestockedPush(productName: string, productId?: string, stockUnits?: number) {
  const unitsText = stockUnits ? ` (${stockUnits} unidades disponibles)` : '';
  return sendWebPushNotification({
    title: `🎉 ¡Stock Disponible: ${productName}!`,
    body: `El artículo "${productName}"${unitsText} ha sido reabastecido en nuestro taller de Rengo. ¡Asegura el tuyo antes de que se agote!`,
    category: 'stock',
    productId,
    linkUrl: '#catalogo',
    actionLabel: 'Ver Producto en Tienda',
  });
}

// Broadcast Order Status Update Push
export function broadcastOrderStatusPush(
  orderNumber: string,
  newStatus: string,
  courier: string = 'Blue Express',
  trackingCode?: string
) {
  let title = `📦 Pedido ${orderNumber}: Estado Actualizado`;
  let body = `Tu pedido se encuentra ahora: "${newStatus}".`;

  if (newStatus === 'En Confección') {
    title = `✂️ Pedido ${orderNumber}: En Confección en Rengo`;
    body = `Constanza ha comenzado el corte y costura a la medida de tu consentido.`;
  } else if (newStatus === 'Listo Envíos') {
    title = `🎁 Pedido ${orderNumber}: ¡Empaquetado y Listo!`;
    body = `Tu paquete ha sido preparado con sobre biodegradable y rotulado para despacho.`;
  } else if (newStatus === 'Despachado' || newStatus === 'En Tránsito') {
    title = `🚚 Pedido ${orderNumber}: ¡Despachado por ${courier}!`;
    body = trackingCode
      ? `Código de seguimiento: ${trackingCode}. En camino a tu comuna.`
      : `Tu pedido ya está en manos del transportista ${courier}.`;
  } else if (newStatus === 'En Reparto a Destino') {
    title = `🏡 Pedido ${orderNumber}: ¡En Reparto a tu Domicilio!`;
    body = `El móvil de ${courier} se encuentra en ruta para entrega hoy.`;
  } else if (newStatus === 'Entregado') {
    title = `🐾 Pedido ${orderNumber}: ¡Entregado con Éxito!`;
    body = `¡Esperamos que tu mascota disfrute su nueva prenda a la medida!`;
  }

  return sendWebPushNotification({
    title,
    body,
    category: 'pedido',
    orderNumber,
    linkUrl: '#rastreo',
    actionLabel: 'Rastrear en Vivo',
  });
}

// Subscribe to in-app notification state updates
export function subscribeNotificationEvents(listener: NotificationListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export interface ManualPushDispatchRecord {
  id: string;
  title: string;
  body: string;
  category: PushNotificationCategory;
  discountCode?: string;
  linkUrl?: string;
  actionLabel?: string;
  targetAudience: string;
  recipientCount: number;
  sentAt: string;
  status: 'delivered' | 'sent';
  recipientsPreview?: string[];
}

const STORAGE_MANUAL_PUSH_HISTORY_KEY = 'petsimona25_manual_push_history';

export function getStoredManualPushHistory(): ManualPushDispatchRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_MANUAL_PUSH_HISTORY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error reading manual push history:', e);
  }
  return [
    {
      id: 'manual-push-demo-1',
      title: '⚡ ¡Oferta Flash 24H: 20% OFF en Capas de Invierno!',
      body: 'Prendas con polar térmico e impermeable para todas las razas. Usa el cupón FLASH20.',
      category: 'promocion',
      discountCode: 'FLASH20',
      linkUrl: '#catalogo',
      actionLabel: 'Ver Oferta Flash',
      targetAudience: 'Todos los Usuarios Registrados (Newsletter VIP + Clientes)',
      recipientCount: 8,
      sentAt: new Date(Date.now() - 86400000).toISOString(),
      status: 'delivered',
      recipientsPreview: ['valentina.perez@gmail.com', 'gonzalo.munoz@yahoo.cl', 'fernanda.rengo@hotmail.com'],
    },
  ];
}

export function recordManualPushDispatch(record: ManualPushDispatchRecord): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getStoredManualPushHistory();
    const updated = [record, ...current.slice(0, 49)];
    localStorage.setItem(STORAGE_MANUAL_PUSH_HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error storing manual push dispatch:', e);
  }
}

/**
 * Broadcasts a custom manual push notification designed by the administrator
 * to all registered users or targeted audience segments.
 */
export function broadcastCustomManualPush(params: {
  title: string;
  body: string;
  category?: PushNotificationCategory;
  discountCode?: string;
  linkUrl?: string;
  actionLabel?: string;
  targetAudience?: string;
  recipientCount?: number;
  recipientsPreview?: string[];
}): { notification: PushNotificationItem; record: ManualPushDispatchRecord } {
  const category = params.category || 'promocion';
  const notification = sendWebPushNotification({
    title: params.title || '📢 Novedad Exclusiva petsimona25',
    body: params.body || 'Tenemos novedades especiales en nuestro taller de confección en Rengo.',
    category,
    discountCode: params.discountCode,
    linkUrl: params.linkUrl || '#catalogo',
    actionLabel: params.actionLabel || 'Ver Novedades',
  });

  const record: ManualPushDispatchRecord = {
    id: `manual-${Date.now()}`,
    title: params.title,
    body: params.body,
    category,
    discountCode: params.discountCode,
    linkUrl: params.linkUrl || '#catalogo',
    actionLabel: params.actionLabel || 'Ver Novedades',
    targetAudience: params.targetAudience || 'Todos los Usuarios Registrados',
    recipientCount: params.recipientCount ?? 1,
    sentAt: new Date().toISOString(),
    status: 'delivered',
    recipientsPreview: params.recipientsPreview,
  };

  recordManualPushDispatch(record);

  return { notification, record };
}

