import { useMemo, useRef, useState } from 'react';
import { Play, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router';

type GameCard = {
  id: string;
  title: string;
  description: string;
  cta: string;
  enabled: boolean;
  accent: string;
  imageSrc?: string;
};

const CARD_WIDTH = 220;
const CARD_HEIGHT = 380;
const CARD_GAP = 44;
const STEP = CARD_WIDTH + CARD_GAP;

const GAME_CARDS: GameCard[] = [
  {
    id: 'adivina-sena',
    title: 'Adivina la seña',
    description: 'Observa el video y elige la respuesta correcta.',
    cta: 'Jugar',
    enabled: true,
    accent: '#37b7ff',
    imageSrc: '/adivina%20la%20se%C3%B1a.png',
  },
  {
    id: 'ahorcado',
    title: 'Ahorcado',
    description: 'Adivina la palabra en señas antes de quedarte sin intentos.',
    cta: 'Jugar',
    enabled: true,
    accent: '#7fc8ff',
    imageSrc: '/Hangman.png?v=20260418',
  },
  {
    id: 'memoria-visual',
    title: 'Memoria visual',
    description: 'Relaciona señas con palabras.',
    cta: 'Proximamente',
    enabled: false,
    accent: '#40d7cf',
    imageSrc: '/memoria%20visual.png',
  },
];

export function GameCarousel() {
  const [index, setIndex] = useState(() => Math.min(1, GAME_CARDS.length - 1));
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const dragStartX = useRef<number | null>(null);
  const navigate = useNavigate();

  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    dragStartX.current = clientX;
    setDragOffset(0);
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging || dragStartX.current === null) return;
    setDragOffset(clientX - dragStartX.current);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;

    if (dragOffset <= -50 && index < GAME_CARDS.length - 1) {
      setIndex(index + 1);
    } else if (dragOffset >= 50 && index > 0) {
      setIndex(index - 1);
    }

    setIsDragging(false);
    setDragOffset(0);
    dragStartX.current = null;
  };

  const trackStyle = useMemo(
    () => ({
      transform: `translate3d(calc(50% - ${CARD_WIDTH / 2}px - ${index * STEP}px + ${dragOffset}px), 10px, 0)`,
      transition: isDragging ? 'transform 120ms ease-out' : 'transform 320ms cubic-bezier(0.22, 0.61, 0.36, 1)',
      willChange: 'transform',
    }),
    [index, dragOffset, isDragging]
  );

  return (
    <div className="game-carousel relative w-full h-full min-h-[520px] rounded-[30px] p-4 md:p-6 bg-transparent border border-white/15 dark:border-white/10 overflow-hidden flex flex-col justify-center">

      <div className="relative z-10 flex items-center justify-center mb-2 md:mb-3">
        <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs md:text-sm font-medium bg-white/70 dark:bg-white/10 text-slate-700 dark:text-slate-200">
          <Sparkles className="w-3.5 h-3.5" />
          Zona de practica
        </div>
      </div>

      <p className="relative z-10 text-center text-sm md:text-base text-slate-700/90 dark:text-slate-300 mb-1.5 md:mb-2">
        Practica lo aprendido con dinamicas interactivas en Lengua de Señas de Guatemala.
      </p>

      <div
        className="relative mx-auto w-full h-full overflow-x-hidden overflow-y-visible pt-10 pb-8 md:pt-12 md:pb-10 select-none cursor-grab"
        onMouseDown={(event) => handleDragStart(event.clientX)}
        onMouseMove={(event) => handleDragMove(event.clientX)}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={(event) => handleDragStart(event.touches[0].clientX)}
        onTouchMove={(event) => handleDragMove(event.touches[0].clientX)}
        onTouchEnd={handleDragEnd}
      >
        <div
          className="carousel-track flex items-stretch gap-12"
          style={trackStyle}
        >
          {GAME_CARDS.map((card, i) => {
            const active = i === index;
            const activeGlow =
              card.id === 'adivina-sena'
                ? '0 22px 58px rgba(0,0,0,0.22), 0 0 40px rgba(0,180,255,0.26)'
                : card.id === 'ahorcado'
                ? '0 22px 58px rgba(0,0,0,0.22), 0 0 40px rgba(123,97,255,0.3)'
                : '0 22px 58px rgba(0,0,0,0.22), 0 0 40px rgba(64,214,168,0.28)';
            const overlayColor =
              card.id === 'adivina-sena'
                ? 'rgba(124,58,237,0.92)'
                : card.id === 'ahorcado'
                ? 'rgba(73,126,255,0.92)'
                : 'rgba(143,112,255,0.88)';

            return (
              <div
                key={card.id}
                onClick={() => setIndex(i)}
                className={`game-card relative overflow-hidden p-0 rounded-[26px] flex flex-col justify-start transition-all duration-[350ms] ease-[ease] cursor-pointer ${
                  active
                    ? 'scale-[1.15] z-20 ring-2 ring-[#4f7ce5] shadow-[0_26px_50px_rgba(79,124,229,0.28)]'
                    : 'scale-[0.95] opacity-[0.92] z-10 shadow-[0_18px_32px_rgba(0,0,0,0.08)]'
                }`}
                style={{
                  width: CARD_WIDTH,
                  height: CARD_HEIGHT,
                  boxShadow: active ? activeGlow : `0 10px 28px ${card.accent}22`,
                }}
              >
                {active ? (
                  <div className="pointer-events-none absolute left-0 top-0 z-20 h-1 w-full rounded-t-[24px] bg-[linear-gradient(90deg,#00c2ff,#7c3aed,#40d6a8)]" />
                ) : null}

                {card.imageSrc ? (
                  <>
                    <img
                      src={card.imageSrc}
                      alt={`Vista previa de ${card.title}`}
                      className={`h-full w-full object-cover ${
                        active ? 'scale-[1.02] object-[center_30%]' : 'scale-100 object-[center_30%]'
                      } transition-transform duration-500`}
                      loading="eager"
                      decoding="async"
                    />
                    <div
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-44"
                      style={{
                        background: `linear-gradient(to bottom, transparent, ${overlayColor})`,
                      }}
                    />
                  </>
                ) : (
                  <div className="relative h-full w-full bg-[linear-gradient(160deg,#4d7ab8_0%,#2f4f7f_100%)]">
                    <div
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-44"
                      style={{
                        background: `linear-gradient(to bottom, transparent, ${overlayColor})`,
                      }}
                    />
                  </div>
                )}

                <div className="absolute inset-x-0 bottom-0 z-10 p-4 pb-24 md:p-5 md:pb-24 text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.5)]">
                  <h2
                    className="text-[28px] font-bold leading-[1.05] tracking-[-0.01em]"
                    style={{
                      fontFamily: 'Poppins, sans-serif',
                      textShadow: '0 2px 12px rgba(0,0,0,0.42)',
                    }}
                  >
                    {card.title}
                  </h2>
                  <p className="mt-3 text-[15px] leading-relaxed text-white/90 min-h-[3.6rem]">
                    {card.description}
                  </p>
                </div>

                <Button
                  type="button"
                  disabled={!card.enabled}
                  onClick={() => card.enabled && navigate(`/games/${card.id}`)} 
                  className={`play-btn absolute left-4 right-4 bottom-5 h-11 text-base font-semibold z-20 ${
                    active
                      ? 'bg-[linear-gradient(135deg,#7c3aed,#4f46e5)] text-white shadow-[0_14px_30px_rgba(124,58,237,0.35)] hover:-translate-y-1'
                      : 'bg-[#4997D0]/85 hover:bg-[#3A7FB8] shadow-[0_12px_24px_rgba(56,198,255,0.28)]'
                  }`}
                >
                  <Play className="w-4 h-4" />
                  {card.cta}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative z-10 dots mt-1.5 md:mt-2 flex justify-center gap-2">
        {GAME_CARDS.map((card, i) => (
          <button
            key={card.id}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Ir a ${card.title}`}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              i === index
                ? 'w-[26px] bg-[linear-gradient(90deg,#6b8fbf,#8eaecf)]'
                : 'w-2.5 bg-[#4997D0]/35 hover:bg-[#4997D0]/60 dark:bg-[#5ea8ff]/35 dark:hover:bg-[#5ea8ff]/60'
            }`}
          />
        ))}
      </div>

      <p className="relative z-10 mt-4 text-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
        <span
          className="inline-flex text-sm md:text-[21px] font-extrabold tracking-[0.012em]"
          style={{
            backgroundImage: 'linear-gradient(90deg,#1d4f91 0%,#1f7fc5 45%,#4f56dd 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            textShadow: '0 1px 8px rgba(44,108,184,0.16)',
          }}
        >
          Elige tu desafio
        </span>
      </p>
    </div>
  );
}