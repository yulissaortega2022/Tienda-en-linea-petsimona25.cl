export interface BreedBenchmark {
  breedKey: string;
  name: string;
  petType: 'dog' | 'cat';
  typicalWeightKg: string;
  neckCm: { min: number; max: number; typical: number };
  chestCm: { min: number; max: number; typical: number };
  lengthCm: { min: number; max: number; typical: number };
  closestSize: 'XXS' | 'XS' | 'S' | 'M' | 'L';
  anatomicalNote: string;
  tailorAdvice: string;
}

export interface SizeStandardCategory {
  size: 'XXS (Mini)' | 'XS (Chico)' | 'S (Pequeño-Medio)' | 'M (Mediano)' | 'L (Mediano-Grande)';
  weightRange: string;
  neckCm: { min: number; max: number };
  chestCm: { min: number; max: number };
  lengthCm: { min: number; max: number };
  exampleBreeds: string;
}

export const STANDARD_SIZE_CATEGORIES: SizeStandardCategory[] = [
  {
    size: 'XXS (Mini)',
    weightRange: '1.0 - 2.5 kg',
    neckCm: { min: 14, max: 20 },
    chestCm: { min: 22, max: 30 },
    lengthCm: { min: 16, max: 22 },
    exampleBreeds: 'Chihuahua mini, Pinscher mini, Cachorros',
  },
  {
    size: 'XS (Chico)',
    weightRange: '2.5 - 4.5 kg',
    neckCm: { min: 18, max: 25 },
    chestCm: { min: 28, max: 38 },
    lengthCm: { min: 22, max: 28 },
    exampleBreeds: 'Pomerania, Yorkshire, Bichón Maltés, Poodle Toy',
  },
  {
    size: 'S (Pequeño-Medio)',
    weightRange: '4.5 - 7.5 kg',
    neckCm: { min: 23, max: 32 },
    chestCm: { min: 36, max: 48 },
    lengthCm: { min: 27, max: 35 },
    exampleBreeds: 'Pug chico, Shih Tzu, Schnauzer Mini, Teckel estándar',
  },
  {
    size: 'M (Mediano)',
    weightRange: '7.5 - 12.0 kg',
    neckCm: { min: 28, max: 40 },
    chestCm: { min: 46, max: 60 },
    lengthCm: { min: 34, max: 44 },
    exampleBreeds: 'Bulldog Francés, Boston Terrier, Fox Terrier, Poodle Mediano',
  },
  {
    size: 'L (Mediano-Grande)',
    weightRange: '12.0 - 18.0 kg',
    neckCm: { min: 36, max: 48 },
    chestCm: { min: 58, max: 72 },
    lengthCm: { min: 42, max: 54 },
    exampleBreeds: 'Beagle, Cocker Spaniel, Bulldog Francés robusto',
  },
];

