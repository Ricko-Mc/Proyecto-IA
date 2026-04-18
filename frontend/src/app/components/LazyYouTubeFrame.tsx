import { useEffect, useRef, useState } from 'react';
import { PlayCircle } from 'lucide-react';

interface LazyYouTubeFrameProps {
  src: string;
  title: string;
  className?: string;
  thumbnailUrl?: string | null;
  active?: boolean;
}

export function LazyYouTubeFrame({ src, title, className, thumbnailUrl, active = true }: LazyYouTubeFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setShouldLoad(false);
  }, [src]);

  useEffect(() => {
    if (active) {
      setShouldLoad(true);
    }
  }, [active, src]);

  const activarCarga = () => {
    setShouldLoad(true);
  };

  return (
    <div ref={containerRef} className={className || 'relative w-full h-full'}>
      {shouldLoad ? (
        <iframe
          src={src}
          title={title}
          className="w-full h-full border-0"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() => setLoaded(true)}
        />
      ) : (
        <button
          type="button"
          onClick={activarCarga}
          className="absolute inset-0 w-full h-full cursor-pointer overflow-hidden"
          aria-label={`Cargar video: ${title}`}
        >
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover"
              width={480}
              height={270}
              loading="eager"
              decoding="async"
            />
          ) : (
            <div className="absolute inset-0 bg-black/40" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <PlayCircle className="h-16 w-16 text-white/90 drop-shadow-lg" />
          </div>
        </button>
      )}

      {shouldLoad && !loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
          <p className="text-white/85 text-xs md:text-sm">Cargando video...</p>
        </div>
      )}
    </div>
  );
}
