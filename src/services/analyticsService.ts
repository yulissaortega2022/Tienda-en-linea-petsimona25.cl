/**
 * Google Analytics 4 (GA4) Tracking Service for petsimona25.cl
 * 
 * Provides robust GA4 initialization, enhanced ecommerce tracking,
 * cart conversion tracking, blog engagement analytics, and real-time event logging.
 */

import { Product, CartItem, CustomOrderItem } from '../types';

export const DEFAULT_GA4_MEASUREMENT_ID = 'G-PETSIMONA25';
const STORAGE_GA4_ID_KEY = 'petsimona25_ga4_measurement_id';
const STORAGE_GA4_LOG_KEY = 'petsimona25_ga4_events_log_v1';

export interface GA4EventLogItem {
  id: string;
  eventName: string;
  params: Record<string, any>;
  timestamp: string;
  measurementId: string;
  status: 'dispatched' | 'simulated';
}

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

// Get configured Measurement ID
export function getGA4MeasurementId(): string {
  try {
    const saved = localStorage.getItem(STORAGE_GA4_ID_KEY);
    if (saved && saved.trim().startsWith('G-')) {
      return saved.trim();
    }
  } catch (e) {}
  return DEFAULT_GA4_MEASUREMENT_ID;
}

// Set custom Measurement ID
export function setGA4MeasurementId(id: string): string {
  const cleanId = id.trim().toUpperCase();
  try {
    localStorage.setItem(STORAGE_GA4_ID_KEY, cleanId);
  } catch (e) {}
  initGA4(cleanId);
  return cleanId;
}

let isInitialized = false;

/**
 * Initialize GA4 by injecting gtag.js script and setting up dataLayer
 */
export function initGA4(customId?: string): boolean {
  if (typeof window === 'undefined') return false;

  const measurementId = customId || getGA4MeasurementId();

  // Setup window.dataLayer and window.gtag
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function gtag() {
      window.dataLayer?.push(arguments);
    };
  }

  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    send_page_view: true,
    page_title: 'petsimona25.cl - Confección Canina a la Medida',
    page_location: window.location.href,
    currency: 'CLP',
  });

  // Check if script tag is already loaded
  const existingScript = document.getElementById('ga4-gtag-script');
  if (!existingScript) {
    const script = document.createElement('script');
    script.id = 'ga4-gtag-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);
  }

  isInitialized = true;
  recordLocalGA4Event('ga4_initialized', {
    measurementId,
    domain: 'petsimona25.cl',
    platform: 'Web & Google Sites Embed',
    timestamp: new Date().toISOString(),
  });

  return true;
}

/**
 * Dispatch generic GA4 event safely
 */
export function sendGA4Event(eventName: string, params: Record<string, any> = {}) {
  const measurementId = getGA4MeasurementId();

  if (typeof window !== 'undefined' && window.gtag) {
    try {
      window.gtag('event', eventName, {
        ...params,
        send_to: measurementId,
      });
    } catch (e) {
      console.warn('[GA4] Event dispatch warning:', e);
    }
  }

  recordLocalGA4Event(eventName, params);
}

/**
 * Record event to in-memory and localStorage debug log
 */
