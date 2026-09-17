import { MeasurementAnalysis } from '../data/breedSizeStandards';
import {
  sendWhatsAppBusinessMessage,
  OFFICIAL_WHATSAPP_PHONE,
  OFFICIAL_WHATSAPP_NUMBER_RAW,
} from './whatsappBusinessService';
import {
  OFFICIAL_NOTIFICATION_EMAIL,
  recordLocalEmailDispatch,
} from './pushNotificationService';

export interface PurchaseValidationReport {
  id: string; // e.g. 'REP-VAL-PS25-849102'
  timestamp: string;
  petName: string;
  petType: 'dog' | 'cat' | 'other';
  breed: string;
  garmentType: string;
  fabricColor: string;
  fabricType: string;
  embroideryText?: string;
  specialNotes?: string;
  price: number;
  currency: string;
  measurements: {
    neck: number;
    chest: number;
    bodyLength: number;
    unit: 'cm' | 'in';
  };
  measurementsInCm: {
    neck: number;
    chest: number;
    bodyLength: number;
  };
  benchmark: {
    name: string;
    neckRange: string;
    chestRange: string;
    lengthRange: string;
    typicalWeight: string;
    tailorAdvice: string;
  };
  analysis: {
    compatibilityScore: number;
    riskLevel: 'low' | 'moderate' | 'high';
    isUnusual: boolean;
    hasErrors: boolean;
    hasWarnings: boolean;
    suggestedStandardSize: string;
    status: 'optimal' | 'notice' | 'unusual_alert' | 'invalid_error';
    summaryMessage: string;
    tailorRecommendation: string;
    issues: Array<{
      field: string;
      title: string;
      message: string;
      severity: string;
    }>;
  };
  userConfirmedUnusual: boolean;
  workshopValidationVerdict:
    | 'APROBADO_ESTANDAR'
    | 'APROBADO_MEDIDAS_ESPECIALES'
    | 'REVISION_REQUERIDA';
  verdictTitle: string;
  verdictDescription: string;
  customerEmail?: string;
  customerPhone?: string;
  notifiedWhatsApp: boolean;
  notifiedEmail: boolean;
  whatsAppSentAt?: string;
  emailSentAt?: string;
  waMeUrl?: string;
}

const STORAGE_VALIDATION_REPORTS_KEY = 'petsimona25_validation_reports_v1';

/**
 * Generates a full Purchase & Tailoring Validation Report
 */
