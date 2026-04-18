import { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

type GameCard = {
  id: string;
  title: string;
  description: string;
  cta: string;
  enabled: boolean;
  accent: string;
  imageSrc?: string;
};

const CARD_WIDTH = 280;
const CARD_HEIGHT = 500;
const CARD_GAP = 64;
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
    id: 'completa-frase',
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
  const [autoMove, setAutoMove] = useState(false);
  const [autoDirection, setAutoDirection] = useState<-1 | 1>(1);
  const lastAutoStepAt = useRef(0);

  const stepByDirection = (direction: -1 | 1) => {
    setIndex((prev) => {
      const next = prev + direction;
      if (next < 0 || next >= GAME_CARDS.length) {
        return prev;
      }
      return next;
    });
  };

  useEffect(() => {
    if (!autoMove) return;

    const timer = window.setInterval(() => {
      stepByDirection(autoDirection);
    }, 640);

    return () => window.clearInterval(timer);
  }, [autoDirection, autoMove]);

  const trackStyle = useMemo(
    () => ({
      transform: `translate3d(calc(50% - ${CARD_WIDTH / 2}px - ${index * STEP}px), 10px, 0)`,
      transition: 'transform 320ms cubic-bezier(0.22, 0.61, 0.36, 1)',
      willChange: 'transform',
    }),
    [index]
  );

  return (
    <div className="game-carousel relative w-full min-h-[700px] rounded-[30px] p-4 md:p-8 bg-[radial-gradient(circle_at_20%_15%,rgba(118,194,255,0.42),transparent_32%),radial-gradient(circle_at_80%_82%,rgba(136,194,255,0.24),transparent_35%),linear-gradient(135deg,#dbeafe_0%,#f2e9e4_100%)] dark:bg-[linear-gradient(135deg,#102036_0%,#1c1d2b_100%)] border border-white/40 dark:border-white/10 overflow-hidden flex flex-col justify-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(117,170,230,0.22),transparent_28%),radial-gradient(circle_at_80%_75%,rgba(160,220,210,0.18),transparent_24%),linear-gradient(135deg,rgba(214,231,251,0.75),rgba(245,239,234,0.72))] opacity-70" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.06)_1px,transparent_1px)] [background-size:40px_40px]" />
      <div className="pointer-events-none absolute -left-12 top-20 h-28 w-28 rotate-12 bg-[#63b8ff]/20" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
      <div className="pointer-events-none absolute right-16 bottom-14 h-24 w-24 -rotate-12 bg-[#63b8ff]/18" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }} />

      <div className="relative z-10 flex items-center justify-center mb-2 md:mb-3">
        <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs md:text-sm font-medium bg-white/70 dark:bg-white/10 text-slate-700 dark:text-slate-200">
          <Sparkles className="w-3.5 h-3.5" />
          Espacio de practica educativa
        </div>
      </div>

      <p className="relative z-10 text-center text-sm md:text-base text-slate-700/90 dark:text-slate-300 mb-1.5 md:mb-2">
        Practica lo aprendido con dinamicas interactivas en Lengua de Señas de Guatemala.
      </p>

      <div
        className={`relative mx-auto w-full max-w-[1420px] overflow-x-hidden overflow-y-visible pt-14 pb-10 md:pt-16 md:pb-12 select-none cursor-default`}
        onMouseEnter={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const ratio = (event.clientX - rect.left) / rect.width;
          const direction = ratio >= 0.5 ? 1 : -1;
          setAutoDirection(direction);
          setAutoMove(true);

          const now = performance.now();
          if (now - lastAutoStepAt.current > 220) {
            stepByDirection(direction);
            lastAutoStepAt.current = now;
          }
        }}
        onMouseMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const ratio = (event.clientX - rect.left) / rect.width;
          const now = performance.now();

          if (ratio > 0.66) {
            setAutoDirection(1);
            setAutoMove(true);
            if (now - lastAutoStepAt.current > 320) {
              stepByDirection(1);
              lastAutoStepAt.current = now;
            }
          } else if (ratio < 0.34) {
            setAutoDirection(-1);
            setAutoMove(true);
            if (now - lastAutoStepAt.current > 320) {
              stepByDirection(-1);
              lastAutoStepAt.current = now;
            }
          } else {
            // Keep center area calm so the movement feels subtle.
            setAutoMove(false);
          }
        }}
        onMouseLeave={() => setAutoMove(false)}
      >
        <div
          className="carousel-track flex items-stretch gap-16"
          style={trackStyle}
        >
          {GAME_CARDS.map((card, i) => {
            const active = i === index;

            return (
              <div
                key={card.id}
                className={`game-card relative overflow-hidden p-0 rounded-[26px] border border-white/20 ring-1 ring-white/10 flex flex-col justify-start transition-all duration-[350ms] ease-[ease] ${
                  active
                    ? 'scale-[1.15] opacity-100 z-20'
                    : 'scale-[0.9] opacity-60 z-10'
                }`}
                style={{
                  width: CARD_WIDTH,
                  height: CARD_HEIGHT,
                  boxShadow: active
                    ? '0 30px 70px rgba(8,18,36,0.42), 0 0 45px rgba(120,160,220,0.35)'
                    : `0 8px 26px ${card.accent}33`,
                }}
              >
                {card.imageSrc ? (
                  <img
                    src={card.imageSrc}
                    alt={`Vista previa de ${card.title}`}
                    className={`h-full w-full object-cover ${
                      active ? 'scale-[1.02]' : 'scale-100'
                    } transition-transform duration-500`}
                    loading="eager"
                    decoding="async"
                  />
                ) : (
                  <div className="h-full w-full bg-[linear-gradient(160deg,#4d7ab8_0%,#2f4f7f_100%)]" />
                )}

                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(20,40,80,0.75)_0%,rgba(20,40,80,0.2)_55%,transparent_100%)]" />

                <div className="absolute inset-x-0 bottom-0 z-10 p-4 pb-24 md:p-5 md:pb-24 text-white">
                  <h2
                    className={`${active ? 'text-[30px]' : 'text-[26px]'} font-extrabold leading-[1.05] tracking-[-0.01em]`}
                    style={{
                      fontFamily: 'Poppins, sans-serif',
                      textShadow: '0 2px 12px rgba(0,0,0,0.42)',
                    }}
                  >
                    {card.title}
                  </h2>
                  <p className="mt-3 text-[0.95rem] leading-relaxed text-white/90 min-h-[3.6rem]">
                    {card.description}
                  </p>
                </div>

                <Button
                  type="button"
                  disabled={!card.enabled}
                  className={`play-btn absolute left-4 right-4 bottom-5 h-11 text-base font-semibold z-20 ${
                    active
                      ? 'bg-[linear-gradient(135deg,#3fb1ea,#5b8fe8)] shadow-[0_16px_34px_rgba(77,145,225,0.48)] hover:-translate-y-1'
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
                ? 'w-6 bg-[linear-gradient(90deg,#6b8fbf,#8eaecf)]'
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
          Selecciona un modo de juego
        </span>
      </p>
    </div>
  );
}