function recordLocalGA4Event(eventName: string, params: Record<string, any>) {
  try {
    const logItem: GA4EventLogItem = {
      id: `ga4-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      eventName,
      params,
      timestamp: new Date().toISOString(),
      measurementId: getGA4MeasurementId(),
      status: typeof window !== 'undefined' && window.gtag ? 'dispatched' : 'simulated',
    };

    const raw = localStorage.getItem(STORAGE_GA4_LOG_KEY);
    const list: GA4EventLogItem[] = raw ? JSON.parse(raw) : [];
    const updated = [logItem, ...list.slice(0, 49)];
    localStorage.setItem(STORAGE_GA4_LOG_KEY, JSON.stringify(updated));

    // Dispatch window custom event for real-time reactive UI listeners
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('petsimona25_ga4_event_logged', { detail: logItem }));
    }
  } catch (e) {}
}

/**
 * Get all stored GA4 debug events
 */
export function getStoredGA4Events(): GA4EventLogItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_GA4_LOG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [
    {
      id: 'ga4-init-default',
      eventName: 'page_view',
      params: {
        page_title: 'petsimona25.cl - Inicio',
        page_location: 'https://petsimona25.cl',
        page_path: '/',
      },
      timestamp: new Date().toISOString(),
      measurementId: DEFAULT_GA4_MEASUREMENT_ID,
      status: 'dispatched',
    },
  ];
}

/* =========================================================================
   GA4 Standard Ecommerce & Conversion Tracking Functions
   ========================================================================= */

/**
 * 1. Track Page / Section View
 */
export function trackGA4PageView(pageTitle: string = 'petsimona25.cl', pagePath: string = window.location.pathname) {
  sendGA4Event('page_view', {
    page_title: pageTitle,
    page_location: window.location.href,
    page_path: pagePath,
  });
}

/**
 * 2. Track View Item List (Catalog views)
 */
export function trackGA4ViewItemList(items: Product[], listName: string = 'Catálogo Principal') {
  sendGA4Event('view_item_list', {
    item_list_id: 'catalog_main',
    item_list_name: listName,
    items: items.slice(0, 10).map((p, index) => ({
      item_id: p.id,
      item_name: p.name,
      item_category: p.category,
      price: p.price,
      index: index + 1,
      in_stock: p.inStock,
    })),
  });
}

/**
 * 3. Track View Item Detail
 */
export function trackGA4ViewItem(product: Product) {
  sendGA4Event('view_item', {
    currency: 'CLP',
    value: product.price,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        price: product.price,
        in_stock: product.inStock,
        stock_quantity: product.stock || 10,
      },
    ],
  });
}

/**
 * 4. Track Add To Cart (Ecommerce Conversion step)
 */
export function trackGA4AddToCart(item: {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  selectedSize?: string;
  customMeasurements?: boolean;
}) {
  sendGA4Event('add_to_cart', {
    currency: 'CLP',
    value: item.price * item.quantity,
    items: [
      {
        item_id: item.id,
        item_name: item.name,
        item_category: item.category,
        price: item.price,
        quantity: item.quantity,
        item_variant: item.selectedSize || 'Estándar',
        is_custom_tailored: !!item.customMeasurements,
      },
    ],
  });
}

/**
 * 5. Track Remove From Cart
 */
export function trackGA4RemoveFromCart(item: {
  id: string;
  name: string;
  price: number;
  quantity: number;
}) {
  sendGA4Event('remove_from_cart', {
    currency: 'CLP',
    value: item.price * item.quantity,
    items: [
      {
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity,
      },
    ],
  });
}

/**
 * 6. Track View Cart Drawer
 */
export function trackGA4ViewCart(cartItems: CartItem[], customOrders: CustomOrderItem[], totalValue: number) {
  const allItems = [
    ...cartItems.map((ci) => ({
      item_id: ci.product.id,
      item_name: ci.product.name,
      item_category: ci.product.category,
      price: ci.unitPrice,
      quantity: ci.quantity,
      item_variant: ci.selectedSize,
    })),
    ...customOrders.map((co) => ({
      item_id: co.id,
      item_name: `Corte a la Medida: ${co.garmentType} (${co.petName})`,
      item_category: 'confeccion_personalizada',
      price: co.price,
      quantity: 1,
      item_variant: co.calculatedSize,
    })),
  ];

  sendGA4Event('view_cart', {
    currency: 'CLP',
    value: totalValue,
    items_count: allItems.length,
    items: allItems,
  });
}

/**
 * 7. Track Begin Checkout (High Intent Conversion)
 */
export function trackGA4BeginCheckout(
  cartItems: CartItem[],
  customOrders: CustomOrderItem[],
  totalValue: number,
  coupon?: string
) {
  const allItems = [
    ...cartItems.map((ci) => ({
      item_id: ci.product.id,
      item_name: ci.product.name,
      item_category: ci.product.category,
      price: ci.unitPrice,
      quantity: ci.quantity,
      item_variant: ci.selectedSize,
    })),
    ...customOrders.map((co) => ({
      item_id: co.id,
      item_name: `Corte a la Medida: ${co.garmentType} (${co.petName})`,
      item_category: 'confeccion_personalizada',
      price: co.price,
      quantity: 1,
      item_variant: co.calculatedSize,
    })),
  ];

  sendGA4Event('begin_checkout', {
    currency: 'CLP',
    value: totalValue,
    coupon: coupon || undefined,
    items_count: allItems.length,
    items: allItems,
  });
}

/**
 * 8. Track Purchase (Main Conversion Event)
 */
export function trackGA4Purchase(orderData: {
  transaction_id?: string;
  orderNumber?: string;
  value?: number;
  grandTotal?: number;
  currency?: string;
  itemsCount?: number;
  customerName?: string;
  customerEmail?: string;
  commune?: string;
  courierName?: string;
  paymentMethod?: string;
  shippingPrice?: number;
  shippingCost?: number;
  discountCode?: string;
  items?: Array<{ id: string; name: string; price: number; quantity: number }>;
}) {
  const finalTransactionId = orderData.transaction_id || orderData.orderNumber || `ORD-${Date.now()}`;
  const finalValue = orderData.value ?? orderData.grandTotal ?? 0;
  const finalShipping = orderData.shippingPrice ?? orderData.shippingCost ?? 0;

  sendGA4Event('purchase', {
    transaction_id: finalTransactionId,
    value: finalValue,
    currency: orderData.currency || 'CLP',
    tax: 0,
    shipping: finalShipping,
    coupon: orderData.discountCode || undefined,
    payment_type: orderData.paymentMethod || 'Mercado Pago / Webpay',
    shipping_tier: orderData.courierName || 'Blue Express',
    destination_commune: orderData.commune || 'Chile',
    items_count: orderData.itemsCount ?? (orderData.items ? orderData.items.length : 1),
    items: orderData.items?.map((it) => ({
      item_id: it.id,
      item_name: it.name,
      price: it.price,
      quantity: it.quantity,
    })),
  });
}

/* =========================================================================
   GA4 Blog & Engagement Tracking Functions
   ========================================================================= */

/**
 * 9. Track Blog Section Visit
 */
export function trackGA4BlogSectionView() {
  sendGA4Event('view_blog_section', {
    page_section: 'Blog y Cuidado Canino',
    url_fragment: '#blog',
    domain: 'petsimona25.cl',
  });
}

/**
 * 10. Track Blog Article Reading / Click (accepts object or id, title, category params)
 */
export function trackGA4BlogArticleView(
  articleOrId:
    | string
    | {
        id: string;
        title: string;
        slug?: string;
        category?: string;
        author?: string;
        readTime?: string;
      },
  title?: string,
  category?: string
) {
  if (typeof articleOrId === 'string') {
    sendGA4Event('select_content', {
      content_type: 'blog_post',
      item_id: articleOrId,
      item_name: title || articleOrId,
      content_category: category || 'Cuidado Canino',
      domain: 'petsimona25.cl',
    });
  } else {
    sendGA4Event('select_content', {
      content_type: 'blog_post',
      item_id: articleOrId.slug || articleOrId.id,
      item_name: articleOrId.title,
      content_category: articleOrId.category || 'Cuidado Canino',
      author: articleOrId.author || 'Constanza S.',
      estimated_read_time: articleOrId.readTime,
      domain: 'petsimona25.cl',
    });
  }
}

/**
 * 11. Track Blog Article Share Action
 */
export function trackGA4BlogArticleShare(
  articleIdOrTitle: string,
  titleOrPlatform: string,
  platform?: string
) {
  const finalTitle = platform ? titleOrPlatform : articleIdOrTitle;
  const finalPlatform = platform || titleOrPlatform || 'clipboard';

  sendGA4Event('share', {
    method: finalPlatform,
    content_type: 'blog_post',
    item_name: finalTitle,
    item_id: articleIdOrTitle,
  });
}

/**
 * 12. Track Custom Measurements Form Submit (Lead / Tailor Request)
 */
export function trackGA4CustomOrderSubmit(petName: string, breed: string, garmentType: string, calculatedSize: string) {
  sendGA4Event('generate_lead', {
    lead_type: 'custom_tailoring_request',
    pet_name: petName,
    pet_breed: breed,
    garment_type: garmentType,
    calculated_size: calculatedSize,
    city: 'Rengo, Chile',
  });
}

/**
 * 13. Track WhatsApp Contact Click
 */
export function trackGA4WhatsAppClick(source: string, messagePreview?: string) {
  sendGA4Event('contact', {
    contact_method: 'whatsapp',
    phone_number: '+56972374764',
    source_location: source,
    message_context: messagePreview || 'General',
  });
}

/**
 * 14. Track AI Optimization Usage
 */
export function trackGA4AIOptimizeUsage(action: 'product_title_price' | 'blog_seo', itemName: string) {
  sendGA4Event('use_ai_optimizer', {
    ai_feature: action,
    target_item: itemName,
  });
}

/**
 * 15. Track Google My Business Review Actions (Local Authority & Reviews)
 */
export function trackGA4GoogleReviewClick(source: string, url: string) {
  sendGA4Event('leave_google_review_click', {
    source_location: source,
    target_url: url,
    business: 'petsimona25 Confección Canina Rengo',
    locality: 'Rengo, Región de O\'Higgins, Chile',
  });
}

export function trackGA4GoogleReviewLinkGenerated(linkType: string, placeIdOrQuery: string) {
  sendGA4Event('generate_google_review_link', {
    link_type: linkType,
    identifier: placeIdOrQuery,
    business: 'petsimona25 Confección Canina Rengo',
  });
}
