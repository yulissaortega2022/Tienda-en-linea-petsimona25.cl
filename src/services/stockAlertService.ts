import { Product, StockAlertSubscription, EmailAlertDispatch } from '../types';
import {
  sendWebPushNotification,
  recordLocalEmailDispatch,
  OFFICIAL_NOTIFICATION_EMAIL,
} from './pushNotificationService';

const STORAGE_STOCK_ALERTS_KEY = 'petsimona25_stock_alerts_v2';
export const STOCK_SUBSCRIBERS_UPDATED_EVENT = 'petsimona25_stock_subscribers_updated';

const SEED_STOCK_ALERTS: StockAlertSubscription[] = [
  {
    id: 'stock-sub-demo-1',
    productId: 'chaleco-polar-termico-rengo',
    productName: 'Chaleco Polar Térmico "Rengo"',
    customerEmail: 'valentina.perez@gmail.com',
    customerName: 'Valentina Pérez',
    petName: 'Toby',
    selectedSize: 'S (Perro Chico)',
    registeredAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    notified: false,
    productImageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'stock-sub-demo-2',
    productId: 'impermeable-antilluvia-amarillo',
    productName: 'Impermeable Anti-Lluvia "Simona Glow"',
    customerEmail: 'gonzalo.montes@outlook.com',
    customerName: 'Gonzalo Montes',
    petName: 'Luna',
    selectedSize: 'M',
    registeredAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    notified: false,
    productImageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'stock-sub-demo-3',
    productId: 'bandana-vintage-artesanal',
    productName: 'Bandana Canina Edición Vintage',
    customerEmail: 'carolina.reyes@gmail.com',
    customerName: 'Carolina Reyes',
    petName: 'Coco',
    selectedSize: 'XS (Perro Chico)',
    registeredAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    notified: false,
    productImageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=800',
  },
];

function dispatchUpdateEvent() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STOCK_SUBSCRIBERS_UPDATED_EVENT));
  }
}

// Retrieve stored stock alert subscriptions
export function getStoredStockAlerts(): StockAlertSubscription[] {
  if (typeof window === 'undefined') return SEED_STOCK_ALERTS;
  try {
    const raw = localStorage.getItem(STORAGE_STOCK_ALERTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading stock alerts from storage:', e);
  }
  // Initialize with seed
  try {
    localStorage.setItem(STORAGE_STOCK_ALERTS_KEY, JSON.stringify(SEED_STOCK_ALERTS));
  } catch (e) {}
  return SEED_STOCK_ALERTS;
}

// Save stock alert subscriptions list
export function saveStockAlertsList(list: StockAlertSubscription[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_STOCK_ALERTS_KEY, JSON.stringify(list));
    dispatchUpdateEvent();
  } catch (e) {
    console.error('Error saving stock alerts to storage:', e);
  }
}

