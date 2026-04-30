import { useEffect, useRef, useState } from 'react';
import { PlayCircle } from 'lucide-react';

interface LazyYouTubeFrameProps {
  src: string;
  title: string;
  className?: string;
  thumbnailUrl?: string | null;
  active?: boolean;
}

function obtenerVideoIdDeEmbed(url: string): string | null {
  try {
    const parsed = new URL(url);
    const match = parsed.pathname.match(/\/embed\/([^/?]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

export function LazyYouTubeFrame({ src, title, className, thumbnailUrl, active = true }: LazyYouTubeFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setIsVisible(false);
  }, [src]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1,
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [src]);

  const videoId = obtenerVideoIdDeEmbed(src);
  const resolvedThumbnailUrl =
    thumbnailUrl || (videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null);
  const fallbackThumbnailUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
    : null;

  const iframeSrc = (() => {
    if (!isVisible && !active) return '';
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    try {
      const url = new URL(src);
      // Cambiar youtube.com a youtube-nocookie.com
      url.hostname = url.hostname.replace('youtube.com', 'youtube-nocookie.com');
      url.searchParams.set('autoplay', active ? '1' : '0');
      url.searchParams.set('mute', '1');
      url.searchParams.set('enablejsapi', '1');
      if (origin) {
        url.searchParams.set('origin', origin);
      }
      return url.toString();
    } catch {
      // Fallback para URLs inválidas
      const base = src.replace(
        /https?:\/\/(www\.)?youtube\.com\/embed\//,
        'https://www.youtube-nocookie.com/embed/'
      );
      const params = [
        'autoplay=' + (active ? '1' : '0'),
        'mute=1',
        'enablejsapi=1',
        origin ? 'origin=' + encodeURIComponent(origin) : ''
      ].filter(Boolean);
      return base + (base.includes('?') ? '&' : '?') + params.join('&');
    }
  })();

  const shouldLoad = isVisible || active;

  return (
    <div
      ref={containerRef}
      className={className || 'w-full h-full'}
      style={{ position: 'relative' }}
    >
      <div
        style={{
          opacity: loaded ? 0 : 1,
          transition: 'opacity 150ms ease-in-out',
          position: 'absolute',
          inset: 0,
          zIndex: 1,
        }}
      >
        {resolvedThumbnailUrl ? (
          <img
            src={resolvedThumbnailUrl}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
            width={480}
            height={270}
            loading="eager"
            decoding="async"
            onError={(event) => {
              if (fallbackThumbnailUrl) {
                event.currentTarget.src = fallbackThumbnailUrl;
              }
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-black/40" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <PlayCircle className="h-16 w-16 text-white/90 drop-shadow-lg" />
        </div>
      </div>

      {shouldLoad && (
        <>
          {!loaded && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'black',
                zIndex: 2,
              }}
            />
          )}
          <iframe
            src={iframeSrc}
            title={title}
            className="w-full h-full border-0"
            style={{
              pointerEvents: 'none',
              opacity: loaded ? 1 : 0,
              visibility: loaded ? 'visible' : 'hidden',
              transition: 'opacity 150ms ease-in-out',
            }}
            sandbox="allow-scripts allow-same-origin allow-presentation allow-autoplay allow-popups"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            loading="eager"
            referrerPolicy="strict-origin-when-cross-origin"
            onLoad={() => setLoaded(true)}
            onError={() => setLoaded(true)}
          />
        </>
      )}
    </div>
  );
}
