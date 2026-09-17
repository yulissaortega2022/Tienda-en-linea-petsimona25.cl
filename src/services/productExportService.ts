import { Product } from '../types';

/**
 * Escapes a cell value for standard CSV compatibility.
 */
function escapeCsvCell(value: string | number | boolean | undefined | null): string {
  if (value === undefined || value === null) return '""';
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Exports products list to a clean, UTF-8 BOM CSV spreadsheet file specifically
 * formatted for effortless opening in Google Sheets, Excel, or Apple Numbers.
 */
export function exportProductsToGoogleSheetsCSV(
  products: Product[],
  scopeLabel: string = 'catalogo_en_venta'
): { fileName: string; totalProducts: number; totalInventoryValueCLP: number } {
  const headers = [
    'ID_PRODUCTO',
    'NOMBRE_ARTICULO',
    'CATEGORIA',
    'PRECIO_CLP_NUMERICO',
    'PRECIO_FORMATEADO_CLP',
    'STOCK_UNIDADES',
    'ESTADO_DISPONIBILIDAD',
    'TALLAS_DISPONIBLES',
    'CONFECCION_A_LA_MEDIDA',
    'VALORACION_ESTRELLAS',
    'TOTAL_RESEÑAS',
    'ES_NOVEDAD',
    'DESCRIPCION_PRENDA',
    'URL_IMAGEN_REFERENCIA',
    'FECHA_ACTUALIZACION_TALLER'
  ];

  const nowTimestamp = new Date().toLocaleString('es-CL');

  const rows = products.map((p) => {
    const isAvailable = p.inStock && (p.stock === undefined || p.stock > 0);
    const stockUnits = p.stock !== undefined ? p.stock : (p.inStock ? 10 : 0);

    return [
      escapeCsvCell(p.id),
      escapeCsvCell(p.name),
      escapeCsvCell(p.category.toUpperCase()),
      escapeCsvCell(p.price),
      escapeCsvCell(`$${p.price.toLocaleString('es-CL')} CLP`),
      escapeCsvCell(stockUnits),
      escapeCsvCell(isAvailable ? 'EN STOCK DISPONIBLE' : 'AGOTADO (ESPERANDO REPOSICION)'),
      escapeCsvCell(p.sizes.join(' | ')),
      escapeCsvCell(p.isCustomizable ? 'SI (A la Medida en Rengo)' : 'NO'),
      escapeCsvCell(p.rating),
      escapeCsvCell(p.reviewCount),
      escapeCsvCell(p.isNew ? 'SI' : 'NO'),
      escapeCsvCell(p.description),
      escapeCsvCell(p.imageUrl),
      escapeCsvCell(nowTimestamp)
    ];
  });

  // Calculate total inventory value
  const totalInventoryValueCLP = products.reduce((sum, p) => {
    const units = p.stock !== undefined ? p.stock : (p.inStock ? 10 : 0);
    return sum + p.price * units;
  }, 0);

  const totalUnits = products.reduce((sum, p) => {
    return sum + (p.stock !== undefined ? p.stock : (p.inStock ? 10 : 0));
  }, 0);

  // Accounting summary row at the bottom
  const summaryRow = [
    escapeCsvCell('TOTAL GENERAL:'),
    escapeCsvCell(`${products.length} artículos en venta`),
    escapeCsvCell('INVENTARIO_TALLER'),
    escapeCsvCell(totalInventoryValueCLP),
    escapeCsvCell(`$${totalInventoryValueCLP.toLocaleString('es-CL')} CLP`),
    escapeCsvCell(`${totalUnits} unidades totales`),
    escapeCsvCell(''),
    escapeCsvCell(''),
    escapeCsvCell(''),
    escapeCsvCell(''),
    escapeCsvCell(''),
    escapeCsvCell(''),
    escapeCsvCell('Exportación oficial para Google Sheets - Taller petsimona25 (Rengo, Chile)'),
    escapeCsvCell(''),
    escapeCsvCell(nowTimestamp)
  ];

  // UTF-8 BOM (\uFEFF) ensures Google Sheets and Excel recognize accents and special characters
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
  const fileName = `petsimona25_articulos_en_venta_google_sheets_${sanitizedScope}_${dateStr}.csv`;

  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return {
    fileName,
    totalProducts: products.length,
    totalInventoryValueCLP
  };
}

/**
 * Copies the products data to the clipboard formatted as TSV (Tab Separated Values).
 * When pasted directly (Ctrl+V or Cmd+V) into Google Sheets, it cleanly maps to rows and columns.
 */
export async function copyProductsToClipboardForGoogleSheets(products: Product[]): Promise<boolean> {
  try {
    const headers = [
      'ID',
      'Artículo',
      'Categoría',
      'Precio CLP',
      'Stock Unidades',
      'Disponibilidad',
      'Tallas',
      'A la Medida',
      'Valoración',
      'Reseñas',
      'Descripción'
    ];

    const rows = products.map((p) => {
      const isAvailable = p.inStock && (p.stock === undefined || p.stock > 0);
      const stockUnits = p.stock !== undefined ? p.stock : (p.inStock ? 10 : 0);
      return [
        p.id,
        p.name,
        p.category,
        `$${p.price.toLocaleString('es-CL')}`,
        stockUnits,
        isAvailable ? 'Disponible' : 'Agotado',
        p.sizes.join(', '),
        p.isCustomizable ? 'Sí' : 'No',
        p.rating,
        p.reviewCount,
        p.description.replace(/\t|\n|\r/g, ' ')
      ].join('\t');
    });

    const tsvContent = [headers.join('\t'), ...rows].join('\n');

    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(tsvContent);
      return true;
    } else {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = tsvContent;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    }
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}

/**
 * Opens a fresh, blank Google Spreadsheet in a new browser tab (via https://sheets.new).
 */
export function openNewGoogleSheet(): void {
  window.open('https://sheets.new', '_blank', 'noopener,noreferrer');
}
