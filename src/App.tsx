import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { StorySection } from './components/StorySection';
import { CustomOrderForm } from './components/CustomOrderForm';
import { MeasurementTutorialSection } from './components/MeasurementTutorialSection';
import { ProductCatalog } from './components/ProductCatalog';
import { AddProductModal } from './components/AddProductModal';
import { SubscriptionSection } from './components/SubscriptionSection';
import { ReviewsSection } from './components/ReviewsSection';
import { GoogleBusinessReviewsSection } from './components/GoogleBusinessReviewsSection';
import { GoogleSitesSEOToolkit } from './components/GoogleSitesSEOToolkit';
import { ShippingCalculator } from './components/ShippingCalculator';
import { BlogSection } from './components/BlogSection';
import { SocialMediaBar } from './components/SocialMediaBar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { PaymentConfigModal } from './components/PaymentConfigModal';
import { WhatsAppBubble } from './components/WhatsAppBubble';
import { OrderConfirmationBanner, CompletedOrder } from './components/OrderConfirmationBanner';
import { AIChatbot } from './components/AIChatbot';
import { WorkshopMap } from './components/WorkshopMap';
import { AdminPanelModal } from './components/AdminPanelModal';
import { EditProductModal } from './components/EditProductModal';
import { ShipmentTrackingModal } from './components/ShipmentTrackingModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { WebPushPermissionBanner } from './components/WebPushPermissionBanner';
import { PwaInstallBanner } from './components/PwaInstallBanner';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { BrandLogoModal } from './components/BrandLogoModal';
import { ShareQrModal } from './components/ShareQrModal';
import { VisualCatalogModal } from './components/VisualCatalogModal';
import { CustomDomainModal } from './components/CustomDomainModal';

import { INITIAL_PRODUCTS, INITIAL_REVIEWS, DEFAULT_PAYMENT_CREDENTIALS, INITIAL_ORDERS, AdminOrder } from './data/mockData';
import { Product, Review, CartItem, CustomOrderItem, PaymentCredentials, PetMeasurements, PushNotificationItem } from './types';
import {
  getStoredPaymentConfig,
  MERCADOPAGO_CONFIG_UPDATED_EVENT,
} from './services/mercadoPagoService';
import {
  initServiceWorker,
  getStoredNotifications,
  subscribeNotificationEvents,
  broadcastOrderStatusPush,
  broadcastStockRestockedPush,
  sendWebPushNotification
} from './services/pushNotificationService';
import {
  getCookiePreferences,
  applyConsentToThirdParties,
  getTrackingSettings,
} from './services/cookieConsentService';
import { notifySubscribersProductRestocked } from './services/stockAlertService';
import {
  sendOrderConfirmationWhatsApp,
  sendOrderStatusUpdateWhatsApp,
} from './services/whatsappBusinessService';
import {
  initGA4,
  trackGA4PageView,
  trackGA4AddToCart,
  trackGA4RemoveFromCart,
  trackGA4ViewCart,
  trackGA4BeginCheckout,
  trackGA4Purchase,
  trackGA4CustomOrderSubmit,
  getGA4MeasurementId,
} from './services/analyticsService';

