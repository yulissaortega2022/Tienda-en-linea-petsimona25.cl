import { jsPDF } from 'jspdf';
import { Product } from '../types';
import { getActiveCustomDomain } from './customDomainService';

export interface CatalogOptions {
  onlyInStock?: boolean;
  categoryFilter?: string; // 'all' | category
  includeCustomTailoringNotice?: boolean;
  promoDiscountText?: string;
  contactPhone?: string;
  websiteUrl?: string;
  ownerName?: string;
}

/**
 * Generates and downloads a clean, professional PDF Catalog of all products
 * formatted for easy printing and sharing via WhatsApp.
 */
export async function generateProductCatalogPDF(
  products: Product[],
  options: CatalogOptions = {}
): Promise<{ fileName: string; totalItems: number; blob: Blob }> {
  const {
    onlyInStock = false,
    categoryFilter = 'all',
    includeCustomTailoringNotice = true,
    promoDiscountText = '',
    contactPhone = '+56 9 7237 4764',
    websiteUrl = options.websiteUrl || getActiveCustomDomain(),
    ownerName = 'petsimona25 Taller Artesanal',
  } = options;

  // Filter products according to criteria
  const filteredProducts = products.filter((p) => {
    if (onlyInStock && (!p.inStock || (p.stock !== undefined && p.stock <= 0))) {
      return false;
    }
    if (categoryFilter !== 'all' && p.category.toLowerCase() !== categoryFilter.toLowerCase()) {
      return false;
    }
    return true;
  });

  // Create jsPDF instance (A4 format: 210mm x 297mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  let y = margin;

  // Helper to add a new page if needed
  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin - 15) {
      addFooter();
      doc.addPage();
      y = margin + 8;
      addPageHeader();
    }
  };

  const addPageHeader = () => {
    doc.setFillColor(249, 115, 22); // Orange primary
    doc.rect(margin, y - 4, contentWidth, 1.5, 'F');
    y += 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('CATÁLOGO OFICIAL • petsimona25 • TALLER RENGO, CHILE', margin, y);
    doc.text(`WhatsApp: ${contactPhone} | ${websiteUrl}`, pageWidth - margin, y, { align: 'right' });
    y += 6;
  };

  const addFooter = () => {
    const pageNum = doc.getNumberOfPages();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - margin - 5, pageWidth - margin, pageHeight - margin - 5);
    doc.text(
      `petsimona25 • Confección Canina y Felina a la Medida • Rengo, Región de O'Higgins • WhatsApp: ${contactPhone}`,
      margin,
      pageHeight - margin
    );
    doc.text(`Página ${pageNum}`, pageWidth - margin, pageHeight - margin, { align: 'right' });
  };

  // --- 1. COVER / MAIN HEADER ---
  // Top decorative background banner
  doc.setFillColor(254, 243, 199); // warm amber
  doc.roundedRect(margin, y, contentWidth, 36, 4, 4, 'F');
  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentWidth, 36, 4, 4, 'S');

  // Brand Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(194, 65, 12); // deep orange
  doc.text('petsimona25', margin + 6, y + 10);

  // Subtitle
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text('Catálogo Oficial de Confección Canina a la Medida', margin + 6, y + 17);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(
    'Taller Artesanal en Rengo, Región de O\'Higgins • Especialistas en Perros Chicos y Medianos',
    margin + 6,
    y + 22
  );

  // Right side badge in header
  doc.setFillColor(249, 115, 22);
  doc.roundedRect(pageWidth - margin - 58, y + 5, 52, 26, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('PEDIDOS & CONSULTAS', pageWidth - margin - 32, y + 12, { align: 'center' });
  doc.setFontSize(9.5);
  doc.text(contactPhone, pageWidth - margin - 32, y + 18, { align: 'center' });
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text(websiteUrl, pageWidth - margin - 32, y + 25, { align: 'center' });

  y += 40;

  // Custom Tailoring info box
  if (includeCustomTailoringNotice) {
    doc.setFillColor(238, 242, 255); // indigo/blue soft
    doc.roundedRect(margin, y, contentWidth, 14, 2, 2, 'F');
    doc.setDrawColor(199, 210, 254);
    doc.roundedRect(margin, y, contentWidth, 14, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(55, 48, 163);
    doc.text('✨ PATRONAJE ERGONÓMICO PERSONALIZADO:', margin + 4, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    doc.text(
      'Cada prenda puede ajustarse a las medidas exactas de tu mascota (Cuello, Pecho y Largo). Especial para Salchichas, Yorkies, Bulldogs y Poodles.',
      margin + 4,
      y + 10
    );
    y += 18;
  }

  // Promotional banner if defined
  if (promoDiscountText) {
    doc.setFillColor(254, 226, 226); // red/rose soft
    doc.roundedRect(margin, y, contentWidth, 10, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(185, 28, 28);
    doc.text(`🎁 PROMOCIÓN ESPECIAL: ${promoDiscountText}`, margin + 4, y + 6.5);
    y += 14;
  }

  // Date and summary line
  const now = new Date();
  const dateStr = now.toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`Colección Disponible (${filteredProducts.length} Artículos)`, margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Actualizado al ${dateStr} • Rengo, Chile`, pageWidth - margin, y, { align: 'right' });
  y += 5;

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 4;

  // --- 2. PRODUCTS LISTING ---
  filteredProducts.forEach((product, index) => {
    const cardHeight = 27;
    checkPageBreak(cardHeight + 2);

    const isAvailable = product.inStock && (product.stock === undefined || product.stock > 0);
    const stockCount = product.stock !== undefined ? product.stock : (product.inStock ? 10 : 0);

    // Card background
    doc.setFillColor(index % 2 === 0 ? 255 : 248, index % 2 === 0 ? 255 : 250, index % 2 === 0 ? 255 : 252);
    doc.roundedRect(margin, y, contentWidth, cardHeight, 2.5, 2.5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.25);
    doc.roundedRect(margin, y, contentWidth, cardHeight, 2.5, 2.5, 'S');

    // Left Accent Bar (Green if available, Amber if low, Red if out)
    if (!isAvailable) {
      doc.setFillColor(239, 68, 68);
    } else if (stockCount <= 2) {
      doc.setFillColor(245, 158, 11);
    } else {
      doc.setFillColor(34, 197, 94);
    }
    doc.roundedRect(margin, y, 2.5, cardHeight, 1, 1, 'F');

    // Product Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    const productName = `${index + 1}. ${product.name}`;
    doc.text(productName, margin + 6, y + 6);

    // Category Tag
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(194, 65, 12);
    const categoryText = `[${product.category.toUpperCase()}]`;
    doc.text(categoryText, margin + 6, y + 10.5);

    // Description (Truncated if too long)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    const descLines = doc.splitTextToSize(product.description || 'Prenda de alta durabilidad y diseño ergonómico.', contentWidth - 75);
    doc.text(descLines.slice(0, 2), margin + 6, y + 15.5);

    // Sizes available
    const sizesText = `Tallas: ${product.sizes && product.sizes.length ? product.sizes.join(', ') : 'XS, S, M, L, A la Medida'}`;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(sizesText, margin + 6, y + 23);

    // Right Column: Price and Stock Status Box
    const rightBoxWidth = 56;
    const rightBoxX = pageWidth - margin - rightBoxWidth - 3;

    // Price
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(194, 65, 12);
    const formattedPrice = `$${(product.price || 0).toLocaleString('es-CL')} CLP`;
    doc.text(formattedPrice, rightBoxX + rightBoxWidth, y + 7, { align: 'right' });

    // Stock Pill
    if (isAvailable) {
      doc.setFillColor(220, 252, 231); // emerald soft
      doc.roundedRect(rightBoxX + 16, y + 10, rightBoxWidth - 16, 6, 1.5, 1.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(21, 128, 61);
      const stockMsg = stockCount > 0 ? `Stock: ${stockCount} un.` : 'A pedido';
      doc.text(`✓ ${stockMsg}`, rightBoxX + rightBoxWidth - 2, y + 14.2, { align: 'right' });
    } else {
      doc.setFillColor(254, 226, 226); // red soft
      doc.roundedRect(rightBoxX + 16, y + 10, rightBoxWidth - 16, 6, 1.5, 1.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(185, 28, 28);
      doc.text('✕ Agotado', rightBoxX + rightBoxWidth - 2, y + 14.2, { align: 'right' });
    }

    // Custom tailoring badge
    if (product.isCustomizable) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(99, 102, 241);
      doc.text('★ Confección a medida', rightBoxX + rightBoxWidth, y + 22, { align: 'right' });
    }

    y += cardHeight + 3.5;
  });

  // --- 3. HOW TO ORDER FOOTER SECTION ---
  checkPageBreak(40);
  y += 3;

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, contentWidth, 32, 3, 3, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 32, 3, 3, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('¿CÓMO REALIZAR TU PEDIDO EN PETSIMONA25?', margin + 5, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text('1. Elige el modelo y escríbenos a nuestro WhatsApp +56 9 7237 4764 indicando el nombre de tu mascota.', margin + 5, y + 12);
  doc.text('2. Envíanos sus 3 medidas clave (Cuello, Pecho y Largo de Lomo) para confeccionar su corte ergonómico.', margin + 5, y + 17);
  doc.text('3. Medios de Pago: Transferencia Bancaria, Débito/Crédito (Mercado Pago / Webpay) y Efectivo en Taller.', margin + 5, y + 22);
  doc.text('4. Despachos: Envíos diarios a todo Chile vía Blue Express, Starken y Chilexpress • Retiro en Taller Los Silos (Rengo).', margin + 5, y + 27);

  // Add footer to last page
  addFooter();

  // Generate Blob and download filename
  const cleanDate = now.toISOString().split('T')[0];
  const fileName = `Catalogo-petsimona25-${cleanDate}.pdf`;
  const pdfBlob = doc.output('blob');

  // Trigger browser download
  doc.save(fileName);

  return {
    fileName,
    totalItems: filteredProducts.length,
    blob: pdfBlob,
  };
}

/**
 * Creates a prefilled WhatsApp link that invites the customer to check the PDF catalog.
 */
export function generateWhatsAppCatalogShareUrl(
  customerPhone = '',
  discountCode = 'RENGO10',
  customMessage = ''
): string {
  const defaultText = customMessage || 
`¡Hola! 🐾 Te saluda el equipo de *petsimona25* desde nuestro taller en Rengo ✂️🧵.

Te compartimos nuestro *Catálogo Oficial en PDF* con todos nuestros modelos de ropa a la medida para perros chicos y medianos (abrigos, polares, impermeables, vestidos y pijamas) con precios y stock actualizados.

✂️ *Confección 100% personalizada*: Todas las prendas se adaptan a las medidas exactas de tu consentido (Cuello, Pecho y Largo).
${discountCode ? `🎁 *Cupón de Bienvenida*: Usa el código *${discountCode}* para 10% de descuento en tu primer pedido.` : ''}

🌐 Visítanos también en www.petsimona25.cl
📦 Envíos a todo Chile vía Blue Express / Starken / Chilexpress y Retiro en Rengo.`;

  const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
  if (cleanPhone) {
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(defaultText)}`;
  }
  return `https://wa.me/56972374764?text=${encodeURIComponent(defaultText)}`;
}
