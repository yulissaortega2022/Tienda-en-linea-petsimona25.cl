import { BlogPost, WeeklyBlogAutomationConfig, WeeklyEditorialPillar } from '../types';
import { generate150CharSEOMetaDescription } from '../utils/seoMetaGenerator';
import { sendWebPushNotification } from './pushNotificationService';

export const EDITORIAL_PILLARS: WeeklyEditorialPillar[] = [
  {
    id: 'pillar-1',
    title: 'Guía de Medidas y Ergonomía Anatómica',
    category: 'Guía de Medidas',
    description: 'Enfoque en cómo medir tórax profundo, cuellos anchos y lomos largos en razas como Yorkies, Chihuahuas, Salchichas y Bulldogs.',
    icon: '📏',
    sampleTopics: [
      'Cómo medir el pecho profundo de un Teckel sin que el abrigo le roce las axilas',
      'Por qué la ropa comercial estándar aprieta el cuello de los Chihuahuas y Poodles',
      'El secreto de los 2 dedos de holgura: Guía de confección ergonómica en Rengo',
      'Guía visual: 3 medidas infalibles antes de encargar ropa artesanal a la medida'
    ]
  },
  {
    id: 'pillar-2',
    title: 'Moda Sostenible, Upcycling y Telas Hipoalergénicas',
    category: 'Moda Sostenible',
    description: 'Textiles rescatados de primera selección, forros que previenen dermatitis, estática y nudos en pelajes sensibles.',
    icon: '🌿',
    sampleTopics: [
      'Upcycling textil en Rengo: Cómo transformamos telas de alta gama en abrigos únicos',
      'Telas hipoalergénicas vs sintéticos baratos: Protegiendo la piel sensible de tu Yorkie',
      'El impacto ambiental de la moda canina masiva y por qué elegir confección chilena artesanal',
      'Polares térmicos respirables: Cómo abrigar a tu perrito sin provocar sobrecalentamiento'
    ]
  },
  {
    id: 'pillar-3',
    title: 'Cuidado Canino, Clima y Protección Estacional',
    category: 'Cuidado Canino',
    description: 'Protección contra el frío y la lluvia en la zona central/sur de Chile, paseos invernales seguros y bienestar general.',
    icon: '🌦️',
    sampleTopics: [
      'Invierno en la Región de O\'Higgins: Cómo proteger el pecho de tu mascota de la humedad',
      'Impermeables con forro térmico: Por qué son indispensables para paseos matutinos con niebla',
      'Cuidado de almohadillas y pecho tras paseos con lluvia: Consejos del taller petsimona25',
      'Cuándo abrigar a un perro senior o cachorro: Guía veterinaria y de corte artesanal'
    ]
  },
  {
    id: 'pillar-4',
    title: 'Historias petsimona25 y Vínculo con el Tutor',
    category: 'Historias petsimona25',
    description: 'La historia de Simona, confección con amor de una educadora diferencial y testimonios de tutores felices.',
    icon: '🐾',
    sampleTopics: [
      'De Maipú a Rengo: La historia de una educadora diferencial que vistió a su Yorkie Simona',
      'Historias de Taller: El perrito mestizo que por primera vez encontró un abrigo a su medida',
      'Costura con propósito: El valor de una prenda hecha a mano con dedicación y paciencia',
      'Simona cumple años: La inspiración detrás de cada diseño exclusivo de petsimona25.cl'
    ]
  }
];

export const DEFAULT_WEEKLY_CONFIG: WeeklyBlogAutomationConfig = {
  enabled: true,
  dayOfWeek: 1, // Lunes
  publishTime: '09:00',
  autoPublish: true,
  autoNotification: true,
  targetPillar: 'rotativo',
  nextScheduledDate: calculateNextScheduledDate(1, '09:00'),
  totalAiGeneratedCount: 2,
  currentPillarIndex: 0,
  history: [
    {
      id: 'ai-hist-1',
      title: 'Consejos para Proteger el Tórax en Razas de Pecho Ancho con Confección a la Medida',
      date: '17 de Agosto, 2026',
      category: 'Guía de Medidas',
      editorialPillar: 'Guía de Medidas y Ergonomía Anatómica',
      seoScore: 98,
      autoPublished: true,
      metaDescriptionLength: 149
    },
    {
      id: 'ai-hist-2',
      title: 'Telas Hipoalergénicas y Upcycling Textil en el Taller de Rengo',
      date: '10 de Agosto, 2026',
      category: 'Moda Sostenible',
      editorialPillar: 'Moda Sostenible, Upcycling y Telas Hipoalergénicas',
      seoScore: 96,
      autoPublished: true,
      metaDescriptionLength: 150
    }
  ]
};

