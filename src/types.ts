export type { AdminOrder } from './data/mockData';

export interface PetMeasurements {
  neck: number; // Cuello en cm
  chest: number; // Contorno de pecho en cm
  bodyLength: number; // Largo de cuerpo en cm
  unit: 'cm' | 'in';
}

export interface CustomOrderItem {
  id: string;
  petName: string;
  breed: string;
  petType: 'dog' | 'cat' | 'other';
  measurements: PetMeasurements;
  garmentType: string;
  fabricColor: string;
  fabricType: string;
  embroideryText?: string;
  specialNotes?: string;
  calculatedSize: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  category: 'abrigos' | 'impermeables' | 'camisetas' | 'vestidos' | 'accesorios' | 'pijamas';
  price: number;
  description: string;
  imageUrl: string;
  sizes: string[];
  inStock: boolean;
  stock?: number; // Cantidad disponible en stock
  rating: number;
  reviewCount: number;
  isCustomizable: boolean;
  isNew?: boolean;
}

export interface CartItem {
  id: string;
  product: Product;
  selectedSize: string;
  customMeasurements?: PetMeasurements & { petName?: string; breed?: string };
  quantity: number;
  unitPrice: number;
  embroideryText?: string;
}

export interface Review {
  id: string;
  petName: string;
  breed: string;
  ownerName: string;
  rating: number;
  comment: string;
  date: string;
  photoUrl: string;
  verified: boolean;
  productName?: string;
}

export interface Subscription {
  id: string;
  email: string;
  petName: string;
  breed: string;
  plan: 'monthly_box' | 'newsletter_vip';
  discountCode: string;
  createdAt: string;
}

export interface PaymentCredentials {
  accountName: string; // 'petsimona25'
  mercadoPagoPublicKey: string;
  mercadoPagoAccessToken: string;
  mercadoPagoClientId?: string;
  mercadoPagoClientSecret?: string;
  mercadoPagoEnvironment?: 'sandbox' | 'live';
  mercadoPagoWebhookSecret?: string;
  mercadoPagoCollectorId?: string;
  mercadoPagoNickname?: string;
  paypalClientId: string;
  paypalEmail?: string;
  paypalMerchantId?: string;
  paypalMode: 'sandbox' | 'live';
  currency: 'CLP' | 'USD' | 'MXN' | 'COP';
  lastTestedAt?: string;
  lastTestStatus?: 'success' | 'failed';
  lastTestMessage?: string;
}

export interface MercadoPagoPreferenceItem {
  id: string;
  title: string;
  description?: string;
  picture_url?: string;
  category_id?: string;
  quantity: number;
  currency_id: 'CLP';
  unit_price: number;
}

export interface MercadoPagoPreferenceResponse {
  id: string;
  init_point: string;
  sandbox_init_point: string;
  collector_id?: number;
  operation_type?: string;
  items?: MercadoPagoPreferenceItem[];
  date_created?: string;
  client_id?: string;
  external_reference?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: 'Cuidado Canino' | 'Moda Sostenible' | 'Guía de Medidas' | 'Historias petsimona25';
  author: string;
  date: string;
  readTime: string;
  imageUrl: string;
  tags: string[];
  metaDescription?: string;
  keywords?: string[];
  seoScore?: number;
  isAiGenerated?: boolean;
  editorialPillar?: string;
  generatedAt?: string;
  weekNumber?: number;
}

export interface WeeklyBlogHistoryItem {
  id: string;
  title: string;
  date: string;
  category: string;
  editorialPillar: string;
  seoScore: number;
  autoPublished: boolean;
  metaDescriptionLength: number;
}

export interface WeeklyBlogAutomationConfig {
  enabled: boolean;
  dayOfWeek: number; // 0=Domingo, 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado
  publishTime: string; // "09:00"
  autoPublish: boolean; // Directamente publicar o guardar como borrador
  autoNotification: boolean; // Enviar notificación push automática al publicarse
  targetPillar: 'rotativo' | 'Cuidado Canino' | 'Moda Sostenible' | 'Guía de Medidas' | 'Historias petsimona25';
  lastGeneratedDate?: string;
  nextScheduledDate: string;
  totalAiGeneratedCount: number;
  currentPillarIndex: number;
  history: WeeklyBlogHistoryItem[];
}

export interface WeeklyEditorialPillar {
  id: string;
  title: string;
  category: 'Cuidado Canino' | 'Moda Sostenible' | 'Guía de Medidas' | 'Historias petsimona25';
  description: string;
  icon: string;
  sampleTopics: string[];
}

export interface TrackingCheckpoint {
  date: string;
  time: string;
  location: string;
  title: string;
  description: string;
  completed: boolean;
  current?: boolean;
}

export interface OrderTrackingInfo {
  orderNumber: string;
  trackingNumber: string;
  courierName: 'Blue Express' | 'Chilexpress' | 'Starken' | 'Correos de Chile' | 'Retiro en Taller (Los Silos)' | string;
  courierOfficialUrl?: string;
  customerName: string;
  customerPhone?: string;
  origin: string;
  destination: string;
  commune: string;
  itemsSummary: string;
  status: 'Pendiente Corte' | 'En Confección' | 'Listo Envíos' | 'En Tránsito' | 'En Reparto a Destino' | 'Entregado';
  dispatchedDate?: string;
  estimatedDelivery: string;
  actualDeliveryDate?: string;
  receiverName?: string;
  checkpoints: TrackingCheckpoint[];
}