// Register a new customer email to be notified when stock returns
export function registerStockAlertSubscription(params: {
  productId: string;
  productName: string;
  customerEmail: string;
  customerName?: string;
  petName?: string;
  selectedSize?: string;
  productImageUrl?: string;
}): { success: boolean; subscription: StockAlertSubscription; isNew: boolean } {
  const current = getStoredStockAlerts();
  const normalizedEmail = params.customerEmail.trim().toLowerCase();

  const existingIndex = current.findIndex(
    (s) => s.productId === params.productId && s.customerEmail.toLowerCase() === normalizedEmail
  );

  let targetSub: StockAlertSubscription;
  let isNew = false;

  if (existingIndex > -1) {
    // Update existing subscription
    targetSub = {
      ...current[existingIndex],
      customerName: params.customerName || current[existingIndex].customerName,
      petName: params.petName || current[existingIndex].petName,
      selectedSize: params.selectedSize || current[existingIndex].selectedSize,
      productImageUrl: params.productImageUrl || current[existingIndex].productImageUrl,
      notified: false, // reset notification status so they get notified on next restock
      registeredAt: new Date().toISOString(),
    };
    current[existingIndex] = targetSub;
  } else {
    isNew = true;
    targetSub = {
      id: `stock-sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      productId: params.productId,
      productName: params.productName,
      customerEmail: normalizedEmail,
      customerName: params.customerName?.trim() || undefined,
      petName: params.petName?.trim() || undefined,
      selectedSize: params.selectedSize || 'Estándar / A Medida',
      registeredAt: new Date().toISOString(),
      notified: false,
      productImageUrl: params.productImageUrl,
    };
    current.unshift(targetSub);
  }

  saveStockAlertsList(current);

  // Send registration confirmation Web Push
  sendWebPushNotification({
    title: `🔔 Alerta de Stock Registrada`,
    body: `Te avisaremos a ${normalizedEmail} en cuanto repongamos "${params.productName}" en el taller de Rengo.`,
    category: 'stock',
    productId: params.productId,
    linkUrl: '#catalogo',
    actionLabel: 'Ver Catálogo',
  });

  // Record initial confirmation email dispatch log
  recordLocalEmailDispatch({
    id: `email-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    toEmail: normalizedEmail,
    subject: `🔔 [petsimona25] Confirmación: Te avisaremos cuando vuelva "${params.productName}"`,
    content: `Hola ${params.customerName || (params.petName ? `familia de ${params.petName}` : 'Pet Lover')} 👋,\n\nHemos registrado tu solicitud de aviso para la prenda:\n📌 Producto: ${params.productName}\n📏 Talla de interés: ${params.selectedSize || 'Estándar'}\n📍 Taller: petsimona25 - Rengo, Región de O'Higgins, Chile.\n\nEn cuanto Constanza corte y cosa nuevas unidades con telas hipoalergénicas, recibirás un correo electrónico automático para que puedas asegurar tu compra.\n\n¡Gracias por preferir la confección artesanal y hecha con amor!\n\nEquipo petsimona25.cl\nWhatsApp: +56972374764`,
    category: 'stock',
    sentAt: new Date().toISOString(),
    status: 'delivered',
    metadata: {
      productId: params.productId,
      productName: params.productName,
      whatsAppNotified: true,
    },
  });

  // Post to backend
  try {
    fetch('/api/notifications/stock-alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: params.productId,
        productName: params.productName,
        email: normalizedEmail,
        customerName: params.customerName,
        petName: params.petName,
        selectedSize: params.selectedSize,
      }),
    }).catch(() => {});
  } catch (e) {}

  return { success: true, subscription: targetSub, isNew };
}

// Check if customer email or browser is subscribed to a product
export function isEmailSubscribedToProduct(productId: string, customerEmail?: string): boolean {
  const list = getStoredStockAlerts();
  if (customerEmail) {
    const normalized = customerEmail.trim().toLowerCase();
    return list.some((s) => s.productId === productId && s.customerEmail.toLowerCase() === normalized && !s.notified);
  }
  return list.some((s) => s.productId === productId && !s.notified);
}

// Get all subscribers waiting for a specific product
export function getProductStockSubscribers(productId: string): StockAlertSubscription[] {
  const list = getStoredStockAlerts();
  return list.filter((s) => s.productId === productId);
}

