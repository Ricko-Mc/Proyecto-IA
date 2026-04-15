import { toYouTubeEmbedUrl, toYouTubeThumbnailUrl } from '../../services/youtube';
import { LazyYouTubeFrame } from './LazyYouTubeFrame';

interface VideoPlayerProps {
  videoUrl: string;
  signLabel: string;
  active?: boolean;
}

export function VideoPlayer({ videoUrl, signLabel, active = true }: VideoPlayerProps) {
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
      className=""
      style={{ width: 420, marginLeft: 0, alignSelf: 'flex-start' }}
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

        {/* Texto superpuesto, alineado a la izquierda y centrado verticalmente */}
        <div
          className="absolute left-4 top-1/2 -translate-y-1/2"
          style={{ pointerEvents: 'none' }}
        >
          <span
            className="text-white font-bold text-base md:text-lg text-left"
            style={{
              fontFamily: 'Poppins, Arial, sans-serif',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              whiteSpace: 'pre-line',
              maxWidth: '4.5em',
              display: 'inline-block',
              textShadow: [
                '0 2px 12px rgba(0,0,0,0.85)',
                '0 4px 24px rgba(0,0,0,0.7)',
                '0 1px 2px rgba(0,0,0,0.9)',
                '2px 2px 8px rgba(0,0,0,0.5)',
                '-2px 2px 8px rgba(0,0,0,0.5)'
              ].join(','),
            }}
          >
            {signLabel}
          </span>
        </div>

        {/* Logo esquina superior izquierda */}
        <img
          src="/logo_black.png"
          alt="Logo"
          className="absolute top-3 left-3 w-10 h-10 md:w-12 md:h-12 z-10 opacity-90"
          style={{ pointerEvents: 'none' }}
        />

        {/* Logo Guatemala esquina inferior derecha */}
        <img
          src="/gt.png"
          alt="Guatemala"
          className="absolute bottom-3 right-3 w-7 h-7 md:w-9 md:h-9 z-10 opacity-80"
          style={{ pointerEvents: 'none' }}
        />
      </div>
    </div>
  );
}