import { BlogPost } from '../types';

/**
 * Utility to strip Markdown formatting, HTML tags, and clean up whitespace for SEO engines
 */
export function cleanMarkdownToPlainText(markdown: string): string {
  if (!markdown) return '';
  return markdown
    .replace(/^#+\s+/gm, '') // Remove markdown headers (#, ##, ###)
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold **text**
    .replace(/\*([^*]+)\*/g, '$1') // Remove italic *text*
    .replace(/__([^_]+)__/g, '$1') // Remove bold __text__
    .replace(/_([^_]+)_/g, '$1') // Remove italic _text_
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Replace links [text](url) with text
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '') // Remove image embeds
    .replace(/`{1,3}[^`\n]+`{1,3}/g, '') // Remove inline code
    .replace(/^\s*[-*+]\s+/gm, '') // Remove bullet points
    .replace(/^\s*\d+\.\s+/gm, '') // Remove numbered lists
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\n+/g, ' ') // Replace multiple newlines with single space
    .replace(/\s{2,}/g, ' ') // Replace multiple spaces
    .trim();
}

export function truncateToWordBoundary(text: string, maxLength: number = 150): string {
  const clean = text.trim();
  if (clean.length <= maxLength) return clean;

  const sub = clean.slice(0, maxLength - 3);
  const lastSpace = sub.lastIndexOf(' ');
  const trimmed = lastSpace > 50 ? sub.slice(0, lastSpace) : sub;
  return `${trimmed.trim()}...`;
}

/**
 * Función que genera automáticamente una meta-description SEO de 150 caracteres
 * para cada post basándose en su contenido textual, optimizada para Google Search Console.
 */
export function generate150CharSEOMetaDescription(
  content: string,
  title: string = '',
  targetLength: number = 150
): string {
  const cleanContent = cleanMarkdownToPlainText(content);
  const cleanTitle = cleanMarkdownToPlainText(title);

  if (!cleanContent) {
    if (cleanTitle) {
      const fallback = `${cleanTitle} | Consejos de cuidado y ropa a la medida para mascotas en petsimona25.cl (Rengo, Chile).`;
      return truncateToWordBoundary(fallback, targetLength);
    }
    return truncateToWordBoundary(
      'Consejos de confección de ropa a la medida y cuidado para perros y gatos en petsimona25.cl (Rengo, Región de O\'Higgins, Chile).',
      targetLength
    );
  }

  // 1. Extraer oraciones relevantes
  const sentences = cleanContent
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15);

  const keywords = [
    'petsimona25',
    'a la medida',
    'medidas',
    'perro',
    'perrito',
    'gato',
    'ropa',
    'telas',
    'hipoalergénica',
    'rengo',
    'chile',
    'pecho',
    'cuello',
    'largo',
    'yorkie',
    'sustentable',
    'abrigo',
    'impermeable',
    'cuidado',
  ];

  let bestSentence = sentences[0] || cleanContent;
  let bestScore = -1;

  for (const s of sentences) {
    let score = 0;
    const lower = s.toLowerCase();
    keywords.forEach((kw) => {
      if (lower.includes(kw)) score += 2;
    });

    // Bonificar oraciones que por sí solas tengan entre 70 y 140 caracteres
    if (s.length >= 70 && s.length <= 140) score += 4;
    else if (s.length > 150) score -= 1;

    if (score > bestScore) {
      bestScore = score;
      bestSentence = s;
    }
  }

  // Limpiar puntuación final
  let baseText = bestSentence.replace(/[.?!]+$/, '').trim();

  // Enriquecer con marca o localidad si la oración es corta y hay espacio hasta 150 caracteres
  if (baseText.length < 95 && !baseText.toLowerCase().includes('petsimona25')) {
    baseText = `${baseText}. Conoce más en petsimona25.cl (Rengo, Chile)`;
  } else if (!baseText.toLowerCase().includes('petsimona25') && baseText.length + 18 <= targetLength) {
    baseText = `${baseText} | petsimona25.cl`;
  }

  return truncateToWordBoundary(baseText, targetLength);
}

export type SEOStyleFocus = 'google-balanced' | 'local-chile' | 'eco-craft' | 'guide-practical';

export interface GenerateMetaOptions {
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  author?: string;
  style?: SEOStyleFocus;
}

/**
 * Dynamically generates a Google SEO-optimized meta description (140 - 158 characters)
 * with brand authority, local Chilean search intent, and relevant action callouts.
 */
export function generateDynamicMetaDescription(options: GenerateMetaOptions): string {
  const { title, content, category, tags = [], style = 'google-balanced' } = options;
  const cleanContent = cleanMarkdownToPlainText(content);
  const cleanTitle = cleanMarkdownToPlainText(title);

  if (!cleanContent && !cleanTitle) {
    return 'Descubre en petsimona25.cl artículos expertos sobre ropa a la medida para perros pequeños y medianos en Rengo, Región de O\'Higgins, Chile.';
  }

  // Split into candidate sentences
  const rawSentences = cleanContent
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);

  // Key entities we love to prioritize for Google Indexing
  const highValueKeywords = [
    'petsimona25',
    'a la medida',
    'medidas',
    'perro',
    'perrito',
    'telas',
    'hipoalergénica',
    'rengo',
    'chile',
    'pecho',
    'cuello',
    'yorkie',
    'costura',
    'sostenible',
  ];

  // Score sentences based on keyword relevance and clarity
  let bestSentence = rawSentences[0] || cleanContent;
  let bestScore = -1;

  for (const sentence of rawSentences) {
    let score = 0;
    const lower = sentence.toLowerCase();
    
    highValueKeywords.forEach((kw) => {
      if (lower.includes(kw)) score += 2;
    });

    // Favor sentences between 60 and 130 chars
    if (sentence.length >= 60 && sentence.length <= 130) score += 3;
    if (sentence.length > 150) score -= 2;

    if (score > bestScore) {
      bestScore = score;
      bestSentence = sentence;
    }
  }

  // Normalize best sentence (remove trailing period)
  bestSentence = bestSentence.replace(/[.?!]+$/, '').trim();

  let result = '';

  switch (style) {
    case 'local-chile': {
      // Focus on Rengo / O'Higgins / Chile local Google rankings
      const hook = `En petsimona25.cl (${cleanTitle}):`;
      const remainder = bestSentence.slice(0, 155 - hook.length - 28);
      result = `${hook} ${remainder}. Confección en Rengo, Chile.`;
      break;
    }

    case 'eco-craft': {
      // Focus on hypoallergenic fabrics & handmade craft
      const hook = `Guía petsimona25.cl:`;
      const remainder = bestSentence.slice(0, 155 - hook.length - 35);
      result = `${hook} ${remainder}. Moda canina sustentable e hipoalergénica.`;
      break;
    }

    case 'guide-practical': {
      // Focus on step-by-step practical guide & advice
      const hook = `Aprende con petsimona25.cl:`;
      const remainder = bestSentence.slice(0, 155 - hook.length - 30);
      result = `${hook} ${remainder}. Ropa a medida en Chile.`;
      break;
    }

    case 'google-balanced':
    default: {
      // Balanced standard SEO description targeting 145-156 chars
      if (bestSentence.length >= 130 && bestSentence.length <= 155) {
        if (!bestSentence.toLowerCase().includes('petsimona25')) {
          result = `${bestSentence.slice(0, 138)} | petsimona25.cl.`;
        } else {
          result = `${bestSentence}.`;
        }
      } else if (bestSentence.length < 130) {
        const brandTag = bestSentence.toLowerCase().includes('petsimona25')
          ? 'Conoce más en Rengo, Chile.'
          : 'Descúbrelo en petsimona25.cl (Rengo, Chile).';
        result = `${bestSentence}. ${brandTag}`;
      } else {
        // Cut nicely at word boundary
        const truncated = bestSentence.slice(0, 140);
        const lastSpace = truncated.lastIndexOf(' ');
        const cleanTrunc = lastSpace > 100 ? truncated.slice(0, lastSpace) : truncated;
        result = `${cleanTrunc}... Lee más en petsimona25.cl.`;
      }
      break;
    }
  }

  // Ensure result length stays within Google's optimal sweetspot (135 - 158 chars)
  if (result.length > 158) {
    const cut = result.slice(0, 150);
    const lastSpace = cut.lastIndexOf(' ');
    result = `${cut.slice(0, lastSpace)}... petsimona25.cl`;
  }

  return result.trim();
}

/**
 * Generates a clean, punchy excerpt for preview cards (80-120 chars)
 */
export function generateDynamicExcerpt(content: string, maxLength: number = 120): string {
  const clean = cleanMarkdownToPlainText(content);
  if (!clean) return 'Artículo exclusivo de confección y cuidado de mascotas en petsimona25.cl.';
  
  if (clean.length <= maxLength) return clean;

  const slice = clean.slice(0, maxLength);
  const lastSpace = slice.lastIndexOf(' ');
  return `${slice.slice(0, lastSpace > 50 ? lastSpace : maxLength)}...`;
}

/**
 * Extracts high-density SEO keywords for meta tags and indexing
 */
export function generateSEOKeywords(title: string, content: string, category?: string, tags: string[] = []): string[] {
  const baseKeywords = [
    'petsimona25.cl',
    'ropa para perros a la medida',
    'confección canina Rengo',
    'ropa mascotas Chile',
    'telas hipoalergénicas perros',
  ];

  const extracted = [...tags];

  if (category) {
    extracted.push(category);
    extracted.push(`${category.toLowerCase()} perros`);
  }

  const cleanTitle = cleanMarkdownToPlainText(title).toLowerCase();
  if (cleanTitle.includes('yorkie')) extracted.push('ropa yorkshire terrier chile');
  if (cleanTitle.includes('medir') || cleanTitle.includes('medidas')) extracted.push('como medir perro ropa a medida');
  if (cleanTitle.includes('frio') || cleanTitle.includes('invierno')) extracted.push('abrigos impermeables perros invierno');
  if (cleanTitle.includes('sostenible') || cleanTitle.includes('telas')) extracted.push('moda canina eco sustentable chile');

  const combined = Array.from(new Set([...baseKeywords, ...extracted]));
  return combined.slice(0, 10);
}

/**
 * Calculates SEO Health Score for the article (0 - 100) and actionable tips
 */
export interface SEOScoreResult {
  score: number;
  charCount: number;
  status: 'excellent' | 'good' | 'warning' | 'poor';
  statusLabel: string;
  tips: string[];
}

export function calculateSEOScore(title: string, metaDesc: string, content: string, tags: string[] = []): SEOScoreResult {
  let score = 0;
  const tips: string[] = [];
  const charCount = metaDesc ? metaDesc.trim().length : 0;

  // 1. Meta Description length (Max 35 pts)
  if (charCount >= 135 && charCount <= 158) {
    score += 35;
  } else if (charCount >= 110 && charCount <= 165) {
    score += 25;
    tips.push('La meta-descripción está cerca del largo ideal (140-158 caracteres).');
  } else if (charCount > 0 && charCount < 110) {
    score += 12;
    tips.push(`La meta-descripción es corta (${charCount} caracteres). Amplíala a ~145 caracteres para aprovechar el espacio en Google.`);
  } else if (charCount > 165) {
    score += 15;
    tips.push(`La meta-descripción es muy larga (${charCount} caracteres) y Google podría recortarla con '...'.`);
  } else {
    tips.push('Falta una meta-descripción optimizada para Google.');
  }

  // 2. Title length & quality (Max 25 pts)
  const titleLen = title ? title.trim().length : 0;
  if (titleLen >= 35 && titleLen <= 70) {
    score += 25;
  } else if (titleLen > 15 && titleLen < 35) {
    score += 15;
    tips.push('El título es algo corto. Un título entre 40 y 65 caracteres posiciona mejor.');
  } else if (titleLen > 70) {
    score += 15;
    tips.push('El título supera los 70 caracteres y podría truncarse en Google.');
  } else {
    tips.push('Agrega un título descriptivo y claro.');
  }

  // 3. Keyword / Brand presence (Max 25 pts)
  const metaLower = (metaDesc || '').toLowerCase();
  const titleLower = (title || '').toLowerCase();
  const contentLower = (content || '').toLowerCase();

  let brandFound = false;
  if (metaLower.includes('petsimona25') || titleLower.includes('petsimona25') || contentLower.includes('petsimona25')) {
    score += 15;
    brandFound = true;
  } else {
    tips.push('Incluye la marca "petsimona25.cl" para aumentar el reconocimiento en búsquedas.');
  }

  if (metaLower.includes('rengo') || metaLower.includes('chile') || titleLower.includes('rengo') || titleLower.includes('chile')) {
    score += 10;
  } else {
    tips.push('Menciona "Rengo" o "Chile" para potenciar el SEO local.');
  }

  // 4. Tags & Content length (Max 15 pts)
  if (tags.length >= 3) {
    score += 8;
  } else {
    tips.push('Agrega al menos 3 etiquetas o palabras clave.');
  }

  const cleanContentLen = cleanMarkdownToPlainText(content).length;
  if (cleanContentLen >= 300) {
    score += 7;
  } else {
    tips.push('Un contenido más detallado (+300 caracteres) ayuda a indexar más consultas.');
  }

  score = Math.min(100, Math.max(0, score));

  let status: SEOScoreResult['status'] = 'poor';
  let statusLabel = 'Deficiente';

  if (score >= 85) {
    status = 'excellent';
    statusLabel = 'Excelente para Google 🚀';
  } else if (score >= 65) {
    status = 'good';
    statusLabel = 'Bueno para Indexar 👍';
  } else if (score >= 40) {
    status = 'warning';
    statusLabel = 'Mejorable ⚠️';
  } else {
    status = 'poor';
    statusLabel = 'Requiere Optimización 🛑';
  }

  return {
    score,
    charCount,
    status,
    statusLabel,
    tips: tips.length > 0 ? tips : ['¡Meta-datos y snippet perfectamente optimizados para Google Search Console!'],
  };
}

/**
 * Generates Schema.org JSON-LD structured data for Google Rich Results
 */
export function generateArticleJsonLd(post: BlogPost): Record<string, unknown> {
  const cleanExcerpt = post.excerpt || generateDynamicExcerpt(post.content);
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: cleanExcerpt,
    image: [post.imageUrl],
    datePublished: '2026-08-01T08:00:00-04:00',
    dateModified: '2026-08-19T12:00:00-04:00',
    author: {
      '@type': 'Person',
      name: post.author || 'Constanza S. - petsimona25.cl',
      url: 'https://petsimona25.cl/#historia',
      jobTitle: 'Educadora Diferencial & Confeccionista Canina Artesanal',
    },
    publisher: {
      '@type': 'Organization',
      name: 'petsimona25.cl',
      url: 'https://petsimona25.cl',
      logo: {
        '@type': 'ImageObject',
        url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=300',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://petsimona25.cl/#blog-${post.id}`,
    },
    keywords: post.tags?.join(', ') || 'ropa perros a medida, Rengo, petsimona25.cl',
    articleSection: post.category,
    inLanguage: 'es-CL',
  };
}

