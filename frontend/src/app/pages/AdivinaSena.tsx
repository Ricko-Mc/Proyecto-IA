import { type ReactNode, useState } from 'react';
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
    fondo: 'from-[#d7c8ef] via-[#c9bee9] to-[#bdb7e3]',
    borde: 'border-[#c6bae7]',
    acento: 'from-[#8f7cc9] to-[#7d8ccf]',
    iconBoxFondo: 'from-[#ebe3fb] to-[#d9e4fb]',
  },
  {
    id: 'colores',
    label: 'Colores',
    descripcion: 'Reconoce tonos y vocabulario visual básico.',
    Icono: Palette,
    fondo: 'from-[#f4c8bd] via-[#efc1bc] to-[#e6c8d8]',
    borde: 'border-[#e9c1bf]',
    acento: 'from-[#d9968b] to-[#d7a9b8]',
    iconBoxFondo: 'from-[#f9e2d8] to-[#f3dce7]',
  },
  {
    id: 'animales',
    label: 'Animales',
    descripcion: 'Relaciona señas con nombres de animales.',
    Icono: PawPrint,
    fondo: 'from-[#c8e7d2] via-[#c3e2d2] to-[#b9dcd8]',
    borde: 'border-[#bdddcf]',
    acento: 'from-[#7eb89a] to-[#7db5ab]',
    iconBoxFondo: 'from-[#dff3e5] to-[#d7eee8]',
  },
  {
    id: 'alimentos',
    label: 'Alimentos',
    descripcion: 'Practica vocabulario de comida y bebida.',
    Icono: Apple,
    fondo: 'from-[#f1ddab] via-[#eed7a7] to-[#e9cfa8]',
    borde: 'border-[#e9d1a6]',
    acento: 'from-[#d5ab67] to-[#d3a58f]',
    iconBoxFondo: 'from-[#f8e7c9] to-[#f3ddd2]',
  },
  {
    id: 'saludos',
    label: 'Saludos',
    descripcion: 'Expresiones comunes para iniciar conversaciones.',
    Icono: Hand,
    fondo: 'from-[#c3d9f3] via-[#bad2ef] to-[#b2caea]',
    borde: 'border-[#b7cdea]',
    acento: 'from-[#7fa8d6] to-[#7f95cf]',
    iconBoxFondo: 'from-[#dce9fb] to-[#d5e1f6]',
  },
  {
    id: 'abecedario',
    label: 'Abecedario',
    descripcion: 'Refuerza letras y base del lenguaje de señas.',
    Icono: BookOpen,
    fondo: 'from-[#c3e7e3] via-[#bce1df] to-[#b7d9d9]',
    borde: 'border-[#b8d9d8]',
    acento: 'from-[#7fbdb8] to-[#7eaeb8]',
    iconBoxFondo: 'from-[#dbf1ef] to-[#d3eae8]',
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
      setScore(s => s + 1);
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
      <div className={`w-full flex flex-col items-center justify-start gap-8 px-4 md:px-8 py-8 md:py-10 ${panelHeightClass} max-w-6xl mx-auto`}>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-5xl mx-auto">
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

                <div className="relative flex items-center gap-4 p-5 md:p-6">
                  <div
                    className={`
                      shrink-0 h-20 w-20 rounded-[24px] bg-gradient-to-br ${cat.iconBoxFondo}
                      ring-1 ring-white/40 shadow-[0_12px_26px_rgba(15,23,42,0.18)]
                      flex items-center justify-center transition-transform duration-300
                      group-hover:scale-105
                    `}
                  >
                    <div className="flex h-[70px] w-[70px] items-center justify-center rounded-[20px] bg-white/20 backdrop-blur-sm">
                      <Icono
                        className="h-9 w-9 text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.25)]"
                        strokeWidth={2.2}
                      />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-[22px] font-bold text-slate-800 tracking-[-0.02em] dark:text-white">
                        {cat.label}
                      </h3>

                      {cat.id === 'mixta' && (
                        <span className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-sky-600 shadow-sm">
                          Recomendado
                        </span>
                      )}
                    </div>

                    <p className="mt-1.5 max-w-[32ch] text-sm leading-6 text-slate-700/80 dark:text-slate-200/85">
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
      <div className="flex flex-col items-center gap-6 px-4 py-10 max-w-xl mx-auto text-center">
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
    <div className="flex flex-col items-center gap-5 px-4 py-6 max-w-xl mx-auto">
      <div className="flex items-center justify-between w-full">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Pregunta {preguntaNum} de {TOTAL_PREGUNTAS}
        </span>

        <span className="bg-[#4997D0] text-white px-4 py-1 rounded-full font-semibold text-sm">
          Puntos: {score}
        </span>
      </div>

      <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-2">
        <div
          className="bg-[#4997D0] h-2 rounded-full transition-all duration-500"
          style={{ width: `${((preguntaNum - 1) / TOTAL_PREGUNTAS) * 100}%` }}
        />
      </div>

      <VideoPlayer videoUrl={currentSign.url_video} signLabel="???" active={true} />

      <p className="text-gray-600 dark:text-gray-300 text-sm text-center">
        Observa el video y elige la seña correcta
      </p>

      <div className="grid grid-cols-2 gap-3 w-full">
        {opciones.map(option => (
          <button
            key={option}
            onClick={() => handleAnswer(option)}
            disabled={gameState !== 'playing'}
            className={`
              py-4 rounded-xl font-semibold text-base transition-all duration-200 uppercase
              ${getButtonStyle(option)} disabled:cursor-not-allowed
            `}
          >
            {option}
          </button>
        ))}
      </div>

      {gameState !== 'playing' && (
        <div className="flex flex-col items-center gap-3">
          <p className="text-xl font-semibold">
            {gameState === 'correct'
              ? '¡Correcto!'
              : `Era: ${currentSign.palabra.toUpperCase()}`}
          </p>

          <button
            onClick={handleNext}
            className="bg-[#4997D0] hover:bg-[#357ab8] text-white px-8 py-3 rounded-xl font-semibold transition-colors"
          >
            {preguntaNum >= TOTAL_PREGUNTAS ? 'Ver resultados' : 'Siguiente'}
          </button>
        </div>
      )}
    </div>
  );
}