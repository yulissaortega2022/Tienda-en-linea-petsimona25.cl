import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Sparkles, Check, AlertCircle, Ban, AlertTriangle, ShieldCheck, Zap, Lock, Truck } from 'lucide-react';
import { CartItem, CustomOrderItem, PaymentCredentials, Product } from '../types';
import { getProductImageAlt } from '../services/imageSeoService';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  customOrders: CustomOrderItem[];
  products: Product[];
  onRemoveCartItem: (id: string) => void;
  onRemoveCustomOrder: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onProceedToCheckout: () => void;
  currency: 'CLP' | 'USD' | 'MXN' | 'COP';
}

const FREE_SHIPPING_THRESHOLD_CLP = 45000;

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  customOrders,
  products,
  onRemoveCartItem,
  onRemoveCustomOrder,
  onUpdateQuantity,
  onProceedToCheckout,
  currency,
}) => {
  const [coupon, setCoupon] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);

  if (!isOpen) return null;

  // Real-time out-of-stock validation
  const outOfStockItems = cartItems.filter((item) => {
    const liveProduct = products.find((p) => p.id === item.product.id) || item.product;
    return !liveProduct.inStock || (liveProduct.stock !== undefined && liveProduct.stock <= 0);
  });
  const hasOutOfStockItems = outOfStockItems.length > 0;

  // Calculate totals
  const itemsSubtotal = cartItems.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const customSubtotal = customOrders.reduce((acc, order) => acc + order.price, 0);
  const rawTotal = itemsSubtotal + customSubtotal;

  const discountAmount = discountApplied ? rawTotal * 0.15 : 0;
  const finalTotal = rawTotal - discountAmount;

  // Free shipping calculation
  const freeShippingReached = rawTotal >= FREE_SHIPPING_THRESHOLD_CLP;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD_CLP - rawTotal);
  const freeShippingProgressPercent = Math.min(100, Math.round((rawTotal / FREE_SHIPPING_THRESHOLD_CLP) * 100));

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

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCoupon = coupon.trim().toUpperCase();
    if (cleanCoupon === 'PETSIMONA25' || cleanCoupon === 'SIMONA15' || cleanCoupon === 'PETSIMONA15') {
      setDiscountApplied(true);
    } else {
      alert('Cupón no válido. Usa PETSIMONA25 para un 15% de descuento especial.');
    }
  };

  const totalItemCount = cartItems.reduce((acc, i) => acc + i.quantity, 0) + customOrders.length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-amber-200">
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-between border-b-2 border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white shadow-md">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Tu Carrito de Compra</h3>
                <p className="text-xs text-amber-300/90 font-bold">{totalItemCount} prenda(s) seleccionadas</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Dynamic Progress Tracker (Impulse Trigger) */}
          <div className="bg-amber-50/90 border-b border-amber-200 px-5 py-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-black">
              <span className="flex items-center gap-1.5 text-slate-900">
                <Truck className="w-3.5 h-3.5 text-orange-600" />
                {freeShippingReached ? (
                  <span className="text-emerald-700 font-extrabold">¡Calificas para ENVÍO GRATIS a todo Chile! 🎉</span>
                ) : (
                  <span>
                    Agrega <strong className="text-orange-600 font-black">{formatPrice(remainingForFreeShipping)}</strong> para <strong>Envío Gratis</strong>
                  </span>
                )}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">{freeShippingProgressPercent}%</span>
            </div>
            <div className="w-full bg-amber-200/70 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  freeShippingReached
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                    : 'bg-gradient-to-r from-orange-500 to-amber-500'
                }`}
                style={{ width: `${freeShippingProgressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {totalItemCount === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto shadow-inner">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-black text-slate-900">Tu carrito está vacío</h4>
                <p className="text-xs text-slate-600 font-medium max-w-xs mx-auto">
                  Agrega prendas de nuestro catálogo o ingresa las medidas de tu mascota en nuestro formulario a la medida.
                </p>
                <button
                  onClick={onClose}
                  className="bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-500 text-white font-black px-6 py-3 rounded-xl text-xs uppercase tracking-wider shadow-md cursor-pointer"
                >
                  Ver Catálogo de Prendas
                </button>
              </div>
            ) : (
              <>
                {/* Out of Stock Top Warning Banner if any item is out of stock */}
                {hasOutOfStockItems && (
                  <div className="p-3.5 rounded-2xl bg-red-100 border-2 border-red-300 text-red-900 text-xs font-bold space-y-1 animate-pulse">
                    <div className="flex items-center gap-1.5 font-black text-red-800 uppercase tracking-wide">
                      <Ban className="w-4 h-4 text-red-600" />
                      <span>Artículos Agotados en Carrito</span>
                    </div>
                    <p className="text-[11px] text-red-700 leading-relaxed">
                      Hay <strong>{outOfStockItems.length}</strong> artículo(s) sin stock disponible. Para poder proceder al pago, debes eliminarlos haciendo clic en el botón rojo de cada ítem.
                    </p>
                  </div>
                )}

                {/* Custom Tailored Orders */}
                {customOrders.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b-2 border-orange-200 pb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                      Confección A la Medida ({customOrders.length})
                    </h4>

                    {customOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-4 rounded-2xl bg-orange-50/80 border-2 border-orange-200 space-y-2 relative shadow-xs"
                      >
                        <button
                          onClick={() => onRemoveCustomOrder(ord.id)}
                          className="absolute top-3 right-3 text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="pr-6 space-y-1">
                          <span className="text-[10px] font-black text-white bg-orange-600 px-2.5 py-0.5 rounded-full uppercase">
                            {ord.garmentType}
                          </span>
                          <h5 className="font-black text-slate-900 text-sm">
                            Mascota: {ord.petName} ({ord.breed})
                          </h5>
                          <div className="text-[11px] text-slate-800 bg-white p-2.5 rounded-xl border-2 border-orange-200 space-y-0.5 font-mono font-medium">
                            <p>📐 Cuello: {ord.measurements.neck} {ord.measurements.unit} | Pecho: {ord.measurements.chest} {ord.measurements.unit}</p>
                            <p>📐 Largo: {ord.measurements.bodyLength} {ord.measurements.unit} | Tela: {ord.fabricColor}</p>
                            {ord.embroideryText && <p className="text-orange-600 font-bold">🧵 Bordado: "{ord.embroideryText}"</p>}
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-1 border-t-2 border-orange-200 text-xs font-bold">
                          <span className="text-slate-600">Precio A la Medida:</span>
                          <span className="font-black text-orange-600 text-sm">
                            {formatPrice(ord.price)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Regular Catalog Cart Items */}
                {cartItems.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b-2 border-orange-200 pb-1">
                      Artículos de Catálogo ({cartItems.length})
                    </h4>

                    {cartItems.map((item) => {
                      const liveProduct = products.find((p) => p.id === item.product.id) || item.product;
                      const isOutOfStock = !liveProduct.inStock || (liveProduct.stock !== undefined && liveProduct.stock <= 0);
                      const stockLimit = liveProduct.stock !== undefined ? liveProduct.stock : (liveProduct.inStock ? 99 : 0);
                      const isOverStock = liveProduct.inStock && liveProduct.stock !== undefined && item.quantity > liveProduct.stock;

                      return (
                        <div
                          key={item.id}
                          className={`p-3.5 rounded-2xl border-2 shadow-xs transition-all space-y-2 relative ${
                            isOutOfStock
                              ? 'bg-red-50/90 border-red-300 ring-2 ring-red-200'
                              : isOverStock
                              ? 'bg-amber-50/80 border-amber-300'
                              : 'bg-white border-orange-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={liveProduct.imageUrl || item.product.imageUrl}
                              alt={getProductImageAlt(liveProduct)}
                              title={`${liveProduct.name} | Carrito de compras petsimona25.cl`}
                              referrerPolicy="no-referrer"
                              className={`w-16 h-16 rounded-xl object-cover border ${
                                isOutOfStock ? 'border-red-300 grayscale-50' : 'border-orange-200'
                              }`}
                            />

                            <div className="flex-1 space-y-1 pr-6">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h5 className="font-black text-slate-900 text-xs line-clamp-1">
                                  {liveProduct.name}
                                </h5>
                                {isOutOfStock && (
                                  <span className="bg-red-600 text-white font-black text-[9px] uppercase px-2 py-0.5 rounded-full shrink-0">
                                    Agotado
                                  </span>
                                )}
                              </div>

                              <p className="text-[11px] text-slate-500 font-bold">
                                Talla: <strong>{item.selectedSize}</strong>
                              </p>
                              
                              <p className="text-xs font-black text-orange-600">
                                {formatPrice(item.unitPrice * item.quantity)}
                              </p>

                              {/* Quantity control */}
                              {!isOutOfStock && (
                                <div className="flex items-center gap-2 pt-1">
                                  <button
                                    onClick={() => onUpdateQuantity(item.id, -1)}
                                    className="w-5 h-5 rounded-md bg-slate-100 text-slate-900 font-black text-xs flex items-center justify-center hover:bg-slate-200 cursor-pointer"
                                  >
                                    -
                                  </button>
                                  <span className="text-xs font-black px-1">{item.quantity}</span>
                                  <button
                                    onClick={() => {
                                      if (liveProduct.stock !== undefined && item.quantity >= liveProduct.stock) {
                                        alert(`Solo quedan ${liveProduct.stock} unidades en stock de este artículo.`);
                                        return;
                                      }
                                      onUpdateQuantity(item.id, 1);
                                    }}
                                    className="w-5 h-5 rounded-md bg-slate-100 text-slate-900 font-black text-xs flex items-center justify-center hover:bg-slate-200 cursor-pointer"
                                  >
                                    +
                                  </button>
                                </div>
                              )}
                            </div>

                            <button
                              onClick={() => onRemoveCartItem(item.id)}
                              className="absolute top-3 right-3 text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                              title="Eliminar de carrito"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Specific Out of Stock Warning for this Item */}
                          {isOutOfStock && (
                            <div className="p-2 rounded-xl bg-red-200/60 border border-red-300 flex items-center justify-between text-[11px] text-red-900 font-bold">
                              <span className="flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                                Sin stock disponible en taller
                              </span>
                              <button
                                onClick={() => onRemoveCartItem(item.id)}
                                className="px-2 py-0.5 rounded-md bg-red-600 text-white font-black text-[10px] hover:bg-red-700 uppercase cursor-pointer"
                              >
                                Quitar
                              </button>
                            </div>
                          )}

                          {isOverStock && !isOutOfStock && (
                            <div className="p-1.5 rounded-lg bg-amber-100 border border-amber-300 text-[10px] text-amber-900 font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                              <span>Solo quedan {liveProduct.stock} un. disponibles en taller.</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Coupon Code Input */}
                <form onSubmit={handleApplyCoupon} className="pt-2 bg-amber-50/50 p-3.5 rounded-2xl border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-900 uppercase block">
                      ¿Tienes un cupón de descuento?
                    </label>
                    <span className="text-[10px] bg-amber-200/70 text-amber-900 font-black px-2 py-0.5 rounded-full">
                      PETSIMONA25
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ej. PETSIMONA25"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border-2 border-slate-200 text-xs font-mono font-bold text-slate-900 bg-white"
                    />
                    <button
                      type="submit"
                      className="bg-slate-900 hover:bg-slate-800 text-yellow-300 font-black px-4 py-2 rounded-xl text-xs uppercase cursor-pointer transition-colors shadow-xs"
                    >
                      Aplicar
                    </button>
                  </div>

                  {discountApplied && (
                    <p className="text-[11px] text-emerald-700 font-black flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> ¡15% de descuento aplicado a tu pedido!
                    </p>
                  )}
                </form>
              </>
            )}
          </div>

          {/* Footer Summary & Checkout Button with Real-time Out-of-stock check */}
          {totalItemCount > 0 && (
            <div className="p-6 bg-slate-50 border-t-2 border-slate-200 space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600 font-bold">
                  <span>Subtotal:</span>
                  <span className="font-mono">{formatPrice(rawTotal)}</span>
                </div>

                {discountApplied && (
                  <div className="flex justify-between text-emerald-700 font-black">
                    <span>Descuento (15% OFF):</span>
                    <span className="font-mono">-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600 font-bold">
                  <span>Envío a Domicilio:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    {freeShippingReached ? '¡GRATIS!' : '$3.990 CLP'}
                  </span>
                </div>

                <div className="flex justify-between text-slate-900 text-base font-black border-t-2 border-slate-200 pt-2">
                  <span>Total Final:</span>
                  <span className="font-mono text-slate-950 text-2xl font-black">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Real-time Error Block if Out of Stock Items Exist */}
              {hasOutOfStockItems && (
                <div className="p-3 rounded-xl bg-red-100 border border-red-300 text-red-900 text-xs font-bold flex items-start gap-2">
                  <Ban className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <p className="leading-tight">
                    <strong>Pago bloqueado:</strong> Tienes {outOfStockItems.length} producto(s) marcado(s) como <strong>agotado</strong>. Debes quitarlos de tu carrito para poder continuar.
                  </p>
                </div>
              )}

              {/* High-Impulse Checkout Button */}
              <button
                disabled={hasOutOfStockItems}
                onClick={() => {
                  if (hasOutOfStockItems) return;
                  onClose();
                  onProceedToCheckout();
                }}
                className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  hasOutOfStockItems
                    ? 'bg-slate-200 text-slate-400 border-2 border-slate-300 cursor-not-allowed shadow-none'
                    : 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-xl shadow-emerald-600/30 active:scale-95 border border-emerald-400/30'
                }`}
                title={hasOutOfStockItems ? 'Elimina los productos agotados para proceder al pago' : 'Continuar al pago seguro'}
              >
                {hasOutOfStockItems ? (
                  <>
                    <Ban className="w-5 h-5 text-red-500" />
                    Proceder al Pago (Bloqueado)
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-emerald-200" />
                    Pagar Ahora con Garantía 100% →
                  </>
                )}
              </button>

              {/* Trust Badge Footer */}
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-slate-500 pt-1">
                <div className="flex flex-col items-center gap-0.5 p-1 rounded-lg bg-white border border-slate-200">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-bold text-slate-700">Pago SSL Seguro</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 p-1 rounded-lg bg-white border border-slate-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-bold text-slate-700">Calce Garantizado</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 p-1 rounded-lg bg-white border border-slate-200">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span className="font-bold text-slate-700">Despacho Rápido</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


