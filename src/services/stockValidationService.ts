import { Product, CartItem } from '../types';

export interface ProductStockValidationResult {
  isValid: boolean;
  availableStock: number;
  requestedQuantity: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  statusLabel: string;
  statusColorClass: string;
  message: string;
  maxAllowedQuantity: number;
}

export interface CartStockItemError {
  cartItemId: string;
  productId: string;
  productName: string;
  selectedSize: string;
  requestedQuantity: number;
  availableStock: number;
  status: 'out_of_stock' | 'exceeded_stock';
  message: string;
}

export interface CartStockValidationResult {
  isValid: boolean;
  hasOutOfStock: boolean;
  hasExceededStock: boolean;
  errors: CartStockItemError[];
  warningSummary: string | null;
  totalValidItems: number;
  totalProblematicItems: number;
}

export interface StockInventorySummary {
  totalProducts: number;
  inStockCount: number;
  lowStockCount: number; // <= 3 units
  outOfStockCount: number;
  totalInventoryUnits: number;
}

export const LOW_STOCK_THRESHOLD = 3;
export const STOCK_CHANGED_EVENT = 'petsimona25_stock_changed';

/**
 * Valida la disponibilidad de stock para un producto individual y una cantidad solicitada
 */
export function validateProductStock(
  product: Product,
  requestedQuantity: number = 1
): ProductStockValidationResult {
  const isTechnicallyInStock = product.inStock !== false;
  const availableStock = product.stock !== undefined ? Math.max(0, product.stock) : (isTechnicallyInStock ? 99 : 0);

  if (!isTechnicallyInStock || availableStock <= 0) {
    return {
      isValid: false,
      availableStock: 0,
      requestedQuantity,
      status: 'out_of_stock',
      statusLabel: 'Agotado',
      statusColorClass: 'bg-red-600 text-white border-red-700',
      message: `El producto "${product.name}" se encuentra actualmente sin stock físico en taller.`,
      maxAllowedQuantity: 0,
    };
  }

  if (requestedQuantity > availableStock) {
    return {
      isValid: false,
      availableStock,
      requestedQuantity,
      status: availableStock <= LOW_STOCK_THRESHOLD ? 'low_stock' : 'in_stock',
      statusLabel: `Solo quedan ${availableStock} un.`,
      statusColorClass: 'bg-amber-500 text-slate-950 border-amber-600',
      message: `No podemos agregar ${requestedQuantity} unidades. Solo hay ${availableStock} unidad(es) disponible(s) en taller.`,
      maxAllowedQuantity: availableStock,
    };
  }

  const isLow = availableStock <= LOW_STOCK_THRESHOLD;

  return {
    isValid: true,
    availableStock,
    requestedQuantity,
    status: isLow ? 'low_stock' : 'in_stock',
    statusLabel: isLow ? `¡Últimas ${availableStock} un.!` : `Stock Disponible (${availableStock} un.)`,
    statusColorClass: isLow ? 'bg-orange-600 text-white border-orange-700' : 'bg-emerald-600 text-white border-emerald-700',
    message: isLow
      ? `Stock crítico en taller: quedan solo ${availableStock} unidad(es).`
      : `Stock confirmado: ${availableStock} unidades disponibles para despacho inmediato.`,
    maxAllowedQuantity: availableStock,
  };
}

/**
 * Valida de forma integral todo el carrito contra la lista en vivo de productos del catálogo
 */
