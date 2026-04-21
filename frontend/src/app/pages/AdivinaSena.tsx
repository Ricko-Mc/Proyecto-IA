import { type ReactNode, useState } from 'react';

function Confetti() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      {Array.from({ length: 42 }).map((_, i) => {
        const colors = ['#60A5FA', '#A78BFA', '#F59E0B', '#34D399', '#F472B6', '#FACC15'];
        const size = 6 + Math.random() * 8;

        return (
          <span
            key={i}
            className="absolute rounded-sm"
            style={{
              left: `${Math.random() * 100}%`,
              top: '-20px',
              width: `${size}px`,
              height: `${size * 0.6}px`,
              backgroundColor: colors[Math.floor(Math.random() * colors.length)],
              transform: `rotate(${Math.random() * 360}deg)`,
              animation: `confetti-fall ${1.8 + Math.random() * 1.6}s ease-in forwards`,
              animationDelay: `${Math.random() * 0.25}s`,
            }}
          />
        );
      })}

      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(105vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

import { useLocation, useNavigate } from 'react-router';
import type { ElementType } from 'react';
import {
  Apple,
  BookOpen,
  Dice5,
  Hand,
  Palette,
  PawPrint,
} from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { VideoPlayer } from '../components/VideoPlayer';

type GameState = 'playing' | 'correct' | 'wrong';
type Categoria =
  | 'colores'
  | 'animales'
  | 'alimentos'
  | 'saludos'
  | 'mixta'
  | 'abecedario';

interface Signo {
  signo_id: string;
  palabra: string;
  categoria: string;
  url_video: string;
}

interface CategoriaItem {
  id: Categoria;
  label: string;
  descripcion: string;
  Icono: ElementType;
  fondo: string;
  borde: string;
  acento: string;
  iconBoxFondo: string;
}

const CATEGORIAS: CategoriaItem[] = [
  {
    id: 'mixta',
    label: 'Mixta',
    descripcion: 'Preguntas variadas para practicar de forma general.',
    Icono: Dice5,
    fondo: 'from-[#c9b4e8] via-[#bda5e3] to-[#b395dd]',
    borde: 'border-[#b395dd]',
    acento: 'from-[#8b6fb5] to-[#7a5fa5]',
    iconBoxFondo: 'from-[#dfd0f2] to-[#d2c2ed]',
  },
  {
    id: 'colores',
    label: 'Colores',
    descripcion: 'Reconoce tonos y vocabulario visual básico.',
    Icono: Palette,
    fondo: 'from-[#f0b4a5] via-[#eaa599] to-[#e4968d]',
    borde: 'border-[#e4968d]',
    acento: 'from-[#d97965] to-[#c45a4a]',
    iconBoxFondo: 'from-[#f5d0c5] to-[#f0c1b5]',
  },
  {
    id: 'animales',
    label: 'Animales',
    descripcion: 'Relaciona señas con nombres de animales.',
    Icono: PawPrint,
    fondo: 'from-[#a6e2bd] via-[#99dab3] to-[#8cd2a9]',
    borde: 'border-[#8cd2a9]',
    acento: 'from-[#62b89a] to-[#509d80]',
    iconBoxFondo: 'from-[#c5ead6] to-[#b5e3ce]',
  },
  {
    id: 'alimentos',
    label: 'Alimentos',
    descripcion: 'Practica vocabulario de comida y bebida.',
    Icono: Apple,
    fondo: 'from-[#e8d68f] via-[#e2cf82] to-[#dcc875]',
    borde: 'border-[#dcc875]',
    acento: 'from-[#c9b856] to-[#b5a245]',
    iconBoxFondo: 'from-[#f0e5b8] to-[#ead9a8]',
  },
  {
    id: 'saludos',
    label: 'Saludos',
    descripcion: 'Expresiones comunes para iniciar conversaciones.',
    Icono: Hand,
    fondo: 'from-[#90bee5] via-[#82b0dd] to-[#74a2d5]',
    borde: 'border-[#74a2d5]',
    acento: 'from-[#5885b8] to-[#456a95]',
    iconBoxFondo: 'from-[#b9d8f1] to-[#a7ceea]',
  },
  {
    id: 'abecedario',
    label: 'Abecedario',
    descripcion: 'Refuerza letras y base del lenguaje de señas.',
    Icono: BookOpen,
    fondo: 'from-[#88ddd2] via-[#77d5c8] to-[#66cdbe]',
    borde: 'border-[#66cdbe]',
    acento: 'from-[#4ab8a6] to-[#399d8e]',
    iconBoxFondo: 'from-[#b5ebde] to-[#a3e3d6]',
  },
];

const TOTAL_PREGUNTAS = 10;
const CATS_BACKEND = ['colores', 'animales', 'alimentos', 'saludos', 'abecedario'];

function obtener4Opciones(signos: Signo[], correcta: Signo): string[] {
  const otras = signos
    .filter(s => s.signo_id !== correcta.signo_id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map(s => s.palabra);

  return [...otras, correcta.palabra].sort(() => Math.random() - 0.5);
}

async function cargarSignos(categoria: Categoria): Promise<Signo[]> {
  if (categoria === 'mixta') {
    const todas = await Promise.all(
      CATS_BACKEND.map(cat =>
        fetch(`/api/categorias/${cat}`)
          .then(r => r.json())
          .then(d => d.signos as Signo[])
      )
    );

    return todas.flat().filter(s => s.url_video);
  }

  const data = await fetch(`/api/categorias/${categoria}`).then(r => r.json());
  return (data.signos as Signo[]).filter(s => s.url_video);
}

export function AdivinaSena() {
  const navigate = useNavigate();
  const location = useLocation();
  const isEmbedded = new URLSearchParams(location.search).get('embed') === '1';

  const renderShell = (content: ReactNode) => {
    if (isEmbedded) {
      return (
        <div className="min-h-screen w-full overflow-y-auto px-3 py-3 md:px-4 md:py-4 bg-[radial-gradient(circle_at_16%_18%,rgba(112,154,225,0.22),transparent_32%),radial-gradient(circle_at_82%_74%,rgba(120,200,180,0.18),transparent_30%),linear-gradient(135deg,#e8eef7_0%,#f2edf6_54%,#f2eee6_100%)] dark:bg-[linear-gradient(135deg,#0f1f3b_0%,#1a1735_100%)]">
          {content}
        </div>
      );
    }

    return (
      <MainLayout
        title="Adivina la seña"
        activePage="games"
        showClearButton={false}
        onNewConversation={() => navigate('/chat')}
      >
        {content}
      </MainLayout>
    );
  };

  const [screen, setScreen] = useState<'select' | 'playing' | 'finished'>('select');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<Categoria | null>(null);

  const [signos, setSignos] = useState<Signo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const [gameState, setGameState] = useState<GameState>('playing');
  const [score, setScore] = useState(0);
  const [scoreAdded, setScoreAdded] = useState(false);
  const [preguntaNum, setPreguntaNum] = useState(1);
  const [currentSign, setCurrentSign] = useState<Signo | null>(null);
  const [opciones, setOpciones] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [usados, setUsados] = useState<Set<string>>(new Set());

  const seleccionarPregunta = (lista: Signo[], yaUsados: Set<string>) => {
    const disponibles = lista.filter(s => !yaUsados.has(s.signo_id));
    const pool = disponibles.length >= 1 ? disponibles : lista;
    const correcta = pool[Math.floor(Math.random() * pool.length)];

    setCurrentSign(correcta);
    setOpciones(obtener4Opciones(lista, correcta));
    setGameState('playing');
    setSelectedAnswer(null);
  };

  const iniciarJuego = async (categoria: Categoria) => {
    setCategoriaSeleccionada(categoria);
    setLoading(true);
    setError(false);

    try {
      const lista = await cargarSignos(categoria);

      if (lista.length < 4) {
        setError(true);
        setLoading(false);
        return;
      }

      setSignos(lista);
      setScore(0);
      setPreguntaNum(1);

      const nuevosUsados = new Set<string>();
      setUsados(nuevosUsados);

      seleccionarPregunta(lista, nuevosUsados);
      setScreen('playing');
    } catch {
      setError(true);
    }

    setLoading(false);
  };

  const handleAnswer = (answer: string) => {
    if (gameState !== 'playing' || !currentSign) return;

    setSelectedAnswer(answer);

    if (answer === currentSign.palabra) {
      setGameState('correct');
      setScoreAdded(true);
      setScore(s => s + 1);
      setTimeout(() => setScoreAdded(false), 600);
    } else {
      setGameState('wrong');
    }
  };

  const handleNext = () => {
    if (preguntaNum >= TOTAL_PREGUNTAS) {
      setScreen('finished');
      return;
    }

    const nuevosUsados = new Set(usados);
    if (currentSign) nuevosUsados.add(currentSign.signo_id);

    setUsados(nuevosUsados);
    setPreguntaNum(n => n + 1);
    seleccionarPregunta(signos, nuevosUsados);
  };

  

  const getButtonStyle = (option: string) => {
    if (gameState === 'playing') {
      return 'bg-[#4997D0] hover:bg-[#357ab8] text-white';
    }

    if (option === currentSign?.palabra) {
      return 'bg-green-500 text-white';
    }

    if (option === selectedAnswer && gameState === 'wrong') {
      return 'bg-red-500 text-white';
    }

    return 'bg-[#4997D0]/40 text-white';
  };

  if (screen === 'select') {
    const panelHeightClass = isEmbedded ? 'min-h-[calc(100vh-32px)]' : 'min-h-[620px]';

    return renderShell(
      <div className={`w-full flex flex-col items-center justify-start gap-8 px-4 md:px-8 py-8 md:py-10 ${panelHeightClass} max-w-6xl mx-auto font-poppins`}>
        <div className="text-center">
          <span className="inline-flex items-center rounded-full bg-white/75 px-4 py-1.5 text-sm font-medium text-slate-600 shadow-sm ring-1 ring-white/50 backdrop-blur-md">
            Zona de práctica
          </span>

          <h2 className="mt-4 text-3xl md:text-4xl font-extrabold tracking-[-0.03em] text-slate-800 dark:text-slate-100">
            Elige una categoría
          </h2>

          <p className="mt-2 text-sm md:text-base text-slate-500 dark:text-slate-300">
            Se te harán {TOTAL_PREGUNTAS} preguntas
          </p>
        </div>

        {error && (
          <p className="text-red-500 text-sm">Error al cargar. Intenta de nuevo.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-4xl mx-auto">
          {CATEGORIAS.map((cat) => {
            const activa = categoriaSeleccionada === cat.id;
            const Icono = cat.Icono;

            return (
              <button
                key={cat.id}
                onClick={() => iniciarJuego(cat.id)}
                disabled={loading}
                className={`
                  group relative overflow-hidden rounded-[28px] border p-0 text-left
                  transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                  bg-gradient-to-br ${cat.fondo} ${cat.borde}
                  shadow-[0_14px_35px_rgba(15,23,42,0.10)]
                  hover:-translate-y-1.5 hover:shadow-[0_22px_50px_rgba(15,23,42,0.16)]
                  ${activa ? 'ring-2 ring-[#3b82f6]/40 scale-[1.01]' : ''}
                `}
              >
                <span className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.28),transparent_28%)]" />
                <span className="absolute -left-10 top-8 h-28 w-28 rounded-full bg-white/15 blur-2xl" />

                <div className="relative flex items-center gap-3 p-3 md:p-4">
                  <div
                    className={`
                      shrink-0 h-16 w-16 rounded-[20px] bg-gradient-to-br ${cat.iconBoxFondo}
                      ring-1 ring-white/40 shadow-[0_12px_26px_rgba(15,23,42,0.18)]
                      flex items-center justify-center transition-transform duration-300
                      group-hover:scale-105
                    `}
                  >
                    <div className="flex h-[56px] w-[56px] items-center justify-center rounded-[16px] bg-white/20 backdrop-blur-sm">
                      <Icono
                        className="h-7 w-7 text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.25)]"
                        strokeWidth={2.2}
                      />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[18px] font-bold text-slate-800 tracking-[-0.02em] dark:text-white">
                        {cat.label}
                      </h3>

                      {cat.id === 'mixta' && (
                        <span className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-sky-600 shadow-sm">
                          Recomendado
                        </span>
                      )}
                    </div>

                    <p className="mt-1 max-w-[28ch] text-xs leading-5 text-slate-700/80 dark:text-slate-200/85">
                      {cat.descripcion}
                    </p>
                  </div>

                  <div className="hidden md:flex shrink-0 items-center">
                    <div className={`rounded-2xl bg-gradient-to-r ${cat.acento} px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(0,0,0,0.14)]`}>
                      Jugar
                    </div>
                  </div>
                </div>

                <div className={`h-1.5 w-full bg-gradient-to-r ${cat.acento} opacity-90`} />
              </button>
            );
          })}
        </div>

        {loading && (
          <div className="h-8 w-8 rounded-full border-4 border-[#4997D0]/30 border-t-[#4997D0] animate-spin" />
        )}
      </div>
    );
  }

  if (screen === 'finished') {
    const porcentaje = Math.round((score / TOTAL_PREGUNTAS) * 100);

    const mensaje =
      porcentaje === 100
        ? '¡Perfecto! 🏆'
        : porcentaje >= 70
          ? '¡Muy bien! 🎉'
          : porcentaje >= 50
            ? '¡Buen intento! 💪'
            : 'Sigue practicando 📚';

    return renderShell(
      <div className="flex flex-col items-center gap-6 px-4 py-10 max-w-xl mx-auto text-center font-poppins">
        <h2 className="text-3xl font-bold text-slate-700 dark:text-slate-200">
          {mensaje}
        </h2>

        <div className="bg-white dark:bg-white/10 rounded-3xl p-8 w-full border border-[#4997D0]/20 flex flex-col items-center gap-4">
          <p className="text-6xl font-extrabold text-[#4997D0]">
            {score}/{TOTAL_PREGUNTAS}
          </p>
          <p className="text-gray-500">respuestas correctas</p>

          <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-3">
            <div
              className="bg-[#4997D0] h-3 rounded-full transition-all duration-700"
              style={{ width: `${porcentaje}%` }}
            />
          </div>

          <p className="text-sm text-gray-400">{porcentaje}% de aciertos</p>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={() => categoriaSeleccionada && iniciarJuego(categoriaSeleccionada)}
            className="bg-[#4997D0] hover:bg-[#357ab8] text-white py-3 rounded-xl font-semibold transition-colors"
          >
            Jugar de nuevo
          </button>

          <button
            onClick={() => setScreen('select')}
            className="border border-[#4997D0] text-[#4997D0] hover:bg-[#4997D0]/10 py-3 rounded-xl font-semibold transition-colors"
          >
            Cambiar categoría
          </button>
        </div>
      </div>
    );
  }

  if (loading || !currentSign) {
    return renderShell(
      <div className="flex min-h-full items-center justify-center">
        <div className="h-10 w-10 rounded-full border-4 border-[#4997D0]/30 border-t-[#4997D0] animate-spin" />
      </div>
    );
  }

  return renderShell(
    <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col gap-4 font-poppins min-h-screen justify-start pt-4">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Pregunta {preguntaNum} de {TOTAL_PREGUNTAS}
        </div>
      </div>

      {/* BARRA DE PROGRESO */}
      <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#7aa7d9] to-[#5c8ec4] transition-all duration-500"
          style={{ width: `${((preguntaNum - 1) / TOTAL_PREGUNTAS) * 100}%` }}
        />
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="grid md:grid-cols-[1fr_1fr] gap-6">

        {/* VIDEO CARD */}
        <div className="rounded-3xl overflow-hidden bg-transparent shadow-none border-0 flex items-center justify-center">
  <VideoPlayer videoUrl={currentSign.url_video} signLabel="???" active={true} />
</div>

        {/* PANEL DERECHO */}
        <div className="flex flex-col gap-4">

          <div className="rounded-2xl p-4 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-white/40 dark:border-slate-700/40 shadow-sm">
            <p className="text-sm text-slate-500 dark:text-slate-400">Instrucción</p>
            <p className="font-medium text-slate-700 dark:text-slate-200 mt-1">
              Observa la seña y selecciona la respuesta correcta
            </p>
          </div>

          <div className="rounded-[28px] p-4 bg-gradient-to-br from-[#edf3fb] via-[#e9f0fb] to-[#eef3fa] dark:from-slate-700 dark:to-slate-800 border border-[#dbe6f2] dark:border-slate-600 shadow-[0_14px_28px_rgba(15,23,42,0.08)]">
  <div className="flex items-center gap-4">
    <div className="h-20 w-20 shrink-0 rounded-2xl bg-white/70 flex items-center justify-center shadow-inner">
      <img
        src="https://media.giphy.com/media/fUQ4rhUZJYiQsas6WD/giphy.gif"
        alt="mascota animada"
        className="h-16 w-16 object-contain"
      />
    </div>

    <div className="flex-1">
      <p className="text-sm text-slate-500 dark:text-slate-400">Puntos</p>
      <p className={`text-4xl font-bold text-[#5c8ec4] leading-none transition-all duration-300 ${
        scoreAdded ? 'scale-125 text-green-500' : 'scale-100'
      }`}>{score}</p>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Sigue así, vas avanzando muy bien.
      </p>
    </div>
  </div>
</div> 

        </div>
      </div>

      {/* OPCIONES */}
      <div className="grid grid-cols-2 gap-4">
        {opciones.map(option => (
          <button
            key={option}
            onClick={() => handleAnswer(option)}
            disabled={gameState !== 'playing'}
            className={`
              py-5 rounded-2xl font-medium text-lg uppercase tracking-wide
              transition-all duration-200
              ${getButtonStyle(option)}
              hover:scale-[1.03] active:scale-[0.98] disabled:cursor-not-allowed
              shadow-[0_10px_20px_rgba(0,0,0,0.08)]
            `}
          >
            {option}
          </button>
        ))}
      </div>

      {/* FEEDBACK */}
      {gameState !== 'playing' && (
  <div className="flex flex-col items-center gap-3 relative mt-6">
    {gameState === 'correct' && <Confetti />}

    <div
      className={`
        rounded-full px-8 py-6 shadow-[0_20px_50px_rgba(15,23,42,0.15)]
        border backdrop-blur-xl
        ${gameState === 'correct'
          ? 'bg-white/40 border-[#86efac]/30'
          : 'bg-white/40 border-[#fca5a5]/30'
        }
        animate-float-up
      `}
    >
      <p className="text-lg font-bold text-slate-800 text-center">
        {gameState === 'correct'
          ? '¡Correcto! +1 punto'
          : `La respuesta era ${currentSign?.palabra.toUpperCase()}`}
      </p>
      <p className="mt-1 text-sm text-slate-600 text-center">
        {gameState === 'correct'
          ? 'Muy bien, sigue avanzando.'
          : 'No te preocupes, inténtalo en la siguiente.'}
      </p>
    </div>

    <button
      onClick={handleNext}
      className="bg-gradient-to-r from-[#7aa7d9] to-[#5c8ec4] text-white px-8 py-3 rounded-xl font-medium shadow hover:opacity-90 transition-opacity"
    >
      {preguntaNum >= TOTAL_PREGUNTAS ? 'Ver resultados' : 'Siguiente'}
    </button>

    <style>{`
      @keyframes bubble-float {
        0% {
          opacity: 0;
          transform: translateY(60px) scale(0.8);
        }
        10% {
          opacity: 1;
          transform: translateY(45px) scale(0.95);
        }
        50% {
          opacity: 1;
          transform: translateY(0px) scale(1);
        }
        90% {
          opacity: 0.3;
          transform: translateY(-50px) scale(1.05);
        }
        100% {
          opacity: 0;
          transform: translateY(-80px) scale(1.1);
        }
      }
      .animate-float-up {
        animation: bubble-float 4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
      }
    `}</style>
  </div>
)}
    </div>
  );
}