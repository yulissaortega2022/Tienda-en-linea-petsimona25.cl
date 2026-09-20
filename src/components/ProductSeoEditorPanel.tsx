import React, { useState, useEffect } from 'react';
import {
  ProductSeoData,
  getProductSeoData,
  saveProductSeoData,
  resetProductSeoData,
  generateProductMetaHtml,
  generateProductJsonLd,
  getAllStoredSeoOverrides,
  PRODUCT_SEO_CHANGED_EVENT,
} from '../services/productSeoService';
import { Product } from '../types';
import {
  Search,
  Check,
  Copy,
  Sparkles,
  ExternalLink,
  RotateCcw,
  Save,
  Globe,
  Tag,
  AlertCircle,
  CheckCircle2,
  Eye,
  Smartphone,
  Laptop,
  HelpCircle,
  Share2,
  Package,
  Layers,
  Code,
  FileCheck,
} from 'lucide-react';
import { getActiveDomain } from '../services/customDomainService';

interface ProductSeoEditorPanelProps {
  products: Product[];
  currentDomain?: string;
  onSeoUpdated?: (productId: string, seoData: ProductSeoData) => void;
}

export const ProductSeoEditorPanel: React.FC<ProductSeoEditorPanelProps> = ({
  products,
  currentDomain,
  onSeoUpdated,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(
    products[0]?.id || ''
  );
  const [activeDomain, setActiveDomain] = useState<string>(
    currentDomain || getActiveDomain()
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [activeSubTab, setActiveSubTab] = useState<'edit' | 'serp' | 'social' | 'code' | 'overview'>('edit');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [copiedMeta, setCopiedMeta] = useState(false);
  const [copiedJsonLd, setCopiedJsonLd] = useState(false);

  // Selected product
  const selectedProduct =
    products.find((p) => p.id === selectedProductId) || products[0];

  // Current product SEO formData
  const [formData, setFormData] = useState<ProductSeoData>(() =>
    selectedProduct
      ? getProductSeoData(selectedProduct, activeDomain)
      : ({} as ProductSeoData)
  );

  // Sync formData when selected product or domain changes
  useEffect(() => {
    if (selectedProduct) {
      setFormData(getProductSeoData(selectedProduct, activeDomain));
    }
  }, [selectedProductId, activeDomain]);

  // Keep track of which products have custom overrides
  const [overridesCount, setOverridesCount] = useState<number>(() => {
    return Object.keys(getAllStoredSeoOverrides()).length;
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleFieldChange = (field: keyof ProductSeoData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    if (!selectedProduct) return;
    saveProductSeoData(formData);
    setOverridesCount(Object.keys(getAllStoredSeoOverrides()).length);
    showToast(`✅ Meta tags guardadas exitosamente para "${selectedProduct.name}"`);
    if (onSeoUpdated) {
      onSeoUpdated(selectedProduct.id, formData);
    }
  };

  const handleReset = () => {
    if (!selectedProduct) return;
    const defaults = resetProductSeoData(selectedProduct, activeDomain);
    setFormData(defaults);
    setOverridesCount(Object.keys(getAllStoredSeoOverrides()).length);
    showToast(`🔄 Restaurados valores SEO por defecto para "${selectedProduct.name}"`);
    if (onSeoUpdated) {
      onSeoUpdated(selectedProduct.id, defaults);
    }
  };

  const handleOptimizeWithAi = () => {
    if (!selectedProduct) return;
    const cleanDomain = activeDomain.replace(/\/+$/, '');
    const categoryName = selectedProduct.category;

    // Craft high-converting title (approx 55-60 chars)
    const optimizedTitle = `${selectedProduct.name} A la Medida | Ropa Mascotas Rengo Chile`.slice(0, 60);

    // Craft meta description (approx 145-155 chars)
    const optimizedDesc = `Descubre ${selectedProduct.name.toLowerCase()} confeccionado a mano en Rengo con telas recicladas para perros chicos y medianos. Calce anatómico y envíos a todo Chile.`;

    const optimizedKeywords = `${selectedProduct.name.toLowerCase()}, ropa para perros rengo, ${categoryName} perro chico, petsimona25, confeccion canina artesanal, moda canina sustentable, ropa de perros chile`;

    const optimizedCanonical = `${cleanDomain}/#catalogo?articulo=${encodeURIComponent(selectedProduct.id)}`;

    const newSeo: ProductSeoData = {
      ...formData,
      title: optimizedTitle,
      description: optimizedDesc,
      keywords: optimizedKeywords,
      canonicalUrl: optimizedCanonical,
      ogTitle: `${selectedProduct.name} - Confección a la Medida en Rengo 🐾`,
      ogDescription: optimizedDesc,
      robots: 'index, follow, max-image-preview:large, max-snippet:-1',
    };

    setFormData(newSeo);
    showToast(`⚡ Fórmulas SEO aplicadas. Presiona "Guardar Cambios" para confirmar.`);
  };

  const handleCopyMetaHtml = () => {
    const html = generateProductMetaHtml(formData, selectedProduct);
    navigator.clipboard.writeText(html);
    setCopiedMeta(true);
    setTimeout(() => setCopiedMeta(false), 2500);
    showToast('📋 Bloque <head> con Meta Tags y Schema.org copiado');
  };

  const handleCopyJsonLd = () => {
    const json = generateProductJsonLd(formData, selectedProduct);
    navigator.clipboard.writeText(json);
    setCopiedJsonLd(true);
    setTimeout(() => setCopiedJsonLd(false), 2500);
    showToast('📋 Schema.org JSON-LD copiado');
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Character counter helper
  const getTitleStatus = (len: number) => {
    if (len === 0) return { color: 'text-red-400', label: 'Vacío' };
    if (len < 35) return { color: 'text-amber-400', label: 'Muy corto' };
    if (len <= 65) return { color: 'text-emerald-400', label: 'Óptimo (50-60 carácteres)' };
    return { color: 'text-orange-400', label: 'Puede truncarse en Google (>65)' };
  };

  const getDescStatus = (len: number) => {
    if (len === 0) return { color: 'text-red-400', label: 'Vacío' };
    if (len < 80) return { color: 'text-amber-400', label: 'Muy corta' };
    if (len <= 160) return { color: 'text-emerald-400', label: 'Óptima (120-160 carácteres)' };
    return { color: 'text-orange-400', label: 'Puede truncarse en Google (>160)' };
  };

  const titleStatus = getTitleStatus(formData.title?.length || 0);
  const descStatus = getDescStatus(formData.description?.length || 0);

  // Google Search Console Inspection URL
  const gscInspectUrl = `https://search.google.com/search-console/inspect?resource_id=${encodeURIComponent(
    activeDomain
  )}&id=${encodeURIComponent(formData.canonicalUrl || '')}`;

  return (
    <div className="bg-slate-900 text-slate-100 rounded-3xl p-5 sm:p-7 border-2 border-amber-500/60 shadow-2xl space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-950 text-yellow-300 border-2 border-amber-400 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-black animate-fade-in">
          <Sparkles className="w-4 h-4 text-yellow-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center font-black shadow-lg shrink-0">
            <Tag className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Panel de Edición Dinámica de Meta Tags por Producto
              </h3>
              <span className="bg-amber-500/20 text-yellow-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-amber-500/40">
                Google Search Console Ready
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              Personaliza el título SEO, la meta descripción, las etiquetas Open Graph y los microdatos Schema.org de cada prenda para disparar su indexación en Google.cl y Google Imágenes.
            </p>
          </div>
        </div>

        {/* Global Stats & Overrides Indicator */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-xl text-left">
            <span className="text-[10px] text-slate-400 block leading-none">Prendas Personalizadas:</span>
            <span className="text-xs font-black text-amber-300">
              {overridesCount} de {products.length} productos
            </span>
          </div>
          <button
            type="button"
            onClick={handleOptimizeWithAi}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs px-3.5 py-2 rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            title="Optimizar automáticamente con mejores prácticas SEO para Rengo y Chile"
          >
            <Sparkles className="w-4 h-4 text-yellow-200" />
            <span>Auto-Optimizar ⚡</span>
          </button>
        </div>
      </div>

      {/* Top Product Selector Strip */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
        {/* Search & Selector */}
        <div className="md:col-span-5 relative">
          <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
            1. Selecciona la Prenda a Personalizar:
          </label>
          <div className="relative">
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full bg-slate-900 border-2 border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-yellow-300 font-bold outline-hidden appearance-none cursor-pointer"
            >
              {products.map((p) => {
                const isCustom = !!getAllStoredSeoOverrides()[p.id];
                return (
                  <option key={p.id} value={p.id}>
                    {p.name} (${p.price.toLocaleString('es-CL')} CLP) {isCustom ? '★ [Personalizado]' : ''}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Quick Product Thumbnail Preview */}
        {selectedProduct && (
          <div className="md:col-span-4 flex items-center gap-3 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800">
            <img
              src={selectedProduct.imageUrl}
              alt={selectedProduct.name}
              className="w-10 h-10 rounded-lg object-cover border border-amber-500/40 shrink-0"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black text-white truncate">{selectedProduct.name}</p>
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <span className="capitalize">{selectedProduct.category}</span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">${selectedProduct.price.toLocaleString('es-CL')} CLP</span>
              </div>
            </div>
            {formData.isCustomized ? (
              <span className="text-[9px] bg-amber-500/20 text-yellow-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-black">
                Editado
              </span>
            ) : (
              <span className="text-[9px] bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full font-bold">
                Auto
              </span>
            )}
          </div>
        )}

        {/* Quick Action Buttons */}
        <div className="md:col-span-3 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleSave}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Guardar</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs px-3 py-2 rounded-xl transition-all flex items-center gap-1 cursor-pointer border border-slate-700"
            title="Restablecer a valores automáticos"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveSubTab('edit')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'edit'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Formulario de Meta Tags</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('serp')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'serp'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Vista Previa en Google SERP</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('social')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'social'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Vista Previa Redes / WhatsApp</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('code')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'code'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span>Código HTML &amp; Schema.org</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('overview')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'overview'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Resumen de Todos los Productos ({products.length})</span>
        </button>
      </div>

      {/* TAB 1: EDIT FORM */}
      {activeSubTab === 'edit' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Core Search Fields */}
          <div className="lg:col-span-7 space-y-4">
            {/* Meta Title */}
            <div className="space-y-1.5 bg-slate-950/90 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-black text-amber-400 uppercase flex items-center gap-1.5">
                  <span>Meta Title (Título en Google)</span>
                  <span className="text-slate-500 font-normal">&lt;title&gt;</span>
                </label>
                <div className="flex items-center gap-1 text-[11px] font-mono">
                  <span className="text-slate-400">{formData.title?.length || 0}/60</span>
                  <span className={`font-bold ${titleStatus.color}`}>• {titleStatus.label}</span>
                </div>
              </div>
              <input
                type="text"
                value={formData.title || ''}
                maxLength={90}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                placeholder="Ej. Chaleco Polar Térmico A la Medida | Ropa para Perros en Rengo petsimona25"
                className="w-full bg-slate-900 border-2 border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-yellow-300 font-bold outline-hidden"
              />
              <p className="text-[11px] text-slate-400">
                💡 Consejo Google: Incluye el nombre de la prenda, la propuesta de valor ("A la Medida"), la ciudad ("Rengo") y tu marca ("petsimona25").
              </p>
            </div>

            {/* Meta Description */}
            <div className="space-y-1.5 bg-slate-950/90 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-black text-amber-400 uppercase flex items-center gap-1.5">
                  <span>Meta Description (Extracto en Google)</span>
                  <span className="text-slate-500 font-normal">&lt;meta name="description"&gt;</span>
                </label>
                <div className="flex items-center gap-1 text-[11px] font-mono">
                  <span className="text-slate-400">{formData.description?.length || 0}/160</span>
                  <span className={`font-bold ${descStatus.color}`}>• {descStatus.label}</span>
                </div>
              </div>
              <textarea
                rows={3}
                value={formData.description || ''}
                maxLength={200}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                placeholder="Confección artesanal a la medida para perros chicos y medianos con telas reutilizables..."
                className="w-full bg-slate-900 border-2 border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs text-slate-100 font-medium outline-hidden leading-relaxed"
              />
              <p className="text-[11px] text-slate-400">
                💡 Debe responder a la búsqueda del tutor con claridad e invitar a hacer clic (CTR). Manténlo entre 120 y 160 caracteres.
              </p>
            </div>

            {/* Keywords */}
            <div className="space-y-1.5 bg-slate-950/90 p-4 rounded-2xl border border-slate-800">
              <label className="text-xs font-black text-amber-400 uppercase block">
                Meta Keywords (Palabras clave separadas por comas)
              </label>
              <input
                type="text"
                value={formData.keywords || ''}
                onChange={(e) => handleFieldChange('keywords', e.target.value)}
                placeholder="ropa para perros rengo, chaleco polar perro chico, confección a la medida..."
                className="w-full bg-slate-900 border-2 border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs text-slate-200 outline-hidden font-mono"
              />
            </div>

            {/* Canonical URL */}
            <div className="space-y-1.5 bg-slate-950/90 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-amber-400 uppercase">
                  URL Canónica Oficial (Para evitar contenido duplicado)
                </label>
                <button
                  type="button"
                  onClick={() =>
                    handleFieldChange(
                      'canonicalUrl',
                      `${activeDomain.replace(/\/+$/, '')}/#catalogo?articulo=${encodeURIComponent(
                        selectedProduct?.id || ''
                      )}`
                    )
                  }
                  className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
                >
                  Restaurar URL oficial
                </button>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-slate-500 shrink-0" />
                <input
                  type="url"
                  value={formData.canonicalUrl || ''}
                  onChange={(e) => handleFieldChange('canonicalUrl', e.target.value)}
                  className="w-full bg-slate-900 border-2 border-slate-700 focus:border-amber-400 rounded-xl px-3 py-1.5 text-xs text-emerald-300 font-mono outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Social OpenGraph & Google Directives */}
          <div className="lg:col-span-5 space-y-4">
            {/* Open Graph Card Details */}
            <div className="bg-slate-950/90 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-amber-400 border-b border-slate-800 pb-2">
                <Share2 className="w-4 h-4" />
                <span>Open Graph / WhatsApp &amp; Redes Sociales</span>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 block">og:title (Título al compartir)</label>
                <input
                  type="text"
                  value={formData.ogTitle || ''}
                  onChange={(e) => handleFieldChange('ogTitle', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-yellow-300 outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 block">og:description (Descripción)</label>
                <textarea
                  rows={2}
                  value={formData.ogDescription || ''}
                  onChange={(e) => handleFieldChange('ogDescription', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 block">og:image (Foto para WhatsApp/Facebook)</label>
                <input
                  type="url"
                  value={formData.ogImage || ''}
                  onChange={(e) => handleFieldChange('ogImage', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 font-mono outline-hidden"
                />
              </div>
            </div>

            {/* Directives & Rich Snippets Settings */}
            <div className="bg-slate-950/90 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-amber-400 border-b border-slate-800 pb-2">
                <FileCheck className="w-4 h-4" />
                <span>Directivas Googlebot &amp; Rich Snippets</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Directiva Robots:</label>
                  <select
                    value={formData.robots}
                    onChange={(e) => handleFieldChange('robots', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 font-bold outline-hidden cursor-pointer"
                  >
                    <option value="index, follow, max-image-preview:large">Indexar &amp; Seguir (Recomendado)</option>
                    <option value="noindex, follow">No Indexar (Ocultar de Google)</option>
                    <option value="index, nofollow">Indexar sin seguir enlaces</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Tipo de Schema.org:</label>
                  <select
                    value={formData.schemaType}
                    onChange={(e) => handleFieldChange('schemaType', e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 font-bold outline-hidden cursor-pointer"
                  >
                    <option value="Product">schema.org/Product</option>
                    <option value="IndividualProduct">IndividualProduct</option>
                    <option value="ClothingProduct">ClothingProduct</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">SKU / Código Único:</label>
                  <input
                    type="text"
                    value={formData.sku || ''}
                    onChange={(e) => handleFieldChange('sku', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-yellow-300 font-mono outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Disponibilidad en Stock:</label>
                  <div className="flex items-center gap-2 mt-1.5">
                    <input
                      type="checkbox"
                      id="in-stock-seo-check"
                      checked={formData.inStock}
                      onChange={(e) => handleFieldChange('inStock', e.target.checked)}
                      className="w-4 h-4 text-emerald-500 rounded accent-emerald-500 cursor-pointer"
                    />
                    <label htmlFor="in-stock-seo-check" className="text-xs font-bold text-emerald-400 cursor-pointer">
                      {formData.inStock ? 'En existencias (InStock)' : 'Agotado'}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Link to Google Search Console URL Inspection */}
            <div className="bg-gradient-to-r from-blue-950/60 to-indigo-950/60 p-4 rounded-2xl border border-blue-600/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-blue-300 flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5" />
                  Inspección Directa en Google Search Console
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Usa la herramienta oficial de inspección para solicitar que Googlebot rastree e indexe esta prenda de inmediato:
              </p>
              <a
                href={gscInspectUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md"
              >
                <span>Abrir Inspección de URL en Search Console 🚀</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE GOOGLE SERP PREVIEW */}
      {activeSubTab === 'serp' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-black text-yellow-400 uppercase">
                Simulador de Resultados en Google (Google SERP Snippet)
              </h4>
              <span className="text-xs text-slate-400">• Vista exacta de cómo aparecerá en google.cl</span>
            </div>

            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={`px-3 py-1 rounded-lg text-xs font-black flex items-center gap-1.5 cursor-pointer ${
                  previewDevice === 'desktop'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>Escritorio</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={`px-3 py-1 rounded-lg text-xs font-black flex items-center gap-1.5 cursor-pointer ${
                  previewDevice === 'mobile'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Móvil</span>
              </button>
            </div>
          </div>

          {/* Google SERP Card Container */}
          <div className="p-6 bg-[#202124] rounded-2xl border border-slate-700 shadow-inner flex justify-center">
            <div
              className={`w-full bg-[#202124] text-white p-4 font-sans space-y-2 ${
                previewDevice === 'mobile' ? 'max-w-md border-x border-slate-700 px-4' : 'max-w-2xl'
              }`}
            >
              {/* Breadcrumb line */}
              <div className="flex items-center gap-2 text-xs text-[#bdc1c6] font-normal">
                <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs border border-slate-600">
                  🐾
                </span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white leading-none">petsimona25.cl</span>
                  <span className="text-[11px] text-[#bdc1c6] truncate">
                    {activeDomain.replace(/^https?:\/\//, '')} › catalogo › {selectedProduct?.category || 'ropa'}
                  </span>
                </div>
              </div>

              {/* Title link */}
              <h4 className="text-lg sm:text-xl font-medium text-[#8ab4f8] hover:underline cursor-pointer leading-snug">
                {formData.title || 'Título de Prenda para Mascotas petsimona25'}
              </h4>

              {/* Rich Snippet Stars & Price */}
              <div className="flex items-center gap-2 text-xs text-[#bdc1c6] flex-wrap font-medium">
                <span className="text-yellow-400 font-bold">★★★★★ 4.9</span>
                <span>(128)</span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">
                  ${selectedProduct?.price.toLocaleString('es-CL')} CLP
                </span>
                <span>•</span>
                <span className={formData.inStock ? 'text-emerald-400' : 'text-red-400'}>
                  {formData.inStock ? 'En existencias' : 'Agotado'}
                </span>
                <span>•</span>
                <span className="text-slate-400">Rengo, Chile</span>
              </div>

              {/* Description Snippet */}
              <p className="text-xs sm:text-sm text-[#bdc1c6] leading-relaxed font-normal">
                {formData.description ||
                  'Confección artesanal de ropa para perros chicos y medianos en Rengo con telas reutilizables y calce ergonómico...'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SOCIAL OPENGRAPH PREVIEW */}
      {activeSubTab === 'social' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-sm font-black text-yellow-400 uppercase">
              Previsualización al Compartir por WhatsApp, Facebook e Instagram
            </h4>
          </div>

          <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 flex justify-center">
            {/* WhatsApp / Social Card Simulator */}
            <div className="max-w-md w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl space-y-0">
              <div className="relative aspect-video bg-slate-800 overflow-hidden">
                <img
                  src={formData.ogImage || selectedProduct?.imageUrl}
                  alt={formData.ogTitle}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute top-2 left-2 bg-slate-950/80 text-yellow-300 text-[10px] font-black px-2 py-0.5 rounded-md border border-amber-400/40">
                  petsimona25.cl
                </div>
              </div>

              <div className="p-4 space-y-1.5 bg-slate-900">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                  {activeDomain.replace(/^https?:\/\//, '')}
                </span>
                <h5 className="font-bold text-sm text-white leading-tight">
                  {formData.ogTitle || formData.title}
                </h5>
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed font-medium">
                  {formData.ogDescription || formData.description}
                </p>
                <div className="pt-2 flex items-center justify-between text-xs text-emerald-400 font-black border-t border-slate-800">
                  <span>${selectedProduct?.price.toLocaleString('es-CL')} CLP</span>
                  <span className="text-slate-400 text-[11px] font-normal">Taller en Rengo 🐾</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: GENERATED HTML & JSON-LD CODE */}
      {activeSubTab === 'code' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h4 className="text-sm font-black text-yellow-400 uppercase">
                Código HTML y Microdatos Schema.org Generados
              </h4>
              <p className="text-xs text-slate-400">
                Listo para insertar en la cabecera <code className="text-yellow-300">&lt;head&gt;</code> de Google Sites o verificar en el validador de resultados enriquecidos.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyMetaHtml}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer shadow-md"
              >
                {copiedMeta ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>Copiar Todo el &lt;head&gt;</span>
              </button>

              <button
                type="button"
                onClick={handleCopyJsonLd}
                className="bg-slate-800 hover:bg-slate-700 text-yellow-300 font-black text-xs px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer border border-slate-700"
              >
                {copiedJsonLd ? <Check className="w-4 h-4" /> : <Code className="w-4 h-4" />}
                <span>Copiar Solo JSON-LD</span>
              </button>

              <a
                href="https://validator.schema.org/"
                target="_blank"
                rel="noreferrer"
                className="bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold text-xs px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 border border-slate-700"
              >
                <span>Probar en Schema Validator</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="relative bg-slate-950 p-4 rounded-2xl border-2 border-slate-800 font-mono text-xs text-yellow-300 overflow-x-auto max-h-[420px]">
            <pre>{generateProductMetaHtml(formData, selectedProduct)}</pre>
          </div>
        </div>
      )}

      {/* TAB 5: CATALOG OVERVIEW TABLE */}
      {activeSubTab === 'overview' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800 pb-3">
            <div>
              <h4 className="text-sm font-black text-yellow-400 uppercase">
                Estado SEO de los {products.length} Productos del Catálogo
              </h4>
              <p className="text-xs text-slate-400">
                Supervisa de un vistazo qué prendas tienen meta tags personalizadas y su longitud para Google Search Console.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar prenda..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-yellow-300 outline-hidden"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/80">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase font-black text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3">Prenda</th>
                  <th className="p-3">Categoría</th>
                  <th className="p-3">Título SEO</th>
                  <th className="p-3">Longitud</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredProducts.map((p) => {
                  const pSeo = getProductSeoData(p, activeDomain);
                  const isCurrent = p.id === selectedProductId;
                  const isCustom = !!getAllStoredSeoOverrides()[p.id];
                  const len = pSeo.title.length;

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-900/60 transition-colors ${
                        isCurrent ? 'bg-amber-500/10' : ''
                      }`}
                    >
                      <td className="p-3 font-bold text-white flex items-center gap-2">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-8 h-8 rounded-md object-cover border border-slate-700 shrink-0"
                        />
                        <span className="truncate max-w-[180px]">{p.name}</span>
                      </td>
                      <td className="p-3 capitalize text-slate-400">{p.category}</td>
                      <td className="p-3 text-yellow-300 font-mono text-[11px] truncate max-w-[220px]">
                        {pSeo.title}
                      </td>
                      <td className="p-3 font-mono text-[11px]">
                        <span className={len <= 65 ? 'text-emerald-400' : 'text-orange-400'}>
                          {len} carácteres
                        </span>
                      </td>
                      <td className="p-3">
                        {isCustom ? (
                          <span className="bg-amber-500/20 text-yellow-300 text-[10px] font-black px-2 py-0.5 rounded-md border border-amber-500/40">
                            ★ Personalizado
                          </span>
                        ) : (
                          <span className="bg-slate-800 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-700">
                            Automático
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProductId(p.id);
                            setActiveSubTab('edit');
                          }}
                          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                        >
                          Editar Meta Tags
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
