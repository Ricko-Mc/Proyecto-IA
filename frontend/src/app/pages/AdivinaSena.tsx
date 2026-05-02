import { type ReactNode, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import type { ElementType } from 'react';
import {
  Apple,
  BookOpen,
  Dice5,
  Hand,
  MessageSquare,
  Palette,
  PawPrint,
  Sparkles,
  Star,
  Trophy,
  LogOut,
  ArrowLeft,
  RefreshCcw,
  Home,
} from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { VideoPlayer } from '../components/VideoPlayer';
import { BottomNav } from '../components/BottomNav';
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
  | 'abecedario'
  | 'frases_comunes';

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
    fondo: 'from-[#DBEAFE] via-[#BFDBFE] to-[#A5C8F5]',
    borde: 'border-[#BFDBFE]',
    acento: 'from-[#2563EB] to-[#1D4ED8]',
    iconBoxFondo: 'from-[#EFF6FF] to-[#DBEAFE]',
  },
  {
    id: 'colores',
    label: 'Colores',
    descripcion: 'Reconoce tonos y vocabulario visual básico.',
    Icono: Palette,
    fondo: 'from-[#E0F2FE] via-[#BAE6FD] to-[#7DD3FC]',
    borde: 'border-[#BAE6FD]',
    acento: 'from-[#0284C7] to-[#0369A1]',
    iconBoxFondo: 'from-[#F0F9FF] to-[#E0F2FE]',
  },
  {
    id: 'animales',
    label: 'Animales',
    descripcion: 'Relaciona señas con nombres de animales.',
    Icono: PawPrint,
    fondo: 'from-[#CFFAFE] via-[#A5F3FC] to-[#67E8F9]',
    borde: 'border-[#A5F3FC]',
    acento: 'from-[#0891B2] to-[#0E7490]',
    iconBoxFondo: 'from-[#ECFEFF] to-[#CFFAFE]',
  },
  {
    id: 'alimentos',
    label: 'Alimentos',
    descripcion: 'Practica vocabulario de comida y bebida.',
    Icono: Apple,
    fondo: 'from-[#C7D7F5] via-[#A8BFEF] to-[#8FAAE8]',
    borde: 'border-[#A8BFEF]',
    acento: 'from-[#3B5EC6] to-[#2D4DB5]',
    iconBoxFondo: 'from-[#E8EEFB] to-[#C7D7F5]',
  },
  {
    id: 'saludos',
    label: 'Saludos',
    descripcion: 'Expresiones comunes para iniciar conversaciones.',
    Icono: Hand,
    fondo: 'from-[#D1E8FF] via-[#B3D4FF] to-[#8FBFFF]',
    borde: 'border-[#B3D4FF]',
    acento: 'from-[#1A6FD4] to-[#1558B0]',
    iconBoxFondo: 'from-[#EBF4FF] to-[#D1E8FF]',
  },
  {
    id: 'abecedario',
    label: 'Abecedario',
    descripcion: 'Refuerza letras y base del lenguaje de señas.',
    Icono: BookOpen,
    fondo: 'from-[#C8E6FA] via-[#A9D5F7] to-[#7BBFF2]',
    borde: 'border-[#A9D5F7]',
    acento: 'from-[#1565C0] to-[#0D47A1]',
    iconBoxFondo: 'from-[#E3F2FD] to-[#C8E6FA]',
  },
  {
    id: 'frases_comunes',
    label: 'Frases Comunes',
    descripcion: 'Expresiones del día a día en lengua de señas.',
    Icono: MessageSquare,
    fondo: 'from-[#B2EBF9] via-[#81D8F5] to-[#4FC3EF]',
    borde: 'border-[#81D8F5]',
    acento: 'from-[#0277BD] to-[#01579B]',
    iconBoxFondo: 'from-[#E1F5FE] to-[#B2EBF9]',
  },
];

const TOTAL_PREGUNTAS = 10;
const CATS_BACKEND = ['colores', 'animales', 'alimentos', 'saludos', 'abecedario', 'frases_comunes'];

