import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Calendar,
  Clock,
  Tag,
  Search,
  PlusCircle,
  User,
  ArrowRight,
  Share2,
  Sparkles,
  X,
  Check,
  Heart,
  Leaf,
  ShieldCheck,
  Newspaper,
  Globe,
  CheckCircle2,
  AlertCircle,
  Copy,
  Sliders,
  ExternalLink,
  Code2,
  SearchCode,
  Smartphone,
  Monitor,
  RefreshCw,
  Bot,
  Zap,
  Play,
  RotateCcw,
  Layers,
  Award,
} from 'lucide-react';
import { BlogPost, WeeklyBlogAutomationConfig } from '../types';
import {
  generateDynamicMetaDescription,
  generate150CharSEOMetaDescription,
  generateDynamicExcerpt,
  generateSEOKeywords,
  calculateSEOScore,
  generateArticleJsonLd,
  syncDocumentSEOMetadata,
  SEOStyleFocus,
  cleanMarkdownToPlainText,
} from '../utils/seoMetaGenerator';
import {
  trackGA4BlogArticleView,
  trackGA4BlogArticleShare,
} from '../services/analyticsService';
import { WeeklyBlogAutomationModal } from './WeeklyBlogAutomationModal';
import {
  getWeeklyBlogConfig,
  saveWeeklyBlogConfig,
  generateWeeklyBlogPostWithAI,
  EDITORIAL_PILLARS,
} from '../services/weeklyBlogService';

/**
 * Función en el componente de Blog que genera automáticamente una meta-description
 * SEO de 150 caracteres para cada post basándose en su contenido textual y contexto.
 *
 * @param content Contenido completo en markdown o texto plano del artículo
 * @param title Título opcional del post para contextualizar
 * @param targetLength Longitud objetivo en caracteres (por defecto 150)
 * @returns Meta-description de ~150 caracteres formateada para Google SERP
 */
export function generatePostSEOMetaDescription(
  content: string,
  title: string = '',
  targetLength: number = 150
): string {
  return generate150CharSEOMetaDescription(content, title, targetLength);
}

