import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Play, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

type GameCard = {
  id: string;
  title: string;
  description: string;
  cta: string;
  enabled: boolean;
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
  },
  {
    id: 'completa-frase',
    title: 'Completa la frase',
    description: 'Construye correctamente la oracion en señas.',
    cta: 'Jugar',
    enabled: true,
  },
  {
    id: 'memoria-visual',
    title: 'Memoria visual',
    description: 'Relaciona señas con palabras.',
    cta: 'Proximamente',
    enabled: false,
  },
];

export function GameCarousel() {
  const [index, setIndex] = useState(() => Math.min(1, GAME_CARDS.length - 1));

  const trackStyle = useMemo(
    () => ({
      transform: `translateX(calc(50% - ${CARD_WIDTH / 2}px - ${index * STEP}px))`,
    }),
    [index]
  );

  const moveLeft = () => {
    setIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const moveRight = () => {
    setIndex((prev) => (prev < GAME_CARDS.length - 1 ? prev + 1 : prev));
  };

  return (
    <div className="game-carousel w-full min-h-[760px] rounded-[30px] p-5 md:p-10 bg-[linear-gradient(135deg,#dbeafe_0%,#f2e9e4_100%)] dark:bg-[linear-gradient(135deg,#131e2f_0%,#1f1a19_100%)] border border-white/40 dark:border-white/10">
      <div className="flex items-center justify-center mb-4 md:mb-6">
        <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs md:text-sm font-medium bg-white/70 dark:bg-white/10 text-slate-700 dark:text-slate-200">
          <Sparkles className="w-3.5 h-3.5" />
          Espacio de practica educativa
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-[1420px] overflow-hidden py-4 md:py-8">
        <div
          className="carousel-track flex items-stretch gap-11 transition-transform duration-500 ease-out"
          style={trackStyle}
        >
          {GAME_CARDS.map((card, i) => {
            const active = i === index;
            return (
              <div
                key={card.id}
                className={`game-card p-6 md:p-7 rounded-[22px] bg-[rgba(255,255,255,0.62)] dark:bg-[rgba(22,22,22,0.62)] backdrop-blur-[12px] border border-white/55 dark:border-white/10 flex flex-col justify-between text-center transition-all duration-300 ease-out ${
                  active
                    ? 'scale-110 opacity-100 shadow-[0_20px_44px_rgba(0,0,0,0.16)] z-20'
                    : 'scale-[0.9] opacity-65 hover:scale-[0.95]'
                }`}
                style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
              >
                <div className="space-y-4">
                  <h2 className="text-3xl font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                    {card.title}
                  </h2>
                  <p className="text-base text-slate-700/95 dark:text-slate-300 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                <Button
                  type="button"
                  disabled={!card.enabled}
                  className="w-full h-12 text-base font-semibold"
                >
                  <Play className="w-4 h-4" />
                  {card.cta}
                </Button>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={moveLeft}
          disabled={index === 0}
          aria-label="Mover a la izquierda"
          className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 h-10 w-10 md:h-12 md:w-12 rounded-full border border-[#4997D0]/40 bg-[#4997D0]/12 text-[#3A7FB8] hover:bg-[#4997D0]/20 dark:border-[#5ea8ff]/35 dark:bg-[#4997D0]/20 dark:text-[#b9dcff] disabled:opacity-45 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5 mx-auto" />
        </button>

        <button
          type="button"
          onClick={moveRight}
          disabled={index === GAME_CARDS.length - 1}
          aria-label="Mover a la derecha"
          className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 h-10 w-10 md:h-12 md:w-12 rounded-full border border-[#4997D0]/40 bg-[#4997D0]/12 text-[#3A7FB8] hover:bg-[#4997D0]/20 dark:border-[#5ea8ff]/35 dark:bg-[#4997D0]/20 dark:text-[#b9dcff] disabled:opacity-45 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5 mx-auto" />
        </button>
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
    </div>
  );
}