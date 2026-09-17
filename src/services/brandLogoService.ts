import logoYorkshire from '../assets/images/yorkshire_brand_logo_1789595172869.jpg';
import logoYorkieCrest from '../assets/images/yorkie_crest_badge_1789595215437.jpg';
import logoMain from '../assets/images/petsimona25_brand_logo_1787452418651.jpg';
import logoCrest from '../assets/images/petsimona25_crest_emblem_1787452431802.jpg';
import logoModern from '../assets/images/petsimona25_modern_monogram_1787452450173.jpg';

export interface BrandLogoOption {
  id: string;
  name: string;
  subtitle: string;
  src: string;
  description: string;
  tag: string;
}

export const BRAND_LOGOS: BrandLogoOption[] = [
  {
    id: 'yorkshire_haute_couture',
    name: 'Yorkshire Atelier Couture (Oficial)',
    subtitle: 'Silueta Yorkshire Terrier & Aguja Dorada',
    src: logoYorkshire,
    description: 'Logotipo insignia oficial con silueta de Yorkshire Terrier, hilo de oro artesanal y cálidos tonos terracota y ámbar de Rengo.',
    tag: 'Recomendado Oficial 🐾',
  },
  {
    id: 'yorkshire_royal_crest',
    name: 'Emblema Real Yorkshire & Sastrería',
    subtitle: 'Retrato Yorkshire, Laurel & Tijeras Vintage',
    src: logoYorkieCrest,
    description: 'Medallón artesanal de alta costura con retrato de Yorkshire Terrier enmarcado en laureles y herramientas de confección a medida.',
    tag: 'Edición Imperial Yorkie',
  },
  {
    id: 'haute_couture_whippet',
    name: 'Atelier Galgo & Salchicha Clásico',
    subtitle: 'Silueta Galgo Italiano & Aguja Dorada',
    src: logoMain,
    description: 'Diseño insignia con silueta estilizada de galgo italiano, detalles en hilo dorado y tonos terracota cálidos.',
    tag: 'Especial Galgos & Salchichas',
  },
  {
    id: 'crest_artisan_rengo',
    name: 'Emblema Crest Rengo Classic',
    subtitle: 'Corona de Laureles & Tijeras de Sastre',
    src: logoCrest,
    description: 'Estilo medallón de alta costura tradicional con laureles dorados y detalles de confección a mano.',
    tag: 'Herencia Artesanal',
  },
  {
    id: 'geometric_monogram',
    name: 'Monograma Geométrico Joya',
    subtitle: 'Marco Hexagonal & Botonería de Lujo',
    src: logoModern,
    description: 'Estilo moderno contemporáneo con marco de joyería, tonos cobrizos y líneas limpias.',
    tag: 'Minimalista Urbano',
  },
];

const STORAGE_ACTIVE_LOGO_KEY = 'petsimona25_active_logo_id';
export const BRAND_LOGO_CHANGED_EVENT = 'petsimona25_brand_logo_changed';

export function getActiveBrandLogo(): BrandLogoOption {
  if (typeof window === 'undefined') return BRAND_LOGOS[0];
  try {
    const savedId = localStorage.getItem(STORAGE_ACTIVE_LOGO_KEY);
    if (savedId) {
      const match = BRAND_LOGOS.find((l) => l.id === savedId);
      if (match) return match;
    }
  } catch (e) {
    console.error('Error reading active logo:', e);
  }
  return BRAND_LOGOS[0];
}

export function setActiveBrandLogo(logoId: string): BrandLogoOption {
  const match = BRAND_LOGOS.find((l) => l.id === logoId) || BRAND_LOGOS[0];
  try {
    localStorage.setItem(STORAGE_ACTIVE_LOGO_KEY, match.id);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(BRAND_LOGO_CHANGED_EVENT, { detail: match }));
    }
  } catch (e) {
    console.error('Error saving active logo:', e);
  }
  return match;
}
