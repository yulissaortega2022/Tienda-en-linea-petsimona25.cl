import React, { useState, useMemo } from 'react';
import {
  X,
  FileText,
  Download,
  Share2,
  Check,
  Copy,
  Sparkles,
  Package,
  Scissors,
  Tag,
  Phone,
  Layers,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Eye,
  Loader2,
  Filter,
} from 'lucide-react';
import { Product } from '../types';
import { generateProductCatalogPDF, generateWhatsAppCatalogShareUrl } from '../services/pdfCatalogService';

interface PdfCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
}

export const PdfCatalogModal: React.FC<PdfCatalogModalProps> = ({
  isOpen,
  onClose,
  products = [],
}) => {
  // Customization state
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [includeCustomNotice, setIncludeCustomNotice] = useState(true);
  const [promoCoupon, setPromoCoupon] = useState('RENGO10');
  const [promoText, setPromoText] = useState('10% OFF en tu primer pedido con cupón RENGO10');
  const [customPhone, setCustomPhone] = useState('+56 9 7237 4764');
  const [customerPhoneTarget, setCustomerPhoneTarget] = useState('');

  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [downloadedFileName, setDownloadedFileName] = useState('');

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return ['all', ...Array.from(set)];
  }, [products]);

  // Filtered products preview count
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (onlyInStock && (!p.inStock || (p.stock !== undefined && p.stock <= 0))) {
        return false;
      }
      if (selectedCategory !== 'all' && p.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      return true;
    });
  }, [products, onlyInStock, selectedCategory]);

  const inStockCount = useMemo(() => {
    return filteredProducts.filter((p) => p.inStock && (p.stock === undefined || p.stock > 0)).length;
  }, [filteredProducts]);

  const minPrice = useMemo(() => {
    if (!filteredProducts.length) return 0;
    return Math.min(...filteredProducts.map((p) => p.price || 0));
  }, [filteredProducts]);

  const maxPrice = useMemo(() => {
    if (!filteredProducts.length) return 0;
    return Math.max(...filteredProducts.map((p) => p.price || 0));
  }, [filteredProducts]);

  if (!isOpen) return null;

  const handleDownloadPDF = async () => {
    try {
      setIsGenerating(true);
      const result = await generateProductCatalogPDF(products, {
        onlyInStock,
        categoryFilter: selectedCategory,
        includeCustomTailoringNotice: includeCustomNotice,
        promoDiscountText: promoText,
        contactPhone: customPhone,
        websiteUrl: 'www.petsimona25.cl',
        ownerName: 'petsimona25',
      });

      setDownloadedFileName(result.fileName);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4500);
    } catch (err) {
      console.error('Error generating PDF Catalog:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const whatsappShareUrl = generateWhatsAppCatalogShareUrl(
    customerPhoneTarget,
    promoCoupon,
    `¡Hola! 🐾 Te saluda el equipo de *petsimona25* desde nuestro taller en Rengo ✂️🧵.

Te adjunto nuestro *Catálogo Oficial en PDF* (${filteredProducts.length} modelos de confección artesanal para perros chicos y medianos) con precios y disponibilidad actualizada.

✨ *Confección a la Medida*: Cada prenda se adapta al contorno de cuello, pecho y largo de tu consentido.
${promoCoupon ? `🎁 *Cupón Especial*: Usa el código *${promoCoupon}* para descuento especial.` : ''}

🌐 Revisa más detalles en www.petsimona25.cl
📦 Despachos a todo Chile y Retiro en Taller Los Silos (Rengo).`
  );

  const copyWhatsAppText = () => {
    const text = `¡Hola! 🐾 Te saluda el equipo de *petsimona25* desde nuestro taller en Rengo ✂️🧵.

Te comparto nuestro *Catálogo Oficial en PDF* con ${filteredProducts.length} modelos exclusivos de ropa a la medida para perros chicos y medianos (abrigos, polares, impermeables y vestidos) con precios y stock actualizados.

✨ *Confección a la Medida*: Tomamos las medidas de cuello, pecho y lomo para un calce 100% anatómico.
${promoCoupon ? `🎁 *Descuento*: Código *${promoCoupon}*` : ''}

🌐 Tienda Online: https://petsimona25.cl
WhatsApp Oficial: +56 9 7237 4764 • Rengo, Región de O'Higgins`;

    navigator.clipboard.writeText(text);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="space-y-1 pr-10">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider text-yellow-200 border border-white/20">
              <FileText className="w-4 h-4 text-yellow-300" />
              <span>Exportador Oficial WhatsApp &amp; Clientes</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
              Catálogo de Productos en PDF 📄
            </h3>
            <p className="text-xs sm:text-sm text-orange-100 font-medium max-w-xl">
              Genera un documento PDF profesional y ligero con todos los artículos, precios y stock actual de <strong>petsimona25</strong> para enviar directamente a clientes por WhatsApp o imprimir.
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-orange-50 rounded-2xl border border-orange-200 text-center">
              <span className="text-[10px] font-black uppercase text-orange-700 tracking-wider block">
                Total Productos
              </span>
              <span className="text-xl font-black text-slate-900">
                {filteredProducts.length}
              </span>
              <span className="text-[10px] text-slate-500 block font-medium">artículos en PDF</span>
            </div>

            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
              <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider block">
                En Stock Inmediato
              </span>
              <span className="text-xl font-black text-emerald-700">
                {inStockCount}
              </span>
              <span className="text-[10px] text-slate-500 block font-medium">unidades listas</span>
            </div>

            <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-200 text-center">
              <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider block">
                Rango Precios
              </span>
              <span className="text-xs sm:text-sm font-black text-slate-900 block mt-1">
                ${minPrice.toLocaleString('es-CL')} - ${maxPrice.toLocaleString('es-CL')}
              </span>
              <span className="text-[10px] text-slate-500 block font-medium">CLP</span>
            </div>

            <div className="p-3.5 bg-purple-50 rounded-2xl border border-purple-200 text-center">
              <span className="text-[10px] font-black uppercase text-purple-700 tracking-wider block">
                Formato Salida
              </span>
              <span className="text-sm font-black text-purple-900 block mt-1">
                A4 / PDF Ligero
              </span>
              <span className="text-[10px] text-slate-500 block font-medium">Optimizado WhatsApp</span>
            </div>
          </div>

          {/* Success Banner */}
          {downloadSuccess && (
            <div className="p-4 bg-emerald-100 border-2 border-emerald-400 text-emerald-950 rounded-2xl flex items-center justify-between gap-3 animate-fade-in shadow-xs">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <h5 className="text-xs font-black">¡Catálogo PDF Descargado con Éxito!</h5>
                  <p className="text-[11px] font-medium text-emerald-800">
                    Archivo <strong>{downloadedFileName}</strong> listo en tus descargas para adjuntar en WhatsApp.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Customization Options Box */}
          <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
            <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-2">
              <Filter className="w-4 h-4 text-orange-500" />
              <span>Opciones de Personalización del Catálogo</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-slate-800">
              {/* Category Filter */}
              <div>
                <label className="block text-slate-700 mb-1">Categoría a Incluir</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 outline-hidden font-bold"
                >
                  <option value="all">Todas las Categorías ({products.length} productos)</option>
                  {categories.filter((c) => c !== 'all').map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.toUpperCase()} ({products.filter((p) => p.category === cat).length})
                    </option>
                  ))}
                </select>
              </div>

              {/* In-Stock Only Toggle */}
              <div>
                <label className="block text-slate-700 mb-1">Disponibilidad de Inventario</label>
                <select
                  value={onlyInStock ? 'inStock' : 'all'}
                  onChange={(e) => setOnlyInStock(e.target.value === 'inStock')}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 outline-hidden font-bold"
                >
                  <option value="all">Incluir Todo el Catálogo (Disponibles + A Pedido)</option>
                  <option value="inStock">Solo Productos con Stock Disponible</option>
                </select>
              </div>

              {/* Promo Banner Text */}
              <div>
                <label className="block text-slate-700 mb-1">Texto de Promoción / Cupón (Opcional)</label>
                <input
                  type="text"
                  value={promoText}
                  onChange={(e) => setPromoText(e.target.value)}
                  placeholder="Ej: 10% OFF en tu primer pedido con cupón RENGO10"
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 outline-hidden text-xs font-medium"
                />
              </div>

              {/* WhatsApp Contact */}
              <div>
                <label className="block text-slate-700 mb-1">Teléfono WhatsApp de Contacto</label>
                <input
                  type="text"
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value)}
                  placeholder="+56 9 7237 4764"
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 outline-hidden font-mono text-xs"
                />
              </div>
            </div>

            {/* Checkbox: Custom tailoring notice */}
            <label className="flex items-center gap-2.5 pt-2 cursor-pointer text-xs font-bold text-slate-700">
              <input
                type="checkbox"
                checked={includeCustomNotice}
                onChange={(e) => setIncludeCustomNotice(e.target.checked)}
                className="w-4 h-4 text-orange-500 rounded-md border-slate-300 focus:ring-orange-400"
              />
              <span>Incluir recuadro explicativo de patronaje ergonómico canino a la medida en el encabezado</span>
            </label>
          </div>

          {/* WhatsApp Direct Dispatch Card */}
          <div className="bg-emerald-50/80 p-5 rounded-3xl border border-emerald-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">
                    Enviar Catálogo por WhatsApp a Cliente
                  </h4>
                  <span className="text-[10px] text-emerald-800 font-bold">
                    Mensaje pre-redactado con resumen de modelos y llamada a la acción
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={copyWhatsAppText}
                className="px-3 py-1.5 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-black flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copiedMessage ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedMessage ? 'Copiado' : 'Copiar Texto'}</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={customerPhoneTarget}
                onChange={(e) => setCustomerPhoneTarget(e.target.value)}
                placeholder="Teléfono del cliente (Ej: +56912345678 o dejar en blanco)"
                className="flex-1 bg-white border border-emerald-200 rounded-xl p-2.5 text-xs text-slate-900 font-mono outline-hidden"
              />

              <a
                href={whatsappShareUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-5 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Abrir WhatsApp Web / App</span>
              </a>
            </div>
          </div>

          {/* Product Preview List in Modal */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-black text-slate-700 px-1">
              <span>Vista Previa de Artículos a Incluir ({filteredProducts.length})</span>
              <span className="text-[10px] text-slate-500 font-medium">Se ordenarán con diseño limpio en el PDF</span>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {filteredProducts.map((p, idx) => {
                const isAvail = p.inStock && (p.stock === undefined || p.stock > 0);
                const stockAmt = p.stock !== undefined ? p.stock : (p.inStock ? 10 : 0);

                return (
                  <div
                    key={p.id}
                    className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-black text-[10px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <h5 className="font-black text-slate-900 truncate">{p.name}</h5>
                        <span className="text-[10px] uppercase font-bold text-orange-600 block">
                          {p.category} • Tallas: {p.sizes.join(', ')}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-black text-slate-900 block">
                        ${(p.price || 0).toLocaleString('es-CL')} CLP
                      </span>
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md inline-block ${
                          isAvail
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {isAvail ? `Stock: ${stockAmt} un.` : 'Agotado'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 p-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-slate-500 font-medium text-center sm:text-left">
            💡 <strong>Consejo para la dueña</strong>: Descarga el PDF y arrástralo a la conversación de WhatsApp con tu cliente.
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Cerrar
            </button>

            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isGenerating || filteredProducts.length === 0}
              className="flex-1 sm:flex-initial bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs px-6 py-2.5 rounded-xl uppercase tracking-wider shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Generando PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Descargar Catálogo PDF (.pdf)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
