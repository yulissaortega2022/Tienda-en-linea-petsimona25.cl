import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Lock, Download, FileSpreadsheet, Search, Filter, Plus, CheckCircle, Clock, Truck, Scissors, Dog, Sparkles, RefreshCw, Eye, Phone, Mail, MapPin, Package, Edit3, Ban, CheckCircle2, Copy, Check, MessageSquare, ExternalLink, Hash, Bell, Radio, Send, Tag, PackageCheck, AlertCircle, Star, FileText, Share2, Users, MailCheck, UserPlus, Trash2, Smartphone, CheckCheck, EyeOff, SendHorizontal, Sliders, Bot, Shield, CheckCircle as CheckCircleIcon, Cookie, ShoppingBag, CreditCard } from 'lucide-react';
import { AdminOrder } from '../data/mockData';
import { exportOrdersToCSV, getOrderAccountingSummary } from '../services/orderExportService';
import { Product, NewsletterSubscriber } from '../types';
import { PdfCatalogModal } from './PdfCatalogModal';
import { generateProductCatalogPDF } from '../services/pdfCatalogService';
import { getStoredSubscribers, deleteSubscriber, exportSubscribersToCSV, saveSubscriber } from '../services/newsletterService';
import { generateOptimizedImageSEO, getProductImageAlt } from '../services/imageSeoService';
import { MercadoLibreSyncManager } from './MercadoLibreSyncManager';
import { MercadoPagoConnector } from './MercadoPagoConnector';
import {
  getTrackingSettings,
  saveTrackingSettings,
  getCookiePreferences,
  saveCookiePreferences,
  TrackingSettings,
  CookiePreferences,
  setBrowserCookie,
} from '../services/cookieConsentService';
import {
  broadcastPromotionPush,
  broadcastStockRestockedPush,
  broadcastOrderStatusPush,
  sendWebPushNotification,
  getStockAlertSubscriptions,
  OFFICIAL_NOTIFICATION_EMAIL,
  OFFICIAL_WHATSAPP_PHONE,
  getStoredEmailDispatches,
  sendDirectEmailAlert,
  getWhatsAppBotConfig,
  saveWhatsAppBotConfig,
  generateWhatsAppBotUrl,
  broadcastCustomManualPush,
  getStoredManualPushHistory,
  ManualPushDispatchRecord,
} from '../services/pushNotificationService';
import {
  exportProductsToGoogleSheetsCSV,
  copyProductsToClipboardForGoogleSheets,
  openNewGoogleSheet,
} from '../services/productExportService';
import { EmailAlertDispatch, WhatsAppBotConfig, StockAlertSubscription } from '../types';
import {
  getStoredStockAlerts,
  deleteStockAlertSubscription,
  exportStockAlertsToCSV,
  notifySubscribersProductRestocked,
  STOCK_SUBSCRIBERS_UPDATED_EVENT,
} from '../services/stockAlertService';
import {
  WhatsAppBusinessConfig,
  WhatsAppDispatchLog,
  WhatsAppTemplateType,
  getWhatsAppBusinessConfig,
  saveWhatsAppBusinessConfig,
  getStoredWhatsAppDispatches,
  sendWhatsAppBusinessMessage,
  sendOrderConfirmationWhatsApp,
  sendOrderStatusUpdateWhatsApp,
  testWhatsAppApiConnection,
  exportWhatsAppLogsToCSV,
  formatOrderConfirmationWhatsApp,
  formatOrderStatusUpdateWhatsApp,
  generateDirectWhatsAppUrl,
  WABA_DISPATCHES_UPDATED_EVENT,
  OFFICIAL_WHATSAPP_PHONE as WABA_OFFICIAL_PHONE,
  sanitizeWhatsAppPhoneNumber,
} from '../services/whatsappBusinessService';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: AdminOrder[];
  products?: Product[];
  onUpdateOrderStatus: (orderId: string, newStatus: AdminOrder['status']) => void;
  onUpdateOrderTracking?: (orderId: string, trackingNumber: string, trackingCourier: string) => void;
  onOpenTrackingModal?: (codeOrOrderNumber: string) => void;
  onAddManualOrder: (newOrder: AdminOrder) => void;
  onEditProduct?: (product: Product) => void;
  onOpenAddProduct?: () => void;
  onToggleProductStock?: (productId: string, inStock: boolean) => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  orders,
  products = [],
  onUpdateOrderStatus,
  onUpdateOrderTracking,
  onOpenTrackingModal,
  onAddManualOrder,
  onEditProduct,
  onOpenAddProduct,
  onToggleProductStock,
}) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState<'orders' | 'tailoring' | 'inventory' | 'mercadolibre' | 'mercadopago' | 'subscribers' | 'add' | 'push' | 'stock_alerts' | 'whatsapp_business' | 'cookies_tracking'>('orders');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [productSearchTerm, setProductSearchTerm] = useState('');

  // Cookies & Tracking Settings State
  const [trackingSettings, setTrackingSettings] = useState<TrackingSettings>(() => getTrackingSettings());
  const [cookiePrefs, setCookiePrefs] = useState<CookiePreferences>(() => getCookiePreferences());
  const [cookieActionMsg, setCookieActionMsg] = useState<string | null>(null);

  // Stock Alerts & Waitlist state
  const [stockAlertsList, setStockAlertsList] = useState<StockAlertSubscription[]>(() => getStoredStockAlerts());
  const [stockAlertSearchTerm, setStockAlertSearchTerm] = useState('');
  const [stockAlertStatusFilter, setStockAlertStatusFilter] = useState<'all' | 'pending' | 'notified'>('all');
  const [stockAlertActionMsg, setStockAlertActionMsg] = useState<string | null>(null);
  const [copiedStockEmailId, setCopiedStockEmailId] = useState<string | null>(null);
  const [isExportingStockCSV, setIsExportingStockCSV] = useState(false);

  // Sync stock alerts on custom event
  useEffect(() => {
    const handleStockAlertsUpdated = () => {
      setStockAlertsList(getStoredStockAlerts());
    };
    window.addEventListener(STOCK_SUBSCRIBERS_UPDATED_EVENT, handleStockAlertsUpdated);
    return () => window.removeEventListener(STOCK_SUBSCRIBERS_UPDATED_EVENT, handleStockAlertsUpdated);
  }, []);

  const handleExportStockAlertsCSV = () => {
    try {
      setIsExportingStockCSV(true);
      const result = exportStockAlertsToCSV(stockAlertsList);
      setStockAlertActionMsg(`✓ Archivo CSV con ${result.total} registros de avisos de stock descargado: "${result.fileName}"`);
      setTimeout(() => setStockAlertActionMsg(null), 4000);
    } catch (err) {
      console.error('Error exporting stock alerts CSV:', err);
    } finally {
      setIsExportingStockCSV(false);
    }
  };

  const handleDeleteStockSub = (id: string, email: string) => {
    if (confirm(`¿Eliminar la solicitud de aviso para "${email}"?`)) {
      const updated = deleteStockAlertSubscription(id);
      setStockAlertsList(updated);
      setStockAlertActionMsg(`Solicitud de ${email} eliminada correctamente.`);
      setTimeout(() => setStockAlertActionMsg(null), 3000);
    }
  };

  const handleCopyStockEmail = (sub: StockAlertSubscription) => {
    navigator.clipboard.writeText(sub.customerEmail);
    setCopiedStockEmailId(sub.id);
    setTimeout(() => setCopiedStockEmailId(null), 2000);
  };

  const handleCopyAllStockEmails = () => {
    const pendingEmails = stockAlertsList
      .filter((s) => !s.notified)
      .map((s) => s.customerEmail);
    const emailsToCopy = pendingEmails.length > 0 ? pendingEmails : stockAlertsList.map((s) => s.customerEmail);
    const text = emailsToCopy.join(', ');
    navigator.clipboard.writeText(text);
    setStockAlertActionMsg(`✓ Se copiaron ${emailsToCopy.length} correos de la lista de espera al portapapeles.`);
    setTimeout(() => setStockAlertActionMsg(null), 4000);
  };

  const handleManualTriggerProductRestock = async (sub: StockAlertSubscription) => {
    const targetProduct = products.find((p) => p.id === sub.productId) || {
      id: sub.productId,
      name: sub.productName,
      category: 'abrigos',
      price: 24900,
      description: 'Producto artesanal petsimona25',
      imageUrl: sub.productImageUrl || 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=800',
      sizes: ['S', 'M', 'L'],
      inStock: true,
      stock: 10,
    } as Product;

    const res = await notifySubscribersProductRestocked(targetProduct, 10);
    setStockAlertsList(getStoredStockAlerts());
    setStockAlertActionMsg(`🔔 ¡Notificación de reposición enviada con éxito a ${res.subscriberEmails.length || 1} cliente(s)!`);
    setTimeout(() => setStockAlertActionMsg(null), 5000);
  };

  // Newsletter & Subscribers state
  const [subscribersList, setSubscribersList] = useState<NewsletterSubscriber[]>(() => getStoredSubscribers());
  const [subscriberSearchTerm, setSubscriberSearchTerm] = useState('');
  const [subscriberPlanFilter, setSubscriberPlanFilter] = useState<'all' | 'newsletter_vip' | 'monthly_box'>('all');
  const [copiedAllEmails, setCopiedAllEmails] = useState(false);
  const [copiedSingleEmailId, setCopiedSingleEmailId] = useState<string | null>(null);
  const [subscriberActionMsg, setSubscriberActionMsg] = useState<string | null>(null);
  const [isExportingSubscribersCSV, setIsExportingSubscribersCSV] = useState(false);

  // Manual add subscriber state
  const [isAddingSubscriber, setIsAddingSubscriber] = useState(false);
  const [newSubEmail, setNewSubEmail] = useState('');
  const [newSubName, setNewSubName] = useState('');
  const [newSubPet, setNewSubPet] = useState('');
  const [newSubBreed, setNewSubBreed] = useState('');
  const [newSubCity, setNewSubCity] = useState('Rengo');
  const [newSubPlan, setNewSubPlan] = useState<'newsletter_vip' | 'monthly_box'>('newsletter_vip');

  // Sync subscribers on custom event
  useEffect(() => {
    const handleSubscribersUpdated = () => {
      setSubscribersList(getStoredSubscribers());
    };
    window.addEventListener('petsimona25_subscribers_updated', handleSubscribersUpdated);
    return () => window.removeEventListener('petsimona25_subscribers_updated', handleSubscribersUpdated);
  }, []);

  // Export Subscribers to CSV
  const handleExportSubscribersCSV = () => {
    try {
      setIsExportingSubscribersCSV(true);
      const result = exportSubscribersToCSV(subscribersList);
      setSubscriberActionMsg(`¡Lista de ${result.total} suscriptores descargada con éxito como "${result.fileName}"!`);
      setTimeout(() => setSubscriberActionMsg(null), 4500);
    } catch (err) {
      console.error('Error exporting subscribers CSV:', err);
    } finally {
      setIsExportingSubscribersCSV(false);
    }
  };

  // Copy all emails
  const handleCopyAllEmails = () => {
    const emails = subscribersList.map((s) => s.email).filter(Boolean).join(', ');
    if (!emails) return;
    navigator.clipboard.writeText(emails);
    setCopiedAllEmails(true);
    setSubscriberActionMsg(`¡${subscribersList.length} correos electrónicos copiados al portapapeles!`);
    setTimeout(() => {
      setCopiedAllEmails(false);
      setSubscriberActionMsg(null);
    }, 3500);
  };

  // Copy single email
  const handleCopySingleEmail = (sub: NewsletterSubscriber) => {
    navigator.clipboard.writeText(sub.email);
    setCopiedSingleEmailId(sub.id);
    setTimeout(() => setCopiedSingleEmailId(null), 2500);
  };

  // Delete subscriber
  const handleDeleteSubscriber = (id: string, email: string) => {
    if (window.confirm(`¿Deseas eliminar a "${email}" de la lista local de suscriptores?`)) {
      const updated = deleteSubscriber(id);
      setSubscribersList(updated);
      setSubscriberActionMsg(`Suscriptor "${email}" eliminado.`);
      setTimeout(() => setSubscriberActionMsg(null), 3500);
    }
  };

  // Add manual subscriber
  const handleAddManualSubscriber = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubEmail || !newSubEmail.includes('@')) return;

    saveSubscriber({
      email: newSubEmail,
      name: newSubName.trim() || undefined,
      petName: newSubPet.trim() || undefined,
      breed: newSubBreed.trim() || undefined,
      city: newSubCity.trim() || 'Rengo',
      plan: newSubPlan,
      source: 'admin_manual_entry',
    });

    setSubscribersList(getStoredSubscribers());
    setNewSubEmail('');
    setNewSubName('');
    setNewSubPet('');
    setNewSubBreed('');
    setIsAddingSubscriber(false);
    setSubscriberActionMsg(`¡Suscriptor "${newSubEmail}" guardado exitosamente en localStorage!`);
    setTimeout(() => setSubscriberActionMsg(null), 4000);
  };

  // Push Broadcast state
  const [pushPromoTitle, setPushPromoTitle] = useState('🔥 ¡20% OFF de Invierno en Rengo!');
  const [pushPromoBody, setPushPromoBody] = useState('Prepara a tu consentido para las bajas temperaturas con nuestra colección de polares y abrigos a medida.');
  const [pushPromoCoupon, setPushPromoCoupon] = useState('RENGO20');
  const [pushStockProductId, setPushStockProductId] = useState(products[0]?.id || '');
  const [pushStockUnits, setPushStockUnits] = useState(5);
  const [pushOrderId, setPushOrderId] = useState(orders[0]?.orderNumber || '');
  const [pushOrderStatus, setPushOrderStatus] = useState<AdminOrder['status']>('Listo Envíos');
  const [pushSuccessMsg, setPushSuccessMsg] = useState<string | null>(null);

  // Custom Manual Push Dispatcher for Administrator (Flash Offers & Custom Broadcasts)
  const [customPushTitle, setCustomPushTitle] = useState('⚡ ¡Oferta Flash 24H: 25% OFF en Capas de Invierno!');
  const [customPushBody, setCustomPushBody] = useState('¡Solo por hoy! Confección artesanal a la medida con 25% de descuento en telas térmicas e impermeables. Cupón: FLASH25.');
  const [customPushCoupon, setCustomPushCoupon] = useState('FLASH25');
  const [customPushCategory, setCustomPushCategory] = useState<'promocion' | 'stock' | 'pedido' | 'sistema'>('promocion');
  const [customPushLink, setCustomPushLink] = useState('#catalogo');
  const [customPushActionLabel, setCustomPushActionLabel] = useState('Aprovechar Oferta Flash');
  const [customPushTargetAudience, setCustomPushTargetAudience] = useState<'all' | 'vip_club' | 'small_dogs' | 'past_buyers'>('all');
  const [customPushHistory, setCustomPushHistory] = useState<ManualPushDispatchRecord[]>(() => getStoredManualPushHistory());
  const [isCustomPushSending, setIsCustomPushSending] = useState(false);
  const [customPushSuccessMsg, setCustomPushSuccessMsg] = useState<string | null>(null);

  // Google Sheets Inventory Export State
  const [googleSheetsExportMsg, setGoogleSheetsExportMsg] = useState<string | null>(null);
  const [isExportingGoogleSheets, setIsExportingGoogleSheets] = useState(false);

  // Compute registered user recipient pool
  const registeredSubscribersEmails = subscribersList.map((s) => s.email.trim().toLowerCase()).filter(Boolean);
  const orderCustomersEmails = orders.map((o) => o.customerEmail?.trim().toLowerCase()).filter(Boolean);
  const uniqueRegisteredEmails = Array.from(new Set([...registeredSubscribersEmails, ...orderCustomersEmails]));

  const getTargetAudienceRecipients = (audience: 'all' | 'vip_club' | 'small_dogs' | 'past_buyers') => {
    switch (audience) {
      case 'vip_club':
        return subscribersList.filter((s) => s.plan === 'vip' || s.plan === 'premium').map((s) => s.email);
      case 'small_dogs':
        const smallBreeds = ['yorkshire', 'chihuahua', 'poodle', 'maltes', 'pomerania', 'dachshund', 'teckel'];
        const fromSubs = subscribersList
          .filter((s) => s.breed && smallBreeds.some((b) => s.breed!.toLowerCase().includes(b)))
          .map((s) => s.email);
        const fromOrders = orders
          .filter((o) => o.petBreed && smallBreeds.some((b) => o.petBreed!.toLowerCase().includes(b)))
          .map((o) => o.customerEmail);
        return Array.from(new Set([...fromSubs, ...fromOrders]));
      case 'past_buyers':
        return Array.from(new Set(orders.map((o) => o.customerEmail).filter(Boolean)));
      case 'all':
      default:
        return uniqueRegisteredEmails.length > 0
          ? uniqueRegisteredEmails
          : ['valentina.perez@gmail.com', 'gonzalo.munoz@yahoo.cl', 'fernanda.rengo@hotmail.com', 'constanza.taller@petsimona25.cl'];
    }
  };

  const handleSendCustomManualPush = () => {
    if (!customPushTitle.trim() || !customPushBody.trim()) {
      alert('Por favor ingresa un título y mensaje para la notificación push.');
      return;
    }

    setIsCustomPushSending(true);

    const recipients = getTargetAudienceRecipients(customPushTargetAudience);
    const audienceLabels: Record<string, string> = {
      all: `Todos los Usuarios Registrados (${recipients.length} tutores VIP y compradores)`,
      vip_club: `Club VIP y Suscriptores Exclusivos (${recipients.length} miembros)`,
      small_dogs: `Tutores de Razas Pequeñas (${recipients.length} tutores)`,
      past_buyers: `Clientes con Compras Previas (${recipients.length} compradores)`,
    };

    setTimeout(() => {
      broadcastCustomManualPush({
        title: customPushTitle,
        body: customPushBody,
        category: customPushCategory,
        discountCode: customPushCoupon.trim() || undefined,
        linkUrl: customPushLink.trim() || '#catalogo',
        actionLabel: customPushActionLabel.trim() || 'Ver Novedades',
        targetAudience: audienceLabels[customPushTargetAudience] || 'Todos los Usuarios Registrados',
        recipientCount: recipients.length,
        recipientsPreview: recipients.slice(0, 5),
      });

      setCustomPushHistory(getStoredManualPushHistory());
      setIsCustomPushSending(false);
      setCustomPushSuccessMsg(
        `¡Notificación Push enviada con éxito a ${recipients.length} usuarios registrados! Destino: ${audienceLabels[customPushTargetAudience]}`
      );
      setTimeout(() => setCustomPushSuccessMsg(null), 5000);
    }, 600);
  };

  const handleExportInventoryGoogleSheets = () => {
    setIsExportingGoogleSheets(true);
    const result = exportProductsToGoogleSheetsCSV(products, 'inventario_taller_rengo');
    setIsExportingGoogleSheets(false);
    setGoogleSheetsExportMsg(`¡Descargado archivo CSV "${result.fileName}" con ${result.totalProducts} artículos para Google Sheets!`);
    setTimeout(() => setGoogleSheetsExportMsg(null), 5000);
  };

  const handleCopyInventoryGoogleSheets = async () => {
    const ok = await copyProductsToClipboardForGoogleSheets(products);
    if (ok) {
      setGoogleSheetsExportMsg(`¡Datos de ${products.length} artículos copiados al portapapeles! Pégalos (Ctrl+V) directo en Google Sheets.`);
    } else {
      setGoogleSheetsExportMsg('No se pudo copiar automáticamente al portapapeles.');
    }
    setTimeout(() => setGoogleSheetsExportMsg(null), 5000);
  };

  // Email Notification & WhatsApp Bot state
  const [emailDispatchesList, setEmailDispatchesList] = useState<EmailAlertDispatch[]>(() => getStoredEmailDispatches());
  const [testEmailSubject, setTestEmailSubject] = useState('🔔 [petsimona25.cl] Alerta de Notificación');
  const [testEmailContent, setTestEmailContent] = useState('Alerta push y sincronización enviada a yulyfamilia1974@gmail.com con WhatsApp Bot (+56972374764) autorizado para atención pública 24/7.');
  const [botConfig, setBotConfig] = useState<WhatsAppBotConfig>(() => getWhatsAppBotConfig());

  // Tracking Editor state
  const [editingTrackingOrder, setEditingTrackingOrder] = useState<AdminOrder | null>(null);
  const [editTrackingCode, setEditTrackingCode] = useState('');
  const [editTrackingCourier, setEditTrackingCourier] = useState('Blue Express');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Manual Order Form state
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCommune, setNewCommune] = useState('Rengo');
  const [newAddress, setNewAddress] = useState('');
  const [newItemsSummary, setNewItemsSummary] = useState('');
  const [newTotal, setNewTotal] = useState(24900);
  const [newPetName, setNewPetName] = useState('');
  const [newPetBreed, setNewPetBreed] = useState('Yorkshire Terrier');
  const [newNeckSize, setNewNeckSize] = useState<number>(22);
  const [newChestSize, setNewChestSize] = useState<number>(34);
  const [newBackSize, setNewBackSize] = useState<number>(28);
  const [newSpecialNotes, setNewSpecialNotes] = useState('');
  const [newTrackingCourier, setNewTrackingCourier] = useState('Blue Express');
  const [newTrackingCode, setNewTrackingCode] = useState('');

  // PDF Catalog state
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isQuickDownloadingPdf, setIsQuickDownloadingPdf] = useState(false);
  const [pdfQuickMessage, setPdfQuickMessage] = useState<string | null>(null);

  // WhatsApp Business API State & Automation Manager
  const [wabaConfig, setWabaConfig] = useState<WhatsAppBusinessConfig>(() => getWhatsAppBusinessConfig());
  const [wabaDispatchesList, setWabaDispatchesList] = useState<WhatsAppDispatchLog[]>(() => getStoredWhatsAppDispatches());
  const [wabaSearchTerm, setWabaSearchTerm] = useState('');
  const [wabaStatusFilter, setWabaStatusFilter] = useState<'all' | 'delivered' | 'sent' | 'read' | 'failed'>('all');
  const [wabaTestPhone, setWabaTestPhone] = useState('+56972374764');
  const [wabaTestTemplate, setWabaTestTemplate] = useState<WhatsAppTemplateType>('confirmacion_pedido_v1');
  const [wabaSelectedOrderNumber, setWabaSelectedOrderNumber] = useState<string>(orders[0]?.orderNumber || '');
  const [wabaCustomMessage, setWabaCustomMessage] = useState('');
  const [wabaIsTesting, setWabaIsTesting] = useState(false);
  const [wabaActionMsg, setWabaActionMsg] = useState<string | null>(null);
  const [wabaShowToken, setWabaShowToken] = useState(false);
  const [wabaIsExportingCSV, setWabaIsExportingCSV] = useState(false);
  const [copiedWabaId, setCopiedWabaId] = useState<string | null>(null);

  // Sync WhatsApp Business dispatches on custom event
  useEffect(() => {
    const handleWabaDispatchesUpdated = () => {
      setWabaDispatchesList(getStoredWhatsAppDispatches());
    };
    window.addEventListener(WABA_DISPATCHES_UPDATED_EVENT, handleWabaDispatchesUpdated);
    return () => window.removeEventListener(WABA_DISPATCHES_UPDATED_EVENT, handleWabaDispatchesUpdated);
  }, []);

  // Save WABA Config
  const handleSaveWabaConfig = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const updated = saveWhatsAppBusinessConfig(wabaConfig);
    setWabaConfig(updated);
    setWabaActionMsg('✓ Configuración de WhatsApp Business API guardada y sincronizada con el servidor.');
    setTimeout(() => setWabaActionMsg(null), 4000);
  };

  // Toggle single automation rule
  const handleToggleWabaAutomation = (field: keyof WhatsAppBusinessConfig, val: boolean) => {
    const updated = saveWhatsAppBusinessConfig({ ...wabaConfig, [field]: val });
    setWabaConfig(updated);
    setWabaActionMsg(`✓ Automatización "${String(field)}" ${val ? 'ACTIVADA' : 'DESACTIVADA'}.`);
    setTimeout(() => setWabaActionMsg(null), 3000);
  };

  // Dispatch Test Message from sandbox
  const handleTestWabaDispatch = async () => {
    try {
      setWabaIsTesting(true);
      const selectedOrder = orders.find((o) => o.orderNumber === wabaSelectedOrderNumber) || orders[0];

      let msgText = wabaCustomMessage.trim();
      let title = '🧪 Mensaje de Prueba WhatsApp';

      if (wabaTestTemplate === 'confirmacion_pedido_v1' && selectedOrder) {
        msgText = formatOrderConfirmationWhatsApp({
          orderNumber: selectedOrder.orderNumber,
          customerName: selectedOrder.customerName,
          customerPhone: wabaTestPhone,
          petName: selectedOrder.petName,
          petBreed: selectedOrder.petBreed,
          itemsSummary: selectedOrder.itemsSummary,
          grandTotal: selectedOrder.grandTotal,
          commune: selectedOrder.commune,
          shippingAddress: selectedOrder.shippingAddress,
          paymentMethod: selectedOrder.paymentMethod,
          courierName: selectedOrder.courierName,
        });
        title = '🎉 Confirmación de Pedido Ingresado';
      } else if (wabaTestTemplate !== 'mensaje_personalizado' && selectedOrder) {
        const formatted = formatOrderStatusUpdateWhatsApp(
          selectedOrder,
          wabaTestTemplate === 'en_confeccion_v1'
            ? 'En Confección'
            : wabaTestTemplate === 'listo_envios_v1'
            ? 'Listo Envíos'
            : wabaTestTemplate === 'envio_despachado_v1'
            ? 'Despachado'
            : wabaTestTemplate === 'en_reparto_v1'
            ? 'En Reparto a Destino'
            : 'Entregado',
          selectedOrder.trackingCourier || selectedOrder.courierName || 'Blue Express',
          selectedOrder.trackingNumber || `BX-${selectedOrder.orderNumber.replace(/\D/g, '')}194`
        );
        msgText = formatted.body;
        title = formatted.title;
      }

      const res = await sendWhatsAppBusinessMessage({
        toPhone: wabaTestPhone,
        recipientName: selectedOrder ? selectedOrder.customerName : 'Cliente de Prueba',
        petName: selectedOrder?.petName,
        orderNumber: selectedOrder?.orderNumber || 'TEST-WABA',
        templateType: wabaTestTemplate,
        templateTitle: title,
        messageText: msgText || 'Mensaje de prueba oficial desde petsimona25.cl (Rengo)',
        courier: selectedOrder?.trackingCourier || selectedOrder?.courierName || 'Blue Express',
        trackingCode: selectedOrder?.trackingNumber,
      });

      setWabaDispatchesList(getStoredWhatsAppDispatches());
      setWabaActionMsg(`🚀 ¡Mensaje de WhatsApp despachado exitosamente a ${wabaTestPhone}!`);
      setTimeout(() => setWabaActionMsg(null), 5000);
    } catch (err: any) {
      console.error('Error dispatching test WABA message:', err);
      setWabaActionMsg(`⚠️ Error al enviar: ${err?.message || 'Revisa tu conexión'}`);
    } finally {
      setWabaIsTesting(false);
    }
  };

  // Export WhatsApp Logs to CSV
  const handleExportWabaCSV = () => {
    try {
      setWabaIsExportingCSV(true);
      const res = exportWhatsAppLogsToCSV(wabaDispatchesList);
      setWabaActionMsg(`✓ Archivo CSV con ${res.total} registros de WhatsApp Business descargado: "${res.fileName}"`);
      setTimeout(() => setWabaActionMsg(null), 4000);
    } catch (err) {
      console.error('Error exporting WABA CSV:', err);
    } finally {
      setWabaIsExportingCSV(false);
    }
  };

  // Quick Direct Dispatch for an existing order from Orders table
  const handleQuickSendOrderWhatsApp = async (order: AdminOrder, mode: 'confirmation' | 'status' | 'tracking') => {
    try {
      const courier = order.trackingCourier || order.courierName || 'Blue Express';
      const tracking = order.trackingNumber || `BX-${order.orderNumber.replace(/\D/g, '')}194`;

      if (mode === 'confirmation') {
        await sendOrderConfirmationWhatsApp({
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          petName: order.petName,
          petBreed: order.petBreed,
          itemsSummary: order.itemsSummary,
          grandTotal: order.grandTotal,
          commune: order.commune,
          shippingAddress: order.shippingAddress,
          paymentMethod: order.paymentMethod,
          courierName: courier,
        });
        setWabaActionMsg(`🎉 Confirmación de Pedido #${order.orderNumber} enviada a ${order.customerPhone || order.customerName} vía WhatsApp Business API.`);
      } else {
        await sendOrderStatusUpdateWhatsApp(
          order,
          mode === 'tracking' ? 'Despachado' : order.status,
          courier,
          tracking
        );
        setWabaActionMsg(`📲 Notificación de estado "${order.status}" enviada a ${order.customerName} (${order.customerPhone}) vía WhatsApp.`);
      }

      setWabaDispatchesList(getStoredWhatsAppDispatches());
      setTimeout(() => setWabaActionMsg(null), 4500);
    } catch (e: any) {
      console.error('Error in quick send WhatsApp:', e);
    }
  };

  // Copy helper with feedback
  const handleCopyWabaText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedWabaId(id);
    setTimeout(() => setCopiedWabaId(null), 2500);
  };

  // Quick download PDF Catalog
  const handleQuickDownloadCatalogPDF = async () => {
    try {
      setIsQuickDownloadingPdf(true);
      const result = await generateProductCatalogPDF(products, {
        onlyInStock: false,
        categoryFilter: 'all',
        includeCustomTailoringNotice: true,
        contactPhone: '+56 9 7237 4764',
        websiteUrl: 'www.petsimona25.cl',
        ownerName: 'petsimona25',
      });
      setPdfQuickMessage(`¡Catálogo PDF (${result.totalItems} productos) descargado con éxito!`);
      setTimeout(() => setPdfQuickMessage(null), 4000);
    } catch (err) {
      console.error('Error quick downloading catalog PDF:', err);
    } finally {
      setIsQuickDownloadingPdf(false);
    }
  };

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'simona2026' || passwordInput === 'constanza25' || passwordInput === 'admin') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Contraseña incorrecta. (Prueba con "simona2026" o "constanza25")');
    }
  };

  // Helper function to safely escape CSV fields
  const escapeCSV = (field: string | number | undefined): string => {
    if (field === undefined || field === null) return '""';
    const stringified = String(field).replace(/"/g, '""');
    return `"${stringified}"`;
  };

  // Export Full Orders to CSV
  const exportOrdersCSV = () => {
    const headers = [
      'Numero_Pedido',
      'Fecha',
      'Estado',
      'Codigo_Seguimiento',
      'Empresa_Logistica',
      'Cliente_Nombre',
      'Email',
      'Telefono',
      'Direccion',
      'Comuna',
      'Courier',
      'Metodo_Pago',
      'Total_CLP',
      'Resumen_Productos',
      'Mascota_Nombre',
      'Mascota_Raza',
      'Cuello_A_cm',
      'Pecho_B_cm',
      'Largo_C_cm',
      'Notas_Confeccion'
    ];

    const rows = orders.map((o) => [
      escapeCSV(o.orderNumber),
      escapeCSV(o.date),
      escapeCSV(o.status),
      escapeCSV(o.trackingNumber || 'Pendiente Asignar'),
      escapeCSV(o.trackingCourier || o.courierName),
      escapeCSV(o.customerName),
      escapeCSV(o.customerEmail),
      escapeCSV(o.customerPhone),
      escapeCSV(o.shippingAddress),
      escapeCSV(o.commune),
      escapeCSV(o.courierName),
      escapeCSV(o.paymentMethod),
      escapeCSV(o.grandTotal),
      escapeCSV(o.itemsSummary),
      escapeCSV(o.petName || 'N/A'),
      escapeCSV(o.petBreed || 'N/A'),
      escapeCSV(o.neckSizeCm || 'N/A'),
      escapeCSV(o.chestSizeCm || 'N/A'),
      escapeCSV(o.backSizeCm || 'N/A'),
      escapeCSV(o.specialNotes || 'Sin observaciones')
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `petsimona25_pedidos_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Specific Production & Tailoring Sheet CSV
  const exportTailoringCSV = () => {
    const headers = [
      'Order_ID',
      'Mascota_Nombre',
      'Raza_Tipo',
      'Cuello_A_cm',
      'Pecho_B_cm',
      'Largo_C_cm',
      'Observaciones_Ergonomicas_Taller',
      'Productos_Medida',
      'Cliente_Responsable',
      'WhatsApp_Contacto',
      'Comuna_Despacho',
      'Courier_Logistica',
      'Codigo_Seguimiento',
      'Estado_Produccion'
    ];

    const rows = orders.map((o) => [
      escapeCSV(o.orderNumber),
      escapeCSV(o.petName || 'Sin Nombre'),
      escapeCSV(o.petBreed || 'Mestizo'),
      escapeCSV(o.neckSizeCm || 0),
      escapeCSV(o.chestSizeCm || 0),
      escapeCSV(o.backSizeCm || 0),
      escapeCSV(o.specialNotes || 'Medidas estándar'),
      escapeCSV(o.itemsSummary),
      escapeCSV(o.customerName),
      escapeCSV(o.customerPhone),
      escapeCSV(o.commune),
      escapeCSV(o.trackingCourier || o.courierName),
      escapeCSV(o.trackingNumber || 'Pendiente'),
      escapeCSV(o.status)
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `petsimona25_ficha_taller_medidas_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenEditTracking = (order: AdminOrder) => {
    setEditingTrackingOrder(order);
    setEditTrackingCourier(order.trackingCourier || order.courierName || 'Blue Express');
    setEditTrackingCode(
      order.trackingNumber ||
        (order.courierName.includes('Chile')
          ? `CX-${order.orderNumber.replace(/\D/g, '') || '918230'}`
          : order.courierName.includes('Starken')
          ? `SK-${order.orderNumber.replace(/\D/g, '') || '829104'}`
          : `BX-${order.orderNumber.replace(/\D/g, '') || '748920'}`)
    );
  };

  const handleSaveTracking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrackingOrder) return;
    if (onUpdateOrderTracking) {
      onUpdateOrderTracking(editingTrackingOrder.id, editTrackingCode.trim(), editTrackingCourier);
    } else {
      editingTrackingOrder.trackingNumber = editTrackingCode.trim();
      editingTrackingOrder.trackingCourier = editTrackingCourier;
    }
    setEditingTrackingOrder(null);
  };

  const handleGenerateTrackingCode = () => {
    if (!editingTrackingOrder) return;
    const num = editingTrackingOrder.orderNumber.replace(/\D/g, '') || Math.floor(100000 + Math.random() * 900000);
    if (editTrackingCourier.includes('Chile')) {
      setEditTrackingCode(`CX-${num}${Math.floor(100 + Math.random() * 900)}`);
    } else if (editTrackingCourier.includes('Starken')) {
      setEditTrackingCode(`SK-${num}${Math.floor(10 + Math.random() * 90)}`);
    } else if (editTrackingCourier.includes('Correo')) {
      setEditTrackingCode(`CC-${num}${Math.floor(100 + Math.random() * 900)}`);
    } else if (editTrackingCourier.includes('Retiro')) {
      setEditTrackingCode(`RET-RENGO-${num}`);
    } else {
      setEditTrackingCode(`BX-${num}${Math.floor(100 + Math.random() * 900)}`);
    }
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2500);
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.trackingNumber && o.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.petName && o.petName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      o.commune.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Orders CSV Export State & Accounting Summary
  const [isExportingOrdersCSV, setIsExportingOrdersCSV] = useState(false);
  const [orderActionMsg, setOrderActionMsg] = useState<string | null>(null);
  const [showAccountingBreakdown, setShowAccountingBreakdown] = useState(false);

  const accountingSummary = getOrderAccountingSummary(filteredOrders);
  const totalHistoricalSummary = getOrderAccountingSummary(orders);

  const handleExportOrdersCSV = (scope: 'filtered' | 'all' = 'filtered') => {
    try {
      setIsExportingOrdersCSV(true);
      const targetOrders = scope === 'filtered' ? filteredOrders : orders;
      if (targetOrders.length === 0) {
        setOrderActionMsg('⚠️ No hay pedidos para exportar con los filtros actuales.');
        setTimeout(() => setOrderActionMsg(null), 3500);
        return;
      }
      const scopeLabel = scope === 'filtered' && statusFilter !== 'all' ? `estado_${statusFilter}` : scope;
      const result = exportOrdersToCSV(targetOrders, scopeLabel);
      setOrderActionMsg(`✓ Archivo CSV contable generado con éxito: "${result.fileName}" (${result.totalOrders} pedidos exportados por un total de $${result.totalAmountCLP.toLocaleString('es-CL')} CLP).`);
      setTimeout(() => setOrderActionMsg(null), 5000);
    } catch (err) {
      console.error('Error al exportar pedidos a CSV:', err);
      setOrderActionMsg('❌ Error al generar el archivo CSV contable.');
      setTimeout(() => setOrderActionMsg(null), 4000);
    } finally {
      setIsExportingOrdersCSV(false);
    }
  };

  const handleCreateOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim() || !newItemsSummary.trim()) return;

    const autoOrderNumber = `PS25-${Math.floor(100000 + Math.random() * 900000)}`;
    const finalTracking = newTrackingCode.trim() || `BX-${autoOrderNumber.replace(/\D/g, '')}194`;

    const newOrd: AdminOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: autoOrderNumber,
      date: new Date().toISOString().slice(0, 10),
      customerName: newCustomerName,
      customerEmail: newEmail || 'contacto@cliente.cl',
      customerPhone: newPhone || '+56972374764',
      shippingAddress: newAddress || 'Dirección por confirmar',
      commune: newCommune,
      courierName: newTrackingCourier,
      trackingCourier: newTrackingCourier,
      trackingNumber: finalTracking,
      paymentMethod: 'Mercado Pago',
      grandTotal: newTotal,
      itemsSummary: newItemsSummary,
      petName: newPetName || undefined,
      petBreed: newPetBreed || undefined,
      neckSizeCm: newNeckSize || undefined,
      chestSizeCm: newChestSize || undefined,
      backSizeCm: newBackSize || undefined,
      specialNotes: newSpecialNotes || undefined,
      status: 'Pendiente Corte'
    };

    onAddManualOrder(newOrd);

    // Reset Form
    setNewCustomerName('');
    setNewItemsSummary('');
    setNewPetName('');
    setNewSpecialNotes('');
    setNewTrackingCode('');
    setActiveTab('orders');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl border-2 border-orange-400 overflow-hidden flex flex-col max-h-[90vh] my-4 relative">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 border-b-4 border-orange-500 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-orange-500 rounded-2xl flex items-center justify-center text-slate-900 shadow-md">
              <Scissors className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white tracking-tight">
                  Panel de Administración &amp; Taller 👑
                </h3>
                <span className="bg-yellow-400 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                  petsimona25.cl
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Gestión de Pedidos, Medidas de Mascotas &amp; Exportación a CSV
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Password Protection Screen */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 text-center max-w-md mx-auto space-y-6 my-auto">
            <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto border-4 border-orange-200">
              <Lock className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h4 className="text-2xl font-black text-slate-900">Acceso Exclusivo Dueña / Taller</h4>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Ingresa la contraseña del panel de administración para acceder al control de producción artesanal en Rengo y exportación de planillas CSV.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                  Contraseña de Administrador
                </label>
                <input
                  type="password"
                  placeholder="Ingresa la contraseña..."
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-orange-500 rounded-2xl p-3.5 text-sm font-bold text-slate-900 outline-hidden transition-colors"
                  autoFocus
                />
              </div>

              {authError && (
                <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">
                  {authError}
                </p>
              )}

              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-3.5 rounded-2xl shadow-lg transition-all text-xs uppercase tracking-wider"
              >
                Ingresar al Panel Administrativo
              </button>

              <p className="text-[11px] text-center text-slate-400 font-mono pt-2">
                Clave de prueba por defecto: <code className="text-orange-600 font-bold">simona2026</code> o <code className="text-orange-600 font-bold">constanza25</code>
              </p>
            </form>
          </div>
        ) : (
          /* Authenticated Dashboard Content */
          <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 bg-slate-50">
            
            {/* Top Quick Stats Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-[10px] uppercase font-black text-slate-400">Total Pedidos:</span>
                <span className="text-2xl font-black text-slate-900 block">{orders.length}</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-[10px] uppercase font-black text-slate-400">Ingresos Totales:</span>
                <span className="text-2xl font-black text-emerald-600 block">
                  ${orders.reduce((sum, o) => sum + o.grandTotal, 0).toLocaleString('es-CL')}
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-[10px] uppercase font-black text-slate-400">En Confección:</span>
                <span className="text-2xl font-black text-orange-500 block">
                  {orders.filter((o) => o.status === 'En Confección' || o.status === 'Pendiente Corte').length}
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-[10px] uppercase font-black text-slate-400">Medidas Registradas:</span>
                <span className="text-2xl font-black text-sky-600 block">
                  {orders.filter((o) => o.neckSizeCm || o.chestSizeCm).length}
                </span>
              </div>
            </div>

            {/* CSV Export & Navigation Bar */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
              
              {/* Tab Navigation */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl w-full md:w-auto text-xs font-black flex-wrap">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                    activeTab === 'orders'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Pedidos ({orders.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('tailoring')}
                  className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                    activeTab === 'tailoring'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Scissors className="w-4 h-4 text-orange-400" />
                  <span>Ficha de Corte</span>
                </button>

                <button
                  onClick={() => setActiveTab('inventory')}
                  className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                    activeTab === 'inventory'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Package className="w-4 h-4 text-yellow-300" />
                  <span>Inventario &amp; Stock ({products.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('add')}
                  className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                    activeTab === 'add'
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Ingresar Pedido</span>
                </button>

                <button
                  onClick={() => setActiveTab('stock_alerts')}
                  className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                    activeTab === 'stock_alerts'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Bell className="w-4 h-4 text-amber-300" />
                  <span>Avisos de Stock ({stockAlertsList.filter((s) => !s.notified).length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('whatsapp_business')}
                  className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                    activeTab === 'whatsapp_business'
                      ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-400'
                      : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-emerald-300" />
                  <span className="font-black">API WhatsApp Business 📲</span>
                  <span className="bg-emerald-400/30 text-emerald-950 text-[9px] px-1.5 py-0.5 rounded-full font-black">
                    Auto
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('mercadolibre')}
                  className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                    activeTab === 'mercadolibre'
                      ? 'bg-yellow-400 text-slate-950 font-black shadow-md ring-2 ring-yellow-300'
                      : 'text-yellow-900 bg-yellow-100/80 hover:bg-yellow-200 border border-yellow-300'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4 text-slate-950" />
                  <span className="font-black">Mercado Libre Chile 🛍️</span>
                  <span className="bg-slate-950 text-yellow-300 text-[9px] px-1.5 py-0.5 rounded-full font-black">
                    API REST
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('mercadopago')}
                  className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                    activeTab === 'mercadopago'
                      ? 'bg-sky-600 text-white font-black shadow-md ring-2 ring-sky-300'
                      : 'text-sky-900 bg-sky-100/80 hover:bg-sky-200 border border-sky-300'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-sky-700" />
                  <span className="font-black">Agregar Credenciales de Pago 💳</span>
                  <span className="bg-sky-950 text-sky-200 text-[9px] px-1.5 py-0.5 rounded-full font-black">
                    Mercado Pago
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('push')}
                  className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                    activeTab === 'push'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Bell className="w-4 h-4 text-orange-600" />
                  <span>Difusión Push 📢</span>
                </button>

                <button
                  onClick={() => setActiveTab('subscribers')}
                  className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                    activeTab === 'subscribers'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Users className="w-4 h-4 text-purple-300" />
                  <span>Suscriptores ({subscribersList.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('cookies_tracking')}
                  className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                    activeTab === 'cookies_tracking'
                      ? 'bg-amber-600 text-white shadow-xs ring-2 ring-amber-400'
                      : 'text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300'
                  }`}
                >
                  <Cookie className="w-4 h-4 text-amber-500" />
                  <span className="font-black">Cookies &amp; Tracking 🍪</span>
                  <span className="bg-amber-400/30 text-amber-950 text-[9px] px-1.5 py-0.5 rounded-full font-black">
                    GA4/Pixel
                  </span>
                </button>

                <a
                  href="#google-business-reviews"
                  onClick={onClose}
                  className="px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-all flex items-center gap-1.5 font-black text-xs cursor-pointer"
                >
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-500" />
                  <span>Google My Business ⭐</span>
                </a>
              </div>

              {/* Direct CSV & PDF Download Buttons */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <button
                  onClick={handleExportSubscribersCSV}
                  disabled={isExportingSubscribersCSV}
                  className="flex-1 md:flex-initial bg-purple-700 hover:bg-purple-600 text-white font-black px-4 py-2.5 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer border border-purple-500 active:scale-95 disabled:opacity-50"
                  title="Descargar lista completa de correos de suscriptores en formato CSV"
                >
                  <MailCheck className="w-4 h-4 text-purple-200" />
                  <span>Suscriptores CSV ({subscribersList.length})</span>
                </button>

                <button
                  onClick={() => setIsPdfModalOpen(true)}
                  className="flex-1 md:flex-initial bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black px-4 py-2.5 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer border border-amber-300 active:scale-95"
                  title="Generar y descargar catálogo en PDF con precios y stock para WhatsApp"
                >
                  <FileText className="w-4 h-4 text-slate-950" />
                  <span>Catálogo PDF 📄</span>
                </button>

                <button
                  onClick={exportOrdersCSV}
                  className="flex-1 md:flex-initial bg-emerald-600 hover:bg-emerald-500 text-white font-black px-4 py-2.5 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md"
                  title="Descargar archivo Excel / CSV con todos los pedidos"
                >
                  <Download className="w-4 h-4" />
                  <span>Exportar Pedidos (.csv)</span>
                </button>

                <button
                  onClick={exportTailoringCSV}
                  className="flex-1 md:flex-initial bg-slate-900 hover:bg-slate-800 text-orange-400 font-black px-4 py-2.5 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all border border-slate-700"
                  title="Descargar Ficha de Corte para el taller de Rengo"
                >
                  <Dog className="w-4 h-4" />
                  <span>Ficha Taller (.csv)</span>
                </button>
              </div>

            </div>

            {/* Global Subscriber Action Alert */}
            {subscriberActionMsg && (
              <div className="p-4 bg-purple-100 border-2 border-purple-400 text-purple-950 rounded-2xl text-xs font-black flex items-center justify-between gap-2 animate-fade-in shadow-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-700 shrink-0" />
                  <span>{subscriberActionMsg}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSubscriberActionMsg(null)}
                  className="text-purple-700 hover:text-purple-950 font-black text-xs"
                >
                  Cerrar ✕
                </button>
              </div>
            )}

            {/* TAB 1: LIST OF ORDERS & STATUS MANAGEMENT */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                {/* Notification banner if CSV exported */}
                {orderActionMsg && (
                  <div className="p-3.5 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-xs font-bold text-emerald-900 flex items-center justify-between shadow-sm animate-fade-in">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{orderActionMsg}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOrderActionMsg(null)}
                      className="text-emerald-700 hover:text-emerald-950 font-black text-xs cursor-pointer ml-2"
                    >
                      Cerrar ✕
                    </button>
                  </div>
                )}

                {/* Accounting & CSV Export Hub */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-4 sm:p-5 rounded-3xl text-white shadow-md border border-slate-700/70 space-y-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <FileSpreadsheet className="w-3 h-3 text-emerald-400" />
                          Gestión Contable del Taller
                        </span>
                        <span className="text-[11px] text-slate-400">Taller Rengo, Chile</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                        Exportación de Pedidos a CSV &amp; Balance
                      </h3>
                      <p className="text-xs text-slate-300 max-w-xl">
                        Descarga el listado oficial de pedidos a formato CSV con codificación UTF-8 compatible con Excel, Google Sheets y software contable.
                      </p>
                    </div>

                    {/* Export Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        disabled={isExportingOrdersCSV || filteredOrders.length === 0}
                        onClick={() => handleExportOrdersCSV('filtered')}
                        className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                        title="Descargar archivo CSV de los pedidos filtrados actualmente"
                      >
                        <Download className="w-4 h-4 text-slate-950" />
                        <span>Exportar CSV Contable ({filteredOrders.length})</span>
                      </button>

                      {orders.length !== filteredOrders.length && (
                        <button
                          type="button"
                          disabled={isExportingOrdersCSV}
                          onClick={() => handleExportOrdersCSV('all')}
                          className="px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 border border-white/20 active:scale-95 transition-all cursor-pointer"
                          title="Exportar todos los pedidos históricos sin filtros"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Exportar Todo ({orders.length})</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setShowAccountingBreakdown(!showAccountingBreakdown)}
                        className="px-3 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-600 transition-all cursor-pointer"
                        title="Ver desglose por medios de pago y estado"
                      >
                        <Sliders className="w-3.5 h-3.5 text-amber-400" />
                        <span>{showAccountingBreakdown ? 'Ocultar Resumen' : 'Ver Resumen'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Accounting KPI Summary Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-slate-700/60">
                    <div className="bg-slate-800/70 rounded-2xl p-3 border border-slate-700/60">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Pedidos Listados</span>
                      <span className="text-lg font-black text-white font-mono">{filteredOrders.length} <span className="text-xs text-slate-400 font-normal">/ {orders.length}</span></span>
                    </div>
                    <div className="bg-slate-800/70 rounded-2xl p-3 border border-slate-700/60">
                      <span className="text-[10px] font-bold text-emerald-400 block uppercase">Ventas Filtradas</span>
                      <span className="text-lg font-black text-emerald-400 font-mono">${accountingSummary.totalAmountCLP.toLocaleString('es-CL')}</span>
                    </div>
                    <div className="bg-slate-800/70 rounded-2xl p-3 border border-slate-700/60">
                      <span className="text-[10px] font-bold text-amber-300 block uppercase">Ticket Promedio</span>
                      <span className="text-lg font-black text-amber-300 font-mono">${accountingSummary.averageTicketCLP.toLocaleString('es-CL')}</span>
                    </div>
                    <div className="bg-slate-800/70 rounded-2xl p-3 border border-slate-700/60">
                      <span className="text-[10px] font-bold text-sky-300 block uppercase">Total Histórico</span>
                      <span className="text-lg font-black text-sky-300 font-mono">${totalHistoricalSummary.totalAmountCLP.toLocaleString('es-CL')}</span>
                    </div>
                  </div>

                  {/* Accounting Breakdown Collapsible */}
                  {showAccountingBreakdown && (
                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-700/80 space-y-3 animate-fade-in text-xs">
                      <h4 className="text-xs font-black uppercase text-amber-300 tracking-wider">
                        Desglose Contable por Método de Pago &amp; Estado
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Payment methods */}
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-bold text-slate-400 block">Medios de Pago:</span>
                          <div className="space-y-1">
                            {Object.entries(accountingSummary.byPaymentMethod).map(([method, data]) => (
                              <div key={method} className="flex items-center justify-between py-1.5 px-2.5 rounded-xl bg-slate-900 border border-slate-800">
                                <span className="font-semibold text-slate-200">{method}</span>
                                <span className="font-mono text-emerald-400 font-bold">
                                  {data.count} ped. (${data.totalCLP.toLocaleString('es-CL')})
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* By Status */}
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-bold text-slate-400 block">Por Estado de Confección:</span>
                          <div className="space-y-1">
                            {Object.entries(accountingSummary.byStatus).map(([statusName, data]) => (
                              <div key={statusName} className="flex items-center justify-between py-1.5 px-2.5 rounded-xl bg-slate-900 border border-slate-800">
                                <span className="font-semibold text-slate-200">{statusName}</span>
                                <span className="font-mono text-sky-300 font-bold">
                                  {data.count} ped. (${data.totalCLP.toLocaleString('es-CL')})
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Search & Status Filters */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      placeholder="Buscar por cliente, pedido, comuna o mascota..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 outline-hidden"
                    />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-800 outline-hidden cursor-pointer"
                  >
                    <option value="all">Todos los Estados</option>
                    <option value="Pendiente Corte">Pendiente Corte</option>
                    <option value="En Confección">En Confección</option>
                    <option value="Listo Envíos">Listo Envíos</option>
                    <option value="Despachado">Despachado</option>
                  </select>
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-medium text-slate-700">
                      <thead className="bg-slate-900 text-slate-200 uppercase text-[10px] font-black tracking-wider">
                        <tr>
                          <th className="p-4">Pedido #</th>
                          <th className="p-4">Fecha</th>
                          <th className="p-4">Cliente &amp; Contacto</th>
                          <th className="p-4">Comuna &amp; Dirección</th>
                          <th className="p-4">Mascota &amp; Medidas</th>
                          <th className="p-4">Seguimiento Logístico</th>
                          <th className="p-4">Total</th>
                          <th className="p-4">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredOrders.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="p-8 text-center text-slate-400 font-bold">
                              No se encontraron pedidos con el filtro actual.
                            </td>
                          </tr>
                        ) : (
                          filteredOrders.map((ord) => {
                            const trackingCode = ord.trackingNumber || `BX-${ord.orderNumber.replace(/\D/g, '') || '748291'}`;
                            const courierName = ord.trackingCourier || ord.courierName || 'Blue Express';
                            const isCopied = copiedCodeId === ord.id;

                            return (
                              <tr key={ord.id} className="hover:bg-orange-50/50 transition-colors">
                                <td className="p-4 font-mono font-black text-slate-900 whitespace-nowrap">
                                  <div className="flex items-center gap-1.5">
                                    <span>{ord.orderNumber}</span>
                                    {onOpenTrackingModal && (
                                      <button
                                        type="button"
                                        onClick={() => onOpenTrackingModal(trackingCode || ord.orderNumber)}
                                        className="p-1 text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-md transition-colors"
                                        title="Ver estado de rastreo en vivo"
                                      >
                                        <Truck className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </td>
                                <td className="p-4 text-slate-500 whitespace-nowrap font-bold">
                                  {ord.date}
                                </td>
                                <td className="p-4 space-y-0.5">
                                  <strong className="text-slate-900 block font-bold">{ord.customerName}</strong>
                                  <span className="text-[11px] text-slate-500 block font-mono">{ord.customerPhone}</span>
                                  <span className="text-[10px] text-slate-400 block">{ord.customerEmail}</span>
                                </td>
                                <td className="p-4 space-y-0.5">
                                  <span className="font-bold text-orange-600 block">{ord.commune}</span>
                                  <span className="text-[10px] text-slate-400 truncate max-w-[140px] block">{ord.shippingAddress}</span>
                                </td>
                                <td className="p-4 space-y-1">
                                  {ord.petName ? (
                                    <div>
                                      <span className="font-extrabold text-slate-900 block">
                                        🐾 {ord.petName} ({ord.petBreed || 'Mascota'})
                                      </span>
                                      <div className="text-[10px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md inline-block">
                                        A:{ord.neckSizeCm || '-'}cm | B:{ord.chestSizeCm || '-'}cm | C:{ord.backSizeCm || '-'}cm
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-slate-400 italic">Estándar / Sin medidas</span>
                                  )}
                                </td>

                                {/* Tracking & Logistics Management Column */}
                                <td className="p-4 space-y-1.5 min-w-[200px]">
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-900 text-yellow-300">
                                      🚚 {courierName}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditTracking(ord)}
                                      className="text-[10px] text-blue-600 hover:text-blue-800 font-bold underline flex items-center gap-0.5 cursor-pointer"
                                      title="Editar código de seguimiento y courier"
                                    >
                                      <Edit3 className="w-3 h-3" />
                                      <span>Editar</span>
                                    </button>
                                  </div>

                                  <div className="flex items-center justify-between bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
                                    <span className="font-mono font-black text-slate-800 text-[11px] truncate">
                                      {trackingCode}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleCopyCode(trackingCode, ord.id)}
                                      className="p-1 text-slate-400 hover:text-slate-700 bg-white rounded-sm border border-slate-200 ml-1 cursor-pointer"
                                      title="Copiar código de seguimiento"
                                    >
                                      {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                    </button>
                                  </div>

                                  {/* WhatsApp notify link with tracking code */}
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleQuickSendOrderWhatsApp(ord, 'tracking')}
                                      className="text-[10px] text-emerald-800 hover:text-white hover:bg-emerald-600 font-extrabold flex items-center gap-1 bg-emerald-100/80 border border-emerald-300 px-2 py-0.5 rounded-md transition-all cursor-pointer"
                                      title="Despachar notificación de courier automática vía WhatsApp Business API"
                                    >
                                      <Smartphone className="w-3 h-3 text-emerald-700" />
                                      <span>Auto WABA</span>
                                    </button>

                                    <a
                                      href={`https://wa.me/${ord.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                        `Hola ${ord.customerName}! 🐾 Te informamos que tu pedido de petsimona25 (${ord.orderNumber}) tiene código de seguimiento ${trackingCode} por ${courierName}. Puedes rastrearlo en https://petsimona25.cl o directamente con el courier. ¡Gracias por confiar en nuestra confección artesanal en Rengo!`
                                      )}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-[10px] text-emerald-700 hover:text-emerald-900 font-extrabold flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-md"
                                      title="Abrir chat en WhatsApp Web"
                                    >
                                      <MessageSquare className="w-3 h-3 fill-emerald-600" />
                                      <span>wa.me</span>
                                    </a>

                                    {onOpenTrackingModal && (
                                      <button
                                        type="button"
                                        onClick={() => onOpenTrackingModal(trackingCode)}
                                        className="text-[10px] text-orange-700 hover:text-orange-900 font-bold underline"
                                      >
                                        Rastreo
                                      </button>
                                    )}
                                  </div>
                                </td>

                                <td className="p-4 whitespace-nowrap">
                                  <div className="space-y-1">
                                    <span className="font-mono font-black text-emerald-600 block">
                                      ${ord.grandTotal.toLocaleString('es-CL')}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-600 inline-flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200">
                                      <CreditCard className="w-2.5 h-2.5 text-slate-500" />
                                      <span>{ord.paymentMethod || 'Mercado Pago'}</span>
                                    </span>
                                  </div>
                                </td>
                                <td className="p-4 whitespace-nowrap">
                                  <select
                                    value={ord.status}
                                    onChange={(e) => onUpdateOrderStatus(ord.id, e.target.value as AdminOrder['status'])}
                                    className={`text-[11px] font-black px-3 py-1.5 rounded-xl border outline-hidden transition-colors ${
                                      ord.status === 'En Confección'
                                        ? 'bg-orange-100 text-orange-800 border-orange-300'
                                        : ord.status === 'Listo Envíos'
                                        ? 'bg-yellow-100 text-yellow-900 border-yellow-300'
                                        : ord.status === 'Despachado'
                                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                        : 'bg-slate-100 text-slate-800 border-slate-300'
                                    }`}
                                  >
                                    <option value="Pendiente Corte">Pendiente Corte</option>
                                    <option value="En Confección">En Confección</option>
                                    <option value="Listo Envíos">Listo Envíos</option>
                                    <option value="Despachado">Despachado</option>
                                  </select>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: PRODUCTION TAILORING SHEET (MEASUREMENTS FOCUS) */}
            {activeTab === 'tailoring' && (
              <div className="space-y-4">
                <div className="bg-orange-50 border-2 border-orange-200 p-4 rounded-2xl flex items-center justify-between text-xs font-bold text-orange-950">
                  <div className="flex items-center gap-3">
                    <Dog className="w-5 h-5 text-orange-600" />
                    <span>Ficha de Corte Artesanal: Medidas exactas de Cuello (A), Pecho (B) y Largo de Lomo (C).</span>
                  </div>
                  <button
                    onClick={exportTailoringCSV}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar Ficha (.csv)</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {orders.map((ord) => (
                    <div key={ord.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                      <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                        <div>
                          <span className="text-[10px] font-mono text-orange-600 font-bold block">{ord.orderNumber}</span>
                          <h4 className="font-black text-slate-900 text-base">
                            🐾 {ord.petName || 'Mascota'} <span className="text-xs text-slate-500 font-normal">({ord.petBreed || 'Mestizo'})</span>
                          </h4>
                        </div>
                        <span className="text-[10px] font-black uppercase bg-slate-900 text-yellow-400 px-2.5 py-1 rounded-full">
                          {ord.status}
                        </span>
                      </div>

                      {/* 3 Key Measurements Grid */}
                      <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl text-center border border-slate-100">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">Cuello (A)</span>
                          <span className="text-sm font-black font-mono text-slate-900">{ord.neckSizeCm || '-'} cm</span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">Pecho (B)</span>
                          <span className="text-sm font-black font-mono text-orange-600">{ord.chestSizeCm || '-'} cm</span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">Largo (C)</span>
                          <span className="text-sm font-black font-mono text-slate-900">{ord.backSizeCm || '-'} cm</span>
                        </div>
                      </div>

                      <div className="space-y-1 text-xs">
                        <span className="text-[10px] uppercase font-black text-slate-400 block">Prendas Pedidas:</span>
                        <p className="font-bold text-slate-800">{ord.itemsSummary}</p>
                      </div>

                      {ord.specialNotes && (
                        <div className="bg-yellow-50 border border-yellow-200 p-2.5 rounded-xl text-[11px] text-yellow-900 font-medium leading-relaxed">
                          <strong>Observación Taller:</strong> {ord.specialNotes}
                        </div>
                      )}

                      <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-500">
                        <span>Cliente: {ord.customerName} ({ord.commune})</span>
                        <a
                          href={`https://wa.me/${ord.customerPhone.replace(/[^0-9]/g, '')}?text=Hola%20${encodeURIComponent(ord.customerName)},%20te%20escribo%20de%20petsimona25.cl%20sobre%20las%20medidas%20de%20${encodeURIComponent(ord.petName || 'tu mascota')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-700 font-bold hover:underline"
                        >
                          WhatsApp: {ord.customerPhone}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: INVENTORY & STOCK MANAGEMENT */}
            {activeTab === 'inventory' && (
              <div className="space-y-5 animate-fade-in">
                {/* PDF Catalog WhatsApp Banner */}
                <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-5 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 bg-slate-900/30 px-3 py-1 rounded-full text-[11px] font-black uppercase text-yellow-200">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Catálogo Digital en PDF para WhatsApp</span>
                    </div>
                    <h4 className="text-xl font-black tracking-tight">
                      Catálogo Oficial petsimona25 ({products.length} Productos) 📄
                    </h4>
                    <p className="text-xs text-orange-100 max-w-xl font-medium">
                      Genera y descarga el archivo PDF listo para compartir por WhatsApp con fotos, precios en CLP, tallas y stock actualizados para tus clientes.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto shrink-0">
                    <button
                      type="button"
                      onClick={handleQuickDownloadCatalogPDF}
                      disabled={isQuickDownloadingPdf}
                      className="flex-1 sm:flex-initial bg-slate-950 hover:bg-slate-900 text-yellow-300 font-black text-xs px-4 py-2.5 rounded-xl border border-yellow-400/40 shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                      <Download className="w-4 h-4 text-yellow-400" />
                      <span>{isQuickDownloadingPdf ? 'Generando PDF...' : 'Descargar PDF Rápido'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsPdfModalOpen(true)}
                      className="flex-1 sm:flex-initial bg-white hover:bg-slate-100 text-slate-900 font-black text-xs px-4 py-2.5 rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                    >
                      <Share2 className="w-4 h-4 text-emerald-600" />
                      <span>Personalizar &amp; Enviar</span>
                    </button>
                  </div>
                </div>

                {/* Google Sheets Articles Export Section */}
                <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-3xl p-5 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 bg-black/25 px-3 py-1 rounded-full text-[11px] font-black uppercase text-emerald-200">
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Planilla de Artículos en Venta para Google Sheets &amp; Excel</span>
                    </div>
                    <h4 className="text-xl font-black tracking-tight">
                      Descargar Artículos en Venta a Google Sheets 📊
                    </h4>
                    <p className="text-xs text-emerald-100 max-w-xl font-medium">
                      Exporta todo el catálogo ({products.length} artículos en venta) con ID, categoría, precios en CLP, stock, tallas y valoraciones para gestión contable y control en la nube.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0">
                    <button
                      type="button"
                      onClick={handleExportInventoryGoogleSheets}
                      disabled={isExportingGoogleSheets}
                      className="flex-1 sm:flex-initial bg-white hover:bg-emerald-50 text-emerald-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                      title="Descargar archivo CSV estructurado listo para abrir o importar en Google Sheets"
                    >
                      <Download className="w-4 h-4 text-emerald-700" />
                      <span>Descargar CSV Google Sheets</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyInventoryGoogleSheets}
                      className="flex-1 sm:flex-initial bg-emerald-950/60 hover:bg-emerald-950 text-white font-black text-xs px-3.5 py-2.5 rounded-xl border border-emerald-400/40 shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                      title="Copiar datos tabulares en el portapapeles para pegar con Ctrl+V directo en una celda de Google Sheets"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar (Ctrl+V)</span>
                    </button>

                    <button
                      type="button"
                      onClick={openNewGoogleSheet}
                      className="flex-1 sm:flex-initial bg-emerald-800 hover:bg-emerald-900 text-yellow-300 font-black text-xs px-3.5 py-2.5 rounded-xl border border-yellow-400/30 shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                      title="Abrir hoja nueva en Google Sheets en una pestaña"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>sheets.new</span>
                    </button>
                  </div>
                </div>

                {googleSheetsExportMsg && (
                  <div className="p-3.5 bg-emerald-100 border-2 border-emerald-400 text-emerald-950 rounded-2xl text-xs font-black flex items-center justify-between gap-2 animate-fade-in shadow-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{googleSheetsExportMsg}</span>
                    </div>
                    <button
                      type="button"
                      onClick={openNewGoogleSheet}
                      className="text-[11px] underline text-emerald-800 hover:text-emerald-950 font-extrabold flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <span>Abrir Google Sheets</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {pdfQuickMessage && (
                  <div className="p-3.5 bg-emerald-100 border-2 border-emerald-400 text-emerald-950 rounded-2xl text-xs font-black flex items-center gap-2 animate-fade-in">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{pdfQuickMessage}</span>
                  </div>
                )}

                <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      placeholder="Buscar producto por nombre o categoría..."
                      value={productSearchTerm}
                      onChange={(e) => setProductSearchTerm(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-900 outline-hidden"
                    />
                  </div>

                  {onOpenAddProduct && (
                    <button
                      onClick={onOpenAddProduct}
                      className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-black px-4 py-2.5 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Nuevo Producto</span>
                    </button>
                  )}
                </div>

                {/* Products Table/Card Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products
                    .filter((p) => {
                      const term = productSearchTerm.toLowerCase();
                      return p.name.toLowerCase().includes(term) || p.category.toLowerCase().includes(term);
                    })
                    .map((prod) => {
                      const isAvailable = prod.inStock && (prod.stock === undefined || prod.stock > 0);
                      const stockCount = prod.stock !== undefined ? prod.stock : (prod.inStock ? 10 : 0);

                      return (
                        <div
                          key={prod.id}
                          className={`p-4 rounded-3xl border-2 transition-all space-y-3 bg-white shadow-xs ${
                            isAvailable ? 'border-slate-200' : 'border-red-200 bg-red-50/30'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={prod.imageUrl}
                              alt={getProductImageAlt(prod)}
                              title={`${prod.name} | Taller petsimona25 Rengo`}
                              referrerPolicy="no-referrer"
                              className={`w-16 h-16 rounded-2xl object-cover border ${
                                isAvailable ? 'border-slate-200' : 'border-red-200 grayscale-40'
                              }`}
                            />

                            <div className="flex-1 min-w-0">
                              <span className="text-[10px] uppercase font-black tracking-wider text-orange-600 block">
                                {prod.category}
                              </span>
                              <h4 className="font-black text-slate-900 text-sm truncate">
                                {prod.name}
                              </h4>
                              <p className="text-xs font-black text-slate-700">
                                ${(prod.price || 0).toLocaleString('es-CL')} CLP
                              </p>
                            </div>

                            {/* Edit Button */}
                            {onEditProduct && (
                              <button
                                onClick={() => onEditProduct(prod)}
                                className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl border border-blue-200 text-xs font-black flex items-center gap-1 shrink-0"
                                title="Editar producto completo"
                              >
                                <Edit3 className="w-4 h-4" />
                                <span className="hidden sm:inline">Editar</span>
                              </button>
                            )}
                          </div>

                          {/* Availability & Stock Row with Quick Action */}
                          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {isAvailable ? (
                                <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  Disponible ({stockCount} un.)
                                </span>
                              ) : (
                                <span className="bg-red-100 text-red-800 border border-red-300 text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1">
                                  <Ban className="w-3 h-3 text-red-600" />
                                  Agotado (0 un.)
                                </span>
                              )}
                            </div>

                            {/* Quick Actions */}
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveTab('mercadolibre');
                                }}
                                className="text-[10px] font-black uppercase px-2.5 py-1 rounded-xl transition-colors bg-yellow-100 text-yellow-900 border border-yellow-300 hover:bg-yellow-200 flex items-center gap-1 cursor-pointer"
                                title="Ver o sincronizar en Mercado Libre"
                              >
                                <ShoppingBag className="w-3 h-3 text-slate-900" />
                                <span>Mercado Libre</span>
                              </button>

                              {onToggleProductStock && (
                                <button
                                  onClick={() => onToggleProductStock(prod.id, !isAvailable)}
                                  className={`text-[10px] font-black uppercase px-3 py-1 rounded-xl transition-colors border ${
                                    isAvailable
                                      ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                                      : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                  }`}
                                >
                                  {isAvailable ? 'Marcar Agotado' : 'Habilitar Stock'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* TAB 4: ADD MANUAL ORDER FORM */}
            {activeTab === 'add' && (
              <form onSubmit={handleCreateOrderSubmit} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
                <div>
                  <h4 className="text-lg font-black text-slate-900">Ingresar Nuevo Pedido de Confección</h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Registra pedidos recibidos por WhatsApp, Instagram o presencialmente en el taller de Rengo.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
                  <div>
                    <label className="block text-slate-700 mb-1">Nombre Cliente *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Constanza Silva"
                      value={newCustomerName}
                      onChange={(e) => setNewCustomerName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1">Teléfono / WhatsApp</label>
                    <input
                      type="text"
                      placeholder="Ej: +56972374764"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      placeholder="cliente@correo.cl"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1">Comuna de Entrega</label>
                    <input
                      type="text"
                      placeholder="Ej: Rengo / Rosario / Rancagua / Santiago"
                      value={newCommune}
                      onChange={(e) => setNewCommune(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 outline-hidden"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 mb-1">Resumen de Productos *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: 1x Impermeable Térmico Simona Shield (Talla a la Medida)"
                      value={newItemsSummary}
                      onChange={(e) => setNewItemsSummary(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 outline-hidden"
                    />
                  </div>
                </div>

                {/* Pet Specific Fields */}
                <div className="bg-orange-50/80 p-4 rounded-2xl border border-orange-200 space-y-4">
                  <span className="text-xs font-black text-orange-950 uppercase tracking-wider block">
                    🐾 Ficha de Medidas de la Mascota
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold">
                    <div>
                      <label className="block text-slate-700 mb-1">Nombre Mascota</label>
                      <input
                        type="text"
                        placeholder="Ej: Simona"
                        value={newPetName}
                        onChange={(e) => setNewPetName(e.target.value)}
                        className="w-full bg-white border border-orange-200 rounded-xl p-2.5 text-slate-900 outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 mb-1">Raza o Tipo</label>
                      <input
                        type="text"
                        placeholder="Ej: Yorkshire Terrier / Poodle Toy"
                        value={newPetBreed}
                        onChange={(e) => setNewPetBreed(e.target.value)}
                        className="w-full bg-white border border-orange-200 rounded-xl p-2.5 text-slate-900 outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-xs font-bold">
                    <div>
                      <label className="block text-slate-700 mb-1">Cuello (A) cm</label>
                      <input
                        type="number"
                        value={newNeckSize}
                        onChange={(e) => setNewNeckSize(Number(e.target.value))}
                        className="w-full bg-white border border-orange-200 rounded-xl p-2.5 text-slate-900 outline-hidden font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 mb-1">Pecho (B) cm</label>
                      <input
                        type="number"
                        value={newChestSize}
                        onChange={(e) => setNewChestSize(Number(e.target.value))}
                        className="w-full bg-white border border-orange-200 rounded-xl p-2.5 text-slate-900 outline-hidden font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 mb-1">Largo (C) cm</label>
                      <input
                        type="number"
                        value={newBackSize}
                        onChange={(e) => setNewBackSize(Number(e.target.value))}
                        className="w-full bg-white border border-orange-200 rounded-xl p-2.5 text-slate-900 outline-hidden font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Observaciones Ergonómicas o Telas</label>
                    <textarea
                      rows={2}
                      placeholder="Ej: Piel sensible, usar forro hipoalergénico suave..."
                      value={newSpecialNotes}
                      onChange={(e) => setNewSpecialNotes(e.target.value)}
                      className="w-full bg-white border border-orange-200 rounded-xl p-2.5 text-xs font-medium text-slate-900 outline-hidden"
                    />
                  </div>
                </div>

                {/* Logistics & Tracking Code Settings for Manual Order */}
                <div className="bg-blue-50/80 p-4 rounded-2xl border border-blue-200 space-y-4">
                  <span className="text-xs font-black text-blue-950 uppercase tracking-wider block flex items-center gap-2">
                    <Truck className="w-4 h-4 text-blue-600" />
                    <span>Logística &amp; Código de Seguimiento</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold">
                    <div>
                      <label className="block text-slate-700 mb-1">Empresa de Transporte / Courier</label>
                      <select
                        value={newTrackingCourier}
                        onChange={(e) => setNewTrackingCourier(e.target.value)}
                        className="w-full bg-white border border-blue-200 rounded-xl p-2.5 text-slate-900 outline-hidden font-bold"
                      >
                        <option value="Blue Express">Blue Express</option>
                        <option value="Chilexpress">Chilexpress</option>
                        <option value="Starken">Starken</option>
                        <option value="Correos de Chile">Correos de Chile</option>
                        <option value="Retiro en Taller (Los Silos)">Retiro en Taller (Los Silos, Rengo)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 mb-1">Código de Seguimiento (Opcional)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Ej: BX-748920194 o autogenerado..."
                          value={newTrackingCode}
                          onChange={(e) => setNewTrackingCode(e.target.value)}
                          className="w-full bg-white border border-blue-200 rounded-xl p-2.5 text-slate-900 outline-hidden font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const num = Math.floor(100000 + Math.random() * 900000);
                            if (newTrackingCourier.includes('Chile')) setNewTrackingCode(`CX-${num}192`);
                            else if (newTrackingCourier.includes('Starken')) setNewTrackingCode(`SK-${num}48`);
                            else if (newTrackingCourier.includes('Correo')) setNewTrackingCode(`CC-${num}33`);
                            else if (newTrackingCourier.includes('Retiro')) setNewTrackingCode(`RET-RENGO-${num}`);
                            else setNewTrackingCode(`BX-${num}194`);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 rounded-xl text-[10px] font-black uppercase whitespace-nowrap cursor-pointer"
                        >
                          Generar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('orders')}
                    className="px-5 py-3 bg-slate-100 text-slate-700 font-extrabold rounded-2xl text-xs uppercase"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-2xl text-xs uppercase shadow-md"
                  >
                    Guardar Pedido en Lista
                  </button>
                </div>
              </form>
            )}

            {/* TAB: PUSH NOTIFICATIONS BROADCAST CENTER */}
            {activeTab === 'push' && (
              <div className="space-y-6 animate-fade-in">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 bg-slate-900/30 px-3 py-1 rounded-full text-xs font-black uppercase text-yellow-300">
                      <Radio className="w-3.5 h-3.5 animate-pulse" />
                      <span>Transmisor Web Push en Tiempo Real</span>
                    </div>
                    <h3 className="text-2xl font-black tracking-tight">
                      Centro de Difusión de Alertas Push 🔔
                    </h3>
                    <p className="text-xs text-orange-100 max-w-xl font-medium">
                      Envía notificaciones push directamente al navegador y pantalla de tus clientes tutores para avisarles sobre promociones, reposición de telas y estado de sus pedidos en Rengo.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      sendWebPushNotification({
                        title: '👑 petsimona25: Mensaje de Taller Rengo',
                        body: 'Prueba de difusión emitida con éxito desde el Panel de Control.',
                        category: 'sistema',
                      });
                      setPushSuccessMsg('¡Notificación de prueba emitida al navegador!');
                      setTimeout(() => setPushSuccessMsg(null), 3000);
                    }}
                    className="bg-slate-900 hover:bg-slate-800 text-yellow-300 font-black text-xs px-5 py-3 rounded-2xl border border-yellow-400/40 shadow-md flex items-center gap-2 transition-all active:scale-95 cursor-pointer shrink-0"
                  >
                    <Send className="w-4 h-4 text-yellow-400" />
                    <span>Emitir Alerta de Prueba</span>
                  </button>
                </div>

                {pushSuccessMsg && (
                  <div className="bg-emerald-100 border-2 border-emerald-400 text-emerald-900 p-4 rounded-2xl font-black text-xs flex items-center gap-2 animate-fade-in">
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>{pushSuccessMsg}</span>
                  </div>
                )}

                {customPushSuccessMsg && (
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4 rounded-3xl font-black text-xs sm:text-sm flex items-center justify-between gap-3 shadow-lg animate-fade-in">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                        <CheckCheck className="w-5 h-5 text-white" />
                      </div>
                      <span>{customPushSuccessMsg}</span>
                    </div>
                    <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-extrabold shrink-0">
                      Entregado Web Push 🔔
                    </span>
                  </div>
                )}

                {/* MASTER SECTION: Custom Manual Push Notifications to Registered Users */}
                <div className="bg-gradient-to-b from-amber-50/70 via-white to-orange-50/40 rounded-3xl p-6 border-2 border-orange-300 shadow-md space-y-6">
                  {/* Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-orange-200 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-orange-500 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Nueva Configuración
                        </span>
                        <span className="bg-amber-100 text-amber-900 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-amber-300">
                          {uniqueRegisteredEmails.length} Usuarios Registrados
                        </span>
                      </div>
                      <h4 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <span>Notificaciones Push Manuales Personalizadas (Ofertas Flash &amp; Avisos)</span>
                        <span className="text-orange-500">⚡</span>
                      </h4>
                      <p className="text-xs text-slate-600 font-medium max-w-2xl">
                        Redacta y difunde notificaciones push instantáneas con vista previa en vivo a todos los tutores registrados (newsletter y compradores del taller). Incluye cupones flash, enlaces directos al catálogo y sonido interactivo.
                      </p>
                    </div>

                    {/* Quick Suggestions Chips */}
                    <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setCustomPushTitle('⚡ ¡Oferta Flash 24H: 25% OFF en Capas de Invierno!');
                          setCustomPushBody('Solo por 24 horas: 25% de descuento en confecciones térmicas a medida en Rengo. Usa el cupón FLASH25.');
                          setCustomPushCoupon('FLASH25');
                          setCustomPushCategory('promocion');
                          setCustomPushActionLabel('Aprovechar Oferta Flash');
                        }}
                        className="text-[10px] bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold px-2.5 py-1 rounded-lg border border-amber-300 cursor-pointer transition-colors"
                      >
                        ⚡ Oferta Flash 24H
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCustomPushTitle('🧵 Nueva Colección Polar Soft en Rengo');
                          setCustomPushBody('Llegaron telas térmicas ultra-suaves para días fríos. Personaliza la ropa de tu mascota con sus medidas.');
                          setCustomPushCoupon('POLAR15');
                          setCustomPushCategory('stock');
                          setCustomPushActionLabel('Ver Colección');
                        }}
                        className="text-[10px] bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-bold px-2.5 py-1 rounded-lg border border-emerald-300 cursor-pointer transition-colors"
                      >
                        🧵 Nueva Colección
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCustomPushTitle('🎁 Envíos Gratis a Comunas de O’Higgins');
                          setCustomPushBody('Por compras superiores a $20.000, despacho gratis a Rengo, Rancagua, San Fernando y Requínoa.');
                          setCustomPushCoupon('ENVIOGRATIS');
                          setCustomPushCategory('promocion');
                          setCustomPushActionLabel('Comprar con Despacho Gratis');
                        }}
                        className="text-[10px] bg-blue-100 hover:bg-blue-200 text-blue-950 font-bold px-2.5 py-1 rounded-lg border border-blue-300 cursor-pointer transition-colors"
                      >
                        🚚 Despacho Gratis
                      </button>
                    </div>
                  </div>

                  {/* Two-column layout: Form vs. Live Preview & History */}
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                    {/* Left: Custom Push Form (7 Cols) */}
                    <div className="xl:col-span-7 space-y-4">
                      {/* Target Audience Selector */}
                      <div className="p-4 rounded-2xl bg-white border-2 border-orange-200 shadow-xs space-y-2">
                        <label className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-orange-600" />
                            1. Audiencia / Destinatarios Registrados *
                          </span>
                          <span className="text-[11px] font-mono font-bold text-orange-700">
                            {getTargetAudienceRecipients(customPushTargetAudience).length} tutores seleccionados
                          </span>
                        </label>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <label
                            className={`p-3 rounded-xl border-2 flex flex-col justify-between cursor-pointer transition-all ${
                              customPushTargetAudience === 'all'
                                ? 'border-orange-500 bg-orange-50/80 ring-2 ring-orange-200'
                                : 'border-slate-200 bg-slate-50 hover:bg-orange-50/30'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-black text-slate-900 flex items-center gap-1.5">
                                <Radio className="w-3.5 h-3.5 text-orange-600" />
                                Todos los Registrados
                              </span>
                              <input
                                type="radio"
                                name="customAudience"
                                value="all"
                                checked={customPushTargetAudience === 'all'}
                                onChange={() => setCustomPushTargetAudience('all')}
                                className="accent-orange-600"
                              />
                            </div>
                            <p className="text-[10px] text-slate-600 font-medium mt-1">
                              Newsletter ({subscribersList.length}) + Compradores ({orders.length}) sin duplicados.
                            </p>
                          </label>

                          <label
                            className={`p-3 rounded-xl border-2 flex flex-col justify-between cursor-pointer transition-all ${
                              customPushTargetAudience === 'vip_club'
                                ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-200'
                                : 'border-slate-200 bg-slate-50 hover:bg-amber-50/30'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-black text-slate-900 flex items-center gap-1.5">
                                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                Club VIP / Frecuentes
                              </span>
                              <input
                                type="radio"
                                name="customAudience"
                                value="vip_club"
                                checked={customPushTargetAudience === 'vip_club'}
                                onChange={() => setCustomPushTargetAudience('vip_club')}
                                className="accent-amber-600"
                              />
                            </div>
                            <p className="text-[10px] text-slate-600 font-medium mt-1">
                              Suscriptores con planes premium o tutores de alta lealtad.
                            </p>
                          </label>

                          <label
                            className={`p-3 rounded-xl border-2 flex flex-col justify-between cursor-pointer transition-all ${
                              customPushTargetAudience === 'small_dogs'
                                ? 'border-teal-500 bg-teal-50/80 ring-2 ring-teal-200'
                                : 'border-slate-200 bg-slate-50 hover:bg-teal-50/30'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-black text-slate-900 flex items-center gap-1.5">
                                <Dog className="w-3.5 h-3.5 text-teal-600" />
                                Razas Pequeñas
                              </span>
                              <input
                                type="radio"
                                name="customAudience"
                                value="small_dogs"
                                checked={customPushTargetAudience === 'small_dogs'}
                                onChange={() => setCustomPushTargetAudience('small_dogs')}
                                className="accent-teal-600"
                              />
                            </div>
                            <p className="text-[10px] text-slate-600 font-medium mt-1">
                              Yorkshire, Poodle, Chihuahua, Maltés y razas mini.
                            </p>
                          </label>

                          <label
                            className={`p-3 rounded-xl border-2 flex flex-col justify-between cursor-pointer transition-all ${
                              customPushTargetAudience === 'past_buyers'
                                ? 'border-blue-500 bg-blue-50/80 ring-2 ring-blue-200'
                                : 'border-slate-200 bg-slate-50 hover:bg-blue-50/30'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-black text-slate-900 flex items-center gap-1.5">
                                <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
                                Clientes con Compras
                              </span>
                              <input
                                type="radio"
                                name="customAudience"
                                value="past_buyers"
                                checked={customPushTargetAudience === 'past_buyers'}
                                onChange={() => setCustomPushTargetAudience('past_buyers')}
                                className="accent-blue-600"
                              />
                            </div>
                            <p className="text-[10px] text-slate-600 font-medium mt-1">
                              Tutores con pedidos procesados en taller de costura.
                            </p>
                          </label>
                        </div>
                      </div>

                      {/* Title & Body */}
                      <div className="p-4 rounded-2xl bg-white border-2 border-orange-200 shadow-xs space-y-3">
                        <div>
                          <label className="text-xs font-black text-slate-900 uppercase tracking-wider block mb-1">
                            Título Personalizado de la Notificación *
                          </label>
                          <input
                            type="text"
                            required
                            value={customPushTitle}
                            onChange={(e) => setCustomPushTitle(e.target.value)}
                            placeholder="Ej. ⚡ ¡Oferta Flash 24H: 25% OFF en Capas de Invierno!"
                            className="w-full p-2.5 rounded-xl border-2 border-slate-200 focus:border-orange-500 text-xs font-bold text-slate-900 outline-hidden bg-slate-50/50"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center justify-between mb-1">
                            <span>Mensaje Principal / Oferta *</span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {customPushBody.length} caracteres
                            </span>
                          </label>
                          <textarea
                            rows={3}
                            required
                            value={customPushBody}
                            onChange={(e) => setCustomPushBody(e.target.value)}
                            placeholder="Escribe el mensaje claro y persuasivo para tus clientes tutores..."
                            className="w-full p-2.5 rounded-xl border-2 border-slate-200 focus:border-orange-500 text-xs font-medium text-slate-900 outline-hidden bg-slate-50/50"
                          />
                        </div>

                        {/* Category & Coupon & URL */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                          <div>
                            <label className="text-[11px] font-black text-slate-700 uppercase block mb-1">
                              Categoría de Alerta
                            </label>
                            <select
                              value={customPushCategory}
                              onChange={(e) => setCustomPushCategory(e.target.value as any)}
                              className="w-full p-2 rounded-xl border-2 border-slate-200 text-xs font-bold text-slate-900 bg-slate-50 outline-hidden"
                            >
                              <option value="promocion">🏷️ Promoción / Oferta Flash</option>
                              <option value="stock">📦 Reposición / Novedad Stock</option>
                              <option value="sistema">📢 Aviso Oficial Taller</option>
                              <option value="pedido">🚚 Pedidos &amp; Despachos</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[11px] font-black text-slate-700 uppercase block mb-1">
                              Cupón Descuento (Opcional)
                            </label>
                            <input
                              type="text"
                              value={customPushCoupon}
                              onChange={(e) => setCustomPushCoupon(e.target.value.toUpperCase())}
                              placeholder="Ej. FLASH25"
                              className="w-full p-2 rounded-xl border-2 border-amber-300 text-xs font-mono font-black text-amber-900 bg-amber-50 outline-hidden uppercase"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-black text-slate-700 uppercase block mb-1">
                              Texto del Botón Acción
                            </label>
                            <input
                              type="text"
                              value={customPushActionLabel}
                              onChange={(e) => setCustomPushActionLabel(e.target.value)}
                              placeholder="Ej. Aprovechar Oferta"
                              className="w-full p-2 rounded-xl border-2 border-slate-200 text-xs font-bold text-slate-900 bg-slate-50 outline-hidden"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-black text-slate-700 uppercase block mb-1">
                            Enlace de Destino al Hacer Clic
                          </label>
                          <input
                            type="text"
                            value={customPushLink}
                            onChange={(e) => setCustomPushLink(e.target.value)}
                            placeholder="Ej. #catalogo o https://petsimona25.cl#catalogo"
                            className="w-full p-2 rounded-xl border-2 border-slate-200 text-xs font-mono font-bold text-slate-800 bg-slate-50 outline-hidden"
                          />
                        </div>
                      </div>

                      {/* Main Submit Button */}
                      <button
                        type="button"
                        onClick={handleSendCustomManualPush}
                        disabled={isCustomPushSending || !customPushTitle.trim() || !customPushBody.trim()}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 hover:from-orange-500 hover:to-amber-400 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-orange-500/25 transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isCustomPushSending ? (
                          <>
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            <span>Transmitiendo Notificación Push a Usuarios Registrados...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            <span>
                              Despachar Notificación Push a {getTargetAudienceRecipients(customPushTargetAudience).length} Tutores Registrados 🚀
                            </span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Right: Live Preview & Dispatch History (5 Cols) */}
                    <div className="xl:col-span-5 space-y-4 flex flex-col justify-between">
                      {/* Interactive Live Mockup Preview */}
                      <div className="p-4 rounded-2xl bg-slate-900 text-white border-2 border-slate-700 shadow-lg space-y-3">
                        <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2">
                          <span className="font-bold flex items-center gap-1 text-slate-300">
                            <Bell className="w-3.5 h-3.5 text-amber-400" />
                            Vista Previa en Vivo (Notificación Navegador)
                          </span>
                          <span className="font-mono text-[10px]">Ahora mismo</span>
                        </div>

                        {/* Push Notification Box */}
                        <div className="bg-slate-800/95 p-3.5 rounded-xl border border-slate-700 shadow-md space-y-2">
                          <div className="flex items-start gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center font-black shrink-0 text-sm shadow-xs">
                              🐕
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between">
                                <h5 className="font-black text-xs text-white truncate">
                                  {customPushTitle || 'Título de la Notificación'}
                                </h5>
                                <span className="text-[9px] bg-orange-500/30 text-orange-300 px-1.5 py-0.5 rounded font-mono uppercase">
                                  petsimona25
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-300 leading-tight mt-1">
                                {customPushBody || 'El cuerpo de la notificación push personalizada se mostrará aquí para los tutores registrados.'}
                              </p>
                            </div>
                          </div>

                          {customPushCoupon && (
                            <div className="flex items-center justify-between bg-amber-400/15 p-2 rounded-lg border border-amber-400/30 text-xs">
                              <span className="text-[10px] font-bold text-amber-300 flex items-center gap-1">
                                <Tag className="w-3 h-3 text-amber-400" />
                                Cupón de Descuento:
                              </span>
                              <span className="font-mono font-black text-amber-300 tracking-wider">
                                {customPushCoupon}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-2 pt-1">
                            <span className="flex-1 text-center py-1.5 px-2.5 bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-black rounded-lg transition-colors cursor-pointer">
                              {customPushActionLabel || 'Ver en Tienda'} 🛍️
                            </span>
                            <span className="text-center py-1.5 px-2 bg-slate-700 text-slate-300 text-[10px] font-bold rounded-lg cursor-pointer">
                              Cerrar
                            </span>
                          </div>
                        </div>

                        <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                          <span>🔔 Notificación Web Push con Sonido</span>
                          <span className="text-emerald-400 font-bold">Compatibilidad: Chrome, Safari, Edge, Android</span>
                        </div>
                      </div>

                      {/* Push Dispatch History */}
                      <div className="p-4 rounded-2xl bg-white border-2 border-orange-200 shadow-xs space-y-3 flex-1">
                        <div className="flex items-center justify-between border-b border-orange-100 pb-2">
                          <h5 className="font-black text-xs text-slate-900 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-orange-600" />
                            Historial de Notificaciones Manuales Despachadas
                          </h5>
                          <span className="text-[10px] font-bold text-slate-500 font-mono">
                            {customPushHistory.length} envíos
                          </span>
                        </div>

                        <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                          {customPushHistory.length === 0 ? (
                            <p className="text-xs text-slate-400 text-center py-4 italic">
                              Aún no has enviado notificaciones push manuales. ¡Redacta la primera arriba!
                            </p>
                          ) : (
                            customPushHistory.slice(0, 6).map((item) => (
                              <div
                                key={item.id}
                                className="p-2.5 rounded-xl border border-orange-100 bg-amber-50/40 text-xs space-y-1 hover:border-orange-300 transition-colors"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-black text-slate-900 truncate max-w-[200px]">
                                    {item.title}
                                  </span>
                                  <span className="text-[9px] font-mono text-slate-500">
                                    {item.timestamp}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-600 line-clamp-1">
                                  {item.body}
                                </p>
                                <div className="flex items-center justify-between text-[10px] pt-1">
                                  <div className="flex items-center gap-1.5">
                                    {item.discountCode && (
                                      <span className="bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-mono font-bold">
                                        {item.discountCode}
                                      </span>
                                    )}
                                    <span className="text-slate-500">
                                      {item.targetAudience} ({item.recipientCount} tutores)
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCustomPushTitle(item.title);
                                      setCustomPushBody(item.body);
                                      if (item.discountCode) setCustomPushCoupon(item.discountCode);
                                      if (item.linkUrl) setCustomPushLink(item.linkUrl);
                                      if (item.actionLabel) setCustomPushActionLabel(item.actionLabel);
                                      setCustomPushSuccessMsg('Plantilla de notificación cargada en el formulario.');
                                      setTimeout(() => setCustomPushSuccessMsg(null), 3000);
                                    }}
                                    className="text-[10px] text-orange-600 font-bold hover:underline cursor-pointer"
                                  >
                                    Reutilizar
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grid with the 3 main push triggers */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Card 1: Broadcast Promotion */}
                  <div className="bg-white rounded-3xl p-5 border-2 border-amber-200 shadow-sm space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 pb-2 border-b border-amber-100">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
                          <Tag className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 text-sm">
                            1. Promoción &amp; Cupón Flash
                          </h4>
                          <span className="text-[10px] text-amber-700 font-bold">
                            Envío a todos los tutores suscritos
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs font-bold">
                        <div>
                          <label className="text-slate-700 block mb-1">Título de la Alerta</label>
                          <input
                            type="text"
                            value={pushPromoTitle}
                            onChange={(e) => setPushPromoTitle(e.target.value)}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-hidden font-bold"
                            placeholder="Ej. 🔥 20% OFF de Invierno"
                          />
                        </div>

                        <div>
                          <label className="text-slate-700 block mb-1">Mensaje / Detalle</label>
                          <textarea
                            rows={3}
                            value={pushPromoBody}
                            onChange={(e) => setPushPromoBody(e.target.value)}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-hidden text-xs font-medium"
                            placeholder="Texto de la notificación..."
                          />
                        </div>

                        <div>
                          <label className="text-slate-700 block mb-1">Código de Descuento</label>
                          <input
                            type="text"
                            value={pushPromoCoupon}
                            onChange={(e) => setPushPromoCoupon(e.target.value.toUpperCase())}
                            className="w-full p-2.5 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 font-mono font-black outline-hidden"
                            placeholder="Ej. PETSIMONA15"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        broadcastPromotionPush(pushPromoTitle, pushPromoBody, pushPromoCoupon);
                        setPushSuccessMsg(`¡Promoción "${pushPromoTitle}" difundida vía Web Push!`);
                        setTimeout(() => setPushSuccessMsg(null), 3500);
                      }}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs py-3 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-3"
                    >
                      <Send className="w-4 h-4 text-slate-900" />
                      <span>Difundir Promoción Push 📢</span>
                    </button>
                  </div>

                  {/* Card 2: Stock Restock Notification */}
                  <div className="bg-white rounded-3xl p-5 border-2 border-emerald-200 shadow-sm space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 pb-2 border-b border-emerald-100">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                          <PackageCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 text-sm">
                            2. Reposición de Stock Físico
                          </h4>
                          <span className="text-[10px] text-emerald-700 font-bold">
                            Alerta a clientes que pidieron stock
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs font-bold">
                        <div>
                          <label className="text-slate-700 block mb-1">Artículo Reabastecido</label>
                          <select
                            value={pushStockProductId}
                            onChange={(e) => setPushStockProductId(e.target.value)}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-hidden font-bold"
                          >
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} {p.stock !== undefined ? `(Stock actual: ${p.stock})` : ''}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-slate-700 block mb-1">Unidades Disponibles</label>
                          <input
                            type="number"
                            min={1}
                            value={pushStockUnits}
                            onChange={(e) => setPushStockUnits(Number(e.target.value))}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-hidden font-bold font-mono"
                          />
                        </div>

                        <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 font-medium">
                          💡 Se enviará un aviso con sonido y enlace directo a la compra del producto en el catálogo.
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const prod = products.find((p) => p.id === pushStockProductId) || products[0];
                        if (prod) {
                          broadcastStockRestockedPush(prod.name, prod.id, pushStockUnits);
                          setPushSuccessMsg(`¡Aviso de reposición de "${prod.name}" enviado por Web Push!`);
                          setTimeout(() => setPushSuccessMsg(null), 3500);
                        }
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-3 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-3"
                    >
                      <PackageCheck className="w-4 h-4" />
                      <span>Emitir Aviso de Stock 🔔</span>
                    </button>
                  </div>

                  {/* Card 3: Order Status Live Push */}
                  <div className="bg-white rounded-3xl p-5 border-2 border-blue-200 shadow-sm space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 pb-2 border-b border-blue-100">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-black">
                          <Truck className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 text-sm">
                            3. Estado de Pedido en Vivo
                          </h4>
                          <span className="text-[10px] text-blue-700 font-bold">
                            Notifica corte, despacho y entrega
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs font-bold">
                        <div>
                          <label className="text-slate-700 block mb-1">Seleccionar Pedido</label>
                          <select
                            value={pushOrderId}
                            onChange={(e) => setPushOrderId(e.target.value)}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-hidden font-bold font-mono"
                          >
                            {orders.map((o) => (
                              <option key={o.id} value={o.orderNumber}>
                                {o.orderNumber} - {o.customerName} ({o.commune})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-slate-700 block mb-1">Nuevo Estado a Notificar</label>
                          <select
                            value={pushOrderStatus}
                            onChange={(e) => setPushOrderStatus(e.target.value as AdminOrder['status'])}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-hidden font-bold"
                          >
                            <option value="En Confección">✂️ En Confección en Taller Rengo</option>
                            <option value="Listo Envíos">🎁 Listo Envíos / Empaque Biodegradable</option>
                            <option value="Despachado">🚚 Despachado por Courier</option>
                            <option value="En Tránsito">🛣️ En Tránsito a Comuna Destino</option>
                            <option value="En Reparto a Destino">🏡 En Reparto a Domicilio</option>
                            <option value="Entregado">🐾 Entregado al Tutor</option>
                          </select>
                        </div>

                        <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 text-[11px] text-blue-900 font-medium">
                          💡 El cliente podrá hacer clic sobre la notificación para abrir el mapa y seguimiento de su paquete.
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const targetOrder = orders.find((o) => o.orderNumber === pushOrderId) || orders[0];
                        if (targetOrder) {
                          broadcastOrderStatusPush(
                            targetOrder.orderNumber,
                            pushOrderStatus,
                            targetOrder.trackingCourier || targetOrder.courierName || 'Blue Express',
                            targetOrder.trackingNumber
                          );
                          setPushSuccessMsg(`¡Notificación Web Push enviada para el pedido ${targetOrder.orderNumber}!`);
                          setTimeout(() => setPushSuccessMsg(null), 3500);
                        }
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-3 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-3"
                    >
                      <Truck className="w-4 h-4" />
                      <span>Notificar Estado al Tutor 📦</span>
                    </button>
                  </div>

                </div>

                {/* Email Dispatch & WhatsApp Bot Authorization Center */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                  
                  {/* Card A: Email Alert Dispatcher */}
                  <div className="bg-white rounded-3xl p-6 border-2 border-indigo-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-indigo-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black">
                          <Mail className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 text-base">
                            Envío de Alertas a Correo Electrónico
                          </h4>
                          <span className="text-[11px] font-mono text-indigo-700 font-bold">
                            {OFFICIAL_NOTIFICATION_EMAIL}
                          </span>
                        </div>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Sincronizado
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      Cada alerta push, cambio de estado de pedido o aviso de reposición se despacha y registra automáticamente en la cuenta <strong>{OFFICIAL_NOTIFICATION_EMAIL}</strong>.
                    </p>

                    {/* Test Email Form */}
                    <div className="p-3.5 bg-indigo-50/70 rounded-2xl border border-indigo-100 space-y-2.5 text-xs font-bold">
                      <span className="text-[10px] uppercase font-black text-indigo-900 tracking-wider block">
                        Prueba Manual de Alerta por Email:
                      </span>
                      <input
                        type="text"
                        value={testEmailSubject}
                        onChange={(e) => setTestEmailSubject(e.target.value)}
                        placeholder="Asunto del correo..."
                        className="w-full p-2.5 bg-white border border-indigo-200 rounded-xl text-slate-900 outline-hidden font-bold"
                      />
                      <textarea
                        rows={2}
                        value={testEmailContent}
                        onChange={(e) => setTestEmailContent(e.target.value)}
                        placeholder="Mensaje o contenido de la alerta..."
                        className="w-full p-2.5 bg-white border border-indigo-200 rounded-xl text-slate-900 outline-hidden text-xs font-medium"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          const sent = await sendDirectEmailAlert(testEmailSubject, testEmailContent, 'sistema');
                          setEmailDispatchesList(getStoredEmailDispatches());
                          setPushSuccessMsg(`¡Alerta enviada exitosamente a ${OFFICIAL_NOTIFICATION_EMAIL}!`);
                          setTimeout(() => setPushSuccessMsg(null), 3500);
                        }}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-2.5 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Despachar Correo de Prueba a {OFFICIAL_NOTIFICATION_EMAIL}</span>
                      </button>
                    </div>

                    {/* Recent Email Dispatches List */}
                    <div className="space-y-2 pt-1">
                      <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider block">
                        Últimos Correos Emitidos ({emailDispatchesList.length}):
                      </span>
                      <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                        {emailDispatchesList.slice(0, 5).map((item) => (
                          <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-black text-slate-900 truncate max-w-[220px]">{item.subject}</span>
                              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                                {item.status === 'delivered' ? '✓ Entregado' : 'Enviado'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 line-clamp-2">{item.content}</p>
                            <span className="text-[10px] text-slate-400 font-mono block">
                              Destinatario: {item.toEmail} • {new Date(item.sentAt).toLocaleTimeString('es-CL')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card B: WhatsApp Public Bot Authorization Panel */}
                  <div className="bg-white rounded-3xl p-6 border-2 border-emerald-300 shadow-sm space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                            <MessageSquare className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-black text-slate-900 text-base">
                              Bot de Atención Pública WhatsApp
                            </h4>
                            <span className="text-[11px] font-mono text-emerald-700 font-bold">
                              {OFFICIAL_WHATSAPP_PHONE}
                            </span>
                          </div>
                        </div>
                        <span className="bg-emerald-500 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                          <ShieldCheck className="w-3.5 h-3.5 text-yellow-300" /> Autorizado 24/7
                        </span>
                      </div>

                      <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-slate-800">Estado de Autorización:</span>
                          <span className="text-emerald-800 font-black">AUTORIZADO PARA ATENCIÓN PÚBLICA</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                          El bot responde automáticamente consultas públicas sobre toma de medidas caninas, confección de ropa a medida en Rengo, tarifas de couriers (Blue Express, Chilexpress, Starken), catálogo y promociones.
                        </p>
                        <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-700">Respuesta Automática IA:</span>
                          <span className="bg-emerald-200 text-emerald-900 font-black px-2 py-0.5 rounded-md">
                            Activada
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-700">Sincronización Correo:</span>
                          <span className="font-mono text-emerald-900 font-bold">{OFFICIAL_NOTIFICATION_EMAIL}</span>
                        </div>
                      </div>

                      {/* Quick Test Direct WhatsApp Link */}
                      <div className="space-y-2 pt-1">
                        <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider block">
                          Probar Respuestas Públicas del Bot:
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          <a
                            href={generateWhatsAppBotUrl('medidas', 'Yorkshire')}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2.5 bg-slate-50 hover:bg-emerald-100/70 border border-slate-200 hover:border-emerald-300 rounded-xl text-[11px] font-bold text-slate-800 flex items-center justify-between transition-colors"
                          >
                            <span>📏 Guía de Medidas</span>
                            <ExternalLink className="w-3.5 h-3.5 text-emerald-700" />
                          </a>
                          <a
                            href={generateWhatsAppBotUrl('envios', 'Rancagua')}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2.5 bg-slate-50 hover:bg-emerald-100/70 border border-slate-200 hover:border-emerald-300 rounded-xl text-[11px] font-bold text-slate-800 flex items-center justify-between transition-colors"
                          >
                            <span>🚚 Tarifas y Envíos</span>
                            <ExternalLink className="w-3.5 h-3.5 text-emerald-700" />
                          </a>
                        </div>
                      </div>
                    </div>

                    <a
                      href={generateWhatsAppBotUrl('general')}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-3"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Abrir Canal WhatsApp Oficial (+56 9 7237 4764)</span>
                    </a>
                  </div>

                </div>

                {/* Subscriptions & Diagnostics Panel */}
                <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                      <Bell className="w-4 h-4 text-orange-500" />
                      <span>Registro de Suscripciones a Alertas de Stock</span>
                    </h4>
                    <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-bold">
                      {getStockAlertSubscriptions().length} productos con tutores esperando reposición
                    </span>
                  </div>

                  {getStockAlertSubscriptions().length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                      {getStockAlertSubscriptions().map((sub, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                          <div>
                            <span className="font-black text-xs text-slate-900 block">{sub.productName}</span>
                            <span className="text-[10px] text-slate-400 font-bold">
                              Suscrito: {new Date(sub.registeredAt).toLocaleDateString('es-CL')}
                            </span>
                          </div>
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                            Activo
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 font-medium py-3">
                      Aún no hay clientes suscritos a productos agotados. Cuando un cliente presione &quot;Avisarme Stock&quot; en el catálogo, aparecerá aquí automáticamente.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* TAB 6: NEWSLETTER & SUBSCRIBERS MANAGEMENT */}
            {activeTab === 'subscribers' && (
              <div className="space-y-6 animate-fade-in">
                
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 rounded-3xl p-6 text-white shadow-lg flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-1.5 bg-purple-950/40 px-3 py-1 rounded-full text-[11px] font-black uppercase text-purple-200 border border-purple-400/30">
                      <Users className="w-3.5 h-3.5 text-purple-300" />
                      <span>Base de Datos de Clientes &amp; Newsletter</span>
                    </div>
                    <h3 className="text-2xl font-black tracking-tight flex items-center gap-2">
                      <span>Lista de Suscriptores petsimona25</span>
                      <span className="bg-purple-500/40 text-purple-100 text-sm font-black px-2.5 py-0.5 rounded-full border border-purple-300/40">
                        {subscribersList.length} registros
                      </span>
                    </h3>
                    <p className="text-xs text-purple-100 max-w-2xl font-medium leading-relaxed">
                      Correos y datos capturados desde el formulario de suscripción y guardados en el almacenamiento local (<code className="bg-purple-950/60 px-1 py-0.5 rounded font-mono text-[10px] text-purple-200">localStorage</code>) de la tienda. Descarga el archivo CSV para tus campañas de correo o comunícate directamente con tus clientes.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto shrink-0">
                    <button
                      type="button"
                      onClick={handleExportSubscribersCSV}
                      disabled={isExportingSubscribersCSV}
                      className="flex-1 lg:flex-initial bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs px-5 py-3 rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                      title="Descargar lista completa de suscriptores en formato CSV"
                    >
                      <Download className="w-4 h-4 text-slate-950" />
                      <span>{isExportingSubscribersCSV ? 'Generando CSV...' : 'Descargar CSV (.csv)'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyAllEmails}
                      className="flex-1 lg:flex-initial bg-purple-950/80 hover:bg-purple-900 text-purple-100 font-black text-xs px-4 py-3 rounded-2xl border border-purple-400/40 shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                      title="Copiar todos los correos separados por coma"
                    >
                      {copiedAllEmails ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-300">¡Copiados!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-purple-300" />
                          <span>Copiar Correos</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsAddingSubscriber((prev) => !prev)}
                      className="flex-1 lg:flex-initial bg-white hover:bg-slate-100 text-slate-900 font-black text-xs px-4 py-3 rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                    >
                      <UserPlus className="w-4 h-4 text-purple-700" />
                      <span>{isAddingSubscriber ? 'Cerrar Formulario' : 'Nuevo Suscriptor +'}</span>
                    </button>
                  </div>
                </div>

                {/* Metrics Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-1">
                    <span className="text-[10px] uppercase font-black text-slate-400">Total Suscriptores:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black text-purple-700 block">
                        {subscribersList.length}
                      </span>
                      <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        En LocalStorage
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-1">
                    <span className="text-[10px] uppercase font-black text-slate-400">Boletín Ofertas VIP:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black text-emerald-600 block">
                        {subscribersList.filter((s) => s.plan !== 'monthly_box').length}
                      </span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        15% OFF
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-1">
                    <span className="text-[10px] uppercase font-black text-slate-400">Caja Atuendo Mensual:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black text-orange-500 block">
                        {subscribersList.filter((s) => s.plan === 'monthly_box').length}
                      </span>
                      <span className="bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Ropa Sorpresa
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-1">
                    <span className="text-[10px] uppercase font-black text-slate-400">Comunas Principales:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-900 block truncate">
                        Rengo, Rancagua, Stgo
                      </span>
                    </div>
                  </div>
                </div>

                {/* Manual Add Subscriber Form */}
                {isAddingSubscriber && (
                  <form onSubmit={handleAddManualSubscriber} className="bg-purple-50/80 p-5 rounded-3xl border-2 border-purple-200 shadow-sm space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between pb-2 border-b border-purple-200">
                      <h4 className="font-black text-purple-950 text-sm flex items-center gap-2">
                        <UserPlus className="w-4 h-4 text-purple-700" />
                        <span>Registrar Nuevo Suscriptor en LocalStorage</span>
                      </h4>
                      <button
                        type="button"
                        onClick={() => setIsAddingSubscriber(false)}
                        className="text-purple-700 hover:text-purple-950 text-xs font-bold"
                      >
                        ✕ Cancelar
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-black uppercase text-purple-900 block mb-1">
                          Correo Electrónico *
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="cliente@ejemplo.com"
                          value={newSubEmail}
                          onChange={(e) => setNewSubEmail(e.target.value)}
                          className="w-full p-2.5 bg-white border border-purple-200 rounded-xl text-xs font-bold text-slate-900 outline-hidden focus:ring-2 focus:ring-purple-400"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-black uppercase text-purple-900 block mb-1">
                          Nombre del Tutor
                        </label>
                        <input
                          type="text"
                          placeholder="Ej. Camila Silva"
                          value={newSubName}
                          onChange={(e) => setNewSubName(e.target.value)}
                          className="w-full p-2.5 bg-white border border-purple-200 rounded-xl text-xs font-bold text-slate-900 outline-hidden focus:ring-2 focus:ring-purple-400"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-black uppercase text-purple-900 block mb-1">
                          Ciudad / Comuna
                        </label>
                        <input
                          type="text"
                          placeholder="Ej. Rengo, Rancagua..."
                          value={newSubCity}
                          onChange={(e) => setNewSubCity(e.target.value)}
                          className="w-full p-2.5 bg-white border border-purple-200 rounded-xl text-xs font-bold text-slate-900 outline-hidden focus:ring-2 focus:ring-purple-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-black uppercase text-purple-900 block mb-1">
                          Nombre Mascota
                        </label>
                        <input
                          type="text"
                          placeholder="Ej. Toby"
                          value={newSubPet}
                          onChange={(e) => setNewSubPet(e.target.value)}
                          className="w-full p-2.5 bg-white border border-purple-200 rounded-xl text-xs font-bold text-slate-900 outline-hidden focus:ring-2 focus:ring-purple-400"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-black uppercase text-purple-900 block mb-1">
                          Raza / Tipo
                        </label>
                        <input
                          type="text"
                          placeholder="Ej. Poodle Toy, Yorkshire..."
                          value={newSubBreed}
                          onChange={(e) => setNewSubBreed(e.target.value)}
                          className="w-full p-2.5 bg-white border border-purple-200 rounded-xl text-xs font-bold text-slate-900 outline-hidden focus:ring-2 focus:ring-purple-400"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-black uppercase text-purple-900 block mb-1">
                          Modalidad
                        </label>
                        <select
                          value={newSubPlan}
                          onChange={(e) => setNewSubPlan(e.target.value as any)}
                          className="w-full p-2.5 bg-white border border-purple-200 rounded-xl text-xs font-bold text-slate-900 outline-hidden focus:ring-2 focus:ring-purple-400"
                        >
                          <option value="newsletter_vip">Boletín Ofertas VIP (15% OFF)</option>
                          <option value="monthly_box">Caja Atuendo Mensual</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsAddingSubscriber(false)}
                        className="px-4 py-2 bg-white text-slate-700 font-bold rounded-xl text-xs"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-black rounded-xl text-xs uppercase shadow-sm transition-all active:scale-95"
                      >
                        Guardar en Base de Datos
                      </button>
                    </div>
                  </form>
                )}

                {/* Filters & Search */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      placeholder="Buscar por correo, tutor, mascota, comuna o cupón..."
                      value={subscriberSearchTerm}
                      onChange={(e) => setSubscriberSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 outline-hidden focus:ring-2 focus:ring-purple-400"
                    />
                  </div>

                  <select
                    value={subscriberPlanFilter}
                    onChange={(e) => setSubscriberPlanFilter(e.target.value as any)}
                    className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-800 outline-hidden"
                  >
                    <option value="all">Todas las Modalidades</option>
                    <option value="newsletter_vip">Boletín Ofertas VIP</option>
                    <option value="monthly_box">Caja Atuendo Mensual</option>
                  </select>
                </div>

                {/* Subscribers Table */}
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-medium text-slate-700">
                      <thead className="bg-slate-900 text-slate-200 uppercase text-[10px] font-black tracking-wider">
                        <tr>
                          <th className="p-4">Fecha</th>
                          <th className="p-4">Correo Electrónico</th>
                          <th className="p-4">Tutor &amp; Mascota</th>
                          <th className="p-4">Ciudad / Comuna</th>
                          <th className="p-4">Cupón Asignado</th>
                          <th className="p-4">Modalidad</th>
                          <th className="p-4 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {subscribersList
                          .filter((s) => {
                            const term = subscriberSearchTerm.toLowerCase();
                            const matchSearch =
                              !term ||
                              s.email.toLowerCase().includes(term) ||
                              (s.name && s.name.toLowerCase().includes(term)) ||
                              (s.petName && s.petName.toLowerCase().includes(term)) ||
                              (s.city && s.city.toLowerCase().includes(term)) ||
                              (s.discountCode && s.discountCode.toLowerCase().includes(term));
                            const matchPlan =
                              subscriberPlanFilter === 'all' || s.plan === subscriberPlanFilter;
                            return matchSearch && matchPlan;
                          })
                          .map((sub) => (
                            <tr key={sub.id} className="hover:bg-purple-50/40 transition-colors">
                              {/* Fecha */}
                              <td className="p-4 whitespace-nowrap">
                                <span className="font-bold text-slate-900 block">
                                  {new Date(sub.subscribedAt).toLocaleDateString('es-CL', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                  })}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {new Date(sub.subscribedAt).toLocaleTimeString('es-CL', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </td>

                              {/* Correo Electrónico */}
                              <td className="p-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <span className="font-black text-slate-900 font-mono text-xs">
                                    {sub.email}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleCopySingleEmail(sub)}
                                    className="p-1 rounded-md text-slate-400 hover:text-purple-700 hover:bg-purple-100 transition-colors"
                                    title="Copiar correo"
                                  >
                                    {copiedSingleEmailId === sub.id ? (
                                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>
                              </td>

                              {/* Tutor & Mascota */}
                              <td className="p-4">
                                <span className="font-bold text-slate-900 block">
                                  {sub.name || 'Tutor Anónimo'}
                                </span>
                                <span className="text-[11px] text-purple-700 font-semibold flex items-center gap-1">
                                  <Dog className="w-3 h-3" />
                                  <span>{sub.petName || 'Mascota'}</span>
                                  {sub.breed && (
                                    <span className="text-slate-400">({sub.breed})</span>
                                  )}
                                </span>
                              </td>

                              {/* Ciudad */}
                              <td className="p-4 whitespace-nowrap">
                                <span className="inline-flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg text-slate-700 font-bold text-xs">
                                  <MapPin className="w-3 h-3 text-orange-500" />
                                  <span>{sub.city || 'Rengo'}</span>
                                </span>
                              </td>

                              {/* Cupón */}
                              <td className="p-4 whitespace-nowrap">
                                <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-900 border border-yellow-300 font-mono font-black text-[11px] px-2.5 py-1 rounded-lg">
                                  <Tag className="w-3 h-3 text-yellow-700" />
                                  <span>{sub.discountCode || 'SIMONA15'}</span>
                                </span>
                              </td>

                              {/* Modalidad */}
                              <td className="p-4 whitespace-nowrap">
                                {sub.plan === 'monthly_box' ? (
                                  <span className="bg-orange-100 text-orange-800 text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
                                    Caja Mensual
                                  </span>
                                ) : (
                                  <span className="bg-purple-100 text-purple-800 text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
                                    Boletín VIP 15%
                                  </span>
                                )}
                              </td>

                              {/* Acciones */}
                              <td className="p-4 whitespace-nowrap text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleCopySingleEmail(sub)}
                                    className="p-1.5 bg-slate-100 hover:bg-purple-100 text-slate-600 hover:text-purple-800 rounded-lg transition-colors font-bold text-xs flex items-center gap-1"
                                    title="Copiar correo"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                    <span className="hidden md:inline">Copiar</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteSubscriber(sub.id, sub.email)}
                                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                                    title="Eliminar de la lista"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}

                        {subscribersList.length === 0 && (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                              No hay suscriptores registrados todavía.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* TAB: AVISOS DE STOCK / LISTA DE ESPERA */}
            {activeTab === 'stock_alerts' && (
              <div className="space-y-6 animate-fade-in">
                
                {/* Header & Stats Banner */}
                <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-2 bg-amber-950/40 text-yellow-300 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border border-amber-400/40">
                        <Bell className="w-3.5 h-3.5" />
                        <span>Gestión de Demanda &amp; Captura de Emails</span>
                      </div>
                      <h3 className="text-2xl font-black tracking-tight text-white">
                        Lista de Espera y Avisos de Stock por Email 🐕
                      </h3>
                      <p className="text-xs text-amber-100 font-medium max-w-2xl">
                        Clientes que solicitaron ser notificados automáticamente por correo electrónico cuando sus prendas favoritas vuelvan a estar disponibles en el taller de Rengo.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopyAllStockEmails}
                        className="bg-white/10 hover:bg-white/20 text-white font-black text-xs px-4 py-2.5 rounded-2xl border border-white/20 flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5 text-yellow-300" />
                        <span>Copiar Emails</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleExportStockAlertsCSV}
                        disabled={isExportingStockCSV}
                        className="bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs px-4 py-2.5 rounded-2xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Exportar CSV ({stockAlertsList.length})</span>
                      </button>
                    </div>
                  </div>

                  {/* Summary Metric Counters */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="bg-black/20 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
                      <span className="text-[10px] uppercase font-black text-amber-200 block">Total Solicitudes:</span>
                      <span className="text-2xl font-black text-white">{stockAlertsList.length}</span>
                    </div>

                    <div className="bg-black/20 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
                      <span className="text-[10px] uppercase font-black text-amber-200 block">Pendientes de Aviso:</span>
                      <span className="text-2xl font-black text-yellow-300">
                        {stockAlertsList.filter((s) => !s.notified).length}
                      </span>
                    </div>

                    <div className="bg-black/20 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
                      <span className="text-[10px] uppercase font-black text-amber-200 block">Notificados por Email:</span>
                      <span className="text-2xl font-black text-emerald-300">
                        {stockAlertsList.filter((s) => s.notified).length}
                      </span>
                    </div>

                    <div className="bg-black/20 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
                      <span className="text-[10px] uppercase font-black text-amber-200 block">Canal Principal:</span>
                      <span className="text-xs font-black text-white flex items-center gap-1 mt-1">
                        <Mail className="w-3.5 h-3.5 text-yellow-300" />
                        Email Automático
                      </span>
                    </div>
                  </div>
                </div>

                {stockAlertActionMsg && (
                  <div className="p-4 rounded-2xl bg-amber-100 border-2 border-amber-300 text-amber-950 text-xs font-black flex items-center justify-between animate-fade-in shadow-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-amber-700 shrink-0" />
                      <span>{stockAlertActionMsg}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStockAlertActionMsg(null)}
                      className="text-amber-800 hover:text-amber-950"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Search & Filter Bar */}
                <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="relative w-full md:w-96">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      placeholder="Buscar por correo, producto, dueño o mascota..."
                      value={stockAlertSearchTerm}
                      onChange={(e) => setStockAlertSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-200 focus:border-amber-500 rounded-2xl text-xs font-bold text-slate-900 outline-hidden"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <span className="text-xs font-black text-slate-500 uppercase">Estado:</span>
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-black">
                      <button
                        type="button"
                        onClick={() => setStockAlertStatusFilter('all')}
                        className={`px-3 py-1.5 rounded-lg transition-all ${
                          stockAlertStatusFilter === 'all'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Todos ({stockAlertsList.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setStockAlertStatusFilter('pending')}
                        className={`px-3 py-1.5 rounded-lg transition-all ${
                          stockAlertStatusFilter === 'pending'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        En Espera ({stockAlertsList.filter((s) => !s.notified).length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setStockAlertStatusFilter('notified')}
                        className={`px-3 py-1.5 rounded-lg transition-all ${
                          stockAlertStatusFilter === 'notified'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Notificados ({stockAlertsList.filter((s) => s.notified).length})
                      </button>
                    </div>
                  </div>
                </div>

                {/* Subscriptions Table */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black uppercase text-[10px] tracking-wider">
                          <th className="p-4">Producto &amp; Talla</th>
                          <th className="p-4">Correo del Cliente</th>
                          <th className="p-4">Tutor / Mascota</th>
                          <th className="p-4">Fecha Registro</th>
                          <th className="p-4">Estado Notificación</th>
                          <th className="p-4 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {stockAlertsList
                          .filter((s) => {
                            const term = stockAlertSearchTerm.toLowerCase();
                            const matchesSearch =
                              s.productName.toLowerCase().includes(term) ||
                              s.customerEmail.toLowerCase().includes(term) ||
                              (s.customerName && s.customerName.toLowerCase().includes(term)) ||
                              (s.petName && s.petName.toLowerCase().includes(term)) ||
                              (s.selectedSize && s.selectedSize.toLowerCase().includes(term));

                            const matchesStatus =
                              stockAlertStatusFilter === 'all'
                                ? true
                                : stockAlertStatusFilter === 'pending'
                                ? !s.notified
                                : s.notified;

                            return matchesSearch && matchesStatus;
                          })
                          .map((sub) => (
                            <tr key={sub.id} className="hover:bg-amber-50/40 transition-colors">
                              {/* Producto */}
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  {sub.productImageUrl ? (
                                    <img
                                      src={sub.productImageUrl}
                                      alt={sub.productName}
                                      className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-black shrink-0">
                                      <Package className="w-5 h-5" />
                                    </div>
                                  )}
                                  <div>
                                    <span className="font-black text-slate-900 block line-clamp-1">
                                      {sub.productName}
                                    </span>
                                    <span className="text-[11px] font-extrabold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-md inline-block mt-0.5">
                                      Talla: {sub.selectedSize || 'Estándar'}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* Correo Electrónico */}
                              <td className="p-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <span className="font-black text-slate-900 font-mono text-xs">
                                    {sub.customerEmail}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyStockEmail(sub)}
                                    className="p-1 rounded-md text-slate-400 hover:text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer"
                                    title="Copiar correo"
                                  >
                                    {copiedStockEmailId === sub.id ? (
                                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>
                              </td>

                              {/* Tutor / Mascota */}
                              <td className="p-4 whitespace-nowrap">
                                <span className="font-bold text-slate-900 block">
                                  {sub.customerName || 'Cliente Pet Lover'}
                                </span>
                                {sub.petName ? (
                                  <span className="text-[11px] text-amber-800 font-semibold flex items-center gap-1">
                                    <Dog className="w-3 h-3 text-orange-600" />
                                    <span>Mascota: {sub.petName}</span>
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-400">Sin especificar</span>
                                )}
                              </td>

                              {/* Fecha Registro */}
                              <td className="p-4 whitespace-nowrap">
                                <span className="font-bold text-slate-900 block">
                                  {new Date(sub.registeredAt).toLocaleDateString('es-CL', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                  })}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {new Date(sub.registeredAt).toLocaleTimeString('es-CL', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </td>

                              {/* Estado Notificación */}
                              <td className="p-4 whitespace-nowrap">
                                {sub.notified ? (
                                  <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 border border-emerald-300 font-black text-[10px] uppercase px-2.5 py-1 rounded-full">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>Notificado por Email</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 font-black text-[10px] uppercase px-2.5 py-1 rounded-full animate-pulse">
                                    <Clock className="w-3 h-3 text-amber-700" />
                                    <span>Esperando Stock</span>
                                  </span>
                                )}
                              </td>

                              {/* Acciones */}
                              <td className="p-4 whitespace-nowrap text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleManualTriggerProductRestock(sub)}
                                    className="p-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-black rounded-lg transition-colors text-xs flex items-center gap-1 cursor-pointer"
                                    title="Enviar aviso por correo electrónico ahora"
                                  >
                                    <Mail className="w-3.5 h-3.5 text-amber-800" />
                                    <span className="hidden sm:inline">Enviar Aviso</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteStockSub(sub.id, sub.customerEmail)}
                                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer"
                                    title="Eliminar de la lista"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}

                        {stockAlertsList.length === 0 && (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                              No hay solicitudes de aviso de stock registradas aún.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Explanatory Automation Guide */}
                <div className="p-5 rounded-3xl bg-slate-900 text-white space-y-2 border-2 border-slate-800 shadow-md">
                  <div className="flex items-center gap-2 text-yellow-300 font-black text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    <span>¿Cómo funciona la Notificación Automática?</span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                    Cuando marques cualquier producto como <strong>"Disponible"</strong> en la pestaña <strong className="text-yellow-300">Inventario &amp; Stock</strong> o en el catálogo, el sistema buscará de inmediato a todos los clientes registrados para esa prenda, enviará un correo personalizado anunciando el regreso del stock y actualizará automáticamente el estado a <strong className="text-emerald-400">"Notificado"</strong>.
                  </p>
                </div>

              </div>
            )}

            {/* TAB: WHATSAPP BUSINESS API & AUTOMATIONS */}
            {activeTab === 'whatsapp_business' && (
              <div className="space-y-6">

                {/* Header Banner */}
                <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-2 border-emerald-400">
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-2 bg-emerald-950/40 border border-emerald-300/30 px-3 py-1 rounded-full text-xs font-black uppercase text-emerald-200">
                      <ShieldCheck className="w-4 h-4 text-emerald-300" />
                      <span>Meta Cloud API • Graph API v21.0 Activo</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2">
                      <span>Integración WhatsApp Business API</span>
                      <span className="text-xl">📲</span>
                    </h3>
                    <p className="text-xs text-emerald-100 max-w-2xl font-medium leading-relaxed">
                      Automatiza el despacho directo de confirmaciones de compra, avisos de corte y confección en taller Rengo, números de seguimiento con couriers (Blue Express, Chilexpress, Starken) y notificaciones de reposición al WhatsApp de tus clientes.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 w-full md:w-auto">
                    <button
                      type="button"
                      onClick={handleExportWabaCSV}
                      disabled={isExportingStockCSV}
                      className="bg-emerald-950/80 hover:bg-emerald-950 text-emerald-100 hover:text-white font-black text-xs px-4 py-2.5 rounded-2xl border border-emerald-400/40 shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-emerald-300" />
                      <span>Exportar Historial CSV</span>
                    </button>
                    <a
                      href={`https://wa.me/${wabaConfig.officialPhoneNumber.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-white hover:bg-emerald-50 text-emerald-900 font-black text-xs px-4 py-2.5 rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                    >
                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                      <span>Chat Oficial ({wabaConfig.officialPhoneNumber})</span>
                    </a>
                  </div>
                </div>

                {/* Feedback Action Alert */}
                {wabaActionMsg && (
                  <div className="bg-emerald-100 border-2 border-emerald-400 text-emerald-950 p-4 rounded-2xl font-black text-xs flex items-center justify-between gap-2 shadow-sm animate-fade-in">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                      <span>{wabaActionMsg}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setWabaActionMsg(null)}
                      className="text-emerald-800 hover:text-emerald-950 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* 4 Stat Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-3xl border border-emerald-200 shadow-xs flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                      <Send className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider block">
                        Mensajes Despachados
                      </span>
                      <span className="text-xl font-black text-slate-900">
                        {wabaDispatchesList.length}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-3xl border border-teal-200 shadow-xs flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-black">
                      <CheckCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider block">
                        Tasa de Entrega
                      </span>
                      <span className="text-xl font-black text-teal-700">
                        {wabaDispatchesList.length > 0 ? '100%' : '100%'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-3xl border border-blue-200 shadow-xs flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-black">
                      <PackageCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider block">
                        Confirmaciones de Pedido
                      </span>
                      <span className="text-xl font-black text-blue-800">
                        {wabaDispatchesList.filter((d) => d.templateType === 'confirmacion_pedido_v1').length}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-3xl border border-purple-200 shadow-xs flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-black">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider block">
                        Avisos de Courier / Envío
                      </span>
                      <span className="text-xl font-black text-purple-800">
                        {wabaDispatchesList.filter((d) => d.templateType === 'envio_despachado_v1' || d.templateType === 'en_reparto_v1').length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Main 2-Column: Settings & Automation Rules / Live Sandbox */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                  {/* LEFT COLUMN: Credentials & Automation Rules (7 cols) */}
                  <div className="lg:col-span-7 space-y-6">

                    {/* Meta Cloud API Credentials Form */}
                    <div className="bg-white rounded-3xl p-6 border-2 border-emerald-200 shadow-sm space-y-5">
                      <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                            <Sliders className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-black text-slate-900 text-base">
                              Configuración Meta Cloud API &amp; WABA
                            </h4>
                            <p className="text-[11px] text-slate-500 font-medium">
                              Parámetros del WhatsApp Business Account oficial para petsimona25.cl
                            </p>
                          </div>
                        </div>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Meta Cloud v21.0
                        </span>
                      </div>

                      <form onSubmit={handleSaveWabaConfig} className="space-y-4 text-xs font-bold">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-slate-700 block mb-1">
                              Phone Number ID (Meta Graph API)
                            </label>
                            <input
                              type="text"
                              required
                              value={wabaConfig.phoneNumberId}
                              onChange={(e) => setWabaConfig({ ...wabaConfig, phoneNumberId: e.target.value })}
                              placeholder="Ej: 104829104829104"
                              className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 rounded-xl text-slate-900 font-mono outline-hidden"
                            />
                          </div>

                          <div>
                            <label className="text-slate-700 block mb-1">
                              WhatsApp Business Account ID (WABA ID)
                            </label>
                            <input
                              type="text"
                              required
                              value={wabaConfig.wabaAccountId}
                              onChange={(e) => setWabaConfig({ ...wabaConfig, wabaAccountId: e.target.value })}
                              placeholder="Ej: 948201948201948"
                              className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 rounded-xl text-slate-900 font-mono outline-hidden"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-slate-700 block mb-1">
                              Número Oficial Emisor
                            </label>
                            <input
                              type="text"
                              required
                              value={wabaConfig.officialPhoneNumber}
                              onChange={(e) => setWabaConfig({ ...wabaConfig, officialPhoneNumber: e.target.value })}
                              placeholder="+56972374764"
                              className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 rounded-xl text-slate-900 font-mono outline-hidden"
                            />
                          </div>

                          <div>
                            <label className="text-slate-700 block mb-1">
                              Canal / Canal de Despacho
                            </label>
                            <select
                              value={wabaConfig.channel}
                              onChange={(e) => setWabaConfig({ ...wabaConfig, channel: e.target.value as any })}
                              className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 rounded-xl text-slate-900 font-bold outline-hidden"
                            >
                              <option value="meta_cloud_api">Meta Cloud API Oficial (Graph API)</option>
                              <option value="sandbox">Sandbox de Pruebas (Simulación)</option>
                              <option value="direct_whatsapp">WhatsApp Web / wa.me directo</option>
                            </select>
                          </div>
                        </div>

                        {/* System User Access Token */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="text-slate-700">
                              System User Permanent Access Token (Bearer)
                            </label>
                            <button
                              type="button"
                              onClick={() => setWabaShowToken(!wabaShowToken)}
                              className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer"
                            >
                              {wabaShowToken ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              <span>{wabaShowToken ? 'Ocultar Token' : 'Mostrar Token'}</span>
                            </button>
                          </div>
                          <input
                            type={wabaShowToken ? 'text' : 'password'}
                            value={wabaConfig.permanentAccessToken}
                            onChange={(e) => setWabaConfig({ ...wabaConfig, permanentAccessToken: e.target.value })}
                            placeholder="EAA... (Token de acceso permanente de Meta Developer)"
                            className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 rounded-xl text-slate-900 font-mono text-xs outline-hidden"
                          />
                        </div>

                        {/* Webhook Settings Box */}
                        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
                            Parámetros del Webhook de Meta para Notificaciones Entrantes:
                          </span>
                          
                          <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200">
                            <span className="text-[11px] font-mono text-slate-800 truncate max-w-[280px]">
                              {wabaConfig.webhookCallbackUrl}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyWabaText(wabaConfig.webhookCallbackUrl, 'webhook_url')}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-black flex items-center gap-1 cursor-pointer shrink-0 ml-2"
                            >
                              {copiedWabaId === 'webhook_url' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedWabaId === 'webhook_url' ? 'Copiado' : 'Copiar URL'}</span>
                            </button>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1">
                            <span>Verify Token:</span>
                            <span className="font-mono font-bold text-slate-900 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              {wabaConfig.webhookVerifyToken}
                            </span>
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-3 rounded-2xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Guardar Configuración WhatsApp API</span>
                        </button>
                      </form>
                    </div>

                    {/* Automation Rules Toggles */}
                    <div className="bg-white rounded-3xl p-6 border-2 border-emerald-200 shadow-sm space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-black">
                            <Bot className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-black text-slate-900 text-base">
                              Disparadores y Reglas de Automatización
                            </h4>
                            <p className="text-[11px] text-slate-500 font-medium">
                              Configura qué eventos emiten un WhatsApp automático al cliente
                            </p>
                          </div>
                        </div>
                        <span className="bg-teal-100 text-teal-900 text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
                          4 Automatizaciones
                        </span>
                      </div>

                      <div className="space-y-3">
                        {/* Trigger 1: Order Confirmation */}
                        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
                          <div className="space-y-0.5">
                            <span className="font-black text-slate-900 text-xs block">
                              📦 1. Confirmación Automática de Pedido al Comprar
                            </span>
                            <p className="text-[11px] text-slate-500 font-medium leading-tight">
                              Envía de inmediato el detalle de las prendas confeccionadas, total en CLP y método de pago al registrar el pedido.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggleWabaAutomation('autoSendOrderConfirmation', !wabaConfig.autoSendOrderConfirmation)}
                            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                              wabaConfig.autoSendOrderConfirmation ? 'bg-emerald-600' : 'bg-slate-300'
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                                wabaConfig.autoSendOrderConfirmation ? 'left-7' : 'left-1'
                              }`}
                            />
                          </button>
                        </div>

                        {/* Trigger 2: Status Updates */}
                        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
                          <div className="space-y-0.5">
                            <span className="font-black text-slate-900 text-xs block">
                              ✂️ 2. Actualización de Estados de Taller en Tiempo Real
                            </span>
                            <p className="text-[11px] text-slate-500 font-medium leading-tight">
                              Notifica al cliente cuando su pedido pasa a "En Confección", "Listo Envíos" o "En Reparto".
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggleWabaAutomation('autoSendStatusUpdates', !wabaConfig.autoSendStatusUpdates)}
                            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                              wabaConfig.autoSendStatusUpdates ? 'bg-emerald-600' : 'bg-slate-300'
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                                wabaConfig.autoSendStatusUpdates ? 'left-7' : 'left-1'
                              }`}
                            />
                          </button>
                        </div>

                        {/* Trigger 3: Courier Tracking Code */}
                        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
                          <div className="space-y-0.5">
                            <span className="font-black text-slate-900 text-xs block">
                              🚚 3. Notificación Automática de Código de Courier
                            </span>
                            <p className="text-[11px] text-slate-500 font-medium leading-tight">
                              Envía el número de orden de transporte de Blue Express, Chilexpress o Starken junto al link directo de rastreo.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggleWabaAutomation('autoSendTrackingNumber', !wabaConfig.autoSendTrackingNumber)}
                            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                              wabaConfig.autoSendTrackingNumber ? 'bg-emerald-600' : 'bg-slate-300'
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                                wabaConfig.autoSendTrackingNumber ? 'left-7' : 'left-1'
                              }`}
                            />
                          </button>
                        </div>

                        {/* Trigger 4: Stock Restock Notification */}
                        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
                          <div className="space-y-0.5">
                            <span className="font-black text-slate-900 text-xs block">
                              🔔 4. Aviso de Stock a Clientes en Espera
                            </span>
                            <p className="text-[11px] text-slate-500 font-medium leading-tight">
                              Envía un WhatsApp a los clientes que solicitaron aviso cuando un producto agotado vuelve a estar disponible.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggleWabaAutomation('autoSendRestockAlerts', !wabaConfig.autoSendRestockAlerts)}
                            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                              wabaConfig.autoSendRestockAlerts ? 'bg-emerald-600' : 'bg-slate-300'
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                                wabaConfig.autoSendRestockAlerts ? 'left-7' : 'left-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* RIGHT COLUMN: Live Simulator & Test Sandbox (5 cols) */}
                  <div className="lg:col-span-5 space-y-6">

                    <div className="bg-white rounded-3xl p-6 border-2 border-emerald-300 shadow-md space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
                            <Smartphone className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-black text-slate-900 text-sm">
                              Simulador &amp; Consola de Pruebas
                            </h4>
                            <span className="text-[10px] text-emerald-700 font-bold">
                              Previsualización en tiempo real estilo WhatsApp
                            </span>
                          </div>
                        </div>
                        <span className="bg-emerald-100 text-emerald-900 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                          En Vivo
                        </span>
                      </div>

                      {/* Selectors for testing */}
                      <div className="space-y-3 text-xs font-bold">
                        <div>
                          <label className="text-slate-700 block mb-1">
                            Plantilla Oficial a Probar
                          </label>
                          <select
                            value={wabaTestTemplate}
                            onChange={(e) => setWabaTestTemplate(e.target.value as WhatsAppTemplateType)}
                            className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 rounded-xl text-slate-900 outline-hidden font-bold"
                          >
                            <option value="confirmacion_pedido_v1">🎉 Confirmación de Pedido (Detalle y Pago)</option>
                            <option value="en_confeccion_v1">✂️ En Confección (Mesa de corte Rengo)</option>
                            <option value="listo_envios_v1">📦 Listo para Envíos (Empaque final)</option>
                            <option value="envio_despachado_v1">🚚 Despachado con Courier y Tracking</option>
                            <option value="en_reparto_v1">📍 En Reparto a Domicilio</option>
                            <option value="pedido_entregado_v1">🌟 Pedido Entregado &amp; Evaluación</option>
                            <option value="mensaje_personalizado">✍️ Mensaje Libre / Personalizado</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-slate-700 block mb-1">
                            Asociar con Pedido de Prueba
                          </label>
                          <select
                            value={wabaSelectedOrderNumber}
                            onChange={(e) => setWabaSelectedOrderNumber(e.target.value)}
                            className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 rounded-xl text-slate-900 outline-hidden font-bold"
                          >
                            {orders.map((o) => (
                              <option key={o.id} value={o.orderNumber}>
                                {o.orderNumber} • {o.customerName} ({o.commune}) - ${o.grandTotal.toLocaleString('es-CL')}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-slate-700 block mb-1">
                            Teléfono de Destino (con código +569)
                          </label>
                          <input
                            type="text"
                            value={wabaTestPhone}
                            onChange={(e) => setWabaTestPhone(e.target.value)}
                            placeholder="+56972374764"
                            className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 rounded-xl text-slate-900 font-mono outline-hidden font-bold"
                          />
                        </div>

                        {wabaTestTemplate === 'mensaje_personalizado' && (
                          <div>
                            <label className="text-slate-700 block mb-1">
                              Texto del Mensaje Personalizado
                            </label>
                            <textarea
                              rows={3}
                              value={wabaCustomMessage}
                              onChange={(e) => setWabaCustomMessage(e.target.value)}
                              placeholder="Escribe el texto a enviar..."
                              className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 rounded-xl text-slate-900 outline-hidden font-medium text-xs"
                            />
                          </div>
                        )}
                      </div>

                      {/* WhatsApp Phone Mockup Preview */}
                      <div className="bg-[#EFEAE2] rounded-2xl p-3.5 border-2 border-[#D1D7DB] shadow-inner space-y-3 font-sans">
                        {/* WhatsApp Header bar */}
                        <div className="bg-[#005E54] text-white p-2.5 rounded-xl flex items-center justify-between shadow-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-emerald-300 text-emerald-950 font-black flex items-center justify-center text-xs">
                              🐾
                            </div>
                            <div>
                              <span className="font-black text-xs block leading-tight flex items-center gap-1">
                                <span>petsimona25.cl</span>
                                <CheckCircle2 className="w-3 h-3 text-emerald-300 fill-emerald-300" />
                              </span>
                              <span className="text-[9px] text-emerald-200">Cuenta Oficial de Empresa</span>
                            </div>
                          </div>
                          <span className="text-[10px] text-emerald-200 font-bold">Rengo, CL</span>
                        </div>

                        {/* WhatsApp Message Bubble */}
                        <div className="bg-[#D9FDD3] p-3 rounded-2xl rounded-tl-xs shadow-xs text-slate-900 text-xs space-y-2 border border-[#C5ECC0]">
                          <div className="text-[11px] leading-relaxed whitespace-pre-line text-slate-800">
                            {(() => {
                              const ord = orders.find((o) => o.orderNumber === wabaSelectedOrderNumber) || orders[0];
                              if (wabaTestTemplate === 'confirmacion_pedido_v1') {
                                return formatOrderConfirmationWhatsApp({
                                  orderNumber: ord.orderNumber,
                                  customerName: ord.customerName,
                                  customerPhone: wabaTestPhone,
                                  petName: ord.petName,
                                  petBreed: ord.petBreed,
                                  itemsSummary: ord.itemsSummary,
                                  grandTotal: ord.grandTotal,
                                  commune: ord.commune,
                                  shippingAddress: ord.shippingAddress,
                                  paymentMethod: ord.paymentMethod,
                                  courierName: ord.courierName,
                                });
                              } else if (wabaTestTemplate === 'mensaje_personalizado') {
                                return wabaCustomMessage || 'Mensaje de prueba oficial desde petsimona25.cl (Rengo)';
                              } else {
                                const st =
                                  wabaTestTemplate === 'en_confeccion_v1'
                                    ? 'En Confección'
                                    : wabaTestTemplate === 'listo_envios_v1'
                                    ? 'Listo Envíos'
                                    : wabaTestTemplate === 'envio_despachado_v1'
                                    ? 'Despachado'
                                    : wabaTestTemplate === 'en_reparto_v1'
                                    ? 'En Reparto a Destino'
                                    : 'Entregado';
                                return formatOrderStatusUpdateWhatsApp(
                                  ord,
                                  st,
                                  ord.trackingCourier || ord.courierName || 'Blue Express',
                                  ord.trackingNumber || `BX-${ord.orderNumber.replace(/\D/g, '')}194`
                                ).body;
                              }
                            })()}
                          </div>

                          <div className="flex items-center justify-end gap-1 pt-1 text-[9px] text-slate-500 font-mono">
                            <span>{new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</span>
                            <CheckCheck className="w-3.5 h-3.5 text-[#53BDEB]" />
                          </div>
                        </div>
                      </div>

                      {/* Dispatch & wa.me Buttons */}
                      <div className="space-y-2 pt-1">
                        <button
                          type="button"
                          onClick={handleTestWabaDispatch}
                          disabled={wabaIsTesting}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-3 rounded-2xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider disabled:opacity-50"
                        >
                          <Send className="w-4 h-4" />
                          <span>{wabaIsTesting ? 'Despachando...' : '🚀 Despachar Vía Meta Cloud API'}</span>
                        </button>

                        <a
                          href={(() => {
                            const ord = orders.find((o) => o.orderNumber === wabaSelectedOrderNumber) || orders[0];
                            const text =
                              wabaTestTemplate === 'confirmacion_pedido_v1'
                                ? formatOrderConfirmationWhatsApp({
                                    orderNumber: ord.orderNumber,
                                    customerName: ord.customerName,
                                    customerPhone: wabaTestPhone,
                                    petName: ord.petName,
                                    petBreed: ord.petBreed,
                                    itemsSummary: ord.itemsSummary,
                                    grandTotal: ord.grandTotal,
                                    commune: ord.commune,
                                    shippingAddress: ord.shippingAddress,
                                    paymentMethod: ord.paymentMethod,
                                    courierName: ord.courierName,
                                  })
                                : wabaTestTemplate === 'mensaje_personalizado'
                                ? wabaCustomMessage
                                : formatOrderStatusUpdateWhatsApp(
                                    ord,
                                    'Despachado',
                                    ord.trackingCourier || 'Blue Express',
                                    ord.trackingNumber || 'BX-194'
                                  ).body;
                            return generateDirectWhatsAppUrl(wabaTestPhone, text);
                          })()}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2.5 rounded-2xl flex items-center justify-center gap-2 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Abrir en WhatsApp Web Directo (wa.me)</span>
                        </a>
                      </div>
                    </div>

                  </div>

                </div>

                {/* Historial de Despachos en Vivo Table */}
                <div className="bg-white rounded-3xl border-2 border-emerald-200 shadow-sm overflow-hidden space-y-4 p-5">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 text-base">
                          Historial de Notificaciones WhatsApp Despachadas
                        </h4>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Registro de auditoría en tiempo real con acuse de recibo y doble check
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <div className="relative flex-1 md:w-64">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          placeholder="Buscar destinatario, teléfono..."
                          value={wabaSearchTerm}
                          onChange={(e) => setWabaSearchTerm(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl text-xs font-bold text-slate-900 outline-hidden"
                        />
                      </div>

                      <select
                        value={wabaStatusFilter}
                        onChange={(e) => setWabaStatusFilter(e.target.value as any)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-hidden"
                      >
                        <option value="all">Todos ({wabaDispatchesList.length})</option>
                        <option value="delivered">Entregados</option>
                        <option value="read">Leídos</option>
                        <option value="sent">Enviados</option>
                      </select>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black uppercase text-[10px] tracking-wider">
                          <th className="p-3.5">Fecha / Hora</th>
                          <th className="p-3.5">Destinatario &amp; Teléfono</th>
                          <th className="p-3.5">Pedido</th>
                          <th className="p-3.5">Plantilla / Motivo</th>
                          <th className="p-3.5">Canal</th>
                          <th className="p-3.5">Estado</th>
                          <th className="p-3.5 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {wabaDispatchesList
                          .filter((d) => {
                            const term = wabaSearchTerm.toLowerCase();
                            const matchesSearch =
                              d.toPhone.toLowerCase().includes(term) ||
                              d.recipientName.toLowerCase().includes(term) ||
                              d.templateTitle.toLowerCase().includes(term) ||
                              (d.orderNumber && d.orderNumber.toLowerCase().includes(term)) ||
                              d.messageText.toLowerCase().includes(term);

                            const matchesStatus =
                              wabaStatusFilter === 'all'
                                ? true
                                : d.status === wabaStatusFilter;

                            return matchesSearch && matchesStatus;
                          })
                          .map((log) => (
                            <tr key={log.id} className="hover:bg-emerald-50/40 transition-colors">
                              {/* Fecha */}
                              <td className="p-3.5 whitespace-nowrap">
                                <span className="font-bold text-slate-900 block">
                                  {new Date(log.sentAt).toLocaleDateString('es-CL')}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {new Date(log.sentAt).toLocaleTimeString('es-CL')}
                                </span>
                              </td>

                              {/* Destinatario */}
                              <td className="p-3.5">
                                <span className="font-black text-slate-900 block">
                                  {log.recipientName}
                                </span>
                                <span className="font-mono text-[11px] text-emerald-800 font-bold">
                                  {log.toPhone}
                                </span>
                              </td>

                              {/* Pedido */}
                              <td className="p-3.5 whitespace-nowrap font-mono font-bold text-slate-700">
                                {log.orderNumber ? `#${log.orderNumber}` : 'N/A'}
                              </td>

                              {/* Plantilla */}
                              <td className="p-3.5">
                                <span className="font-bold text-slate-900 block text-xs">
                                  {log.templateTitle}
                                </span>
                                <p className="text-[11px] text-slate-500 line-clamp-1 max-w-xs font-normal">
                                  {log.messageText}
                                </p>
                              </td>

                              {/* Canal */}
                              <td className="p-3.5 whitespace-nowrap">
                                <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                  {log.channel === 'meta_cloud_api' ? 'Meta Cloud' : log.channel === 'sandbox' ? 'Sandbox' : 'wa.me'}
                                </span>
                              </td>

                              {/* Estado */}
                              <td className="p-3.5 whitespace-nowrap">
                                {log.status === 'delivered' ? (
                                  <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 font-black text-[10px] uppercase px-2.5 py-1 rounded-full border border-emerald-300">
                                    <CheckCheck className="w-3.5 h-3.5 text-emerald-700" />
                                    <span>Entregado</span>
                                  </span>
                                ) : log.status === 'read' ? (
                                  <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-900 font-black text-[10px] uppercase px-2.5 py-1 rounded-full border border-blue-300">
                                    <CheckCheck className="w-3.5 h-3.5 text-blue-600" />
                                    <span>Leído</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 font-black text-[10px] uppercase px-2.5 py-1 rounded-full">
                                    <Check className="w-3.5 h-3.5 text-slate-600" />
                                    <span>Enviado</span>
                                  </span>
                                )}
                              </td>

                              {/* Acciones */}
                              <td className="p-3.5 whitespace-nowrap text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleCopyWabaText(log.messageText, log.id)}
                                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                                    title="Copiar texto del mensaje"
                                  >
                                    {copiedWabaId === log.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                    <span className="hidden sm:inline">{copiedWabaId === log.id ? 'Copiado' : 'Copiar'}</span>
                                  </button>

                                  <a
                                    href={generateDirectWhatsAppUrl(log.toPhone, log.messageText)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-lg text-xs flex items-center gap-1 cursor-pointer font-bold"
                                    title="Abrir chat en WhatsApp Web"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5 text-emerald-800" />
                                    <span className="hidden sm:inline">wa.me</span>
                                  </a>
                                </div>
                              </td>
                            </tr>
                          ))}

                        {wabaDispatchesList.length === 0 && (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                              No hay registros de despachos de WhatsApp aún. Realiza una prueba desde la consola superior.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* TAB: COOKIES & TRACKING CONFIGURATION (GA4 & META PIXEL & CONSENT) */}
            {activeTab === 'cookies_tracking' && (
              <div className="space-y-6">
                
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner shrink-0">
                      <Cookie className="w-8 h-8 text-amber-200" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-black">Centro de Cookies, Seguimiento &amp; Analítica</h3>
                        <span className="bg-white/20 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-white/30">
                          Google Consent Mode v2
                        </span>
                      </div>
                      <p className="text-xs text-amber-100 font-medium mt-1">
                        Controla el banner de consentimiento, el ID de Google Analytics 4, Meta/Facebook Pixel y el seguimiento de cookies en Google Sites y dominio web.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 font-mono font-bold">
                      Estado Banner: {trackingSettings.cookieBannerEnabled ? '🟢 Activo' : '⚪ Desactivado'}
                    </span>
                  </div>
                </div>

                {cookieActionMsg && (
                  <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-xs font-black text-emerald-900 flex items-center justify-between animate-fade-in">
                    <span>{cookieActionMsg}</span>
                    <button onClick={() => setCookieActionMsg(null)} className="text-emerald-700 hover:text-emerald-950">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Configuration Form */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Column: Pixel & GA4 Settings */}
                  <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-2">
                        <Sliders className="w-5 h-5 text-amber-600" />
                        <h4 className="font-black text-slate-900 text-base">Configuración de IDs de Seguimiento</h4>
                      </div>
                      <span className="text-xs text-slate-400 font-bold">Actualización en tiempo real</span>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const updated = saveTrackingSettings(trackingSettings);
                        setTrackingSettings(updated);
                        setCookieActionMsg('✓ Configuración de Cookies y Píxeles de Seguimiento guardada con éxito.');
                        setTimeout(() => setCookieActionMsg(null), 4000);
                      }}
                      className="space-y-5"
                    >
                      {/* Toggle Banner */}
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                        <div className="space-y-0.5">
                          <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                            <Cookie className="w-4 h-4 text-amber-500" />
                            <span>Mostrar Banner Flotante de Consentimiento de Cookies</span>
                          </label>
                          <p className="text-[11px] text-slate-500 font-medium">
                            Muestra el aviso interactivo a los nuevos visitantes para cumplir normativas de privacidad y activar Google Consent Mode v2.
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={trackingSettings.cookieBannerEnabled}
                          onChange={(e) =>
                            setTrackingSettings({
                              ...trackingSettings,
                              cookieBannerEnabled: e.target.checked,
                            })
                          }
                          className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                        />
                      </div>

                      {/* GA4 ID */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-black uppercase text-slate-700">
                          Google Analytics 4 Measurement ID
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={trackingSettings.ga4MeasurementId}
                            onChange={(e) =>
                              setTrackingSettings({
                                ...trackingSettings,
                                ga4MeasurementId: e.target.value.trim().toUpperCase(),
                              })
                            }
                            placeholder="Ej. G-PETSIMONA25 o G-XXXXXXXXXX"
                            className="w-full bg-slate-50 border-2 border-slate-200 focus:border-amber-500 rounded-2xl p-3.5 pl-10 text-sm font-mono font-black text-slate-900 outline-none transition-colors"
                          />
                          <Eye className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Este ID rastrea visitas al catálogo, clic en WhatsApp, cotizaciones de medidas y compras en Google Sites.
                        </p>
                      </div>

                      {/* Meta Pixel ID */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-black uppercase text-slate-700">
                          Meta (Facebook / Instagram) Pixel ID
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={trackingSettings.metaPixelId}
                            onChange={(e) =>
                              setTrackingSettings({
                                ...trackingSettings,
                                metaPixelId: e.target.value.trim(),
                              })
                            }
                            placeholder="Ej. 123456789012345"
                            className="w-full bg-slate-50 border-2 border-slate-200 focus:border-amber-500 rounded-2xl p-3.5 pl-10 text-sm font-mono font-black text-slate-900 outline-none transition-colors"
                          />
                          <ShieldCheck className="w-4 h-4 text-purple-500 absolute left-3.5 top-4" />
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Permite crear públicos personalizados en Meta Ads para personas que vieron abrigos para perros chicos o medianos en Rengo.
                        </p>
                      </div>

                      {/* TikTok Pixel ID (Optional) */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-black uppercase text-slate-700">
                          TikTok Pixel ID (Opcional)
                        </label>
                        <input
                          type="text"
                          value={trackingSettings.tiktokPixelId}
                          onChange={(e) =>
                            setTrackingSettings({
                              ...trackingSettings,
                              tiktokPixelId: e.target.value.trim(),
                            })
                          }
                          placeholder="Ej. CXXXXXXXXXXXXXXXXX"
                          className="w-full bg-slate-50 border-2 border-slate-200 focus:border-amber-500 rounded-2xl p-3.5 text-sm font-mono font-bold text-slate-900 outline-none transition-colors"
                        />
                      </div>

                      {/* Expiration Days & Anonymize IP */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">Anonimizar Direcciones IP</span>
                            <span className="text-[10px] text-slate-500">Privacidad mejorada de usuarios</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={trackingSettings.anonymizeIp}
                            onChange={(e) =>
                              setTrackingSettings({
                                ...trackingSettings,
                                anonymizeIp: e.target.checked,
                              })
                            }
                            className="w-4 h-4 accent-amber-500 rounded"
                          />
                        </div>

                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">Duración de Cookies</span>
                            <span className="text-[10px] text-slate-500">Días de retención en navegador</span>
                          </div>
                          <span className="text-xs font-mono font-black text-amber-700 bg-amber-100 px-2.5 py-1 rounded-lg">
                            365 días
                          </span>
                        </div>
                      </div>

                      {/* Submit */}
                      <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-black uppercase px-6 py-3.5 rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>Guardar Configuración de Seguimiento</span>
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Right Column: Cookie Status & Consent Simulator */}
                  <div className="space-y-6">
                    
                    {/* Current Browser Consent Status */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                        <Shield className="w-5 h-5 text-emerald-600" />
                        <h4 className="font-black text-slate-900 text-sm">Estado de Consentimiento Actual</h4>
                      </div>

                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl text-xs">
                          <span className="font-bold text-slate-700">Cookies Esenciales:</span>
                          <span className="bg-emerald-100 text-emerald-900 text-[10px] font-black px-2 py-0.5 rounded-md">
                            Permitidas (100%)
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl text-xs">
                          <span className="font-bold text-slate-700">Cookies Analíticas (GA4):</span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                            cookiePrefs.analytics ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
                          }`}>
                            {cookiePrefs.analytics ? 'Activo / Otorgado' : 'Rechazado'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl text-xs">
                          <span className="font-bold text-slate-700">Cookies de Marketing (Pixel):</span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                            cookiePrefs.marketing ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
                          }`}>
                            {cookiePrefs.marketing ? 'Activo / Otorgado' : 'Rechazado'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl text-xs">
                          <span className="font-bold text-slate-700">Consentimiento de Usuario:</span>
                          <span className="font-mono text-[10px] text-slate-500 font-bold">
                            {cookiePrefs.consentGiven ? 'Aceptado en navegador' : 'Pendiente respuesta'}
                          </span>
                        </div>
                      </div>

                      {/* Reset Cookie Preferences Button */}
                      <button
                        type="button"
                        onClick={() => {
                          const updated = saveCookiePreferences({
                            consentGiven: false,
                            analytics: true,
                            marketing: true,
                            preferences: true,
                          });
                          setCookiePrefs(updated);
                          setCookieActionMsg('✓ Preferencias de cookies restablecidas. El banner flotante volverá a mostrarse al recargar.');
                          setTimeout(() => setCookieActionMsg(null), 4000);
                        }}
                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                        <span>Reabrir Banner de Prueba</span>
                      </button>
                    </div>

                    {/* Quick Guide */}
                    <div className="bg-amber-50 rounded-3xl p-5 border border-amber-200 space-y-3 text-xs text-amber-950 font-medium">
                      <div className="font-black text-amber-900 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        <span>¿Cómo ayuda en Google Sites?</span>
                      </div>
                      <p className="leading-relaxed text-[11px]">
                        Al incrustar la tienda en <strong>Google Sites</strong>, las cookies de sesión y almacenamiento local mantienen activos los cortes a la medida, el carrito y el registro de eventos sin bloquear la navegación del cliente.
                      </p>
                    </div>

                  </div>

                </div>

              </div>
            )}

            {/* TAB: MERCADO LIBRE REST API CONNECTOR */}
            {activeTab === 'mercadolibre' && (
              <div className="space-y-6">
                <MercadoLibreSyncManager
                  products={products}
                  onOpenProductEdit={onEditProduct}
                />
              </div>
            )}

            {/* TAB: MERCADO PAGO REST API & CREDENTIALS */}
            {activeTab === 'mercadopago' && (
              <div className="space-y-6">
                <MercadoPagoConnector
                  onShowToast={(msg) => {
                    setPushSuccessMsg(msg);
                    setTimeout(() => setPushSuccessMsg(null), 4000);
                  }}
                />
              </div>
            )}

          </div>
        )}

        {/* DIALOG POPUP: EDIT TRACKING CODE & COURIER */}
        {editingTrackingOrder && (
          <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border-2 border-orange-400 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-base">
                      Editar Código de Seguimiento
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Pedido {editingTrackingOrder.orderNumber} • {editingTrackingOrder.customerName}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingTrackingOrder(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveTracking} className="space-y-4">
                <div className="space-y-1.5 text-xs font-bold">
                  <label className="text-slate-800">Empresa de Transporte / Courier</label>
                  <select
                    value={editTrackingCourier}
                    onChange={(e) => setEditTrackingCourier(e.target.value)}
                    className="w-full p-3 bg-slate-50 border-2 border-slate-200 focus:border-orange-500 rounded-xl text-slate-900 font-bold outline-hidden"
                  >
                    <option value="Blue Express">Blue Express</option>
                    <option value="Chilexpress">Chilexpress</option>
                    <option value="Starken">Starken</option>
                    <option value="Correos de Chile">Correos de Chile</option>
                    <option value="Retiro en Taller (Los Silos)">Retiro en Taller (Los Silos, Rengo)</option>
                  </select>
                </div>

                <div className="space-y-1.5 text-xs font-bold">
                  <label className="text-slate-800 flex items-center justify-between">
                    <span>Código de Seguimiento / N° Orden de Transporte</span>
                    <button
                      type="button"
                      onClick={handleGenerateTrackingCode}
                      className="text-orange-600 hover:text-orange-800 font-extrabold underline text-[11px] cursor-pointer"
                    >
                      Autogenerar Código
                    </button>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Ej. BX-748920194 o CX-918230192..."
                      value={editTrackingCode}
                      onChange={(e) => setEditTrackingCode(e.target.value)}
                      className="w-full p-3 bg-slate-50 border-2 border-slate-200 focus:border-orange-500 rounded-xl font-mono text-sm font-black text-slate-900 outline-hidden"
                    />
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-[11px] text-amber-900 font-medium leading-relaxed">
                  💡 Este código permitirá a <strong>{editingTrackingOrder.customerName}</strong> rastrear el avance desde el taller en Rengo hasta <strong>{editingTrackingOrder.commune}</strong> en tiempo real.
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingTrackingOrder(null)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs uppercase cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer active:scale-95"
                  >
                    Guardar Seguimiento
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* PDF CATALOG MODAL */}
        <PdfCatalogModal
          isOpen={isPdfModalOpen}
          onClose={() => setIsPdfModalOpen(false)}
          products={products}
        />

      </div>
    </div>
  );
};
