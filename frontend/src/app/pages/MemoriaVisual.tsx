import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { 
  Apple, PawPrint, Palette, MessageSquare, Hand, Type, Dice5,
  ArrowLeft, Sparkles, Clock, XCircle, Loader2, Trophy, AlertTriangle, Bot, Smile, Zap, RefreshCcw, Home
} from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { BottomNav } from '../components/BottomNav';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
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

type GameState = 'select' | 'difficulty' | 'playing';
type Dificultad = 'facil' | 'intermedio' | 'dificil';
type StatusPartida = 'activa' | 'ganada' | 'perdida';
type Categoria = 'abecedario' | 'alimentos' | 'animales' | 'colores' | 'frases_comunes' | 'saludos' | 'mixta';

const CONFIG_DIFICULTAD = {
  facil:      { pares: 4,  tiempo: 120, cols: 4,  label: 'Fácil',       color: 'from-[#D1FAE5] to-[#6EE7B7]', acento: 'from-[#059669] to-[#047857]', descripcion: '4 pares · 2 minutos', Icono: Smile },
  intermedio: { pares: 6,  tiempo: 180, cols: 4,  label: 'Intermedio',  color: 'from-[#DBEAFE] to-[#93C5FD]', acento: 'from-[#2563EB] to-[#1D4ED8]', descripcion: '6 pares · 3 minutos', Icono: Sparkles },
  dificil:    { pares: 10, tiempo: 240, cols: 5,  label: 'Difícil',     color: 'from-[#FCE7F3] to-[#F9A8D4]', acento: 'from-[#DB2777] to-[#BE185D]', descripcion: '10 pares · 4 minutos', Icono: Zap },
};

interface CartaTablero {
  uniqueId: string;
  parId: string;
  tipo: 'texto' | 'video';
  contenido: string;
  volteada: boolean;
  emparejada: boolean;
  error: boolean;
}

