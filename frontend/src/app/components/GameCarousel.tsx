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
    <div className="game-carousel relative w-full min-h-[700px] rounded-[30px] p-4 md:p-8 bg-[radial-gradient(circle_at_20%_20%,rgba(80,160,255,0.18),transparent_28%),radial-gradient(circle_at_80%_70%,rgba(123,97,255,0.16),transparent_24%),linear-gradient(135deg,#d7e4f4_0%,#ece8f2_55%,#f3eee7_100%)] dark:bg-[linear-gradient(135deg,#0d1b30_0%,#171a2b_100%)] border border-white/35 dark:border-white/10 overflow-hidden flex flex-col justify-center">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(10,20,40,0.02),rgba(10,20,40,0.08))]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.04)_1px,transparent_1px)] [background-size:48px_48px] [mix-blend-mode:soft-light]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.22] [background-image:linear-gradient(128deg,rgba(255,255,255,.11)_1px,transparent_1px)] [background-size:180px_180px]" />
      <div className="pointer-events-none absolute -left-24 top-28 h-40 w-40 rounded-full bg-[#6fa9ff]/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-24 h-44 w-44 rounded-full bg-[#8a7dff]/22 blur-3xl" />
      <div className="pointer-events-none absolute -left-12 top-20 h-28 w-28 rotate-12 bg-[#63b8ff]/20" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
      <div className="pointer-events-none absolute right-16 bottom-14 h-24 w-24 -rotate-12 bg-[#63b8ff]/18" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }} />

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
            const modeOverlay =
              card.id === 'adivina-sena'
                ? 'bg-[linear-gradient(to_top,rgba(0,180,255,0.56)_0%,rgba(0,180,255,0.1)_52%,transparent_100%)]'
                : card.id === 'completa-frase'
                ? 'bg-[linear-gradient(to_top,rgba(123,97,255,0.58)_0%,rgba(123,97,255,0.1)_52%,transparent_100%)]'
                : 'bg-[linear-gradient(to_top,rgba(64,214,168,0.54)_0%,rgba(64,214,168,0.09)_52%,transparent_100%)]';
            const activeGlow =
              card.id === 'adivina-sena'
                ? '0 22px 58px rgba(0,0,0,0.22), 0 0 40px rgba(0,180,255,0.26)'
                : card.id === 'completa-frase'
                ? '0 22px 58px rgba(0,0,0,0.22), 0 0 40px rgba(123,97,255,0.3)'
                : '0 22px 58px rgba(0,0,0,0.22), 0 0 40px rgba(64,214,168,0.28)';

            return (
              <div
                key={card.id}
                className={`game-card relative overflow-hidden p-0 rounded-[26px] border border-white/20 ring-1 ring-white/10 flex flex-col justify-start transition-all duration-[350ms] ease-[ease] ${
                  active
                    ? 'scale-[1.15] opacity-100 z-20'
                    : 'scale-[0.9] opacity-[0.9] [filter:saturate(0.95)_brightness(0.96)] z-10'
                }`}
                style={{
                  width: CARD_WIDTH,
                  height: CARD_HEIGHT,
                  boxShadow: active ? activeGlow : `0 8px 26px ${card.accent}33`,
                }}
              >
                {active ? (
                  <div className="pointer-events-none absolute left-0 top-0 z-20 h-1 w-full rounded-t-[24px] bg-[linear-gradient(90deg,#00c2ff,#7c3aed,#40d6a8)]" />
                ) : null}

                {card.imageSrc ? (
                  <img
                    src={card.imageSrc}
                    alt={`Vista previa de ${card.title}`}
                    className={`h-full w-full object-cover ${
                      active ? 'scale-[1.02] object-[center_30%]' : 'scale-100 object-[center_30%]'
                    } transition-transform duration-500`}
                    loading="eager"
                    decoding="async"
                  />
                ) : (
                  <div className="h-full w-full bg-[linear-gradient(160deg,#4d7ab8_0%,#2f4f7f_100%)]" />
                )}

                <div className={`pointer-events-none absolute inset-0 ${modeOverlay}`} />

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