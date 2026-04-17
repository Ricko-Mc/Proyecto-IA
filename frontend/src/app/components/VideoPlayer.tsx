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
            className="text-white font-bold text-base md:text-lg text-left uppercase"
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
              textTransform: 'uppercase',
            }}
          >
            {signLabel.toUpperCase()}
          </span>
        </div>

        {/* Logo superior izquierdo */}
        <div
          className="absolute top-3 left-3 z-10"
          style={{ pointerEvents: 'none' }}
        >
          <img
            src="/logowhite.png"
            alt="Logo SEGUA"
            width={60}
            height={60}
            loading="eager"
            decoding="async"
            className="h-12 w-auto object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)]"
            style={{ maxHeight: 60 }}
          />
        </div>

        {/* Bandera de Guatemala en esquina inferior derecha */}
        <div
          className="absolute bottom-3 right-3 z-10"
          style={{ pointerEvents: 'none' }}
        >
          <img
            src="/gt.png"
            alt="Bandera de Guatemala"
            width={50}
            height={50}
            loading="lazy"
            decoding="async"
            className="w-12 h-auto object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]"
            style={{ maxWidth: 50 }}
          />
        </div>
      </div>
    </div>
  );
}