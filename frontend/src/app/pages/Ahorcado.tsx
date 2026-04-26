import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, RefreshCcw, VideoOff, Trophy, XCircle, RotateCcw, Gamepad2, Apple, Palette, PawPrint, Hand, Sparkles } from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { VideoPlayer } from '../components/VideoPlayer';
import { api } from '../../services/api';

type CategoryId = 'mixta' | 'colores' | 'animales' | 'alimentos' | 'saludos';

type AhorcadoScreen = 'select' | 'playing';

type WordEntry = {
  word: string;
  category: CategoryId;
};

const BACKEND_CATEGORIES: Array<Exclude<CategoryId, 'mixta'>> = ['colores', 'animales', 'alimentos', 'saludos'];

const WORDS: WordEntry[] = [
  { word: 'COCODRILO', category: 'animales' },
  { word: 'ROJO', category: 'colores' },
  { word: 'AZUL', category: 'colores' },
  { word: 'VERDE', category: 'colores' },
  { word: 'HOLA', category: 'saludos' },
  { word: 'GRACIAS', category: 'saludos' },
];

async function obtenerPalabraDesdeBackend(categoria: CategoryId): Promise<string | null> {
  try {
    const categorias = categoria === 'mixta' ? BACKEND_CATEGORIES : [categoria];
    const respuestas = await Promise.all(
      categorias.map(cat => api.obtenerSignosPorCategoria(cat))
    );

    const signosConVideo = respuestas
      .flatMap(respuesta => respuesta.signos)
      .filter(signo => signo.url_video && signo.palabra)
      .map(signo => signo.palabra.toUpperCase());

    if (!signosConVideo.length) {
      return null;
    }

    return signosConVideo[Math.floor(Math.random() * signosConVideo.length)];
  } catch {
    return null;
  }
}

const CATEGORIES: { id: CategoryId; label: string; accent: string; Icon: typeof Sparkles }[] = [
  { id: 'mixta', label: 'Mixta', accent: 'from-[#D8FCFF] to-[#B8E8F2]', Icon: Sparkles },
  { id: 'colores', label: 'Colores', accent: 'from-[#E5F8FF] to-[#A7DDFF]', Icon: Palette },
  { id: 'animales', label: 'Animales', accent: 'from-[#E6FCEB] to-[#9EEABD]', Icon: PawPrint },
  { id: 'alimentos', label: 'Alimentos', accent: 'from-[#FEF7CD] to-[#FDE68A]', Icon: Apple },
  { id: 'saludos', label: 'Saludos', accent: 'from-[#FFE4ED] to-[#F5B7D5]', Icon: Hand },
];

const KEY_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