export const BREED_BENCHMARKS: Record<string, BreedBenchmark> = {
  'Yorkshire Terrier / Yorkie': {
    breedKey: 'yorkshire',
    name: 'Yorkshire Terrier / Yorkie',
    petType: 'dog',
    typicalWeightKg: '1.8 - 3.5 kg',
    neckCm: { min: 16, max: 24, typical: 20 },
    chestCm: { min: 26, max: 38, typical: 32 },
    lengthCm: { min: 20, max: 28, typical: 24 },
    closestSize: 'XS',
    anatomicalNote: 'Estructura ósea fina y delicada, cuello esbelto y manto sedoso continuo propenso a estática.',
    tailorAdvice: 'Confeccionamos con forros satinados suaves anti-fricción para proteger su pelaje sedoso y cierre frontal anti-ahogo.',
  },
  'Teckel / Perro Salchicha': {
    breedKey: 'teckel',
    name: 'Teckel / Perro Salchicha',
    petType: 'dog',
    typicalWeightKg: '4.5 - 9.0 kg',
    neckCm: { min: 22, max: 34, typical: 27 },
    chestCm: { min: 34, max: 50, typical: 42 },
    lengthCm: { min: 36, max: 54, typical: 45 },
    closestSize: 'S',
    anatomicalNote: 'Columna vertebral notablemente extendida, pecho quilla prominente y patas cortas.',
    tailorAdvice: 'Patrón longitudinal extralargo en espalda con corte ventral alto para no arrastrar la prenda ni mojarse con el pasto húmedo.',
  },
  'Galgo / Galgo Italiano / Whippet': {
    breedKey: 'galgo',
    name: 'Galgo / Galgo Italiano / Whippet',
    petType: 'dog',
    typicalWeightKg: '3.5 - 12.0 kg',
    neckCm: { min: 20, max: 32, typical: 26 },
    chestCm: { min: 38, max: 58, typical: 48 },
    lengthCm: { min: 32, max: 52, typical: 42 },
    closestSize: 'S',
    anatomicalNote: 'Tórax aerodinámico muy profundo en quilla, cintura extremadamente fina y curva lumbar convexa pronunciada.',
    tailorAdvice: 'Patrón con silueta de arco lumbar, pechera profunda elástica y cuello alto térmico (estilo cisne) para proteger del frío.',
  },
  'Perro Pequeño / Toy / Mini': {
    breedKey: 'small_dog',
    name: 'Perro Pequeño / Toy / Mini',
    petType: 'dog',
    typicalWeightKg: '1.5 - 4.0 kg',
    neckCm: { min: 16, max: 26, typical: 21 },
    chestCm: { min: 24, max: 40, typical: 33 },
    lengthCm: { min: 18, max: 30, typical: 24 },
    closestSize: 'XS',
    anatomicalNote: 'Proporciones reducidas y sensibilidad térmica. Requiere prendas ultralivianas que no limiten el movimiento.',
    tailorAdvice: 'Broches planos sin peso extra y telas térmicas hipoalergénicas.',
  },
  'Poodle / Caniche Toy / Mini': {
    breedKey: 'poodle',
    name: 'Poodle / Caniche Toy / Mini',
    petType: 'dog',
    typicalWeightKg: '2.5 - 4.5 kg',
    neckCm: { min: 18, max: 28, typical: 23 },
    chestCm: { min: 28, max: 44, typical: 36 },
    lengthCm: { min: 22, max: 35, typical: 28 },
    closestSize: 'XS',
    anatomicalNote: 'Cuerpo esbelto y cuello estilizado. Pecho moderado y lomo proporcionado.',
    tailorAdvice: 'Se recomienda holgura de 2 cm en pecho para no aplastar el rizado del pelaje.',
  },
  'Chihuahua': {
    breedKey: 'chihuahua',
    name: 'Chihuahua',
    petType: 'dog',
    typicalWeightKg: '1.2 - 3.0 kg',
    neckCm: { min: 14, max: 22, typical: 18 },
    chestCm: { min: 22, max: 34, typical: 28 },
    lengthCm: { min: 16, max: 26, typical: 22 },
    closestSize: 'XXS',
    anatomicalNote: 'Estructura ósea muy fina y cuello delicado. Requiere tela ultra liviana.',
    tailorAdvice: 'El cuello debe cerrar suave sin presionar la tráquea sensible de la raza.',
  },
  'Pug / Carlino': {
    breedKey: 'pug',
    name: 'Pug / Carlino',
    petType: 'dog',
    typicalWeightKg: '6.0 - 9.0 kg',
    neckCm: { min: 28, max: 42, typical: 35 },
    chestCm: { min: 42, max: 58, typical: 50 },
    lengthCm: { min: 26, max: 36, typical: 30 },
    closestSize: 'S',
    anatomicalNote: 'Pecho en forma de barril muy ancho, cuello grueso y lomo relativamente corto.',
    tailorAdvice: 'El contorno de pecho suele superar con creces el largo de espalda. Corte frontal holgado.',
  },
  'Bulldog Francés': {
    breedKey: 'french_bulldog',
    name: 'Bulldog Francés',
    petType: 'dog',
    typicalWeightKg: '8.0 - 14.0 kg',
    neckCm: { min: 32, max: 46, typical: 39 },
    chestCm: { min: 48, max: 66, typical: 56 },
    lengthCm: { min: 28, max: 40, typical: 34 },
    closestSize: 'M',
    anatomicalNote: 'Tórax muy musculoso y profundo con hombros anchos y cuello potente.',
    tailorAdvice: 'Corte ergonómico abierto en hombros para permitir libre movimiento de las patas.',
  },
  'Bichón Maltés': {
    breedKey: 'maltese',
    name: 'Bichón Maltés',
    petType: 'dog',
    typicalWeightKg: '2.5 - 4.0 kg',
    neckCm: { min: 18, max: 26, typical: 22 },
    chestCm: { min: 28, max: 40, typical: 34 },
    lengthCm: { min: 22, max: 32, typical: 26 },
    closestSize: 'XS',
    anatomicalNote: 'Cuerpo compacto y proporcionado con pelaje fino que requiere forro anti-fricción.',
    tailorAdvice: 'Usamos forros satinados suaves para evitar nudos en el manto largo.',
  },
  'Pomerania': {
    breedKey: 'pomeranian',
    name: 'Pomerania',
    petType: 'dog',
    typicalWeightKg: '1.8 - 3.5 kg',
    neckCm: { min: 16, max: 24, typical: 20 },
    chestCm: { min: 26, max: 38, typical: 32 },
    lengthCm: { min: 18, max: 28, typical: 23 },
    closestSize: 'XS',
    anatomicalNote: 'Doble capa de pelaje voluminoso que aumenta las medidas aparentes.',
    tailorAdvice: 'Medir tocando suavemente la piel para evitar holguras excesivas por el pelaje.',
  },
  'Shih Tzu': {
    breedKey: 'shih_tzu',
    name: 'Shih Tzu',
    petType: 'dog',
    typicalWeightKg: '4.5 - 7.5 kg',
    neckCm: { min: 22, max: 32, typical: 27 },
    chestCm: { min: 34, max: 48, typical: 41 },
    lengthCm: { min: 26, max: 36, typical: 31 },
    closestSize: 'S',
    anatomicalNote: 'Cuerpo ligeramente más largo que alto, espalda nivelada y cuello firme.',
    tailorAdvice: 'Ajuste cómodo en el pecho con broches seguros para no enredar el pelo.',
  },
  'Schnauzer Mini': {
    breedKey: 'mini_schnauzer',
    name: 'Schnauzer Mini',
    petType: 'dog',
    typicalWeightKg: '5.0 - 8.5 kg',
    neckCm: { min: 24, max: 34, typical: 29 },
    chestCm: { min: 38, max: 54, typical: 46 },
    lengthCm: { min: 28, max: 40, typical: 34 },
    closestSize: 'S',
    anatomicalNote: 'Cuerpo cuadrado, fuerte y compacto con pecho moderadamente profundo.',
    tailorAdvice: 'Ajuste entallado pero elástico para respetar su silueta atlética.',
  },
  'Boston Terrier': {
    breedKey: 'boston_terrier',
    name: 'Boston Terrier',
    petType: 'dog',
    typicalWeightKg: '6.0 - 11.0 kg',
    neckCm: { min: 26, max: 38, typical: 32 },
    chestCm: { min: 40, max: 58, typical: 48 },
    lengthCm: { min: 28, max: 40, typical: 34 },
    closestSize: 'M',
    anatomicalNote: 'Pecho ancho y profundo, lomo corto y espalda ligeramente curvada.',
    tailorAdvice: 'Diseño térmico con forro respirable ideal para perros braquicéfalos.',
  },
  'Fox Terrier (Chileno & Wire)': {
    breedKey: 'fox_terrier',
    name: 'Fox Terrier (Chileno & Wire)',
    petType: 'dog',
    typicalWeightKg: '6.0 - 9.0 kg',
    neckCm: { min: 26, max: 36, typical: 30 },
    chestCm: { min: 42, max: 56, typical: 48 },
    lengthCm: { min: 30, max: 42, typical: 35 },
    closestSize: 'S',
    anatomicalNote: 'Cuerpo compacto atlético, pecho profundo y lomo recto con alta energía y agilidad.',
    tailorAdvice: 'Confección ergonómica con sisa amplia en omóplatos para no restringir saltos ni carreras rápidas.',
  },
  'Beagle': {
    breedKey: 'beagle',
    name: 'Beagle',
    petType: 'dog',
    typicalWeightKg: '9.0 - 15.0 kg',
    neckCm: { min: 30, max: 44, typical: 36 },
    chestCm: { min: 48, max: 68, typical: 58 },
    lengthCm: { min: 34, max: 48, typical: 40 },
    closestSize: 'L',
    anatomicalNote: 'Estructura sólida de sabueso, pecho con costillas bien arqueadas.',
    tailorAdvice: 'Refuerzo de costuras dobles para paseos activos y resistencia al agua.',
  },
  'Mestizo Chico / Mediano': {
    breedKey: 'mixed_breed',
    name: 'Mestizo Chico / Mediano',
    petType: 'dog',
    typicalWeightKg: '3.0 - 15.0 kg',
    neckCm: { min: 18, max: 45, typical: 30 },
    chestCm: { min: 28, max: 65, typical: 46 },
    lengthCm: { min: 22, max: 50, typical: 36 },
    closestSize: 'S',
    anatomicalNote: 'Morfología única. Se confecciona 100% personalizada al milímetro.',
    tailorAdvice: 'Patronaje digital a la medida con verificación directa de fotos de ser necesario.',
  },
  'Gato Persa / Siamés / Mestizo': {
    breedKey: 'cat',
    name: 'Gato Persa / Siamés / Mestizo',
    petType: 'cat',
    typicalWeightKg: '3.0 - 6.0 kg',
    neckCm: { min: 16, max: 26, typical: 20 },
    chestCm: { min: 26, max: 42, typical: 33 },
    lengthCm: { min: 24, max: 38, typical: 30 },
    closestSize: 'XS',
    anatomicalNote: 'Flexibilidad espinal extrema. Requiere corte ultra elástico y liviano.',
    tailorAdvice: 'Sisa amplia en hombros para no restringir el salto ni la marcha felina.',
  },
};

