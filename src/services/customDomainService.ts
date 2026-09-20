/**
 * Centralized Custom Domain Service for petsimona25
 * Manages the active official and custom domain (petsimona25.cl, petsimona25.com, etc.),
 * persisting in localStorage and notifying components across the app in real time.
 */

export const DEFAULT_OFFICIAL_DOMAIN = 'https://petsimona25.cl';

export interface DomainPreset {
  id: string;
  name: string;
  url: string;
  tag: string;
  isRecommended?: boolean;
}

export const DOMAIN_PRESETS: DomainPreset[] = [
  {
    id: 'cl-root',
    name: 'petsimona25.cl (Dominio Oficial Principal)',
    url: 'https://petsimona25.cl',
    tag: 'Recomendado Chile • NIC Chile',
    isRecommended: true,
  },
  {
    id: 'cl-www',
    name: 'www.petsimona25.cl (Subdominio Web)',
    url: 'https://www.petsimona25.cl',
    tag: 'Estándar Google Sites & CNAME',
  },
  {
    id: 'com-root',
    name: 'petsimona25.com (Dominio Internacional)',
    url: 'https://petsimona25.com',
    tag: 'Global / Exportación',
  },
  {
    id: 'tienda-sub',
    name: 'tienda.petsimona25.cl (Subdominio Catálogo)',
    url: 'https://tienda.petsimona25.cl',
    tag: 'E-commerce Especializado',
  },
];

const DOMAIN_STORAGE_KEY = 'petsimona25_active_custom_domain';
export const DOMAIN_CHANGED_EVENT = 'petsimona25_custom_domain_changed';

/**
 * Retrieves the currently active domain URL (defaults to https://petsimona25.cl)
 */
export function getActiveDomain(): string {
  if (typeof window === 'undefined') {
    return DEFAULT_OFFICIAL_DOMAIN;
  }

  try {
    const stored = localStorage.getItem(DOMAIN_STORAGE_KEY);
    if (stored && stored.trim().length > 0) {
      return sanitizeDomainUrl(stored);
    }
  } catch (err) {
    console.warn('Error reading stored custom domain:', err);
  }

  return DEFAULT_OFFICIAL_DOMAIN;
}

export const getActiveCustomDomain = getActiveDomain;

/**
 * Normalizes and sanitizes a custom domain URL string
 */
export function sanitizeDomainUrl(rawUrl: string): string {
  let clean = rawUrl.trim();
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    clean = `https://${clean}`;
  }
  // Remove trailing slashes
  return clean.replace(/\/+$/, '');
}

/**
 * Sets a new active custom domain and dispatches an update event
 */
export function setActiveDomain(newDomain: string): string {
  const sanitized = sanitizeDomainUrl(newDomain);
  try {
    localStorage.setItem(DOMAIN_STORAGE_KEY, sanitized);
  } catch (err) {
    console.error('Error saving custom domain:', err);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(DOMAIN_CHANGED_EVENT, {
        detail: sanitized,
      })
    );
  }

  return sanitized;
}

/**
 * Subscribes to custom domain change events
 */
export function subscribeDomainChanges(callback: (domain: string) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handler = (e: Event) => {
    const customEvt = e as CustomEvent<string>;
    callback(customEvt.detail || getActiveDomain());
  };

  window.addEventListener(DOMAIN_CHANGED_EVENT, handler);
  return () => window.removeEventListener(DOMAIN_CHANGED_EVENT, handler);
}

/**
 * Generates an absolute URL with the active custom domain
 */
export function buildDomainUrl(path: string = '/'): string {
  const base = getActiveDomain();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return cleanPath === '/' ? base : `${base}${cleanPath}`;
}

/**
 * DNS Setup guide information for the active domain
 */
export function getDnsInstructionsForDomain(domainUrl: string) {
  const clean = domainUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  const isWww = clean.startsWith('www.');
  const rootHost = isWww ? clean.replace(/^www\./, '') : clean;

  return {
    domainName: clean,
    rootHost,
    records: [
      {
        type: 'CNAME',
        host: isWww ? 'www' : '@',
        pointsTo: 'ghs.googlehosted.com',
        description: 'Conecta tu dominio con Google Sites / Servidor Web',
      },
      {
        type: 'A',
        host: '@',
        pointsTo: '216.239.32.21',
        description: 'Dirección IP principal para servidores de Google',
      },
      {
        type: 'A',
        host: '@',
        pointsTo: '216.239.34.21',
        description: 'Dirección IP secundaria de respaldo Google',
      },
      {
        type: 'TXT',
        host: '@',
        pointsTo: 'google-site-verification=petsimona25_verification_token',
        description: 'Verificación oficial de propiedad en Google Search Console',
      },
    ],
  };
}
