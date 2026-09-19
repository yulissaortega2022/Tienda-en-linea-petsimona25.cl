import React, { useState } from 'react';
import {
  X,
  Package,
  CheckCircle2,
  AlertTriangle,
  Ban,
  Search,
  Plus,
  RefreshCw,
  TrendingDown,
  ShieldCheck,
  Download,
  Flame,
  Check,
  Layers,
  ArrowRight,
  Info
} from 'lucide-react';
import { Product } from '../types';
import {
  validateProductStock,
  calculateInventorySummary,
  LOW_STOCK_THRESHOLD
} from '../services/stockValidationService';

interface StockValidationAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onUpdateProductStock: (productId: string, newStock: number, inStock: boolean) => void;
  currency: 'CLP' | 'USD' | 'MXN' | 'COP';
}

export const StockValidationAuditModal: React.FC<StockValidationAuditModalProps> = ({
  isOpen,
  onClose,
  products,
  onUpdateProductStock,
  currency,
}) => {
  const [filter, setFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductForSimulation, setSelectedProductForSimulation] = useState<string>(
    products[0]?.id || ''
  );
  const [simulateQuantity, setSimulateQuantity] = useState<number>(1);
  const [stockUpdatedFeedback, setStockUpdatedFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const summary = calculateInventorySummary(products);

  const filteredList = products.filter((p) => {
    const isAvail = p.inStock !== false;
    const units = p.stock !== undefined ? p.stock : (isAvail ? 10 : 0);
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === 'in_stock') return isAvail && units > LOW_STOCK_THRESHOLD;
    if (filter === 'low_stock') return isAvail && units <= LOW_STOCK_THRESHOLD && units > 0;
    if (filter === 'out_of_stock') return !isAvail || units === 0;
    return true;
  });

  const selectedProduct = products.find((p) => p.id === selectedProductForSimulation) || products[0];
  const simulationResult = selectedProduct
    ? validateProductStock(selectedProduct, simulateQuantity)
    : null;

  const handleQuickRestock = (productId: string, addedUnits: number) => {
    const target = products.find((p) => p.id === productId);
    if (!target) return;
    const current = target.stock !== undefined ? target.stock : (target.inStock ? 10 : 0);
    const newStock = Math.max(0, current + addedUnits);
    onUpdateProductStock(productId, newStock, newStock > 0);

    setStockUpdatedFeedback(`¡Stock actualizado a ${newStock} unidades para "${target.name}"!`);
    setTimeout(() => setStockUpdatedFeedback(null), 3000);
  };

  const handleSetStockDirect = (productId: string, stockVal: number) => {
    const target = products.find((p) => p.id === productId);
    if (!target) return;
    const validStock = Math.max(0, stockVal);
    onUpdateProductStock(productId, validStock, validStock > 0);

    setStockUpdatedFeedback(`Stock fijado en ${validStock} unidades.`);
    setTimeout(() => setStockUpdatedFeedback(null), 3000);
  };

  const handleExportStockCSV = () => {
    const headers = ['ID', 'Producto', 'Categoría', 'Precio_CLP', 'Stock_Unidades', 'Estado_Disponibilidad'];
    const rows = products.map((p) => {
      const units = p.stock !== undefined ? p.stock : (p.inStock ? 10 : 0);
      const status = (!p.inStock || units === 0) ? 'AGOTADO' : (units <= LOW_STOCK_THRESHOLD ? 'STOCK_BAJO' : 'DISPONIBLE');
      return [
        `"${p.id}"`,
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.category}"`,
        p.price,
        units,
        status,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reporte_stock_petsimona25_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border-2 border-orange-200 relative animate-scale-up space-y-6 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="border-b-2 border-orange-100 pb-4 space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-800 text-xs font-black uppercase px-2.5 py-0.5 rounded-full border border-emerald-300">
              Validación de Stock del Producto
            </span>
            <span className="text-xs text-slate-500 font-bold">Control de Inventario Taller Rengo</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-orange-600" />
            Auditoría y Validación de Stock en Tiempo Real 📦
          </h3>
          <p className="text-xs text-slate-600 font-medium">
            Verifica la disponibilidad de prendas para pedidos, ajusta cantidades físicas y previene pedidos de artículos agotados.
          </p>
        </div>

        {/* Feedback Alert */}
        {stockUpdatedFeedback && (
          <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{stockUpdatedFeedback}</span>
          </div>
        )}

        {/* Inventory Summary KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-left">
            <span className="text-[10px] text-slate-500 font-black uppercase block">Total Artículos:</span>
            <span className="text-xl font-black text-slate-900">{summary.totalProducts}</span>
            <span className="text-[11px] text-slate-500 block font-medium">Modelos en catálogo</span>
          </div>

          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-left">
            <span className="text-[10px] text-emerald-700 font-black uppercase block">En Stock Seguro:</span>
            <span className="text-xl font-black text-emerald-700">{summary.inStockCount}</span>
            <span className="text-[11px] text-emerald-600 block font-medium">&gt; 3 unidades listas</span>
          </div>

          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-left">
            <span className="text-[10px] text-amber-800 font-black uppercase block">Stock Crítico:</span>
            <span className="text-xl font-black text-amber-800">{summary.lowStockCount}</span>
            <span className="text-[11px] text-amber-700 block font-medium">≤ 3 unidades listas</span>
          </div>

          <div className="p-3.5 bg-red-50 rounded-2xl border border-red-200 text-left">
            <span className="text-[10px] text-red-800 font-black uppercase block">Agotados:</span>
            <span className="text-xl font-black text-red-700">{summary.outOfStockCount}</span>
            <span className="text-[11px] text-red-600 block font-medium">0 unidades (bloqueados)</span>
          </div>
        </div>

        {/* Interactive Stock Checker / Simulator */}
        <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50/60 p-4 sm:p-5 rounded-2xl border-2 border-orange-200 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-orange-950 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-orange-600" />
              Simulador de Validación de Compra (Disponibilidad para Carrito)
            </h4>
            <span className="text-[11px] text-slate-500 font-medium">Prueba si una orden pasa la validación de stock</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-6 space-y-1">
              <label className="text-[11px] font-black text-slate-700 uppercase">Seleccionar Producto:</label>
              <select
                value={selectedProductForSimulation}
                onChange={(e) => setSelectedProductForSimulation(e.target.value)}
                className="w-full text-xs font-bold bg-white border-2 border-orange-200 rounded-xl px-3 py-2 text-slate-900 outline-hidden"
              >
                {products.map((p) => {
                  const units = p.stock !== undefined ? p.stock : (p.inStock ? 10 : 0);
                  return (
                    <option key={p.id} value={p.id}>
                      {p.name} ({units} un. en stock)
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="sm:col-span-3 space-y-1">
              <label className="text-[11px] font-black text-slate-700 uppercase">Cantidad Solicitada:</label>
              <input
                type="number"
                min="1"
                max="50"
                value={simulateQuantity}
                onChange={(e) => setSimulateQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full text-xs font-black bg-white border-2 border-orange-200 rounded-xl px-3 py-2 text-slate-900 outline-hidden"
              />
            </div>

            <div className="sm:col-span-3">
              {simulationResult && (
                <div
                  className={`p-2 rounded-xl text-center text-xs font-black border flex items-center justify-center gap-1.5 ${
                    simulationResult.isValid
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : 'bg-red-100 text-red-900 border-red-300'
                  }`}
                >
                  {simulationResult.isValid ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>¡Venta Válida! ({simulationResult.availableStock} disp.)</span>
                    </>
                  ) : (
                    <>
                      <Ban className="w-4 h-4 text-red-600" />
                      <span>Rechazado ({simulationResult.availableStock} disp.)</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {simulationResult && (
            <p className="text-[11px] text-slate-700 font-medium bg-white/80 p-2.5 rounded-xl border border-orange-200/80">
              <strong>Resultado de la Validación:</strong> {simulationResult.message}
            </p>
          )}
        </div>

        {/* Search, Filter & Export Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por nombre o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-300 focus:border-orange-500 outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                filter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Todos ({products.length})
            </button>
            <button
              onClick={() => setFilter('in_stock')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                filter === 'in_stock' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              En Stock ({summary.inStockCount})
            </button>
            <button
              onClick={() => setFilter('low_stock')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                filter === 'low_stock' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              Bajo Stock ({summary.lowStockCount})
            </button>
            <button
              onClick={() => setFilter('out_of_stock')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                filter === 'out_of_stock' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-800 hover:bg-red-100'
              }`}
            >
              Agotados ({summary.outOfStockCount})
            </button>

            <button
              onClick={handleExportStockCSV}
              className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all flex items-center gap-1 border border-blue-200 cursor-pointer shrink-0"
              title="Descargar reporte de inventario en CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* Product Stock Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs max-h-72 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 uppercase font-black tracking-wider text-[10px] sticky top-0 z-10 border-b border-slate-200">
              <tr>
                <th className="p-3">Producto</th>
                <th className="p-3">Categoría</th>
                <th className="p-3 text-center">Unidades</th>
                <th className="p-3 text-center">Estado Validación</th>
                <th className="p-3 text-right">Ajuste Rápido de Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.map((p) => {
                const isAvail = p.inStock !== false;
                const units = p.stock !== undefined ? p.stock : (isAvail ? 10 : 0);
                const isLow = isAvail && units <= LOW_STOCK_THRESHOLD && units > 0;
                const isOut = !isAvail || units === 0;

                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                        />
                        <div>
                          <span className="font-black text-slate-900 block line-clamp-1">{p.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">ID: {p.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3">
                      <span className="capitalize font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                        {p.category}
                      </span>
                    </td>

                    <td className="p-3 text-center">
                      <input
                        type="number"
                        min="0"
                        value={units}
                        onChange={(e) => handleSetStockDirect(p.id, parseInt(e.target.value) || 0)}
                        className="w-16 text-center font-black text-slate-900 border border-slate-300 rounded-lg py-1 px-1.5 focus:border-orange-500 outline-hidden"
                      />
                    </td>

                    <td className="p-3 text-center">
                      {isOut ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
                          <Ban className="w-3 h-3 text-red-600" /> Agotado
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                          <Flame className="w-3 h-3 text-orange-600" /> Crítico ({units} un.)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Validado ({units} un.)
                        </span>
                      )}
                    </td>

                    <td className="p-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleQuickRestock(p.id, 5)}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold rounded-lg text-[11px] border border-emerald-200 transition-colors cursor-pointer"
                          title="Sumar 5 unidades"
                        >
                          +5 un.
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickRestock(p.id, 10)}
                          className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 font-extrabold rounded-lg text-[11px] border border-blue-200 transition-colors cursor-pointer"
                          title="Sumar 10 unidades"
                        >
                          +10 un.
                        </button>
                        {units > 0 && (
                          <button
                            type="button"
                            onClick={() => handleSetStockDirect(p.id, 0)}
                            className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-800 font-extrabold rounded-lg text-[11px] border border-red-200 transition-colors cursor-pointer"
                            title="Marcar como agotado (0 unidades)"
                          >
                            Agotar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Info className="w-4 h-4 text-orange-500" />
            <span>Los cambios de stock se sincronizan automáticamente con el carrito y la pasarela de pago.</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl transition-all cursor-pointer"
          >
            Cerrar Ventana
          </button>
        </div>
      </div>
    </div>
  );
};