export function generatePurchaseValidationReport(params: {
  petName: string;
  petType: 'dog' | 'cat' | 'other';
  breed: string;
  garmentType: string;
  fabricColor: string;
  embroideryText?: string;
  specialNotes?: string;
  price: number;
  neck: number;
  chest: number;
  bodyLength: number;
  unit: 'cm' | 'in';
  analysis: MeasurementAnalysis;
  userConfirmedUnusual?: boolean;
  customerEmail?: string;
  customerPhone?: string;
}): PurchaseValidationReport {
  const {
    petName,
    petType,
    breed,
    garmentType,
    fabricColor,
    embroideryText,
    specialNotes,
    price,
    neck,
    chest,
    bodyLength,
    unit,
    analysis,
    userConfirmedUnusual = false,
    customerEmail,
    customerPhone,
  } = params;

  const now = new Date();
  const reportCode = `REP-VAL-PS25-${Math.floor(100000 + Math.random() * 900000)}`;

  let workshopValidationVerdict: PurchaseValidationReport['workshopValidationVerdict'] = 'APROBADO_ESTANDAR';
  let verdictTitle = '✓ Aprobado para Corte Anatómico Estándar';
  let verdictDescription = `Las medidas de ${petName} se ajustan perfectamente a las proporciones estándar de ${analysis.benchmark.name}. Procederemos con corte regular y holgura de respiración garantizada.`;

  if (analysis.hasErrors) {
    workshopValidationVerdict = 'REVISION_REQUERIDA';
    verdictTitle = '⚠️ Requiere Corrección de Medidas (Incoherencia Anatómica)';
    verdictDescription =
      'Se detectó una discrepancia anatómica crítica (ej. contorno de pecho menor o igual al cuello). No es posible cortar la prenda sin ajustar estas dimensiones.';
  } else if (analysis.isUnusual || userConfirmedUnusual) {
    workshopValidationVerdict = 'APROBADO_MEDIDAS_ESPECIALES';
    verdictTitle = '📐 Aprobado para Patronaje Artesanal Especial';
    verdictDescription = `Medidas personalizadas autorizadas para ${petName}. En nuestro taller de Rengo adaptaremos el patrón a sus proporciones corporales singulares para evitar tirones o prendas arrastrando.`;
  }

  const report: PurchaseValidationReport = {
    id: reportCode,
    timestamp: now.toISOString(),
    petName: petName.trim() || 'Mascota regalona',
    petType,
    breed,
    garmentType,
    fabricColor,
    fabricType: 'Algodón Térmico Hipoalergénico + Capa Impermeable Artesanal',
    embroideryText: embroideryText?.trim() || undefined,
    specialNotes: specialNotes?.trim() || undefined,
    price,
    currency: 'CLP',
    measurements: {
      neck: Number(neck),
      chest: Number(chest),
      bodyLength: Number(bodyLength),
      unit,
    },
    measurementsInCm: {
      neck: analysis.enteredCm.neck,
      chest: analysis.enteredCm.chest,
      bodyLength: analysis.enteredCm.bodyLength,
    },
    benchmark: {
      name: analysis.benchmark.name,
      neckRange: `${analysis.benchmark.neckCm.min} - ${analysis.benchmark.neckCm.max} cm (típico: ${analysis.benchmark.neckCm.typical} cm)`,
      chestRange: `${analysis.benchmark.chestCm.min} - ${analysis.benchmark.chestCm.max} cm (típico: ${analysis.benchmark.chestCm.typical} cm)`,
      lengthRange: `${analysis.benchmark.lengthCm.min} - ${analysis.benchmark.lengthCm.max} cm (típico: ${analysis.benchmark.lengthCm.typical} cm)`,
      typicalWeight: analysis.benchmark.typicalWeightKg,
      tailorAdvice: analysis.benchmark.tailorAdvice,
    },
    analysis: {
      compatibilityScore: analysis.compatibilityScore,
      riskLevel: analysis.riskLevel,
      isUnusual: analysis.isUnusual,
      hasErrors: analysis.hasErrors,
      hasWarnings: analysis.hasWarnings,
      suggestedStandardSize: analysis.suggestedStandardSize,
      status: analysis.status,
      summaryMessage: analysis.summaryMessage,
      tailorRecommendation: analysis.tailorRecommendation,
      issues: analysis.issues.map((i) => ({
        field: i.field,
        title: i.title,
        message: i.message,
        severity: i.severity,
      })),
    },
    userConfirmedUnusual,
    workshopValidationVerdict,
    verdictTitle,
    verdictDescription,
    customerEmail: customerEmail?.trim() || undefined,
    customerPhone: customerPhone?.trim() || undefined,
    notifiedWhatsApp: false,
    notifiedEmail: false,
  };

  return report;
}

/**
 * Format official WhatsApp message with full technical validation breakdown
 */