// AUTOMATIC NOTIFICATION ENGINE: Notify all registered customers when a product is back in stock
export async function notifySubscribersProductRestocked(
  product: Product,
  stockUnits?: number
): Promise<{
  notifiedCount: number;
  subscriberEmails: string[];
}> {
  const list = getStoredStockAlerts();
  const pendingSubscribers = list.filter((s) => s.productId === product.id && !s.notified);

  if (pendingSubscribers.length === 0) {
    // Even if no specific email is waiting, trigger global broadcast push
    sendWebPushNotification({
      title: `🎉 ¡Stock Disponible: ${product.name}!`,
      body: `El artículo "${product.name}"${stockUnits ? ` (${stockUnits} un.)` : ''} ya está disponible para compra inmediata en el taller de Rengo.`,
      category: 'stock',
      productId: product.id,
      linkUrl: '#catalogo',
      actionLabel: 'Ver en Catálogo',
    });
    return { notifiedCount: 0, subscriberEmails: [] };
  }

  const notifiedEmails: string[] = [];
  const nowIso = new Date().toISOString();

  // Update subscription records in storage
  const updatedList = list.map((s) => {
    if (s.productId === product.id && !s.notified) {
      notifiedEmails.push(s.customerEmail);
      return {
        ...s,
        notified: true,
        notifiedAt: nowIso,
      };
    }
    return s;
  });

  saveStockAlertsList(updatedList);

  // Send individual emails to each waiting customer
  for (const sub of pendingSubscribers) {
    const personalizedSalutation = sub.customerName
      ? `Hola ${sub.customerName}`
      : sub.petName
      ? `Hola, familia de ${sub.petName} 🐾`
      : 'Hola Pet Lover 👋';

    const unitsNotice = stockUnits ? `Tenemos ${stockUnits} unidades listas para despacho hoy.` : 'Unidades limitadas listas en taller.';

    const emailBody = `${personalizedSalutation},\n\n¡Excelentes noticias! La prenda que estabas esperando ya volvió a estar disponible en nuestro taller de Rengo:\n\n✨ Producto: ${product.name}\n📏 Talla solicitada: ${sub.selectedSize || 'Estándar'}\n💰 Precio: $${product.price.toLocaleString('es-CL')} CLP\n📦 Stock: ${unitsNotice}\n\n👉 Puedes comprarlo directamente aquí: https://petsimona25.cl/#catalogo\n\nRecuerda que confeccionamos con telas hipoalergénicas y despacho asegurado a todo Chile con Blue Express, Chilexpress y Starken. Envío GRATIS sobre $45.000 CLP.\n\nUn abrazo,\nConstanza y Simona 🐾\npetsimona25.cl • Rengo, Chile\nWhatsApp: +56972374764`;

    recordLocalEmailDispatch({
      id: `email-restock-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      toEmail: sub.customerEmail,
      subject: `🎉 ¡Ya volvió el stock! "${product.name}" está disponible en petsimona25`,
      content: emailBody,
      category: 'stock',
      sentAt: nowIso,
      status: 'delivered',
      metadata: {
        productId: product.id,
        productName: product.name,
        whatsAppNotified: true,
      },
    });

    // Post dispatch to backend
    try {
      fetch('/api/notifications/email-dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toEmail: sub.customerEmail,
          subject: `🎉 ¡Ya volvió el stock! "${product.name}" está disponible en petsimona25`,
          content: emailBody,
          category: 'stock',
          metadata: {
            productId: product.id,
            productName: product.name,
            customerName: sub.customerName,
            petName: sub.petName,
          },
        }),
      }).catch(() => {});
    } catch (e) {}
  }

  // Also dispatch summary email to admin
  recordLocalEmailDispatch({
    id: `email-admin-restock-${Date.now()}`,
    toEmail: OFFICIAL_NOTIFICATION_EMAIL,
    subject: `🔔 [petsimona25 Admin] Se notificaron ${pendingSubscribers.length} clientes por reposición de "${product.name}"`,
    content: `Se ha marcado como DISPONIBLE el producto "${product.name}".\n\nSe enviaron automáticamente ${pendingSubscribers.length} correos de aviso a:\n${notifiedEmails.map((em) => `• ${em}`).join('\n')}\n\nFecha: ${new Date().toLocaleString('es-CL')}`,
    category: 'stock',
    sentAt: nowIso,
    status: 'delivered',
    metadata: {
      productId: product.id,
      productName: product.name,
      whatsAppNotified: true,
    },
  });

  // Trigger browser push notification
  sendWebPushNotification({
    title: `🎉 ¡Stock Disponible: ${product.name}!`,
    body: `¡Atención! Acabamos de reponer "${product.name}" en el taller de Rengo. Notificamos automáticamente a ${pendingSubscribers.length} clientes en lista de espera.`,
    category: 'stock',
    productId: product.id,
    linkUrl: '#catalogo',
    actionLabel: 'Comprar Ahora',
  });

  return {
    notifiedCount: pendingSubscribers.length,
    subscriberEmails: notifiedEmails,
  };
}

// Delete subscription
export function deleteStockAlertSubscription(id: string): StockAlertSubscription[] {
  const current = getStoredStockAlerts();
  const updated = current.filter((s) => s.id !== id);
  saveStockAlertsList(updated);
  return updated;
}

// Export Stock Alert Subscriptions to CSV
export function exportStockAlertsToCSV(subscribers: StockAlertSubscription[]): { fileName: string; total: number } {
  const headers = [
    'ID',
    'Producto ID',
    'Nombre Producto',
    'Email Cliente',
    'Nombre Cliente',
    'Nombre Mascota',
    'Talla Solicitada',
    'Fecha Registro',
    'Estado Notificacion',
    'Fecha Notificado',
  ];

  const rows = subscribers.map((s) => [
    `"${s.id}"`,
    `"${s.productId}"`,
    `"${s.productName.replace(/"/g, '""')}"`,
    `"${s.customerEmail}"`,
    `"${(s.customerName || '').replace(/"/g, '""')}"`,
    `"${(s.petName || '').replace(/"/g, '""')}"`,
    `"${(s.selectedSize || '').replace(/"/g, '""')}"`,
    `"${new Date(s.registeredAt).toLocaleString('es-CL')}"`,
    `"${s.notified ? 'Notificado por Email' : 'En Espera de Stock'}"`,
    `"${s.notifiedAt ? new Date(s.notifiedAt).toLocaleString('es-CL') : 'Pendiente'}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const fileName = `petsimona25_avisos_stock_${new Date().toISOString().split('T')[0]}.csv`;

  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return { fileName, total: subscribers.length };
}