export interface MeasurementIssue {
  field: 'neck' | 'chest' | 'bodyLength' | 'proportion';
  type: 'too_small' | 'too_large' | 'inverted_neck_chest' | 'disproportionate' | 'unusual_breed_fit';
  title: string;
  message: string;
  standardRange?: { min: number; max: number };
  enteredValueCm: number;
  suggestedValueCm?: number;
  severity: 'warning' | 'alert' | 'error';
}

export interface MeasurementAnalysis {
  isValidNumber: boolean;
  hasErrors: boolean;
  hasWarnings: boolean;
  isUnusual: boolean;
  status: 'optimal' | 'notice' | 'unusual_alert' | 'invalid_error';
  compatibilityScore: number;
  riskLevel: 'low' | 'moderate' | 'high';
  unusualFields: Array<'neck' | 'chest' | 'bodyLength' | 'proportion'>;
  issues: MeasurementIssue[];
  benchmark: BreedBenchmark;
  enteredCm: { neck: number; chest: number; bodyLength: number };
  comparison: {
    neck: { status: 'ideal' | 'low' | 'high' | 'critical'; diffPercent: number };
    chest: { status: 'ideal' | 'low' | 'high' | 'critical'; diffPercent: number };
    bodyLength: { status: 'ideal' | 'low' | 'high' | 'critical'; diffPercent: number };
  };
  suggestedStandardSize: string;
  summaryMessage: string;
  tailorRecommendation: string;
}

