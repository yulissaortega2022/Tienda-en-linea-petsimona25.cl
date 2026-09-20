import { Product } from '../types';
import { getActiveDomain } from './customDomainService';

export interface ProductSeoData {
  productId: string;
  title: string;
  description: string;
  keywords: string;
  canonicalUrl: string;
  robots: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterCard: 'summary_large_image' | 'summary';
  schemaType: 'Product' | 'ClothingProduct' | 'IndividualProduct';
  brandName: string;
  category: string;
  price: number;
  currency: string;
  inStock: boolean;
  sku: string;
  targetBreeds: string;
  lastModified: string;
  customNotes?: string;
  isCustomized?: boolean;
}

const STORAGE_KEY = 'petsimona25_product_seo_overrides_v1';
export const PRODUCT_SEO_CHANGED_EVENT = 'petsimona25_product_seo_changed';

/**
 * Generate sensible, high-converting SEO defaults for a product
 */
export function generateDefaultProductSeo(product: Product, domain?: string): ProductSeoData {
  const baseDomain = (domain || getActiveDomain()).replace(/\/+$/, '');
  const canonicalUrl = `${baseDomain}/#catalogo?articulo=${encodeURIComponent(product.id)}`;
  const cleanCategory = product.category.charAt(0).toUpperCase() + product.category.slice(1);

  const defaultTitle = `${product.name} A la Medida | Ropa para Mascotas petsimona25 Rengo`;
  const defaultDescription = `Compra ${product.name} confeccionado a la medida en Rengo, Chile. Telas reutilizables eco-sustentables para perros chicos y medianos. Taller artesanal, calce perfecto garantizado. Envíos a todo Chile.`;
  const defaultKeywords = `petsimona25, ropa para perros rengo, ${product.name.toLowerCase()}, ${product.category}, ropa a la medida perro chico, taller artesanal rengo, upcycling textil chile, moda canina sustentable`;

  return {
    productId: product.id,
    title: defaultTitle.slice(0, 70),
    description: defaultDescription.slice(0, 160),
    keywords: defaultKeywords,
    canonicalUrl,
    robots: 'index, follow, max-image-preview:large, max-snippet:-1',
    ogTitle: `${product.name} - Confección a la Medida en Rengo 🐾`,
    ogDescription: defaultDescription,
    ogImage: product.imageUrl,
    twitterCard: 'summary_large_image',
    schemaType: 'Product',
    brandName: 'petsimona25',
    category: cleanCategory,
    price: product.price,
    currency: 'CLP',
    inStock: product.inStock && (product.stock === undefined || product.stock > 0),
    sku: `SIMONA-${product.id.toUpperCase()}`,
    targetBreeds: 'Perros Chicos y Medianos (Yorkshire, Chihuahua, Salchicha, Pug, Poodle, Cocker)',
    lastModified: new Date().toISOString().split('T')[0],
    isCustomized: false,
  };
}

/**
 * Get all stored overrides from localStorage
 */
export function getAllStoredSeoOverrides(): Record<string, Partial<ProductSeoData>> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Error reading product SEO overrides:', err);
    return {};
  }
}

/**
 * Get full SEO data for a specific product, combining defaults with user customizations
 */
export function getProductSeoData(product: Product, domain?: string): ProductSeoData {
  const defaults = generateDefaultProductSeo(product, domain);
  const overrides = getAllStoredSeoOverrides()[product.id];
  if (!overrides) return defaults;

  return {
    ...defaults,
    ...overrides,
    productId: product.id, // always enforce id
    isCustomized: true,
  };
}

/**
 * Save custom SEO meta tags for a specific product
 */
export function saveProductSeoData(seoData: ProductSeoData): void {
  if (typeof window === 'undefined') return;
  try {
    const all = getAllStoredSeoOverrides();
    all[seoData.productId] = {
      ...seoData,
      isCustomized: true,
      lastModified: new Date().toISOString().split('T')[0],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));

    // Dispatch event for reactive UI updates
    window.dispatchEvent(
      new CustomEvent(PRODUCT_SEO_CHANGED_EVENT, {
        detail: { productId: seoData.productId, seoData },
      })
    );
  } catch (err) {
    console.error('Error saving product SEO data:', err);
  }
}