/**
 * Calcula la próxima fecha ISO para el día de la semana y hora indicada
 */
export function calculateNextScheduledDate(dayOfWeek: number, timeStr: string): string {
  const now = new Date();
  const [hours, minutes] = timeStr.split(':').map(Number);
  const result = new Date(now);

  result.setHours(hours || 9, minutes || 0, 0, 0);

  const currentDay = now.getDay();
  let daysUntil = (dayOfWeek - currentDay + 7) % 7;

  // Si es hoy pero la hora ya pasó, programar para la próxima semana
  if (daysUntil === 0 && now.getTime() >= result.getTime()) {
    daysUntil = 7;
  }

  result.setDate(result.getDate() + daysUntil);
  return result.toISOString();
}

/**
 * Obtener configuración semanal guardada o inicial
 */
export function getWeeklyBlogConfig(): WeeklyBlogAutomationConfig {
  const saved = localStorage.getItem('petsimona25_weekly_blog_config');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // Fallback
    }
  }
  return DEFAULT_WEEKLY_CONFIG;
}

/**
 * Guardar configuración semanal
 */
export function saveWeeklyBlogConfig(config: WeeklyBlogAutomationConfig): void {
  localStorage.setItem('petsimona25_weekly_blog_config', JSON.stringify(config));
}

/**
 * Generar un artículo semanal con IA a través del backend o fallback inteligente
 */
export async function generateWeeklyBlogPostWithAI(options?: {
  topic?: string;
  category?: string;
  forcePillarIndex?: number;
}): Promise<{ post: BlogPost; pillar: WeeklyEditorialPillar }> {
  const config = getWeeklyBlogConfig();
  const pillarIdx = options?.forcePillarIndex !== undefined 
    ? options.forcePillarIndex 
    : (config.currentPillarIndex % EDITORIAL_PILLARS.length);
  
  const currentPillar = EDITORIAL_PILLARS[pillarIdx];
  const chosenTopic = options?.topic || currentPillar.sampleTopics[Math.floor(Math.random() * currentPillar.sampleTopics.length)];
  const chosenCategory = options?.category || currentPillar.category;

  try {
    const response = await fetch('/api/ai/generate-weekly-blog-post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: chosenTopic,
        category: chosenCategory,
        pillarTitle: currentPillar.title,
        pillarId: currentPillar.id,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.success && data.post) {
        // Asegurar que tenga metaDescription de 150 caracteres
        if (!data.post.metaDescription || data.post.metaDescription.length < 130) {
          data.post.metaDescription = generate150CharSEOMetaDescription(data.post.content, data.post.title, 150);
        }
        
        // Actualizar configuración
        updateConfigAfterGeneration(config, data.post, currentPillar);
        
        // Si tiene activadas las notificaciones, emitir notificación push
        if (config.autoNotification) {
          sendWebPushNotification({
            title: `📰 Nuevo Artículo Semanal IA: ${data.post.title}`,
            body: data.post.metaDescription || data.post.excerpt,
            category: 'sistema',
            linkUrl: `https://petsimona25.cl/#blog-${data.post.id}`,
            actionLabel: 'Leer Artículo',
          });
        }

        return { post: data.post, pillar: currentPillar };
      }
    }
  } catch (err) {
    console.warn('API generate-weekly-blog-post call failed, running intelligent fallback:', err);
  }

  // Fallback inteligente offline
  const fallbackPost = generateOfflineWeeklyPost(chosenTopic, chosenCategory, currentPillar);
  updateConfigAfterGeneration(config, fallbackPost, currentPillar);

  if (config.autoNotification) {
    sendWebPushNotification({
      title: `📰 Nuevo Artículo Semanal IA: ${fallbackPost.title}`,
      body: fallbackPost.metaDescription,
      category: 'sistema',
      linkUrl: `https://petsimona25.cl/#blog-${fallbackPost.id}`,
      actionLabel: 'Leer Artículo',
    });
  }

  return { post: fallbackPost, pillar: currentPillar };
}

