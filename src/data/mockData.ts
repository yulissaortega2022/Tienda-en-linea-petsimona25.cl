import { Product, Review, PaymentCredentials } from '../types';
import yorkieHeroImg from '../assets/images/yorkie_hero_photo_1789595183926.jpg';
import salchichaImg from '../assets/images/salchicha_dog_photo_1789595194154.jpg';
import galgoImg from '../assets/images/capa_galgo_photo_1789595596453.jpg';
import chihuahuaImg from '../assets/images/chihuahua_dog_photo_1789595573607.jpg';
import foxTerrierImg from '../assets/images/fox_terrier_dog_photo_1789595584977.jpg';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Suéter Artesanal "Yorkshire & Perros Pequeños"',
    category: 'abrigos',
    price: 26900,
    description: 'Suéter tejido artesanalmente a la medida para Yorkshire Terriers y perros pequeños. Forro interior de seda anti-estática para proteger su manto sedoso, cuello suave que no presiona la tráquea y ojal para arnés.',
    imageUrl: yorkieHeroImg,
    sizes: ['XXS (Yorkie Mini / 1.5 - 2.5 kg)', 'XS (Yorkie Estándar / 2.5 - 3.5 kg)', 'S (Perro Chico)', 'A la Medida'],
    inStock: true,
    stock: 14,
    rating: 5.0,
    reviewCount: 52,
    isCustomizable: true,
    isNew: true
  },
  {
    id: 'prod-2',
    name: 'Chaleco Micro-Fit "Chihuahua & Razas Toy"',
    category: 'abrigos',
    price: 24900,
    description: 'Confección ultraliviana para Chihuahuas y perros toy extremadamente sensibles al frío. Broches planos de peso pluma, cuello abierto anti-asfixia y tela polar térmica hipoalergénica.',
    imageUrl: chihuahuaImg,
    sizes: ['Micro (1.0 - 1.8 kg)', 'XXS Toy (1.8 - 2.8 kg)', 'XS Chico', 'A la Medida'],
    inStock: true,
    stock: 16,
    rating: 5.0,
    reviewCount: 44,
    isCustomizable: true,
    isNew: true
  },
  {
    id: 'prod-3',
    name: 'Chaqueta Todoterreno "Fox Terrier Active"',
    category: 'impermeables',
    price: 27900,
    description: 'Diseño ergonómico reforzado para Fox Terriers Chilenos y Wire Fox Terriers. Excelente libertad en hombros para saltar y correr, pechera impermeable y reflectante de alta visibilidad.',
    imageUrl: foxTerrierImg,
    sizes: ['S (Fox Terrier Juvenil / 5-7 kg)', 'M (Fox Terrier Adulto / 7-9 kg)', 'A la Medida'],
    inStock: true,
    stock: 12,
    rating: 5.0,
    reviewCount: 39,
    isCustomizable: true,
    isNew: true
  },
  {
    id: 'prod-4',
    name: 'Capa Térmica e Impermeable para Perros Galgos',
    category: 'abrigos',
    price: 29900,
    description: 'Capa de alta costura a la medida para Galgos, Galgos Italianos y Whippets. Silueta curva en arco lumbar para su espalda, pechera profunda para tórax en quilla y cuello cisne plegable térmico.',
    imageUrl: galgoImg,
    sizes: ['XS (Galgo Italiano Mini)', 'S (Galgo Italiano 4-7 kg)', 'M (Whippet)', 'L (Galgo Español)', 'A la Medida'],
    inStock: true,
    stock: 9,
    rating: 5.0,
    reviewCount: 48,
    isCustomizable: true,
    isNew: true
  },
  {
    id: 'prod-5',
    name: 'Chaqueta Lomo Extendido "Salchicha Pro-Fit"',
    category: 'impermeables',
    price: 27900,
    description: 'Diseño anatómico con corte longitudinal alargado para Teckels y Perros Salchichas. Ventral alto anti-arrastre que protege el lomo completo sin mojarse ni ensuciarse con el suelo al caminar.',
    imageUrl: salchichaImg,
    sizes: ['XS Salchicha Mini (Lomo 36-42 cm)', 'S Salchicha Estándar (Lomo 42-48 cm)', 'M Salchicha Robusto', 'A la Medida'],
    inStock: true,
    stock: 11,
    rating: 5.0,
    reviewCount: 46,
    isCustomizable: true,
    isNew: true
  },
  {
    id: 'prod-6',
    name: 'Impermeable Térmico "Simona Shield"',
    category: 'impermeables',
    price: 24900,
    description: 'Chaqueta impermeable confeccionada con telas reutilizables y forro térmico suave, tiras reflectivas nocturnas y ojal para arnés. Ideal para perros chicos y medianos.',
    imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800',
    sizes: ['XXS (Mascota Mini)', 'XS (Perro Chico)', 'S', 'M', 'L', 'A la Medida'],
    inStock: true,
    stock: 12,
    rating: 5.0,
    reviewCount: 48,
    isCustomizable: true
  },
  {
    id: 'prod-7',
    name: 'Vestido de Gala "Princesa petsimona25"',
    category: 'vestidos',
    price: 32900,
    description: 'Confección artesanal eco-sustentable con falda plisada y moño suave de encaje reutilizado. Diseñado para perritas chicas y medianas.',
    imageUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80&w=800',
    sizes: ['XXS (Mascota Mini)', 'XS (Perro Chico)', 'S', 'M', 'L', 'A la Medida'],
    inStock: true,
    stock: 5,
    rating: 5.0,
    reviewCount: 27,
    isCustomizable: true
  },
  {
    id: 'prod-8',
    name: 'Bandana & Coqueta Moña #petsimona25',
    category: 'accesorios',
    price: 8900,
    description: 'Bandana eco-amigable y moñita coqueta para la cabeza o cuello de tu mascota, con su nombre bordado a mano en nuestro taller de Rengo.',
    imageUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800',
    sizes: ['XXS / XS (Ajustable)', 'S / M (Mediano)', 'A la Medida'],
    inStock: true,
    stock: 20,
    rating: 5.0,
    reviewCount: 61,
    isCustomizable: true,
    isNew: true
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    petName: 'Milo',
    breed: 'Yorkshire Terrier (2.4 kg)',
    ownerName: 'Camila Valenzuela (Rancagua)',
    rating: 5,
    comment: '¡El suéter para mi Yorkie Milo es una maravilla! Es tan pequeñito que todo le quedaba enorme y le arrastraba. En petsimona25 le hicieron el calce justo y la seda interna evita que se le hagan nudos en su pelaje largo. #petsimona25',
    date: '2026-08-12',
    photoUrl: yorkieHeroImg,
    verified: true,
    productName: 'Suéter Artesanal "Yorkshire & Perros Pequeños"'
  },
  {
    id: 'rev-2',
    petName: 'Max',
    breed: 'Teckel / Perro Salchicha',
    ownerName: 'Matías Orellana (Santiago)',
    rating: 5,
    comment: 'Los dueños de perros salchichas sabemos lo difícil que es encontrar ropa que cubra toda la columna sin que la panza roce el piso. Este impermeable le quedó perfecto a Max de largo y de pecho. ¡Envío rápido por Blue Express!',
    date: '2026-08-10',
    photoUrl: salchichaImg,
    verified: true,
    productName: 'Chaqueta Lomo Extendido "Salchicha Pro-Fit"'
  },
  {
    id: 'rev-3',
    petName: 'Luna',
    breed: 'Galgo Italiano & Galgo Español',
    ownerName: 'Francisca Lagos (Rengo)',
    rating: 5,
    comment: 'Mi galguita Luna sufre mucho con el frío de la zona central por tener tan poca grasa corporal y el pecho tan hondo. La capa con cuello cisne es abrigada, suave y no le molesta para correr. ¡Un trabajo de alta costura!',
    date: '2026-08-07',
    photoUrl: galgoImg,
    verified: true,
    productName: 'Capa Térmica e Impermeable para Perros Galgos'
  },
  {
    id: 'rev-4',
    petName: 'Tito',
    breed: 'Chihuahua (1.7 kg)',
    ownerName: 'Sofía Morales (Santiago)',
    rating: 5,
    comment: '¡Por fin una prenda que no ahoga el cuello de mi chihuahua! Es tan diminuto que todo le quedaba enorme. El chaleco micro-fit es suave, abrigado y los broches planos no le pesan nada.',
    date: '2026-08-06',
    photoUrl: chihuahuaImg,
    verified: true,
    productName: 'Chaleco Micro-Fit "Chihuahua & Razas Toy"'
  },
  {
    id: 'rev-5',
    petName: 'Cholo',
    breed: 'Fox Terrier Chileno (7.2 kg)',
    ownerName: 'Rodrigo Peña (Rancagua)',
    rating: 5,
    comment: 'Excelente chaqueta todoterreno para mi Fox Terrier. Salta, corre y no se le corre la tela ni le raspa las patas. Las costuras son súper firmes y los reflectantes de noche se ven a kilómetros.',
    date: '2026-08-04',
    photoUrl: foxTerrierImg,
    verified: true,
    productName: 'Chaqueta Todoterreno "Fox Terrier Active"'
  },
  {
    id: 'rev-6',
    petName: 'Simona',
    breed: 'Poodle Toy / Mestiza Chica',
    ownerName: 'Constanza Silva (Rengo)',
    rating: 5,
    comment: '¡Mi perrita Simona quedó preciosa! Al ser tan pequeñita y tener el pecho angosto, la ropa común le bailaba. En petsimona25 le hicieron un vestido a la medida exacta con telas ecológicas. ¡Orgullo maipucino en Rengo! #petsimona25',
    date: '2026-08-05',
    photoUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80&w=400',
    verified: true,
    productName: 'Vestido de Gala "Princesa petsimona25"'
  }
];