export const INITIAL_BLOG_POSTS: BlogPost[] = [
  {
    id: 'ai-weekly-0',
    title: 'Secretos de Confección Ergonómica: Cómo Evitar Rozaduras en el Pecho Canino',
    slug: 'secretos-confeccion-ergonomica-evitar-rozaduras-pecho-canino',
    category: 'Guía de Medidas',
    author: 'Constanza S. & IA Editorial petsimona25',
    date: '17 de Agosto, 2026',
    readTime: '4 min de lectura',
    imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800',
    tags: ['IA Semanal', 'Ergonomía Canina', 'Taller Rengo', 'Ropa a la Medida', 'petsimona25.cl'],
    excerpt: 'Descubre cómo el corte anatómico y la holgura de 2 dedos en el tórax previenen la fricción en axilas en perros pequeños y medianos.',
    metaDescription: 'Aprende cómo evitar rozaduras en el pecho canino con confección ergonómica y telas suaves a la medida en Rengo, Chile. Guía oficial de petsimona25.cl.',
    keywords: ['petsimona25.cl', 'como evitar rozaduras pecho perro', 'confección ergonómica Rengo', 'ropa perros a medida'],
    seoScore: 98,
    isAiGenerated: true,
    editorialPillar: 'Guía de Medidas y Ergonomía Anatómica',
    generatedAt: '2026-08-17T09:00:00.000Z',
    content: `En el taller artesanal de **petsimona25.cl** en Rengo, analizamos constantemente las necesidades anatómicas de los perros pequeños en Chile.

### La Importancia de la Sisa y el Contorno de Pecho
El tórax es la zona de mayor movimiento articular en caninos. Prendas rígidas o con costuras gruesas en las axilas provocan fricción continua al caminar o correr.

### 3 Reglas de Confección Ergonómica:
1. **Regla de los 2 Dedos:** El contorno de pecho debe incluir entre 2 y 3 cm de holgura para permitir la expansión torácica durante el jadeo o ejercicio.
2. **Forro Hipoalergénico Interior:** Utilizamos telas respirables que no generan estática ni enredos en razas de pelaje sedoso como el Yorkshire Terrier.
3. **Corte Curvo en el Vientre:** Permite a machos y hembras hacer sus necesidades sin ensuciar la prenda.

Visita nuestra guía interactiva de medidas y encarga una prenda confeccionada a la medida exacta de tu fiel compañero desde Rengo para todo Chile.`
  },
  {
    id: '1',
    title: 'Guía Definitiva: Cómo Medir a tu Perro Pequeño para Ropa a la Medida y Ergonómica',
    slug: 'guia-medir-perro-pequeno-ropa-ergonomica',
    category: 'Guía de Medidas',
    author: 'Constanza S. (Fundadora petsimona25.cl)',
    date: '8 de Agosto, 2026',
    readTime: '4 min de lectura',
    imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800',
    tags: ['Yorkie', 'Medidas Caninas', 'Rengo', 'Ergonomía', 'petsimona25.cl'],
    excerpt: '¿Tu Yorkie o perrito pequeño termina con la ropa suelta en el cuello o apretada en el pecho? Aprende a tomar las 3 medidas fundamentales: Cuello, Pecho y Largo.',
    metaDescription: 'Aprende a medir a tu perro pequeño (cuello, pecho y largo) para ropa ergonómica y cómoda a la medida en Rengo, Chile. Guía oficial de petsimona25.cl.',
    keywords: ['petsimona25.cl', 'como medir perro ropa a medida', 'confección canina Rengo', 'Yorkie', 'ropa mascotas Chile'],
    seoScore: 98,
    content: `En **petsimona25.cl**, como Educadora Diferencial y confeccionista artesanal en Rengo, entiendo perfectamente la frustración de comprar ropa estándar para perros pequeños y notar que ninguna le queda bien. Los Yorkies, Poodles toy, Chihuahuas y mestizos tienen proporciones corporales únicas.

### Las 3 Medidas Clave:
1. **Contorno de Cuello (A):** Rodea la base del cuello donde se ubica el collar con una cinta métrica flexible. Deja espacio para poner dos dedos y asegurar comodidad.
2. **Contorno de Pecho (B):** Mide la parte más ancha del tórax, justo detrás de las patas delanteras. Esta es la medida más crítica para evitar opresión en la respiración.
3. **Largo de Cuerpo (C):** Desde la base del cuello (donde empieza el lomo) hasta la raíz de la cola.

### ¿Por qué elegir confección a la medida en Rengo, Chile?
La ropa comercial masiva no contempla perritos con lomo largo y pecho angosto. Al encargarnos ropa a la medida en **petsimona25.cl**, cortamos el patrón exclusivo para la anatomía de tu mascota con acabados hipoalergénicos.`
  },
  {
    id: '2',
    title: 'Moda Sostenible Canina: ¿Por Qué Elegir Telas Hipoalergénicas y Rescatadas en Chile?',
    slug: 'moda-sostenible-canina-telas-hipoalergenicas-chile',
    category: 'Moda Sostenible',
    author: 'Constanza S. (petsimona25.cl)',
    date: '3 de Agosto, 2026',
    readTime: '5 min de lectura',
    imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=800',
    tags: ['Sostenibilidad', 'Telas Hipoalergénicas', 'Ropa Sustentable', 'Rengo', 'Upcycling'],
    excerpt: 'Descubre cómo transformamos retazos textiles de alta calidad en abrigos e impermeables únicos que cuidan la piel de tu mascota y el planeta.',
    metaDescription: 'Conoce cómo petsimona25.cl crea abrigos caninos eco-sustentables con telas hipoalergénicas rescatadas desde Rengo, O\'Higgins para todo Chile.',
    keywords: ['petsimona25.cl', 'telas hipoalergénicas mascotas Chile', 'moda canina eco sustentable chile', 'confección canina Rengo', 'Upcycling'],
    seoScore: 95,
    content: `La industria textil tradicional genera miles de toneladas de desecho. En **petsimona25.cl** creemos en una moda canina con propósito ecológico y consciente desde Rengo, Región de O'Higgins.

### Beneficios del Upcycling en Ropa Canina:
- **Reducción de Huella de Carbono:** Reutilizamos textiles e insumos de alta gama que de otro modo irían a vertederos.
- **Telas Hipoalergénicas:** Priorizamos algodones suaves, polares térmicos respirables y forros impermeables que no producen dermatitis ni frizz en el pelaje de razas sensibles como el Yorkshire Terrier.
- **Prendas Exclusivas y Unicas:** Ningún perrito en el parque usará el mismo abrigo que el tuyo.

Elegir **petsimona25.cl** es apoyar la economía local chilena, la confección sustentable y el bienestar de los animales.`
  },
  {
    id: '3',
    title: 'Cómo Proteger a tu Perrito Pequeño del Frío y la Humedad en la Región de O\'Higgins',
    slug: 'proteger-perrito-frio-humedad-region-ohiggins',
    category: 'Cuidado Canino',
    author: 'Constanza S. (petsimona25.cl)',
    date: '28 de Julio, 2026',
    readTime: '3 min de lectura',
    imageUrl: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&q=80&w=800',
    tags: ['Invierno Canino', 'Impermeables', 'Salud Mascotas', 'O\'Higgins', 'Rengo'],
    excerpt: 'Los inviernos en la zona central de Chile son fríos y húmedos. Consejos esenciales para evitar resfríos y mantener a tu compañero abrigado en sus paseos.',
    metaDescription: 'Consejos de cuidado invernal para proteger a tu perro pequeño del frío y la humedad en O\'Higgins con impermeables a medida de petsimona25.cl.',
    keywords: ['petsimona25.cl', 'abrigos impermeables perros invierno', 'Rengo', 'O\'Higgins', 'ropa para perros a la medida'],
    seoScore: 92,
    content: `Los perros de tamaño chico y mediano, especialmente razas de pelaje fino o una sola capa de pelo, pierden calor corporal rápidamente durante los paseos matutinos o vespertinos en comunas como Rengo, Rancagua, Requínoa o San Fernando.

### Consejos de Cuidado Invernal:
1. **Evita la humedad en el pecho:** El agua de la hierba o las calles moja el vientre del perro rápidamente. Un **impermeable a la medida** con cubierta ventral protege sus zonas vitales.
2. **Capas respirables:** La prenda no debe atrapar la condensación. Usar forros polares térmicos con exterior cortaviento es la combinación perfecta.
3. **Secado de patitas:** Al volver del paseo, seca bien sus almohadillas e inspecciona sus patas para evitar hongos por humedad.`
  },
  {
    id: '4',
    title: 'La Historia Detrás de petsimona25.cl: De la Dificultad a la Alta Costura Canina',
    slug: 'historia-petsimona25-alta-costura-canina-rengo',
    category: 'Historias petsimona25',
    author: 'Constanza S. & Simona 🎀',
    date: '15 de Julio, 2026',
    readTime: '6 min de lectura',
    imageUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=800',
    tags: ['Emprendimiento Femenino', 'Rengo', 'Yorkie Hembra', 'petsimona25.cl', 'Maipú'],
    excerpt: 'Conoce cómo nació petsimona25 en Rengo cuando no encontrábamos ropa cómoda para Simona, combinando la vocación docente con la pasión por la costura.',
    metaDescription: 'Descubre la historia de petsimona25.cl en Rengo: confección de ropa a medida para perros chicos por una educadora diferencial de Maipú.',
    keywords: ['petsimona25.cl', 'ropa para perros a la medida', 'confección canina Rengo', 'Yorkie Hembra', 'Maipú'],
    seoScore: 94,
    content: `Como Educadora Diferencial originaria de Maipú y radicada en Rengo, siempre busqué prendas que le quedaran perfectas a mi Yorkie hembra Simona. Sin embargo, toda la ropa de tienda comercial le quedaba corta en el lomo o le apretaba el pecho.

Así nació **petsimona25.cl**: tomando la aguja, el hilo y telas sustentables para confeccionar vestidos, abrigos e impermeables con medidas exactas.

Hoy nos llena de orgullo vestir a perritos de todo Chile con amor, dedicación artesanal y un compromiso inquebrantable con el medio ambiente.`
  }
];

