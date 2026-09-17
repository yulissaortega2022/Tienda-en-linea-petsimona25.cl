import { NewsletterSubscriber } from '../types';

const STORAGE_KEY = 'petsimona25_newsletter_subscribers';

export const INITIAL_SUBSCRIBERS: NewsletterSubscriber[] = [
  {
    id: 'sub-001',
    email: 'valentina.perez@gmail.com',
    name: 'Valentina Pérez',
    petName: 'Toby',
    breed: 'Poodle Toy',
    city: 'Rancagua',
    subscribedAt: '2026-08-19T14:30:00.000Z',
    discountCode: 'SIMONA15-7721',
    plan: 'newsletter_vip',
    source: 'web_form',
  },
  {
    id: 'sub-002',
    email: 'gonzalo.munoz@yahoo.cl',
    name: 'Gonzalo Muñoz',
    petName: 'Luna',
    breed: 'Yorkshire Terrier',
    city: 'Santiago',
    subscribedAt: '2026-08-19T11:15:00.000Z',
    discountCode: 'SIMONA15-4419',
    plan: 'newsletter_vip',
    source: 'web_form',
  },
  {
    id: 'sub-003',
    email: 'fernanda.rengo@hotmail.com',
    name: 'Fernanda Rojas',
    petName: 'Coco',
    breed: 'Teckel / Salchicha',
    city: 'Rengo',
    subscribedAt: '2026-08-18T18:45:00.000Z',
    discountCode: 'SIMONA15-8832',
    plan: 'monthly_box',
    source: 'web_form',
  },
  {
    id: 'sub-004',
    email: 'felipe.silva.vet@gmail.com',
    name: 'Felipe Silva',
    petName: 'Max',
    breed: 'Bulldog Francés',
    city: 'Viña del Mar',
    subscribedAt: '2026-08-18T09:20:00.000Z',
    discountCode: 'SIMONA15-2190',
    plan: 'newsletter_vip',
    source: 'web_form',
  },
  {
    id: 'sub-005',
    email: 'camila.tapia@outlook.com',
    name: 'Camila Tapia',
    petName: 'Bella',
    breed: 'Bichón Maltés',
    city: 'Concepción',
    subscribedAt: '2026-08-17T16:10:00.000Z',
    discountCode: 'SIMONA15-9943',
    plan: 'newsletter_vip',
    source: 'web_form',
  },
  {
    id: 'sub-006',
    email: 'matias.lagos@gmail.com',
    name: 'Matías Lagos',
    petName: 'Simón',
    breed: 'Mestizo rescatado',
    city: 'La Serena',
    subscribedAt: '2026-08-16T20:05:00.000Z',
    discountCode: 'SIMONA15-1088',
    plan: 'monthly_box',
    source: 'web_form',
  },
];

/**
 * Retrieves all subscribers from localStorage. If none exist, initializes with default seed list.
 */
export function getStoredSubscribers(): NewsletterSubscriber[] {
  if (typeof window === 'undefined') return INITIAL_SUBSCRIBERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SUBSCRIBERS));
      return INITIAL_SUBSCRIBERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SUBSCRIBERS));
    return INITIAL_SUBSCRIBERS;
  } catch (err) {
    console.error('Error reading subscribers from localStorage:', err);
    return INITIAL_SUBSCRIBERS;
  }
}

/**
 * Saves a new subscriber to localStorage (or updates existing if email matches)
 */