export const MemoriaVisual = () => {
  const navigate = useNavigate();
  const [screen, setScreen] = useState<GameState>('select');
  const [statusPartida, setStatusPartida] = useState<StatusPartida>('activa');
  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [dificultad, setDificultad] = useState<Dificultad>('intermedio');
  const [categoriaElegida, setCategoriaElegida] = useState<Categoria | null>(null);
  const [cartas, setCartas] = useState<CartaTablero[]>([]);
  const [seleccionadas, setSeleccionadas] = useState<string[]>([]);
  const [bloqueoTablero, setBloqueoTablero] = useState(false);
  const [tiempo, setTiempo] = useState(180); 
  const [cargando, setCargando] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [pendingExitCallback, setPendingExitCallback] = useState<(() => void) | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startSound = useRef(new Audio('/sounds/start.mp3'));

  useEffect(() => {
    startSound.current.loop = true;
    return () => {
      stopStartSound();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const playStartSound = () => {
    startSound.current.currentTime = 0;
    startSound.current.play().catch(e => console.log('Autoplay bloqueado', e));
  };

  const stopStartSound = () => {
    startSound.current.pause();
    startSound.current.currentTime = 0;
  };

  const playSynthSound = (type: 'flip' | 'match' | 'error' | 'win' | 'lose') => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      
      const playTone = (freq: number, oscType: OscillatorType, dur: number, startTime = 0) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = oscType;
        osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + startTime);
        osc.stop(ctx.currentTime + startTime + dur);
      };

      if (type === 'flip') {
        playTone(400, 'sine', 0.1);
      } else if (type === 'match') {
        playTone(523.25, 'sine', 0.1, 0);   
        playTone(659.25, 'sine', 0.2, 0.1); 
      } else if (type === 'error') {
        playTone(150, 'sawtooth', 0.2, 0);  
        playTone(100, 'sawtooth', 0.2, 0.15); 
      } else if (type === 'win') {
        playTone(523.25, 'sine', 0.1, 0);    
        playTone(659.25, 'sine', 0.1, 0.1);  
        playTone(783.99, 'sine', 0.1, 0.2);  
        playTone(1046.50, 'sine', 0.4, 0.3); 
      } else if (type === 'lose') {
        playTone(392.00, 'triangle', 0.2, 0);   
        playTone(311.13, 'triangle', 0.2, 0.2); 
        playTone(261.63, 'triangle', 0.5, 0.4); 
      }
    } catch (e) {
      console.error("Audio API no soportada en este navegador", e);
    }
  };

  const categorias = [
    {
      id: 'mixta',
      label: 'Mixta',
      descripcion: 'Palabras aleatorias de todas las categorías.',
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
      id: 'frases_comunes',
      label: 'Frases Comunes',
      descripcion: 'Expresiones del día a día en lengua de señas.',
      Icono: MessageSquare,
      fondo: 'from-[#B2EBF9] via-[#81D8F5] to-[#4FC3EF]',
      borde: 'border-[#81D8F5]',
      acento: 'from-[#0277BD] to-[#01579B]',
      iconBoxFondo: 'from-[#E1F5FE] to-[#B2EBF9]',
    },
    {
      id: 'abecedario',
      label: 'Abecedario',
      descripcion: 'Refuerza letras y base del lenguaje de señas.',
      Icono: Type,
      fondo: 'from-[#C8E6FA] via-[#A9D5F7] to-[#7BBFF2]',
      borde: 'border-[#A9D5F7]',
      acento: 'from-[#1565C0] to-[#0D47A1]',
      iconBoxFondo: 'from-[#E3F2FD] to-[#C8E6FA]',
    },
  ];

  const extraerIdYoutube = (urlOId: string) => {
    if (!urlOId) return 'placeholder';
    const match = urlOId.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match ? match[1] : urlOId;
  };

  const iniciarJuego = async (cat: Categoria, diff: Dificultad = dificultad) => {
    setCategoria(cat);
    setCargando(true);
    setStatusPartida('activa');
    setDificultad(diff);
    
    try {
      const paresReales = await api.obtenerParesMemoria(cat);
      const maxPares = CONFIG_DIFICULTAD[diff].pares;
      const paresLimitados = paresReales.slice(0, maxPares);

      let mazo: CartaTablero[] = [];
      paresLimitados.forEach((par: any) => {
        mazo.push({ uniqueId: `${par.id}-T`, parId: par.id, tipo: 'texto', contenido: par.palabra, volteada: false, emparejada: false, error: false });
        mazo.push({ uniqueId: `${par.id}-V`, parId: par.id, tipo: 'video', contenido: par.video_id, volteada: false, emparejada: false, error: false });
      });

      setCartas(mazo.sort(() => Math.random() - 0.5));
      setTiempo(CONFIG_DIFICULTAD[diff].tiempo);
      setSeleccionadas([]);
      setBloqueoTablero(false);
      setScreen('playing');
      playStartSound(); 

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTiempo((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setCartas(c => c.map(card => ({ ...card, volteada: true })));
            setStatusPartida('perdida');
            setBloqueoTablero(true);
            stopStartSound();
            playSynthSound('lose'); 
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (error) {
      console.error("Error al cargar los pares:", error);
    } finally {
      setCargando(false);
    }
  };

  const handleRequestExit = (callback: () => void) => {
    if (screen === 'playing') {
      setPendingExitCallback(() => callback);
      setShowExitConfirm(true);
    } else {
      callback();
    }
  };

  const finalizarJuego = () => {
    setShowExitConfirm(true);
  };

  const confirmarSalida = () => {
    stopStartSound();
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Si hay un callback pendiente de navegación, ejecutarlo
    if (pendingExitCallback) {
      pendingExitCallback();
      setPendingExitCallback(null);
    } else {
      navigate('/games');
    }
  };

  const manejarClick = (id: string) => {
    if (bloqueoTablero || tiempo === 0 || statusPartida !== 'activa') return;
    const carta = cartas.find(c => c.uniqueId === id);
    if (!carta || carta.volteada || carta.emparejada) return;

    playSynthSound('flip'); 

    const nuevasCartas = cartas.map(c => c.uniqueId === id ? { ...c, volteada: true } : c);
    setCartas(nuevasCartas);
    const nuevasSeleccionadas = [...seleccionadas, id];
    setSeleccionadas(nuevasSeleccionadas);

    if (nuevasSeleccionadas.length === 2) {
      setBloqueoTablero(true);
      const c1 = nuevasCartas.find(c => c.uniqueId === nuevasSeleccionadas[0]);
      const c2 = nuevasCartas.find(c => c.uniqueId === nuevasSeleccionadas[1]);

      if (c1?.parId === c2?.parId) {
        playSynthSound('match'); 
        setTimeout(() => {
          setCartas(prev => {
            const estadoActualizado = prev.map(c => c.parId === c1?.parId ? { ...c, emparejada: true } : c);
            if (estadoActualizado.every(c => c.emparejada)) {
              if (timerRef.current) clearInterval(timerRef.current);
              setStatusPartida('ganada');
              stopStartSound();
              playSynthSound('win'); 
            }
            return estadoActualizado;
          });
          setSeleccionadas([]);
          setBloqueoTablero(false);
        }, 1500);
      } else {
        playSynthSound('error'); 
        setCartas(prev => prev.map(c => nuevasSeleccionadas.includes(c.uniqueId) ? { ...c, error: true } : c));
        
        setTimeout(() => {
          setCartas(prev => prev.map(c => nuevasSeleccionadas.includes(c.uniqueId) ? { ...c, volteada: false, error: false } : c));
          setSeleccionadas([]);
          setBloqueoTablero(false);
        }, 1500); 
      }
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-transparent font-poppins relative">
      <style>{`
        .flip-card { perspective: 1000px; }
        .flip-card-inner { transition: transform 0.6s; transform-style: preserve-3d; }
        .flipped { transform: rotateY(180deg); }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
      
      <MainLayout title="Memoria Visual" activePage="games" showClearButton={false} onNewConversation={() => navigate('/chat')} onRequestExit={handleRequestExit}>
        <div className="w-full h-full flex flex-col items-center justify-center p-4 relative">

          {/* ======================================================== */}
          {/* NUEVO OVERLAY DE BLOQUEO DE SEGURIDAD DURANTE LA CARGA   */}
          {/* ======================================================== */}
          {cargando && (
            <div className="absolute inset-0 z-[100] flex items-center justify-center bg-slate-900/10 backdrop-blur-sm transition-all duration-300">
              <div className="bg-white/95 p-8 rounded-3xl shadow-2xl flex flex-col items-center animate-in zoom-in duration-200 border border-slate-100">
                <Loader2 className="h-14 w-14 animate-spin text-[#3B82F6] mb-4 drop-shadow-md" />
                <p className="text-2xl font-bold text-slate-800 tracking-tight">Preparando el tablero</p>
                <p className="text-slate-500 font-medium mt-1">Conectando con la base de datos...</p>
              </div>
            </div>
          )}

          {screen === 'select' && (
            <div className="w-full max-w-4xl mx-auto flex h-full flex-col items-center gap-3 px-4 pt-2 pb-2 md:pt-3">

              {/* Header */}
              <div className="w-full flex items-center justify-between">
                <div />
                <button
                  onClick={() => navigate('/games')}
                  disabled={cargando}
                  className="flex items-center gap-2 px-4 py-2 rounded-[16px] bg-slate-200/60 hover:bg-slate-300/60 text-slate-700 font-semibold transition-colors duration-200 disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Atrás
                </button>
              </div>

              {/* Títulos */}
              <div className="text-center">
                <span className="inline-flex items-center rounded-full bg-white/75 px-4 py-1.5 text-sm font-medium text-slate-600 shadow-sm ring-1 ring-white/50 backdrop-blur-md">
                  Zona de práctica
                </span>
                <h2 className="mt-2 text-3xl md:text-4xl font-extrabold tracking-[-0.03em] text-slate-800">
                  Elige una categoría
                </h2>
                <p className="mt-1 text-sm md:text-base text-slate-500">
                  Selecciona una categoría para comenzar el desafío
                </p>
              </div>

              {/* Grid — Mixta col-span-2, resto 3 filas x 2 cols */}
              <div className="grid grid-cols-2 gap-4 w-full mt-2">
                {categorias.map((cat) => (
                  <button
                    key={cat.id}
                    disabled={cargando}
                    onClick={() => {
                      setCategoriaElegida(cat.id as Categoria);
                      setScreen('difficulty');
                    }}
                    className={`
                      group relative overflow-hidden rounded-[28px] border p-0 text-left
                      transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                      bg-gradient-to-br ${cat.fondo} ${cat.borde}
                      shadow-[0_14px_35px_rgba(15,23,42,0.10)]
                      hover:brightness-95 hover:scale-[1.02] hover:shadow-[0_22px_50px_rgba(15,23,42,0.16)]
                      ${cat.id === 'mixta' ? 'col-span-2' : ''}
                    `}
                  >
                    <span className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.28),transparent_28%)]" />
                    <span className="absolute -left-10 top-8 h-28 w-28 rounded-full bg-white/15 blur-2xl" />

                    <div className="relative flex items-center gap-3 p-3 md:p-4">
                      {/* Icono */}
                      <div className={`shrink-0 h-10 w-10 md:h-12 md:w-12 rounded-[18px] bg-gradient-to-br ${cat.iconBoxFondo} ring-1 ring-white/40 shadow-[0_12px_26px_rgba(15,23,42,0.18)] flex items-center justify-center transition-transform duration-300 group-hover:scale-105`}>
                        <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-[16px] bg-white/20 backdrop-blur-sm">
                          <cat.Icono className="h-4 w-4 md:h-5 md:w-5 text-slate-900" />
                        </div>
                      </div>

                      {/* Texto */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className={`text-sm md:text-[18px] font-bold text-slate-800 tracking-[-0.02em] ${cat.id === 'mixta' ? 'whitespace-nowrap' : ''}`}>
                            {cat.label}
                          </h3>
                          {cat.id === 'mixta' && (
                            <span className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-sky-600 shadow-sm">
                              Recomendado
                            </span>
                          )}
                        </div>
                        <p className={`mt-1 text-[0.82rem] md:text-xs leading-5 text-slate-700/80 ${cat.id === 'mixta' ? 'whitespace-nowrap' : 'max-w-[28ch]'}`}>
                          {cat.descripcion}
                        </p>
                      </div>

                      {/* Botón Jugar */}
                      <div className="hidden md:flex shrink-0 items-center">
                        <div className={`rounded-2xl bg-gradient-to-r ${cat.acento} px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(0,0,0,0.14)]`}>
                          {cargando ? 'Cargando...' : 'Jugar'}
                        </div>
                      </div>
                    </div>

                    <div className={`h-1.5 w-full bg-gradient-to-r ${cat.acento} opacity-90`} />
                  </button>
                ))}
              </div>

              {cargando && (
                <div className="h-8 w-8 rounded-full border-4 border-[#4997D0]/30 border-t-[#4997D0] animate-spin" />
              )}
              <BottomNav />
            </div>
          )}

          {screen === 'difficulty' && (
            <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-4 px-4 pt-0 pb-4 -mt-3 md:mt-0 md:pt-3 md:pb-6">

              {/* Header */}
              <div className="w-full flex items-center justify-between">
                <button
                  onClick={() => setScreen('select')}
                  className="flex items-center gap-2 px-4 py-2 rounded-[16px] bg-slate-200/60 hover:bg-slate-300/60 text-slate-700 font-semibold transition-colors duration-200"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Atrás
                </button>
                <div />
              </div>

              {/* Títulos */}
              <div className="text-center">
                <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs md:text-sm font-medium bg-white/70 text-slate-700 shadow-sm ring-1 ring-white/40 backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                  Zona de práctica
                </div>
                <h2 className="mt-2 text-3xl md:text-4xl font-extrabold tracking-[-0.03em] text-slate-800">
                  Elige la dificultad
                </h2>
                <p className="mt-1 text-sm md:text-base text-slate-500">
                  Categoría: <span className="font-semibold text-slate-700 capitalize">{categoriaElegida?.replace('_', ' ')}</span>
                </p>
              </div>

              {/* Tarjetas de dificultad */}
              <div className="flex flex-col gap-4 w-full mt-2">
                {(['facil', 'intermedio', 'dificil'] as Dificultad[]).map((diff) => {
                  const cfg = CONFIG_DIFICULTAD[diff];
                  const seleccionada = dificultad === diff;
                  return (
                    <button
                      key={diff}
                      onClick={() => {
                        setDificultad(diff);
                        if (categoriaElegida) iniciarJuego(categoriaElegida, diff);
                      }}
                      disabled={cargando}
                      className={`
                        group relative overflow-hidden rounded-[28px] border p-0 text-left
                        transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                        bg-gradient-to-br ${cfg.color}
                        shadow-[0_14px_35px_rgba(15,23,42,0.10)]
                        hover:brightness-95 hover:scale-[1.01]
                        ${seleccionada ? 'ring-2 ring-[#3b82f6]/40' : ''}
                      `}
                    >
                      <span className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.28),transparent_28%)]" />

                      <div className="relative flex items-center gap-4 p-5">
                        {/* Icono de dificultad */}
                        <div className={`shrink-0 h-14 w-14 rounded-[18px] bg-gradient-to-br ${cfg.acento} flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.15)]`}>
                          <cfg.Icono className="h-7 w-7 text-white" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg md:text-xl font-bold text-slate-800">
                              {cfg.label}
                            </h3>
                            {diff === 'intermedio' && (
                              <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-[11px] font-semibold text-sky-600 shadow-sm">
                                Recomendado
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-sm text-slate-600">{cfg.descripcion}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {diff === 'facil' && 'Ideal para comenzar a practicar.'}
                            {diff === 'intermedio' && 'Balance perfecto entre reto y aprendizaje.'}
                            {diff === 'dificil' && 'Para los más avanzados. ¡Buena suerte!'}
                          </p>
                        </div>

                        {/* Botón visual */}
                        <div className={`hidden md:flex shrink-0`}>
                          <div className={`rounded-2xl bg-gradient-to-r ${cfg.acento} px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(0,0,0,0.14)]`}>
                            Jugar
                          </div>
                        </div>
                      </div>

                      <div className={`h-1.5 w-full bg-gradient-to-r ${cfg.acento} opacity-90`} />
                    </button>
                  );
                })}
              </div>

              {cargando && (
                <div className="h-8 w-8 rounded-full border-4 border-[#4997D0]/30 border-t-[#4997D0] animate-spin" />
              )}
              <BottomNav />
            </div>
          )}

          {screen === 'playing' && (
            <div className="w-full max-w-5xl flex flex-col h-full max-h-[92vh] relative">
              <div className="flex justify-between items-center mb-4 px-6 py-3 bg-white/40 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm">
                <div className="flex flex-col">
                  <h2 className="text-2xl font-bold text-slate-800 capitalize leading-none">{categoria?.replace('_', ' ')}</h2>
                  <span className="text-slate-500 text-sm font-semibold mt-1">Fase de Aprendizaje</span>
                </div>
                
                <div className="flex items-center gap-8">
                  <div className={`flex items-center gap-3 text-3xl font-mono font-bold ${tiempo < 30 ? 'text-red-500 animate-pulse' : 'text-slate-700'}`}>
                    <Clock className="h-7 w-7" /> {Math.floor(tiempo/60)}:{(tiempo%60).toString().padStart(2,'0')}
                  </div>
                  <Button variant="destructive" size="sm" onClick={finalizarJuego} className="font-bold px-4 h-10 flex gap-2 shadow-lg bg-red-500 hover:bg-red-600">
                    <XCircle className="h-5 w-5" /> Finalizar
                  </Button>
                </div>
              </div>

              <div className={`grid gap-2 flex-1 min-h-0 pb-2 ${
                CONFIG_DIFICULTAD[dificultad].cols === 4 ? 'grid-cols-4' : 'grid-cols-5'
              }`}>
                {cartas.map((carta) => (
                  <div key={carta.uniqueId} className="flip-card w-full h-full min-h-[90px]" onClick={() => manejarClick(carta.uniqueId)}>
                    <div className={`flip-card-inner w-full h-full relative ${carta.volteada ? 'flipped' : ''}`}>
                      
                      <div className={`absolute inset-0 backface-hidden bg-gradient-to-br from-[#1E293B] to-[#0F172A] border-2 ${carta.error ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'border-slate-700'} rounded-xl flex items-center justify-center shadow-lg hover:border-[#4997D0] transition-all`}>
                        <div className="opacity-30 text-[#4997D0]">
                          <Sparkles className="h-10 w-10" />
                        </div>
                      </div>

                      <div className={`absolute inset-0 backface-hidden rotate-y-180 rounded-xl flex items-center justify-center overflow-hidden border-2 ${carta.emparejada ? 'border-green-500 bg-green-50' : carta.error ? 'border-red-500 bg-red-50' : 'border-[#4997D0] bg-white'}`}>
                        {carta.tipo === 'texto' ? (
                          <span className="text-slate-800 font-extrabold text-center px-1 text-sm sm:text-base leading-tight drop-shadow-sm">{carta.contenido}</span>
                        ) : (
                          <div className="w-full h-full bg-black flex items-center justify-center relative overflow-hidden">
                            <iframe
                              src={`https://www.youtube.com/embed/${extraerIdYoutube(carta.contenido)}?autoplay=1&controls=0&mute=1&loop=1&playlist=${extraerIdYoutube(carta.contenido)}&modestbranding=1&rel=0&iv_load_policy=3`}
                              className="w-full h-full absolute inset-0 pointer-events-none"
                              style={{ objectFit: 'cover' }}
                              allow="autoplay; encrypted-media"
                              title="Seña"
                            />
                            {carta.emparejada && <div className="absolute inset-0 bg-green-500/20 z-10"></div>}
                            {statusPartida === 'perdida' && !carta.emparejada && <div className="absolute inset-0 bg-red-500/10 z-10"></div>}
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                ))}
              </div>

              {statusPartida !== 'activa' && (
                <div className={`fixed inset-0 z-50 w-screen h-screen flex items-center justify-center ${
                  statusPartida === 'ganada'
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
                    .animate-fade-in-up {
                      animation: fadeInUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                    }
                    .animate-fade-in-up-delayed-2 {
                      animation: fadeInUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards 0.4s;
                      opacity: 0;
                    }
                  `}</style>

                  <div className="w-full px-4 py-10 flex flex-col items-center justify-center text-center gap-8">
                    <div className="animate-fade-in-up">
                      <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight">
                        {statusPartida === 'ganada' ? 'BIEN HECHO' : '¡PERDISTE!'}
                      </h1>
                      <p className="mt-4 text-lg md:text-xl text-white/90 font-medium">
                        {statusPartida === 'ganada'
                          ? 'Has encontrado todos los pares correctamente.'
                          : 'Se acabó el tiempo para encontrar todos los pares.'}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md animate-fade-in-up-delayed-2">
                      <button
                        onClick={() => iniciarJuego(categoria!, dificultad)}
                        className={`flex items-center justify-center gap-2 flex-1 py-3 px-6 rounded-full font-bold text-base transition-all hover:scale-105 active:scale-95 ${
                          statusPartida === 'ganada'
                            ? 'bg-white text-green-600 hover:bg-green-50 border-2 border-white'
                            : 'bg-white text-red-600 hover:bg-red-50 border-2 border-white'
                        }`}
                      >
                        <RefreshCcw className="w-5 h-5" />
                        Nueva palabra
                      </button>
                      <button
                        onClick={() => navigate('/games')}
                        className={`flex items-center justify-center gap-2 flex-1 py-3 px-6 rounded-full font-bold text-base transition-all hover:scale-105 active:scale-95 ${
                          statusPartida === 'ganada'
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
              )}

            </div>
          )}
        </div>

        <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Estás seguro de que deseas salir del juego? Se perderá todo tu progreso en esta partida.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmarSalida}
                className="bg-red-500 hover:bg-red-600"
              >
                Sí, salir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </MainLayout>
    </div>
  );
};