export interface AdminOrder {
  id: string;
  orderNumber: string;
  date: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  commune: string;
  courierName: string;
  paymentMethod: string;
  grandTotal: number;
  itemsSummary: string;
  petName?: string;
  petBreed?: string;
  neckSizeCm?: number;
  chestSizeCm?: number;
  backSizeCm?: number;
  specialNotes?: string;
  status: 'Pendiente Corte' | 'En Confección' | 'Listo Envíos' | 'Despachado' | 'En Tránsito' | 'En Reparto a Destino' | 'Entregado';
  trackingNumber?: string;
  trackingCourier?: string;
  trackingUrl?: string;
  dispatchedDate?: string;
  estimatedDelivery?: string;
}

export const INITIAL_ORDERS: AdminOrder[] = [
  {
    id: 'ord-101',
    orderNumber: 'PS25-784102',
    date: '2026-08-10',
    customerName: 'Constanza Silva',
    customerEmail: 'constanza@petsimona25.cl',
    customerPhone: '+56972374764',
    shippingAddress: 'Sector Los Silos s/n',
    commune: 'Rengo',
    courierName: 'Retiro en Taller (Los Silos)',
    paymentMethod: 'Mercado Pago',
    grandTotal: 24900,
    itemsSummary: '1x Impermeable Térmico "Simona Shield" (A la Medida)',
    petName: 'Simona',
    petBreed: 'Yorkshire Terrier / Poodle Toy',
    neckSizeCm: 22,
    chestSizeCm: 34,
    backSizeCm: 28,
    specialNotes: 'Sensibilidad en la piel del pecho. Usar forro de algodón suave e hilos hipoalergénicos reutilizados.',
    status: 'En Confección',
    trackingNumber: 'RET-RENGO-784102',
    trackingCourier: 'Retiro en Taller (Los Silos)',
    estimatedDelivery: '2026-08-14'
  },
  {
    id: 'ord-102',
    orderNumber: 'PS25-829104',
    date: '2026-08-09',
    customerName: 'Camila Moreno',
    customerEmail: 'camila.m@gmail.com',
    customerPhone: '+56981234567',
    shippingAddress: 'Av. Brasil 450, Dpto 302',
    commune: 'Rancagua',
    courierName: 'Starken (A Domicilio)',
    paymentMethod: 'PayPal',
    grandTotal: 28900,
    itemsSummary: '1x Abrigo Elegante "petsimona25 Royalty" (XS - Perro Chico)',
    petName: 'Bella',
    petBreed: 'Chihuahua Mini',
    neckSizeCm: 19,
    chestSizeCm: 29,
    backSizeCm: 24,
    specialNotes: 'Perra muy pequeña de 1.8 kg. Agregar broche de seguridad para arnés.',
    status: 'Pendiente Corte',
    trackingNumber: 'SK-98312048',
    trackingCourier: 'Starken',
    trackingUrl: 'https://www.starken.cl/seguimiento?orden=SK-98312048',
    estimatedDelivery: '2026-08-15'
  },
  {
    id: 'ord-103',
    orderNumber: 'PS25-910245',
    date: '2026-08-08',
    customerName: 'Andrea Beltrán',
    customerEmail: 'andrea.beltran@yahoo.cl',
    customerPhone: '+56992384712',
    shippingAddress: 'Calle El Roble 1284',
    commune: 'Rosario (Rengo)',
    courierName: 'Blue Express (Retiro Punto)',
    paymentMethod: 'Mercado Pago',
    grandTotal: 47800,
    itemsSummary: '1x Vestido de Gala "Princesa", 1x Bandana & Coqueta Moña',
    petName: 'Sofi',
    petBreed: 'Poodle Toy',
    neckSizeCm: 24,
    chestSizeCm: 38,
    backSizeCm: 32,
    specialNotes: 'Promoción Envío GRATIS aplicada. Bordar inicial "S" en la moñita.',
    status: 'Listo Envíos',
    trackingNumber: 'BX-748920194',
    trackingCourier: 'Blue Express',
    trackingUrl: 'https://www.blue.cl/seguimiento/?tracking=BX-748920194',
    dispatchedDate: '2026-08-11',
    estimatedDelivery: '2026-08-13'
  },
  {
    id: 'ord-104',
    orderNumber: 'PS25-632011',
    date: '2026-08-06',
    customerName: 'Matías Orellana',
    customerEmail: 'matias.o@gmail.com',
    customerPhone: '+56977123904',
    shippingAddress: 'Av. Las Heras 890',
    commune: 'Santiago Centro',
    courierName: 'Chilexpress (A Domicilio)',
    paymentMethod: 'Mercado Pago',
    grandTotal: 18900,
    itemsSummary: '1x Pijama Algodón "Sueños Caninos" (Medida Especial Salchicha)',
    petName: 'Milo',
    petBreed: 'Teckel / Perro Salchicha',
    neckSizeCm: 26,
    chestSizeCm: 42,
    backSizeCm: 45,
    specialNotes: 'Cuerpo extralargo de salchicha. Dejar holgura de 3 cm en lomo.',
    status: 'Despachado',
    trackingNumber: 'CX-918230192',
    trackingCourier: 'Chilexpress',
    trackingUrl: 'https://www.chilexpress.cl/seguimiento-envios?numero=CX-918230192',
    dispatchedDate: '2026-08-08',
    estimatedDelivery: '2026-08-10'
  }
];

