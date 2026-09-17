import { AdminOrder } from '../data/mockData';

export interface OrderAccountingSummary {
  totalOrders: number;
  totalAmountCLP: number;
  averageTicketCLP: number;
  byStatus: Record<string, { count: number; totalCLP: number }>;
  byPaymentMethod: Record<string, { count: number; totalCLP: number }>;
}

/**
 * Calculates financial and accounting summary metrics for a list of orders.
 */
export function getOrderAccountingSummary(orders: AdminOrder[]): OrderAccountingSummary {
  const totalOrders = orders.length;
  const totalAmountCLP = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
  const averageTicketCLP = totalOrders > 0 ? Math.round(totalAmountCLP / totalOrders) : 0;

  const byStatus: Record<string, { count: number; totalCLP: number }> = {};
  const byPaymentMethod: Record<string, { count: number; totalCLP: number }> = {};

  orders.forEach((ord) => {
    // By status
    const statusKey = ord.status || 'Sin Estado';
    if (!byStatus[statusKey]) {
      byStatus[statusKey] = { count: 0, totalCLP: 0 };
    }
    byStatus[statusKey].count += 1;
    byStatus[statusKey].totalCLP += ord.grandTotal || 0;

    // By payment method
    const payKey = ord.paymentMethod || 'No especificado';
    if (!byPaymentMethod[payKey]) {
      byPaymentMethod[payKey] = { count: 0, totalCLP: 0 };
    }
    byPaymentMethod[payKey].count += 1;
    byPaymentMethod[payKey].totalCLP += ord.grandTotal || 0;
  });

  return {
    totalOrders,
    totalAmountCLP,
    averageTicketCLP,
    byStatus,
    byPaymentMethod,
  };
}

/**
 * Escapes a cell value for standard CSV compatibility.
 */
function escapeCsvCell(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return '""';
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Exports orders to a clean, UTF-8 BOM CSV spreadsheet file tailored for workshop accounting.
 */
export function exportOrdersToCSV(
  orders: AdminOrder[],
  scopeLabel: string = 'todos'
): { fileName: string; totalOrders: number; totalAmountCLP: number } {
  const headers = [
    'N_PEDIDO',
    'FECHA_PEDIDO',
    'ESTADO_ACTUAL',
    'CLIENTE_NOMBRE',
    'CLIENTE_EMAIL',
    'CLIENTE_TELEFONO',
    'COMUNA_DESTINO',
    'DIRECCION_DESPACHO',
    'EMPRESA_COURIER',
    'METODO_PAGO',
    'TOTAL_CLP_NUMERICO',
    'TOTAL_FORMATEADO_CLP',
    'RESUMEN_PRENDAS_Y_TALLAS',
    'NOMBRE_MASCOTA',
    'RAZA_MASCOTA',
    'MEDIDA_CUELLO_CM',
    'MEDIDA_PECHO_CM',
    'MEDIDA_LARGO_CM',
    'CODIGO_SEGUIMIENTO',
    'COURIER_SEGUIMIENTO',
    'FECHA_DESPACHO',
    'ESTIMADO_ENTREGA',
    'NOTAS_ESPECIALES_TALLER',
    'FECHA_GENERACION_REPORTE'
  ];

  const nowTimestamp = new Date().toLocaleString('es-CL');

  const rows = orders.map((o) => {
    return [
      escapeCsvCell(o.orderNumber),
      escapeCsvCell(o.date),
      escapeCsvCell(o.status),
      escapeCsvCell(o.customerName),
      escapeCsvCell(o.customerEmail),
      escapeCsvCell(o.customerPhone),
      escapeCsvCell(o.commune),
      escapeCsvCell(o.shippingAddress),
      escapeCsvCell(o.courierName || o.trackingCourier || 'Blue Express'),
      escapeCsvCell(o.paymentMethod || 'Mercado Pago'),
      escapeCsvCell(o.grandTotal || 0),
      escapeCsvCell(`$${(o.grandTotal || 0).toLocaleString('es-CL')} CLP`),
      escapeCsvCell(o.itemsSummary),
      escapeCsvCell(o.petName || 'No especificada'),
      escapeCsvCell(o.petBreed || 'Mestizo / General'),
      escapeCsvCell(o.neckSizeCm ?? ''),
      escapeCsvCell(o.chestSizeCm ?? ''),
      escapeCsvCell(o.backSizeCm ?? ''),
      escapeCsvCell(o.trackingNumber || ''),
      escapeCsvCell(o.trackingCourier || o.courierName || ''),
      escapeCsvCell(o.dispatchedDate || ''),
      escapeCsvCell(o.estimatedDelivery || ''),
      escapeCsvCell(o.specialNotes || ''),
      escapeCsvCell(nowTimestamp)
    ];
  });

  // Calculate totals
  const totalAmountCLP = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);

  // Add an accounting summary row at the bottom
  const summaryRow = [
    escapeCsvCell('TOTAL GENERAL:'),
    escapeCsvCell(`${orders.length} pedidos`),
    escapeCsvCell(''),
    escapeCsvCell(''),
    escapeCsvCell(''),
    escapeCsvCell(''),
    escapeCsvCell(''),
    escapeCsvCell(''),
    escapeCsvCell(''),
    escapeCsvCell('TOTAL_VENTAS'),
    escapeCsvCell(totalAmountCLP),
    escapeCsvCell(`$${totalAmountCLP.toLocaleString('es-CL')} CLP`),
    escapeCsvCell('Reporte oficial Taller petsimona25 (Rengo, Chile)'),
    escapeCsvCell(''),
    escapeCsvCell(''),
    escapeCsvCell(''),
    escapeCsvCell(''),
    escapeCsvCell(''),
    escapeCsvCell(''),
    escapeCsvCell(''),
    escapeCsvCell(''),
    escapeCsvCell(''),
    escapeCsvCell(''),
    escapeCsvCell(nowTimestamp)
  ];

  // UTF-8 BOM (\uFEFF) ensures Excel opens special characters (ñ, tildes) cleanly
  const csvContent =
    '\uFEFF' +
    [
      headers.join(';'),
      ...rows.map((r) => r.join(';')),
      summaryRow.join(';')
    ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const dateStr = new Date().toISOString().slice(0, 10);
  const sanitizedScope = scopeLabel.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const fileName = `petsimona25_contabilidad_pedidos_${sanitizedScope}_${dateStr}.csv`;

  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return {
    fileName,
    totalOrders: orders.length,
    totalAmountCLP
  };
}