export function validateCartStock(
  cartItems: CartItem[],
  liveProducts: Product[]
): CartStockValidationResult {
  const errors: CartStockItemError[] = [];
  let validCount = 0;

  for (const item of cartItems) {
    const live = liveProducts.find((p) => p.id === item.product.id) || item.product;
    const isTechnicallyInStock = live.inStock !== false;
    const available = live.stock !== undefined ? Math.max(0, live.stock) : (isTechnicallyInStock ? 99 : 0);

    if (!isTechnicallyInStock || available <= 0) {
      errors.push({
        cartItemId: item.id,
        productId: live.id,
        productName: live.name,
        selectedSize: item.selectedSize,
        requestedQuantity: item.quantity,
        availableStock: 0,
        status: 'out_of_stock',
        message: `"${live.name}" (Talla ${item.selectedSize}) está totalmente agotado en el taller.`,
      });
    } else if (item.quantity > available) {
      errors.push({
        cartItemId: item.id,
        productId: live.id,
        productName: live.name,
        selectedSize: item.selectedSize,
        requestedQuantity: item.quantity,
        availableStock: available,
        status: 'exceeded_stock',
        message: `Solicitaste ${item.quantity} de "${live.name}", pero el inventario solo cuenta con ${available} unidad(es).`,
      });
    } else {
      validCount++;
    }
  }

  const hasOutOfStock = errors.some((e) => e.status === 'out_of_stock');
  const hasExceededStock = errors.some((e) => e.status === 'exceeded_stock');
  const isValid = errors.length === 0;

  let warningSummary: string | null = null;
  if (hasOutOfStock) {
    warningSummary = 'Hay artículos agotados en tu carrito. Debes eliminarlos para continuar con el pago.';
  } else if (hasExceededStock) {
    warningSummary = 'Algunos artículos superan la cantidad disponible en el taller de Rengo.';
  }

  return {
    isValid,
    hasOutOfStock,
    hasExceededStock,
    errors,
    warningSummary,
    totalValidItems: validCount,
    totalProblematicItems: errors.length,
  };
}

/**
 * Retorna las clases y etiquetas visuales recomendadas para la tarjeta de producto
 */
export function getStockBadgeDetails(product: Product) {
  const validation = validateProductStock(product, 1);
  return {
    status: validation.status,
    label: validation.statusLabel,
    colorClass: validation.statusColorClass,
    availableStock: validation.availableStock,
    isLowStock: validation.status === 'low_stock',
    isOutOfStock: validation.status === 'out_of_stock',
    isAvailable: validation.status !== 'out_of_stock',
  };
}

/**
 * Calcula el resumen total del inventario para propósitos de auditoría y administración
 */
export function calculateInventorySummary(products: Product[]): StockInventorySummary {
  let inStockCount = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;
  let totalInventoryUnits = 0;

  for (const prod of products) {
    const isAvail = prod.inStock !== false;
    const units = prod.stock !== undefined ? Math.max(0, prod.stock) : (isAvail ? 10 : 0);
    totalInventoryUnits += units;

    if (!isAvail || units === 0) {
      outOfStockCount++;
    } else if (units <= LOW_STOCK_THRESHOLD) {
      lowStockCount++;
      inStockCount++;
    } else {
      inStockCount++;
    }
  }

  return {
    totalProducts: products.length,
    inStockCount,
    lowStockCount,
    outOfStockCount,
    totalInventoryUnits,
  };
}

/**
 * Descuenta el stock de los productos tras una orden exitosa y actualiza el almacenamiento local
 */
export function deductPurchasedStock(
  cartItems: CartItem[],
  currentProducts: Product[]
): Product[] {
  const updatedProducts = currentProducts.map((p) => {
    const purchasedItem = cartItems.find((ci) => ci.product.id === p.id);
    if (!purchasedItem) return p;

    const currentStock = p.stock !== undefined ? p.stock : 10;
    const newStock = Math.max(0, currentStock - purchasedItem.quantity);
    return {
      ...p,
      stock: newStock,
      inStock: newStock > 0,
    };
  });

  try {
    localStorage.setItem('petsimona25_catalog_products', JSON.stringify(updatedProducts));
    window.dispatchEvent(new CustomEvent(STOCK_CHANGED_EVENT, { detail: { products: updatedProducts } }));
  } catch (err) {
    console.warn('Could not persist updated stock to localStorage:', err);
  }

  return updatedProducts;
}