function normalizeApiKeyword(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

function Hangman({ errors }: { errors: number }) {
  return (
    <svg viewBox="0 0 220 190" className="w-full h-full" aria-hidden="true">
      <line x1="24" y1="186" x2="198" y2="186" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
      <line x1="60" y1="186" x2="60" y2="16" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
      <line x1="58" y1="16" x2="140" y2="16" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
      <line x1="138" y1="16" x2="138" y2="38" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
      {errors > 0 && <circle cx="138" cy="54" r="18" stroke="#ef4444" strokeWidth="4" fill="none" />}
      {errors > 1 && <line x1="138" y1="72" x2="138" y2="114" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />}
      {errors > 2 && <line x1="138" y1="82" x2="112" y2="106" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />}
      {errors > 3 && <line x1="138" y1="82" x2="164" y2="106" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />}
      {errors > 4 && <line x1="138" y1="114" x2="112" y2="146" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />}
      {errors > 5 && <line x1="138" y1="114" x2="164" y2="146" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />}
    </svg>
  );
}

export function Ahorcado() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState<AhorcadoScreen>('select');
  const [category, setCategory] = useState<CategoryId>('mixta');
  const [wordData, setWordData] = useState('');
  const [loadingWord, setLoadingWord] = useState(false);

  const activeCategoryLabel = CATEGORIES.find((cat) => cat.id === category)?.label ?? 'Mixta';
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [guessed, setGuessed] = useState<Set<string>>(new Set());

  const embedVideoUrl = useMemo(() => {
    if (!videoUrl) return null;
    try {
      const url = new URL(videoUrl);
      url.searchParams.set('modestbranding', '1');
      url.searchParams.set('controls', '0');
      url.searchParams.set('rel', '0');
      url.searchParams.set('showinfo', '0');
      url.searchParams.set('disablekb', '1');
      return url.toString();
    } catch {
      return videoUrl;
    }
  }, [videoUrl]);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const errors = useMemo(() => [...guessed].filter((letter) => !wordData.includes(letter)).length, [guessed, wordData]);
  const revealedLetters = useMemo(() => new Set(wordData.split('').filter((letter) => guessed.has(letter))), [guessed, wordData]);

  const newGame = useCallback(
    async (nextCategory: CategoryId = category) => {
      setScreen('playing');
      setCategory(nextCategory);
      setLoadingWord(true);
      setGuessed(new Set());
      setGameOver(false);
      setWon(false);

      const backendWord = await obtenerPalabraDesdeBackend(nextCategory);
      if (backendWord) {
        setWordData(backendWord);
      } else {
        const options = nextCategory === 'mixta' ? WORDS : WORDS.filter((item) => item.category === nextCategory);
        const entry = options[Math.floor(Math.random() * options.length)];
        setWordData(entry?.word ?? '');
      }

      setLoadingWord(false);
    },
    [category]
  );

  const handleGuess = useCallback(
    (letter: string) => {
      if (gameOver || guessed.has(letter)) return;
      const next = new Set(guessed);
      next.add(letter);
      setGuessed(next);
      const nextErrors = [...next].filter((value) => !wordData.includes(value)).length;
      const completed = wordData.split('').every((value) => next.has(value));
      if (completed) {
        setWon(true);
        setGameOver(true);
      } else if (nextErrors >= 6) {
        setWon(false);
        setGameOver(true);
      }
    },
    [gameOver, guessed, wordData]
  );

  const startGame = (selectedCategory: CategoryId) => {
    setCategory(selectedCategory);
    void newGame(selectedCategory);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toUpperCase();
      if (/^[A-ZÑ]$/.test(key)) {
        handleGuess(key);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleGuess]);

  useEffect(() => {
    let cancelled = false;

    async function loadVideo() {
      if (!wordData) {
        setVideoUrl(null);
        return;
      }

      const palabraNormalizada = wordData
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      console.log('[Ahorcado] loadVideo wordData=', wordData, 'palabraNormalizada=', palabraNormalizada);
      setLoadingVideo(true);
      try {
        const data = await api.buscarSigno(palabraNormalizada);
        console.log('[Ahorcado] video api response=', data);
        if (!cancelled) {
          setVideoUrl(data?.url_video ?? null);
        }
      } catch (error) {
        if (!cancelled) {
          setVideoUrl(null);
        }
        console.warn('[Ahorcado] failed to load video for', palabraNormalizada, error);
      } finally {
        if (!cancelled) {
          setLoadingVideo(false);
        }
      }
    }

    void loadVideo();
    return () => {
      cancelled = true;
    };
  }, [wordData]);

  if (screen === 'select') {
    return (
      <MainLayout
        title="Ahorcado"
        activePage="games"
        showClearButton={false}
        onNewConversation={() => navigate('/chat')}
      >
        <div className="w-full flex flex-col items-center justify-start gap-8 px-4 md:px-8 py-8 md:py-10 min-h-[620px] max-w-6xl mx-auto">
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
              Escoge un tema y comienza la partida de ahorcado.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-4xl mx-auto">
            {CATEGORIES.map((cat) => {
              const activa = category === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => startGame(cat.id)}
                  disabled={loadingWord}
                  className={`
                    group relative overflow-hidden rounded-[28px] border p-0 text-left
                    transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                    bg-gradient-to-br ${cat.accent}
                    shadow-[0_14px_35px_rgba(15,23,42,0.10)]
                    hover:-translate-y-1.5 hover:shadow-[0_22px_50px_rgba(15,23,42,0.16)]
                    ${activa ? 'ring-2 ring-[#3b82f6]/40 scale-[1.01]' : ''}
                  `}
                >
                  <span className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.28),transparent_28%)]" />
                  <span className="absolute -left-10 top-8 h-28 w-28 rounded-full bg-white/15 blur-2xl" />

                  <div className="relative flex items-center gap-3 p-3 md:p-4">
                    <div
                      className="shrink-0 h-16 w-16 rounded-[20px] bg-white/80 ring-1 ring-white/80 shadow-[0_12px_26px_rgba(15,23,42,0.08)] flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
                    >
                      <cat.Icon className="h-7 w-7 text-slate-900" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-[18px] font-bold text-slate-800 tracking-[-0.02em] dark:text-white">
                          {cat.label}
                        </h3>
                      </div>
                      <p className="mt-1 max-w-[28ch] text-xs leading-5 text-slate-700/80 dark:text-slate-200/85">
                        {cat.id === 'mixta'
                          ? 'Palabras aleatorias de todas las categorías.'
                          : `Práctica sobre ${cat.label.toLowerCase()}.`}
                      </p>
                    </div>

                    <div className="hidden md:flex shrink-0 items-center">
                      <div className={`rounded-2xl bg-white/80 px-4 py-2 text-sm font-semibold text-slate-900 shadow-[0_10px_24px_rgba(15,23,42,0.08)]`}>
                        Jugar
                      </div>
                    </div>
                  </div>

                  <div className={`h-1.5 w-full bg-white/40 opacity-90`} />
                </button>
              );
            })}
          </div>

          {loadingWord && (
            <div className="h-8 w-8 rounded-full border-4 border-[#4997D0]/30 border-t-[#4997D0] animate-spin mx-auto" />
          )}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title="Ahorcado"
      activePage="games"
      showClearButton={false}
      onNewConversation={() => navigate('/chat')}
    >
      <div className="w-full h-full flex flex-col justify-center items-center gap-4 px-4 pt-6 pb-4 md:px-6 md:py-6">
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setShowExitConfirm(true)}
              className="inline-flex items-center gap-2 px-3 py-2 ml-2 md:ml-4 text-sm font-semibold text-slate-900 transition hover:text-slate-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Regresar la categoría
            </button>
          </div>
          <div className="flex flex-1 flex-wrap items-center justify-end gap-3">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700 dark:bg-slate-900 dark:text-slate-200">
              Categoría: {activeCategoryLabel}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700 dark:bg-slate-900 dark:text-slate-200">
              {Math.max(0, 6 - errors)}/6 intentos
            </span>
            <button
              type="button"
              onClick={() => newGame(category)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              <RefreshCcw className="h-4 w-4" />
              Nueva palabra
            </button>
          </div>
        </div>

        <div className="flex h-full w-full flex-1 flex-col justify-center gap-4 xl:grid xl:grid-cols-[60%_40%] xl:items-center xl:gap-8 xl:max-w-[1180px] xl:mx-auto">
          <div className="order-1 xl:order-0 flex min-h-0 flex-1 flex-col items-center justify-between gap-6 pt-4 xl:max-w-[60%] xl:mx-auto">
            <div className="w-full border-b border-slate-200 pb-6 flex-1">
              <div className="rounded-[28px] pt-0 pb-4 px-4 min-h-[250px] max-h-[250px] w-full max-w-[520px] mx-auto bg-transparent flex-1">
                <div className="h-full w-full flex items-center justify-center">
                  <Hangman errors={errors} />
                </div>
              </div>
            </div>

            <div className="mt-auto w-full">
              <div className={`relative mt-8 mb-2 flex flex-row flex-wrap justify-center gap-2 overflow-hidden rounded-3xl ${won ? 'animate-celebrate' : ''}`}>
                {won && (
                  <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-0 overflow-visible">
                    <span className="confetti confetti-1" />
                    <span className="confetti confetti-2" />
                    <span className="confetti confetti-3" />
                    <span className="confetti confetti-4" />
                    <span className="confetti confetti-5" />
                    <span className="confetti confetti-6" />
                  </div>
                )}
                {wordData.split('').map((letter, index) => (
                  <div
                    key={`${letter}-${index}`}
                    className="relative flex h-9 w-9 min-w-[34px] items-center justify-center rounded-2xl border border-slate-200 bg-transparent text-sm font-bold text-slate-900"
                  >
                    {revealedLetters.has(letter) ? letter : '—'}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-2 w-full -mt-2">
              {KEY_ROWS.map((row, rowIndex) => (
                <div
                  key={rowIndex}
                  className={`grid w-full gap-1 ${row.length === 7 ? 'grid-cols-7' : 'grid-cols-10'}`}
                >
                  {row.map((letter) => {
                    const isUsed = guessed.has(letter);
                    const isCorrect = guessed.has(letter) && wordData.includes(letter);
                    const isWrong = guessed.has(letter) && !wordData.includes(letter);
                    return (
                      <button
                        key={letter}
                        type="button"
                        disabled={isUsed || gameOver}
                        onClick={() => handleGuess(letter)}
                        className={`h-9 min-h-[36px] min-w-[36px] rounded-2xl border px-1 text-sm font-semibold transition ${
                          isCorrect
                            ? 'border-emerald-400 bg-emerald-500/15 text-emerald-700'
                            : isWrong
                            ? 'border-rose-400 bg-rose-500/15 text-rose-700 line-through'
                            : 'border-slate-300 bg-white text-slate-900 hover:border-slate-400 hover:bg-slate-50'
                        }`}
                      >
                        {letter}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <aside className="order-0 xl:order-1 flex min-h-0 flex-1 flex-col justify-center items-center gap-4 xl:pl-0">
            {embedVideoUrl ? (
              <>
                <div className="ahorcado-video-crop overflow-hidden rounded-[16px] w-[520px] h-[360px] flex items-center justify-center">
                  <VideoPlayer videoUrl={embedVideoUrl} signLabel={wordData} active={!gameOver} showLabel={false} />
                </div>
                {loadingVideo && (
                  <p className="text-sm text-slate-500">Cargando video...</p>
                )}
              </>
            ) : (
              <div className="flex min-h-[280px] flex-1 flex-col items-center justify-center gap-3 rounded-[24px] bg-slate-100/70 p-4 text-center text-sm text-slate-500">
                <VideoOff className="h-8 w-8 text-slate-400" />
                Sin video disponible
              </div>
            )}
          </aside>
        </div>
      </div>
      <style>{`.ahorcado-video-crop iframe { width: 100%; height: 100%; display: block; }

        .animate-celebrate {
          animation: sparkle 1.5s ease-in-out both;
        }

        @keyframes sparkle {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02);
          }
        }

        .confetti {
          position: absolute;
          width: 8px;
          height: 14px;
          border-radius: 9999px;
          opacity: 0;
          animation: confetti-fall 1.5s ease-out forwards;
        }

        .confetti-1 { left: 10%; background: #fb7185; animation-delay: 0s; }
        .confetti-2 { left: 25%; background: #f59e0b; animation-delay: 0.1s; }
        .confetti-3 { left: 40%; background: #34d399; animation-delay: 0.2s; }
        .confetti-4 { left: 55%; background: #60a5fa; animation-delay: 0.05s; }
        .confetti-5 { left: 70%; background: #a78bfa; animation-delay: 0.15s; }
        .confetti-6 { left: 85%; background: #f97316; animation-delay: 0.08s; }

        @keyframes confetti-fall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(140px) rotate(360deg);
            opacity: 0;
          }
        }

        .animate-modal {
          animation: modal-appear 0.25s ease-out forwards;
        }

        .animate-victory-fade {
          animation: victory-fade 0.5s ease-out forwards;
        }

        @keyframes modal-appear {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes victory-fade {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>

      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl animate-modal">
            <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Confirmación</p>
            <h2 className="mt-4 text-2xl font-bold text-slate-900">¿Deseas salir del juego?</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">Tu progreso actual se perderá si sales ahora.</p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="inline-flex flex-1 items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => navigate('/games')}
                className="inline-flex flex-1 items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      )}

      {gameOver && !showExitConfirm && (
        won ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-green-500 px-4 py-6 animate-victory-fade">
            <div className="w-full max-w-3xl text-center text-white">
              <h2 className="text-4xl font-black uppercase tracking-[0.24em] sm:text-5xl">
                Bien hecho
              </h2>
              <p className="mt-4 text-lg leading-7 text-white/90 sm:text-xl">
                Adivinaste: {wordData}
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => newGame(category)}
                  className="inline-flex min-w-[180px] items-center justify-center rounded-2xl border border-white bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20 gap-2"
                >
                  <RotateCcw className="h-[18px] w-[18px]" />
                  Nueva palabra
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/games')}
                  className="inline-flex min-w-[180px] items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-green-600 transition hover:bg-slate-100 gap-2"
                >
                  <Gamepad2 className="h-4.5 w-4.5" />
                  Regresar la categoría
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-red-500 px-4 py-6 animate-victory-fade">
            <div className="w-full max-w-3xl text-center text-white">
              <h2 className="text-4xl font-black uppercase tracking-[0.24em] sm:text-5xl">
                ¡PERDISTE!
              </h2>
              <p className="mt-4 text-lg leading-7 text-white/90 sm:text-xl">
                La palabra era: {wordData}
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => newGame(category)}
                  className="inline-flex min-w-[180px] items-center justify-center rounded-2xl border border-white bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20 gap-2"
                >
                  <RotateCcw className="h-[18px] w-[18px]" />
                  Nueva palabra
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/games')}
                  className="inline-flex min-w-[180px] items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-red-600 transition hover:bg-slate-100 gap-2"
                >
                  <Gamepad2 className="h-4.5 w-4.5" />
                  Regresar la categoría
                </button>
              </div>
            </div>
          </div>
        )
      )}
    </MainLayout>
  );
}
