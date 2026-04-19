import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { MainLayout } from '../layouts/MainLayout';
import { VideoPlayer } from '../components/VideoPlayer';

type GameState = 'playing' | 'correct' | 'wrong';
type Categoria = 'colores' | 'animales' | 'alimentos' | 'saludos' | 'mixta';

interface Signo {
  signo_id: string;
  palabra: string;
  categoria: string;
  url_video: string;
}

const CATEGORIAS: { id: Categoria; label: string; emoji: string }[] = [
  { id: 'mixta', label: 'Mixta', emoji: '🎲' },
  { id: 'colores', label: 'Colores', emoji: '🎨' },
  { id: 'animales', label: 'Animales', emoji: '🐾' },
  { id: 'alimentos', label: 'Alimentos', emoji: '🍎' },
  { id: 'saludos', label: 'Saludos', emoji: '👋' },
  { id: 'abecedario', label: 'Abecedario', emoji: '🔤' }
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
        fetch(`/api/categorias/${cat}`).then(r => r.json()).then(d => d.signos as Signo[])
      )
    );
    return todas.flat().filter(s => s.url_video);
  }
  const data = await fetch(`/api/categorias/${categoria}`).then(r => r.json());
  return (data.signos as Signo[]).filter(s => s.url_video);
}

export function AdivinaSena() {
  const navigate = useNavigate();

  // Pantallas: 'select' | 'playing' | 'finished'
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
      if (lista.length < 4) { setError(true); setLoading(false); return; }
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
    if (gameState === 'playing') return 'bg-[#4997D0] hover:bg-[#357ab8] text-white';
    if (option === currentSign?.palabra) return 'bg-green-500 text-white';
    if (option === selectedAnswer && gameState === 'wrong') return 'bg-red-500 text-white';
    return 'bg-[#4997D0]/40 text-white';
  };

  // ── PANTALLA: SELECCIÓN DE CATEGORÍA ──
  if (screen === 'select') {
    return (
      <MainLayout title="Adivina la seña" activePage="games"
        showClearButton={false} onNewConversation={() => navigate('/chat')}>
        <div className="flex flex-col items-center gap-8 px-4 py-10 max-w-xl mx-auto">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200">
              Elige una categoría
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Se te harán {TOTAL_PREGUNTAS} preguntas
            </p>
          </div>

          {error && (
            <p className="text-red-500 text-sm">Error al cargar. Intenta de nuevo.</p>
          )}

          <div className="grid grid-cols-1 gap-3 w-full">
            {CATEGORIAS.map(cat => (
              <button
                key={cat.id}
                onClick={() => iniciarJuego(cat.id)}
                disabled={loading}
                className="flex items-center gap-4 bg-white dark:bg-white/10 border border-[#4997D0]/30 hover:border-[#4997D0] hover:bg-[#4997D0]/10 rounded-2xl px-6 py-4 transition-all text-left disabled:opacity-50"
              >
                <span className="text-3xl">{cat.emoji}</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200 text-lg">
                  {cat.label}
                </span>
                {cat.id === 'mixta' && (
                  <span className="ml-auto text-xs bg-[#4997D0] text-white px-2 py-1 rounded-full">
                    Recomendado
                  </span>
                )}
              </button>
            ))}
          </div>

          {loading && (
            <div className="h-8 w-8 rounded-full border-4 border-[#4997D0]/30 border-t-[#4997D0] animate-spin" />
          )}
        </div>
      </MainLayout>
    );
  }

  // ── PANTALLA: FIN DE JUEGO ──
  if (screen === 'finished') {
    const porcentaje = Math.round((score / TOTAL_PREGUNTAS) * 100);
    const mensaje =
      porcentaje === 100 ? '¡Perfecto! 🏆' :
      porcentaje >= 70  ? '¡Muy bien! 🎉' :
      porcentaje >= 50  ? '¡Buen intento! 💪' :
                          'Sigue practicando 📚';

    return (
      <MainLayout title="Adivina la seña" activePage="games"
        showClearButton={false} onNewConversation={() => navigate('/chat')}>
        <div className="flex flex-col items-center gap-6 px-4 py-10 max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-700 dark:text-slate-200">{mensaje}</h2>

          <div className="bg-white dark:bg-white/10 rounded-3xl p-8 w-full border border-[#4997D0]/20 flex flex-col items-center gap-4">
            <p className="text-6xl font-extrabold text-[#4997D0]">{score}/{TOTAL_PREGUNTAS}</p>
            <p className="text-gray-500">respuestas correctas</p>

            {/* Barra de progreso */}
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
      </MainLayout>
    );
  }

  // ── PANTALLA: JUGANDO ──
  if (loading || !currentSign) {
    return (
      <MainLayout title="Adivina la seña" activePage="games"
        showClearButton={false} onNewConversation={() => navigate('/chat')}>
        <div className="flex min-h-full items-center justify-center">
          <div className="h-10 w-10 rounded-full border-4 border-[#4997D0]/30 border-t-[#4997D0] animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Adivina la seña" activePage="games"
      showClearButton={false} onNewConversation={() => navigate('/chat')}>
      <div className="flex flex-col items-center gap-5 px-4 py-6 max-w-xl mx-auto">

        {/* Header: progreso + puntos */}
        <div className="flex items-center justify-between w-full">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Pregunta {preguntaNum} de {TOTAL_PREGUNTAS}
          </span>
          <span className="bg-[#4997D0] text-white px-4 py-1 rounded-full font-semibold text-sm">
            Puntos: {score}
          </span>
        </div>

        {/* Barra de progreso */}
        <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-2">
          <div
            className="bg-[#4997D0] h-2 rounded-full transition-all duration-500"
            style={{ width: `${((preguntaNum - 1) / TOTAL_PREGUNTAS) * 100}%` }}
          />
        </div>

        {/* Video */}
        <VideoPlayer videoUrl={currentSign.url_video} signLabel="???" active={true} />

        {/* Instrucción */}
        <p className="text-gray-600 dark:text-gray-300 text-sm text-center">
          Observa el video y elige la seña correcta
        </p>

        {/* Opciones */}
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

        {/* Feedback */}
        {gameState !== 'playing' && (
          <div className="flex flex-col items-center gap-3">
            <p className="text-xl font-semibold">
              {gameState === 'correct' ? '¡Correcto!' : `Era: ${currentSign.palabra.toUpperCase()}`}
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
    </MainLayout>
  );
}