export default function App() {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('petsimona25_catalog_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Sanitize IDs so every product in the catalog has a strictly unique key
          const seenIds = new Set<string>();
          let hasDuplicate = false;
          const sanitized: Product[] = parsed.map((item, index) => {
            if (!item.id || seenIds.has(item.id)) {
              hasDuplicate = true;
              const uniqueId = `prod-${index + 1}-${Math.random().toString(36).slice(2, 6)}`;
              seenIds.add(uniqueId);
              return { ...item, id: uniqueId };
            }
            seenIds.add(item.id);
            return item;
          });
          if (hasDuplicate) {
            localStorage.setItem('petsimona25_catalog_products', JSON.stringify(sanitized));
          }
          return sanitized;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PRODUCTS;
  });
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [paymentConfig, setPaymentConfig] = useState<PaymentCredentials>(() => getStoredPaymentConfig());
  const [adminOrders, setAdminOrders] = useState<AdminOrder[]>(INITIAL_ORDERS);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customOrders, setCustomOrders] = useState<CustomOrderItem[]>([]);

  const [currency, setCurrency] = useState<'CLP' | 'USD' | 'MXN' | 'COP'>('CLP');

  // Push Notifications state
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [pushNotifications, setPushNotifications] = useState<PushNotificationItem[]>([]);

  useEffect(() => {
    // Apply Cookie consent and initialize Tracking
    const prefs = getCookiePreferences();
    const trackingConf = getTrackingSettings();
    applyConsentToThirdParties(prefs, trackingConf);

    // Initialize Google Analytics 4 (GA4) if permitted
    initGA4(trackingConf.ga4MeasurementId);
    trackGA4PageView('petsimona25.cl - Tienda de Ropa para Mascotas a la Medida', window.location.pathname);

    initServiceWorker();
    setPushNotifications(getStoredNotifications());
    const unsubscribe = subscribeNotificationEvents((updated) => {
      setPushNotifications(updated);
    });

    // Listen for payment credentials updates across all tabs / modals
    const handlePaymentConfigUpdated = (e: any) => {
      if (e?.detail) {
        setPaymentConfig(e.detail);
      } else {
        setPaymentConfig(getStoredPaymentConfig());
      }
    };
    window.addEventListener(MERCADOPAGO_CONFIG_UPDATED_EVENT, handlePaymentConfigUpdated);

    return () => {
      unsubscribe();
      window.removeEventListener(MERCADOPAGO_CONFIG_UPDATED_EVENT, handlePaymentConfigUpdated);
    };
  }, []);

  const unreadNotificationCount = pushNotifications.filter((n) => !n.read).length;

  // Completed Order State for Confirmation Banner
  const [activeCompletedOrder, setActiveCompletedOrder] = useState<CompletedOrder | null>(null);

  // Brand Logo Customizer Modal State
  const [isBrandLogoModalOpen, setIsBrandLogoModalOpen] = useState(false);

  // Share QR & Mobile APK Modal State
  const [isShareQrModalOpen, setIsShareQrModalOpen] = useState(false);
  const [shareQrDefaultTab, setShareQrDefaultTab] = useState<'qr' | 'apk'>('qr');

  const handleOpenShareQr = (tab: 'qr' | 'apk' = 'qr') => {
    setShareQrDefaultTab(tab);
    setIsShareQrModalOpen(true);
  };

  // Visual Lookbook Catalog Modal State
  const [isVisualCatalogOpen, setIsVisualCatalogOpen] = useState(false);

  // Custom Domain Modal State (petsimona25)
  const [isCustomDomainModalOpen, setIsCustomDomainModalOpen] = useState(false);

  // Shipment Tracking State
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [trackingSearchParam, setTrackingSearchParam] = useState<string | undefined>(undefined);

  const handleOpenTrackingModal = (codeOrOrderNumber?: string) => {
    if (codeOrOrderNumber) {
      setTrackingSearchParam(codeOrOrderNumber);
    }
    setIsTrackingModalOpen(true);
  };

  const handleUpdateOrderTracking = (
    orderId: string,
    trackingNumber: string,
    trackingCourier: string
  ) => {
    setAdminOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          broadcastOrderStatusPush(
            ord.orderNumber,
            'Despachado',
            trackingCourier,
            trackingNumber
          );
          // Trigger WhatsApp Business API automatic tracking update
          sendOrderStatusUpdateWhatsApp(
            ord,
            'Despachado',
            trackingCourier,
            trackingNumber
          );
          return {
            ...ord,
            trackingNumber,
            trackingCourier,
            courierName: trackingCourier,
            status: ord.status === 'Pendiente Corte' ? 'Listo Envíos' : ord.status,
          };
        }
        return ord;
      })
    );
    showToast(`✓ Código ${trackingNumber} (${trackingCourier}) guardado y notificado por Web Push y WhatsApp.`);
  };

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isPaymentConfigOpen, setIsPaymentConfigOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const handleUpdateOrderStatus = (orderId: string, newStatus: AdminOrder['status']) => {
    setAdminOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const courier = ord.trackingCourier || ord.courierName || 'Blue Express';
          broadcastOrderStatusPush(
            ord.orderNumber,
            newStatus,
            courier,
            ord.trackingNumber
          );
          // Trigger WhatsApp Business API automated status update
          sendOrderStatusUpdateWhatsApp(
            ord,
            newStatus,
            courier,
            ord.trackingNumber
          );
          return { ...ord, status: newStatus };
        }
        return ord;
      })
    );
    showToast(`✓ Estado del pedido actualizado a "${newStatus}" y notificado por Web Push y WhatsApp Business.`);
  };

  const handleAddManualOrder = (newOrder: AdminOrder) => {
    setAdminOrders((prev) => [newOrder, ...prev]);
  };

  // Product Editing & Inventory Handlers
  const handleUpdateProduct = (updatedProduct: Product) => {
    let wasOutOfStock = false;

    setProducts((prev) => {
      const existing = prev.find((p) => p.id === updatedProduct.id);
      if (existing && (!existing.inStock || existing.stock === 0)) {
        wasOutOfStock = true;
      }

      const next = prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
      try {
        localStorage.setItem('petsimona25_catalog_products', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    const isNowAvailable = updatedProduct.inStock && (updatedProduct.stock === undefined || updatedProduct.stock > 0);

    // If item was out of stock and is now marked as available, auto-notify all waiting email subscribers
    if (wasOutOfStock && isNowAvailable) {
      notifySubscribersProductRestocked(updatedProduct, updatedProduct.stock).then((res) => {
        if (res.notifiedCount > 0) {
          showToast(`🎉 ¡Stock de "${updatedProduct.name}" repuesto! Se enviaron automáticamente ${res.notifiedCount} correos de aviso a los clientes en lista de espera.`);
        } else {
          showToast(`✓ Se guardaron los cambios del artículo "${updatedProduct.name}" (${updatedProduct.stock || 10} un. disponibles)`);
        }
      });
    } else {
      showToast(`✓ Se guardaron los cambios del artículo "${updatedProduct.name}" (${updatedProduct.inStock ? `${updatedProduct.stock || 10} un. disponibles` : 'Agotado'})`);
    }

    // Sync any cart items referencing this product
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.product.id === updatedProduct.id) {
          return {
            ...item,
            product: updatedProduct,
            unitPrice: updatedProduct.price,
          };
        }
        return item;
      })
    );

    // Persist to server
    fetch(`/api/products/${updatedProduct.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedProduct),
    }).catch(() => {
      fetch('/api/products/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct),
      }).catch(console.error);
    });
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== productId);
      try {
        localStorage.setItem('petsimona25_catalog_products', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
    showToast('🗑️ Artículo eliminado del catálogo.');
  };

  const handleToggleProductStock = (productId: string, inStock: boolean) => {
    let targetProduct: Product | undefined;
    setProducts((prev) => {
      const next = prev.map((p) => {
        if (p.id === productId) {
          const updated: Product = {
            ...p,
            inStock,
            stock: inStock ? (p.stock && p.stock > 0 ? p.stock : 10) : 0,
          };
          targetProduct = updated;
          // Sync to server
          fetch(`/api/products/${productId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updated),
          }).catch(console.error);
          return updated;
        }
        return p;
      });
      try {
        localStorage.setItem('petsimona25_catalog_products', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    if (inStock && targetProduct) {
      notifySubscribersProductRestocked(targetProduct, targetProduct.stock).then((res) => {
        if (res.notifiedCount > 0) {
          showToast(`🎉 ¡Stock marcado como DISPONIBLE! Se notificó por email automáticamente a ${res.notifiedCount} clientes.`);
        } else {
          showToast(`✓ "${targetProduct?.name}" marcado como disponible en catálogo.`);
        }
      });
    } else {
      showToast('⚠️ Artículo marcado como agotado.');
    }
  };

  const handleUpdateProductStockDirect = (productId: string, newStock: number, inStock: boolean) => {
    let targetProduct: Product | undefined;
    setProducts((prev) => {
      const next = prev.map((p) => {
        if (p.id === productId) {
          const updated: Product = {
            ...p,
            stock: newStock,
            inStock: inStock && newStock > 0,
          };
          targetProduct = updated;
          fetch(`/api/products/${productId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updated),
          }).catch(console.error);
          return updated;
        }
        return p;
      });
      try {
        localStorage.setItem('petsimona25_catalog_products', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    if (inStock && newStock > 0 && targetProduct) {
      notifySubscribersProductRestocked(targetProduct, newStock).then((res) => {
        if (res.notifiedCount > 0) {
          showToast(`🎉 ¡Stock actualizado a ${newStock} un.! Se notificó por email automáticamente a ${res.notifiedCount} clientes.`);
        } else {
          showToast(`✓ Stock actualizado: ${newStock} unidades disponibles.`);
        }
      });
    } else {
      showToast('✓ Stock actualizado a 0 (Agotado)');
    }
  };

  // Cart operations
  const handleAddCatalogItemToCart = (
    product: Product,
    selectedSize: string,
    customMeasurements?: PetMeasurements
  ) => {
    // Live Stock Validation Check
    const liveProd = products.find((p) => p.id === product.id) || product;
    if (!liveProd.inStock || (liveProd.stock !== undefined && liveProd.stock <= 0)) {
      showToast(`⚠️ "${liveProd.name}" está temporalmente agotado. Puedes solicitarlo a la medida o suscribirte a la alerta.`);
      return;
    }

    const existingItem = cartItems.find(
      (item) => item.product.id === product.id && item.selectedSize === selectedSize
    );
    if (existingItem && liveProd.stock !== undefined && existingItem.quantity >= liveProd.stock) {
      showToast(`⚠️ Solo quedan ${liveProd.stock} unidades en taller de "${liveProd.name}".`);
      return;
    }

    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedSize === selectedSize
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      }

      const newItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random()}`,
        product,
        selectedSize,
        customMeasurements,
        quantity: 1,
        unitPrice: product.price,
      };
      return [...prev, newItem];
    });

    // GA4 Track Add to Cart
    trackGA4AddToCart({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      quantity: 1,
      selectedSize,
      customMeasurements: !!customMeasurements,
    });

    setIsCartOpen(true);
  };

  const handleAddCustomOrderToCart = (customOrder: CustomOrderItem) => {
    setCustomOrders((prev) => [...prev, customOrder]);
    
    // GA4 Track Custom Order & Add to Cart
    trackGA4CustomOrderSubmit(
      customOrder.petName,
      customOrder.breed,
      customOrder.garmentType,
      customOrder.calculatedSize
    );
    trackGA4AddToCart({
      id: customOrder.id,
      name: `Corte a la Medida: ${customOrder.garmentType} (${customOrder.petName})`,
      category: 'confeccion_personalizada',
      price: customOrder.price,
      quantity: 1,
      selectedSize: customOrder.calculatedSize,
      customMeasurements: true,
    });

    setIsCartOpen(true);
  };

  const handleRemoveCartItem = (id: string) => {
    const itemToRemove = cartItems.find((item) => item.id === id);
    if (itemToRemove) {
      trackGA4RemoveFromCart({
        id: itemToRemove.product.id,
        name: itemToRemove.product.name,
        price: itemToRemove.unitPrice,
        quantity: itemToRemove.quantity,
      });
    }
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleRemoveCustomOrder = (id: string) => {
    const itemToRemove = customOrders.find((order) => order.id === id);
    if (itemToRemove) {
      trackGA4RemoveFromCart({
        id: itemToRemove.id,
        name: `Corte a la Medida: ${itemToRemove.garmentType}`,
        price: itemToRemove.price,
        quantity: 1,
      });
    }
    setCustomOrders((prev) => prev.filter((order) => order.id !== id));
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleAddNewProduct = (
    newProd: Omit<Product, 'id' | 'rating' | 'reviewCount'>
  ) => {
    const fullProd: Product = {
      ...newProd,
      id: `prod-${Date.now()}`,
      rating: 5.0,
      reviewCount: 0,
      inStock: newProd.inStock !== undefined ? newProd.inStock : true,
      stock: newProd.stock !== undefined ? newProd.stock : (newProd.inStock === false ? 0 : 10),
    };

    setProducts((prev) => {
      const next = [fullProd, ...prev];
      try {
        localStorage.setItem('petsimona25_catalog_products', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    showToast(`✨ Nuevo artículo "${fullProd.name}" agregado y guardado en el catálogo.`);

    // Send to backend store endpoint as well
    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullProd),
    }).catch(console.error);
  };

  const handleAddNewReview = (newRev: Omit<Review, 'id' | 'date' | 'verified'>) => {
    const fullRev: Review = {
      ...newRev,
      id: `rev-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      verified: true,
    };

    setReviews((prev) => [fullRev, ...prev]);

    fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRev),
    }).catch(console.error);
  };

  const totalCartCount =
    cartItems.reduce((acc, item) => acc + item.quantity, 0) + customOrders.length;

  const totalCartPriceCop =
    cartItems.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0) +
    customOrders.reduce((acc, order) => acc + order.price, 0);

  return (
    <div className="min-h-screen bg-amber-50/20 text-amber-950 font-sans antialiased selection:bg-amber-200 selection:text-amber-950">
      {/* Top Navbar */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => {
          trackGA4ViewCart(cartItems, customOrders, totalCartPriceCop);
          setIsCartOpen(true);
        }}
        onOpenPaymentConfig={() => setIsPaymentConfigOpen(true)}
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
        onOpenTracking={() => handleOpenTrackingModal()}
        onOpenNotificationCenter={() => setIsNotificationCenterOpen(true)}
        onOpenBrandLogoModal={() => setIsBrandLogoModalOpen(true)}
        onOpenShareQr={handleOpenShareQr}
        onOpenVisualCatalog={() => setIsVisualCatalogOpen(true)}
        onOpenCustomDomain={() => setIsCustomDomainModalOpen(true)}
        unreadNotificationCount={unreadNotificationCount}
        currency={currency}
        onChangeCurrency={setCurrency}
        paymentConfig={paymentConfig}
      />

      {/* Non-intrusive Web Push Permission Banner */}
      <WebPushPermissionBanner />

      {/* Handcrafted Pet Fashion PWA / WebAPK Promotional Install Banner */}
      <PwaInstallBanner onOpenApkModal={() => handleOpenShareQr('apk')} />

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 max-w-md bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border-2 border-orange-400 flex items-center justify-between gap-3 animate-slide-down">
          <span className="text-xs font-black tracking-wide leading-relaxed">
            {toastMessage}
          </span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white text-xs font-black uppercase tracking-wider ml-2 underline cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      )}

      <main>
        {/* Hero Section */}
        <Hero
          onOpenShareQr={handleOpenShareQr}
          onOpenCustomDomain={() => setIsCustomDomainModalOpen(true)}
          onOpenVisualCatalog={() => setIsVisualCatalogOpen(true)}
        />

        {/* Story Section - Founder from Maipú to Rengo, ecological reusable materials */}
        <StorySection />

        {/* Custom Order Form - "formulario de ingreso elegir raza el nombre mascota ingresar medidas..." */}
        <CustomOrderForm onAddToCart={handleAddCustomOrderToCart} />

        {/* Measurement Tutorial Section - "tutorial explicativo cómo se debe tomar las medidas" */}
        <MeasurementTutorialSection />

        {/* Shipping Cost Calculator - "cálculo de costos de envío basado en comunas de la Región de O'Higgins y el resto de Chile" */}
        <ShippingCalculator />

        {/* Workshop Geographic Map - Taller en Rengo Los Silos & Rosario */}
        <WorkshopMap />

        {/* Blog & SEO Articles Section - "sección de blog simple para el cuidado de mascotas y moda sostenible" */}
        <BlogSection />

        {/* Product Catalog - "Carritos de compra tener la opción de ingresar artículos a la venta" */}
        <ProductCatalog
          products={products}
          onAddToCart={handleAddCatalogItemToCart}
          onOpenAddProductModal={() => setIsAddProductOpen(true)}
          onEditProduct={(product) => setEditingProduct(product)}
          onUpdateProductStock={handleUpdateProductStockDirect}
          onNotifyToast={showToast}
          currency={currency}
        />

        {/* Subscription Section - "agregar suscripción" */}
        <SubscriptionSection />

        {/* Reviews & Testimonials - "reseñas testimonios" */}
        <ReviewsSection reviews={reviews} onAddReview={handleAddNewReview} />

        {/* Google My Business & Google Maps Reviews Booster for Local SEO in Rengo */}
        <GoogleBusinessReviewsSection />

        {/* Google Sites & Search Console Toolkit - "adaptado para Google sites y Google search console" */}
        <GoogleSitesSEOToolkit products={products} />

        {/* Social Media Bar - "@petsimona25 TikTok Instagram Facebook" */}
        <SocialMediaBar />
      </main>

      {/* Footer */}
      <Footer
        onOpenTracking={() => handleOpenTrackingModal()}
        onOpenBrandLogoModal={() => setIsBrandLogoModalOpen(true)}
        onOpenShareQr={handleOpenShareQr}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        customOrders={customOrders}
        products={products}
        onRemoveCartItem={handleRemoveCartItem}
        onRemoveCustomOrder={handleRemoveCustomOrder}
        onUpdateQuantity={handleUpdateQuantity}
        onProceedToCheckout={() => {
          trackGA4BeginCheckout(cartItems, customOrders, totalCartPriceCop);
          setIsCheckoutOpen(true);
        }}
        currency={currency}
      />

      {/* Checkout Modal (Mercado Pago & PayPal) */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        customOrders={customOrders}
        products={products}
        totalPriceCop={totalCartPriceCop}
        currency={currency}
        paymentConfig={paymentConfig}
        onClearCart={() => {
          setCartItems([]);
          setCustomOrders([]);
        }}
        onStockDeducted={(updated) => {
          setProducts(updated);
          try {
            localStorage.setItem('petsimona25_catalog_products', JSON.stringify(updated));
          } catch (e) {}
          showToast('✓ Stock de taller actualizado automáticamente tras confirmación');
        }}
        onOrderSuccess={(order) => {
          setActiveCompletedOrder(order);
          const newAdminOrd: AdminOrder = {
            id: `ord-${Date.now()}`,
            orderNumber: order.orderNumber,
            date: order.date,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            customerPhone: '+56972374764',
            shippingAddress: order.shippingAddress,
            commune: order.commune,
            courierName: order.courierName,
            paymentMethod: order.paymentMethod,
            grandTotal: order.grandTotal,
            itemsSummary: `${order.itemsCount}x Prendas a la medida petsimona25`,
            status: 'Pendiente Corte'
          };
          setAdminOrders((prev) => [newAdminOrd, ...prev]);

          // GA4 Track Purchase Conversion
          trackGA4Purchase({
            orderNumber: order.orderNumber,
            grandTotal: order.grandTotal,
            shippingCost: order.shippingCost || 0,
            courierName: order.courierName,
            paymentMethod: order.paymentMethod,
            commune: order.commune,
            items: [
              ...cartItems.map((ci) => ({
                id: ci.product.id,
                name: ci.product.name,
                price: ci.unitPrice,
                quantity: ci.quantity,
              })),
              ...customOrders.map((co) => ({
                id: co.id,
                name: `Corte a Medida: ${co.garmentType}`,
                price: co.price,
                quantity: 1,
              })),
            ],
          });

          // Trigger celebratory Web Push notification
          sendWebPushNotification({
            title: `🎉 ¡Pedido ${order.orderNumber} Registrado!`,
            body: `Hola ${order.customerName}, tu pedido de ropa a medida para ${order.commune} ya ingresó al taller en Rengo. ¡Atento a tus notificaciones!`,
            category: 'pedido',
            orderNumber: order.orderNumber,
            linkUrl: `/?tracking=${order.orderNumber}`,
          });

          // Trigger automated WhatsApp Business Order Confirmation
          sendOrderConfirmationWhatsApp({
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
            courierName: order.courierName,
          });
        }}
      />

      {/* Post-Purchase Order Confirmation Floating Banner / Modal */}
      {activeCompletedOrder && (
        <OrderConfirmationBanner
          order={activeCompletedOrder}
          onClose={() => setActiveCompletedOrder(null)}
          onOpenTracking={(code) => handleOpenTrackingModal(code)}
        />
      )}

      {/* Admin Panel Modal (Owner Control & CSV Export) */}
      <AdminPanelModal
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        orders={adminOrders}
        products={products}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        onUpdateOrderTracking={handleUpdateOrderTracking}
        onOpenTrackingModal={(code) => handleOpenTrackingModal(code)}
        onAddManualOrder={handleAddManualOrder}
        onEditProduct={(p) => setEditingProduct(p)}
        onOpenAddProduct={() => setIsAddProductOpen(true)}
        onToggleProductStock={handleToggleProductStock}
      />

      {/* Shipment Tracking Modal (Código de Seguimiento & Llegada a Destino) */}
      <ShipmentTrackingModal
        isOpen={isTrackingModalOpen}
        onClose={() => {
          setIsTrackingModalOpen(false);
          setTrackingSearchParam(undefined);
        }}
        orders={adminOrders}
        initialTrackingCodeOrOrderNumber={trackingSearchParam}
      />

      {/* Add Product Modal (Store Owner / Seller) */}
      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        onAddProduct={handleAddNewProduct}
      />

      {/* Edit Product Modal (Modify Stock, Details, Status) */}
      <EditProductModal
        product={editingProduct}
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
      />

      {/* Payment Credentials Modal */}
      <PaymentConfigModal
        isOpen={isPaymentConfigOpen}
        onClose={() => setIsPaymentConfigOpen(false)}
        config={paymentConfig}
        onSaveConfig={setPaymentConfig}
      />

      {/* Notification Center Modal (Web Push Manager & Inbox) */}
      <NotificationCenterModal
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
        onOpenTracking={(code) => {
          setIsNotificationCenterOpen(false);
          handleOpenTrackingModal(code);
        }}
        onUsePromo={(code) => {
          setIsNotificationCenterOpen(false);
          showToast(`🎟️ ¡Cupón ${code} copiado! Aplicable en tu carrito.`);
        }}
      />

      {/* Brand Identity & Logo Customizer Modal */}
      <BrandLogoModal
        isOpen={isBrandLogoModalOpen}
        onClose={() => setIsBrandLogoModalOpen(false)}
        onShowToast={(msg) => showToast(msg)}
      />

      {/* WhatsApp Direct Floating Bubble (+56972374764) */}
      <WhatsAppBubble />

      {/* AI Chatbot for FAQs (Simona Bot 🐾) */}
      <AIChatbot />

      {/* Cookie Consent & Tracking Preferences Banner */}
      <CookieConsentBanner />

      {/* Share QR & Mobile APK Modal */}
      <ShareQrModal
        isOpen={isShareQrModalOpen}
        onClose={() => setIsShareQrModalOpen(false)}
        defaultTab={shareQrDefaultTab}
        onOpenCustomDomain={() => {
          setIsShareQrModalOpen(false);
          setIsCustomDomainModalOpen(true);
        }}
        onOpenVisualCatalog={() => {
          setIsShareQrModalOpen(false);
          setIsVisualCatalogOpen(true);
        }}
      />

      {/* Visual Catalog Lookbook Modal */}
      <VisualCatalogModal
        isOpen={isVisualCatalogOpen}
        onClose={() => setIsVisualCatalogOpen(false)}
        products={products}
      />

      {/* Custom Domain Management Modal (petsimona25) */}
      <CustomDomainModal
        isOpen={isCustomDomainModalOpen}
        onClose={() => setIsCustomDomainModalOpen(false)}
        onDomainChanged={() => {
          showToast('🌐 Dominio activo actualizado en toda la tienda.');
        }}
      />
    </div>
  );
}