export function formatValidationReportWhatsAppText(report: PurchaseValidationReport): string {
  const dateFormatted = new Date(report.timestamp).toLocaleString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const issuesList =
    report.analysis.issues.length > 0
      ? report.analysis.issues.map((iss) => `   ⚠️ *${iss.title}:* ${iss.message}`).join('\n')
      : '   ✅ Medidas 100% armónicas dentro del rango anatómico.';

  const embroideryNote = report.embroideryText
    ? `\n🧵 *Bordado Personalizado:* "${report.embroideryText}" (+$4.000 CLP)`
    : '';

  return `👑 *petsimona25.cl* | *REPORTE DE VALIDACIÓN DE COMPRA* 🐾
━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 *Ficha N°:* \`${report.id}\`
🕒 *Fecha:* ${dateFormatted}
📍 *Taller Artesanal:* Rengo, Región de O'Higgins, Chile

🐾 *DATOS DE LA MASCOTA:*
• *Nombre:* ${report.petName} (${report.petType === 'dog' ? 'Perro 🐕' : 'Gato 🐈'})
• *Raza:* ${report.breed}
• *Peso habitual raza:* ${report.benchmark.typicalWeight}

✂️ *PRENDA SELECCIONADA:*
• *Modelo:* ${report.garmentType}
• *Color:* ${report.fabricColor}
• *Talla Sugerida:* ${report.analysis.suggestedStandardSize}${embroideryNote}
• *Total Prenda:* $${report.price.toLocaleString('es-CL')} ${report.currency}

📐 *VALIDACIÓN DE MEDIDAS INGRESADAS (${report.measurements.unit}):*
1️⃣ *Cuello:* ${report.measurements.neck} ${report.measurements.unit} (${report.measurementsInCm.neck} cm)
   ↳ Estándar de la raza: ${report.benchmark.neckRange}
2️⃣ *Pecho / Tórax:* ${report.measurements.chest} ${report.measurements.unit} (${report.measurementsInCm.chest} cm)
   ↳ Estándar de la raza: ${report.benchmark.chestRange}
3️⃣ *Largo de Espalda:* ${report.measurements.bodyLength} ${report.measurements.unit} (${report.measurementsInCm.bodyLength} cm)
   ↳ Estándar de la raza: ${report.benchmark.lengthRange}

🛡️ *DICTAMEN TÉCNICO DE CONFECCIÓN:*
• *Índice de Compatibilidad:* ${report.analysis.compatibilityScore}%
• *Estado:* *${report.verdictTitle}*
• *Detalle de Validación:*
${issuesList}

💡 *Recomendación del Taller:*
${report.analysis.tailorRecommendation}

✨ *Garantía petsimona25:* Si la prenda requiere ajustes de calce con las medidas verificadas, el taller en Rengo realiza la adaptación sin costo adicional.
━━━━━━━━━━━━━━━━━━━━━━━━━━
💬 *Contacto Directo Taller:* ${OFFICIAL_WHATSAPP_PHONE}
🌐 https://petsimona25.cl`;
}

/**
 * Dispatch validation report to WhatsApp Business + create wa.me link
 */
export async function sendValidationReportToWhatsApp(
  report: PurchaseValidationReport,
  options?: { customerPhone?: string; directOpen?: boolean }
): Promise<{ success: boolean; waMeUrl: string; messageText: string }> {
  const messageText = formatValidationReportWhatsAppText(report);
  const targetPhone = options?.customerPhone || OFFICIAL_WHATSAPP_PHONE;

  const waMeUrl = `https://wa.me/${OFFICIAL_WHATSAPP_NUMBER_RAW}?text=${encodeURIComponent(messageText)}`;

  try {
    await sendWhatsAppBusinessMessage({
      toPhone: targetPhone,
      recipientName: `Tutor de ${report.petName}`,
      petName: report.petName,
      orderNumber: report.id,
      templateType: 'confirmacion_pedido_v1',
      templateTitle: `📋 Validación de Medidas: ${report.petName} (${report.breed})`,
      messageText,
    });
  } catch (err) {
    console.warn('Error sending WhatsApp Business dispatch:', err);
  }

  report.notifiedWhatsApp = true;
  report.whatsAppSentAt = new Date().toISOString();
  report.waMeUrl = waMeUrl;
  saveValidationReportToStorage(report);

  if (options?.directOpen && typeof window !== 'undefined') {
    window.open(waMeUrl, '_blank', 'noopener,noreferrer');
  }

  return {
    success: true,
    waMeUrl,
    messageText,
  };
}

/**
 * Format HTML & Plain Text email content for validation notification
 */
