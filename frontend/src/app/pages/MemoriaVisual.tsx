import { useState, useRef } from 'react';
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

    const categorias = [
        { id: 'abecedario', label: 'Abecedario', Icono: Type, color: 'bg-blue-500 hover:bg-blue-600' },
        { id: 'alimentos', label: 'Alimentos', Icono: Apple, color: 'bg-orange-500 hover:bg-orange-600' },
        { id: 'animales', label: 'Animales', Icono: PawPrint, color: 'bg-green-500 hover:bg-green-600' },
        { id: 'colores', label: 'Colores', Icono: Palette, color: 'bg-purple-500 hover:bg-purple-600' },
        { id: 'frases_comunes', label: 'Frases Comunes', Icono: MessageSquare, color: 'bg-pink-500 hover:bg-pink-600' },
        { id: 'saludos', label: 'Saludos', Icono: Hand, color: 'bg-teal-500 hover:bg-teal-600' },
    ];

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

            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = setInterval(() => {
                setTiempo((prev) => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current!);
                        // TIEMPO AGOTADO: Voltear todas las cartas para enseñar y cambiar status
                        setCartas(c => c.map(card => ({ ...card, volteada: true })));
                        setStatusPartida('perdida');
                        setBloqueoTablero(true);
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
        if (timerRef.current) clearInterval(timerRef.current);
        navigate('/games');
    };

    const manejarClick = (id: string) => {
        if (bloqueoTablero || tiempo === 0 || statusPartida !== 'activa') return;
        const carta = cartas.find(c => c.uniqueId === id);
        if (!carta || carta.volteada || carta.emparejada) return;

        const nuevasCartas = cartas.map(c => c.uniqueId === id ? { ...c, volteada: true } : c);
        setCartas(nuevasCartas);
        const nuevasSeleccionadas = [...seleccionadas, id];
        setSeleccionadas(nuevasSeleccionadas);

        if (nuevasSeleccionadas.length === 2) {
            setBloqueoTablero(true);
            const c1 = nuevasCartas.find(c => c.uniqueId === nuevasSeleccionadas[0]);
            const c2 = nuevasCartas.find(c => c.uniqueId === nuevasSeleccionadas[1]);

            if (c1?.parId === c2?.parId) {
                setTimeout(() => {
                    setCartas(prev => {
                        const estadoActualizado = prev.map(c => c.parId === c1?.parId ? { ...c, emparejada: true } : c);
                        // Verificar si ganó
                        if (estadoActualizado.every(c => c.emparejada)) {
                            if (timerRef.current) clearInterval(timerRef.current);
                            setStatusPartida('ganada');
                        }
                        return estadoActualizado;
                    });
                    setSeleccionadas([]);
                    setBloqueoTablero(false);
                }, 1500);
            } else {
                setCartas(prev => prev.map(c => nuevasSeleccionadas.includes(c.uniqueId) ? { ...c, error: true } : c));
                setTimeout(() => {
                    setCartas(prev => prev.map(c => nuevasSeleccionadas.includes(c.uniqueId) ? { ...c, volteada: false, error: false } : c));
                    setSeleccionadas([]);
                    setBloqueoTablero(false);
                }, 2500); // 2.5 segundos para memorizar el error
            }
        }
    };

    //extraer url de youtube
    // Función robusta para asegurar que siempre obtengamos solo el ID de YouTube
    const extraerIdYoutube = (urlOId: string) => {
        if (!urlOId) return 'placeholder';
        const match = urlOId.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
        return match ? match[1] : urlOId;
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-transparent font-poppins">
            <style>{`
        .flip-card { perspective: 1000px; }
        .flip-card-inner { transition: transform 0.6s; transform-style: preserve-3d; }
        .flipped { transform: rotateY(180deg); }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>

            <MainLayout title="Memoria Visual" activePage="games" showClearButton={false} onNewConversation={() => navigate('/chat')}>
                <div className="w-full h-full flex flex-col items-center justify-center p-2 relative">

                    {screen === 'select' && (
                        <div className="w-full max-w-4xl animate-in fade-in zoom-in">
                            <div className="flex items-center justify-center gap-4 mb-2">
                                <Button variant="ghost" size="icon" onClick={() => navigate('/games')} className="text-black/70 hover:text-black hover:bg-black/10">
                                    <ArrowLeft className="h-8 w-8" />
                                </Button>
                                <h1 className="text-4xl font-bold text-black text-center">Memoria Visual</h1>
                            </div>
                            <p className="text-black text-center mb-8 opacity-80 font-medium italic">Selecciona una categoría para comenzar</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {categorias.map((cat) => (
                                    <Card key={cat.id} className={`${cat.color} border-0 cursor-pointer shadow-lg hover:scale-105 transition-transform relative`} onClick={() => iniciarJuego(cat.id as Categoria)}>
                                        <CardContent className="p-6 flex items-center gap-4 text-white">
                                            <cat.Icono className="h-8 w-8" />
                                            <span className="text-xl font-bold">{cat.label}</span>
                                        </CardContent>
                                    </Card>
                                ))}

                                <Button onClick={() => iniciarJuego('mixta' as Categoria)} disabled={cargando} className="lg:col-span-3 h-16 bg-black text-white hover:bg-black/90 text-xl font-bold border-0 shadow-xl transition-all">
                                    {cargando ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <Sparkles className="mr-2" />}
                                    {cargando ? 'Cargando pares...' : 'Modo Mixto Aleatorio'}
                                </Button>
                            </div>
                        </div>
                    )}

                    {screen === 'playing' && (
                        <div className="w-full max-w-5xl flex flex-col h-full max-h-[92vh] relative">
                            <div className="flex justify-between items-center mb-4 px-6 py-3 bg-white/10 rounded-2xl border border-black/5 shadow-sm">
                                <div className="flex flex-col">
                                    <h2 className="text-2xl font-bold text-black capitalize leading-none">{categoria?.replace('_', ' ')}</h2>
                                    <span className="text-black/60 text-sm font-semibold mt-1">Fase de Aprendizaje</span>
                                </div>

                                <div className="flex items-center gap-8">
                                    <div className={`flex items-center gap-3 text-3xl font-mono font-bold ${tiempo < 30 ? 'text-red-600 animate-pulse' : 'text-black'}`}>
                                        <Clock className="h-7 w-7" /> {Math.floor(tiempo / 60)}:{(tiempo % 60).toString().padStart(2, '0')}
                                    </div>
                                    <Button variant="destructive" size="sm" onClick={finalizarJuego} className="font-bold px-4 h-10 flex gap-2 shadow-lg">
                                        <XCircle className="h-5 w-5" /> Finalizar Juego
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-5 gap-2 flex-1 min-h-0 pb-2">
                                {cartas.map((carta) => (
                                    <div key={carta.uniqueId} className="flip-card w-full h-full min-h-[90px]" onClick={() => manejarClick(carta.uniqueId)}>
                                        <div className={`flip-card-inner w-full h-full relative ${carta.volteada ? 'flipped' : ''}`}>

                                            <div className={`absolute inset-0 backface-hidden bg-gradient-to-br from-[#1a2342] to-[#0d142b] border-2 ${carta.error ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'border-white/10'} rounded-xl flex items-center justify-center shadow-lg hover:border-[#4997D0]/50 transition-all`}>
                                                <div className="opacity-20 text-[#4997D0]">
                                                    <Sparkles className="h-10 w-10" />
                                                </div>
                                            </div>

                                            <div className={`absolute inset-0 backface-hidden rotate-y-180 rounded-xl flex items-center justify-center overflow-hidden border-2 ${carta.emparejada ? 'border-green-500 bg-green-50' : carta.error ? 'border-red-500 bg-red-50' : 'border-[#4997D0] bg-white'}`}>
                                                {carta.tipo === 'texto' ? (
                                                    <span className="text-black font-extrabold text-center px-1 text-sm sm:text-base leading-tight drop-shadow-sm">{carta.contenido}</span>
                                                ) : (
                                                    <div className="w-full h-full bg-black flex items-center justify-center relative overflow-hidden">

                                                        {/* SOLUCIÓN DE CARGA SIMULTÁNEA: 
                                Renderizamos el iframe SIEMPRE para que empiece a reproducirse oculto y consuma sus 3 segundos de título inicial. 
                                Usamos un iframe nativo ligero para no sobrecargar el navegador. */}
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

                            {/* FASE 4: FORMULARIO EMERGENTE FINAL */}
                            {statusPartida !== 'activa' && (
                                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-2xl animate-in fade-in duration-300">
                                    <Card className="w-full max-w-sm bg-white shadow-2xl border-0 overflow-hidden scale-in-center">
                                        <CardHeader className={`${statusPartida === 'ganada' ? 'bg-green-500' : 'bg-red-500'} text-white text-center py-6`}>
                                            <div className="flex justify-center mb-2">
                                                {statusPartida === 'ganada' ? <Trophy className="h-12 w-12" /> : <AlertTriangle className="h-12 w-12" />}
                                            </div>
                                            <CardTitle className="text-3xl font-bold">
                                                {statusPartida === 'ganada' ? '¡Excelente!' : '¡Tiempo Agotado!'}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-6 text-center space-y-4">
                                            <p className="text-gray-600 font-medium mb-6">
                                                {statusPartida === 'ganada'
                                                    ? 'Has encontrado todos los pares y completado el desafío.'
                                                    : 'Revisa el tablero de fondo para visualizar las señas que te faltaron aprender.'}
                                            </p>

                                            <Button onClick={() => iniciarJuego(categoria!)} className="w-full bg-[#4997D0] hover:bg-blue-600 text-white font-bold h-12 text-lg">
                                                Volver a Intentar
                                            </Button>
                                            <Button onClick={() => navigate('/games')} variant="outline" className="w-full border-gray-300 text-gray-700 font-bold h-12 text-lg">
                                                Volver al Menú
                                            </Button>
                                            <Button onClick={() => navigate('/chat')} variant="secondary" className="w-full bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-bold h-12 text-lg">
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