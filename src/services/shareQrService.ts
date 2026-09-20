import QRCode from 'qrcode';
import { getActiveDomain } from './customDomainService';

export interface ShareSectionOption {
  id: string;
  name: string;
  description: string;
  path: string;
  iconName: string;
}

export type QrSizePreset = 'sm' | 'md' | 'lg' | 'xl' | 'custom';

export interface QrSizeOption {
  id: QrSizePreset;
  label: string;
  description: string;
  dimensionPx: number;
  badge: string;
}

export const QR_SIZE_PRESETS: QrSizeOption[] = [
  {
    id: 'sm',
    label: 'Compacto (S)',
    description: '180px • Ideal para pantallas pequeñas o tarjetas de visita',
    dimensionPx: 180,
    badge: '180px',
  },
  {
    id: 'md',
    label: 'Estándar (M)',
    description: '260px • Tamaño óptimo para escaneo desde mostrador o celular',
    dimensionPx: 260,
    badge: '260px',
  },
  {
    id: 'lg',
    label: 'Grande (L)',
    description: '340px • Alta visibilidad para banners y pantallas de ordenador',
    dimensionPx: 340,
    badge: '340px',
  },
  {
    id: 'xl',
    label: 'Gigante (XL)',
    description: '440px • Máxima resolución para vitrinas, posters e impresiones',
    dimensionPx: 440,
    badge: '440px',
  },
];

const QR_SIZE_STORAGE_KEY = 'petsimona25_qr_dimension_px';
export const QR_SIZE_CHANGED_EVENT = 'petsimona25_qr_size_changed';

/**
 * Returns the currently preferred QR size in pixels
 */
export function getSavedQrSize(): number {
  if (typeof window === 'undefined') return 260;
  try {
    const saved = localStorage.getItem(QR_SIZE_STORAGE_KEY);
    if (saved) {
      const num = parseInt(saved, 10);
      if (!isNaN(num) && num >= 140 && num <= 600) {
        return num;
      }
    }
  } catch (e) {}
  return 260; // Default medium size
}

/**
 * Saves the preferred QR size in pixels and notifies components
 */
export function setSavedQrSize(dimensionPx: number): void {
  const bounded = Math.min(Math.max(dimensionPx, 140), 600);
  try {
    localStorage.setItem(QR_SIZE_STORAGE_KEY, bounded.toString());
  } catch (e) {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(QR_SIZE_CHANGED_EVENT, { detail: bounded })
    );
  }
}

export const SHARE_SECTIONS: ShareSectionOption[] = [
  {
    id: 'home',
    name: 'Tienda Principal 🏠',
    description: 'Página de inicio, historia artesanal y destacados de Rengo.',
    path: '/',
    iconName: 'Home',
  },
  {
    id: 'catalog',
    name: 'Catálogo de Ropa 👗',
    description: 'Parkas, chalecos térmicos, capas impermeables y vestidos.',
    path: '/#catalogo',
    iconName: 'ShoppingBag',
  },
  {
    id: 'custom_order',
    name: 'Pedido A la Medida 📏',
    description: 'Formulario de confección personalizada para perros chicos y medianos.',
    path: '/#medidas-form',
    iconName: 'Scissors',
  },
  {
    id: 'tracking',
    name: 'Rastrear Envío 📦',
    description: 'Consulta rápida del estado logístico en Blue Express, Starken y Chilexpress.',
    path: '/#rastreo',
    iconName: 'Truck',
  },
];

export const OFFICIAL_DOMAIN = 'https://petsimona25.cl';

/**
 * Returns the effective base URL (prefers custom configured domain, fallback to current origin or official domain)
 */
export function getBaseShareUrl(): string {
  const activeCustom = getActiveDomain();
  if (activeCustom) return activeCustom;

  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin;
  }
  return OFFICIAL_DOMAIN;
}

/**
 * Generates a QR Code Data URL with customizable styling
 */
export async function generateQrDataUrl(
  url: string,
  options?: {
    width?: number;
    colorDark?: string;
    colorLight?: string;
  }
): Promise<string> {
  const width = options?.width || 360;
  const colorDark = options?.colorDark || '#1e293b'; // slate-800
  const colorLight = options?.colorLight || '#ffffff';

  try {
    return await QRCode.toDataURL(url, {
      width,
      margin: 2,
      color: {
        dark: colorDark,
        light: colorLight,
      },
      errorCorrectionLevel: 'H', // High error correction so logo or badge can be centered
    });
  } catch (err) {
    console.error('Error generating QR code:', err);
    throw err;
  }
}

/**
 * Creates a high-resolution branded poster with the QR code, logo, and store info
 */