export type PushNotificationCategory = 'promocion' | 'stock' | 'pedido' | 'sistema';

export interface PushNotificationItem {
  id: string;
  title: string;
  body: string;
  category: PushNotificationCategory;
  timestamp: string;
  read: boolean;
  linkUrl?: string;
  icon?: string;
  badge?: string;
  actionLabel?: string;
  orderNumber?: string;
  productId?: string;
  discountCode?: string;
  imageUrl?: string;
}

export interface PushNotificationPreferences {
  enabled: boolean;
  promotions: boolean;
  stockAlerts: boolean;
  orderUpdates: boolean;
  sound: boolean;
}

export interface StockAlertSubscription {
  id: string;
  productId: string;
  productName: string;
  customerEmail: string;
  customerName?: string;
  petName?: string;
  selectedSize?: string;
  registeredAt: string;
  notified?: boolean;
  notifiedAt?: string;
  productImageUrl?: string;
}

export interface EmailAlertDispatch {
  id: string;
  toEmail: string;
  subject: string;
  content: string;
  category: PushNotificationCategory | 'custom_tailoring' | 'urgent_alert';
  sentAt: string;
  status: 'sent' | 'delivered';
  metadata?: {
    orderNumber?: string;
    productId?: string;
    productName?: string;
    discountCode?: string;
    whatsAppNotified?: boolean;
  };
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name?: string;
  petName?: string;
  breed?: string;
  city?: string;
  subscribedAt: string;
  discountCode?: string;
  plan?: 'newsletter_vip' | 'monthly_box' | string;
  source?: string;
}

export interface WhatsAppBotConfig {
  authorized: boolean;
  phoneNumber: string;
  botName: string;
  businessName: string;
  notificationEmail: string;
  autoResponderActive: boolean;
  publicAttentionActive: boolean;
  welcomeMessage: string;
}

export interface WhatsAppBusinessConfig {
  enabled: boolean;
  phoneNumberId: string;
  wabaId: string;
  accessToken: string;
  apiVersion: string;
  businessPhoneNumber: string;
  senderDisplayName: string;
  autoSendOrderConfirmation: boolean;
  autoSendStatusUpdates: boolean;
  autoSendTrackingNumber: boolean;
  autoSendRestockAlerts: boolean;
  webhookVerifyToken: string;
  webhookUrl: string;
  environment: 'live' | 'sandbox' | 'cloud_api';
  lastTestedAt?: string;
  lastTestStatus?: 'success' | 'failed';
  lastTestError?: string;
}

export type WhatsAppTemplateType =
  | 'confirmacion_pedido_v1'
  | 'en_confeccion_v1'
  | 'listo_envios_v1'
  | 'envio_despachado_v1'
  | 'en_reparto_v1'
  | 'pedido_entregado_v1'
  | 'aviso_stock_v1'
  | 'mensaje_personalizado';

export interface WhatsAppDispatchLog {
  id: string;
  orderNumber?: string;
  recipientPhone: string;
  recipientName: string;
  petName?: string;
  templateType: WhatsAppTemplateType;
  templateTitle: string;
  messageText: string;
  sentAt: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  channel: 'meta_cloud_api' | 'direct_wa_me_action';
  courier?: string;
  trackingCode?: string;
  errorMessage?: string;
  metaMessageId?: string;
}

export interface MercadoLibreConfig {
  appId: string;
  clientSecret: string;
  accessToken: string;
  refreshToken: string;
  sellerId: string;
  siteId: string; // 'MLC' para Mercado Libre Chile
  enabled: boolean;
  autoSync: boolean;
  listingType: 'gold_special' | 'gold_pro' | 'gold_premium'; // Clásica vs Premium (cuotas)
  condition: 'new' | 'used';
  currencyId: 'CLP';
  shippingMode: 'me2' | 'custom' | 'not_specified'; // Mercado Envíos Chile (ME2)
  warranty: string;
  freeShippingThreshold: number; // Ej. 19990
  allowLocalPickup: boolean;
  environment: 'live' | 'sandbox';
  lastTestedAt?: string;
  lastTestStatus?: 'success' | 'failed';
  lastTestMessage?: string;
}

export interface MercadoLibreItemSync {
  productId: string;
  productName: string;
  mlItemId: string; // Ej. MLC192847591
  status: 'synced' | 'pending' | 'error' | 'paused' | 'not_connected';
  permalink: string;
  price: number;
  stock: number;
  lastSync: string;
  categoryId: string; // Ej. MLC1071 (Ropa para Perros)
  listingTypeId: string;
  syncAttempts?: number;
  errorMessage?: string;
  mlTitle?: string;
}

export interface MercadoLibreLog {
  id: string;
  timestamp: string;
  action: 'publish' | 'update_price' | 'update_stock' | 'pause' | 'reactivate' | 'test_connection' | 'sync_all';
  productId?: string;
  productName?: string;
  mlItemId?: string;
  status: 'success' | 'error' | 'warning';
  details: string;
}