/**
 * Dynamically synchronizes HTML <head> meta tags for SEO when an article is opened
 */
let originalTitle = '';
let originalMetaDesc = '';

export function syncDocumentSEOMetadata(post: BlogPost | null): void {
  if (typeof document === 'undefined') return;

  if (post) {
    // Save original if not saved yet
    if (!originalTitle) {
      originalTitle = document.title;
      const meta = document.querySelector('meta[name="description"]');
      originalMetaDesc = meta ? meta.getAttribute('content') || '' : '';
    }

    const dynamicDesc = generateDynamicMetaDescription({
      title: post.title,
      content: post.content,
      category: post.category,
      tags: post.tags,
      author: post.author,
    });

    // Update document title
    document.title = `${post.title} | Blog petsimona25.cl Rengo`;

    // Update meta description
    let metaDescEl = document.querySelector('meta[name="description"]');
    if (!metaDescEl) {
      metaDescEl = document.createElement('meta');
      metaDescEl.setAttribute('name', 'description');
      document.head.appendChild(metaDescEl);
    }
    metaDescEl.setAttribute('content', dynamicDesc);

    // Update OpenGraph tags
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', `${post.title} | petsimona25.cl`);

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', dynamicDesc);

  } else if (originalTitle) {
    // Restore default
    document.title = originalTitle;
    const metaDescEl = document.querySelector('meta[name="description"]');
    if (metaDescEl && originalMetaDesc) {
      metaDescEl.setAttribute('content', originalMetaDesc);
    }
  }
}
