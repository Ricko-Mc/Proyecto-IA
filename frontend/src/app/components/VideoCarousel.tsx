import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

interface VideoCarouselItem {
  word: string;
  videoUrl: string;
}

interface VideoCarouselProps {
  items: VideoCarouselItem[];
}

export function VideoCarousel({ items }: VideoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!autoPlay || items.length <= 1) return;

    // Auto-advance every 8 seconds
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 8000);

    return () => clearInterval(timer);
  }, [autoPlay, items.length]);

  const goToNext = () => {
    setAutoPlay(false);
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const goToPrevious = () => {
    setAutoPlay(false);
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const goToSlide = (index: number) => {
    setAutoPlay(false);
    setCurrentIndex(index);
  };

  if (items.length === 0) return null;

  if (items.length === 1) {
    return (
      <div className="w-full max-w-sm md:max-w-lg">
        <div className="relative bg-gray-900 rounded-lg md:rounded-xl overflow-hidden aspect-video shadow-lg">
          <video
            src={items[0].videoUrl}
            className="w-full h-full object-cover"
            playsInline
            autoPlay
            loop
            muted
            preload="auto"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 md:p-3">
            <p className="text-white text-xs md:text-sm font-medium text-center">
              {items[0].word}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm md:max-w-2xl space-y-2 md:space-y-4">
      {/* Current word indicator */}
      <div className="text-center">
        <p className="text-xs md:text-sm text-muted-foreground mb-1">
          Seña {currentIndex + 1} de {items.length}
        </p>
        <h3 className="text-base md:text-xl font-semibold text-foreground line-clamp-2">
          "{items[currentIndex].word}"
        </h3>
      </div>

      {/* Video player with navigation */}
      <div className="relative">
        <div className="w-full max-w-sm md:max-w-lg mx-auto">
          <div className="relative bg-gray-900 rounded-lg md:rounded-xl overflow-hidden aspect-video shadow-lg">
            <video
              key={items[currentIndex].videoUrl}
              src={items[currentIndex].videoUrl}
              className="w-full h-full object-cover"
              playsInline
              autoPlay
              loop
              muted
              preload="auto"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 md:p-3">
              <p className="text-white text-xs md:text-sm font-medium text-center line-clamp-1">
                {items[currentIndex].word}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation arrows */}
        <Button
          variant="outline"
          size="icon"
          onClick={goToPrevious}
          className="absolute left-1 md:left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg h-9 w-9 md:h-10 md:w-10"
          disabled={items.length <= 1}
        >
          <ChevronLeft className="w-4 md:w-5 h-4 md:h-5" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={goToNext}
          className="absolute right-1 md:right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg h-9 w-9 md:h-10 md:w-10"
          disabled={items.length <= 1}
        >
          <ChevronRight className="w-4 md:w-5 h-4 md:h-5" />
        </Button>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-1 md:gap-2">
        {items.map((item, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all ${
              index === currentIndex
                ? 'w-6 md:w-8 h-2 bg-[#4997D0]'
                : 'w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
            } rounded-full`}
            aria-label={`Ir a seña ${index + 1}: ${item.word}`}
          />
        ))}
      </div>

      {/* Words list */}
      <div className="flex flex-wrap gap-1 md:gap-2 justify-center px-2\">
        {items.map((item, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`px-2 md:px-3 py-1 md:py-1.5 rounded-full text-xs md:text-sm transition-all ${
              index === currentIndex
                ? 'bg-[#4997D0] text-white font-medium'
                : 'bg-muted text-muted-foreground hover:bg-accent'
            }`}
          >
            {item.word}
          </button>
        ))}
      </div>

      {autoPlay && (
        <p className="text-center text-xs text-muted-foreground\">
          Las señas avanzan automáticamente cada 8 segundos
        </p>
      )}
    </div>
  );
}