import React, { useState, useEffect } from 'react';
import { X, Edit3, Image, Tag, DollarSign, Package, Check, AlertCircle, CheckCircle2, Ban, Trash2, Sparkles, Layers, Bell, Mail } from 'lucide-react';
import { Product, StockAlertSubscription } from '../types';
import { AIProductOptimizerAssistant } from './AIProductOptimizerAssistant';
import { getProductStockSubscribers } from '../services/stockAlertService';

interface EditProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProduct: (updatedProduct: Product) => void;
  onDeleteProduct?: (productId: string) => void;
}

const PRESET_IMAGES = [
  { label: 'Impermeable', url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800' },
  { label: 'Abrigo Lana', url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=800' },
  { label: 'Camiseta Algodón', url: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&q=80&w=800' },
  { label: 'Vestido Gala', url: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80&w=800' },
  { label: 'Pijama Térmica', url: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=800' },
  { label: 'Bandana / Pañuelo', url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=800' },
];

const AVAILABLE_SIZES = ['XXS (Mascota Mini)', 'XS (Perro Chico)', 'S', 'M', 'L', 'XL', 'A la Medida'];

export const EditProductModal: React.FC<EditProductModalProps> = ({
  product,
  isOpen,
  onClose,
  onUpdateProduct,
  onDeleteProduct,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Product['category']>('abrigos');
  const [price, setPrice] = useState<number | ''>(24900);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [isCustomizable, setIsCustomizable] = useState(true);
  const [isNew, setIsNew] = useState(false);

  // Availability and Stock State
  const [availabilityStatus, setAvailabilityStatus] = useState<'disponible' | 'agotado'>('disponible');
  const [stockQuantity, setStockQuantity] = useState<number | ''>(10);
  const [subscribers, setSubscribers] = useState<StockAlertSubscription[]>([]);

  // Feedback State
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setCategory(product.category || 'abrigos');
      setPrice(product.price || 0);
      setDescription(product.description || '');
      setImageUrl(product.imageUrl || '');
      setSelectedSizes(product.sizes && product.sizes.length > 0 ? product.sizes : AVAILABLE_SIZES);
      setIsCustomizable(product.isCustomizable ?? true);
      setIsNew(product.isNew ?? false);

      const isAvailable = product.inStock && (product.stock === undefined || product.stock > 0);
      setAvailabilityStatus(isAvailable ? 'disponible' : 'agotado');
      setStockQuantity(product.stock !== undefined ? product.stock : (product.inStock ? 10 : 0));
      setSubscribers(getProductStockSubscribers(product.id));
      setSaveSuccess(false);
      setErrorMessage('');
      setIsSaving(false);
    }
  }, [product, isOpen]);

  const pendingSubscribersCount = subscribers.filter((s) => !s.notified).length;

  if (!isOpen || !product) return null;

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Ingresa el nombre del artículo.');
      return;
    }

    if (!price || Number(price) <= 0) {
      setErrorMessage('Ingresa un precio válido en pesos chilenos ($ CLP).');
      return;
    }

    if (!description.trim()) {
      setErrorMessage('Por favor describe las características de la prenda.');
      return;
    }

    setIsSaving(true);

    const isAvailable = availabilityStatus === 'disponible';
    const finalStock = isAvailable ? (typeof stockQuantity === 'number' && stockQuantity > 0 ? stockQuantity : 10) : 0;
    const finalSizes = selectedSizes.length > 0 ? selectedSizes : AVAILABLE_SIZES;

    const updated: Product = {
      ...product,
      name: name.trim(),
      category,
      price: Number(price),
      description: description.trim(),
      imageUrl: imageUrl.trim() || product.imageUrl || PRESET_IMAGES[0].url,
      sizes: finalSizes,
      inStock: isAvailable,
      stock: finalStock,
      isCustomizable,
      isNew,
    };

    // Save product immediately
    onUpdateProduct(updated);

    setSaveSuccess(true);
    setTimeout(() => {
      setIsSaving(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border-2 border-orange-200 relative animate-scale-up my-8 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pb-4 border-b-2 border-orange-200 mb-5">
          <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-sm">
            <Edit3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              Editar Artículo del Catálogo 🐾
            </h3>
            <p className="text-xs text-slate-500 font-bold">
              ID: {product.id} • Modificar precio, fotos, descripción y disponibilidad
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-100 border border-red-300 text-red-800 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {saveSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-black flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>¡Artículo guardado y actualizado exitosamente!</span>
          </div>
        )}

        {/* AI Title, Description & Competitive Pricing Assistant */}
        <div className="mb-5">
          <AIProductOptimizerAssistant
            currentName={name}
            category={category}
            currentDescription={description}
            currentPrice={typeof price === 'number' ? price : 24900}
            onApplyTitle={(newTitle) => setName(newTitle)}
            onApplyDescription={(newDesc) => setDescription(newDesc)}
            onApplyPrice={(newPrice) => setPrice(newPrice)}
            onApplyAll={({ title, description: newDesc, price: newPrice }) => {
              setName(title);
              setDescription(newDesc);
              setPrice(newPrice);
            }}
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre del artículo */}
          <div>
            <label className="text-xs font-black text-slate-900 uppercase tracking-wider block mb-1">
              Nombre del Artículo *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Chaqueta Reflectiva de Lluvia 'Simona Glow'"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-slate-50 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Categoría */}
            <div>
              <label className="text-xs font-black text-slate-900 uppercase tracking-wider block mb-1">
                Categoría *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Product['category'])}
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-slate-50"
              >
                <option value="abrigos">Abrigos de Lana</option>
                <option value="impermeables">Impermeables / Lluvia</option>
                <option value="camisetas">Camisetas Casuales</option>
                <option value="vestidos">Vestidos de Gala</option>
                <option value="pijamas">Pijamas de Algodón</option>
                <option value="accesorios">Bandanas &amp; Accesorios</option>
              </select>
            </div>

            {/* Precio en CLP */}
            <div>
              <label className="text-xs font-black text-slate-900 uppercase tracking-wider block mb-1">
                Precio ($ CLP) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min={1000}
                  step={500}
                  placeholder="24900"
                  value={price}
                  onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-slate-50 focus:bg-white"
                />
                <span className="absolute right-3 top-2.5 text-xs font-extrabold text-slate-400">
                  CLP
                </span>
              </div>
            </div>
          </div>

          {/* Estado de Disponibilidad y Control de Stock */}
          <div className="p-4 rounded-2xl bg-orange-50/70 border-2 border-orange-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Package className="w-4 h-4 text-orange-600" />
                <span>Disponibilidad en Taller &amp; Stock *</span>
              </label>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-white border border-orange-200 text-slate-700">
                Inventario
              </span>
            </div>

            {/* Selector Disponible vs Agotado */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setAvailabilityStatus('disponible');
                  if (!stockQuantity || stockQuantity === 0) setStockQuantity(10);
                }}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl font-black text-xs uppercase tracking-wider border-2 transition-all cursor-pointer ${
                  availabilityStatus === 'disponible'
                    ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-300/50'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Disponible</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAvailabilityStatus('agotado');
                  setStockQuantity(0);
                }}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl font-black text-xs uppercase tracking-wider border-2 transition-all cursor-pointer ${
                  availabilityStatus === 'agotado'
                    ? 'bg-red-500 text-white border-red-600 shadow-sm ring-2 ring-red-300/50'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-red-300 hover:bg-red-50/50'
                }`}
              >
                <Ban className="w-4 h-4" />
                <span>Agotado</span>
              </button>
            </div>

            {/* Sub-panel when Disponible */}
            {availabilityStatus === 'disponible' ? (
              <div className="pt-2 space-y-2 animate-fade-in">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <label className="text-xs font-bold text-slate-800">
                    Cantidad de Unidades en Stock:
                  </label>
                  <div className="flex items-center gap-1">
                    {[5, 10, 20, 50].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setStockQuantity(preset)}
                        className={`px-2 py-0.5 text-[10px] font-black rounded-lg border transition-colors cursor-pointer ${
                          stockQuantity === preset
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {preset} un.
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    max={999}
                    required={availabilityStatus === 'disponible'}
                    placeholder="Ej. 10"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border-2 border-emerald-300 text-sm font-black text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <span className="absolute right-3 top-2 text-xs font-bold text-emerald-700">
                    unidades listas
                  </span>
                </div>
                
                {pendingSubscribersCount > 0 ? (
                  <div className="p-3 rounded-xl bg-amber-50 border-2 border-amber-300 text-amber-950 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-black text-amber-900">
                      <Mail className="w-4 h-4 text-orange-600" />
                      <span>¡{pendingSubscribersCount} cliente{pendingSubscribersCount > 1 ? 's' : ''} esperando este producto!</span>
                    </div>
                    <p className="text-[11px] text-amber-900 font-medium">
                      Al guardar como <strong>Disponible ({stockQuantity || 1} un.)</strong>, el sistema enviará automáticamente un correo electrónico personalizado a cada cliente para que puedan realizar su compra de inmediato.
                    </p>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-600 font-medium">
                    ✓ Al guardar como <strong>Disponible ({stockQuantity || 1} un.)</strong>, los clientes podrán agregarlo y pagarlo inmediatamente.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-red-100/70 border border-red-200 text-red-900 text-xs font-bold flex items-start gap-2 animate-fade-in">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-black text-red-800">Producto marcado como AGOTADO</p>
                    <p className="text-[11px] text-red-700 font-medium">
                      En el catálogo aparecerá el botón <strong>"Avisarme cuando vuelva el stock"</strong> capturando correos para tu lista de espera.
                    </p>
                  </div>
                </div>

                {pendingSubscribersCount > 0 && (
                  <div className="p-2.5 rounded-xl bg-amber-100/80 border border-amber-300 text-amber-950 text-xs font-bold flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-amber-700" />
                      {pendingSubscribersCount} cliente{pendingSubscribersCount > 1 ? 's' : ''} registrado{pendingSubscribersCount > 1 ? 's' : ''} en lista de espera
                    </span>
                    <span className="text-[10px] font-black uppercase text-amber-800 bg-white px-2 py-0.5 rounded-md border border-amber-200">
                      Pendiente aviso
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tallas disponibles */}
          <div>
            <label className="text-xs font-black text-slate-900 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-orange-600" />
              <span>Tallas Habilitadas:</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_SIZES.map((size) => {
                const isSelected = selectedSizes.includes(size);
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={`px-3 py-1 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-orange-500 text-white border-orange-600 shadow-xs'
                        : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="text-xs font-black text-slate-900 uppercase tracking-wider block mb-1">
              Descripción del Producto *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Escribe el tipo de tela sustentable, ventajas, impermeabilidad o tipo de costura..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-slate-50 focus:bg-white"
            />
          </div>

          {/* Foto URL y Presets */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Image className="w-3.5 h-3.5 text-orange-600" />
                <span>URL de la Fotografía</span>
              </label>
              <span className="text-[10px] text-slate-500 font-bold">
                O selecciona una muestra rápida abajo:
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-slate-50 focus:bg-white"
              />
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Vista previa"
                  className="w-10 h-10 rounded-xl object-cover border border-slate-300 shrink-0"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              )}
            </div>

            {/* Photo preset chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {PRESET_IMAGES.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setImageUrl(preset.url)}
                  className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                    imageUrl === preset.url
                      ? 'bg-blue-600 text-white border-blue-600 font-black'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  📷 {preset.label}
                </button>
              ))}
            </div>

            {/* Auto Generated Alt Tag & Google Image SEO Preview */}
            <div className="p-2.5 bg-blue-50/80 border border-blue-200 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-black text-blue-950 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-blue-600" />
                  Atributo &lt;alt&gt; optimizado automáticamente para Google Imágenes:
                </span>
                <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                  SEO Activo
                </span>
              </div>
              <p className="text-[11px] text-slate-700 font-mono font-medium leading-relaxed break-words bg-white p-2 rounded-lg border border-blue-100">
                alt="{name ? name.trim() : 'Prenda Canina'} - {category === 'abrigos' ? 'abrigo de lana térmica hipoalergénica' : category === 'impermeables' ? 'chaqueta impermeable con forro térmico y reflectivo' : category === 'camisetas' ? 'camiseta casual de algodón respirable' : category === 'vestidos' ? 'vestido artesanal de gala y fiesta' : category === 'pijamas' ? 'pijama térmica de 4 patas' : 'accesorio y bandana artesanal'} para perros chicos, medianos y cachorros, confeccionado a la medida en taller Rengo Chile por petsimona25.cl"
              </p>
            </div>
          </div>

          {/* Opciones adicionales */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <input
                type="checkbox"
                id="editIsCustomizable"
                checked={isCustomizable}
                onChange={(e) => setIsCustomizable(e.target.checked)}
                className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
              />
              <label htmlFor="editIsCustomizable" className="text-xs font-bold text-slate-900 cursor-pointer">
                Permitir "A la Medida"
              </label>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <input
                type="checkbox"
                id="editIsNew"
                checked={isNew}
                onChange={(e) => setIsNew(e.target.checked)}
                className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
              />
              <label htmlFor="editIsNew" className="text-xs font-bold text-slate-900 cursor-pointer">
                Destacar como "Nuevo"
              </label>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="pt-4 border-t-2 border-orange-200 flex items-center justify-between gap-3">
            {onDeleteProduct ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`¿Estás seguro de eliminar el artículo "${product.name}"?`)) {
                    onDeleteProduct(product.id);
                    onClose();
                  }
                }}
                className="p-2.5 rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Eliminar producto"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Eliminar</span>
              </button>
            ) : <div />}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2.5 rounded-xl border-2 border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 uppercase cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Guardar Cambios</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