/**
 * Validates and compares pet measurements against official standards in real time.
 */
export function analyzePetMeasurements(params: {
  neck: number | '';
  chest: number | '';
  bodyLength: number | '';
  unit: 'cm' | 'in';
  breed: string;
  petType: 'dog' | 'cat' | 'other';
}): MeasurementAnalysis | null {
  const { neck, chest, bodyLength, unit, breed, petType } = params;

  // If fields are incomplete, return null
  if (
    neck === '' ||
    chest === '' ||
    bodyLength === '' ||
    neck === null ||
    chest === null ||
    bodyLength === null ||
    isNaN(Number(neck)) ||
    isNaN(Number(chest)) ||
    isNaN(Number(bodyLength))
  ) {
    return null;
  }

  // Convert all to CM for uniform benchmark comparison
  const multiplier = unit === 'in' ? 2.54 : 1;
  const neckCm = Math.round(Number(neck) * multiplier * 10) / 10;
  const chestCm = Math.round(Number(chest) * multiplier * 10) / 10;
  const bodyLengthCm = Math.round(Number(bodyLength) * multiplier * 10) / 10;

  // Retrieve breed benchmark or fallback
  let benchmark = BREED_BENCHMARKS[breed];
  if (!benchmark) {
    const lower = breed.toLowerCase();
    if (lower.includes('york')) {
      benchmark = BREED_BENCHMARKS['Yorkshire Terrier / Yorkie'];
    } else if (lower.includes('salchicha') || lower.includes('teckel') || lower.includes('dachshund')) {
      benchmark = BREED_BENCHMARKS['Teckel / Perro Salchicha'];
    } else if (lower.includes('galgo') || lower.includes('whippet') || lower.includes('greyhound')) {
      benchmark = BREED_BENCHMARKS['Galgo / Galgo Italiano / Whippet'];
    } else if (lower.includes('pequeño') || lower.includes('chico') || lower.includes('mini') || lower.includes('toy')) {
      benchmark = BREED_BENCHMARKS['Perro Pequeño / Toy / Mini'];
    } else if (petType === 'cat') {
      benchmark = BREED_BENCHMARKS['Gato Persa / Siamés / Mestizo'];
    } else {
      benchmark = BREED_BENCHMARKS['Mestizo Chico / Mediano'];
    }
  }

  const issues: MeasurementIssue[] = [];

  // 1. Critical Anatomical Incoherence: Chest vs Neck
  if (chestCm <= neckCm) {
    issues.push({
      field: 'proportion',
      type: 'inverted_neck_chest',
      title: 'Inversión de Pecho y Cuello',
      message: `El contorno de pecho (${chestCm} cm) es menor o igual al del cuello (${neckCm} cm). Anatómicamente, el tórax de un ${benchmark.petType === 'cat' ? 'felino' : 'perro'} es sustancialmente mayor que su cuello. Revisa si intercambiaste los valores.`,
      enteredValueCm: chestCm,
      suggestedValueCm: Math.max(Math.round(neckCm * 1.35), benchmark.chestCm.typical),
      severity: 'alert',
    });
  } else if (chestCm < neckCm * 1.12) {
    issues.push({
      field: 'proportion',
      type: 'disproportionate',
      title: 'Proporción Cuello-Pecho muy estrecha',
      message: `La diferencia entre cuello (${neckCm} cm) y pecho (${chestCm} cm) es casi nula. En la confección a medida, el pecho suele ser al menos 20% a 50% mayor.`,
      enteredValueCm: chestCm,
      severity: 'warning',
    });
  }

  // 2. Proportion Check: Length vs Chest
  // Exception: Dachshund / Teckel naturally has length > chest
  const isTeckel = breed.toLowerCase().includes('teckel') || breed.toLowerCase().includes('salchicha');
  if (!isTeckel && bodyLengthCm > chestCm * 1.65) {
    issues.push({
      field: 'bodyLength',
      type: 'disproportionate',
      title: 'Largo de espalda inusualmente largo',
      message: `El largo ingresado (${bodyLengthCm} cm) es muy superior al contorno de pecho (${chestCm} cm). A menos que sea un perro salchicha, esta proporción puede hacer que la prenda quede colgando.`,
      enteredValueCm: bodyLengthCm,
      suggestedValueCm: Math.round(chestCm * 0.75),
      severity: 'warning',
    });
  } else if (isTeckel && bodyLengthCm < chestCm * 0.8) {
    issues.push({
      field: 'bodyLength',
      type: 'disproportionate',
      title: 'Largo corto para Perro Salchicha',
      message: `Para un Teckel/Salchicha (${breed}), el largo de espalda suele ser mayor (36 - 54 cm) debido a su columna alargada.`,
      enteredValueCm: bodyLengthCm,
      suggestedValueCm: benchmark.lengthCm.typical,
      severity: 'warning',
    });
  }

  // 3. Neck vs Breed Standard Bounds
  const getMetricStatus = (val: number, range: { min: number; max: number; typical: number }) => {
    const minTolerance = range.min * 0.75;
    const maxTolerance = range.max * 1.35;
    if (val < minTolerance) return 'critical';
    if (val > maxTolerance) return 'critical';
    if (val < range.min) return 'low';
    if (val > range.max) return 'high';
    return 'ideal';
  };

  const neckStatus = getMetricStatus(neckCm, benchmark.neckCm);
  if (neckStatus === 'critical' || neckStatus === 'high' || neckStatus === 'low') {
    const isAbove = neckCm > benchmark.neckCm.max;
    const diff = Math.round(Math.abs(neckCm - benchmark.neckCm.typical));
    issues.push({
      field: 'neck',
      type: isAbove ? 'too_large' : 'too_small',
      title: `Cuello ${isAbove ? 'mayor' : 'menor'} al promedio de ${benchmark.name}`,
      message: `Ingresaste ${neckCm} cm en cuello. El rango habitual para ${benchmark.name} es de ${benchmark.neckCm.min} a ${benchmark.neckCm.max} cm (desvío de ±${diff} cm).`,
      standardRange: { min: benchmark.neckCm.min, max: benchmark.neckCm.max },
      enteredValueCm: neckCm,
      suggestedValueCm: benchmark.neckCm.typical,
      severity: neckStatus === 'critical' ? 'alert' : 'warning',
    });
  }

  // 4. Chest vs Breed Standard Bounds
  const chestStatus = getMetricStatus(chestCm, benchmark.chestCm);
  if (chestStatus === 'critical' || chestStatus === 'high' || chestStatus === 'low') {
    const isAbove = chestCm > benchmark.chestCm.max;
    const diff = Math.round(Math.abs(chestCm - benchmark.chestCm.typical));
    issues.push({
      field: 'chest',
      type: isAbove ? 'too_large' : 'too_small',
      title: `Pecho ${isAbove ? 'mayor' : 'menor'} al promedio de ${benchmark.name}`,
      message: `Ingresaste ${chestCm} cm de pecho. El promedio estándar para ${benchmark.name} es de ${benchmark.chestCm.min} a ${benchmark.chestCm.max} cm (desvío de ±${diff} cm).`,
      standardRange: { min: benchmark.chestCm.min, max: benchmark.chestCm.max },
      enteredValueCm: chestCm,
      suggestedValueCm: benchmark.chestCm.typical,
      severity: chestStatus === 'critical' ? 'alert' : 'warning',
    });
  }

  // 5. Length vs Breed Standard Bounds
  const lengthStatus = getMetricStatus(bodyLengthCm, benchmark.lengthCm);
  if (lengthStatus === 'critical' || lengthStatus === 'high' || lengthStatus === 'low') {
    const isAbove = bodyLengthCm > benchmark.lengthCm.max;
    const diff = Math.round(Math.abs(bodyLengthCm - benchmark.lengthCm.typical));
    issues.push({
      field: 'bodyLength',
      type: isAbove ? 'too_large' : 'too_small',
      title: `Largo de lomo ${isAbove ? 'mayor' : 'menor'} al promedio de ${benchmark.name}`,
      message: `Ingresaste ${bodyLengthCm} cm de largo. El estándar para ${benchmark.name} es de ${benchmark.lengthCm.min} a ${benchmark.lengthCm.max} cm (desvío de ±${diff} cm).`,
      standardRange: { min: benchmark.lengthCm.min, max: benchmark.lengthCm.max },
      enteredValueCm: bodyLengthCm,
      suggestedValueCm: benchmark.lengthCm.typical,
      severity: lengthStatus === 'critical' ? 'alert' : 'warning',
    });
  }

  // Determine standard size recommendation based on chest and length
  let suggestedStandardSize = 'A la Medida Especial (Taller Rengo)';
  for (const cat of STANDARD_SIZE_CATEGORIES) {
    if (
      chestCm >= cat.chestCm.min - 3 &&
      chestCm <= cat.chestCm.max + 3 &&
      bodyLengthCm >= cat.lengthCm.min - 3 &&
      bodyLengthCm <= cat.lengthCm.max + 3
    ) {
      suggestedStandardSize = cat.size;
      break;
    }
  }

  const hasErrors = issues.some((i) => i.severity === 'alert' || i.type === 'inverted_neck_chest');
  const hasWarnings = issues.some((i) => i.severity === 'warning');
  const isUnusual = issues.length > 0;

  // Calculate intelligent compatibility score (0-100)
  let score = 100;
  if (hasErrors) {
    score -= 50;
  }
  issues.forEach((issue) => {
    if (issue.severity === 'alert') score -= 25;
    else if (issue.severity === 'warning') score -= 15;
  });
  const compatibilityScore = Math.max(15, Math.min(100, score));

  // Risk level
  let riskLevel: 'low' | 'moderate' | 'high' = 'low';
  if (hasErrors || compatibilityScore < 60) {
    riskLevel = 'high';
  } else if (hasWarnings || compatibilityScore < 85) {
    riskLevel = 'moderate';
  }

  // Identify which specific fields are unusual
  const unusualFieldsSet = new Set<'neck' | 'chest' | 'bodyLength' | 'proportion'>();
  issues.forEach((i) => unusualFieldsSet.add(i.field));
  const unusualFields = Array.from(unusualFieldsSet);

  let status: MeasurementAnalysis['status'] = 'optimal';
  if (hasErrors) status = 'invalid_error';
  else if (hasWarnings) status = 'unusual_alert';
  else if (issues.length > 0) status = 'notice';

  let summaryMessage = '✅ Medidas perfectamente coherentes con las proporciones estándar de ' + benchmark.name + '.';
  let tailorRecommendation = benchmark.tailorAdvice;

  if (hasErrors) {
    summaryMessage = '⚠️ Se detectaron incoherencias anatómicas críticas (ej. pecho menor a cuello) que requieren corrección.';
    tailorRecommendation = 'Corrección requerida: En el taller de Rengo no podemos cortar una pechera con contorno menor al cuello. Revisa si invertiste los números o aplica los valores promedio de ' + benchmark.name + '.';
  } else if (hasWarnings) {
    summaryMessage = `ℹ️ Las medidas ingresadas difieren del estándar habitual para ${benchmark.name}. Revisa si tu mascota es especialmente delgada, robusta o de lomo largo.`;
    tailorRecommendation = `Corte especial para ${benchmark.name}: Adaptaremos sisa y contorno torácico para asegurar holgura respiratoria de 2 cm y evitar que la prenda arrastre o quede corta.`;
  }

  const calcDiff = (val: number, typical: number) => {
    return Math.round(((val - typical) / typical) * 100);
  };

  return {
    isValidNumber: true,
    hasErrors,
    hasWarnings,
    isUnusual,
    status,
    compatibilityScore,
    riskLevel,
    unusualFields,
    issues,
    benchmark,
    enteredCm: { neck: neckCm, chest: chestCm, bodyLength: bodyLengthCm },
    comparison: {
      neck: { status: neckStatus, diffPercent: calcDiff(neckCm, benchmark.neckCm.typical) },
      chest: { status: chestStatus, diffPercent: calcDiff(chestCm, benchmark.chestCm.typical) },
      bodyLength: { status: lengthStatus, diffPercent: calcDiff(bodyLengthCm, benchmark.lengthCm.typical) },
    },
    suggestedStandardSize,
    summaryMessage,
    tailorRecommendation,
  };
}
