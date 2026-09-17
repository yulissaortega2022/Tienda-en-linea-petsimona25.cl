import React, { useState } from 'react';
import { X, PlusCircle, Image, Tag, DollarSign, Package, Check, AlertCircle, Layers, CheckCircle2, Ban, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { AIProductOptimizerAssistant } from './AIProductOptimizerAssistant';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: Omit<Product, 'id' | 'rating' | 'reviewCount'>) => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onAddProduct,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Product['category']>('abrigos');
  const [price, setPrice] = useState<number | ''>(24900);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isCustomizable, setIsCustomizable] = useState(true);
  
  // Availability and Stock State
  const [availabilityStatus, setAvailabilityStatus] = useState<'disponible' | 'agotado'>('disponible');
  const [stockQuantity, setStockQuantity] = useState<number | ''>(10);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price || !description.trim()) {
      alert('Por favor completa todos los campos obligatorios.');
      return;
    }

    const isAvailable = availabilityStatus === 'disponible';
    const finalStock = isAvailable ? (typeof stockQuantity === 'number' ? Math.max(1, stockQuantity) : 1) : 0;

    const defaultImages = {
      abrigos: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=800',
      impermeables: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800',
      camisetas: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&q=80&w=800',
      vestidos: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80&w=800',
      pijamas: 'https://images.unsplash.com/photo-1583511655826-05700d52f4d9?auto=format&fit=crop&q=80&w=800',
      accesorios: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800',
    };

    onAddProduct({
      name: name.trim(),
      category,
      price: Number(price),
      description: description.trim(),
      imageUrl: imageUrl.trim() || defaultImages[category],
      sizes: ['XXS (Mini)', 'XS (Chico)', 'S', 'M', 'L', 'A la Medida'],
      inStock: isAvailable,
      stock: finalStock,
      isCustomizable,
      isNew: true,
    });

    // Reset
    setName('');
    setDescription('');
    setImageUrl('');
    setAvailabilityStatus('disponible');
    setStockQuantity(10);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border-2 border-orange-200 relative animate-scale-up my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pb-4 border-b-2 border-orange-200 mb-6">
          <div className="p-3 bg-orange-500 text-white rounded-2xl shadow-xs">
            <PlusCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900">
              Ingresar Nuevo Artículo a la Tienda 🐕
            </h3>
            <p className="text-xs text-slate-500 font-bold">
              Taller Artesanal petsimona25 (@petsimona25)
            </p>
          </div>
        </div>

        {/* AI Title, Description & Competitive Price Optimizer */}
        <div className="mb-4">
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

          <div className="grid grid-cols-2 gap-4">
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
            </div>
          </div>

          {/* Estado de Disponibilidad y Control de Stock */}
          <div className="p-4 rounded-2xl bg-orange-50/70 border-2 border-orange-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Package className="w-4 h-4 text-orange-600" />
                <span>Estado de Stock y Disponibilidad *</span>
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
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl font-black text-xs uppercase tracking-wider border-2 transition-all ${
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
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl font-black text-xs uppercase tracking-wider border-2 transition-all ${
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
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-bold text-slate-800">
                    Cantidad de Unidades en Stock:
                  </label>
                  <div className="flex items-center gap-1">
                    {[5, 10, 20].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setStockQuantity(preset)}
                        className={`px-2 py-0.5 text-[10px] font-black rounded-lg border transition-colors ${
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
                  <span className="absolute right-3 top-2.5 text-xs font-bold text-emerald-700">
                    unidades listas
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium">
                  ✓ El artículo se mostrará como <strong>Disponible ({stockQuantity || 1} en stock)</strong> y los clientes podrán comprarlo directamente.
                </p>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-red-100/70 border border-red-200 text-red-900 text-xs font-bold flex items-start gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-black text-red-800">Producto configurado como AGOTADO</p>
                  <p className="text-[11px] text-red-700 font-medium">
                    Se publicará con etiqueta <strong>"Agotado"</strong> y el botón de compra al carrito estará deshabilitado hasta que actualices el inventario.
                  </p>
                </div>
              </div>
            )}
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

          {/* Foto URL */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                URL de la Fotografía (Opcional)
              </label>
              <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                ⚡ Auto SEO Google Imágenes
              </span>
            </div>
            <input
              type="url"
              placeholder="https://..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-slate-50 focus:bg-white"
            />
            
            {/* Auto Generated Alt Tag & Google Image SEO Preview */}
            <div className="mt-2 p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-black text-amber-900 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  Etiqueta &lt;alt&gt; autogenerada para Google:
                </span>
                <span className="text-[10px] font-extrabold text-slate-500">Google Imágenes Chile</span>
              </div>
              <p className="text-[11px] text-slate-700 font-mono font-medium leading-relaxed break-words bg-white/80 p-2 rounded-lg border border-amber-100">
                alt="{name ? name.trim() : 'Prenda Canina'} - {category === 'abrigos' ? 'abrigo de lana térmica hipoalergénica' : category === 'impermeables' ? 'chaqueta impermeable con forro térmico y reflectivo' : category === 'camisetas' ? 'camiseta casual de algodón respirable' : category === 'vestidos' ? 'vestido artesanal de gala y fiesta' : category === 'pijamas' ? 'pijama térmica de 4 patas' : 'accesorio y bandana artesanal'} para perros chicos, medianos y cachorros, confeccionado a la medida en taller Rengo Chile por petsimona25.cl"
              </p>
            </div>
          </div>

          {/* Opción A la Medida */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isCustomizable"
              checked={isCustomizable}
              onChange={(e) => setIsCustomizable(e.target.checked)}
              className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
            />
            <label htmlFor="isCustomizable" className="text-xs font-black text-slate-900 cursor-pointer">
              Permitir opción de confección "A la Medida" para este artículo
            </label>
          </div>

          {/* Botones de acción */}
          <div className="pt-4 border-t-2 border-orange-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 uppercase"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all active:scale-95"
            >
              Publicar Artículo en Tienda
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