function obtener4Opciones(signos: Signo[], correcta: Signo): string[] {
  const otras = signos
    .filter(s => s.signo_id !== correcta.signo_id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map(s => s.palabra);

  return [...otras, correcta.palabra].sort(() => Math.random() - 0.5);
}

function formatearOpcionTexto(texto: string) {
  return texto.replace(/_/g, ' ');
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
        onRequestExit={handleRequestExit}
      >
        <div className="font-poppins">{content}</div>
      </MainLayout>
    );
  };

  const [screen, setScreen] = useState<'select' | 'playing' | 'finished' | 'no_palabras'>('select');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<Categoria | null>(null);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [pendingExitCallback, setPendingExitCallback] = useState<(() => void) | null>(null);

  const [signos, setSignos] = useState<Signo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [categoriasDisponibles, setCategoriasDisponibles] = useState<CategoriaItem[]>([]);

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

const [countdown, setCountdown] = useState<number | null>(null);
 useEffect(() => {
  if (gameState === 'playing') {
    setCountdown(null);
    return;
  }
  setCountdown(15);
}, [gameState]);

useEffect(() => {
  if (countdown === null) return;
  if (countdown <= 0) {
    handleNext();
    return;
  }
  const timer = setTimeout(() => setCountdown(c => (c ?? 1) - 1), 1000);
  return () => clearTimeout(timer);
}, [countdown]);

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
        // No hay suficientes palabras, cargar categorías disponibles
        setError(false);
        setScreen('no_palabras');
        
        // Cargar todas las categorías para verificar cuáles tienen palabras
        const categoriasConPalabras: CategoriaItem[] = [];
        for (const cat of CATEGORIAS) {
          if (cat.id === 'mixta') continue; // Saltar categoría mixta
          try {
            const palabras = await cargarSignos(cat.id);
            if (palabras.length > 0) {
              categoriasConPalabras.push(cat);
            }
          } catch {
            // Ignorar errores
          }
        }
        
        setCategoriasDisponibles(categoriasConPalabras);
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

  const handleEnviarPalabraAlChat = (palabra: string) => {
    // Navegar al chat con la palabra para enviar
    navigate(`/chat?palabra=${encodeURIComponent(palabra)}`);
  };

  const handleAnswer = (answer: string) => {
    if (gameState !== 'playing' || !currentSign) return;
    
    setSelectedAnswer(answer);
    
    if (answer === currentSign.palabra) {
      setGameState('correct');
      setScore(prev => prev + 1);
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

  const handleRequestExit = (callback: () => void) => {
    if (screen === 'playing') {
      setPendingExitCallback(() => callback);
      setShowExitDialog(true);
    } else {
      callback();
    }
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
      <div className={`w-full max-w-4xl mx-auto flex flex-col items-center gap-4 px-3 md:px-4 pt-0 pb-2 ${panelHeightClass}`}>
        <div className="w-full flex items-center justify-between mt-3">
          <div />
          <button
            onClick={() => navigate('/games')}
            className="flex items-center gap-2 px-4 py-2 rounded-[16px] bg-slate-200/60 hover:bg-slate-300/60 text-slate-700 font-semibold transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Atrás
          </button>
        </div>

        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs md:text-sm font-medium bg-white/70 text-slate-700 shadow-sm ring-1 ring-white/40 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-sky-500" />
            Zona de práctica
          </div>

          <h2 className="mt-2 text-3xl md:text-4xl font-extrabold tracking-[-0.03em] text-slate-800 dark:text-slate-100">
            Elige una categoría
          </h2>

          <p className="mt-2 text-sm md:text-base text-slate-500 dark:text-slate-300">
            Se te harán {TOTAL_PREGUNTAS} preguntas
          </p>
        </div>

        {error && (
          <p className="text-red-500 text-sm">Error al cargar. Intenta de nuevo.</p>
        )}

        <div className="grid grid-cols-2 gap-3 w-full max-w-4xl mx-auto">
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
                  transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                  bg-gradient-to-br ${cat.fondo} ${cat.borde}
                  shadow-[0_14px_35px_rgba(15,23,42,0.10)]
                  hover:brightness-95 hover:scale-[1.02] hover:shadow-[0_22px_50px_rgba(15,23,42,0.16)]
                  ${activa ? 'ring-2 ring-[#3b82f6]/40 scale-[1.01]' : ''}
                  ${cat.id === 'mixta' ? 'col-span-2' : ''}
                `}
              >
                <span className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.28),transparent_28%)]" />
                <span className="absolute -left-10 top-8 h-28 w-28 rounded-full bg-white/15 blur-2xl" />

                <div className="relative flex items-center gap-3 p-3 md:p-4 w-full">
                  <div
                    className={`
                      shrink-0 h-10 w-10 md:h-12 md:w-12 rounded-[18px] bg-gradient-to-br ${cat.iconBoxFondo}
                      ring-1 ring-white/40 shadow-[0_12px_26px_rgba(15,23,42,0.18)]
                      flex items-center justify-center transition-transform duration-300
                      group-hover:scale-105
                    `}
                  >
                    <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-[16px] bg-white/20 backdrop-blur-sm">
                      <Icono className="h-4 w-4 md:h-5 md:w-5 text-slate-900" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-nowrap">
                      <h3 className={`text-sm md:text-[18px] font-bold text-slate-800 tracking-[-0.02em] dark:text-white ${cat.id === 'mixta' ? 'whitespace-nowrap' : ''}`}>
                        {cat.label}
                      </h3>

                      {cat.id === 'mixta' && (
                        <span className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-sky-600 shadow-sm whitespace-nowrap">
                          Recomendado
                        </span>
                      )}
                    </div>

                    <p className={`mt-1 text-[0.75rem] md:text-xs leading-4 md:leading-5 text-slate-700/80 dark:text-slate-200/85 ${cat.id === 'mixta' ? 'whitespace-nowrap overflow-hidden text-ellipsis' : 'max-w-[28ch]'}`}>
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
        <BottomNav />
      </div>
    );
  }

  if (screen === 'finished') {
    const porcentaje = Math.round((score / TOTAL_PREGUNTAS) * 100);
    const gano = porcentaje >= 70;

    return renderShell(
      <div className={`w-full h-screen flex items-center justify-center overflow-hidden fixed inset-0 z-50 ${
        gano
          ? 'bg-gradient-to-br from-[#10B981] via-[#059669] to-[#047857]'
          : 'bg-gradient-to-br from-[#EF4444] via-[#DC2626] to-[#B91C1C]'
      }`}>
        <style>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          @keyframes fadeInUpStaggered {
            0% { opacity: 0; transform: translateY(30px) scale(0.95); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
          }
          .animate-fade-in-up {
            animation: fadeInUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          }
          .animate-fade-in-up-delayed-1 {
            animation: fadeInUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards 0.2s;
            opacity: 0;
          }
          .animate-fade-in-up-delayed-2 {
            animation: fadeInUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards 0.4s;
            opacity: 0;
          }
        `}</style>

        <div className="w-full px-4 py-10 flex flex-col items-center justify-center text-center gap-8">
          <div className="animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight">
              {gano ? 'BIEN HECHO' : '¡PERDISTE!'}
            </h1>
            <p className="mt-4 text-lg md:text-xl text-white/90 font-medium">
              {gano ? `Adivinaste: ${score} de ${TOTAL_PREGUNTAS} palabras` : `Acertaste: ${score} de ${TOTAL_PREGUNTAS}`}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md animate-fade-in-up-delayed-2">
            <button
              onClick={() => categoriaSeleccionada && iniciarJuego(categoriaSeleccionada)}
              className={`flex items-center justify-center gap-2 flex-1 py-3 px-6 rounded-full font-bold text-base transition-all hover:scale-105 active:scale-95 ${
                gano
                  ? 'bg-white text-green-600 hover:bg-green-50 border-2 border-white'
                  : 'bg-white text-red-600 hover:bg-red-50 border-2 border-white'
              }`}
            >
              <RefreshCcw className="w-5 h-5" />
              Nueva palabra
            </button>
            <button
              onClick={() => setScreen('select')}
              className={`flex items-center justify-center gap-2 flex-1 py-3 px-6 rounded-full font-bold text-base transition-all hover:scale-105 active:scale-95 ${
                gano
                  ? 'bg-white text-green-600 hover:bg-green-50 border-2 border-white'
                  : 'bg-white text-red-600 hover:bg-red-50 border-2 border-white'
              }`}
            >
              <Home className="w-5 h-5" />
              Regresar la categoría
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'no_palabras') {
    const panelHeightClass = isEmbedded ? 'min-h-[calc(100vh-32px)]' : 'min-h-[620px]';

    return renderShell(
      <div className={`w-full max-w-4xl mx-auto flex flex-col items-center gap-4 px-3 md:px-4 pt-0 pb-2 ${panelHeightClass}`}>
        <div className="w-full flex items-center justify-between mt-3">
          <div />
          <button
            onClick={() => setScreen('select')}
            className="flex items-center gap-2 px-4 py-2 rounded-[16px] bg-slate-200/60 hover:bg-slate-300/60 text-slate-700 font-semibold transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Atrás
          </button>
        </div>

        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs md:text-sm font-medium bg-white/70 text-slate-700 shadow-sm ring-1 ring-white/40 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-sky-500" />
            Categorías disponibles
          </div>

          <h2 className="mt-2 text-3xl md:text-4xl font-extrabold tracking-[-0.03em] text-slate-800 dark:text-slate-100">
            Selecciona una categoría
          </h2>

          <p className="mt-2 text-sm md:text-base text-slate-500 dark:text-slate-300">
            Estas categorías tienen palabras disponibles
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-4xl mx-auto">
          {categoriasDisponibles.map((cat) => {
            const Icono = cat.Icono;

            return (
              <button
                key={cat.id}
                onClick={() => iniciarJuego(cat.id)}
                disabled={loading}
                className={`
                  group relative overflow-hidden rounded-[28px] border p-0 text-left
                  transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                  bg-gradient-to-br ${cat.fondo} ${cat.borde}
                  shadow-[0_14px_35px_rgba(15,23,42,0.10)]
                  hover:brightness-95 hover:scale-[1.02] hover:shadow-[0_22px_50px_rgba(15,23,42,0.16)]
                `}
              >
                <span className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.28),transparent_28%)]" />
                <span className="absolute -left-10 top-8 h-28 w-28 rounded-full bg-white/15 blur-2xl" />

                <div className="relative flex items-center gap-3 p-3 md:p-4 w-full">
                  <div
                    className={`
                      shrink-0 h-10 w-10 md:h-12 md:w-12 rounded-[18px] bg-gradient-to-br ${cat.iconBoxFondo}
                      ring-1 ring-white/40 shadow-[0_12px_26px_rgba(15,23,42,0.18)]
                      flex items-center justify-center transition-transform duration-300
                      group-hover:scale-105
                    `}
                  >
                    <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-[16px] bg-white/20 backdrop-blur-sm">
                      <Icono className="h-4 w-4 md:h-5 md:w-5 text-slate-900" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-nowrap">
                      <h3 className="text-sm md:text-[18px] font-bold text-slate-800 tracking-[-0.02em] dark:text-white">
                        {cat.label}
                      </h3>
                    </div>

                    <p className="mt-1 text-[0.75rem] md:text-xs leading-4 md:leading-5 text-slate-700/80 dark:text-slate-200/85 max-w-[28ch]">
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
        <BottomNav />
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
      <div className="w-full max-w-[1024px] flex flex-col gap-4">
        <div className="relative z-10 w-full rounded-[28px] bg-transparent p-3 md:p-4 flex flex-col gap-4">
        {/* Header mobile */}
        <div className="flex lg:hidden items-center justify-between w-full">
          <button
            onClick={() => setShowExitDialog(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[14px] text-slate-900 hover:bg-slate-100 transition-colors duration-200"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Salir
          </button>

          <div className="text-center">
            <p className="text-xs text-slate-500 font-medium">Palabra {preguntaNum} de {TOTAL_PREGUNTAS}</p>
          </div>

          <div />
        </div>

        {/* Header desktop */}
        <div className="hidden lg:flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <button
            onClick={() => setShowExitDialog(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[14px] text-slate-900 hover:bg-slate-100 transition-colors duration-200"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Salir
          </button>
          <div>
            <p className="text-xs text-slate-700 font-semibold">Selecciona una palabra</p>
            <h2 className="text-lg md:text-xl font-bold tracking-[-0.03em] text-slate-800">
              Palabra {preguntaNum} de {TOTAL_PREGUNTAS}
            </h2>
          </div>
        </div>

        <div className="w-full h-2 bg-white/40 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-[#7DD3FC] via-[#67E8F9] to-[#22D3EE] transition-all duration-500"
            style={{ width: `${((preguntaNum - 1) / TOTAL_PREGUNTAS) * 100}%` }}
          />
        </div>

        <div className="grid lg:grid-cols-[1.5fr_0.8fr] gap-3 items-stretch w-full">
          <div className="relative rounded-[20px] overflow-hidden w-full aspect-video bg-transparent shadow-[0_6px_14px_rgba(0,0,0,0.12)]">
            <VideoPlayer videoUrl={currentSign.url_video} signLabel="" active={true} />
          </div>

          <div className="hidden lg:flex rounded-[28px] p-4 bg-gradient-to-br from-[#DBEAFE] via-[#BFDBFE] to-[#BFDBFE] shadow-[0_25px_60px_rgba(15,23,42,0.12)] text-slate-900 relative overflow-hidden flex-col items-center justify-center min-h-full gap-5">
            <div className="absolute bottom-0 right-0 w-28 h-28 rounded-full bg-white/50 blur-3xl" />
            <div className="absolute top-0 left-0 w-24 h-24 rounded-full bg-white/40 blur-2xl" />

            <div className="hidden md:flex relative z-10 flex-col gap-3 w-full">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-700 font-semibold">
                  Observa la seña
                </p>

                <h3 className="mt-2 text-base font-bold leading-tight text-slate-900">
                  {gameState === 'playing' ? 'Selecciona la palabra correcta' : gameState === 'correct' ? '¡Correcto!' : '¡Incorrecto!'}
                </h3>

                <p className="mt-1 text-xs text-slate-700 leading-relaxed">
                  {gameState === 'playing' ? 'Elige una de las opciones que crees que es la correcta.' : gameState === 'correct' ? `La palabra era: ${currentSign.palabra}` : `Respuesta: ${currentSign.palabra}`}
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
                  <p className="text-xs text-slate-700">Compañero</p>
                  <p className="font-semibold text-sm text-slate-900">
                    {gameState === 'playing' ? '¡Elige una palabra!' : gameState === 'correct' ? '¡Muy bien!' : 'Intenta de nuevo'}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative z-10 text-center">
              <p className="text-[10px] tracking-widest text-slate-600 font-semibold uppercase">
                Progreso
              </p>
              <p className={`text-4xl font-extrabold mt-2 text-slate-900`}>
                {preguntaNum}
              </p>
              <p className="text-xs text-slate-600 mt-0.5">de {TOTAL_PREGUNTAS}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full">
          {opciones.map(option => (
            <button
              key={option}
              onClick={() => handleAnswer(option)}
              disabled={gameState !== 'playing'}
              className={`
                py-4 rounded-[18px] px-3 text-center font-semibold text-sm uppercase
                transition-all duration-200
                ${getButtonStyle(option)}
                disabled:cursor-not-allowed
              `}
            >
              {formatearOpcionTexto(option)}
            </button>
          ))}
        </div>

        {gameState !== 'playing' && (
          <div className="flex justify-center">
            <button
              onClick={handleNext}
              className="bg-gradient-to-r from-[#8B7CFF] to-[#6D5CFF] hover:from-[#988BFF] hover:to-[#7868FF] text-white px-6 py-2.5 rounded-[18px] font-semibold text-sm shadow-[0_10px_25px_rgba(0,0,0,0.18)] hover:scale-[1.03] transition-all active:scale-[0.98]"
                >
                    {preguntaNum >= TOTAL_PREGUNTAS ? 'Finalizar' : `Siguiente ${countdown !== null ? `(${countdown}s)` : ''}`}

            </button>
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
              
              // Si hay un callback pendiente de navegación, ejecutarlo
              if (pendingExitCallback) {
                pendingExitCallback();
                setPendingExitCallback(null);
              }
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