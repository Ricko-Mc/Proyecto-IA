import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { 
  Apple, PawPrint, Palette, MessageSquare, Hand, Type,
  ArrowLeft, Sparkles, Clock, XCircle, Loader2, Trophy, AlertTriangle, Bot
} from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { api } from '../../services/api';

type GameState = 'select' | 'playing';
type StatusPartida = 'activa' | 'ganada' | 'perdida';
type Categoria = 'abecedario' | 'alimentos' | 'animales' | 'colores' | 'frases_comunes' | 'saludos' | 'mixta';

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
  const [cartas, setCartas] = useState<CartaTablero[]>([]);
  const [seleccionadas, setSeleccionadas] = useState<string[]>([]);
  const [bloqueoTablero, setBloqueoTablero] = useState(false);
  const [tiempo, setTiempo] = useState(180); 
  const [cargando, setCargando] = useState(false);
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
    { id: 'abecedario', label: 'Abecedario', descripcion: 'Señas de las letras de la A a la Z', Icono: Type, gradiente: 'from-[#2563EB] to-[#3B82F6]', sombra: 'hover:shadow-blue-500/40' },
    { id: 'alimentos', label: 'Alimentos', descripcion: 'Comida, bebidas y postres diarios', Icono: Apple, gradiente: 'from-[#EA580C] to-[#F97316]', sombra: 'hover:shadow-orange-500/40' },
    { id: 'animales', label: 'Animales', descripcion: 'Señas de mascotas y fauna salvaje', Icono: PawPrint, gradiente: 'from-[#059669] to-[#10B981]', sombra: 'hover:shadow-emerald-500/40' },
    { id: 'colores', label: 'Colores', descripcion: 'Identifica los tonos y matices', Icono: Palette, gradiente: 'from-[#9333EA] to-[#A855F7]', sombra: 'hover:shadow-purple-500/40' },
    { id: 'frases_comunes', label: 'Frases Comunes', descripcion: 'Expresiones del día a día', Icono: MessageSquare, gradiente: 'from-[#DB2777] to-[#EC4899]', sombra: 'hover:shadow-pink-500/40' },
    { id: 'saludos', label: 'Saludos', descripcion: 'Formas de decir hola y adiós', Icono: Hand, gradiente: 'from-[#0D9488] to-[#14B8A6]', sombra: 'hover:shadow-teal-500/40' },
  ];

  const extraerIdYoutube = (urlOId: string) => {
    if (!urlOId) return 'placeholder';
    const match = urlOId.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match ? match[1] : urlOId;
  };

  const iniciarJuego = async (cat: Categoria) => {
    setCategoria(cat);
    setCargando(true);
    setStatusPartida('activa');
    
    try {
      const paresReales = await api.obtenerParesMemoria(cat);

      let mazo: CartaTablero[] = [];
      paresReales.forEach((par: any) => {
        mazo.push({ uniqueId: `${par.id}-T`, parId: par.id, tipo: 'texto', contenido: par.palabra, volteada: false, emparejada: false, error: false });
        mazo.push({ uniqueId: `${par.id}-V`, parId: par.id, tipo: 'video', contenido: par.video_id, volteada: false, emparejada: false, error: false });
      });

      setCartas(mazo.sort(() => Math.random() - 0.5));
      setTiempo(180);
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

  const finalizarJuego = () => {
    stopStartSound();
    if (timerRef.current) clearInterval(timerRef.current);
    navigate('/games');
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
      
      <MainLayout title="Memoria Visual" activePage="games" showClearButton={false} onNewConversation={() => navigate('/chat')}>
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
            <div className="w-full max-w-5xl relative animate-in fade-in zoom-in duration-300">
              
              <div className="absolute -top-12 sm:-top-16 left-0">
                {/* Botón Volver (También deshabilitado visualmente al cargar por si acaso) */}
                <Button 
                  variant="ghost" 
                  disabled={cargando}
                  onClick={() => navigate('/games')} 
                  className="flex items-center gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 rounded-xl font-bold px-4 py-2 transition-all shadow-sm bg-white/40 backdrop-blur-sm disabled:opacity-50"
                >
                  <ArrowLeft className="h-5 w-5" /> Volver
                </Button>
              </div>

              <div className="flex flex-col items-center mt-8 mb-10">
                <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-500 tracking-tight text-center drop-shadow-sm">
                  Memoria Visual
                </h1>
                <p className="text-slate-500 text-lg md:text-xl font-medium mt-3 italic text-center">
                  Selecciona una categoría para comenzar el desafío
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {categorias.map((cat) => (
                  <button 
                    key={cat.id} 
                    disabled={cargando}
                    onClick={() => iniciarJuego(cat.id as Categoria)}
                    className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${cat.gradiente} p-6 text-white text-left shadow-lg transition-all duration-300 group border border-white/20 ${cat.sombra} ${cargando ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-1.5'}`}
                  >
                    <div className="absolute -right-4 -bottom-4 opacity-10 transform group-hover:scale-125 transition-transform duration-700 pointer-events-none">
                      <cat.Icono className="w-32 h-32" />
                    </div>
                    
                    <div className="relative z-10 flex items-center gap-4 pointer-events-none">
                      <div className="bg-white/20 p-3 rounded-xl backdrop-blur-md shadow-sm group-hover:bg-white/30 transition-colors shrink-0">
                        <cat.Icono className="w-8 h-8 text-white drop-shadow-md" />
                      </div>
                      <div>
                        <h3 className="text-xl md:text-2xl font-bold tracking-wide drop-shadow-sm leading-tight">{cat.label}</h3>
                        <p className="text-white/90 font-medium text-sm mt-1 leading-snug">{cat.descripcion}</p>
                      </div>
                    </div>
                  </button>
                ))}
                
                <button 
                  onClick={() => iniciarJuego('mixta' as Categoria)} 
                  disabled={cargando} 
                  className={`lg:col-span-3 h-20 bg-gradient-to-r from-[#38BDF8] to-[#3B82F6] text-white rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg transition-all duration-300 border border-white/20 ${cargando ? 'opacity-70 cursor-not-allowed' : 'hover:from-[#0EA5E9] hover:to-[#2563EB] hover:shadow-blue-500/50 hover:-translate-y-1'}`}
                >
                  {cargando ? (
                    <Loader2 className="mr-3 h-8 w-8 animate-spin" />
                  ) : (
                    <Sparkles className="mr-3 h-7 w-7 drop-shadow-md" />
                  )} 
                  {cargando ? 'Cargando pares...' : 'Modo Mixto Aleatorio'}
                </button>
              </div>
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

              <div className="grid grid-cols-5 gap-2 flex-1 min-h-0 pb-2">
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
                            
                            <div className="absolute inset-0 w-full h-full pointer-events-none transform scale-[1.35] flex items-center justify-center">
                              <iframe
                                src={`https://www.youtube.com/embed/${extraerIdYoutube(carta.contenido)}?autoplay=1&controls=0&mute=1&loop=1&playlist=${extraerIdYoutube(carta.contenido)}&modestbranding=1&rel=0&iv_load_policy=3`}
                                className="w-full h-full absolute inset-0 pointer-events-none"
                                allow="autoplay; encrypted-media"
                                title="Seña"
                              />
                            </div>
                            
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
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm rounded-2xl animate-in fade-in duration-300">
                  <Card className="w-full max-w-sm bg-white shadow-2xl border-0 overflow-hidden scale-in-center">
                    <CardHeader className={`${statusPartida === 'ganada' ? 'bg-gradient-to-r from-emerald-500 to-green-500' : 'bg-gradient-to-r from-red-500 to-rose-500'} text-white text-center py-6`}>
                      <div className="flex justify-center mb-2 drop-shadow-md">
                        {statusPartida === 'ganada' ? <Trophy className="h-12 w-12" /> : <AlertTriangle className="h-12 w-12" />}
                      </div>
                      <CardTitle className="text-3xl font-extrabold drop-shadow-sm">
                        {statusPartida === 'ganada' ? '¡Excelente!' : '¡Tiempo Agotado!'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 text-center space-y-4 bg-slate-50">
                      <p className="text-slate-600 font-medium mb-6">
                        {statusPartida === 'ganada' 
                          ? 'Has encontrado todos los pares y completado el desafío de manera brillante.' 
                          : 'Revisa el tablero de fondo para visualizar las señas que te faltaron aprender.'}
                      </p>
                      
                      <Button onClick={() => iniciarJuego(categoria!)} className="w-full bg-[#3B82F6] hover:bg-blue-600 text-white font-bold h-12 text-lg shadow-md hover:-translate-y-0.5 transition-transform">
                        Volver a Intentar
                      </Button>
                      <Button onClick={() => navigate('/games')} variant="outline" className="w-full border-slate-300 text-slate-700 font-bold h-12 text-lg hover:bg-slate-100">
                        Volver al Menú
                      </Button>
                      <Button onClick={() => navigate('/chat')} variant="secondary" className="w-full bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-bold h-12 text-lg shadow-sm">
                        <Bot className="mr-2 h-5 w-5" /> Ir a Aprender con IA
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}

            </div>
          )}
        </div>
      </MainLayout>
    </div>
  );
};