export async function downloadBrandedQrImage(
  url: string,
  title: string = 'petsimona25.cl',
  subtitle: string = 'Ropa para Mascotas a la Medida • Rengo, Chile'
): Promise<void> {
  const qrDataUrl = await generateQrDataUrl(url, { width: 600 });
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = 700;
  const h = 880;
  canvas.width = w;
  canvas.height = h;

  // Background gradient (warm amber/slate luxury)
  const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
  bgGrad.addColorStop(0, '#fffbeb');
  bgGrad.addColorStop(1, '#fef3c7');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Outer border with gold accent
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 10;
  ctx.strokeRect(15, 15, w - 30, h - 30);

  // Inner stitched border line
  ctx.save();
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 2;
  ctx.setLineDash([12, 8]);
  ctx.strokeRect(28, 28, w - 56, h - 56);
  ctx.restore();

  // Header Banner
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(40, 45, w - 80, 110, 16);
  ctx.fill();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('🐾 petsimona25.cl', w / 2, 95);

  ctx.fillStyle = '#f8fafc';
  ctx.font = '500 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Alta Costura Canina & Felina Hecha a la Medida', w / 2, 132);

  // QR Frame Box
  const qrBoxY = 175;
  const qrBoxSize = 480;
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 8;
  ctx.beginPath();
  ctx.roundRect((w - qrBoxSize) / 2, qrBoxY, qrBoxSize, qrBoxSize, 20);
  ctx.fill();
  ctx.shadowColor = 'transparent';

  // Load and draw QR code
  const img = new Image();
  img.crossOrigin = 'anonymous';
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = qrDataUrl;
  });

  const qrDrawSize = 430;
  ctx.drawImage(img, (w - qrDrawSize) / 2, qrBoxY + 25, qrDrawSize, qrDrawSize);

  // Badge inside QR center
  ctx.fillStyle = '#d97706';
  ctx.beginPath();
  ctx.arc(w / 2, qrBoxY + qrBoxSize / 2, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText('🐾', w / 2, qrBoxY + qrBoxSize / 2 + 9);

  // Bottom text section
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(title, w / 2, 690);

  ctx.fillStyle = '#64748b';
  ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(subtitle, w / 2, 722);

  ctx.fillStyle = '#047857';
  ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('📲 Escanea con tu cámara móvil para comprar o instalar la App', w / 2, 765);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Envíos a todo Chile • WhatsApp Oficial +56 9 7237 4764 • Taller en Rengo', w / 2, 810);

  // Trigger download
  const link = document.createElement('a');
  link.download = `QR_petsimona25_${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.png`;
  link.href = canvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Native PWA / WebAPK install prompt tracker
 */
let deferredPrompt: any = null;
const installListeners = new Set<(canInstall: boolean) => void>();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent standard mini-infobar on mobile Chrome
    e.preventDefault();
    deferredPrompt = e;
    installListeners.forEach((fn) => fn(true));
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    installListeners.forEach((fn) => fn(false));
  });
}

export function subscribePwaInstallAvailability(callback: (canInstall: boolean) => void) {
  installListeners.add(callback);
  callback(!!deferredPrompt);
  return () => {
    installListeners.delete(callback);
  };
}

export async function promptPwaInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  if (!deferredPrompt) {
    return 'unavailable';
  }
  try {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    installListeners.forEach((fn) => fn(false));
    return outcome;
  } catch (err) {
    console.error('Error prompting PWA install:', err);
    return 'unavailable';
  }
}

export function isAppAlreadyInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

/**
 * Downloads a self-contained Android APK Launcher HTML file.
 * When transferred or opened on an Android phone, it directs the user into full-screen PWA mode or WebAPK install.
 */
export function downloadAndroidLauncherPackage(targetUrl: string): void {
  const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>petsimona25.cl - App Móvil Android</title>
  <meta name="theme-color" content="#d97706">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #fffbeb; color: #1e293b; text-align: center; padding: 24px; }
    .card { max-width: 440px; margin: 40px auto; background: white; border-radius: 24px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border: 2px solid #fde68a; }
    h1 { color: #d97706; font-size: 24px; margin-bottom: 8px; }
    p { font-size: 14px; line-height: 1.6; color: #475569; }
    .btn { display: block; width: 100%; box-sizing: border-box; background: #ea580c; color: white; padding: 14px; border-radius: 14px; font-weight: bold; text-decoration: none; margin: 20px 0 10px; font-size: 16px; }
    .badge { background: #fef3c7; color: #92400e; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; display: inline-block; }
  </style>
  <script>
    // Auto redirect to PWA with full standalone capability
    window.location.replace("${targetUrl}");
  </script>
</head>
<body>
  <div class="card">
    <div class="badge">🐾 petsimona25.cl • Android App</div>
    <h1>Abriendo la Aplicación...</h1>
    <p>Si no se abre automáticamente en tu celular Android, presiona el botón a continuación:</p>
    <a href="${targetUrl}" class="btn">Abrir App petsimona25 🚀</a>
    <p style="font-size: 12px; color: #94a3b8;">Para instalar como APK nativo en tu pantalla de inicio: toca los tres puntos (⋮) de Chrome y selecciona "Instalar aplicación".</p>
  </div>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = 'petsimona25_android_app.html';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);
}
