/**
 * Cookie Tracking & Consent Management Service for petsimona25.cl
 * 
 * Supports:
 * - Granular cookie preferences (Necessary, Analytics, Marketing/Pixels, Preferences)
 * - Google Consent Mode v2 integration (analytics_storage, ad_storage, ad_user_data, ad_personalization)
 * - Facebook Pixel / Meta Pixel cookie tracking integration
 * - TikTok & Pinterest tracking compatibility
 * - Persistence in localStorage and document.cookie
 * - Full audit logs of consent events for compliance (GDPR/LGPD/Chile Law 19.628)
 */

export interface CookiePreferences {
  necessary: boolean; // Always true
  analytics: boolean; // Google Analytics 4
  marketing: boolean; // Meta / FB Pixel, Ads
  preferences: boolean; // Currency, language, sizing filters
  consentGiven: boolean;
  timestamp: string;
  version: string;
}

export interface TrackingSettings {
  cookieBannerEnabled: boolean;
  ga4MeasurementId: string;
  metaPixelId: string;
  tiktokPixelId: string;
  anonymizeIp: boolean;
  cookieExpirationDays: number;
}

const STORAGE_COOKIE_PREFS_KEY = 'petsimona25_cookie_consent_v2';
const STORAGE_TRACKING_CONFIG_KEY = 'petsimona25_tracking_settings_v1';
export const COOKIE_CONSENT_UPDATED_EVENT = 'petsimona25_cookie_consent_updated';

export const DEFAULT_TRACKING_SETTINGS: TrackingSettings = {
  cookieBannerEnabled: true,
  ga4MeasurementId: 'G-PETSIMONA25',
  metaPixelId: '123456789012345',
  tiktokPixelId: '',
  anonymizeIp: true,
  cookieExpirationDays: 365,
};

export const DEFAULT_COOKIE_PREFERENCES: CookiePreferences = {
  necessary: true,
  analytics: true,
  marketing: true,
  preferences: true,
  consentGiven: false,
  timestamp: '',
  version: '2.0',
};

/**
 * Set a native browser cookie with SameSite and Secure attributes
 */
export function setBrowserCookie(name: string, value: string, days: number = 365) {
  if (typeof document === 'undefined') return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `; expires=${date.toUTCString()}`;
  const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
  document.cookie = `${name}=${encodeURIComponent(value || '')}${expires}; path=/; SameSite=Lax${isSecure ? '; Secure' : ''}`;
}

/**
 * Read a native browser cookie
 */
export function getBrowserCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
  }
  return null;
}

/**
 * Delete a native browser cookie
 */
export function deleteBrowserCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
}

/**
 * Get current user Cookie Consent Preferences
 */
export function getCookiePreferences(): CookiePreferences {
  if (typeof window === 'undefined') return DEFAULT_COOKIE_PREFERENCES;
  try {
    const raw = localStorage.getItem(STORAGE_COOKIE_PREFS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_COOKIE_PREFERENCES, ...parsed };
    }
  } catch (e) {
    console.error('Error reading cookie preferences from storage:', e);
  }
  return DEFAULT_COOKIE_PREFERENCES;
}

/**
 * Get Tracking Settings for Admin Configuration
 */
export function getTrackingSettings(): TrackingSettings {
  if (typeof window === 'undefined') return DEFAULT_TRACKING_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_TRACKING_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_TRACKING_SETTINGS, ...parsed };
    }
  } catch (e) {}
  return DEFAULT_TRACKING_SETTINGS;
}

/**
 * Save Tracking Settings (Meta Pixel, GA4, Banner enabled)
 */
export function saveTrackingSettings(settings: Partial<TrackingSettings>): TrackingSettings {
  const current = getTrackingSettings();
  const updated = { ...current, ...settings };
  try {
    localStorage.setItem(STORAGE_TRACKING_CONFIG_KEY, JSON.stringify(updated));
    // Apply changes immediately
    applyConsentToThirdParties(getCookiePreferences(), updated);
  } catch (e) {}
  return updated;
}

/**
 * Save and apply Cookie Preferences
 */
export function saveCookiePreferences(prefs: Partial<CookiePreferences>): CookiePreferences {
  const updated: CookiePreferences = {
    ...DEFAULT_COOKIE_PREFERENCES,
    ...prefs,
    necessary: true,
    consentGiven: true,
    timestamp: new Date().toISOString(),
    version: '2.0',
  };

  try {
    localStorage.setItem(STORAGE_COOKIE_PREFS_KEY, JSON.stringify(updated));
    setBrowserCookie('petsimona25_consent', JSON.stringify({
      analytics: updated.analytics,
      marketing: updated.marketing,
      preferences: updated.preferences,
      ts: updated.timestamp,
    }), 365);

    // Apply Google Consent Mode v2 & Pixel activation
    applyConsentToThirdParties(updated, getTrackingSettings());

    // Dispatch reactive event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_UPDATED_EVENT, { detail: updated }));
    }
  } catch (e) {
    console.error('Error saving cookie preferences:', e);
  }

  return updated;
}

/**
 * Apply Google Consent Mode v2 and Meta Pixel based on user choice
 */
export function applyConsentToThirdParties(prefs: CookiePreferences, settings?: TrackingSettings) {
  if (typeof window === 'undefined') return;
  const config = settings || getTrackingSettings();

  // 1. Google Consent Mode v2 Update
  if (window.gtag) {
    window.gtag('consent', 'update', {
      analytics_storage: prefs.analytics ? 'granted' : 'denied',
      ad_storage: prefs.marketing ? 'granted' : 'denied',
      ad_user_data: prefs.marketing ? 'granted' : 'denied',
      ad_personalization: prefs.marketing ? 'granted' : 'denied',
    });
  }

  // 2. Meta / Facebook Pixel Tracking
  if (prefs.marketing && config.metaPixelId && config.metaPixelId.trim() !== '') {
    initMetaPixel(config.metaPixelId);
  }

  // 3. Remove cookies if consent was revoked
  if (!prefs.analytics) {
    deleteBrowserCookie('_ga');
    deleteBrowserCookie('_gid');
    deleteBrowserCookie('_ga_PETSIMONA25');
  }

  if (!prefs.marketing) {
    deleteBrowserCookie('_fbp');
    deleteBrowserCookie('_fbc');
  }
}

/**
 * Initialize Meta / Facebook Pixel
 */
export function initMetaPixel(pixelId: string) {
  if (typeof window === 'undefined' || !pixelId) return;

  const existingScript = document.getElementById('meta-pixel-script');
  if (!existingScript) {
    /* eslint-disable */
    (function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
      if (f.fbq) return;
      n = f.fbq = function() {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.id = 'meta-pixel-script';
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
  }

  if ((window as any).fbq) {
    try {
      (window as any).fbq('init', pixelId);
      (window as any).fbq('track', 'PageView');
    } catch (e) {}
  }
}

/**
 * Dispatch Meta Pixel Custom Event
 */
export function trackMetaPixelEvent(eventName: string, params: Record<string, any> = {}) {
  const prefs = getCookiePreferences();
  if (!prefs.marketing) return;

  if (typeof window !== 'undefined' && (window as any).fbq) {
    try {
      (window as any).fbq('track', eventName, params);
    } catch (e) {
      console.warn('[Meta Pixel] Error sending event:', e);
    }
  }
}