export function saveSubscriber(
  data: Omit<NewsletterSubscriber, 'id' | 'subscribedAt'> & { id?: string; subscribedAt?: string }
): { subscriber: NewsletterSubscriber; isNew: boolean; total: number } {
  const currentList = getStoredSubscribers();
  const cleanEmail = data.email.trim().toLowerCase();

  const existingIndex = currentList.findIndex(
    (s) => s.email.trim().toLowerCase() === cleanEmail
  );

  const discountCode =
    data.discountCode || `SIMONA15-${Math.floor(1000 + Math.random() * 9000)}`;

  let savedSubscriber: NewsletterSubscriber;
  let isNew = false;

  if (existingIndex !== -1) {
    // Update existing
    savedSubscriber = {
      ...currentList[existingIndex],
      name: data.name || currentList[existingIndex].name,
      petName: data.petName || currentList[existingIndex].petName,
      breed: data.breed || currentList[existingIndex].breed,
      city: data.city || currentList[existingIndex].city,
      plan: data.plan || currentList[existingIndex].plan,
      discountCode: currentList[existingIndex].discountCode || discountCode,
      source: data.source || currentList[existingIndex].source || 'web_form',
    };
    currentList[existingIndex] = savedSubscriber;
  } else {
    // Insert new
    isNew = true;
    savedSubscriber = {
      id: data.id || `sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      email: cleanEmail,
      name: data.name?.trim() || 'Tutor Pet Lover',
      petName: data.petName?.trim() || 'Mascota Consentida',
      breed: data.breed?.trim() || 'Perro / Gato',
      city: data.city?.trim() || 'Rengo',
      subscribedAt: data.subscribedAt || new Date().toISOString(),
      discountCode,
      plan: data.plan || 'newsletter_vip',
      source: data.source || 'web_form',
    };
    currentList.unshift(savedSubscriber);
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentList));
    // Dispatch global event for live updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('petsimona25_subscribers_updated', { detail: { subscriber: savedSubscriber, total: currentList.length } }));
    }
  } catch (err) {
    console.error('Error saving subscriber to localStorage:', err);
  }

  return {
    subscriber: savedSubscriber,
    isNew,
    total: currentList.length,
  };
}

/**
 * Deletes a subscriber by ID from localStorage
 */
export function deleteSubscriber(id: string): NewsletterSubscriber[] {
  const currentList = getStoredSubscribers();
  const updatedList = currentList.filter((s) => s.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('petsimona25_subscribers_updated', { detail: { total: updatedList.length } }));
    }
  } catch (err) {
    console.error('Error deleting subscriber from localStorage:', err);
  }
  return updatedList;
}

/**
 * Exports subscribers list to a formatted CSV file and triggers download in browser
 */
export function exportSubscribersToCSV(customList?: NewsletterSubscriber[]): { fileName: string; total: number } {
  const list = customList || getStoredSubscribers();

  // Helper to escape CSV values
  const escapeCSV = (field: string | number | undefined | null): string => {
    if (field === undefined || field === null) return '""';
    const str = String(field).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headers = [
    'ID Suscriptor',
    'Fecha de Registro',
    'Hora',
    'Correo Electrónico',
    'Nombre del Tutor',
    'Nombre de la Mascota',
    'Raza / Tipo',
    'Ciudad / Comuna',
    'Cupón Asignado',
    'Modalidad Suscripción',
    'Origen',
  ];

  const rows = list.map((s) => {
    const dateObj = new Date(s.subscribedAt);
    const formattedDate = !isNaN(dateObj.getTime())
      ? dateObj.toLocaleDateString('es-CL', { year: 'numeric', month: '2-digit', day: '2-digit' })
      : s.subscribedAt;
    const formattedTime = !isNaN(dateObj.getTime())
      ? dateObj.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
      : '';

    const planLabel =
      s.plan === 'monthly_box'
        ? 'Caja Atuendo Mensual'
        : 'Boletín Ofertas VIP (15% OFF)';

    return [
      escapeCSV(s.id),
      escapeCSV(formattedDate),
      escapeCSV(formattedTime),
      escapeCSV(s.email),
      escapeCSV(s.name || 'Sin nombre'),
      escapeCSV(s.petName || 'Mascota'),
      escapeCSV(s.breed || 'No especificada'),
      escapeCSV(s.city || 'Rengo'),
      escapeCSV(s.discountCode || 'SIMONA15'),
      escapeCSV(planLabel),
      escapeCSV(s.source || 'Tienda Web'),
    ].join(';'); // Use semicolon for Latin America / Chilean Excel compatibility
  });

  // UTF-8 BOM prefix (\uFEFF) to ensure Excel opens Chilean special characters (tildes, ñ) correctly
  const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const fileName = `suscriptores-newsletter-petsimona25-${dateStr}.csv`;

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return { fileName, total: list.length };
}