function updateConfigAfterGeneration(
  config: WeeklyBlogAutomationConfig,
  post: BlogPost,
  pillar: WeeklyEditorialPillar
) {
  const updatedConfig: WeeklyBlogAutomationConfig = {
    ...config,
    lastGeneratedDate: new Date().toISOString(),
    nextScheduledDate: calculateNextScheduledDate(config.dayOfWeek, config.publishTime),
    totalAiGeneratedCount: (config.totalAiGeneratedCount || 0) + 1,
    currentPillarIndex: (config.currentPillarIndex + 1) % EDITORIAL_PILLARS.length,
    history: [
      {
        id: `ai-hist-${Date.now()}`,
        title: post.title,
        date: post.date,
        category: post.category,
        editorialPillar: pillar.title,
        seoScore: post.seoScore || 95,
        autoPublished: true,
        metaDescriptionLength: (post.metaDescription || '').length,
      },
      ...(config.history || []).slice(0, 19)
    ]
  };

  saveWeeklyBlogConfig(updatedConfig);
}

function generateOfflineWeeklyPost(
  topic: string,
  category: string,
  pillar: WeeklyEditorialPillar
): BlogPost {
  const dateStr = new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });
  const id = `ai-week-${Date.now()}`;
  const slug = topic
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  const imagesMap: Record<string, string> = {
    'Guía de Medidas': 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800',
    'Moda Sostenible': 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=800',
    'Cuidado Canino': 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&q=80&w=800',
    'Historias petsimona25': 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=800'
  };

  const content = `En el taller artesanal de **petsimona25.cl** en Rengo, Región de O'Higgins, dedicamos cada semana a perfeccionar la confección a la medida y el bienestar de perros y gatos pequeños en Chile.

### ${topic}

La anatomía de perros pequeños como Yorkshires, Chihuahuas, Poodles y Teckels requiere un corte diferenciado. La ropa comercial genérica suele quedar desproporcionada: holgada en el cuello o excesivamente ajustada en el tórax, lo cual causa incomodidad al caminar.

### Puntos Clave de Bienestar:
1. **Ergonomía Total:** El patrón debe respetar la amplitud de movimiento en las patas delanteras para prevenir rozaduras en las axilas.
2. **Textiles Hipoalergénicos:** Seleccionamos telas suaves y respirables que cuidan la dermis y evitan enredos en razas de pelaje largo.
3. **Aislamiento Térmico Eficiente:** Forros polares de alta densidad combinados con capas externas resistentes al viento y la humedad invernal.

### Confección Local con Propósito desde Rengo
Cada prenda se elabora a mano con pasión y exactitud milimétrica. Recuerda revisar nuestra **Guía Interactiva de Medidas** para tomar el contorno de cuello, pecho y largo de lomo antes de encargar la ropa de tu regalón.`;

  const metaDescription = generate150CharSEOMetaDescription(content, topic, 150);

  return {
    id,
    title: topic,
    slug,
    category: category as any,
    author: 'Constanza S. & IA Editorial petsimona25',
    date: dateStr,
    readTime: '4 min de lectura',
    imageUrl: imagesMap[category] || imagesMap['Guía de Medidas'],
    tags: ['IA Semanal', 'Ropa a la Medida', 'Taller Rengo', 'Cuidado Mascotas', 'petsimona25.cl'],
    excerpt: `Consejos prácticos sobre ${topic.toLowerCase()} y confección de ropa a la medida desde el taller de petsimona25.cl en Rengo.`,
    content,
    metaDescription,
    seoScore: 97,
    isAiGenerated: true,
    editorialPillar: pillar.title,
    generatedAt: new Date().toISOString(),
  };
}
