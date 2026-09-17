import { Product } from '../types';

/**
 * Service to automatically generate optimized SEO Alt text, Title attributes,
 * and Rich Image SEO Meta descriptions for product images in petsimona25.cl.
 * Designed to maximize indexing, CTR, and ranking on Google Images Chile & Global.
 */

export interface OptimizedImageSEO {
  altText: string;
  imageTitle: string;
  imageCaption: string;
  schemaStructuredData: {
    '@context': string;
    '@type': string;
    name: string;
    description: string;
    contentUrl: string;
    caption: string;
    author: {
      '@type': string;
      name: string;
    };
  };
  keywords: string[];
}

const CATEGORY_SEO_MAP: Record<Product['category'], {
  singular: string;
  plural: string;
  benefits: string;
  targetPets: string;
}> = {
  abrigos: {
    singular: 'abrigo de lana térmica hipoalergénica',
    plural: 'abrigos para perros',
    benefits: 'protección contra el frío y viento con forro suave',
    targetPets: 'perros chicos, medianos y cachorros',
  },
  impermeables: {
    singular: 'chaqueta impermeable con forro térmico y reflectivo',
    plural: 'impermeables para perros',
    benefits: 'protección total contra lluvia y humedad con ojal para arnés',
    targetPets: 'perros de tamaño chico y mediano',
  },
  camisetas: {
    singular: 'camiseta casual de algodón respirable',
    plural: 'camisetas para mascotas',
    benefits: 'protección de la piel y pelaje con corte ergonómico flexible',
    targetPets: 'perros y gatos de raza pequeña o mediana',
  },
  vestidos: {
    singular: 'vestido artesanal de gala y fiesta',
    plural: 'vestidos para perritas',
    benefits: 'diseño elegante con detalles bordados y tela suave reutilizada',
    targetPets: 'perritas chicas y medianas',
  },
  pijamas: {
    singular: 'pijama térmica de 4 patas',
    plural: 'pijamas para perros',
    benefits: 'abrigo nocturno para descanso reparador y cuidado del pelaje',
    targetPets: 'perros y mascotas hogareñas',
  },
  accesorios: {
    singular: 'accesorio y bandana artesanal',
    plural: 'accesorios caninos',
    benefits: 'estilo exclusivo hecho a mano con telas sustentables',
    targetPets: 'perros chicos, medianos y felinos',
  },
};

/**
 * Generates an automatic, ultra-optimized alt text and metadata for a product image.
 * Following Google Images Best Practices:
 * 1. Descriptive, natural phrasing (not keyword stuffing).
 * 2. Mentions product name, category, fit ('a la medida'), origin ('Rengo, Chile'), and brand ('petsimona25').
 * 3. Specifies pet size target (perros chicos y medianos).
 */
export function generateOptimizedImageSEO(product: {
  id?: string;
  name: string;
  category: Product['category'];
  description?: string;
  imageUrl: string;
  price?: number;
  isCustomizable?: boolean;
}): OptimizedImageSEO {
  const categoryInfo = CATEGORY_SEO_MAP[product.category] || CATEGORY_SEO_MAP.abrigos;
  const cleanName = product.name.replace(/["“”]/g, '').trim();

  // Alt Text: 100-140 characters, highly descriptive for screen readers & Google Images
  // E.g.: "Impermeable Térmico Simona Shield para perros chicos y medianos hecho a la medida en Rengo - petsimona25.cl"
  const altText = `${cleanName} - ${categoryInfo.singular} para ${categoryInfo.targetPets}, confeccionado a la medida en taller Rengo Chile por petsimona25.cl`;

  // Image Title (for tooltip & secondary search crawlers)
  const imageTitle = `${cleanName} | Ropa para mascotas ${product.category} hecha a la medida - petsimona25.cl (Rengo)`;

  // Image Caption (for rich visual context)
  const imageCaption = `${cleanName}: ${categoryInfo.benefits}. Confección artesanal y sustentable para ${categoryInfo.targetPets}. Taller petsimona25 en Rengo, Región de O'Higgins.`;

  // Keywords used
  const keywords = [
    cleanName.toLowerCase(),
    categoryInfo.plural,
    `ropa para perros ${product.category}`,
    'ropa mascotas a la medida rengo',
    'confeccion artesanal perros chile',
    'petsimona25',
    'petsimona25.cl',
  ];

  // Schema.org ImageObject
  const schemaStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    name: cleanName,
    description: altText,
    contentUrl: product.imageUrl,
    caption: imageCaption,
    author: {
      '@type': 'Organization',
      name: 'petsimona25.cl',
    },
  };

  return {
    altText,
    imageTitle,
    imageCaption,
    schemaStructuredData,
    keywords,
  };
}

/**
 * Returns a quick optimized Alt string for standard <img> tags
 */
export function getProductImageAlt(product: {
  name: string;
  category: Product['category'];
}): string {
  const categoryInfo = CATEGORY_SEO_MAP[product.category] || CATEGORY_SEO_MAP.abrigos;
  const cleanName = product.name.replace(/["“”]/g, '').trim();
  return `${cleanName} - ${categoryInfo.singular} para mascotas a la medida en Rengo Chile | petsimona25.cl`;
}
