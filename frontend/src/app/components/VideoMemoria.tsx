import { toYouTubeEmbedUrl, toYouTubeThumbnailUrl } from '../../services/youtube';
import { LazyYouTubeFrame } from './LazyYouTubeFrame';

interface VideoPlayerProps {
  videoUrl: string;
  signLabel: string;
  active?: boolean;
}

export function VideoMemoria({ videoUrl, signLabel, active = true }: VideoPlayerProps) {
  const embedUrl = toYouTubeEmbedUrl(videoUrl);
  const thumbnailUrl = toYouTubeThumbnailUrl(videoUrl);

  if (!embedUrl) {
    return (
      <div className="w-full max-w-sm md:max-w-2xl">
        <div className="relative bg-gray-900 rounded-[12px] overflow-hidden aspect-video shadow-sm flex items-center justify-center p-4">
          <p className="text-white/80 text-sm text-center">No se pudo cargar el video de YouTube.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full"
    >
      <div className="relative bg-gray-900 rounded-[12px] overflow-hidden aspect-video shadow-sm">
        {/* Video */}
        <LazyYouTubeFrame
          src={embedUrl}
          title={`Video de seña: ${signLabel}`}
          className="w-full h-full"
          thumbnailUrl={thumbnailUrl}
          active={active}
        />

      </div>
    </div>
  );
}