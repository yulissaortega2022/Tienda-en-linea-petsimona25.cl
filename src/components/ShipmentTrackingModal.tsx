import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Truck,
  Package,
  CheckCircle2,
  Clock,
  MapPin,
  ExternalLink,
  Copy,
  Check,
  MessageSquare,
  AlertCircle,
  Scissors,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Phone,
  HelpCircle,
  RefreshCw,
  Building2,
  Navigation
} from 'lucide-react';
import { AdminOrder } from '../data/mockData';
import { OrderTrackingInfo, TrackingCheckpoint } from '../types';
import { COURIER_OFFICIAL_LINKS } from '../data/mockData';

interface ShipmentTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: AdminOrder[];
  initialTrackingCodeOrOrderNumber?: string;
}

export const ShipmentTrackingModal: React.FC<ShipmentTrackingModalProps> = ({
  isOpen,
  onClose,
  orders,
  initialTrackingCodeOrOrderNumber,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTracking, setActiveTracking] = useState<OrderTrackingInfo | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Sample quick codes to test
  const SAMPLE_CODES = [
    { label: 'CX-918230192 (Chilexpress - En Reparto)', code: 'CX-918230192' },
    { label: 'BX-748920194 (Blue Express - Listo Envío)', code: 'BX-748920194' },
    { label: 'SK-98312048 (Starken - En Taller)', code: 'SK-98312048' },
    { label: 'PS25-784102 (Retiro en Taller)', code: 'PS25-784102' },
  ];

  const buildTrackingInfoFromOrder = (order: AdminOrder): OrderTrackingInfo => {
    const courier = order.trackingCourier || order.courierName || 'Blue Express';
    const trackingNumber = order.trackingNumber || `BX-${order.orderNumber.replace(/\D/g, '') || '7482910'}`;
    const destination = `${order.shippingAddress || 'Dirección de Entrega'}, ${order.commune}`;
    const origin = 'Taller petsimona25 (Sector Los Silos, Rengo, Región de O\'Higgins)';

    const officialUrl =
      courier.includes('Blue')
        ? COURIER_OFFICIAL_LINKS['Blue Express'](trackingNumber)
        : courier.includes('Chile')
        ? COURIER_OFFICIAL_LINKS['Chilexpress'](trackingNumber)
        : courier.includes('Starken')
        ? COURIER_OFFICIAL_LINKS['Starken'](trackingNumber)
        : courier.includes('Correo')
        ? COURIER_OFFICIAL_LINKS['Correos de Chile'](trackingNumber)
        : undefined;

    // Build realistic checkpoints based on current status
    const status = order.status;
    const isDespachado = status === 'Despachado' || status === 'En Tránsito' || status === 'En Reparto a Destino' || status === 'Entregado';
    const isListo = status === 'Listo Envíos' || isDespachado;
    const isConfeccion = status === 'En Confección' || isListo;

    const checkpoints: TrackingCheckpoint[] = [
      {
        date: order.date || '2026-08-08',
        time: '10:30 hrs',
        location: 'Taller petsimona25 (Rengo, O\'Higgins)',
        title: 'Pedido recibido y asignado a corte',
        description: `Medidas registradas para ${order.petName || 'mascota'} (${order.petBreed || 'Mascota'}). Selección de telas sustentables.`,
        completed: true,
      },
      {
        date: order.date || '2026-08-09',
        time: '16:45 hrs',
        location: 'Taller petsimona25 (Rengo, O\'Higgins)',
        title: 'Confección artesanal y control de calidad finalizada',
        description: 'Prenda cosida a la medida exacta, planchada y empaquetada en sobre biodegradable.',
        completed: isConfeccion,
        current: status === 'En Confección',
      },
      {
        date: order.dispatchedDate || '2026-08-10',
        time: '11:20 hrs',
        location: `Centro Logístico ${courier.split(' ')[0]} (Sucursal Rengo / Rancagua)`,
        title: `Paquete admitido y recepcionado por ${courier}`,
        description: `Código de seguimiento generado: ${trackingNumber}. Pesaje y etiquetado con código QR.`,
        completed: isListo,
        current: status === 'Listo Envíos',
      },
      {
        date: order.dispatchedDate || '2026-08-11',
        time: '04:15 hrs',
        location: `Hub de Distribución Principal (${courier.split(' ')[0]} Centro)`,
        title: 'En tránsito hacia comuna de destino',
        description: `Carga consolidada en viaje hacia centro zonal de ${order.commune}.`,
        completed: isDespachado,
        current: status === 'Despachado' || status === 'En Tránsito',
      },
      {
        date: order.estimatedDelivery || '2026-08-12',
        time: '08:30 hrs',
        location: `Móvil de Reparto ${courier.split(' ')[0]} (Zona ${order.commune})`,
        title: 'En reparto hacia domicilio del cliente',
        description: `El transportista se encuentra en ruta para entrega en: ${order.shippingAddress || order.commune}.`,
        completed: status === 'En Reparto a Destino' || status === 'Entregado',
        current: status === 'En Reparto a Destino',
      },
      {
        date: order.estimatedDelivery || '2026-08-12',
        time: '14:20 hrs',
        location: `${order.commune} (Destino Final)`,
        title: 'Entregado con éxito a la mascota y dueño/a',
        description: `Recepción confirmada en destino. ¡Prenda lista para estrenar con amor!`,
        completed: status === 'Entregado',
        current: status === 'Entregado',
      },
    ];

    return {
      orderNumber: order.orderNumber,
      trackingNumber,
      courierName: courier,
      courierOfficialUrl: officialUrl,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      origin,
      destination,
      commune: order.commune,
      itemsSummary: order.itemsSummary,
      status: (status as any) || 'En Tránsito',
      dispatchedDate: order.dispatchedDate || order.date,
      estimatedDelivery: order.estimatedDelivery || '24 a 48 horas hábiles',
      checkpoints,
    };
  };

  const handleSearch = (queryToSearch?: string) => {
    const rawQuery = (queryToSearch !== undefined ? queryToSearch : searchQuery).trim();
    if (!rawQuery) {
      setErrorMessage('Por favor ingresa un código de seguimiento o número de pedido.');
      return;
    }

    setErrorMessage('');
    const clean = rawQuery.toUpperCase().replace(/\s+/g, '');

    // 1. Search in existing orders list
    const foundOrder = orders.find(
      (o) =>
        o.orderNumber.toUpperCase().replace(/\s+/g, '') === clean ||
        (o.trackingNumber && o.trackingNumber.toUpperCase().replace(/\s+/g, '') === clean) ||
        o.orderNumber.includes(clean) ||
        (o.customerPhone && o.customerPhone.includes(clean))
    );

    if (foundOrder) {
      setActiveTracking(buildTrackingInfoFromOrder(foundOrder));
      return;
    }

    // 2. If it's a simulated Chilean tracking number (e.g. starts with BX, CX, SK, CC, or numbers)
    let detectedCourier = 'Blue Express';
    if (clean.startsWith('CX') || clean.includes('CHILE')) detectedCourier = 'Chilexpress';
    else if (clean.startsWith('SK') || clean.includes('STAR')) detectedCourier = 'Starken';
    else if (clean.startsWith('CC') || clean.includes('CORREO')) detectedCourier = 'Correos de Chile';
    else if (clean.startsWith('RET')) detectedCourier = 'Retiro en Taller (Los Silos)';

    const simulatedOrder: AdminOrder = {
      id: `sim-${Date.now()}`,
      orderNumber: clean.startsWith('PS25') ? clean : `PS25-${clean.slice(-6) || '829401'}`,
      date: '2026-08-10',
      customerName: 'Cliente petsimona25',
      customerEmail: 'cliente@petsimona25.cl',
      customerPhone: '+56972374764',
      shippingAddress: 'Dirección ingresada en checkout',
      commune: 'Comuna de Destino',
      courierName: detectedCourier,
      paymentMethod: 'Mercado Pago',
      grandTotal: 24900,
      itemsSummary: '1x Prenda a la medida confeccionada en Rengo',
      status: 'Despachado',
      trackingNumber: clean,
      trackingCourier: detectedCourier,
      dispatchedDate: '2026-08-11',
      estimatedDelivery: '24 a 48 Horas Hábiles',
    };

    setActiveTracking(buildTrackingInfoFromOrder(simulatedOrder));
  };

  useEffect(() => {
    if (initialTrackingCodeOrOrderNumber) {
      setSearchQuery(initialTrackingCodeOrOrderNumber);
      handleSearch(initialTrackingCodeOrOrderNumber);
    } else if (orders.length > 0 && !activeTracking) {
      // Default to the dispatched or most recent order
      const dispatched = orders.find((o) => o.status === 'Despachado') || orders[0];
      if (dispatched) {
        setSearchQuery(dispatched.trackingNumber || dispatched.orderNumber);
        setActiveTracking(buildTrackingInfoFromOrder(dispatched));
      }
    }
  }, [isOpen, initialTrackingCodeOrOrderNumber, orders]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (activeTracking) {
      navigator.clipboard.writeText(activeTracking.trackingNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const getCourierBadgeColor = (courier: string) => {
    if (courier.includes('Blue')) return 'bg-blue-600 text-white border-blue-400';
    if (courier.includes('Chile')) return 'bg-amber-400 text-slate-900 border-amber-500';
    if (courier.includes('Starken')) return 'bg-emerald-600 text-white border-emerald-400';
    if (courier.includes('Correo')) return 'bg-red-600 text-white border-red-400';
    return 'bg-orange-600 text-white border-orange-400';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Entregado':
        return { label: 'Entregado a Destino', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: CheckCircle2 };
      case 'En Reparto a Destino':
        return { label: 'En Reparto a Domicilio', color: 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse', icon: Truck };
      case 'Despachado':
      case 'En Tránsito':
        return { label: 'En Tránsito / Centro Logístico', color: 'bg-blue-100 text-blue-900 border-blue-300', icon: Navigation };
      case 'Listo Envíos':
        return { label: 'Listo para Despacho', color: 'bg-yellow-100 text-yellow-900 border-yellow-300', icon: Package };
      case 'En Confección':
      default:
        return { label: 'En Confección (Taller Rengo)', color: 'bg-orange-100 text-orange-900 border-orange-300', icon: Scissors };
    }
  };

  const currentStatusBadge = activeTracking ? getStatusBadge(activeTracking.status) : null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border-2 border-orange-300 relative my-6 max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 border-b-4 border-orange-500 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-md">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white tracking-tight">
                  Rastreo de Envíos &amp; Logística 📦
                </h3>
                <span className="bg-orange-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                  En Vivo
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Seguimiento en tiempo real desde el taller en Rengo hasta tu destino
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50">
          
          {/* Search Input Box */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <label className="text-xs font-black text-slate-900 uppercase tracking-wider block">
              Consulta tu Envío por Código de Seguimiento o N° de Pedido
            </label>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
              className="flex flex-col sm:flex-row gap-2"
            >
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Ej. BX-748920194, CX-918230192 o PS25-784102..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-200 focus:border-orange-500 rounded-xl text-xs font-bold text-slate-900 outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white font-black px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Search className="w-4 h-4" />
                <span>Rastrear Envío</span>
              </button>
            </form>

            {/* Quick Sample Search Chips */}
            <div className="pt-1 flex items-center gap-2 flex-wrap text-xs">
              <span className="text-[11px] font-bold text-slate-500">Ejemplos para probar:</span>
              {SAMPLE_CODES.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => {
                    setSearchQuery(item.code);
                    handleSearch(item.code);
                  }}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                    searchQuery === item.code
                      ? 'bg-slate-900 text-white border-slate-900 font-black'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-orange-100 hover:border-orange-300'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* Active Tracking Result Card */}
          {activeTracking ? (
            <div className="space-y-6">
              
              {/* Header Box: Order info, Courier, Code & Copy button */}
              <div className="bg-white p-5 rounded-3xl border-2 border-orange-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${getCourierBadgeColor(activeTracking.courierName)}`}>
                        🚚 {activeTracking.courierName}
                      </span>
                      {currentStatusBadge && (
                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border flex items-center gap-1.5 ${currentStatusBadge.color}`}>
                          <currentStatusBadge.icon className="w-3.5 h-3.5" />
                          <span>{currentStatusBadge.label}</span>
                        </span>
                      )}
                    </div>
                    <h4 className="text-lg font-black text-slate-900">
                      Pedido {activeTracking.orderNumber} • {activeTracking.customerName}
                    </h4>
                  </div>

                  {/* Official Courier External Link */}
                  {activeTracking.courierOfficialUrl && (
                    <a
                      href={activeTracking.courierOfficialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-yellow-300 text-xs font-black uppercase tracking-wider transition-all border border-slate-700 shadow-xs"
                      title="Ver seguimiento en la plataforma del courier"
                    >
                      <span>Web Oficial {activeTracking.courierName.split(' ')[0]}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                {/* Grid with Tracking Code, Origin, Destination & Estimated Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  {/* Tracking Code with copy button */}
                  <div className="p-3 bg-orange-50/70 border border-orange-200 rounded-2xl space-y-1">
                    <span className="text-[10px] uppercase font-black text-orange-800 tracking-wider block">
                      Código de Seguimiento:
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-slate-900 text-sm">
                        {activeTracking.trackingNumber}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="p-1 text-slate-500 hover:text-orange-600 bg-white rounded-md border border-slate-200 cursor-pointer"
                        title="Copiar código"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Origin */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                    <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider block">
                      Origen del Paquete:
                    </span>
                    <span className="font-bold text-slate-800 block truncate">
                      📍 Taller Rengo (Los Silos)
                    </span>
                    <span className="text-[10px] text-slate-500 block">Región de O'Higgins</span>
                  </div>

                  {/* Destination */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                    <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider block">
                      Destino de Entrega:
                    </span>
                    <span className="font-bold text-slate-800 block truncate">
                      🏡 {activeTracking.commune}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate">{activeTracking.destination}</span>
                  </div>

                  {/* Estimated Delivery */}
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1">
                    <span className="text-[10px] uppercase font-black text-emerald-800 tracking-wider block">
                      Llegada Estimada:
                    </span>
                    <span className="font-black text-emerald-700 block text-xs">
                      📅 {activeTracking.estimatedDelivery}
                    </span>
                    <span className="text-[10px] text-emerald-600 block">Horario hábil 09:00 a 19:00</span>
                  </div>
                </div>
              </div>

              {/* Visual Logistics Progress Timeline */}
              <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h5 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span>Historial y Estado del Despacho</span>
                  </h5>
                  <span className="text-[11px] font-bold text-slate-500">
                    Actualizado hace unos minutos
                  </span>
                </div>

                <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                  {activeTracking.checkpoints.map((cp, idx) => (
                    <div key={idx} className="relative flex items-start gap-4">
                      {/* Checkpoint Icon Dot */}
                      <div
                        className={`absolute -left-6 sm:-left-8 w-6 h-6 rounded-full flex items-center justify-center border-2 z-10 ${
                          cp.completed
                            ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                            : cp.current
                            ? 'bg-orange-500 text-white border-orange-600 ring-4 ring-orange-100 animate-pulse'
                            : 'bg-white text-slate-300 border-slate-300'
                        }`}
                      >
                        {cp.completed ? (
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-current" />
                        )}
                      </div>

                      {/* Content Details */}
                      <div
                        className={`p-4 rounded-2xl border flex-1 transition-all ${
                          cp.current
                            ? 'bg-orange-50/70 border-orange-300 shadow-xs'
                            : cp.completed
                            ? 'bg-slate-50/80 border-slate-200'
                            : 'bg-white/50 border-slate-100 opacity-60'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                          <span className="text-xs font-black text-slate-900">
                            {cp.title}
                          </span>
                          <span className="text-[11px] font-mono font-bold text-slate-500">
                            {cp.date} • {cp.time}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 font-medium leading-relaxed">
                          {cp.description}
                        </p>

                        <div className="pt-2 flex items-center gap-1 text-[11px] font-bold text-slate-500">
                          <MapPin className="w-3 h-3 text-orange-500 shrink-0" />
                          <span>{cp.location}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Direct WhatsApp Assistance Box */}
              <div className="bg-emerald-50 border-2 border-emerald-200 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-emerald-950">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black uppercase tracking-wider">
                      ¿Dudas sobre la llegada de tu paquete a {activeTracking.commune}?
                    </h5>
                    <p className="text-xs font-medium text-emerald-800">
                      Escríbenos directamente al WhatsApp de Constanza (+56972374764) con tu código <strong>{activeTracking.trackingNumber}</strong>.
                    </p>
                  </div>
                </div>

                <a
                  href={`https://wa.me/56972374764?text=${encodeURIComponent(
                    `Hola Constanza (petsimona25), consulto por el estado de mi envío con código ${activeTracking.trackingNumber} de mi pedido ${activeTracking.orderNumber} para ${activeTracking.commune}.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5 shrink-0"
                >
                  <MessageSquare className="w-4 h-4 fill-white" />
                  <span>Consultar por WhatsApp</span>
                </a>
              </div>

            </div>
          ) : (
            <div className="text-center py-10 space-y-3 bg-white rounded-3xl border border-slate-200 p-6">
              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto border-2 border-orange-200">
                <Search className="w-8 h-8" />
              </div>
              <h4 className="text-base font-black text-slate-900">
                Ingresa un código de seguimiento para consultar
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                Puedes ingresar el código de seguimiento de Blue Express, Chilexpress, Starken o Correos de Chile, o tu número de pedido de petsimona25.
              </p>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
            <ShieldCheck className="w-4 h-4 text-orange-500" />
            <span>Envíos asegurados y coordinados desde Rengo, Región de O'Higgins</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
