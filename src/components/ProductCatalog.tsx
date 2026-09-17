import React, { useState, useEffect } from 'react';
import { Product, CartItem, PetMeasurements } from '../types';
import { Star, PlusCircle, ShoppingBag, Sparkles, Filter, Check, Package, Ban, CheckCircle2, Edit3, Bell, BellRing, Flame, ShieldCheck, Zap, Tag, Mail, Scissors, Eye, CreditCard, ArrowRightLeft, Lock, FileSpreadsheet, Download, ExternalLink, Copy } from 'lucide-react';
import { StockNotificationModal } from './StockNotificationModal';
import {
  getStoredStockAlerts,
  isEmailSubscribedToProduct,
  STOCK_SUBSCRIBERS_UPDATED_EVENT,
} from '../services/stockAlertService';
import { generateOptimizedImageSEO, getProductImageAlt } from '../services/imageSeoService';
import { exportProductsToGoogleSheetsCSV, copyProductsToClipboardForGoogleSheets, openNewGoogleSheet } from '../services/productExportService';

interface ProductCatalogProps {
  products: Product[];
  onAddToCart: (product: Product, selectedSize: string, customMeasurements?: PetMeasurements) => void;
  onOpenAddProductModal: () => void;
  onEditProduct?: (product: Product) => void;
  onNotifyToast?: (msg: string) => void;
  currency: 'CLP' | 'USD' | 'MXN' | 'COP';
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  onAddToCart,
  onOpenAddProductModal,
  onEditProduct,
  onNotifyToast,
  currency,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [stockFilter, setStockFilter] = useState<'all' | 'available' | 'out_of_stock'>('all');
  const [sizeSelectionMap, setSizeSelectionMap] = useState<Record<string, string>>({});
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});
  
  // Stock Alert Modal State
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [stockModalProduct, setStockModalProduct] = useState<Product | null>(null);
  const [stockModalSize, setStockModalSize] = useState<string>('M');
  const [subscribedProductsMap, setSubscribedProductsMap] = useState<Record<string, boolean>>({});

  // Sync subscribed products
  const updateSubscribedMap = () => {
    const alerts = getStoredStockAlerts();
    const map: Record<string, boolean> = {};
    alerts.forEach((a) => {
      if (!a.notified) {
        map[a.productId] = true;
      }
    });
    setSubscribedProductsMap(map);
  };

  useEffect(() => {
    updateSubscribedMap();
    window.addEventListener(STOCK_SUBSCRIBERS_UPDATED_EVENT, updateSubscribedMap);
    return () => window.removeEventListener(STOCK_SUBSCRIBERS_UPDATED_EVENT, updateSubscribedMap);
  }, []);

  const handleOpenStockModal = (product: Product) => {
    const preferredSize = sizeSelectionMap[product.id] || product.sizes[0] || 'M';
    setStockModalProduct(product);
    setStockModalSize(preferredSize);
    setIsStockModalOpen(true);
  };

  const categories = [
    { id: 'todos', label: 'Todos los Artículos' },
    { id: 'abrigos', label: 'Abrigos de Lana' },
    { id: 'impermeables', label: 'Impermeables' },
    { id: 'camisetas', label: 'Camisetas' },
    { id: 'vestidos', label: 'Vestidos de Gala' },
    { id: 'pijamas', label: 'Pijamas' },
    { id: 'accesorios', label: 'Bandanas & Accesorios' },
  ];

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'todos' || p.category === selectedCategory;
    const isAvailable = p.inStock && (p.stock === undefined || p.stock > 0);
    const matchesStock =
      stockFilter === 'all'
        ? true
        : stockFilter === 'available'
        ? isAvailable
        : !isAvailable;
    return matchesCategory && matchesStock;
  });

  const formatPrice = (priceAmount: number) => {
    if (currency === 'USD') {
      return `$${(priceAmount / 950).toFixed(2)} USD`;
    }
    if (currency === 'MXN') {
      return `$${(priceAmount / 50).toFixed(0)} MXN`;
    }
    if (currency === 'COP') {
      return `$${(priceAmount * 4.2).toLocaleString('es-CO')} COP`;
    }
    return `$${priceAmount.toLocaleString('es-CL')} CLP`;
  };

  // Google Sheets Export Feedback
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  const handleExportGoogleSheets = () => {
    const result = exportProductsToGoogleSheetsCSV(products, selectedCategory === 'todos' ? 'catalogo_completo' : selectedCategory);
    setExportFeedback(`¡${result.totalProducts} artículos descargados para Google Sheets!`);
    setTimeout(() => setExportFeedback(null), 4000);
  };

  const handleCopyGoogleSheets = async () => {
    const success = await copyProductsToClipboardForGoogleSheets(products);
    if (success) {
      setExportFeedback('¡Datos tabulares copiados! Pégalos (Ctrl+V) en Google Sheets');
    } else {
      setExportFeedback('No se pudo copiar automáticamente');
    }
    setTimeout(() => setExportFeedback(null), 4000);
  };

  const handleSizeChange = (productId: string, size: string) => {
    setSizeSelectionMap((prev) => ({ ...prev, [productId]: size }));
  };

  const handleAdd = (product: Product) => {
    if (!product.inStock || (product.stock !== undefined && product.stock <= 0)) {
      return;
    }
    const selectedSize = sizeSelectionMap[product.id] || product.sizes[0] || 'M';
    onAddToCart(product, selectedSize);

    setAddedMap((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedMap((prev) => ({ ...prev, [product.id]: false }));
    }, 2000);
  };

  return (
    <section id="catalogo" className="py-16 bg-gradient-to-b from-amber-50/40 via-orange-50/30 to-white border-b-2 border-orange-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header & Seller Action */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-orange-200 pb-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900 text-yellow-300 font-black text-xs uppercase tracking-wider shadow-xs">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span>Colección Artesanal petsimona25 (Rengo, Chile)</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-950 font-extrabold text-xs border border-amber-300">
                <Tag className="w-3.5 h-3.5 text-amber-700" />
                <span>Cupón: <strong>PETSIMONA25</strong> (-15% OFF)</span>
              </div>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Prendas Listas para Despacho 🐕
            </h2>
            <p className="text-slate-600 text-sm max-w-xl font-medium">
              Elige tallas estándar con stock inmediato para despacho hoy mismo, o personaliza el calce de cualquiera en nuestro taller de Rengo.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Google Sheets Export Button */}
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-300 p-1 rounded-2xl shadow-xs">
              <button
                type="button"
                onClick={handleExportGoogleSheets}
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-3.5 py-2.5 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                title="Descargar catálogo completo de artículos en venta como CSV estructurado para Google Sheets o Excel"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
                <span>Descargar en Google Sheets</span>
              </button>

              <button
                type="button"
                onClick={handleCopyGoogleSheets}
                className="p-2 text-emerald-800 hover:text-emerald-950 hover:bg-emerald-100 rounded-xl transition-all cursor-pointer"
                title="Copiar datos tabulares al portapapeles para pegar directo con Ctrl+V en una hoja de Google Sheets"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={openNewGoogleSheet}
                className="p-2 text-emerald-800 hover:text-emerald-950 hover:bg-emerald-100 rounded-xl transition-all cursor-pointer"
                title="Abrir una nueva hoja en blanco en Google Sheets (sheets.new)"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={onOpenAddProductModal}
              className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-yellow-300 font-black uppercase tracking-widest px-5 py-3 rounded-2xl shadow-md transition-all active:scale-95 text-xs sm:text-sm shrink-0 border border-slate-700 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-yellow-400" />
              Ingresar Nuevo Artículo
            </button>
          </div>
        </div>

        {/* Feedback Alert for Export */}
        {exportFeedback && (
          <div className="bg-emerald-100 border-2 border-emerald-400 text-emerald-950 p-3.5 rounded-2xl text-xs font-black flex items-center justify-between shadow-xs animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{exportFeedback}</span>
            </div>
            <button
              type="button"
              onClick={openNewGoogleSheet}
              className="inline-flex items-center gap-1 text-[11px] underline text-emerald-800 hover:text-emerald-950 cursor-pointer font-extrabold"
            >
              <span>Abrir sheets.new</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Payment Methods Trust Banner */}
        <div className="bg-gradient-to-r from-sky-50 via-white to-emerald-50 border border-slate-200/90 rounded-3xl p-3 sm:p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-slate-800 text-xs text-center sm:text-left">
            <span className="p-2 bg-sky-100 text-sky-700 rounded-xl">
              <CreditCard className="w-4 h-4" />
            </span>
            <div>
              <span className="font-black text-slate-900 block text-xs sm:text-sm">
                Medios de Pago Disponibles en Todos los Artículos
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Paga de forma rápida y 100% segura con tus plataformas favoritas
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {/* MercadoPago badge */}
            <div className="flex items-center gap-1.5 bg-sky-500 text-white px-3 py-1.5 rounded-xl shadow-xs font-black text-xs">
              <span className="w-2 h-2 rounded-full bg-white shrink-0 animate-pulse"></span>
              <span>MercadoPago</span>
            </div>

            {/* Visa badge */}
            <div className="flex items-center gap-1.5 bg-blue-900 text-white px-3 py-1.5 rounded-xl shadow-xs font-black text-xs">
              <span className="tracking-wider text-yellow-400">VISA</span>
              <span className="text-[10px] text-blue-200 font-normal">/ Débito / Webpay</span>
            </div>

            {/* Transfer badge */}
            <div className="flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1.5 rounded-xl shadow-xs font-black text-xs">
              <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-200" />
              <span>Transferencia (Transfer)</span>
            </div>

            {/* PayPal badge */}
            <div className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-xl shadow-xs font-black text-xs">
              <Lock className="w-3.5 h-3.5 text-blue-200" />
              <span>PayPal</span>
              <span className="text-[10px] text-blue-200 font-normal">/ Global</span>
            </div>
          </div>
        </div>

        {/* Category & Stock Filters */}
        <div className="space-y-3">
          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-5 py-2.5 rounded-full font-black text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md'
                    : 'bg-white hover:bg-orange-100 text-slate-800 border-2 border-orange-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Stock Status Filter Bar */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-black text-slate-500 uppercase tracking-wider text-[11px] mr-1 flex items-center gap-1">
              <Package className="w-3.5 h-3.5 text-slate-600" /> Disponibilidad:
            </span>
            <button
              onClick={() => setStockFilter('all')}
              className={`px-3 py-1 rounded-lg font-extrabold transition-colors border cursor-pointer ${
                stockFilter === 'all'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Todos ({products.length})
            </button>
            <button
              onClick={() => setStockFilter('available')}
              className={`px-3 py-1 rounded-lg font-extrabold transition-colors border flex items-center gap-1 cursor-pointer ${
                stockFilter === 'available'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-emerald-700 border-slate-200 hover:bg-emerald-50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Disponibles ({products.filter((p) => p.inStock && (p.stock === undefined || p.stock > 0)).length})
            </button>
            <button
              onClick={() => setStockFilter('out_of_stock')}
              className={`px-3 py-1 rounded-lg font-extrabold transition-colors border flex items-center gap-1 cursor-pointer ${
                stockFilter === 'out_of_stock'
                  ? 'bg-red-600 text-white border-red-600'
                  : 'bg-white text-red-700 border-slate-200 hover:bg-red-50'
              }`}
            >
              <Ban className="w-3.5 h-3.5" />
              Agotados ({products.filter((p) => !p.inStock || p.stock === 0).length})
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => {
            const currentSelectedSize = sizeSelectionMap[product.id] || product.sizes[0];
            const isAdded = addedMap[product.id];
            const isAvailable = product.inStock && (product.stock !== undefined ? product.stock > 0 : true);
            const stockUnits = product.stock !== undefined ? product.stock : (product.inStock ? 10 : 0);
            const isLowStock = isAvailable && stockUnits <= 3 && stockUnits > 0;

            return (
              <div
                key={product.id}
                className={`bg-white rounded-3xl overflow-hidden border-2 transition-all flex flex-col group ${
                  isAvailable
                    ? 'border-orange-200/90 shadow-md hover:shadow-2xl hover:border-orange-400'
                    : 'border-slate-200 shadow-xs opacity-90'
                }`}
              >
                {/* Product Image */}
                {(() => {
                  const imageSEO = generateOptimizedImageSEO(product);
                  return (
                    <div
                      className="relative h-64 overflow-hidden bg-amber-50"
                      itemScope
                      itemType="https://schema.org/ImageObject"
                    >
                      <meta itemProp="name" content={product.name} />
                      <meta itemProp="description" content={imageSEO.altText} />
                      <meta itemProp="contentUrl" content={product.imageUrl} />
                      <meta itemProp="caption" content={imageSEO.imageCaption} />
                      <img
                        src={product.imageUrl}
                        alt={imageSEO.altText}
                        title={imageSEO.imageTitle}
                        itemProp="thumbnail"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className={`w-full h-full object-cover transition-transform duration-500 ${
                          isAvailable ? 'group-hover:scale-105' : 'grayscale-30'
                        }`}
                      />
                  
                      {/* Stock Availability & Urgency Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                    {isAvailable ? (
                      <>
                        {isLowStock ? (
                          <span className="bg-gradient-to-r from-red-600 to-orange-600 text-white font-black text-[11px] uppercase tracking-wider px-3 py-1 rounded-full shadow-md flex items-center gap-1 animate-pulse">
                            <Flame className="w-3 h-3 text-yellow-300 fill-yellow-300" />
                            ¡Solo {stockUnits} unidades listas!
                          </span>
                        ) : (
                          <span className="bg-emerald-600 text-white font-black text-[11px] uppercase tracking-wider px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Stock Listo ({stockUnits} un.)
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="bg-slate-900 text-red-300 border border-red-500 font-black text-[11px] uppercase tracking-wider px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                        <Ban className="w-3 h-3 text-red-400" />
                        AGOTADO
                      </span>
                    )}

                    {product.isNew && (
                      <span className="bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-md">
                        NUEVO
                      </span>
                    )}
                  </div>

                  {/* Top Right Actions: Customizable & Edit Button */}
                  <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
                    {product.isCustomizable && (
                      <span className="bg-yellow-400 text-slate-900 font-black text-[11px] px-3 py-1 rounded-full shadow-xs border border-yellow-500 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-slate-950" /> A la Medida
                      </span>
                    )}

                    {onEditProduct && (
                      <button
                        onClick={() => onEditProduct(product)}
                        className="bg-white/95 hover:bg-white text-slate-800 hover:text-blue-600 font-extrabold text-[11px] px-2.5 py-1 rounded-full shadow-md border border-slate-300 flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                        title="Editar información, precio o stock del producto"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Editar</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}

                {/* Product Body */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-orange-600">
                        {product.category}
                      </span>
                      <div className="flex items-center gap-1 text-xs font-black text-slate-900 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-500" />
                        <span>{product.rating}</span>
                        <span className="text-slate-500 font-bold">
                          ({product.reviewCount})
                        </span>
                      </div>
                    </div>

                    <h3 className="text-lg font-black text-slate-900 leading-snug group-hover:text-orange-600 transition-colors">
                      {product.name}
                    </h3>

                    <p className="text-xs text-slate-600 font-medium line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {/* Size Choice, Stock Notice & Price */}
                  <div className="space-y-3 pt-2 border-t-2 border-orange-100">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-slate-900 uppercase">Talla:</span>
                      <select
                        value={currentSelectedSize}
                        disabled={!isAvailable}
                        onChange={(e) => handleSizeChange(product.id, e.target.value)}
                        className="text-xs font-extrabold bg-slate-50 border-2 border-slate-200 rounded-xl px-2.5 py-1 text-slate-900 disabled:opacity-50 cursor-pointer"
                      >
                        {product.sizes.map((sz) => (
                          <option key={sz} value={sz}>
                            {sz}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Stock Detail Line with Quick Edit trigger */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-bold text-[11px]">Inventario Taller:</span>
                      <div className="flex items-center gap-2">
                        {isAvailable ? (
                          <span className={`font-black text-[11px] flex items-center gap-1 ${isLowStock ? 'text-amber-800' : 'text-emerald-700'}`}>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            {stockUnits > 0 ? `${stockUnits} unidades listas` : 'En stock'}
                          </span>
                        ) : (
                          <span className="text-red-600 font-black text-[11px] flex items-center gap-1">
                            <Ban className="w-3 h-3 text-red-500" />
                            Sin stock físico
                          </span>
                        )}

                        {onEditProduct && (
                          <button
                            onClick={() => onEditProduct(product)}
                            className="text-[10px] text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer"
                          >
                            Modificar
                          </button>
                        )}
                      </div>
                    </div>

                    {/* High-Impulse Pricing & Action CTA */}
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="text-[10px] text-slate-400 font-black block uppercase tracking-wider">Precio:</span>
                        <span className="text-2xl font-black text-slate-950 tracking-tight">
                          {formatPrice(product.price)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isAvailable ? (
                          <button
                            onClick={() => handleAdd(product)}
                            className={`inline-flex items-center gap-2 font-black uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95 text-xs cursor-pointer ${
                              isAdded
                                ? 'bg-emerald-600 text-white shadow-emerald-500/30'
                                : 'bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 hover:from-orange-500 hover:to-amber-500 text-white shadow-orange-500/25 hover:shadow-lg'
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <Check className="w-4 h-4 text-white" /> ¡Agregado!
                              </>
                            ) : (
                              <>
                                <ShoppingBag className="w-4 h-4 text-white" /> Al Carrito
                              </>
                            )}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenStockModal(product)}
                            className={`inline-flex items-center gap-1.5 font-black uppercase tracking-wider px-3.5 py-2.5 rounded-xl text-xs transition-all active:scale-95 cursor-pointer shadow-xs ${
                              subscribedProductsMap[product.id]
                                ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border-2 border-emerald-300'
                                : 'bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white shadow-orange-500/20'
                            }`}
                            title="Recibir aviso automático a tu correo electrónico en cuanto vuelva el stock"
                          >
                            {subscribedProductsMap[product.id] ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                                <span>Aviso por Email Activo</span>
                              </>
                            ) : (
                              <>
                                <Mail className="w-3.5 h-3.5" />
                                <span>Avisarme Stock</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Medios de Pago Visibles en el Artículo */}
                    <div className="bg-slate-50/90 border border-slate-200/90 rounded-2xl p-2.5 space-y-1.5 shadow-2xs">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-extrabold text-slate-700 flex items-center gap-1">
                          <CreditCard className="w-3 h-3 text-sky-600" />
                          Medios de Pago:
                        </span>
                        <span className="text-[9px] font-black text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded border border-emerald-200">
                          100% Seguro
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        {/* MercadoPago */}
                        <div className="bg-white border border-sky-200 px-1.5 py-1 rounded-xl text-center shadow-2xs flex items-center justify-center gap-1" title="Paga con saldo o pasarela MercadoPago">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0"></span>
                          <span className="text-[10px] font-black text-sky-900 tracking-tight leading-none">MercadoPago</span>
                        </div>

                        {/* Visa */}
                        <div className="bg-white border border-indigo-200 px-1.5 py-1 rounded-xl text-center shadow-2xs flex items-center justify-center gap-1" title="Tarjetas de crédito o débito Visa, Mastercard y Redcompra">
                          <span className="text-[10px] font-black text-blue-900 tracking-wider leading-none">VISA</span>
                          <span className="text-[8px] font-bold text-slate-500 leading-none">/ Débito</span>
                        </div>

                        {/* Transfer */}
                        <div className="bg-white border border-emerald-200 px-1.5 py-1 rounded-xl text-center shadow-2xs flex items-center justify-center gap-1" title="Transferencia bancaria directa a Cuenta Taller Rengo">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                          <span className="text-[10px] font-black text-emerald-900 tracking-tight leading-none">Transfer</span>
                        </div>

                        {/* PayPal */}
                        <div className="bg-white border border-blue-200 px-1.5 py-1 rounded-xl text-center shadow-2xs flex items-center justify-center gap-1" title="Paga seguro con tu saldo o cuenta PayPal">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
                          <span className="text-[10px] font-black text-blue-900 tracking-tight leading-none">PayPal</span>
                        </div>
                      </div>
                    </div>

                    {/* Trust Micro-Tag */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                      <span className="flex items-center gap-1 text-emerald-700">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Garantía de Calce
                      </span>
                      <span className="flex items-center gap-1 text-slate-600">
                        <Zap className="w-3 h-3 text-amber-500" />
                        Despacho a todo Chile
                      </span>
                    </div>

                    {!isAvailable && (
                      <div className="space-y-1.5 pt-1">
                        {subscribedProductsMap[product.id] ? (
                          <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-0.5">
                            <span className="text-[11px] font-black text-emerald-900 flex items-center justify-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Alerta automática configurada
                            </span>
                            <p className="text-[10px] text-emerald-700 font-medium">
                              Te notificaremos a tu correo en el instante de reposición.
                            </p>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenStockModal(product)}
                            className="w-full p-2 rounded-xl bg-amber-50/80 hover:bg-amber-100/80 border border-amber-300 text-center text-[11px] font-bold text-amber-950 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Bell className="w-3 h-3 text-amber-700" />
                            <span>¿Deseas este modelo? <strong>Captura tu email aquí</strong></span>
                          </button>
                        )}

                        {product.isCustomizable && (
                          <p className="text-[10px] text-orange-800 font-bold text-center bg-orange-50/80 p-1.5 rounded-lg border border-orange-200">
                            ✂️ O pídela hecha a la medida en nuestro taller de Rengo
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stock Notification Capture Modal */}
        <StockNotificationModal
          product={stockModalProduct}
          selectedSize={stockModalSize}
          isOpen={isStockModalOpen}
          onClose={() => setIsStockModalOpen(false)}
          onSuccessToast={(msg) => onNotifyToast && onNotifyToast(msg)}
          onGoToCustomOrder={() => {
            const formElement = document.getElementById('medidas');
            if (formElement) {
              formElement.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        />

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-3xl border-2 border-orange-200 p-8">
            <Package className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-black text-slate-800">No se encontraron artículos con estos filtros</h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Prueba seleccionando otra categoría o cambiando el filtro de disponibilidad.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('todos');
                setStockFilter('all');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-orange-500 text-white font-black text-xs uppercase cursor-pointer"
            >
              Restablecer Filtros
            </button>
          </div>
        )}
      </div>
    </section>
  );
};