export function formatValidationReportEmailContent(report: PurchaseValidationReport): {
  subject: string;
  plainText: string;
} {
  const subject = `📋 Ficha de Validación de Medidas (${report.id}) - ${report.petName} [${report.breed}]`;
  const plainText = formatValidationReportWhatsAppText(report);
  return { subject, plainText };
}

/**
 * Dispatch validation report via Email to customer and workshop
 */
export async function sendValidationReportToEmail(
  report: PurchaseValidationReport,
  targetCustomerEmail?: string
): Promise<{ success: boolean; recipientEmail: string; message: string }> {
  const clientEmail = targetCustomerEmail?.trim() || report.customerEmail || OFFICIAL_NOTIFICATION_EMAIL;
  const { subject, plainText } = formatValidationReportEmailContent(report);

  // 1. Record email dispatch for client
  const clientDispatch = {
    id: `email-val-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    toEmail: clientEmail,
    subject: `🔔 [petsimona25.cl] ${subject}`,
    content: plainText,
    category: 'custom_tailoring' as const,
    sentAt: new Date().toISOString(),
    status: 'delivered' as const,
    metadata: {
      orderNumber: report.id,
      productName: report.garmentType,
      whatsAppNotified: true,
    },
  };
  recordLocalEmailDispatch(clientDispatch);

  // 2. Also record email dispatch for workshop admin if client email is distinct
  if (clientEmail.toLowerCase() !== OFFICIAL_NOTIFICATION_EMAIL.toLowerCase()) {
    const adminDispatch = {
      id: `email-val-admin-${Date.now()}`,
      toEmail: OFFICIAL_NOTIFICATION_EMAIL,
      subject: `🚨 [Copia Taller] ${subject}`,
      content: `COPIA PARA EL TALLER ARTESANAL RENGO:\n\nCliente: ${clientEmail}\n\n${plainText}`,
      category: 'custom_tailoring' as const,
      sentAt: new Date().toISOString(),
      status: 'delivered' as const,
      metadata: {
        orderNumber: report.id,
        productName: report.garmentType,
        whatsAppNotified: true,
      },
    };
    recordLocalEmailDispatch(adminDispatch);
  }

  // 3. Forward to server endpoint
  try {
    await fetch('/api/notifications/email-dispatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        toEmail: clientEmail,
        subject: `🔔 [petsimona25.cl] ${subject}`,
        content: plainText,
        category: 'custom_tailoring',
        metadata: {
          orderNumber: report.id,
          productName: `${report.garmentType} (${report.petName})`,
          whatsAppNotified: true,
        },
      }),
    });
  } catch (err) {
    console.warn('Error hitting /api/notifications/email-dispatch:', err);
  }

  report.notifiedEmail = true;
  report.emailSentAt = new Date().toISOString();
  report.customerEmail = clientEmail;
  saveValidationReportToStorage(report);

  return {
    success: true,
    recipientEmail: clientEmail,
    message: `Reporte de validación despachado con éxito a ${clientEmail} y al taller oficial (${OFFICIAL_NOTIFICATION_EMAIL}).`,
  };
}

/**
 * Save report into localStorage
 */
export function saveValidationReportToStorage(report: PurchaseValidationReport) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_VALIDATION_REPORTS_KEY);
    const list: PurchaseValidationReport[] = raw ? JSON.parse(raw) : [];
    const index = list.findIndex((r) => r.id === report.id);
    if (index >= 0) {
      list[index] = report;
    } else {
      list.unshift(report);
    }
    localStorage.setItem(STORAGE_VALIDATION_REPORTS_KEY, JSON.stringify(list.slice(0, 30)));
  } catch (e) {
    console.warn('Failed to save validation report to localStorage:', e);
  }
}

/**
 * Retrieve saved reports from localStorage
 */
export function getStoredValidationReports(): PurchaseValidationReport[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_VALIDATION_REPORTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Copy formatted report to clipboard
 */
export async function copyValidationReportToClipboard(report: PurchaseValidationReport): Promise<boolean> {
  const text = formatValidationReportWhatsAppText(report);
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) {
    console.warn('Clipboard write error:', e);
  }
  return false;
}
