import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Dog,
  Cat,
  Ruler,
  Heart,
  PlusCircle,
  Check,
  Loader2,
  Bot,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  ArrowRightLeft,
  Sliders,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  X,
  Eye,
  BookOpen,
  RefreshCw,
  Search,
  Scissors,
  FileText,
  MessageCircle,
  Mail,
} from 'lucide-react';
import { COMMON_BREEDS } from '../data/mockData';
import { CustomOrderItem } from '../types';
import {
  analyzePetMeasurements,
  BREED_BENCHMARKS,
  STANDARD_SIZE_CATEGORIES,
  MeasurementAnalysis,
  BreedBenchmark,
} from '../data/breedSizeStandards';
import {
  generatePurchaseValidationReport,
  PurchaseValidationReport,
} from '../services/purchaseValidationService';
import { PurchaseValidationModal } from './PurchaseValidationModal';

interface CustomOrderFormProps {
  onAddToCart: (customItem: CustomOrderItem) => void;
}

interface FormErrors {
  petName?: string;
  customBreed?: string;
  neck?: string;
  chest?: string;
  bodyLength?: string;
  embroideryText?: string;
  general?: string;
}

export const CustomOrderForm: React.FC<CustomOrderFormProps> = ({ onAddToCart }) => {
  const [petType, setPetType] = useState<'dog' | 'cat' | 'other'>('dog');
  const [petName, setPetName] = useState('');
  const [breed, setBreed] = useState(COMMON_BREEDS[0]);
  const [customBreed, setCustomBreed] = useState('');
  
  // Measurements - defaults tailored for small and toy dogs (Yorkshire Terrier benchmark)
  const [neck, setNeck] = useState<number | ''>(20);
  const [chest, setChest] = useState<number | ''>(32);
  const [bodyLength, setBodyLength] = useState<number | ''>(24);
  const [unit, setUnit] = useState<'cm' | 'in'>('cm');

  // Garment Customization
  const [garmentType, setGarmentType] = useState('Impermeable Térmico');
  const [fabricColor, setFabricColor] = useState('Rojo Rubí');
  const [embroideryText, setEmbroideryText] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');

  // Validation States
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Reference Standards & Alert Modals State
  const [showStandardsModal, setShowStandardsModal] = useState(false);
  const [showUnusualAlertModal, setShowUnusualAlertModal] = useState(false);
  const [confirmedUnusualMeasurements, setConfirmedUnusualMeasurements] = useState(false);
  const [standardsTab, setStandardsTab] = useState<'breeds' | 'sizes'>('breeds');
  const [searchBreedTable, setSearchBreedTable] = useState('');

  // AI Advisor State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{
    advisorAdvice?: string;
    recommendedSize?: string;
    fabricTip?: string;
  } | null>(null);

  const [addedSuccess, setAddedSuccess] = useState(false);
  const [validationReport, setValidationReport] = useState<PurchaseValidationReport | null>(null);
  const [showValidationReportModal, setShowValidationReportModal] = useState(false);

  // Real-time analysis against standard reference tables
  const measurementAnalysis: MeasurementAnalysis | null = useMemo(() => {
    return analyzePetMeasurements({
      neck,
      chest,
      bodyLength,
      unit,
      breed: breed === 'Otra Raza (Especificar)' ? (customBreed.trim() || 'Mestizo Chico / Mediano') : breed,
      petType,
    });
  }, [neck, chest, bodyLength, unit, breed, customBreed, petType]);

  // Unit converter helper
  const handleUnitChange = (newUnit: 'cm' | 'in') => {
    if (newUnit === unit) return;

    if (newUnit === 'in') {
      // cm to inches
      if (typeof neck === 'number' && neck > 0) setNeck(Number((neck / 2.54).toFixed(1)));
      if (typeof chest === 'number' && chest > 0) setChest(Number((chest / 2.54).toFixed(1)));
      if (typeof bodyLength === 'number' && bodyLength > 0) setBodyLength(Number((bodyLength / 2.54).toFixed(1)));
    } else {
      // inches to cm
      if (typeof neck === 'number' && neck > 0) setNeck(Math.round(neck * 2.54));
      if (typeof chest === 'number' && chest > 0) setChest(Math.round(chest * 2.54));
      if (typeof bodyLength === 'number' && bodyLength > 0) setBodyLength(Math.round(bodyLength * 2.54));
    }
    setUnit(newUnit);
  };

  // Quick Action: Swap inverted Neck and Chest
  const handleSwapNeckAndChest = () => {
    const prevNeck = neck;
    const prevChest = chest;
    setNeck(prevChest);
    setChest(prevNeck);
    setConfirmedUnusualMeasurements(false);
    setShowUnusualAlertModal(false);
  };

  // Quick Action: Apply typical benchmark values for selected breed
  const handleApplySuggestedBreedValues = () => {
    if (!measurementAnalysis?.benchmark) return;
    const bm = measurementAnalysis.benchmark;
    if (unit === 'cm') {
      setNeck(bm.neckCm.typical);
      setChest(bm.chestCm.typical);
      setBodyLength(bm.lengthCm.typical);
    } else {
      setNeck(Number((bm.neckCm.typical / 2.54).toFixed(1)));
      setChest(Number((bm.chestCm.typical / 2.54).toFixed(1)));
      setBodyLength(Number((bm.lengthCm.typical / 2.54).toFixed(1)));
    }
    setConfirmedUnusualMeasurements(false);
    setShowUnusualAlertModal(false);
  };

  // Comprehensive Validation Function
  const validateForm = (
    fieldsToValidate?: {
      pName?: string;
      cBreed?: string;
      selBreed?: string;
      nVal?: number | '';
      cVal?: number | '';
      bVal?: number | '';
      uVal?: 'cm' | 'in';
      embText?: string;
    }
  ): FormErrors => {
    const pName = fieldsToValidate?.pName !== undefined ? fieldsToValidate.pName : petName;
    const selBreed = fieldsToValidate?.selBreed !== undefined ? fieldsToValidate.selBreed : breed;
    const cBreed = fieldsToValidate?.cBreed !== undefined ? fieldsToValidate.cBreed : customBreed;
    const nVal = fieldsToValidate?.nVal !== undefined ? fieldsToValidate.nVal : neck;
    const cVal = fieldsToValidate?.cVal !== undefined ? fieldsToValidate.cVal : chest;
    const bVal = fieldsToValidate?.bVal !== undefined ? fieldsToValidate.bVal : bodyLength;
    const uVal = fieldsToValidate?.uVal !== undefined ? fieldsToValidate.uVal : unit;
    const embText = fieldsToValidate?.embText !== undefined ? fieldsToValidate.embText : embroideryText;

    const newErrors: FormErrors = {};

    // 1. Pet Name Validation
    const trimmedName = pName.trim();
    if (!trimmedName) {
      newErrors.petName = 'El nombre de la mascota es obligatorio.';
    } else if (trimmedName.length < 2) {
      newErrors.petName = 'El nombre debe tener al menos 2 caracteres.';
    } else if (trimmedName.length > 30) {
      newErrors.petName = 'El nombre no puede superar los 30 caracteres.';
    }

    // 2. Custom Breed Validation
    if (selBreed === 'Otra Raza (Especificar)') {
      const trimmedCustomBreed = cBreed.trim();
      if (!trimmedCustomBreed) {
        newErrors.customBreed = 'Por favor especifica la raza o cruce de tu mascota.';
      } else if (trimmedCustomBreed.length < 2) {
        newErrors.customBreed = 'Ingresa una descripción válida de la raza (mínimo 2 letras).';
      }
    }

    // 3. Measurement Validation: Neck (Cuello)
    const minNeck = uVal === 'cm' ? 10 : 4;
    const maxNeck = uVal === 'cm' ? 90 : 35;
    if (nVal === '' || nVal === null || isNaN(Number(nVal))) {
      newErrors.neck = `Ingresa la medida del cuello (en ${uVal}).`;
    } else {
      const numNeck = Number(nVal);
      if (numNeck <= 0) {
        newErrors.neck = 'La medida debe ser mayor a 0.';
      } else if (numNeck < minNeck || numNeck > maxNeck) {
        newErrors.neck = `Rango válido: ${minNeck} a ${maxNeck} ${uVal}.`;
      }
    }

    // 4. Measurement Validation: Chest (Pecho)
    const minChest = uVal === 'cm' ? 15 : 6;
    const maxChest = uVal === 'cm' ? 140 : 55;
    if (cVal === '' || cVal === null || isNaN(Number(cVal))) {
      newErrors.chest = `Ingresa el contorno de pecho (en ${uVal}).`;
    } else {
      const numChest = Number(cVal);
      if (numChest <= 0) {
        newErrors.chest = 'La medida debe ser mayor a 0.';
      } else if (numChest < minChest || numChest > maxChest) {
        newErrors.chest = `Rango válido: ${minChest} a ${maxChest} ${uVal}.`;
      }
    }

    // 5. Measurement Validation: Body Length (Largo)
    const minLength = uVal === 'cm' ? 10 : 4;
    const maxLength = uVal === 'cm' ? 120 : 48;
    if (bVal === '' || bVal === null || isNaN(Number(bVal))) {
      newErrors.bodyLength = `Ingresa el largo de cuerpo (en ${uVal}).`;
    } else {
      const numLength = Number(bVal);
      if (numLength <= 0) {
        newErrors.bodyLength = 'La medida debe ser mayor a 0.';
      } else if (numLength < minLength || numLength > maxLength) {
        newErrors.bodyLength = `Rango válido: ${minLength} a ${maxLength} ${uVal}.`;
      }
    }

    // 6. Embroidery/Stamping Validation
    if (embText && embText.trim().length > 25) {
      newErrors.embroideryText = 'El texto de estampado no puede exceder 25 caracteres.';
    }

    return newErrors;
  };

  const markTouched = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleAskAI = async () => {
    // Validate required fields for AI advice
    const currentErrors = validateForm();
    if (currentErrors.petName || currentErrors.neck || currentErrors.chest || currentErrors.bodyLength) {
      setTouched({ petName: true, neck: true, chest: true, bodyLength: true, customBreed: true });
      setErrors(currentErrors);
      return;
    }

    setAiLoading(true);
    setAiResult(null);
    try {
      const activeBreed = breed === 'Otra Raza (Especificar)' ? customBreed : breed;
      const res = await fetch('/api/ai-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          petName: petName || 'Tu Mascota',
          breed: activeBreed,
          neck,
          chest,
          bodyLength,
          garmentType,
        }),
      });
      const data = await res.json();
      setAiResult(data);
    } catch (err) {
      console.error('Error fetching AI advice:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const currentPrice = useMemo(() => {
    let basePrice = 24900;
    if (garmentType.includes('Impermeable')) {
      basePrice = 24900;
    } else if (garmentType.includes('Abrigo')) {
      basePrice = 28900;
    } else if (garmentType.includes('Vestido')) {
      basePrice = 32900;
    } else if (garmentType.includes('Pijama')) {
      basePrice = 18900;
    } else if (garmentType.includes('Camiseta') || garmentType.includes('Bandana')) {
      basePrice = 14900;
    }

    if (embroideryText.trim()) {
      basePrice += 4000; // Embroidery fee in CLP
    }
    return basePrice;
  }, [garmentType, embroideryText]);

  const handleOpenValidationReport = () => {
    const finalBreed = breed === 'Otra Raza (Especificar)' ? customBreed.trim() || 'Raza Mixta' : breed;
    const analysis = measurementAnalysis || analyzePetMeasurements({
      neck,
      chest,
      bodyLength,
      unit,
      breed: finalBreed,
      petType,
    });

    const rep = generatePurchaseValidationReport({
      petName: petName.trim() || 'Mascota regalona',
      petType,
      breed: finalBreed,
      garmentType,
      fabricColor,
      embroideryText: embroideryText.trim() || undefined,
      specialNotes: specialNotes.trim() || undefined,
      price: currentPrice,
      neck: Number(neck) || 20,
      chest: Number(chest) || 32,
      bodyLength: Number(bodyLength) || 24,
      unit,
      analysis,
      userConfirmedUnusual: confirmedUnusualMeasurements,
    });

    setValidationReport(rep);
    setShowValidationReportModal(true);
  };

  const executeAddToCart = () => {
    const finalBreed = breed === 'Otra Raza (Especificar)' ? customBreed.trim() || 'Raza Mixta' : breed;

    // Price calculation logic (in CLP)
    const basePrice = currentPrice;

    const calculatedSizeDescription = measurementAnalysis
      ? `A la Medida • ${measurementAnalysis.suggestedStandardSize}`
      : 'Confección Especial A la Medida (Taller Rengo)';

    const customOrder: CustomOrderItem = {
      id: `custom-${Date.now()}`,
      petName: petName.trim(),
      breed: finalBreed,
      petType,
      measurements: {
        neck: Number(neck),
        chest: Number(chest),
        bodyLength: Number(bodyLength),
        unit,
      },
      garmentType,
      fabricColor,
      fabricType: 'Algodón Térmico + Capa Impermeable Artesanal',
      embroideryText: embroideryText.trim() || undefined,
      specialNotes: specialNotes.trim()
        ? `${specialNotes.trim()}${confirmedUnusualMeasurements ? ' [Medidas inusuales verificadas por tutor]' : ''}`
        : confirmedUnusualMeasurements
        ? '[Medidas inusuales verificadas por tutor]'
        : undefined,
      calculatedSize: calculatedSizeDescription,
      price: basePrice,
    };

    // Auto generate purchase validation report so user can view or dispatch to WhatsApp/Email
    if (measurementAnalysis) {
      const rep = generatePurchaseValidationReport({
        petName: petName.trim() || 'Mascota regalona',
        petType,
        breed: finalBreed,
        garmentType,
        fabricColor,
        embroideryText: embroideryText.trim() || undefined,
        specialNotes: specialNotes.trim() || undefined,
        price: basePrice,
        neck: Number(neck),
        chest: Number(chest),
        bodyLength: Number(bodyLength),
        unit,
        analysis: measurementAnalysis,
        userConfirmedUnusual: confirmedUnusualMeasurements,
      });
      setValidationReport(rep);
    }

    onAddToCart(customOrder);
    setAddedSuccess(true);
    setFormSubmitted(false);
    setShowUnusualAlertModal(false);
    setTimeout(() => setAddedSuccess(false), 3500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTouched({
      petName: true,
      customBreed: true,
      neck: true,
      chest: true,
      bodyLength: true,
      embroideryText: true,
    });

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      // Scroll to the first error
      const firstErrorKey = Object.keys(validationErrors)[0];
      const errorElement = document.getElementById(`field-${firstErrorKey}`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Real-time Anatomical & Breed Standard Interception
    if (measurementAnalysis) {
      // If critical anatomical error (e.g. chest <= neck)
      if (measurementAnalysis.hasErrors) {
        setShowUnusualAlertModal(true);
        const errorElement = document.getElementById('field-chest');
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      // If unusual measurements vs standard reference table and not yet confirmed by the user
      if (measurementAnalysis.isUnusual && !confirmedUnusualMeasurements) {
        setShowUnusualAlertModal(true);
        return;
      }
    }

    executeAddToCart();
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <section id="medidas-form" className="py-16 bg-orange-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-xl border-2 border-orange-200 overflow-hidden">
          {/* Header Banner */}
          <div className="bg-orange-500 text-white p-6 sm:p-8 text-center space-y-2">
            <div className="inline-flex items-center gap-2 bg-orange-600/90 px-3.5 py-1 rounded-full text-xs font-black text-yellow-300 uppercase tracking-wider border border-orange-300/50">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>Confección Especializada en Perros Chicos y Medianos • petsimona25</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Formulario A la Medida (Perros Chicos y Medianos) ✂️
            </h2>
            <p className="text-orange-100 text-sm max-w-2xl mx-auto font-medium">
              Ingresa los datos de tu peludo chico o mediano (Pug, Bulldog Francés, Salchicha, Chihuahua, Poodle, Cocker, etc.) y sus medidas exactas para confeccionar ropa anatómica perfecta.
            </p>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} noValidate className="p-6 sm:p-8 space-y-8">
            {/* Global Error Banner if submitted with errors */}
            {formSubmitted && hasErrors && (
              <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-300 text-red-800 flex items-start gap-3 animate-fade-in shadow-xs">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-black text-sm text-red-900">
                    No pudimos procesar tu pedido. Por favor corrige los siguientes campos:
                  </p>
                  <ul className="list-disc list-inside font-bold text-red-700 space-y-0.5">
                    {errors.petName && <li>Nombre de la Mascota: {errors.petName}</li>}
                    {errors.customBreed && <li>Raza personalizada: {errors.customBreed}</li>}
                    {errors.neck && <li>Medida de Cuello: {errors.neck}</li>}
                    {errors.chest && <li>Medida de Pecho: {errors.chest}</li>}
                    {errors.bodyLength && <li>Medida de Largo de Cuerpo: {errors.bodyLength}</li>}
                    {errors.embroideryText && <li>Estampado: {errors.embroideryText}</li>}
                  </ul>
                </div>
              </div>
            )}

            {/* Step 1: Pet Identification */}
            <div className="space-y-4">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b-2 border-orange-100 pb-2">
                <span className="w-7 h-7 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-black">
                  1
                </span>
                Datos de la Mascota
              </h3>

              {/* Pet Type Selection */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setPetType('dog')}
                  className={`flex-1 py-3 px-4 rounded-2xl border-2 font-black text-sm flex items-center justify-center gap-2 transition-all ${
                    petType === 'dog'
                      ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                      : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Dog className="w-5 h-5" /> Perro 🐕
                </button>
                <button
                  type="button"
                  onClick={() => setPetType('cat')}
                  className={`flex-1 py-3 px-4 rounded-2xl border-2 font-black text-sm flex items-center justify-center gap-2 transition-all ${
                    petType === 'cat'
                      ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                      : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Cat className="w-5 h-5" /> Gato 🐈
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Pet Name */}
                <div id="field-petName" className="space-y-1.5">
                  <label className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center justify-between">
                    <span>Nombre de la Mascota *</span>
                    {touched.petName && !errors.petName && petName.trim() && (
                      <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Válido
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Ej. Simona, Rocky, Milo, Luna..."
                      value={petName}
                      onChange={(e) => {
                        setPetName(e.target.value);
                        if (touched.petName || formSubmitted) {
                          const errs = validateForm({ pName: e.target.value });
                          setErrors((prev) => ({ ...prev, petName: errs.petName }));
                        }
                      }}
                      onBlur={() => {
                        markTouched('petName');
                        const errs = validateForm();
                        setErrors((prev) => ({ ...prev, petName: errs.petName }));
                      }}
                      className={`w-full px-4 py-2.5 rounded-xl border-2 text-sm font-bold text-slate-900 bg-slate-50 transition-colors focus:outline-hidden ${
                        (touched.petName || formSubmitted) && errors.petName
                          ? 'border-red-500 bg-red-50/40 focus:border-red-600'
                          : touched.petName && !errors.petName && petName.trim()
                          ? 'border-emerald-500 focus:border-emerald-600'
                          : 'border-slate-200 focus:border-orange-400'
                      }`}
                    />
                  </div>
                  {(touched.petName || formSubmitted) && errors.petName && (
                    <p className="text-xs font-bold text-red-600 flex items-center gap-1 mt-1 animate-fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.petName}
                    </p>
                  )}
                </div>

                {/* Breed Select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Elegir Raza *
                  </label>
                  <select
                    value={breed}
                    onChange={(e) => {
                      setBreed(e.target.value);
                      const errs = validateForm({ selBreed: e.target.value });
                      setErrors((prev) => ({ ...prev, customBreed: errs.customBreed }));
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-orange-400 focus:outline-hidden text-sm font-bold text-slate-900 bg-slate-50"
                  >
                    {COMMON_BREEDS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quick specialty breed tags */}
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Especialidad:</span>
                {[
                  { label: '🐶 Yorkshire', val: 'Yorkshire Terrier / Yorkie', n: 20, c: 32, l: 24 },
                  { label: '🐾 Chihuahua', val: 'Chihuahua', n: 18, c: 28, l: 22 },
                  { label: '🐕 Fox Terrier', val: 'Fox Terrier (Chileno & Wire)', n: 30, c: 48, l: 35 },
                  { label: '🧥 Capas Galgo', val: 'Galgo / Galgo Italiano / Whippet', n: 26, c: 48, l: 42 },
                  { label: '🌭 Salchicha', val: 'Teckel / Perro Salchicha', n: 27, c: 42, l: 45 },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => {
                      setBreed(item.val);
                      setNeck(item.n);
                      setChest(item.c);
                      setBodyLength(item.l);
                    }}
                    className={`px-2.5 py-1 rounded-full text-xs font-black transition-all border ${
                      breed === item.val
                        ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                        : 'bg-orange-50/80 text-orange-900 border-orange-200 hover:bg-orange-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {breed === 'Otra Raza (Especificar)' && (
                <div id="field-customBreed" className="space-y-1.5 pt-1 animate-fade-in">
                  <label className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center justify-between">
                    <span>Escribe la raza o cruce de tu mascota *</span>
                    {touched.customBreed && !errors.customBreed && customBreed.trim() && (
                      <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Válido
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Mezcla de Cocker con Poodle..."
                    value={customBreed}
                    onChange={(e) => {
                      setCustomBreed(e.target.value);
                      if (touched.customBreed || formSubmitted) {
                        const errs = validateForm({ cBreed: e.target.value, selBreed: breed });
                        setErrors((prev) => ({ ...prev, customBreed: errs.customBreed }));
                      }
                    }}
                    onBlur={() => {
                      markTouched('customBreed');
                      const errs = validateForm();
                      setErrors((prev) => ({ ...prev, customBreed: errs.customBreed }));
                    }}
                    className={`w-full px-4 py-2.5 rounded-xl border-2 text-sm font-bold text-slate-900 bg-slate-50 transition-colors focus:outline-hidden ${
                      (touched.customBreed || formSubmitted) && errors.customBreed
                        ? 'border-red-500 bg-red-50/40 focus:border-red-600'
                        : touched.customBreed && !errors.customBreed && customBreed.trim()
                        ? 'border-emerald-500 focus:border-emerald-600'
                        : 'border-slate-200 focus:border-orange-400'
                    }`}
                  />
                  {(touched.customBreed || formSubmitted) && errors.customBreed && (
                    <p className="text-xs font-bold text-red-600 flex items-center gap-1 mt-1 animate-fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.customBreed}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Step 2: Measurements */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-orange-100 pb-3">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-black">
                    2
                  </span>
                  Ingresar Medidas Anatómicamente Exactas
                </h3>

                <div className="flex items-center gap-2">
                  {/* Reference Table Trigger Button */}
                  <button
                    type="button"
                    onClick={() => setShowStandardsModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-950 text-xs font-black transition-colors border border-orange-300"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-orange-600" />
                    <span>Tabla de Referencia Estándar</span>
                  </button>

                  {/* Unit switcher */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-800 border border-slate-200">
                    <button
                      type="button"
                      onClick={() => handleUnitChange('cm')}
                      className={`px-2.5 py-1 rounded-lg font-black transition-all ${
                        unit === 'cm' ? 'bg-orange-500 text-white shadow-xs' : 'hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      cm
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUnitChange('in')}
                      className={`px-2.5 py-1 rounded-lg font-black transition-all ${
                        unit === 'in' ? 'bg-orange-500 text-white shadow-xs' : 'hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      pulgadas
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Cuello */}
                <div
                  id="field-neck"
                  className={`p-4 rounded-2xl border-2 transition-all space-y-2 ${
                    (touched.neck || formSubmitted) && errors.neck
                      ? 'bg-red-50/50 border-red-400'
                      : measurementAnalysis?.comparison.neck.status === 'critical'
                      ? 'bg-red-50/30 border-red-300'
                      : measurementAnalysis?.comparison.neck.status === 'high' || measurementAnalysis?.comparison.neck.status === 'low'
                      ? 'bg-amber-50/40 border-amber-300'
                      : 'bg-orange-50 border-orange-200'
                  }`}
                >
                  <label className="text-xs font-black text-slate-900 flex items-center justify-between">
                    <span>1. CUELLO ({unit}) *</span>
                    {measurementAnalysis && (
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                          measurementAnalysis.comparison.neck.status === 'ideal'
                            ? 'bg-emerald-100 text-emerald-800'
                            : measurementAnalysis.comparison.neck.status === 'critical'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {measurementAnalysis.comparison.neck.status === 'ideal'
                          ? '✓ Estándar'
                          : `${measurementAnalysis.comparison.neck.diffPercent > 0 ? '+' : ''}${measurementAnalysis.comparison.neck.diffPercent}% vs raza`}
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    min={unit === 'cm' ? 10 : 4}
                    max={unit === 'cm' ? 90 : 35}
                    step="0.5"
                    placeholder={unit === 'cm' ? 'Ej. 28' : 'Ej. 11'}
                    value={neck}
                    onChange={(e) => {
                      const val = e.target.value === '' ? '' : Number(e.target.value);
                      setNeck(val);
                      setConfirmedUnusualMeasurements(false);
                      if (touched.neck || formSubmitted) {
                        const errs = validateForm({ nVal: val });
                        setErrors((prev) => ({ ...prev, neck: errs.neck }));
                      }
                    }}
                    onBlur={() => {
                      markTouched('neck');
                      const errs = validateForm();
                      setErrors((prev) => ({ ...prev, neck: errs.neck }));
                    }}
                    className={`w-full px-3 py-2 rounded-xl border-2 text-base font-black text-slate-900 bg-white focus:outline-hidden ${
                      (touched.neck || formSubmitted) && errors.neck
                        ? 'border-red-500 focus:border-red-600'
                        : 'border-orange-300 focus:border-orange-500'
                    }`}
                  />
                  {(touched.neck || formSubmitted) && errors.neck ? (
                    <p className="text-[11px] font-bold text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {errors.neck}
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-600 font-semibold flex items-center justify-between">
                      <span>Base del cuello (2 dedos holgura).</span>
                      {measurementAnalysis && (
                        <span className="text-slate-500 font-mono text-[10px]">
                          Típico: {unit === 'cm' ? `${measurementAnalysis.benchmark.neckCm.min}-${measurementAnalysis.benchmark.neckCm.max} cm` : `${(measurementAnalysis.benchmark.neckCm.min / 2.54).toFixed(1)}-${(measurementAnalysis.benchmark.neckCm.max / 2.54).toFixed(1)} in`}
                        </span>
                      )}
                    </p>
                  )}
                </div>

                {/* Pecho */}
                <div
                  id="field-chest"
                  className={`p-4 rounded-2xl border-2 transition-all space-y-2 ${
                    (touched.chest || formSubmitted) && errors.chest
                      ? 'bg-red-50/50 border-red-400'
                      : measurementAnalysis?.issues.some((i) => i.type === 'inverted_neck_chest')
                      ? 'bg-red-50/60 border-red-500 ring-2 ring-red-400'
                      : measurementAnalysis?.comparison.chest.status === 'critical'
                      ? 'bg-red-50/30 border-red-300'
                      : measurementAnalysis?.comparison.chest.status === 'high' || measurementAnalysis?.comparison.chest.status === 'low'
                      ? 'bg-amber-50/40 border-amber-300'
                      : 'bg-yellow-50 border-yellow-300'
                  }`}
                >
                  <label className="text-xs font-black text-slate-900 flex items-center justify-between">
                    <span>2. CONTORNO PECHO ({unit}) *</span>
                    {measurementAnalysis && (
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                          measurementAnalysis.issues.some((i) => i.type === 'inverted_neck_chest')
                            ? 'bg-red-600 text-white animate-pulse'
                            : measurementAnalysis.comparison.chest.status === 'ideal'
                            ? 'bg-emerald-100 text-emerald-800'
                            : measurementAnalysis.comparison.chest.status === 'critical'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {measurementAnalysis.issues.some((i) => i.type === 'inverted_neck_chest')
                          ? '❌ Menor al cuello'
                          : measurementAnalysis.comparison.chest.status === 'ideal'
                          ? '✓ Estándar'
                          : `${measurementAnalysis.comparison.chest.diffPercent > 0 ? '+' : ''}${measurementAnalysis.comparison.chest.diffPercent}% vs raza`}
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    min={unit === 'cm' ? 15 : 6}
                    max={unit === 'cm' ? 140 : 55}
                    step="0.5"
                    placeholder={unit === 'cm' ? 'Ej. 44' : 'Ej. 17.5'}
                    value={chest}
                    onChange={(e) => {
                      const val = e.target.value === '' ? '' : Number(e.target.value);
                      setChest(val);
                      setConfirmedUnusualMeasurements(false);
                      if (touched.chest || formSubmitted) {
                        const errs = validateForm({ cVal: val });
                        setErrors((prev) => ({ ...prev, chest: errs.chest }));
                      }
                    }}
                    onBlur={() => {
                      markTouched('chest');
                      const errs = validateForm();
                      setErrors((prev) => ({ ...prev, chest: errs.chest }));
                    }}
                    className={`w-full px-3 py-2 rounded-xl border-2 text-base font-black text-slate-900 bg-white focus:outline-hidden ${
                      (touched.chest || formSubmitted) && errors.chest
                        ? 'border-red-500 focus:border-red-600'
                        : measurementAnalysis?.issues.some((i) => i.type === 'inverted_neck_chest')
                        ? 'border-red-500 focus:border-red-600'
                        : 'border-yellow-400 focus:border-orange-500'
                    }`}
                  />
                  {(touched.chest || formSubmitted) && errors.chest ? (
                    <p className="text-[11px] font-bold text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {errors.chest}
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-600 font-semibold flex items-center justify-between">
                      <span>Parte más ancha detrás patas.</span>
                      {measurementAnalysis && (
                        <span className="text-slate-500 font-mono text-[10px]">
                          Típico: {unit === 'cm' ? `${measurementAnalysis.benchmark.chestCm.min}-${measurementAnalysis.benchmark.chestCm.max} cm` : `${(measurementAnalysis.benchmark.chestCm.min / 2.54).toFixed(1)}-${(measurementAnalysis.benchmark.chestCm.max / 2.54).toFixed(1)} in`}
                        </span>
                      )}
                    </p>
                  )}
                </div>

                {/* Largo */}
                <div
                  id="field-bodyLength"
                  className={`p-4 rounded-2xl border-2 transition-all space-y-2 ${
                    (touched.bodyLength || formSubmitted) && errors.bodyLength
                      ? 'bg-red-50/50 border-red-400'
                      : measurementAnalysis?.comparison.bodyLength.status === 'critical'
                      ? 'bg-red-50/30 border-red-300'
                      : measurementAnalysis?.comparison.bodyLength.status === 'high' || measurementAnalysis?.comparison.bodyLength.status === 'low'
                      ? 'bg-amber-50/40 border-amber-300'
                      : 'bg-orange-50 border-orange-200'
                  }`}
                >
                  <label className="text-xs font-black text-slate-900 flex items-center justify-between">
                    <span>3. LARGO DE CUERPO ({unit}) *</span>
                    {measurementAnalysis && (
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                          measurementAnalysis.comparison.bodyLength.status === 'ideal'
                            ? 'bg-emerald-100 text-emerald-800'
                            : measurementAnalysis.comparison.bodyLength.status === 'critical'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {measurementAnalysis.comparison.bodyLength.status === 'ideal'
                          ? '✓ Estándar'
                          : `${measurementAnalysis.comparison.bodyLength.diffPercent > 0 ? '+' : ''}${measurementAnalysis.comparison.bodyLength.diffPercent}% vs raza`}
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    min={unit === 'cm' ? 10 : 4}
                    max={unit === 'cm' ? 120 : 48}
                    step="0.5"
                    placeholder={unit === 'cm' ? 'Ej. 34' : 'Ej. 13.5'}
                    value={bodyLength}
                    onChange={(e) => {
                      const val = e.target.value === '' ? '' : Number(e.target.value);
                      setBodyLength(val);
                      setConfirmedUnusualMeasurements(false);
                      if (touched.bodyLength || formSubmitted) {
                        const errs = validateForm({ bVal: val });
                        setErrors((prev) => ({ ...prev, bodyLength: errs.bodyLength }));
                      }
                    }}
                    onBlur={() => {
                      markTouched('bodyLength');
                      const errs = validateForm();
                      setErrors((prev) => ({ ...prev, bodyLength: errs.bodyLength }));
                    }}
                    className={`w-full px-3 py-2 rounded-xl border-2 text-base font-black text-slate-900 bg-white focus:outline-hidden ${
                      (touched.bodyLength || formSubmitted) && errors.bodyLength
                        ? 'border-red-500 focus:border-red-600'
                        : 'border-orange-300 focus:border-orange-500'
                    }`}
                  />
                  {(touched.bodyLength || formSubmitted) && errors.bodyLength ? (
                    <p className="text-[11px] font-bold text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {errors.bodyLength}
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-600 font-semibold flex items-center justify-between">
                      <span>Base del cuello hasta cola.</span>
                      {measurementAnalysis && (
                        <span className="text-slate-500 font-mono text-[10px]">
                          Típico: {unit === 'cm' ? `${measurementAnalysis.benchmark.lengthCm.min}-${measurementAnalysis.benchmark.lengthCm.max} cm` : `${(measurementAnalysis.benchmark.lengthCm.min / 2.54).toFixed(1)}-${(measurementAnalysis.benchmark.lengthCm.max / 2.54).toFixed(1)} in`}
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </div>

              {/* REAL-TIME VALIDATION & REFERENCE ANALYSIS CARD */}
              {measurementAnalysis && (
                <div className="pt-1 space-y-3">
                  {/* Intelligent Breed Fit Score Bar & Validation Report Trigger */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border-2 border-orange-200 shadow-xs space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-orange-600 shrink-0" />
                        <span className="font-black text-xs sm:text-sm text-slate-900">
                          Validación Inteligente de Calce • {measurementAnalysis.benchmark.name}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-xs font-black px-2.5 py-0.5 rounded-full shadow-2xs ${
                            measurementAnalysis.compatibilityScore >= 85
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : measurementAnalysis.compatibilityScore >= 60
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-red-100 text-red-800 border border-red-300'
                          }`}
                        >
                          {measurementAnalysis.compatibilityScore}% • {
                            measurementAnalysis.compatibilityScore >= 85
                              ? 'Calce Seguro'
                              : measurementAnalysis.compatibilityScore >= 60
                              ? 'Medidas Inusuales'
                              : 'Alerta Anatómica'
                          }
                        </span>

                        <button
                          type="button"
                          onClick={handleOpenValidationReport}
                          className="inline-flex items-center gap-1.5 text-xs font-black text-orange-950 bg-white hover:bg-orange-100 px-3 py-1.5 rounded-xl border border-orange-300 shadow-2xs transition-all active:scale-95"
                        >
                          <FileText className="w-3.5 h-3.5 text-orange-600" />
                          <span>Ficha de Validación (WhatsApp & Correo) 📋</span>
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden shadow-inner">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          measurementAnalysis.compatibilityScore >= 85
                            ? 'bg-emerald-500'
                            : measurementAnalysis.compatibilityScore >= 60
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${measurementAnalysis.compatibilityScore}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-slate-700 font-medium leading-relaxed">
                      {measurementAnalysis.summaryMessage}
                    </p>
                  </div>

                  {/* Case 1: Critical Error (e.g. Chest <= Neck) */}
                  {measurementAnalysis.hasErrors && (
                    <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-400 text-red-950 space-y-3 animate-fade-in shadow-xs">
                      <div className="flex items-start gap-2.5">
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <p className="font-black text-sm text-red-900">
                            Incoherencia Anatómica Detectada: Pecho menor o igual al cuello
                          </p>
                          <p className="text-xs text-red-800 leading-relaxed">
                            {measurementAnalysis.issues.find((i) => i.type === 'inverted_neck_chest')?.message ||
                              'El contorno de pecho no puede ser inferior o igual al cuello. Por favor verifica tus medidas.'}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleSwapNeckAndChest}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-xs transition-transform active:scale-95"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                          Invertir Pecho ({chest} {unit}) y Cuello ({neck} {unit})
                        </button>
                        <button
                          type="button"
                          onClick={handleApplySuggestedBreedValues}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-900 font-black text-xs border border-red-300 transition-colors"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-red-600" />
                          Ajustar a valores típicos de {measurementAnalysis.benchmark.name}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Case 2: Unusual Measurements Alert (Warning vs Breed Standards) */}
                  {!measurementAnalysis.hasErrors && measurementAnalysis.hasWarnings && (
                    <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 space-y-3 animate-fade-in shadow-xs">
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-black text-sm text-amber-900">
                              Alerta de Medidas Inusuales vs Tabla Estándar de {measurementAnalysis.benchmark.name}
                            </p>
                          </div>
                          <ul className="text-xs text-amber-900 space-y-1 list-disc list-inside font-medium leading-relaxed">
                            {measurementAnalysis.issues.map((issue, idx) => (
                              <li key={idx}>
                                <strong className="font-black">{issue.title}:</strong> {issue.message}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-amber-200">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setShowUnusualAlertModal(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shadow-xs transition-transform active:scale-95"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Ver Comparación Detallada con Tabla
                          </button>
                          <button
                            type="button"
                            onClick={handleOpenValidationReport}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs shadow-xs transition-transform active:scale-95"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Ficha de Validación (WhatsApp & Correo) 📋
                          </button>
                          <button
                            type="button"
                            onClick={handleApplySuggestedBreedValues}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-black text-xs border border-amber-300 transition-colors"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-amber-700" />
                            Ajustar al promedio sugerido ({measurementAnalysis.benchmark.neckCm.typical} / {measurementAnalysis.benchmark.chestCm.typical} / {measurementAnalysis.benchmark.lengthCm.typical} cm)
                          </button>
                        </div>

                        {/* Confirmation toggle */}
                        <label className="inline-flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-amber-300 text-xs font-black text-amber-950 hover:bg-amber-50 transition-colors">
                          <input
                            type="checkbox"
                            checked={confirmedUnusualMeasurements}
                            onChange={(e) => setConfirmedUnusualMeasurements(e.target.checked)}
                            className="w-4 h-4 rounded text-orange-500 focus:ring-orange-400 border-amber-300"
                          />
                          <span>Confirmar: Mi mascota tiene estas medidas únicas</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Case 3: Measurements are harmonious & within normal range */}
                  {!measurementAnalysis.hasErrors && !measurementAnalysis.hasWarnings && (
                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-center justify-between gap-3 animate-fade-in text-xs font-bold">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>
                          <strong className="font-black text-emerald-900">Medidas Armónicas:</strong> Coherentes con el estándar anatómico de {measurementAnalysis.benchmark.name}. Talla sugerida: <span className="underline font-black">{measurementAnalysis.suggestedStandardSize}</span>.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowStandardsModal(true)}
                        className="text-[11px] font-black text-emerald-700 hover:text-emerald-900 underline shrink-0"
                      >
                        Ver tabla completa
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* AI Sizing Advisor Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleAskAI}
                  disabled={aiLoading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-6 py-3 rounded-2xl text-xs sm:text-sm shadow-md transition-all disabled:opacity-75"
                >
                  {aiLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />
                      Analizando anatomía con IA petsimona25...
                    </>
                  ) : (
                    <>
                      <Bot className="w-4 h-4 text-yellow-400" />
                      Consultar Asesora de Corte con IA (Gemini)
                    </>
                  )}
                </button>
              </div>

              {/* AI Advisor Output box */}
              {aiResult && (
                <div className="p-4 rounded-2xl bg-slate-900 border-2 border-orange-400 space-y-2 animate-fade-in text-slate-100">
                  <div className="flex items-center gap-2 font-black text-sm text-yellow-400">
                    <Sparkles className="w-4 h-4" />
                    <span>Recomendación del Taller de Confección:</span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-300">{aiResult.advisorAdvice}</p>
                  <div className="flex flex-wrap gap-2 text-[11px] font-bold pt-1">
                    <span className="px-3 py-1 bg-orange-500 text-white rounded-full">
                      Talla Base: {aiResult.recommendedSize}
                    </span>
                    <span className="px-3 py-1 bg-yellow-400 text-slate-900 rounded-full">
                      Insumo Recomendado: {aiResult.fabricTip}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Design Options */}
            <div className="space-y-4">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b-2 border-orange-100 pb-2">
                <span className="w-7 h-7 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-black">
                  3
                </span>
                Diseño, Tela y Personalización
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Garment type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-900 uppercase">
                    Tipo de Prenda *
                  </label>
                  <select
                    value={garmentType}
                    onChange={(e) => setGarmentType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 focus:border-orange-400 focus:outline-hidden text-sm font-bold text-slate-900 bg-slate-50"
                  >
                    <option value="Impermeable Térmico">Impermeable Térmico (Chaqueta) - $24.900 CLP</option>
                    <option value="Abrigo de Lana Elegante">Abrigo de Lana Elegante - $28.900 CLP</option>
                    <option value="Camiseta Casual Algodón">Camiseta Casual de Algodón - $14.900 CLP</option>
                    <option value="Vestido de Gala con Lazo">Vestido de Gala con Lazo - $32.900 CLP</option>
                    <option value="Pijama 4 Patas">Pijama Suave de 4 Patas - $18.900 CLP</option>
                    <option value="Bandana Ajustable">Bandana Personalizada - $14.900 CLP</option>
                  </select>
                </div>

                {/* Color */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-900 uppercase">
                    Color de la Tela *
                  </label>
                  <select
                    value={fabricColor}
                    onChange={(e) => setFabricColor(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 focus:border-orange-400 focus:outline-hidden text-sm font-bold text-slate-900 bg-slate-50"
                  >
                    <option value="Rojo Rubí">Rojo Rubí Elegante</option>
                    <option value="Azul Marino Royal">Azul Marino Royal</option>
                    <option value="Rosa Pastel">Rosa Pastel / Magenta</option>
                    <option value="Verde Olivo">Verde Olivo Térmico</option>
                    <option value="Amarillo Sol Reflectivo">Amarillo Sol con Reflectivo</option>
                    <option value="Negro Azabache">Negro Azabache Minimalista</option>
                  </select>
                </div>

                {/* Stamping Name */}
                <div id="field-embroideryText" className="space-y-1.5">
                  <label className="text-xs font-black text-slate-900 uppercase flex justify-between">
                    <span>Nombre Estampado Personalizado (Opcional)</span>
                    <span className="text-orange-600 font-extrabold">+$4.000 CLP</span>
                  </label>
                  <input
                    type="text"
                    maxLength={25}
                    placeholder="Ej. SIMONA"
                    value={embroideryText}
                    onChange={(e) => {
                      setEmbroideryText(e.target.value);
                      if (touched.embroideryText || formSubmitted) {
                        const errs = validateForm({ embText: e.target.value });
                        setErrors((prev) => ({ ...prev, embroideryText: errs.embroideryText }));
                      }
                    }}
                    className={`w-full px-3 py-2.5 rounded-xl border-2 text-sm font-bold text-slate-900 bg-slate-50 focus:outline-hidden ${
                      errors.embroideryText ? 'border-red-500 bg-red-50/40' : 'border-slate-200 focus:border-orange-400'
                    }`}
                  />
                  {errors.embroideryText && (
                    <p className="text-xs font-bold text-red-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.embroideryText}
                    </p>
                  )}
                </div>
              </div>

              {/* Special Instructions */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-900 uppercase">
                  Detalles Especiales o Requerimientos de la Mascota
                </label>
                <textarea
                  rows={2}
                  maxLength={300}
                  placeholder="Ej. Mi mascota usa arnés especial de pecho / tiene piel sensible / es muy largo de lomo..."
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 focus:border-orange-400 focus:outline-hidden text-xs font-bold text-slate-900 bg-slate-50"
                />
              </div>
            </div>

            {/* Submit CTA & Validation Report */}
            <div className="pt-4 border-t-2 border-orange-100 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="text-xs text-slate-700">
                  <p className="font-black text-base text-slate-900">
                    Total Confección a la Medida: $
                    {currentPrice.toLocaleString('es-CL')} CLP
                    {embroideryText.trim() && ' (Incluye Estampado)'}
                  </p>
                  <p className="font-semibold text-slate-500">
                    Tiempo de confección artesanal en Rengo: 2 a 3 días hábiles.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleOpenValidationReport}
                    className="inline-flex items-center justify-center gap-2 font-black uppercase tracking-wider px-5 py-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-950 border-2 border-amber-300 transition-all text-xs active:scale-95 shadow-2xs"
                    title="Generar Ficha Técnica y notificar a WhatsApp y Correo"
                  >
                    <FileText className="w-4 h-4 text-orange-600" />
                    <span>Reporte de Validación 📋</span>
                  </button>

                  <button
                    type="submit"
                    className={`inline-flex items-center justify-center gap-2 font-black uppercase tracking-widest px-8 py-3.5 rounded-2xl shadow-md transition-all text-sm ${
                      addedSuccess
                        ? 'bg-emerald-600 text-white'
                        : 'bg-orange-500 hover:bg-orange-600 text-white active:scale-95'
                    }`}
                  >
                    {addedSuccess ? (
                      <>
                        <Check className="w-5 h-5" /> ¡Agregado a tu Carrito!
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-5 h-5" /> Agregar Pedido a la Medida
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Added Success Alert with direct validation dispatch shortcut */}
              {addedSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-xs font-black text-emerald-900">
                        ¡Prenda a la medida agregada con éxito a tu carrito de compras!
                      </p>
                      <p className="text-[11px] text-emerald-800">
                        Se generó tu Ficha Técnica de Validación para coordinar con el taller.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenValidationReport}
                    className="shrink-0 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs flex items-center gap-1.5 shadow-2xs transition-transform active:scale-95"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Notificar por WhatsApp / Correo 📧</span>
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ALERTA DE MEDIDAS INUSUALES ANTES DE AGREGAR AL CARRITO           */}
      {/* ========================================================================= */}
      {showUnusualAlertModal && measurementAnalysis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border-4 border-amber-300 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  measurementAnalysis.hasErrors ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  {measurementAnalysis.hasErrors ? (
                    <AlertCircle className="w-7 h-7" />
                  ) : (
                    <AlertTriangle className="w-7 h-7" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                    {measurementAnalysis.hasErrors
                      ? 'Error Anatómico en Medidas'
                      : 'Verificación de Medidas Inusuales'}
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold">
                    Comparación vs Estándar de {measurementAnalysis.benchmark.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowUnusualAlertModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Diagnostic Message */}
            <div className={`p-4 rounded-2xl text-xs space-y-2 leading-relaxed ${
              measurementAnalysis.hasErrors ? 'bg-red-50 text-red-900 border border-red-200' : 'bg-amber-50 text-amber-900 border border-amber-200'
            }`}>
              <p className="font-black text-sm">
                {measurementAnalysis.hasErrors
                  ? '⚠️ Se requiere corrección antes de confeccionar'
                  : '🔍 Atención del Taller Artesanal petsimona25:'}
              </p>
              <ul className="list-disc list-inside space-y-1 font-medium">
                {measurementAnalysis.issues.map((issue, idx) => (
                  <li key={idx}>
                    <strong>{issue.title}:</strong> {issue.message}
                  </li>
                ))}
              </ul>
            </div>

            {/* Side-by-Side Comparison Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider">
                Comparativa: Tus Medidas vs Tabla Estándar
              </h4>
              <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-700 font-black border-b border-slate-200 text-[11px] uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Parámetro</th>
                      <th className="py-2.5 px-3">Tu Medida</th>
                      <th className="py-2.5 px-3">Rango Estándar</th>
                      <th className="py-2.5 px-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {/* Cuello */}
                    <tr className={measurementAnalysis.comparison.neck.status !== 'ideal' ? 'bg-amber-50/50' : ''}>
                      <td className="py-2.5 px-3 font-bold text-slate-900">1. Cuello</td>
                      <td className="py-2.5 px-3 font-black text-slate-900">
                        {neck} {unit} {unit === 'in' ? `(~${Math.round(Number(neck) * 2.54)} cm)` : ''}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                        {unit === 'cm'
                          ? `${measurementAnalysis.benchmark.neckCm.min} - ${measurementAnalysis.benchmark.neckCm.max} cm`
                          : `${(measurementAnalysis.benchmark.neckCm.min / 2.54).toFixed(1)} - ${(measurementAnalysis.benchmark.neckCm.max / 2.54).toFixed(1)} in`}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                          measurementAnalysis.comparison.neck.status === 'ideal'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {measurementAnalysis.comparison.neck.status === 'ideal'
                            ? '✓ Normal'
                            : `${measurementAnalysis.comparison.neck.diffPercent > 0 ? '+' : ''}${measurementAnalysis.comparison.neck.diffPercent}%`}
                        </span>
                      </td>
                    </tr>

                    {/* Pecho */}
                    <tr className={measurementAnalysis.issues.some((i) => i.type === 'inverted_neck_chest') ? 'bg-red-50' : measurementAnalysis.comparison.chest.status !== 'ideal' ? 'bg-amber-50/50' : ''}>
                      <td className="py-2.5 px-3 font-bold text-slate-900">2. Contorno Pecho</td>
                      <td className="py-2.5 px-3 font-black text-slate-900">
                        {chest} {unit} {unit === 'in' ? `(~${Math.round(Number(chest) * 2.54)} cm)` : ''}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                        {unit === 'cm'
                          ? `${measurementAnalysis.benchmark.chestCm.min} - ${measurementAnalysis.benchmark.chestCm.max} cm`
                          : `${(measurementAnalysis.benchmark.chestCm.min / 2.54).toFixed(1)} - ${(measurementAnalysis.benchmark.chestCm.max / 2.54).toFixed(1)} in`}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                          measurementAnalysis.issues.some((i) => i.type === 'inverted_neck_chest')
                            ? 'bg-red-600 text-white'
                            : measurementAnalysis.comparison.chest.status === 'ideal'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {measurementAnalysis.issues.some((i) => i.type === 'inverted_neck_chest')
                            ? '❌ Invertido'
                            : measurementAnalysis.comparison.chest.status === 'ideal'
                            ? '✓ Normal'
                            : `${measurementAnalysis.comparison.chest.diffPercent > 0 ? '+' : ''}${measurementAnalysis.comparison.chest.diffPercent}%`}
                        </span>
                      </td>
                    </tr>

                    {/* Largo */}
                    <tr className={measurementAnalysis.comparison.bodyLength.status !== 'ideal' ? 'bg-amber-50/50' : ''}>
                      <td className="py-2.5 px-3 font-bold text-slate-900">3. Largo Espalda</td>
                      <td className="py-2.5 px-3 font-black text-slate-900">
                        {bodyLength} {unit} {unit === 'in' ? `(~${Math.round(Number(bodyLength) * 2.54)} cm)` : ''}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                        {unit === 'cm'
                          ? `${measurementAnalysis.benchmark.lengthCm.min} - ${measurementAnalysis.benchmark.lengthCm.max} cm`
                          : `${(measurementAnalysis.benchmark.lengthCm.min / 2.54).toFixed(1)} - ${(measurementAnalysis.benchmark.lengthCm.max / 2.54).toFixed(1)} in`}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                          measurementAnalysis.comparison.bodyLength.status === 'ideal'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {measurementAnalysis.comparison.bodyLength.status === 'ideal'
                            ? '✓ Normal'
                            : `${measurementAnalysis.comparison.bodyLength.diffPercent > 0 ? '+' : ''}${measurementAnalysis.comparison.bodyLength.diffPercent}%`}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              {measurementAnalysis.issues.some((i) => i.type === 'inverted_neck_chest') && (
                <button
                  type="button"
                  onClick={handleSwapNeckAndChest}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs transition-colors shadow-xs"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  Invertir Cuello ({neck} {unit}) y Pecho ({chest} {unit}) automáticamente
                </button>
              )}

              <button
                type="button"
                onClick={handleApplySuggestedBreedValues}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-950 font-black text-xs transition-colors border border-orange-300"
              >
                <RefreshCw className="w-3.5 h-3.5 text-orange-600" />
                Aplicar medidas típicas de {measurementAnalysis.benchmark.name} ({measurementAnalysis.benchmark.neckCm.typical} / {measurementAnalysis.benchmark.chestCm.typical} / {measurementAnalysis.benchmark.lengthCm.typical} cm)
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowUnusualAlertModal(false);
                  handleOpenValidationReport();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 font-black text-xs transition-colors border border-amber-300"
              >
                <FileText className="w-3.5 h-3.5 text-amber-700" />
                Abrir Ficha de Validación Técnica (Notificar WhatsApp & Correo) 📋
              </button>

              <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUnusualAlertModal(false)}
                  className="w-full sm:w-1/2 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors text-center"
                >
                  Revisar y corregir medidas
                </button>

                {!measurementAnalysis.hasErrors && (
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmedUnusualMeasurements(true);
                      setShowUnusualAlertModal(false);
                      executeAddToCart();
                    }}
                    className="w-full sm:w-1/2 py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs transition-colors shadow-md text-center flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    Confirmar y Agregar al Carrito
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: TABLA COMPLETA DE MEDIDAS ESTÁNDAR Y GUÍA DE TALLAS              */}
      {/* ========================================================================= */}
      {showStandardsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border-2 border-orange-200 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-black">
                  <Ruler className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    Tabla de Referencia Estándar de Medidas
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold">
                    Taller Artesanal petsimona25 • Rengo, Chile
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowStandardsModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <button
                type="button"
                onClick={() => setStandardsTab('breeds')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  standardsTab === 'breeds'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Por Razas Caninas y Felinas
              </button>
              <button
                type="button"
                onClick={() => setStandardsTab('sizes')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  standardsTab === 'sizes'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Por Tallas Estándar (XXS a L)
              </button>
            </div>

            {/* TAB 1: BREEDS TABLE */}
            {standardsTab === 'breeds' && (
              <div className="space-y-4">
                {/* Search box */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar raza (ej. Poodle, Dachshund, Gato, Bulldog)..."
                    value={searchBreedTable}
                    onChange={(e) => setSearchBreedTable(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border-2 border-slate-200 focus:border-orange-400 focus:outline-hidden text-xs font-bold text-slate-900 bg-slate-50"
                  />
                </div>

                {/* Table */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs max-h-80 overflow-y-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-700 font-black border-b border-slate-200 text-[11px] uppercase sticky top-0">
                      <tr>
                        <th className="py-2.5 px-3">Raza</th>
                        <th className="py-2.5 px-3">Cuello (cm)</th>
                        <th className="py-2.5 px-3">Pecho (cm)</th>
                        <th className="py-2.5 px-3">Largo (cm)</th>
                        <th className="py-2.5 px-3">Talla Base</th>
                        <th className="py-2.5 px-3">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                      {Object.values(BREED_BENCHMARKS)
                        .filter(
                          (b) =>
                            b.name.toLowerCase().includes(searchBreedTable.toLowerCase()) ||
                            b.closestSize.toLowerCase().includes(searchBreedTable.toLowerCase())
                        )
                        .map((b) => (
                          <tr key={b.name} className="hover:bg-orange-50/50 transition-colors">
                            <td className="py-2.5 px-3">
                              <p className="font-bold text-slate-900">{b.name}</p>
                              <p className="text-[10px] text-slate-500">{b.typicalWeightKg}</p>
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[11px]">
                              {b.neckCm.min} - {b.neckCm.max} <span className="text-slate-400 font-sans">({b.neckCm.typical})</span>
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[11px]">
                              {b.chestCm.min} - {b.chestCm.max} <span className="text-slate-400 font-sans">({b.chestCm.typical})</span>
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[11px]">
                              {b.lengthCm.min} - {b.lengthCm.max} <span className="text-slate-400 font-sans">({b.lengthCm.typical})</span>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-800 text-[10px] font-black">
                                {b.closestSize}
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              <button
                                type="button"
                                onClick={() => {
                                  setBreed(b.name);
                                  if (unit === 'cm') {
                                    setNeck(b.neckCm.typical);
                                    setChest(b.chestCm.typical);
                                    setBodyLength(b.lengthCm.typical);
                                  } else {
                                    setNeck(Number((b.neckCm.typical / 2.54).toFixed(1)));
                                    setChest(Number((b.chestCm.typical / 2.54).toFixed(1)));
                                    setBodyLength(Number((b.lengthCm.typical / 2.54).toFixed(1)));
                                  }
                                  setShowStandardsModal(false);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold transition-colors"
                              >
                                Aplicar
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 2: SIZES TABLE */}
            {standardsTab === 'sizes' && (
              <div className="space-y-4">
                <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-700 font-black border-b border-slate-200 text-[11px] uppercase">
                      <tr>
                        <th className="py-2.5 px-3">Talla</th>
                        <th className="py-2.5 px-3">Cuello (cm)</th>
                        <th className="py-2.5 px-3">Pecho (cm)</th>
                        <th className="py-2.5 px-3">Largo (cm)</th>
                        <th className="py-2.5 px-3">Razas de Referencia</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                      {STANDARD_SIZE_CATEGORIES.map((cat) => (
                        <tr key={cat.size} className="hover:bg-orange-50/50 transition-colors">
                          <td className="py-3 px-3">
                            <span className="font-black text-sm text-orange-600 block">{cat.size}</span>
                            <span className="text-[10px] text-slate-500 font-semibold">{cat.weightRange}</span>
                          </td>
                          <td className="py-3 px-3 font-mono text-[11px] font-bold">
                            {cat.neckCm.min} - {cat.neckCm.max} cm
                          </td>
                          <td className="py-3 px-3 font-mono text-[11px] font-bold">
                            {cat.chestCm.min} - {cat.chestCm.max} cm
                          </td>
                          <td className="py-3 px-3 font-mono text-[11px] font-bold">
                            {cat.lengthCm.min} - {cat.lengthCm.max} cm
                          </td>
                          <td className="py-3 px-3 text-slate-600 text-[11px]">
                            {cat.exampleBreeds}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tailor Workshop Footer Note */}
            <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 text-xs text-orange-950 space-y-1">
              <p className="font-black text-orange-900 flex items-center gap-1.5">
                <Scissors className="w-4 h-4 text-orange-600" />
                Nota de Confección Artesanal:
              </p>
              <p className="leading-relaxed">
                En petsimona25 cortamos y cosemos cada prenda a la medida exacta de tu mascota. Si tu perrito o gatito tiene medidas especiales (pecho ancho, lomo largo o contextura robusta), nuestro sistema adaptará el patrón conservando el ajuste perfecto y confortable.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: FICHA Y REPORTE DE VALIDACIÓN DE COMPRA (WHATSAPP & CORREO 📧)   */}
      {/* ========================================================================= */}
      <PurchaseValidationModal
        isOpen={showValidationReportModal}
        onClose={() => setShowValidationReportModal(false)}
        report={validationReport}
        onConfirmAddToCart={() => {
          setConfirmedUnusualMeasurements(true);
          setShowValidationReportModal(false);
          executeAddToCart();
        }}
        onModifyMeasurements={() => {
          setShowValidationReportModal(false);
          const el = document.getElementById('field-neck');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }}
        onApplyBreedTypical={handleApplySuggestedBreedValues}
        onSwapNeckChest={handleSwapNeckAndChest}
      />
    </section>
  );
};

