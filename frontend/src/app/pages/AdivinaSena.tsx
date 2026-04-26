import { type ReactNode, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import type { ElementType } from 'react';
import {
  Apple,
  BookOpen,
  Dice5,
  Hand,
  Palette,
  PawPrint,
  Sparkles,
  Star,
  Trophy,
  LogOut,
  ArrowLeft,
} from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { VideoPlayer } from '../components/VideoPlayer';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';


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
    fondo: 'from-[#C8F7F5] via-[#B2EEE9] to-[#A0E5DE]',
    borde: 'border-[#A0E5DE]',
    acento: 'from-[#7DD8D0] to-[#60C9C0]',
    iconBoxFondo: 'from-[#E6FEFB] to-[#D0FAF7]',
  },
  {
    id: 'colores',
    label: 'Colores',
    descripcion: 'Reconoce tonos y vocabulario visual básico.',
    Icono: Palette,
    fondo: 'from-[#FFF1B8] via-[#FFE58F] to-[#FFEA5D]',
    borde: 'border-[#FFEA5D]',
    acento: 'from-[#F6D860] to-[#F0C948]',
    iconBoxFondo: 'from-[#FEF9C3] to-[#FDE68A]',
  },
  {
    id: 'animales',
    label: 'Animales',
    descripcion: 'Relaciona señas con nombres de animales.',
    Icono: PawPrint,
    fondo: 'from-[#D3F9D8] via-[#B9F2BF] to-[#9EEBA6]',
    borde: 'border-[#9EEBA6]',
    acento: 'from-[#6EE7B7] to-[#34D399]',
    iconBoxFondo: 'from-[#E6F9EA] to-[#CEF3D9]',
  },
  {
    id: 'alimentos',
    label: 'Alimentos',
    descripcion: 'Practica vocabulario de comida y bebida.',
    Icono: Apple,
    fondo: 'from-[#FFF7D6] via-[#FFE59E] to-[#FFDB6F]',
    borde: 'border-[#FFDB6F]',
    acento: 'from-[#F5C359] to-[#E7A800]',
    iconBoxFondo: 'from-[#FFF6D6] to-[#FDE4A3]',
  },
  {
    id: 'saludos',
    label: 'Saludos',
    descripcion: 'Expresiones comunes para iniciar conversaciones.',
    Icono: Hand,
    fondo: 'from-[#D9EEFF] via-[#B8DDFF] to-[#92CCFF]',
    borde: 'border-[#92CCFF]',
    acento: 'from-[#6DB4F7] to-[#4092EF]',
    iconBoxFondo: 'from-[#EAF4FF] to-[#D2E8FF]',
  },
  {
    id: 'abecedario',
    label: 'Abecedario',
    descripcion: 'Refuerza letras y base del lenguaje de señas.',
    Icono: BookOpen,
    fondo: 'from-[#D7FBE5] via-[#B6F4D3] to-[#95EDC1]',
    borde: 'border-[#95EDC1]',
    acento: 'from-[#6DD6A4] to-[#42C288]',
    iconBoxFondo: 'from-[#E5FBEF] to-[#CCF6E3]',
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

function ConfettiBurst() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      {Array.from({ length: 48 }).map((_, i) => {
        const colors = ['#60A5FA', '#A78BFA', '#F59E0B', '#34D399', '#F472B6', '#FACC15'];
        const size = 6 + Math.random() * 10;

        return (
          <span
            key={i}
            className="absolute rounded-sm"
            style={{
              left: `${Math.random() * 100}%`,
              top: '-16px',
              width: `${size}px`,
              height: `${size * 0.65}px`,
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

export function AdivinaSena() {
  const navigate = useNavigate();
  const location = useLocation();
  const isEmbedded = new URLSearchParams(location.search).get('embed') === '1';

  const renderShell = (content: ReactNode) => {
    if (isEmbedded) {
      return (
        <div className="min-h-screen w-full overflow-y-auto px-3 py-3 md:px-4 md:py-4 bg-[linear-gradient(135deg,#eef2f8_0%,#f5f3f8_50%,#f3efe9_100%)] dark:bg-[linear-gradient(135deg,#0f1f3b_0%,#1a1735_100%)] font-poppins">
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
        <div className="font-poppins">{content}</div>
      </MainLayout>
    );
  };

  const [screen, setScreen] = useState<'select' | 'playing' | 'finished'>('select');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<Categoria | null>(null);
  const [showExitDialog, setShowExitDialog] = useState(false);

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

  useEffect(() => {
    if (!scoreAdded) return;
    const timer = setTimeout(() => setScoreAdded(false), 700);
    return () => clearTimeout(timer);
  }, [scoreAdded]);

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
      setScore(s => s + 1);
      setScoreAdded(true);
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
      return `
        bg-[#90CDF4]
        hover:bg-[#BEE3F8]
        text-slate-900
        shadow-[0_10px_25px_rgba(96,165,250,0.22)]
      `;
    }

    if (option === currentSign?.palabra) {
      return `
        bg-gradient-to-r from-[#86efac] to-[#4ade80]
        text-slate-900
        shadow-[0_10px_25px_rgba(34,197,94,0.25)]
      `;
    }

    if (option === selectedAnswer && gameState === 'wrong') {
      return `
        bg-gradient-to-r from-[#fed7d7] to-[#fca5a5]
        text-slate-900
        shadow-[0_10px_25px_rgba(248,113,113,0.25)]
      `;
    }

    return `
      bg-[#90CDF4]/40 text-slate-700
    `;
  };

  if (screen === 'select') {
    const panelHeightClass = isEmbedded ? 'min-h-[calc(100vh-32px)]' : 'min-h-[620px]';

    return renderShell(
      <div className={`w-full flex flex-col items-center justify-start gap-8 px-4 md:px-8 py-8 md:py-10 ${panelHeightClass} max-w-6xl mx-auto`}>
        <div className="w-full flex items-center justify-between">
          <button
            onClick={() => navigate('/games')}
            className="flex items-center gap-2 px-4 py-2 rounded-[16px] bg-slate-200/60 hover:bg-slate-300/60 text-slate-700 font-semibold transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Atrás
          </button>
          <div />
        </div>

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
      <div className="max-w-3xl mx-auto px-4 py-10 flex flex-col items-center gap-6 text-center">
        <div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-[-0.03em] text-slate-800">
            {mensaje}
          </h2>
          <p className="mt-2 text-slate-500 text-base">
            Terminaste la ronda. Aquí está tu resultado final.
          </p>
        </div>

        <div className="w-full rounded-[32px] border border-white/70 bg-[linear-gradient(180deg,rgba(245,251,255,0.96)_0%,rgba(234,249,240,0.94)_100%)] shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur-md p-8 md:p-10">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-3 text-[#22C55E]">
              <Trophy className="h-8 w-8" />
              <span className="text-6xl md:text-7xl font-extrabold leading-none text-slate-900">
                {score}/{TOTAL_PREGUNTAS}
              </span>
            </div>

            <p className="mt-3 text-slate-600 text-base">respuestas correctas</p>
          </div>

          <div className="mt-6 w-full max-w-[430px] mx-auto">
            <div className="h-4 rounded-full bg-slate-200/80 overflow-hidden shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#86efac] via-[#4ade80] to-[#22c55e] transition-all duration-700"
                style={{ width: `${porcentaje}%` }}
              />
            </div>
            <p className="mt-3 text-sm text-slate-600 text-center">{porcentaje}% de aciertos</p>
          </div>
        </div>

        <div className="w-full flex flex-col gap-3">
          <button
            onClick={() => categoriaSeleccionada && iniciarJuego(categoriaSeleccionada)}
            className="w-full py-4 rounded-[20px] bg-gradient-to-r from-[#86efac] to-[#34d399] text-slate-900 font-semibold shadow-[0_12px_28px_rgba(52,211,153,0.20)] hover:scale-[1.01] transition-all"
          >
            Jugar de nuevo
          </button>

          <button
            onClick={() => setScreen('select')}
            className="w-full py-4 rounded-[20px] border border-[#34d399]/60 bg-white/70 text-[#15803d] font-semibold hover:bg-white/90 transition-all"
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
    <>
    <div className="w-full flex justify-center px-3 py-6">
      <div className="w-full max-w-[950px] flex flex-col gap-4">
        <div className="relative z-10 w-full rounded-[28px] bg-white/18 backdrop-blur-md border border-white/30 shadow-[0_20px_50px_rgba(15,23,42,0.10)] p-4 md:p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-700 font-semibold">Ronda actual</p>
            <h2 className="text-lg md:text-xl font-bold tracking-[-0.03em] text-slate-800">
              Pregunta {preguntaNum} de {TOTAL_PREGUNTAS}
            </h2>
          </div>
          <button
            onClick={() => setShowExitDialog(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[14px] bg-red-500/90 hover:bg-red-600 text-white font-semibold text-sm transition-colors duration-200"
          >
            <LogOut className="w-3.5 h-3.5" />
            Salir
          </button>
        </div>

        <div className="w-full h-2 bg-white/40 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-[#7DD3FC] via-[#67E8F9] to-[#22D3EE] transition-all duration-500"
            style={{ width: `${((preguntaNum - 1) / TOTAL_PREGUNTAS) * 100}%` }}
          />
        </div>

        <div className="grid lg:grid-cols-[1.5fr_0.8fr] gap-3 items-stretch w-full">
          <div className="relative rounded-[20px] overflow-hidden w-full aspect-video bg-transparent shadow-[0_6px_14px_rgba(0,0,0,0.12)]">
            <VideoPlayer videoUrl={currentSign.url_video} signLabel="???" active={true} />
          </div>

          <div className="rounded-[28px] p-4 bg-gradient-to-br from-[#E0F7FF] via-[#D2F2E7] to-[#D7FBD5] shadow-[0_25px_60px_rgba(15,23,42,0.12)] text-slate-900 relative overflow-hidden flex flex-col items-center justify-center min-h-full gap-5">
            <div className="absolute bottom-0 right-0 w-28 h-28 rounded-full bg-white/50 blur-3xl" />
            <div className="absolute top-0 left-0 w-24 h-24 rounded-full bg-white/40 blur-2xl" />

            <div className="relative z-10 flex flex-col gap-3 w-full">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-white/70 font-semibold">
                  Ronda actual
                </p>

                <h3 className="mt-2 text-base font-bold leading-tight text-white">
                  Elige la opción correcta
                </h3>

                <p className="mt-1 text-xs text-white/80 leading-relaxed">
                  Observa la seña del video y responde correctamente.
                </p>
              </div>

              <div className="h-px bg-white/20" />

              <div className="flex items-center gap-2">
                <div className="h-11 w-11 rounded-lg overflow-hidden flex items-center justify-center bg-white/20 border border-white/30">
                  <img
                    src="https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3bTdzcjBieTg1cmNrN3Y4ZHJxOXhtM21hbDdzczJwYnJ6b2R4NmNybSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/Fj0MaDHcLycOk/giphy.gif"
                    alt="Mascota animada"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/80">Compañero</p>
                  <p className="font-semibold text-sm text-white">¡Sigue así!</p>
                </div>
              </div>
            </div>

            <div className="relative z-10 text-center">
              <p className="text-[10px] tracking-widest text-slate-600 font-semibold uppercase">
                Puntuación
              </p>
              <p className={`text-4xl font-extrabold mt-2 transition-all duration-300 text-slate-900 ${scoreAdded ? 'scale-110' : ''}`}>
                {score}
              </p>
              <p className="text-xs text-slate-600 mt-0.5">de {TOTAL_PREGUNTAS}</p>

              {scoreAdded && (
                <span className="inline-block mt-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
                  +1 punto
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
          {opciones.map(option => (
            <button
              key={option}
              onClick={() => handleAnswer(option)}
              disabled={gameState !== 'playing'}
              className={`
                py-4 rounded-[18px] px-3 text-center font-semibold text-sm uppercase
                transition-all duration-200 disabled:cursor-not-allowed
                hover:scale-[1.03] active:scale-[0.97]
                ${getButtonStyle(option)}
              `}
            >
              {option}
            </button>
          ))}
        </div>

        {gameState !== 'playing' && (
          <div className="relative flex flex-col items-center gap-0 -mt-4">
            {gameState === 'correct' && <ConfettiBurst />}

            <div
              className={`
                rounded-[20px] px-5 py-3
                bg-white/10 backdrop-blur-xl
                border border-white/20
                shadow-[0_15px_40px_rgba(0,0,0,0.20)]
                text-center
                ${gameState === 'correct' ? 'animate-[balloonFloat_2.2s_ease-out_forwards]' : 'animate-[popIn_0.35s_ease]'}
                ${gameState === 'correct' ? 'border-[#86EFAC]' : 'border-[#FCA5A5]'}
              `}
            >
              <p className="text-base font-bold text-slate-800">
                {gameState === 'correct'
                  ? '¡Correcto! +1 punto'
                  : `La respuesta correcta era ${currentSign.palabra.toUpperCase()}`}
              </p>

              <p className="mt-1 text-xs text-slate-600">
                {gameState === 'correct'
                  ? 'Excelente, continúa con la siguiente ronda.'
                  : 'No te preocupes, inténtalo de nuevo en la próxima.'}
              </p>
            </div>

            <button
              onClick={handleNext}
              className="bg-gradient-to-r from-[#8B7CFF] to-[#6D5CFF] hover:from-[#988BFF] hover:to-[#7868FF] text-white px-6 py-2.5 rounded-[18px] font-semibold text-sm shadow-[0_10px_25px_rgba(0,0,0,0.18)] hover:scale-[1.03] transition-all active:scale-[0.98]"
            >
              {preguntaNum >= TOTAL_PREGUNTAS ? 'Ver resultados' : 'Siguiente'}
            </button>

            <style>{`
              @keyframes popIn {
                0% {
                  transform: scale(0.92) translateY(8px);
                  opacity: 0;
                }
                100% {
                  transform: scale(1) translateY(0);
                  opacity: 1;
                }
              }
              @keyframes balloonFloat {
                0% {
                  transform: scale(0.92) translateY(8px);
                  opacity: 0;
                }
                12% {
                  transform: scale(1) translateY(0);
                  opacity: 1;
                }
                85% {
                  transform: translateY(-140px);
                  opacity: 1;
                }
                100% {
                  transform: translateY(-180px);
                  opacity: 0;
                }
              }
            `}</style>
          </div>
        )}
        </div>
      </div>
    </div>

    <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Si sales ahora, perderás todo tu progreso en esta partida.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Seguir jugando</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              setShowExitDialog(false);
              setScreen('select');
              setScore(0);
              setPreguntaNum(1);
              setUsados(new Set());
              setCategoriaSeleccionada(null);
            }}
            className="bg-red-500 hover:bg-red-600"
          >
            Salir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}