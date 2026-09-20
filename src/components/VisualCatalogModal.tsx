import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Camera,
  Download,
  Share2,
  Printer,
  Sparkles,
  QrCode,
  Tag,
  Scissors,
  CheckCircle2,
  Copy,
  ExternalLink,
  Filter,
  Eye,
  Layers,
  ShoppingBag,
  Heart,
  ChevronRight,
  ZoomIn,
} from 'lucide-react';
import { Product } from '../types';
import { INITIAL_PRODUCTS } from '../data/mockData';
import { generateQrDataUrl } from '../services/shareQrService';
import { getActiveDomain, buildDomainUrl } from '../services/customDomainService';

interface VisualCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  products?: Product[];
}

export const VisualCatalogModal: React.FC<VisualCatalogModalProps> = ({
  isOpen,
  onClose,
  products = INITIAL_PRODUCTS,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [activeLayout, setActiveLayout] = useState<'lookbook' | 'grid' | 'cards'>('lookbook');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [productQrMap, setProductQrMap] = useState<Record<string, string>>({});
  const [catalogMainQr, setCatalogMainQr] = useState<string>('');
  const [activeDomain, setActiveDomain] = useState<string>(getActiveDomain());

  useEffect(() => {
    if (isOpen) {
      const currentDomain = getActiveDomain();
      setActiveDomain(currentDomain);

      // Generate main catalog QR
      const mainCatalogUrl = `${currentDomain}/#catalogo`;
      generateQrDataUrl(mainCatalogUrl, { width: 260, colorDark: '#0f172a' })
        .then((uri) => setCatalogMainQr(uri))
        .catch((e) => console.error(e));

      // Generate per-product QR codes
      const newMap: Record<string, string> = {};
      const promises = products.map(async (prod) => {
        try {
          const prodUrl = `${currentDomain}/#producto-${prod.id}`;
          const qrUri = await generateQrDataUrl(prodUrl, { width: 180, colorDark: '#1e293b' });
          newMap[prod.id] = qrUri;
        } catch (err) {
          console.warn('QR gen error for product', prod.id, err);
        }
      });

      Promise.all(promises).then(() => {
        setProductQrMap(newMap);
      });
    }
  }, [isOpen, products]);

  // Categories extraction
  const categories = useMemo(() => {
    const list = new Set(products.map((p) => p.category));
    return ['all', ...Array.from(list)];
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== 'all' && p.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      if (onlyInStock && (!p.inStock || (p.stock !== undefined && p.stock <= 0))) {
        return false;
      }
      return true;
    });
  }, [products, selectedCategory, onlyInStock]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyShareLink = () => {
    const shareUrl = `${activeDomain}/#catalogo`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2400);
  };

  const handleShareWhatsApp = () => {
    const msg = `🐾 *Catálogo Visual de Ropa para Mascotas a la Medida - petsimona25* 🐕✂️

Hola Constanza, estuve revisando el catálogo visual online confeccionado con telas reutilizables en Rengo:
🌐 ${activeDomain}/#catalogo

Me encantaría cotizar una prenda a la medida para mi perrito. ¿Me podrías asesorar con las medidas y modelos disponibles?`;
    window.open(`https://wa.me/56972374764?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl shadow-2xl border-2 border-orange-300 max-w-6xl w-full h-[95vh] flex flex-col overflow-hidden animate-scale-up print:fixed print:inset-0 print:m-0 print:h-auto print:w-full print:border-none print:shadow-none print:rounded-none">
        
        {/* Header - Hidden on print */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white p-4 sm:p-5 flex items-center justify-between border-b-2 border-orange-500 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-slate-950 shadow-md">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Catálogo Visual Editorial de Moda Canina
                </h2>
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                  Lookbook {new Date().getFullYear()}
                </span>
                <span className="bg-slate-800 text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded-full border border-slate-700">
                  {activeDomain}
                </span>
              </div>
              <p className="text-xs text-slate-300 hidden sm:block">
                Confección artesanal y eco-sustentable con telas reutilizables • Rengo, Región de O'Higgins
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="hidden sm:flex items-center gap-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-black px-3.5 py-2 rounded-xl transition-all shadow-md cursor-pointer"
              title="Imprimir catálogo visual o guardar en PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / PDF</span>
            </button>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="hidden md:flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-3.5 py-2 rounded-xl transition-all shadow-md cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Controls & Filters Bar - Hidden on print */}
        <div className="bg-slate-100/90 border-b border-slate-200 p-3 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none">
            <span className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3 text-orange-600" />
              Categoría:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-orange-50 border border-slate-200'
                }`}
              >
                {cat === 'all' ? 'Todos los Modelos' : cat}
              </button>
            ))}
          </div>

          {/* Secondary Controls */}
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer bg-white px-2.5 py-1.5 rounded-xl border border-slate-200">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="w-3.5 h-3.5 accent-orange-600 rounded"
              />
              <span>Solo en Stock</span>
            </label>

            <button
              type="button"
              onClick={handleCopyShareLink}
              className="text-xs font-bold text-slate-700 hover:text-orange-700 bg-white hover:bg-orange-50 px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-1 cursor-pointer transition-colors"
            >
              {copiedLink ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Enlace Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copiar Enlace</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Lookbook Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 space-y-6">
          
          {/* Printable Visual Banner (Visible in screen and print) */}
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white rounded-3xl p-5 sm:p-7 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 print:rounded-none print:shadow-none print:border-b-2 print:border-slate-800">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 bg-slate-950/40 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-black uppercase text-amber-200">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>Moda Canina Eco-Sustentable Hecha a Mano</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
                petsimona25 • Catálogo Visual
              </h1>
              <p className="text-xs sm:text-sm text-amber-100 max-w-xl font-medium">
                Confección artesanal ergonómica a la medida para perros pequeños y medianos con telas reutilizadas y forros hipoalergénicos. Taller en Rengo, Chile.
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs font-bold text-amber-950">
                <span className="bg-white/90 px-3 py-1 rounded-full">📍 Rengo, Región de O'Higgins</span>
                <span className="bg-white/90 px-3 py-1 rounded-full">🚚 Despacho a todo Chile</span>
                <span className="bg-white/90 px-3 py-1 rounded-full">📲 WhatsApp: +56972374764</span>
                <span className="bg-white/90 px-3 py-1 rounded-full font-mono">{activeDomain}</span>
              </div>
            </div>

            {/* Main Catalog QR Code Box */}
            {catalogMainQr && (
              <div className="bg-white text-slate-900 p-3.5 rounded-2xl shadow-xl flex flex-col items-center shrink-0 border-2 border-amber-200">
                <img
                  src={catalogMainQr}
                  alt="QR Catálogo Completo"
                  className="w-28 h-28 object-contain"
                />
                <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 mt-1">
                  Escanear Catálogo
                </span>
                <span className="text-[9px] text-slate-500 font-mono">
                  {activeDomain.replace(/^https?:\/\//, '')}
                </span>
              </div>
            )}
          </div>

          {/* Visual Lookbook Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const itemQr = productQrMap[product.id];
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col print:break-inside-avoid print:border-slate-400"
                >
                  {/* Photo Container with Zoom Feature */}
                  <div className="relative aspect-4/3 bg-slate-100 overflow-hidden group">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    
                    {/* Category & Eco-Pill Overlay */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start pointer-events-none">
                      <span className="bg-slate-950/80 backdrop-blur-xs text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs">
                        {product.category}
                      </span>
                      <span className="bg-emerald-600/90 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-yellow-300" />
                        Telas Reutilizables
                      </span>
                    </div>

                    {/* Zoom icon on hover */}
                    <button
                      type="button"
                      onClick={() => setZoomedImage(product.image)}
                      className="absolute bottom-3 right-3 bg-white/90 hover:bg-white text-slate-900 p-2 rounded-xl shadow-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer print:hidden"
                      title="Ampliar fotografía de producto"
                    >
                      <ZoomIn className="w-4 h-4 text-orange-600" />
                    </button>
                  </div>

                  {/* Card Content & Details */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase">
                            SKU: PS25-{product.id}
                          </span>
                          <h3 className="text-base font-black text-slate-900 leading-snug">
                            {product.name}
                          </h3>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-base font-black text-orange-600 block">
                            {formatPrice(product.price)}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500">
                            {product.inStock ? '🟢 En Stock' : '🟡 Por Encargo'}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed font-medium">
                        {product.description}
                      </p>
                    </div>

                    {/* Sizing & QR Footer for each item */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="space-y-1">
                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                          Tallas Disponibles:
                        </span>
                        <div className="flex items-center gap-1">
                          {product.sizes && product.sizes.length > 0 ? (
                            product.sizes.map((sz) => (
                              <span
                                key={sz}
                                className="text-[10px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded"
                              >
                                {sz}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded">
                              A la Medida Exacta
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Item Direct QR Code */}
                      {itemQr && (
                        <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                          <img
                            src={itemQr}
                            alt={`QR ${product.name}`}
                            className="w-12 h-12 object-contain"
                          />
                          <div className="text-[9px] font-bold text-slate-500 leading-tight pr-1">
                            <span className="block text-slate-900 font-extrabold">Escanear</span>
                            <span>para cotizar</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty Search / Filter State */}
          {filteredProducts.length === 0 && (
            <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-slate-300 text-center space-y-3">
              <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto" />
              <h4 className="text-base font-black text-slate-800">
                No hay productos en esta categoría o filtro
              </h4>
              <p className="text-xs text-slate-500">
                Prueba seleccionando "Todos los Modelos" para ver el lookbook completo.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setOnlyInStock(false);
                }}
                className="bg-orange-600 text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer"
              >
                Ver Todo el Catálogo
              </button>
            </div>
          )}

          {/* Footer Tailoring Guide */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                <Scissors className="w-5 h-5" />
              </div>
              <div>
                <p className="font-black text-slate-900">¿Tienes un perro con medidas especiales?</p>
                <p className="text-slate-500 text-[11px]">
                  Confeccionamos cada prenda a la medida de tu regalón considerando Cuello, Pecho y Largo de Lomo.
                </p>
              </div>
            </div>

            <a
              href="https://wa.me/56972374764?text=Hola%20Constanza,%20vi%20el%20cat%C3%A1logo%20visual%20y%20quiero%20cotizar%20ropa%20a%20la%20medida%20para%20mi%20mascota%20%F0%9F%90%BE"
              target="_blank"
              rel="noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors shrink-0 shadow-xs"
            >
              <span>Pedir Asesoría por WhatsApp</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Modal Footer - Hidden on print */}
        <div className="bg-slate-100 p-3 sm:p-4 border-t border-slate-200 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">
              Catálogo visual sincronizado con stock en tiempo real
            </span>
            <span className="sm:hidden">
              {filteredProducts.length} productos
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="sm:hidden bg-orange-600 text-white font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-5 py-2 rounded-xl transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox Modal for Photo Zoom */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-60 bg-slate-950/90 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative max-w-3xl w-full max-h-[90vh] flex items-center justify-center">
            <img
              src={zoomedImage}
              alt="Detalle ampliado"
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl border-2 border-orange-400"
            />
            <button
              type="button"
              onClick={() => setZoomedImage(null)}
              className="absolute top-2 right-2 bg-slate-900 text-white p-2 rounded-full hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