export const COURIER_OFFICIAL_LINKS = {
  'Blue Express': (code: string) => `https://www.blue.cl/seguimiento/?tracking=${encodeURIComponent(code)}`,
  'Chilexpress': (code: string) => `https://www.chilexpress.cl/seguimiento-envios?numero=${encodeURIComponent(code)}`,
  'Starken': (code: string) => `https://www.starken.cl/seguimiento?orden=${encodeURIComponent(code)}`,
  'Correos de Chile': (code: string) => `https://www.correos.cl/seguimiento-en-linea?envio=${encodeURIComponent(code)}`,
  'Retiro en Taller (Los Silos)': () => 'https://wa.me/56972374764?text=Hola%20Constanza,%20consulto%20por%20retiro%20en%20taller%20Los%20Silos'
};

export function generateTrackingCode(courier: string, orderNumber: string): string {
  const cleanCourier = courier.toLowerCase();
  const digits = orderNumber.replace(/\D/g, '') || Math.floor(100000 + Math.random() * 900000).toString();
  if (cleanCourier.includes('blue')) return `BX-${digits}${Math.floor(100 + Math.random() * 900)}`;
  if (cleanCourier.includes('chile')) return `CX-${digits}${Math.floor(100 + Math.random() * 900)}`;
  if (cleanCourier.includes('starken')) return `SK-${digits}${Math.floor(10 + Math.random() * 90)}`;
  if (cleanCourier.includes('correo')) return `CC-${digits}${Math.floor(100 + Math.random() * 900)}`;
  return `RET-RENGO-${digits}`;
}


export const DEFAULT_PAYMENT_CREDENTIALS: PaymentCredentials = {
  accountName: 'petsimona25',
  mercadoPagoPublicKey: '',
  mercadoPagoAccessToken: '',
  paypalClientId: 'AXpetsimona25_PayPal_Client_ID_Production_Verified',
  paypalMode: 'live',
  currency: 'CLP'
};

export const COMMON_BREEDS = [
  'Yorkshire Terrier / Yorkie',
  'Chihuahua',
  'Fox Terrier (Chileno & Wire)',
  'Galgo / Galgo Italiano / Whippet',
  'Teckel / Perro Salchicha',
  'Perro Pequeño / Toy / Mini',
  'Poodle / Caniche Toy / Mini',
  'Pug / Carlino',
  'Bulldog Francés',
  'Bichón Maltés',
  'Pomerania',
  'Shih Tzu',
  'Schnauzer Mini',
  'Boston Terrier',
  'Beagle',
  'Mestizo Chico / Mediano',
  'Gato Persa / Siamés / Mestizo',
  'Otra Raza (Especificar)'
];


