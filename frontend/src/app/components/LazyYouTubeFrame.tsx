import { useEffect, useState } from 'react';

interface LazyYouTubeFrameProps {
  src: string;
  title: string;
  className?: string;
  thumbnailUrl?: string | null;
  active?: boolean;
}

export function LazyYouTubeFrame({ src, title, className, thumbnailUrl, active = true }: LazyYouTubeFrameProps) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setShouldLoad(active);
  }, [src]);

  useEffect(() => {
    setShouldLoad(active);
  }, [active]);

  const activarCarga = () => setShouldLoad(true);

  return (
    <div className={className || 'w-full h-full'}>
      {shouldLoad ? (
        <iframe
          key={src}
          src={src}
          title={title}
          className="w-full h-full border-0"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          loading={active ? 'eager' : 'lazy'}
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() => setLoaded(true)}
        />
      ) : null}

      {!shouldLoad && (
        <button
          type="button"
          onClick={activarCarga}
          onMouseEnter={activarCarga}
          onFocus={activarCarga}
          className="absolute inset-0 w-full h-full cursor-default"
          aria-label={`Cargar video: ${title}`}
        >
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 bg-black/30" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
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
