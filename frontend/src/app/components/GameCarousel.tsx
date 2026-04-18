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

const CARD_WIDTH = 300;
const CARD_HEIGHT = 500;
const CARD_GAP = 44;
const STEP = CARD_WIDTH + CARD_GAP;

const GAME_CARDS: GameCard[] = [
  {
    id: 'adivina-sena',
    title: 'Adivina la seña',
    description: 'Observa el video y selecciona la respuesta correcta.',
    cta: 'Jugar',
    enabled: true,
    accent: '#37b7ff',
  },
  {
    id: 'completa-frase',
    title: 'Ahorcado',
    description: 'Adivina la palabra en señas antes de quedarte sin intentos.',
    cta: 'Jugar',
    enabled: true,
    accent: '#7fc8ff',
    imageSrc: '/Hangman.png',
  },
  {
    id: 'memoria-visual',
    title: 'Memoria visual',
    description: 'Relaciona señas con palabras.',
    cta: 'Proximamente',
    enabled: false,
    accent: '#40d7cf',
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
      transform: `translate3d(calc(50% - ${CARD_WIDTH / 2}px - ${index * STEP}px), 0, 0)`,
      transition: 'transform 320ms cubic-bezier(0.22, 0.61, 0.36, 1)',
      willChange: 'transform',
    }),
    [index]
  );

  return (
    <div className="game-carousel relative w-full min-h-[760px] rounded-[30px] p-5 md:p-10 bg-[radial-gradient(circle_at_20%_15%,rgba(118,194,255,0.42),transparent_32%),radial-gradient(circle_at_80%_82%,rgba(136,196,255,0.24),transparent_35%),linear-gradient(135deg,#dbeafe_0%,#f2e9e4_100%)] dark:bg-[linear-gradient(135deg,#102036_0%,#1c1d2b_100%)] border border-white/40 dark:border-white/10 overflow-hidden flex flex-col justify-center">
      <div className="pointer-events-none absolute -left-12 top-20 h-28 w-28 rotate-12 bg-[#63b8ff]/20" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
      <div className="pointer-events-none absolute right-16 bottom-14 h-24 w-24 -rotate-12 bg-[#63b8ff]/18" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }} />

      <div className="flex items-center justify-center mb-4 md:mb-6">
        <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs md:text-sm font-medium bg-white/70 dark:bg-white/10 text-slate-700 dark:text-slate-200">
          <Sparkles className="w-3.5 h-3.5" />
          Espacio de practica educativa
        </div>
      </div>

      <p className="text-center text-sm md:text-base text-slate-700/90 dark:text-slate-300 mb-3 md:mb-5">
        Practica lo aprendido con dinamicas interactivas en Lengua de Señas de Guatemala.
      </p>

      <div
        className={`relative mx-auto w-full max-w-[1420px] overflow-hidden py-4 md:py-8 select-none cursor-default`}
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
          className="carousel-track flex items-stretch gap-11"
          style={trackStyle}
        >
          {GAME_CARDS.map((card, i) => {
            const active = i === index;
            return (
              <div
                key={card.id}
                className={`game-card relative overflow-hidden p-6 md:p-7 rounded-[22px] bg-[rgba(255,255,255,0.74)] dark:bg-[rgba(22,22,22,0.68)] backdrop-blur-[12px] border border-white/65 dark:border-white/10 flex flex-col justify-between text-center transition-all duration-300 ease-out ${
                  active
                    ? 'scale-[1.14] opacity-100 [filter:none] shadow-[0_24px_56px_rgba(0,0,0,0.2)] z-20'
                    : 'scale-[0.9] opacity-60 [filter:blur(0.2px)] hover:scale-[0.95]'
                }`}
                style={{
                  width: CARD_WIDTH,
                  height: CARD_HEIGHT,
                  boxShadow: active
                    ? '0 0 0 5px rgba(255,255,255,0.95), 0 24px 56px rgba(0,0,0,0.2)'
                    : `0 0 0 4px ${card.accent}66`,
                }}
              >
                <div className="space-y-4 relative z-10">
                  {card.imageSrc ? (
                    <div className="w-full h-[210px] rounded-[16px] overflow-hidden border border-white/75 dark:border-white/20 bg-black shadow-[0_10px_24px_rgba(0,0,0,0.25)]">
                      <img
                        src={card.imageSrc}
                        alt={`Vista previa de ${card.title}`}
                        className="w-full h-full object-contain"
                        loading="eager"
                        decoding="async"
                      />
                    </div>
                  ) : null}

                  <h2
                    className="text-[2rem] md:text-[2.15rem] font-bold leading-[1.08] tracking-[-0.01em] text-slate-900 dark:text-slate-100"
                    style={{
                      fontFamily: 'Poppins, sans-serif',
                      textShadow: '0 2px 10px rgba(43,86,130,0.08)',
                    }}
                  >
                    {card.title}
                  </h2>
                  <p className="text-base leading-relaxed text-slate-700/95 dark:text-slate-300">
                    {card.description}
                  </p>
                </div>

                <Button
                  type="button"
                  disabled={!card.enabled}
                  className="w-full h-12 text-base font-semibold relative z-10"
                >
                  <Play className="w-4 h-4" />
                  {card.cta}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="dots mt-4 md:mt-5 flex justify-center gap-2">
        {GAME_CARDS.map((card, i) => (
          <button
            key={card.id}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Ir a ${card.title}`}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              i === index
                ? 'w-7 bg-[#4997D0]'
                : 'w-2.5 bg-[#4997D0]/35 hover:bg-[#4997D0]/60 dark:bg-[#5ea8ff]/35 dark:hover:bg-[#5ea8ff]/60'
            }`}
          />
        ))}
      </div>

      <p
        className="mt-6 text-center text-sm md:text-[21px] font-bold tracking-[0.015em] text-[#3A7FB8] dark:text-[#9fd1ff]"
        style={{
          fontFamily: 'Poppins, sans-serif',
          textShadow: '0 2px 12px rgba(73,151,208,0.16)',
        }}
      >
        Selecciona un modo de juego
      </p>
    </div>
  );
}