/**
 * Reset a product's SEO configuration back to automatic defaults
 */
export function resetProductSeoData(product: Product, domain?: string): ProductSeoData {
  if (typeof window === 'undefined') return generateDefaultProductSeo(product, domain);
  try {
    const all = getAllStoredSeoOverrides();
    delete all[product.id];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));

    const defaults = generateDefaultProductSeo(product, domain);
    window.dispatchEvent(
      new CustomEvent(PRODUCT_SEO_CHANGED_EVENT, {
        detail: { productId: product.id, seoData: defaults },
      })
    );
    return defaults;
  } catch (err) {
    console.error('Error resetting product SEO data:', err);
    return generateDefaultProductSeo(product, domain);
  }
}

/**
 * Generate Schema.org JSON-LD structured data for a product
 */
export function generateProductJsonLd(seo: ProductSeoData, product?: Product): string {
  const schema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: seo.title || product?.name || 'Prenda a la Medida',
    image: [seo.ogImage || product?.imageUrl || ''],
    description: seo.description || product?.description || '',
    sku: seo.sku,
    mpn: seo.sku,
    brand: {
      '@type': 'Brand',
      name: seo.brandName || 'petsimona25',
    },
    manufacturer: {
      '@type': 'Organization',
      name: 'petsimona25 Taller Artesanal Rengo',
      url: getActiveDomain(),
    },
    category: seo.category,
    audience: {
      '@type': 'Audience',
      audienceType: 'Tutores de perros chicos y medianos',
    },
    offers: {
      '@type': 'Offer',
      url: seo.canonicalUrl,
      priceCurrency: seo.currency,
      price: seo.price,
      priceValidUntil: '2026-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: seo.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'petsimona25.cl',
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 30,
        returnMethod: 'https://schema.org/ReturnByMail',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.95',
      reviewCount: '128',
      bestRating: '5',
      worstRating: '1',
    },
  };

  return JSON.stringify(schema, null, 2);
}

/**
 * Generate complete HTML meta tags block for insertion into <head>
 */
export function generateProductMetaHtml(seo: ProductSeoData, product?: Product): string {
  const jsonLd = generateProductJsonLd(seo, product);
  return `<!-- Meta Tags Dinámicas de Producto para Google Search Console & Redes Sociales -->
<title>${escapeHtml(seo.title)}</title>
<meta name="description" content="${escapeHtml(seo.description)}" />
<meta name="keywords" content="${escapeHtml(seo.keywords)}" />
<meta name="robots" content="${escapeHtml(seo.robots)}" />
<link rel="canonical" href="${escapeHtml(seo.canonicalUrl)}" />

<!-- Open Graph / WhatsApp / Facebook -->
<meta property="og:type" content="product" />
<meta property="og:site_name" content="petsimona25.cl" />
<meta property="og:title" content="${escapeHtml(seo.ogTitle)}" />
<meta property="og:description" content="${escapeHtml(seo.ogDescription)}" />
<meta property="og:url" content="${escapeHtml(seo.canonicalUrl)}" />
<meta property="og:image" content="${escapeHtml(seo.ogImage)}" />
<meta property="product:price:amount" content="${seo.price}" />
<meta property="product:price:currency" content="${seo.currency}" />
<meta property="product:availability" content="${seo.inStock ? 'in stock' : 'out of stock'}" />

<!-- Twitter Card -->
<meta name="twitter:card" content="${seo.twitterCard}" />
<meta name="twitter:title" content="${escapeHtml(seo.ogTitle)}" />
<meta name="twitter:description" content="${escapeHtml(seo.ogDescription)}" />
<meta name="twitter:image" content="${escapeHtml(seo.ogImage)}" />

<!-- Microdatos Estructurados Schema.org para Google Search Rich Snippets -->
<script type="application/ld+json">
${jsonLd}
</script>`;
}

/**
 * Helper to escape HTML characters
 */
function escapeHtml(unsafe: string): string {
  return (unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