export const BlogSection: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>(() => {
    const saved = localStorage.getItem('petsimona25_blog_posts');
    if (saved) {
      try {
        const parsed: BlogPost[] = JSON.parse(saved);
        // Ensure every post has dynamic meta-descriptions backfilled if missing
        return parsed.map((p) => ({
          ...p,
          metaDescription:
            p.metaDescription ||
            generateDynamicMetaDescription({
              title: p.title,
              content: p.content,
              category: p.category,
              tags: p.tags,
            }),
          keywords: p.keywords || generateSEOKeywords(p.title, p.content, p.category, p.tags),
          seoScore:
            p.seoScore ||
            calculateSEOScore(
              p.title,
              p.metaDescription || generateDynamicMetaDescription({ title: p.title, content: p.content }),
              p.content,
              p.tags
            ).score,
        }));
      } catch (e) {
        return INITIAL_BLOG_POSTS;
      }
    }
    return INITIAL_BLOG_POSTS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [activePost, setActivePost] = useState<BlogPost | null>(null);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [isWeeklyAutoModalOpen, setIsWeeklyAutoModalOpen] = useState(false);
  const [isQuickAiGenerating, setIsQuickAiGenerating] = useState(false);
  const [weeklyConfig, setWeeklyConfig] = useState<WeeklyBlogAutomationConfig>(() => getWeeklyBlogConfig());
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [copiedMetaText, setCopiedMetaText] = useState(false);
  const [copiedJsonLd, setCopiedJsonLd] = useState(false);
  const [isSeoInspectorOpen, setIsSeoInspectorOpen] = useState(false);

  // New Post Form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<BlogPost['category']>('Cuidado Canino');
  const [newExcerpt, setNewExcerpt] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newMetaDescription, setNewMetaDescription] = useState('');
  const [seoStyle, setSeoStyle] = useState<SEOStyleFocus>('google-balanced');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [metaGenToast, setMetaGenToast] = useState<string | null>(null);

  // Sync document head for SEO when an article is opened
  useEffect(() => {
    syncDocumentSEOMetadata(activePost);
    return () => {
      syncDocumentSEOMetadata(null);
    };
  }, [activePost]);

  useEffect(() => {
    localStorage.setItem('petsimona25_blog_posts', JSON.stringify(posts));
  }, [posts]);

  const handleSaveWeeklyConfig = (newConfig: WeeklyBlogAutomationConfig) => {
    setWeeklyConfig(newConfig);
    saveWeeklyBlogConfig(newConfig);
  };

  const handleWeeklyPostGenerated = (generatedPost: BlogPost) => {
    setPosts((prev) => [generatedPost, ...prev]);
    setActivePost(generatedPost);
    setMetaGenToast(`🤖 ¡Artículo semanal "${generatedPost.title}" generado y publicado!`);
    setTimeout(() => setMetaGenToast(null), 4000);
  };

  const handleQuickWeeklyGenerate = async () => {
    setIsQuickAiGenerating(true);
    try {
      const result = await generateWeeklyBlogPostWithAI();
      handleWeeklyPostGenerated(result.post);
      setWeeklyConfig(getWeeklyBlogConfig());
    } catch (e) {
      console.error(e);
      setMetaGenToast('⚠️ Error al generar post semanal.');
      setTimeout(() => setMetaGenToast(null), 3000);
    } finally {
      setIsQuickAiGenerating(false);
    }
  };

  const currentPillarInfo = EDITORIAL_PILLARS[weeklyConfig.currentPillarIndex % EDITORIAL_PILLARS.length];

  const categories = ['Todas', 'Cuidado Canino', 'Moda Sostenible', 'Guía de Medidas', 'Historias petsimona25'];

  const filteredPosts = posts.filter((post) => {
    const matchesCategory = selectedCategory === 'Todas' || post.category === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.metaDescription && post.metaDescription.toLowerCase().includes(searchQuery.toLowerCase())) ||
      post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Calculate live SEO score for the creation form
  const formTagsArray = newTags.split(',').map((t) => t.trim()).filter(Boolean);
  const liveSeoScore = calculateSEOScore(newTitle, newMetaDescription, newContent, formTagsArray);

  // Trigger dynamic meta-description generator (150 chars based on content)
  const handleAutoGenerateMeta = (styleOverride?: SEOStyleFocus) => {
    const targetStyle = styleOverride || seoStyle;
    if (!newTitle.trim() && !newContent.trim()) {
      setMetaGenToast('⚠️ Escribe primero el título o el contenido del artículo.');
      setTimeout(() => setMetaGenToast(null), 3000);
      return;
    }

    const generated = generatePostSEOMetaDescription(newContent, newTitle, 150);

    setNewMetaDescription(generated);

    // Also generate excerpt if empty
    if (!newExcerpt.trim() && newContent.trim()) {
      setNewExcerpt(generateDynamicExcerpt(newContent, 120));
    }

    setMetaGenToast('✨ ¡Meta-descripción SEO de 150 caracteres generada con éxito para Google!');
    setTimeout(() => setMetaGenToast(null), 3000);
  };

  // Regenerate 150-char SEO meta-description for the currently active article
  const handleRegenerateActivePostMeta = (post: BlogPost) => {
    const regenerated = generatePostSEOMetaDescription(post.content, post.title, 150);
    const updatedPost: BlogPost = {
      ...post,
      metaDescription: regenerated,
      seoScore: calculateSEOScore(post.title, regenerated, post.content, post.tags).score,
    };

    setActivePost(updatedPost);
    setPosts((prev) => prev.map((p) => (p.id === post.id ? updatedPost : p)));
    setMetaGenToast('⚡ Meta-description de 150 caracteres recalculada con base en el contenido.');
    setTimeout(() => setMetaGenToast(null), 3000);
  };

  const handleCopyRawMeta = (metaText: string) => {
    navigator.clipboard.writeText(metaText);
    setCopiedMetaText(true);
    setTimeout(() => setCopiedMetaText(false), 2500);
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    // If meta description wasn't manually set, generate it automatically
    const finalMetaDesc =
      newMetaDescription.trim() ||
      generateDynamicMetaDescription({
        title: newTitle,
        content: newContent,
        category: newCategory,
        tags: formTagsArray,
        style: seoStyle,
      });

    const finalExcerpt = newExcerpt.trim() || generateDynamicExcerpt(newContent, 120);
    const finalKeywords = generateSEOKeywords(newTitle, newContent, newCategory, formTagsArray);
    const finalScore = calculateSEOScore(newTitle, finalMetaDesc, newContent, formTagsArray).score;

    const newPost: BlogPost = {
      id: Date.now().toString(),
      title: newTitle,
      slug: newTitle
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, ''),
      excerpt: finalExcerpt,
      metaDescription: finalMetaDesc,
      content: newContent,
      category: newCategory,
      author: 'Constanza S. (petsimona25.cl)',
      date: new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' }),
      readTime: `${Math.max(1, Math.ceil(newContent.split(' ').length / 150))} min de lectura`,
      imageUrl:
        newImageUrl ||
        'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800',
      tags: formTagsArray.length > 0 ? formTagsArray : ['petsimona25.cl', 'Rengo', 'Ropa a la Medida'],
      keywords: finalKeywords,
      seoScore: finalScore,
    };

    setPosts([newPost, ...posts]);
    setIsWriteModalOpen(false);

    // Reset form
    setNewTitle('');
    setNewExcerpt('');
    setNewMetaDescription('');
    setNewContent('');
    setNewTags('');
    setNewImageUrl('');
  };

  const handleShare = (post: BlogPost) => {
    const shareUrl = `${window.location.origin}#blog-${post.id}`;
    navigator.clipboard.writeText(shareUrl);
    trackGA4BlogArticleShare(post.id, post.title, 'clipboard');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleCopyMetaHtml = (post: BlogPost) => {
    const metaHtml = `<!-- Google SEO Meta Tags para petsimona25.cl -->
<title>${post.title} | Blog petsimona25.cl Rengo</title>
<meta name="description" content="${post.metaDescription || generateDynamicMetaDescription({ title: post.title, content: post.content })}" />
<meta name="keywords" content="${(post.keywords || generateSEOKeywords(post.title, post.content, post.category, post.tags)).join(', ')}" />
<link rel="canonical" href="https://petsimona25.cl/#blog-${post.id}" />
<meta property="og:title" content="${post.title} | petsimona25.cl" />
<meta property="og:description" content="${post.metaDescription || post.excerpt}" />
<meta property="og:url" content="https://petsimona25.cl/#blog-${post.id}" />
<meta property="og:image" content="${post.imageUrl}" />`;

    navigator.clipboard.writeText(metaHtml);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 3000);
  };

  const handleCopyJsonLd = (post: BlogPost) => {
    const jsonLd = JSON.stringify(generateArticleJsonLd(post), null, 2);
    navigator.clipboard.writeText(`<script type="application/ld+json">\n${jsonLd}\n</script>`);
    setCopiedJsonLd(true);
    setTimeout(() => setCopiedJsonLd(false), 3000);
  };

  return (
    <section id="blog" className="py-16 bg-slate-50 border-t border-slate-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-100 border border-orange-200 text-orange-700 font-black text-xs uppercase tracking-wider">
              <Newspaper className="w-4 h-4 text-orange-600" />
              <span>Blog &amp; Artículos de Cuidado Canino</span>
              <span className="bg-orange-600 text-white text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                Google SEO Ready
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Consejos de Moda Sostenible y Cuidado de Mascotas 🐾
            </h2>
            <p className="text-slate-600 text-sm max-w-2xl font-medium leading-relaxed">
              Escrito por Constanza desde Rengo para tutores de perritos en todo Chile. Con generador dinámico de meta-descripciones y publicador automático semanal impulsado por IA Gemini 3.7 Flash.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
            <button
              onClick={() => setIsWeeklyAutoModalOpen(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold px-4 py-3 rounded-2xl text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer border border-orange-400/30"
            >
              <Bot className="w-4 h-4 text-yellow-200 animate-pulse" />
              <span>Publicador Semanal IA</span>
            </button>

            <button
              onClick={() => setIsWriteModalOpen(true)}
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-4 py-3 rounded-2xl text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-yellow-400" />
              <span>Nuevo Artículo Manual</span>
            </button>
          </div>
        </div>

        {/* Weekly AI Blog Automation Live Status Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-orange-950 to-slate-900 rounded-3xl p-5 sm:p-6 text-white border border-orange-800/40 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-full bg-radial from-orange-500/10 to-transparent pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 bg-orange-500/20 text-orange-300 border border-orange-500/40 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                  <Bot className="w-3.5 h-3.5 text-orange-400" />
                  Auto-Blog Semanal IA Activo
                </span>

                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Gemini 3.7 Flash
                </span>

                <span className="text-slate-400 text-xs font-mono">
                  {weeklyConfig.totalAiGeneratedCount || 0} posts creados
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <span>{currentPillarInfo.icon}</span>
                  <span>Pilar de Esta Semana: {currentPillarInfo.title}</span>
                </h3>
                <p className="text-xs text-orange-200/80 font-medium max-w-2xl leading-relaxed">
                  Próxima publicación programada:{' '}
                  <strong className="text-white font-bold">
                    {new Date(weeklyConfig.nextScheduledDate).toLocaleDateString('es-CL', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}
                  </strong>{' '}
                  a las <strong className="text-yellow-300 font-mono">{weeklyConfig.publishTime} CLT</strong>. Redacta, ajusta meta-description a 150 caracteres y envía alerta automática a suscriptores.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                disabled={isQuickAiGenerating}
                onClick={handleQuickWeeklyGenerate}
                className="w-full sm:w-auto bg-orange-600 hover:bg-orange-500 text-white font-black text-xs px-5 py-3 rounded-xl shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer disabled:opacity-60"
              >
                {isQuickAiGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Redactando con Gemini 3.7 Flash...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-yellow-300 fill-current" />
                    <span>Generar Post Semanal Ahora ⚡</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsWeeklyAutoModalOpen(true)}
                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-3 rounded-xl border border-white/20 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sliders className="w-4 h-4 text-orange-300" />
                <span>Programación &amp; Pilares</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
          {/* Categories pill filters */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar tema, tag o palabra..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 border border-slate-200 focus:border-orange-500 rounded-2xl pl-10 pr-4 py-2 text-xs font-bold text-slate-900 outline-hidden transition-all"
            />
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => {
            const currentMeta =
              post.metaDescription ||
              generatePostSEOMetaDescription(post.content, post.title, 150);

            return (
              <article
                key={post.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Image Container */}
                  <div className="relative h-52 overflow-hidden bg-slate-100">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-yellow-400 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-slate-700">
                      {post.category}
                    </div>

                    {/* SEO Health Badge & AI Generated Badge */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      {post.isAiGenerated && (
                        <div className="bg-orange-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm backdrop-blur-xs border border-orange-400">
                          <Bot className="w-3 h-3 text-yellow-300 animate-pulse" />
                          <span>IA Semanal</span>
                        </div>
                      )}
                      <div className="bg-emerald-500/90 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm backdrop-blur-xs">
                        <Globe className="w-3 h-3" />
                        <span>SEO {post.seoScore || 95}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 font-semibold">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-orange-500" />
                        {post.date}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-orange-500" />
                        {post.readTime}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-slate-900 leading-snug group-hover:text-orange-600 transition-colors">
                      {post.title}
                    </h3>

                    {post.editorialPillar && (
                      <div className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-800 bg-orange-100/70 px-2 py-0.5 rounded-md border border-orange-200">
                        <Layers className="w-3 h-3 text-orange-600" />
                        <span>Pilar: {post.editorialPillar}</span>
                      </div>
                    )}

                    {/* Meta-Description Snippet for Google Snippet preview on cards */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-orange-700">
                        <span className="inline-flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-orange-500" />
                          Meta-Description SEO (150 carac.):
                        </span>
                        <span className="bg-orange-50 text-orange-800 px-1.5 py-0.5 rounded font-mono text-[9px] border border-orange-200">
                          {currentMeta.length} carac.
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium line-clamp-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        {currentMeta}
                      </p>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2.5 py-0.5 rounded-md"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-6 pt-0 border-t border-slate-100 mt-4 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 truncate max-w-[150px]">
                    {post.author}
                  </span>

                  <button
                    onClick={() => {
                      trackGA4BlogArticleView(post.id, post.title, post.category);
                      setActivePost(post);
                      setIsSeoInspectorOpen(false);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-black text-orange-600 hover:text-orange-700 group-hover:translate-x-1 transition-transform cursor-pointer"
                  >
                    <span>Leer &amp; SEO</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {filteredPosts.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-black text-slate-800">No se encontraron artículos</h3>
            <p className="text-xs text-slate-500 font-medium">
              Intenta con otros términos de búsqueda o selecciona otra categoría.
            </p>
          </div>
        )}

        {/* Read Full Post Modal with Dynamic Meta-Description & SEO Inspector */}
        {activePost && (
          <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 relative my-8">
              {/* Header Image */}
              <div className="relative h-64 sm:h-80 bg-slate-900">
                <img
                  src={activePost.imageUrl}
                  alt={activePost.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover opacity-90"
                />
                <button
                  onClick={() => setActivePost(null)}
                  className="absolute top-4 right-4 bg-slate-900/80 text-white p-2.5 rounded-full hover:bg-slate-900 transition-colors shadow-lg z-10 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-4 bg-orange-600 text-white font-black text-xs px-3.5 py-1 rounded-full uppercase tracking-wider shadow-md">
                  {activePost.category}
                </div>

                {/* SEO Snippet Badge */}
                <button
                  onClick={() => setIsSeoInspectorOpen(!isSeoInspectorOpen)}
                  className="absolute bottom-4 right-4 bg-slate-900/90 text-yellow-300 hover:text-white font-black text-xs px-3 py-1.5 rounded-xl border border-yellow-400/40 shadow-lg flex items-center gap-1.5 cursor-pointer backdrop-blur-xs"
                >
                  <SearchCode className="w-4 h-4 text-yellow-400" />
                  <span>{isSeoInspectorOpen ? 'Ocultar SEO' : 'Ver Ficha SEO Google'}</span>
                </button>
              </div>

              {/* Content Container */}
              <div className="p-6 sm:p-10 space-y-6">
                
                {/* SEO Inspector Box (Expandable) */}
                {isSeoInspectorOpen && (
                  <div className="bg-slate-900 text-white p-5 rounded-2xl border-2 border-orange-500 space-y-4 animate-fade-in shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-orange-400" />
                        <h4 className="font-black text-xs uppercase tracking-wider text-orange-400">
                          Google Search Console • Meta-Description Dinámica
                        </h4>
                      </div>
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                        Score SEO: {activePost.seoScore || 95}/100
                      </span>
                    </div>

                    {/* Google SERP Simulated Preview */}
                    <div className="bg-white text-slate-900 p-4 rounded-xl shadow-inner border border-slate-200 space-y-1.5">
                      <div className="flex items-center gap-2 text-[11px] text-slate-600">
                        <span className="w-4 h-4 rounded-full bg-orange-500 text-white flex items-center justify-center font-black text-[9px]">
                          p
                        </span>
                        <span className="font-bold">petsimona25.cl</span>
                        <span className="text-slate-400">› blog › {activePost.slug}</span>
                      </div>
                      <h5 className="text-sm font-bold text-blue-700 hover:underline cursor-pointer">
                        {activePost.title} | petsimona25.cl Rengo
                      </h5>
                      <p className="text-xs text-slate-600 leading-snug">
                        <span className="text-slate-400 font-bold mr-1">
                          {activePost.date} —
                        </span>
                        {activePost.metaDescription ||
                          generatePostSEOMetaDescription(activePost.content, activePost.title, 150)}
                      </p>
                    </div>

                    {/* Technical Meta Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                      <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 space-y-1">
                        <span className="text-slate-400 font-bold block text-[10px] uppercase">
                          Longitud Meta-Description SEO
                        </span>
                        <span className="font-mono text-yellow-300 font-bold flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                          {(activePost.metaDescription || generatePostSEOMetaDescription(activePost.content, activePost.title, 150)).length}{' '}
                          / 150 caracteres (Estándar Google SERP)
                        </span>
                      </div>

                      <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 space-y-1">
                        <span className="text-slate-400 font-bold block text-[10px] uppercase">
                          Indexación Google Search
                        </span>
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          index, follow, max-snippet:150
                        </span>
                      </div>
                    </div>

                    {/* Action & Copy Buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleRegenerateActivePostMeta(activePost)}
                        className="bg-orange-600 hover:bg-orange-500 text-white text-xs font-black px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-95"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Regenerar Meta SEO (150 carac.)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleCopyRawMeta(
                            activePost.metaDescription ||
                              generatePostSEOMetaDescription(activePost.content, activePost.title, 150)
                          )
                        }
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                      >
                        {copiedMetaText ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-300">¡Texto Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar Texto Meta (150c)</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyMetaHtml(activePost)}
                        className="bg-slate-800 hover:bg-slate-700 text-yellow-300 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                      >
                        {copiedSnippet ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>¡HTML Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Code2 className="w-3.5 h-3.5 text-yellow-400" />
                            <span>Copiar Tags HTML</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyJsonLd(activePost)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                      >
                        {copiedJsonLd ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>¡Schema.org Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar JSON-LD</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* AI-Generated Info Banner in Active Post */}
                {activePost.isAiGenerated && (
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center font-black shrink-0 shadow-xs">
                        <Bot className="w-4 h-4 text-yellow-300" />
                      </div>
                      <div>
                        <span className="font-black text-orange-950 block">
                          Artículo Generado con IA Semanal (Gemini 3.7 Flash)
                        </span>
                        <span className="text-orange-800 text-[11px] font-medium">
                          Pilar editorial: <strong>{activePost.editorialPillar || 'General petsimona25'}</strong> • Meta-description optimizada a 150 caracteres.
                        </span>
                      </div>
                    </div>

                    <span className="bg-orange-600 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 text-center">
                      Auto-Publicado
                    </span>
                  </div>
                )}

                <div className="space-y-3 border-b border-slate-200 pb-6">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                    {activePost.title}
                  </h2>

                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 font-bold">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-orange-600" />
                      <span>{activePost.author}</span>
                      <span>•</span>
                      <Calendar className="w-4 h-4 text-orange-600" />
                      <span>{activePost.date}</span>
                    </div>

                    <button
                      onClick={() => handleShare(activePost)}
                      className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold px-3 py-1.5 rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">¡Enlace Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5 text-orange-600" />
                          <span>Compartir</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Article Prose Body */}
                <div className="prose prose-slate max-w-none text-slate-800 text-sm leading-relaxed space-y-4 font-medium whitespace-pre-line">
                  {activePost.content}
                </div>

                {/* Tags */}
                <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center gap-2">
                  <Tag className="w-4 h-4 text-slate-400" />
                  {activePost.tags.map((t) => (
                    <span
                      key={t}
                      className="bg-orange-50 text-orange-800 text-xs font-bold px-3 py-1 rounded-lg border border-orange-200/50"
                    >
                      #{t}
                    </span>
                  ))}
                </div>

                {/* Bottom CTA to WhatsApp / Order */}
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 rounded-3xl text-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg border-2 border-yellow-300">
                  <div className="space-y-1 text-center sm:text-left">
                    <h4 className="font-black text-base uppercase">¿Quieres Ropa a la Medida para tu Mascota?</h4>
                    <p className="text-xs font-bold opacity-95">
                      Confeccionamos en Rengo con telas hipoalergénicas y despacho a todo Chile.
                    </p>
                  </div>
                  <a
                    href="https://wa.me/56972374764?text=Hola%20petsimona25,%20le%C3%AD%20el%20art%C3%ADculo%20en%20el%20blog%20y%20me%20gustar%C3%ADa%20encargar%20ropa%20a%20la%20medida"
                    target="_blank"
                    rel="noreferrer"
                    className="bg-slate-900 hover:bg-slate-800 text-yellow-400 font-black text-xs px-6 py-3 rounded-2xl uppercase tracking-wider shrink-0 transition-all shadow-md"
                  >
                    Encargar por WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Post Modal with DYNAMIC META-DESCRIPTION GENERATOR */}
        {isWriteModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center border border-orange-200">
                    <Sparkles className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">
                      Publicar Artículo con Generador de Meta-Description SEO
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Optimizado para posicionar petsimona25.cl en Google Chile y O&apos;Higgins
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsWriteModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-2 rounded-full cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {metaGenToast && (
                <div className="bg-orange-50 border-2 border-orange-300 text-orange-900 p-3 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in">
                  <Sparkles className="w-4 h-4 text-orange-600 shrink-0" />
                  <span>{metaGenToast}</span>
                </div>
              )}

              <form onSubmit={handleCreatePost} className="space-y-5 text-xs font-bold">
                {/* Title */}
                <div>
                  <label className="text-slate-700 uppercase block mb-1">Título del Artículo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Guía para medir perritos con lomo largo en Rengo"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-orange-500 rounded-xl p-3 text-slate-900 outline-hidden font-bold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-700 uppercase block mb-1">Categoría *</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full bg-slate-50 border-2 border-slate-200 focus:border-orange-500 rounded-xl p-3 text-slate-900 outline-hidden font-bold cursor-pointer"
                    >
                      <option value="Cuidado Canino">Cuidado Canino</option>
                      <option value="Moda Sostenible">Moda Sostenible</option>
                      <option value="Guía de Medidas">Guía de Medidas</option>
                      <option value="Historias petsimona25">Historias petsimona25</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-700 uppercase block mb-1">URL de Imagen (Opcional)</label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-200 focus:border-orange-500 rounded-xl p-3 text-slate-900 outline-hidden"
                    />
                  </div>
                </div>

                {/* Content */}
                <div>
                  <label className="text-slate-700 uppercase block mb-1">
                    Cuerpo del Artículo (Markdown soportado) *
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Escribe aquí los párrafos del artículo. El generador SEO analizará este texto para extraer automáticamente las mejores oraciones..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-orange-500 rounded-xl p-3 text-slate-900 outline-hidden font-mono"
                  />
                </div>

                {/* DYNAMIC META-DESCRIPTION GENERATOR PANEL */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-3xl border-2 border-orange-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-orange-200">
                    <div>
                      <div className="inline-flex items-center gap-1.5 text-orange-900 font-black text-xs uppercase">
                        <Sparkles className="w-4 h-4 text-orange-600" />
                        <span>Generador Automático de Meta-Description SEO (150 Caracteres)</span>
                      </div>
                      <p className="text-[11px] text-orange-700 font-medium">
                        Extrae y sintetiza el contenido del post en una meta-descripción de 150 caracteres lista para Google.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAutoGenerateMeta()}
                      className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                      <span>Generar 150 carac. ⚡</span>
                    </button>
                  </div>

                  {/* Preset Selector */}
                  <div>
                    <label className="text-orange-950 text-[11px] font-black uppercase block mb-1.5">
                      Enfoque del Algoritmo SEO:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'google-balanced', label: '🎯 Balanceado Google' },
                        { id: 'local-chile', label: '🇨🇱 Local Rengo / Chile' },
                        { id: 'eco-craft', label: '🌿 Telas & Sustentable' },
                        { id: 'guide-practical', label: '📐 Guía Práctica' },
                      ].map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => {
                            setSeoStyle(st.id as SEOStyleFocus);
                            handleAutoGenerateMeta(st.id as SEOStyleFocus);
                          }}
                          className={`p-2 rounded-xl text-[11px] font-bold text-center border transition-all cursor-pointer ${
                            seoStyle === st.id
                              ? 'bg-orange-600 text-white border-orange-700 shadow-xs'
                              : 'bg-white text-slate-700 border-orange-200 hover:bg-orange-100'
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Meta Description Textarea & Length Counter */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-slate-700 uppercase">
                        Meta-Description Resultante para Google (&lt;meta name=&quot;description&quot;&gt;)
                      </label>
                      <span
                        className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-full ${
                          newMetaDescription.length >= 135 && newMetaDescription.length <= 158
                            ? 'bg-emerald-100 text-emerald-800'
                            : newMetaDescription.length > 158
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {newMetaDescription.length} / 150 carac.{' '}
                        {newMetaDescription.length >= 135 && newMetaDescription.length <= 158
                          ? '✓ Óptimo (~150 carac.)'
                          : newMetaDescription.length > 158
                          ? '⚠️ Supera 150 carac.'
                          : '(Objetivo: ~150 caracteres)'}
                      </span>
                    </div>

                    <textarea
                      rows={2}
                      value={newMetaDescription}
                      onChange={(e) => setNewMetaDescription(e.target.value)}
                      placeholder="La meta-descripción generada de 150 caracteres aparecerá aquí..."
                      className="w-full bg-white border-2 border-orange-300 focus:border-orange-500 rounded-xl p-3 text-slate-900 outline-hidden font-medium text-xs shadow-inner"
                    />
                  </div>

                  {/* Real-Time Google SERP Snippet Preview */}
                  <div className="bg-white p-4 rounded-2xl border border-orange-200 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-1.5 text-slate-700 text-[11px] font-black">
                        <Globe className="w-3.5 h-3.5 text-blue-600" />
                        <span>Vista Previa en Resultados de Google (SERP)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setPreviewDevice('desktop')}
                          className={`p-1 rounded-md text-[10px] flex items-center gap-1 ${
                            previewDevice === 'desktop' ? 'bg-slate-200 text-slate-900' : 'text-slate-400'
                          }`}
                        >
                          <Monitor className="w-3 h-3" />
                          <span>Escritorio</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewDevice('mobile')}
                          className={`p-1 rounded-md text-[10px] flex items-center gap-1 ${
                            previewDevice === 'mobile' ? 'bg-slate-200 text-slate-900' : 'text-slate-400'
                          }`}
                        >
                          <Smartphone className="w-3 h-3" />
                          <span>Móvil</span>
                        </button>
                      </div>
                    </div>

                    <div className={`space-y-1 ${previewDevice === 'mobile' ? 'max-w-xs' : 'w-full'}`}>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                        <span className="w-4 h-4 rounded-full bg-orange-500 text-white flex items-center justify-center font-black text-[9px]">
                          p
                        </span>
                        <span className="font-bold">petsimona25.cl</span>
                        <span className="text-slate-400 truncate">
                          › blog › {newTitle ? newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'articulo-seo'}
                        </span>
                      </div>

                      <h5 className="text-sm font-bold text-blue-800 hover:underline line-clamp-1">
                        {newTitle || 'Título del Artículo en petsimona25.cl'} | Ropa Canina Rengo
                      </h5>

                      <p className="text-xs text-slate-600 leading-snug line-clamp-2">
                        <span className="text-slate-400 font-bold mr-1">
                          {new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })} —
                        </span>
                        {newMetaDescription ||
                          (newContent
                            ? generateDynamicMetaDescription({ title: newTitle, content: newContent })
                            : 'Vista previa del extracto y meta-descripción que Google indexará y mostrará a los usuarios en sus búsquedas.')}
                      </p>
                    </div>
                  </div>

                  {/* SEO Health Score and Diagnostics */}
                  <div className="bg-slate-900 text-white p-3.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${
                          liveSeoScore.score >= 80
                            ? 'bg-emerald-500 text-slate-950'
                            : liveSeoScore.score >= 60
                            ? 'bg-amber-400 text-slate-950'
                            : 'bg-rose-500 text-white'
                        }`}
                      >
                        {liveSeoScore.score}%
                      </div>
                      <div>
                        <span className="font-black block">{liveSeoScore.statusLabel}</span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {liveSeoScore.tips[0] || 'Snippet en excelentes condiciones para Google.'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-yellow-400 font-bold bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Schema BlogPosting Generado</span>
                    </div>
                  </div>
                </div>

                {/* Excerpt and Tags */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-slate-700 uppercase">Resumen Corto (Excerpt para Tarjeta)</label>
                      <button
                        type="button"
                        onClick={() => {
                          if (newContent.trim()) {
                            setNewExcerpt(generateDynamicExcerpt(newContent, 120));
                          }
                        }}
                        className="text-[10px] text-orange-600 hover:underline cursor-pointer"
                      >
                        ⚡ Extraer de contenido
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Breve frase explicativa para la tarjeta..."
                      value={newExcerpt}
                      onChange={(e) => setNewExcerpt(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-200 focus:border-orange-500 rounded-xl p-3 text-slate-900 outline-hidden font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 uppercase block mb-1">
                      Etiquetas SEO (separadas por comas)
                    </label>
                    <input
                      type="text"
                      placeholder="Yorkie, Rengo, Medidas, Sustentabilidad, Chile"
                      value={newTags}
                      onChange={(e) => setNewTags(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-200 focus:border-orange-500 rounded-xl p-3 text-slate-900 outline-hidden font-medium"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsWriteModalOpen(false)}
                    className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 uppercase cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black uppercase tracking-wider shadow-md cursor-pointer flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Publicar con Metadatos SEO</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Weekly AI Blog Automation Settings & Scheduler Modal */}
        <WeeklyBlogAutomationModal
          isOpen={isWeeklyAutoModalOpen}
          onClose={() => setIsWeeklyAutoModalOpen(false)}
          config={weeklyConfig}
          onSaveConfig={handleSaveWeeklyConfig}
          onPostGenerated={handleWeeklyPostGenerated}
        />
      </div>
    </section>
  );
};
