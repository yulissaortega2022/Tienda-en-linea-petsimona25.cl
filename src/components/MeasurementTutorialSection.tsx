import React, { useState, useEffect } from 'react';
import { Ruler, Volume2, Play, Square, Sparkles, Dog } from 'lucide-react';

export const MeasurementTutorialSection: React.FC = () => {
  const [calcBreed] = useState('Bulldog Francés');
  const [calcNeck, setCalcNeck] = useState<number>(28);
  const [calcChest, setCalcChest] = useState<number>(44);
  const [calcLength, setCalcLength] = useState<number>(34);
  const [unit, setUnit] = useState<'cm' | 'in'>('cm');

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

        {/* 3 Step Guide + Diagram Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-16">
          {/* Left Diagram */}
          <div className="lg:col-span-5 relative">
            <div className="bg-orange-50 rounded-3xl p-4 border-2 border-orange-200 shadow-md space-y-4">
              <div className="relative rounded-2xl overflow-hidden">
                <img
                  src="/src/assets/images/dog_measurement_guide_1786310167528.jpg"
                  alt="Diagrama explicativo de medidas para perros chicos y medianos petsimona25"
                  referrerPolicy="no-referrer"
                  className="w-full h-auto object-cover shadow-xs border border-orange-200"
                />
                <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-xs text-yellow-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider border border-slate-700">
                  Especial Perros Chicos &amp; Medianos
                </div>
              </div>

              <div className="p-3 bg-yellow-400 text-slate-900 rounded-xl text-xs font-black flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-slate-900 shrink-0" />
                <span>
                  <strong>Tip Razas Chicas/Medianas:</strong> Para Pug y Bulldog Francés, mide el pecho con holgura. Para Salchicha (Teckel), el largo de lomo es determinante.
                </span>
              </div>
            </div>
          </div>

          {/* Right 3 Detailed Steps with Audio buttons */}
          <div className="lg:col-span-7 space-y-5">
            {/* Step 1 */}
            <div className="p-5 rounded-2xl bg-orange-50/80 border-2 border-orange-200 hover:bg-orange-100/50 transition-colors space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-md">
                    1
                  </div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    1. Cuello (Contorno de Cuello)
                    <span className="text-xs font-black text-orange-700 bg-orange-200/80 px-2 py-0.5 rounded-full">
                      Punto A
                    </span>
                  </h3>
                </div>

                <button
                  onClick={() => speakText(neckScript, 'neck')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                    isPlayingAudio && currentAudioStep === 'neck'
                      ? 'bg-red-500 text-white'
                      : 'bg-orange-200 hover:bg-orange-300 text-orange-950'
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  {isPlayingAudio && currentAudioStep === 'neck' ? 'Detener' : 'Audio Paso 1'}
                </button>
              </div>

              <p className="text-xs text-slate-700 font-medium leading-relaxed sm:pl-13">
                Mide el contorno de la base del cuello de tu perro chico o mediano, justo donde reposa su collar. Mantén la cinta cómoda (debe quedar espacio para 2 dedos).
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-2xl bg-yellow-50/90 border-2 border-yellow-300 hover:bg-yellow-100/50 transition-colors space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-yellow-400 text-slate-900 font-black text-lg flex items-center justify-center shrink-0 shadow-md">
                    2
                  </div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    2. Pecho (Tórax) • Clave Perros Chicos/Medianos
                    <span className="text-xs font-black text-slate-900 bg-yellow-300 px-2 py-0.5 rounded-full">
                      Punto B
                    </span>
                  </h3>
                </div>

                <button
                  onClick={() => speakText(chestScript, 'chest')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                    isPlayingAudio && currentAudioStep === 'chest'
                      ? 'bg-red-500 text-white'
                      : 'bg-yellow-300 hover:bg-yellow-400 text-slate-900'
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  {isPlayingAudio && currentAudioStep === 'chest' ? 'Detener' : 'Audio Paso 2'}
                </button>
              </div>

              <p className="text-xs text-slate-700 font-medium leading-relaxed sm:pl-13">
                Pasa la cinta métrica por la parte más ancha del pecho, detrás de sus patas delanteras. Es la medida crucial para que chalecos y polerones no le aprieten el tórax.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-2xl bg-orange-50/80 border-2 border-orange-200 hover:bg-orange-100/50 transition-colors space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-md">
                    3
                  </div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    3. Largo de Cuerpo (Espalda / Lomo)
                    <span className="text-xs font-black text-orange-700 bg-orange-200/80 px-2 py-0.5 rounded-full">
                      Punto C
                    </span>
                  </h3>
                </div>

                <button
                  onClick={() => speakText(lengthScript, 'length')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                    isPlayingAudio && currentAudioStep === 'length'
                      ? 'bg-red-500 text-white'
                      : 'bg-orange-200 hover:bg-orange-300 text-orange-950'
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  {isPlayingAudio && currentAudioStep === 'length' ? 'Detener' : 'Audio Paso 3'}
                </button>
              </div>

              <p className="text-xs text-slate-700 font-medium leading-relaxed sm:pl-13">
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
