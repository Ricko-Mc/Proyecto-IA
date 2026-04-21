import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { extractYouTubeId, toYouTubePlaylistEmbedUrl, toYouTubeThumbnailUrl } from '../../services/youtube';
import { LazyYouTubeFrame } from './LazyYouTubeFrame';

interface VideoCarouselItem {
  word: string;
  videoUrl: string;
}

interface VideoCarouselProps {
  items: VideoCarouselItem[];
  active?: boolean;
}

type YoutubeApi = {
  Player: new (element: HTMLElement, options: Record<string, unknown>) => YoutubePlayer;
  PlayerState: {
    ENDED: number;
  };
};

type YoutubePlayer = {
  destroy: () => void;
  mute: () => void;
  playVideo: () => void;
  pauseVideo: () => void;
  loadVideoById: (videoId: string) => void;
};

declare global {
  interface Window {
    YT?: YoutubeApi;
    onYouTubeIframeAPIReady?: () => void;
    __youtubeApiReadyPromise?: Promise<YoutubeApi>;
  }
}

function cargarYoutubeApi(): Promise<YoutubeApi> {
  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }

  if (window.__youtubeApiReadyPromise) {
    return window.__youtubeApiReadyPromise;
  }

  window.__youtubeApiReadyPromise = new Promise<YoutubeApi>((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    window.onYouTubeIframeAPIReady = () => {
      resolve(window.YT as YoutubeApi);
    };
    document.head.appendChild(script);
  });

  return window.__youtubeApiReadyPromise;
}

export function VideoCarousel({ items, active = true }: VideoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playerReady, setPlayerReady] = useState(false);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YoutubePlayer | null>(null);
  const ids = useMemo(
    () => items.map((item) => extractYouTubeId(item.videoUrl)).filter((id): id is string => Boolean(id)),
    [items]
  );
  const playlistUrl = useMemo(
    () => toYouTubePlaylistEmbedUrl(items.map((item) => item.videoUrl), currentIndex),
    [items, currentIndex]
  );

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (items.length <= 1 || ids.length === 0 || !playerContainerRef.current) {
      return;
    }

    setPlayerReady(false);
    let disposed = false;

    void cargarYoutubeApi().then((YT) => {
      if (disposed || !playerContainerRef.current || playerRef.current) {
        return;
      }

      playerRef.current = new YT.Player(playerContainerRef.current, {
        videoId: ids[0],
        playerVars: {
          autoplay: active ? 1 : 0,
          mute: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          playsinline: 1,
          rel: 0,
          modestbranding: 1,
          showinfo: 0,
          iv_load_policy: 3,
          loop: 1,
          playlist: ids.join(','),
        },
        events: {
          onReady: (event: { target: YoutubePlayer }) => {
            setPlayerReady(true);
            event.target.mute();
            if (active) {
              event.target.playVideo();
            }
          },
          onStateChange: (event: { data: number }) => {
            if (event.data === YT.PlayerState.ENDED) {
              setCurrentIndex((prev) => (prev + 1) % ids.length);
            }
          },
        },
      });
    });

    return () => {
      disposed = true;
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [ids, items.length]);

  useEffect(() => {
    if (!playerRef.current || items.length <= 1 || ids.length === 0) {
      return;
    }

    const videoId = ids[currentIndex];
    playerRef.current.loadVideoById(videoId);
    playerRef.current.mute();
    if (active) {
      playerRef.current.playVideo();
    } else {
      playerRef.current.pauseVideo();
    }
  }, [active, currentIndex, ids, items.length]);

  if (items.length === 0) return null;

  if (!playlistUrl) {
    return (
      <div className="w-full max-w-sm md:max-w-lg">
        <div className="relative bg-gray-900 rounded-[12px] overflow-hidden aspect-video shadow-sm flex items-center justify-center p-4">
          <p className="text-white/80 text-sm text-center">No se pudieron cargar los videos de YouTube.</p>
        </div>
      </div>
    );
  }

  if (items.length === 1) {
    return (
      <div className="w-full max-w-sm md:max-w-lg">
        <div className="relative bg-gray-900 rounded-[12px] overflow-hidden aspect-video shadow-sm">
          <LazyYouTubeFrame
            src={playlistUrl}
            title={`Video de seña: ${items[0].word}`}
            className="w-full h-full"
            thumbnailUrl={toYouTubeThumbnailUrl(items[0].videoUrl)}
            active={active}
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
      <div className="relative">
        <div className="w-full max-w-sm md:max-w-lg mx-auto">
          <div className="relative bg-gray-900 rounded-[12px] overflow-hidden aspect-video shadow-sm">
            <div
              ref={playerContainerRef}
              className="w-full h-full"
              style={{
                opacity: playerReady ? 1 : 0,
                transition: 'opacity 150ms ease-in-out',
              }}
            />
            {!playerReady && (
              <div className="absolute inset-0 bg-black z-10" />
            )}
            {!active && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                <p className="text-white/85 text-xs md:text-sm">Video en pausa</p>
              </div>
            )}
          </div>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={goToPrevious}
          className="absolute left-1 md:left-2 top-1/2 -translate-y-1/2 bg-transparent hover:bg-white/10 text-white border-0 shadow-none h-9 w-9 md:h-10 md:w-10"
          disabled={items.length <= 1}
        >
          <ChevronLeft className="w-4 md:w-5 h-4 md:h-5" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={goToNext}
          className="absolute right-1 md:right-2 top-1/2 -translate-y-1/2 bg-transparent hover:bg-white/10 text-white border-0 shadow-none h-9 w-9 md:h-10 md:w-10"
          disabled={items.length <= 1}
        >
          <ChevronRight className="w-4 md:w-5 h-4 md:h-5" />
        </Button>
      </div>

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

      <div className="flex flex-wrap gap-1 md:gap-2 justify-center px-2">
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

      <p className="text-center text-xs text-muted-foreground">
        Cambia al siguiente video al terminar y se mantiene en silencio.
      </p>
    </div>
  );
}