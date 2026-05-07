import { useState, useCallback } from 'react';
import { VideoPlayer } from './VideoPlayer';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Video {
  palabra: string;
  signo_id: string;
  url_video: string | null;
}

interface AbecedarioCompletoProps {
  videos: Video[];
  active?: boolean;
  compact?: boolean; // ← nueva prop para modo chat
}

export function AbecedarioCompleto({ videos, active = false, compact = false }: AbecedarioCompletoProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentVideo = videos[currentIndex];
  const totalVideos = videos.length;

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : totalVideos - 1));
  }, [totalVideos]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < totalVideos - 1 ? prev + 1 : 0));
  }, [totalVideos]);

  const handleLetterClick = (index: number) => {
    setCurrentIndex(index);
  };

  // ─── Modo compacto (dentro del chat) ───────────────────────────────────────
  if (compact) {
    return (
      <div className="space-y-3 w-full max-w-[520px]">
        {/* Video centrado y de buen tamaño */}
        <div className="w-full rounded-[14px] overflow-hidden shadow-md">
          {currentVideo && currentVideo.url_video && active ? (
            <VideoPlayer
              videoUrl={currentVideo.url_video}
              signLabel={currentVideo.palabra.toUpperCase()}
              active={active}
            />
          ) : (
            <div className="w-full aspect-video bg-gray-200 dark:bg-gray-700 rounded-[14px] flex items-center justify-center">
              <span className="text-gray-500 dark:text-gray-400 text-sm">Cargando video...</span>
            </div>
          )}
        </div>

        {/* Navegación */}
        <div className="flex items-center justify-between px-3 py-2 bg-white/60 dark:bg-[#2a2a2a] rounded-[12px]">
          <button
            onClick={handlePrevious}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#3a3a3a] rounded-lg transition-colors"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {currentIndex + 1} de {totalVideos}
            </p>
            <p className="text-xl font-bold text-[#4997D0] dark:text-[#5ea8ff] leading-tight">
              {currentVideo?.palabra.toUpperCase()}
            </p>
          </div>
          <button
            onClick={handleNext}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#3a3a3a] rounded-lg transition-colors"
            aria-label="Siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Teclado de letras */}
        <div className="space-y-1.5">
          <p className="text-xs text-gray-500 dark:text-gray-400 px-1 font-medium">
            Selecciona una letra:
          </p>
          <div className="grid grid-cols-7 gap-1.5">
            {videos.map((video, index) => (
              <button
                key={`${video.palabra}-${index}`}
                onClick={() => handleLetterClick(index)}
                className={`
                  h-9 text-xs font-bold rounded-lg transition-all
                  ${
                    index === currentIndex
                      ? 'bg-[#4997D0] text-white shadow scale-105'
                      : 'bg-white dark:bg-[#3a3a3a] text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-[#4a4a4a] border border-gray-200 dark:border-gray-600'
                  }
                `}
                title={video.palabra}
              >
                {video.palabra.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#4997D0] to-[#3A7FB8] transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / totalVideos) * 100}%` }}
          />
        </div>
      </div>
    );
  }

  // ─── Modo normal (página completa) ─────────────────────────────────────────
  return (
    <div className="space-y-4">
      {currentVideo && currentVideo.url_video && active ? (
        <div className="rounded-lg overflow-hidden shadow-lg">
          <VideoPlayer
            videoUrl={currentVideo.url_video}
            signLabel={currentVideo.palabra.toUpperCase()}
            active={active}
          />
        </div>
      ) : (
        <div className="w-full h-96 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
          <span className="text-gray-500 dark:text-gray-400">Cargando video...</span>
        </div>
      )}

      <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-[#2a2a2a] rounded-lg">
        <button
          onClick={handlePrevious}
          className="p-2 hover:bg-gray-100 dark:hover:bg-[#3a3a3a] rounded-lg transition-colors"
          aria-label="Anterior"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {currentIndex + 1} de {totalVideos}
          </p>
          <p className="text-2xl font-bold text-[#4997D0] dark:text-[#5ea8ff]">
            {currentVideo?.palabra.toUpperCase()}
          </p>
        </div>
        <button
          onClick={handleNext}
          className="p-2 hover:bg-gray-100 dark:hover:bg-[#3a3a3a] rounded-lg transition-colors"
          aria-label="Siguiente"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-gray-600 dark:text-gray-400 px-4 font-medium">
          Selecciona una letra:
        </p>
        <div className="grid grid-cols-7 gap-1.5 px-2">
          {videos.map((video, index) => (
            <button
              key={`${video.palabra}-${index}`}
              onClick={() => handleLetterClick(index)}
              className={`
                h-10 text-sm font-bold rounded-lg transition-all
                ${
                  index === currentIndex
                    ? 'bg-[#4997D0] text-white shadow-lg scale-105'
                    : 'bg-white dark:bg-[#3a3a3a] text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-[#4a4a4a] border border-gray-200 dark:border-gray-600'
                }
              `}
              title={video.palabra}
            >
              {video.palabra.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#4997D0] to-[#3A7FB8] transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / totalVideos) * 100}%` }}
        />
      </div>
    </div>
  );
}