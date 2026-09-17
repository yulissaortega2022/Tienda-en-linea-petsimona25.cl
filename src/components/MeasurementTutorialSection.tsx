import React, { useState, useEffect } from 'react';
import {
  Ruler,
  Volume2,
  Play,
  Square,
  Sparkles,
  Dog,
  ChevronLeft,
  ChevronRight,
  Pause,
  ArrowRight,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import measureNeckImg from '../assets/images/measure_dog_neck_1789668810564.jpg';
import measureChestImg from '../assets/images/measure_dog_chest_1789668823726.jpg';
import measureBackImg from '../assets/images/measure_dog_back_1789668835263.jpg';
import measurementDiagramImg from '../assets/images/dog_measurement_guide_1786310167528.jpg';

interface MeasurementSlide {
  id: 'neck' | 'chest' | 'length' | 'overview';
  tabLabel: string;
  stepNumber: string;
  pointBadge: string;
  badgeClass: string;
  title: string;
  shortDescription: string;
  placementGuide: string;
  atelierTip: string;
  slackNotice: string;
  image: string;
  alt: string;
  audioStep: 'neck' | 'chest' | 'length' | 'all';
}

const MEASUREMENT_SLIDES: MeasurementSlide[] = [
  {
    id: 'neck',
    tabLabel: '1. Cuello',
    stepNumber: 'Paso 1',
    pointBadge: 'Punto A',
    badgeClass: 'bg-orange-500 text-white',
    title: 'Cómo Medir el Cuello',
    shortDescription: 'Circunferencia de la base del cuello donde descansa naturalmente el collar.',
    placementGuide: 'Envuelve la cinta métrica flexible alrededor de la base del cuello, no en la garganta alta.',
    atelierTip: 'Deja siempre una holgura de 2 dedos (aprox. 1.5 a 2 cm) para que la prenda no apriete ni tire del pelaje.',
    slackNotice: 'Holgura sugerida: 2 dedos de espacio cómodo',
    image: measureNeckImg,
    alt: 'Fotografía demostrativa paso a paso: Cómo medir el contorno de cuello en perro pequeño o mediano con cinta de sastre',
    audioStep: 'neck',
  },
  {
    id: 'chest',
    tabLabel: '2. Pecho (Clave)',
    stepNumber: 'Paso 2',
    pointBadge: 'Punto B • Clave',
    badgeClass: 'bg-amber-400 text-slate-950',
    title: 'Cómo Medir el Pecho (Tórax)',
    shortDescription: 'Parte más ancha de la caja torácica, inmediatamente detrás de las patas delanteras.',
    placementGuide: 'Pasa la cinta alrededor del pecho en su punto de mayor volumen. Es la medida número 1 para evitar prendas apretadas.',
    atelierTip: 'Para perros de caja torácica ancha (Pug, Bulldog Francés, Boston Terrier), mide con el perro de pie y añade 2 a 3 cm de movimiento.',
    slackNotice: '¡Medida principal! Define el talle ergonómico',
    image: measureChestImg,
    alt: 'Fotografía demostrativa paso a paso: Cómo medir el contorno de tórax y pecho detrás de patas delanteras',
    audioStep: 'chest',
  },
  {
    id: 'length',
    tabLabel: '3. Largo Espalda',
    stepNumber: 'Paso 3',
    pointBadge: 'Punto C',
    badgeClass: 'bg-orange-500 text-white',
    title: 'Cómo Medir el Largo de Espalda (Lomo)',
    shortDescription: 'Línea recta sobre la columna vertebral desde la base del cuello hasta el nacimiento de la cola.',
    placementGuide: 'Coloca el inicio de la cinta en la cruz (base del cuello) y extiéndela a lo largo del lomo hasta donde inicia la cola.',
    atelierTip: 'El perro DEBE estar de pie erguido sobre sus cuatro patas. Si está sentado o echado, el lomo se arquea y la medida saldrá corta.',
    slackNotice: 'Perro siempre de pie; vital para Teckel / Salchicha y Galgos',
    image: measureBackImg,
    alt: 'Fotografía demostrativa paso a paso: Cómo medir la longitud de espalda de una mascota desde la cruz a la cola',
    audioStep: 'length',
  },
  {
    id: 'overview',
    tabLabel: 'Diagrama General',
    stepNumber: 'Visión Global',
    pointBadge: 'Puntos A, B y C',
    badgeClass: 'bg-emerald-500 text-white',
    title: 'Diagrama Anatómico Completo',
    shortDescription: 'Los 3 puntos fundamentales del patronaje artesanal petsimona25 combinados.',
    placementGuide: 'Con estos 3 números exactos, nuestro taller en Rengo ajusta la sisa, cuello y faldón de la prenda a la perfección.',
    atelierTip: 'Si las medidas de tu perro caen entre dos tallas, o si es de raza con anatomía particular, confeccionamos 100% a medida.',
    slackNotice: 'Calce perfecto garantizado para perros chicos y medianos',
    image: measurementDiagramImg,
    alt: 'Diagrama anatómico general con puntos A B y C de medición de ropa para mascotas',
    audioStep: 'all',
  },
];

export const MeasurementTutorialSection: React.FC = () => {
  const [calcBreed] = useState('Bulldog Francés');
  const [calcNeck, setCalcNeck] = useState<number>(28);
  const [calcChest, setCalcChest] = useState<number>(44);
  const [calcLength, setCalcLength] = useState<number>(34);
  const [unit, setUnit] = useState<'cm' | 'in'>('cm');

  // Slider State
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(false);

  // Audio Narration State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentAudioStep, setCurrentAudioStep] = useState<'all' | 'neck' | 'chest' | 'length' | null>(null);

  // Convert for calculations if inches
  const chestCm = unit === 'in' ? calcChest * 2.54 : calcChest;

  // Sizing estimation logic specifically tuned for PERROS CHICOS Y MEDIANOS
  let estimatedSize = 'S';
  let sizeNote = 'Talla Pequeña-Mediana';
  let recommendedBreeds = 'Poodle, Shih Tzu, Schnauzer Mini';

  if (chestCm < 30) {
    estimatedSize = 'XXS (Mini / Toy)';
    sizeNote = 'Perro Chico Mini / Chihuahua, Pinscher, Cachorro';
    recommendedBreeds = 'Chihuahua, Pinscher Mini, Yorkshire Toy';
  } else if (chestCm >= 30 && chestCm < 38) {
    estimatedSize = 'XS (Chico)';
    sizeNote = 'Perro Chico / Pomerania, Poodle Toy, Maltés';
    recommendedBreeds = 'Pomerania, Poodle Toy, Bichón Maltés';
  } else if (chestCm >= 38 && chestCm < 46) {
    estimatedSize = 'S (Chico-Mediano)';
    sizeNote = 'Perro Chico a Mediano / Shih Tzu, Schnauzer Mini';
    recommendedBreeds = 'Shih Tzu, Schnauzer Mini, Pekines';
  } else if (chestCm >= 46 && chestCm < 56) {
    estimatedSize = 'M (Mediano)';
    sizeNote = 'Perro Mediano / Pug, Bulldog Francés, Salchicha';
    recommendedBreeds = 'Pug, Bulldog Francés, Teckel / Salchicha';
  } else if (chestCm >= 56 && chestCm < 68) {
    estimatedSize = 'L (Mediano Estándar)';
    sizeNote = 'Perro Mediano Robusto / Beagle, Cocker, Boston Terrier';
    recommendedBreeds = 'Beagle, Cocker Spaniel, Boston Terrier, Bull Terrier Mini';
  } else {
    estimatedSize = 'L (Mediano-Grande)';
    sizeNote = 'Límite Superior Mediano (Sugerimos Confección Especial A la Medida)';
    recommendedBreeds = 'Border Collie, Bulldog Inglés chico';
  }

  // Audio Speech Synthesis Handler
  const speakText = (text: string, step: 'all' | 'neck' | 'chest' | 'length') => {
    if (!('speechSynthesis' in window)) {
      alert('Tu navegador no soporta síntesis de audio, pero puedes leer las instrucciones detalladas a continuación.');
      return;
    }

    window.speechSynthesis.cancel();

    if (isPlayingAudio && currentAudioStep === step) {
      setIsPlayingAudio(false);
      setCurrentAudioStep(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 0.95;

    utterance.onstart = () => {
      setIsPlayingAudio(true);
      setCurrentAudioStep(step);
    };

    utterance.onend = () => {
      setIsPlayingAudio(false);
      setCurrentAudioStep(null);
    };

    utterance.onerror = () => {
      setIsPlayingAudio(false);
      setCurrentAudioStep(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
    setCurrentAudioStep(null);
  };

  // Auto-play timer for carousel
  useEffect(() => {
    if (!isAutoPlay) return;

    const timer = setInterval(() => {
      setActiveSlideIndex((prev) => (prev === MEASUREMENT_SLIDES.length - 1 ? 0 : prev + 1));
    }, 4500);

    return () => clearInterval(timer);
  }, [isAutoPlay]);

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const fullAudioScript =
    'Bienvenido a la guía de medidas petsimona25 para perros chicos y medianos. Paso 1: Mide el contorno del cuello en la base, dejando espacio para dos dedos. Paso 2: Mide el contorno del pecho por la parte más ancha, justo detrás de sus patas delanteras. Esta es la medida más importante. Paso 3: Mide el largo del cuerpo desde la base del cuello hasta el inicio de la cola. Si tu perro es de raza salchicha o bulldog, nuestro taller aplicará patronaje especial a la medida.';

  const neckScript =
    'Paso 1: Medida del cuello para perros chicos y medianos. Mide la base del cuello donde descansa el collar. Deja espacio de dos dedos para no apretar.';

  const chestScript =
    'Paso 2: Medida del contorno del pecho. Es la medida más importante para perros chicos y medianos como pug, bulldog francés o poodle. Pasa la cinta justo detrás de las patas delanteras.';

  const lengthScript =
    'Paso 3: Largo de espalda. Mide desde la base del cuello hasta el inicio de la cola con el perro parado erguido.';

  const handlePrevSlide = () => {
    setActiveSlideIndex((prev) => (prev === 0 ? MEASUREMENT_SLIDES.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setActiveSlideIndex((prev) => (prev === MEASUREMENT_SLIDES.length - 1 ? 0 : prev + 1));
  };

  const currentSlide = MEASUREMENT_SLIDES[activeSlideIndex];

  const getAudioScriptForSlide = (step: 'neck' | 'chest' | 'length' | 'all') => {
    switch (step) {
      case 'neck':
        return neckScript;
      case 'chest':
        return chestScript;
      case 'length':
        return lengthScript;
      case 'all':
      default:
        return fullAudioScript;
    }
  };

  return (
    <section id="tutorial-medidas" className="py-16 bg-white border-b-2 border-orange-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-yellow-400 text-slate-900 font-black text-xs uppercase tracking-wider">
            <Ruler className="w-4 h-4 text-slate-900" />
            <span>Guía de Tallas para Perros Chicos y Medianos</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            ¿Cómo Medir a tu Perro Chico o Mediano? 🐕
          </h2>
          <p className="text-slate-600 text-base font-medium">
            Sigue estos 3 sencillos pasos para razas pequeñas y medianas (Chihuahua, Pug, Bulldog Francés, Salchicha, Cocker, etc.). Incluye audio explicativo narrado paso a paso.
          </p>
        </div>

        {/* Audio Narration Control Banner */}
        <div className="mb-12 bg-slate-900 text-white rounded-3xl p-5 border-2 border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <Volume2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-white text-base">Audio Explicativo Guiado 🎧</h3>
                {isPlayingAudio && (
                  <span className="flex items-center gap-1 text-[10px] font-black text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-700 animate-pulse">
                    Reproduciendo Audio...
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Escucha la narración con instrucciones paso a paso para medir a tu mascota.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isPlayingAudio ? (
              <button
                onClick={stopAudio}
                className="bg-red-500 hover:bg-red-600 text-white font-black px-5 py-2.5 rounded-2xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-md"
              >
                <Square className="w-4 h-4 fill-current" /> Detener Audio
              </button>
            ) : (
              <button
                onClick={() => speakText(fullAudioScript, 'all')}
                className="bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-black px-6 py-2.5 rounded-2xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-md active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" /> Reproducir Audio Completo
              </button>
            )}
          </div>
        </div>

        {/* 3 Step Guide + Interactive Visual Slider Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start mb-16">
          {/* Left Column: Interactive Visual Measurement Slider / Carousel */}
          <div className="lg:col-span-6 xl:col-span-6 space-y-4">
            {/* Slider Card Container */}
            <div className="bg-gradient-to-b from-orange-50 to-amber-50/50 rounded-3xl p-4 sm:p-5 border-2 border-orange-200 shadow-lg space-y-4">
              {/* Carousel Tab Pills Header */}
              <div className="flex items-center justify-between gap-2 border-b border-orange-200/80 pb-3 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-black uppercase text-orange-950 bg-orange-200/80 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-orange-600" />
                    <span>Visor Visual Interactivo</span>
                  </span>
                  <span className="text-[11px] font-bold text-slate-500">
                    {activeSlideIndex + 1} de {MEASUREMENT_SLIDES.length}
                  </span>
                </div>

                {/* Auto-Play Toggle & Step Counter */}
                <button
                  type="button"
                  onClick={() => setIsAutoPlay(!isAutoPlay)}
                  className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors cursor-pointer ${
                    isAutoPlay
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-orange-100 hover:bg-orange-200 text-orange-900'
                  }`}
                  title={isAutoPlay ? 'Pausar avance automático' : 'Activar carrusel automático'}
                >
                  {isAutoPlay ? (
                    <>
                      <Pause className="w-3 h-3" />
                      <span>Auto Activo</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3" />
                      <span>Auto Slider</span>
                    </>
                  )}
                </button>
              </div>

              {/* Slider Quick Tabs Navigation with Photo Thumbnails */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 bg-orange-100/70 rounded-2xl">
                {MEASUREMENT_SLIDES.map((slide, idx) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => {
                      setActiveSlideIndex(idx);
                      setIsAutoPlay(false);
                    }}
                    className={`p-1.5 rounded-xl transition-all flex items-center gap-2 text-left cursor-pointer border ${
                      activeSlideIndex === idx
                        ? 'bg-slate-900 text-yellow-300 border-slate-900 shadow-sm'
                        : 'bg-white/80 hover:bg-white text-slate-800 border-orange-200/60'
                    }`}
                  >
                    <img
                      src={slide.image}
                      alt={slide.tabLabel}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-lg object-cover shrink-0 border border-black/10"
                    />
                    <div className="min-w-0 flex-1">
                      <p className={`text-[11px] font-black truncate ${activeSlideIndex === idx ? 'text-yellow-300' : 'text-slate-900'}`}>
                        {slide.tabLabel}
                      </p>
                      <p className={`text-[9px] font-semibold truncate ${activeSlideIndex === idx ? 'text-slate-300' : 'text-slate-500'}`}>
                        {slide.stepNumber}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Main Visual Slide Stage */}
              <div className="relative rounded-2xl overflow-hidden border-2 border-orange-200 shadow-md bg-slate-950 aspect-[4/3] group">
                <img
                  key={currentSlide.id}
                  src={currentSlide.image}
                  alt={currentSlide.alt}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center transition-all duration-500 group-hover:scale-102 select-none"
                />

                {/* Dark Gradient Overlay for optimal readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 pointer-events-none" />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none flex-wrap">
                  <span className={`${currentSlide.badgeClass} text-xs font-black px-3 py-1 rounded-full shadow-md flex items-center gap-1.5`}>
                    <span>{currentSlide.stepNumber}:</span>
                    <span>{currentSlide.pointBadge}</span>
                  </span>

                  <span className="bg-slate-900/90 backdrop-blur-xs text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-400/40 shadow-sm">
                    Taller Rengo • Confección a la Medida
                  </span>
                </div>

                {/* Navigation Arrow Left */}
                <button
                  type="button"
                  onClick={() => {
                    handlePrevSlide();
                    setIsAutoPlay(false);
                  }}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-950 text-white flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-lg transition-transform active:scale-95 cursor-pointer"
                  aria-label="Paso anterior de medición"
                >
                  <ChevronLeft className="w-5 h-5 text-yellow-300" />
                </button>

                {/* Navigation Arrow Right */}
                <button
                  type="button"
                  onClick={() => {
                    handleNextSlide();
                    setIsAutoPlay(false);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-950 text-white flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-lg transition-transform active:scale-95 cursor-pointer"
                  aria-label="Siguiente paso de medición"
                >
                  <ChevronRight className="w-5 h-5 text-yellow-300" />
                </button>

                {/* Bottom Overlay Title & Subtitle */}
                <div className="absolute bottom-3 left-3 right-3 pointer-events-none text-white space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-black text-white drop-shadow-md">
                      {currentSlide.title}
                    </h3>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-200 font-medium line-clamp-1 drop-shadow-sm">
                    {currentSlide.shortDescription}
                  </p>
                </div>
              </div>

              {/* Slider Pagination Dots */}
              <div className="flex items-center justify-center gap-2 pt-1">
                {MEASUREMENT_SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setActiveSlideIndex(idx);
                      setIsAutoPlay(false);
                    }}
                    className={`transition-all rounded-full cursor-pointer ${
                      activeSlideIndex === idx
                        ? 'w-7 h-2.5 bg-orange-500 shadow-sm'
                        : 'w-2.5 h-2.5 bg-orange-200 hover:bg-orange-300'
                    }`}
                    aria-label={`Ir al paso ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Slide Detail Callout Box */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-orange-200 shadow-xs space-y-2 text-left">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-black text-xs flex items-center justify-center">
                      📍
                    </span>
                    <strong className="text-xs sm:text-sm font-black text-slate-900">
                      Instrucción del Sastre:
                    </strong>
                  </div>

                  {/* Audio narration button for this specific slide */}
                  <button
                    type="button"
                    onClick={() => speakText(getAudioScriptForSlide(currentSlide.audioStep), currentSlide.audioStep)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                      isPlayingAudio && currentAudioStep === currentSlide.audioStep
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>
                      {isPlayingAudio && currentAudioStep === currentSlide.audioStep
                        ? 'Detener Audio'
                        : `Audio: ${currentSlide.stepNumber}`}
                    </span>
                  </button>
                </div>

                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  {currentSlide.placementGuide}
                </p>

                {/* Sastre Tip Banner */}
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-900 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">Tip de Calce: </strong>
                    <span>{currentSlide.atelierTip}</span>
                  </div>
                </div>

                {/* Quick Next Button */}
                <div className="pt-1 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-bold text-orange-700">
                    💡 {currentSlide.slackNotice}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      handleNextSlide();
                      setIsAutoPlay(false);
                    }}
                    className="text-slate-900 hover:text-orange-600 font-black flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>
                      {activeSlideIndex === MEASUREMENT_SLIDES.length - 1
                        ? 'Volver al Paso 1'
                        : 'Siguiente Paso'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 3 Detailed Synced Steps with Audio Controls */}
          <div className="lg:col-span-6 xl:col-span-6 space-y-4">
            <div className="bg-slate-900 text-white p-3.5 rounded-2xl flex items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-bold text-slate-200">
                  Haz clic en cualquier paso para verlo en el visor visual:
                </span>
              </div>
              <span className="text-[11px] font-black text-amber-300 bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700">
                Paso {activeSlideIndex < 3 ? activeSlideIndex + 1 : 'General'} Activo
              </span>
            </div>

            {/* Step 1: Cuello */}
            <div
              onClick={() => {
                setActiveSlideIndex(0);
                setIsAutoPlay(false);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setActiveSlideIndex(0);
                  setIsAutoPlay(false);
                }
              }}
              className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                activeSlideIndex === 0
                  ? 'bg-orange-100/90 border-orange-500 shadow-md ring-2 ring-orange-400/30'
                  : 'bg-orange-50/60 border-orange-200 hover:bg-orange-100/50'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl font-black text-lg flex items-center justify-center shrink-0 shadow-md ${
                    activeSlideIndex === 0 ? 'bg-orange-600 text-white' : 'bg-orange-500 text-white'
                  }`}>
                    1
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                      <span>1. Cuello (Contorno de Cuello)</span>
                      <span className="text-xs font-black text-orange-700 bg-orange-200/80 px-2 py-0.5 rounded-full">
                        Punto A
                      </span>
                    </h3>
                    {activeSlideIndex === 0 && (
                      <span className="text-[10px] font-black text-orange-700 flex items-center gap-1 mt-0.5">
                        <Eye className="w-3 h-3" /> Viendo foto demostrativa en el visor
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakText(neckScript, 'neck');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                    isPlayingAudio && currentAudioStep === 'neck'
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-orange-200 hover:bg-orange-300 text-orange-950'
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isPlayingAudio && currentAudioStep === 'neck' ? 'Detener' : 'Audio Paso 1'}</span>
                </button>
              </div>

              <p className="text-xs text-slate-700 font-medium leading-relaxed sm:pl-13 mt-2">
                Mide el contorno de la base del cuello de tu perro chico o mediano, justo donde reposa su collar. Mantén la cinta cómoda (debe quedar espacio para 2 dedos).
              </p>
            </div>

            {/* Step 2: Pecho (Clave) */}
            <div
              onClick={() => {
                setActiveSlideIndex(1);
                setIsAutoPlay(false);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setActiveSlideIndex(1);
                  setIsAutoPlay(false);
                }
              }}
              className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                activeSlideIndex === 1
                  ? 'bg-yellow-100/90 border-amber-500 shadow-md ring-2 ring-amber-400/40'
                  : 'bg-yellow-50/70 border-yellow-300 hover:bg-yellow-100/50'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl font-black text-lg flex items-center justify-center shrink-0 shadow-md ${
                    activeSlideIndex === 1 ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-500' : 'bg-yellow-400 text-slate-900'
                  }`}>
                    2
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                      <span>2. Pecho (Tórax) • Clave Perros Chicos/Medianos</span>
                      <span className="text-xs font-black text-slate-950 bg-amber-300 px-2 py-0.5 rounded-full">
                        Punto B
                      </span>
                    </h3>
                    {activeSlideIndex === 1 && (
                      <span className="text-[10px] font-black text-amber-900 flex items-center gap-1 mt-0.5">
                        <Eye className="w-3 h-3" /> Viendo foto demostrativa en el visor
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakText(chestScript, 'chest');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                    isPlayingAudio && currentAudioStep === 'chest'
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-yellow-300 hover:bg-yellow-400 text-slate-900'
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isPlayingAudio && currentAudioStep === 'chest' ? 'Detener' : 'Audio Paso 2'}</span>
                </button>
              </div>

              <p className="text-xs text-slate-700 font-medium leading-relaxed sm:pl-13 mt-2">
                Pasa la cinta métrica por la parte más ancha del pecho, detrás de sus patas delanteras. Es la medida crucial para que chalecos y polerones no le aprieten el tórax.
              </p>
            </div>

            {/* Step 3: Largo Espalda */}
            <div
              onClick={() => {
                setActiveSlideIndex(2);
                setIsAutoPlay(false);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setActiveSlideIndex(2);
                  setIsAutoPlay(false);
                }
              }}
              className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                activeSlideIndex === 2
                  ? 'bg-orange-100/90 border-orange-500 shadow-md ring-2 ring-orange-400/30'
                  : 'bg-orange-50/60 border-orange-200 hover:bg-orange-100/50'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl font-black text-lg flex items-center justify-center shrink-0 shadow-md ${
                    activeSlideIndex === 2 ? 'bg-orange-600 text-white' : 'bg-orange-500 text-white'
                  }`}>
                    3
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                      <span>3. Largo de Cuerpo (Espalda / Lomo)</span>
                      <span className="text-xs font-black text-orange-700 bg-orange-200/80 px-2 py-0.5 rounded-full">
                        Punto C
                      </span>
                    </h3>
                    {activeSlideIndex === 2 && (
                      <span className="text-[10px] font-black text-orange-700 flex items-center gap-1 mt-0.5">
                        <Eye className="w-3 h-3" /> Viendo foto demostrativa en el visor
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakText(lengthScript, 'length');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                    isPlayingAudio && currentAudioStep === 'length'
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-orange-200 hover:bg-orange-300 text-orange-950'
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isPlayingAudio && currentAudioStep === 'length' ? 'Detener' : 'Audio Paso 3'}</span>
                </button>
              </div>

              <p className="text-xs text-slate-700 font-medium leading-relaxed sm:pl-13 mt-2">
                Mide a lo largo del lomo, desde la base del cuello hasta el inicio de la cola con el perrito de pie. Muy importante para perros largos como el Teckel / Salchicha.
              </p>
            </div>
          </div>
        </div>

        {/* Reference Table for Small & Medium Dogs */}
        <div className="mb-12 bg-orange-50/60 rounded-3xl p-6 border-2 border-orange-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Dog className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-black text-slate-900">
              Tabla de Tallas Referencial para Perros Chicos y Medianos 📏
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b-2 border-orange-200 text-slate-900 font-black uppercase text-[11px] tracking-wider">
                  <th className="pb-3 pr-4">Talla</th>
                  <th className="pb-3 pr-4">Cuello (cm)</th>
                  <th className="pb-3 pr-4">Pecho (cm)</th>
                  <th className="pb-3 pr-4">Largo Lomo (cm)</th>
                  <th className="pb-3">Razas Chicas y Medianas Frecuentes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-200/60 font-medium text-slate-700">
                <tr>
                  <td className="py-2.5 pr-4 font-black text-orange-600">XXS (Toy)</td>
                  <td className="py-2.5 pr-4">18 - 22 cm</td>
                  <td className="py-2.5 pr-4 font-bold text-slate-900">24 - 30 cm</td>
                  <td className="py-2.5 pr-4">20 - 24 cm</td>
                  <td className="py-2.5">Chihuahua, Pinscher Toy, Yorkshire Mini</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 font-black text-orange-600">XS (Chico)</td>
                  <td className="py-2.5 pr-4">22 - 26 cm</td>
                  <td className="py-2.5 pr-4 font-bold text-slate-900">30 - 38 cm</td>
                  <td className="py-2.5 pr-4">25 - 29 cm</td>
                  <td className="py-2.5">Pomerania, Poodle Toy, Bichón Maltés</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 font-black text-orange-600">S (Chico-Mediano)</td>
                  <td className="py-2.5 pr-4">26 - 30 cm</td>
                  <td className="py-2.5 pr-4 font-bold text-slate-900">38 - 46 cm</td>
                  <td className="py-2.5 pr-4">30 - 35 cm</td>
                  <td className="py-2.5">Shih Tzu, Schnauzer Mini, Pekines</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 font-black text-orange-600">M (Mediano)</td>
                  <td className="py-2.5 pr-4">30 - 36 cm</td>
                  <td className="py-2.5 pr-4 font-bold text-slate-900">46 - 56 cm</td>
                  <td className="py-2.5 pr-4">35 - 42 cm</td>
                  <td className="py-2.5">Pug, Bulldog Francés, Teckel / Salchicha</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 font-black text-orange-600">L (Mediano Estándar)</td>
                  <td className="py-2.5 pr-4">36 - 42 cm</td>
                  <td className="py-2.5 pr-4 font-bold text-slate-900">56 - 68 cm</td>
                  <td className="py-2.5 pr-4">42 - 50 cm</td>
                  <td className="py-2.5">Beagle, Cocker Spaniel, Boston Terrier</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Interactive Size Estimator Widget tuned for Small & Medium Dogs */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-black text-yellow-400 bg-slate-800 px-3 py-1 rounded-full mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Calculadora de Talla para Perros Chicos &amp; Medianos
              </div>
              <h3 className="text-2xl font-black text-white">
                Calcula la Talla Exacta de tu Perro Chico / Mediano
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Mueve los deslizadores de cuello, pecho y largo para conocer la talla sugerida.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-800 p-1.5 rounded-2xl border border-slate-700 text-xs font-bold">
              <span className="text-slate-300 px-2">Unidad:</span>
              <button
                onClick={() => setUnit('cm')}
                className={`px-3 py-1 rounded-xl font-extrabold transition-colors ${
                  unit === 'cm' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                cm
              </button>
              <button
                onClick={() => setUnit('in')}
                className={`px-3 py-1 rounded-xl font-extrabold transition-colors ${
                  unit === 'in' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                in
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            {/* Slider Cuello */}
            <div className="space-y-2 bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">Cuello:</span>
                <span className="text-yellow-400 font-mono font-black text-sm">
                  {calcNeck} {unit}
                </span>
              </div>
              <input
                type="range"
                min={unit === 'cm' ? 15 : 6}
                max={unit === 'cm' ? 50 : 20}
                value={calcNeck}
                onChange={(e) => setCalcNeck(Number(e.target.value))}
                className="w-full accent-orange-500 cursor-pointer"
              />
            </div>

            {/* Slider Pecho */}
            <div className="space-y-2 bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-yellow-300">Contorno Pecho:</span>
                <span className="text-yellow-400 font-mono font-black text-sm">
                  {calcChest} {unit}
                </span>
              </div>
              <input
                type="range"
                min={unit === 'cm' ? 20 : 8}
                max={unit === 'cm' ? 75 : 30}
                value={calcChest}
                onChange={(e) => setCalcChest(Number(e.target.value))}
                className="w-full accent-yellow-400 cursor-pointer"
              />
            </div>

            {/* Slider Largo */}
            <div className="space-y-2 bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">Largo Espalda:</span>
                <span className="text-yellow-400 font-mono font-black text-sm">
                  {calcLength} {unit}
                </span>
              </div>
              <input
                type="range"
                min={unit === 'cm' ? 15 : 6}
                max={unit === 'cm' ? 60 : 24}
                value={calcLength}
                onChange={(e) => setCalcLength(Number(e.target.value))}
                className="w-full accent-orange-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Sizing Result Banner */}
          <div className="mt-6 p-4 rounded-2xl bg-slate-800 border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-orange-500 text-white font-black text-xl flex items-center justify-center shrink-0 shadow-md">
                {estimatedSize.split(' ')[0]}
              </div>
              <div>
                <p className="text-xs text-yellow-400 font-bold">Talla Sugerida Perro Chico / Mediano:</p>
                <h4 className="text-lg font-black text-white">{estimatedSize} - {sizeNote}</h4>
                <p className="text-xs text-slate-300 font-medium">Razas asociadas: {recommendedBreeds}</p>
              </div>
            </div>

            <a
              href="#medidas-form"
              className="bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-black px-6 py-3 rounded-xl transition-all shadow-md text-sm whitespace-nowrap uppercase tracking-wider"
            >
              Coser con estas medidas →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
