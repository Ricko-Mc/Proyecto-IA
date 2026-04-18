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

const CARD_WIDTH = 330;
const CARD_HEIGHT = 450;
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
    imageSrc: '/images/adivina-sena.svg',
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
      transform: `translate3d(calc(50% - ${CARD_WIDTH / 2}px - ${index * STEP}px), 0, 0)`,
      transition: 'transform 320ms cubic-bezier(0.22, 0.61, 0.36, 1)',
      willChange: 'transform',
    }),
    [index]
  );

  return (
    <div className="game-carousel relative w-full min-h-[560px] rounded-[30px] p-4 md:p-8 bg-[radial-gradient(circle_at_20%_15%,rgba(118,194,255,0.42),transparent_32%),radial-gradient(circle_at_80%_82%,rgba(136,194,255,0.24),transparent_35%),linear-gradient(135deg,#dbeafe_0%,#f2e9e4_100%)] dark:bg-[linear-gradient(135deg,#102036_0%,#1c1d2b_100%)] border border-white/40 dark:border-white/10 overflow-hidden flex flex-col justify-center">
      <div className="pointer-events-none absolute -left-12 top-20 h-28 w-28 rotate-12 bg-[#63b8ff]/20" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
      <div className="pointer-events-none absolute right-16 bottom-14 h-24 w-24 -rotate-12 bg-[#63b8ff]/18" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }} />

      <div className="flex items-center justify-center mb-2 md:mb-3">
        <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs md:text-sm font-medium bg-white/70 dark:bg-white/10 text-slate-700 dark:text-slate-200">
          <Sparkles className="w-3.5 h-3.5" />
          Espacio de practica educativa
        </div>
      </div>

      <p className="text-center text-sm md:text-base text-slate-700/90 dark:text-slate-300 mb-1.5 md:mb-2">
        Practica lo aprendido con dinamicas interactivas en Lengua de Señas de Guatemala.
      </p>

      <div
        className={`relative mx-auto w-full max-w-[1420px] overflow-hidden py-2.5 md:py-4 select-none cursor-default`}
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
                className={`game-card relative overflow-hidden p-6 md:p-7 rounded-[24px] bg-[rgba(255,255,255,0.65)] dark:bg-[rgba(22,22,22,0.68)] backdrop-blur-[18px] border border-[rgba(255,255,255,0.4)] dark:border-white/10 ring-1 ring-white/35 dark:ring-white/5 flex flex-col justify-start text-center transition-all duration-[350ms] ease-[ease] hover:-translate-y-1.5 ${
                  active
                    ? 'scale-[1.03] opacity-100 [filter:none] z-20'
                    : 'scale-[0.95] opacity-60 [filter:blur(0.2px)] hover:scale-[0.98]'
                }`}
                style={{
                  width: CARD_WIDTH,
                  height: CARD_HEIGHT,
                  boxShadow: active
                    ? '0 25px 60px rgba(0,0,0,0.15), 0 0 40px rgba(120,160,220,0.25)'
                    : `0 0 0 4px ${card.accent}66`,
                }}
              >
                {active ? (
                  <div className="absolute top-0 left-0 w-full h-1 rounded-t-[20px] bg-[linear-gradient(90deg,#6b8fbf,#8eaecf)]" />
                ) : null}

                <div className="space-y-3 relative z-10">
                  {card.imageSrc ? (
                    <div className="w-full h-[190px] flex items-center justify-center rounded-[18px] bg-transparent overflow-hidden">
                      <img
                        src={card.imageSrc}
                        alt={`Vista previa de ${card.title}`}
                        className="max-h-full max-w-full object-contain drop-shadow-[0_12px_22px_rgba(0,0,0,0.18)]"
                        loading="eager"
                        decoding="async"
                      />
                    </div>
                  ) : null}

                  <h2
                    className={`${active ? 'text-[28px] md:text-[28px]' : 'text-[2rem] md:text-[2.05rem]'} font-bold leading-[1.08] tracking-[-0.01em] text-slate-900 dark:text-slate-100 min-h-[4.2rem] md:min-h-[4.4rem] flex items-center justify-center`}
                    style={{
                      fontFamily: 'Poppins, sans-serif',
                      textShadow: '0 2px 10px rgba(43,86,130,0.08)',
                    }}
                  >
                    {card.title}
                  </h2>
                  <p className="text-[0.95rem] leading-relaxed text-slate-700/95 dark:text-slate-300 min-h-[4.2rem] md:min-h-[4.4rem] flex items-start justify-center">
                    {card.description}
                  </p>
                </div>

                <Button
                  type="button"
                  disabled={!card.enabled}
                  className="w-full h-11 text-base font-semibold relative z-10 mt-auto bg-[#4997D0] hover:bg-[#3A7FB8] shadow-[0_10px_24px_rgba(56,198,255,0.28)]"
                >
                  <Play className="w-4 h-4" />
                  {card.cta}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="dots mt-1.5 md:mt-2 flex justify-center gap-2">
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

      <p
        className="mt-2 text-center text-sm md:text-[21px] font-bold tracking-[0.015em] text-[#3A7FB8] dark:text-[#9fd1ff]"
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