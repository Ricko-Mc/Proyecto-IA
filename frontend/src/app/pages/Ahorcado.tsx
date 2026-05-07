import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, RefreshCcw, VideoOff, Trophy, XCircle, RotateCcw, Gamepad2, Apple, Palette, PawPrint, Hand, Sparkles, Dice5, BookOpen, MessageSquare } from 'lucide-react';
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
import { api } from '../../services/api';

type CategoryId = 'mixta' | 'colores' | 'animales' | 'alimentos' | 'saludos' | 'frases_comunes';

type AhorcadoScreen = 'select' | 'playing';

type WordEntry = {
  word: string;
  category: CategoryId;
};

const BACKEND_CATEGORIES: Array<Exclude<CategoryId, 'mixta'>> = ['colores', 'animales', 'alimentos', 'saludos', 'frases_comunes'];

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

interface CategoriaItem {
  id: CategoryId;
  label: string;
  descripcion: string;
  Icon: typeof Sparkles;
  fondo: string;
  borde: string;
  acento: string;
  iconBoxFondo: string;
}

const CATEGORIES: CategoriaItem[] = [
  {
    id: 'mixta',
    label: 'Mixta',
    descripcion: 'Palabras aleatorias de todas las categorías.',
    Icon: Dice5,
    fondo: 'from-[#DBEAFE] via-[#BFDBFE] to-[#A5C8F5]',
    borde: 'border-[#BFDBFE]',
    acento: 'from-[#2563EB] to-[#1D4ED8]',
    iconBoxFondo: 'from-[#EFF6FF] to-[#DBEAFE]',
  },
  {
    id: 'colores',
    label: 'Colores',
    descripcion: 'Práctica sobre colores.',
    Icon: Palette,
    fondo: 'from-[#E0F2FE] via-[#BAE6FD] to-[#7DD3FC]',
    borde: 'border-[#BAE6FD]',
    acento: 'from-[#0284C7] to-[#0369A1]',
    iconBoxFondo: 'from-[#F0F9FF] to-[#E0F2FE]',
  },
  {
    id: 'animales',
    label: 'Animales',
    descripcion: 'Práctica sobre animales.',
    Icon: PawPrint,
    fondo: 'from-[#CFFAFE] via-[#A5F3FC] to-[#67E8F9]',
    borde: 'border-[#A5F3FC]',
    acento: 'from-[#0891B2] to-[#0E7490]',
    iconBoxFondo: 'from-[#ECFEFF] to-[#CFFAFE]',
  },
  {
    id: 'alimentos',
    label: 'Alimentos',
    descripcion: 'Práctica sobre alimentos.',
    Icon: Apple,
    fondo: 'from-[#C7D7F5] via-[#A8BFEF] to-[#8FAAE8]',
    borde: 'border-[#A8BFEF]',
    acento: 'from-[#3B5EC6] to-[#2D4DB5]',
    iconBoxFondo: 'from-[#E8EEFB] to-[#C7D7F5]',
  },
  {
    id: 'saludos',
    label: 'Saludos',
    descripcion: 'Práctica sobre saludos.',
    Icon: Hand,
    fondo: 'from-[#D1E8FF] via-[#B3D4FF] to-[#8FBFFF]',
    borde: 'border-[#B3D4FF]',
    acento: 'from-[#1A6FD4] to-[#1558B0]',
    iconBoxFondo: 'from-[#EBF4FF] to-[#D1E8FF]',
  },
  {
    id: 'frases_comunes',
    label: 'Frases Comunes',
    descripcion: 'Expresiones del día a día.',
    Icon: MessageSquare,
    fondo: 'from-[#B2EBF9] via-[#81D8F5] to-[#4FC3EF]',
    borde: 'border-[#81D8F5]',
    acento: 'from-[#0277BD] to-[#01579B]',
    iconBoxFondo: 'from-[#E1F5FE] to-[#B2EBF9]',
  },
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
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [pendingExitCallback, setPendingExitCallback] = useState<(() => void) | null>(null);

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

  const handleRequestExit = (callback: () => void) => {
    if (screen === 'playing') {
      setPendingExitCallback(() => callback);
      setShowExitDialog(true);
    } else {
      callback();
    }
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
        onRequestExit={handleRequestExit}
      >
        <div className="w-full flex flex-col items-center justify-start gap-8 px-4 md:px-8 py-8 md:py-10 min-h-[620px] max-w-6xl mx-auto">
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

          <div className="grid grid-cols-2 gap-4 w-full max-w-4xl mx-auto mt-2 px-4">
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
                      className={`shrink-0 h-16 w-16 rounded-[20px] bg-gradient-to-br ${cat.iconBoxFondo} ring-1 ring-white/80 shadow-[0_12px_26px_rgba(15,23,42,0.08)] flex items-center justify-center transition-transform duration-300 group-hover:scale-105`}
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
                        {cat.descripcion}
                      </p>
                    </div>

                    <div className="hidden md:flex shrink-0 items-center">
                      <div className={`rounded-2xl bg-gradient-to-r ${cat.acento} px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(0,0,0,0.14)]`}>
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
          <BottomNav />
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
      onRequestExit={handleRequestExit}
    >
      {/* Wrapper principal: scroll vertical, no overflow horizontal */}
      <div className="w-full flex flex-col items-center gap-4 px-3 pt-6 pb-4 md:px-6 md:pt-10 md:pb-6 overflow-x-hidden">

        {/* Barra de controles */}
        <div className="flex w-full flex-wrap items-center justify-between gap-1 mt-2">
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setScreen('select')}
              className="inline-flex items-center gap-1.5 px-2 py-1 ml-2 md:ml-10 text-xs md:text-sm font-semibold text-slate-900 transition hover:text-slate-700"
            >
              <ArrowLeft className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Regresar a categorías</span>
              <span className="sm:hidden">Atrás</span>
            </button>
          </div>
          <div className="flex flex-1 flex-wrap items-center justify-end gap-1.5 md:gap-3">
            <span className="rounded-full bg-slate-100 px-2 py-0.5 md:px-3 md:py-1 text-[10px] md:text-xs font-semibold uppercase tracking-[0.16em] text-slate-700 dark:bg-slate-900 dark:text-slate-200">
              {activeCategoryLabel}
            </span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 md:px-3 md:py-1 text-[10px] md:text-xs font-semibold uppercase tracking-[0.16em] text-slate-700 dark:bg-slate-900 dark:text-slate-200">
              {Math.max(0, 6 - errors)}/6
            </span>
            <button
              type="button"
              onClick={() => newGame(category)}
              className="inline-flex items-center gap-1 md:gap-2 rounded-full border border-slate-300 bg-white px-2 py-1 md:px-3 md:py-2 text-xs md:text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              <RefreshCcw className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Nueva palabra</span>
              <span className="sm:hidden">Nueva</span>
            </button>
          </div>
        </div>

        {/* ── ZONA PRINCIPAL ──────────────────────────────────────────────
            Mobile:  fila horizontal [Hangman | Video] + letras abajo
            Desktop: columna izquierda (hangman+letras) | columna derecha (video)
        ──────────────────────────────────────────────────────────────── */}
        <div className="w-full max-w-[1200px] mx-auto flex flex-col gap-5 mt-2 md:mt-6">

          {/* Fila superior: Hangman + Video lado a lado en MOBILE y DESKTOP */}
          <div className="flex flex-row gap-3 w-full items-stretch">

            {/* Hangman — mitad izquierda en mobile, 45% en desktop */}
            <div className="flex-1 min-w-0 flex flex-col gap-2 items-center">
              {/* SVG hangman */}
              <div className="w-full aspect-[220/190] max-h-[200px] sm:max-h-[240px] md:max-h-[280px] lg:max-h-[340px]">
                <Hangman errors={errors} />
              </div>

              {/* Letras de la palabra — visibles solo en desktop debajo del hangman */}
              <div className={`hidden lg:flex flex-wrap justify-center gap-2 w-full px-2 ${won ? 'animate-celebrate' : ''}`}>
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
                    className="relative flex h-11 min-w-[36px] items-center justify-center rounded-2xl border border-slate-200 bg-transparent text-sm font-bold text-slate-900 px-2"
                  >
                    {revealedLetters.has(letter) ? letter : '—'}
                  </div>
                ))}
              </div>
            </div>

            {/* Video — mitad derecha en mobile, 45% en desktop */}
            <div className="flex-1 min-w-0 flex flex-col items-center justify-start">
              {embedVideoUrl ? (
                <div className="ahorcado-video-crop overflow-hidden rounded-[16px] w-full h-[200px] sm:h-[240px] md:h-[280px] lg:h-[340px] flex items-center justify-center">
                  <VideoPlayer videoUrl={embedVideoUrl} signLabel={wordData} active={!gameOver} showLabel={false} />
                </div>
              ) : (
                <div className="flex w-full h-[200px] sm:h-[240px] md:h-[280px] lg:h-[340px] flex-col items-center justify-center gap-2 rounded-[20px] bg-slate-100/70 text-center text-xs text-slate-500">
                  <VideoOff className="h-6 w-6 text-slate-400" />
                  {loadingVideo ? 'Cargando...' : 'Sin video'}
                </div>
              )}
            </div>
          </div>

          {/* Letras de la palabra — visibles solo en MOBILE (debajo de la fila hangman+video) */}
          <div className={`flex lg:hidden flex-wrap justify-center gap-1.5 w-full px-2 ${won ? 'animate-celebrate' : ''}`}>
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
                className="relative flex h-9 min-w-[30px] items-center justify-center rounded-xl border border-slate-200 bg-transparent text-xs font-bold text-slate-900 px-1.5"
              >
                {revealedLetters.has(letter) ? letter : '—'}
              </div>
            ))}
          </div>

          {/* Teclado — ancho completo siempre */}
          <div className="grid gap-1.5 w-full px-1">
            {KEY_ROWS.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className={`grid w-full gap-1 sm:gap-1.5 justify-center ${row.length === 7 ? 'grid-cols-7' : 'grid-cols-10'}`}
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
                      className={`h-9 sm:h-10 md:h-11 min-w-0 w-full rounded-xl border px-0.5 text-[11px] sm:text-xs md:text-sm font-semibold transition ${
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
        {/* ── FIN ZONA PRINCIPAL ── */}

        <BottomNav />
      </div>

      <style>{`
        .ahorcado-video-crop iframe { width: 100%; height: 100%; display: block; }
        .ahorcado-video-crop > * { width: 100%; height: 100%; }

        .animate-celebrate {
          animation: sparkle 1.5s ease-in-out both;
        }

        @keyframes sparkle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
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
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(140px) rotate(360deg); opacity: 0; }
        }

        .animate-modal {
          animation: modal-appear 0.25s ease-out forwards;
        }

        .animate-victory-fade {
          animation: victory-fade 0.5s ease-out forwards;
        }

        @keyframes modal-appear {
          from { opacity: 0; transform: translateY(-10px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes victory-fade {
          from { opacity: 0; }
          to { opacity: 1; }
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
                  onClick={() => navigate('/games/ahorcado')}
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
                  onClick={() => navigate('/games/ahorcado')}
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
                setWordData('');
                setGuessed(new Set());
                setGameOver(false);
                setWon(false);
                
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
    </MainLayout>
  );
}