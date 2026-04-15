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

        {/* Branding esquina inferior derecha */}
        <div
          className="absolute bottom-3 right-3 z-10 flex flex-col items-center gap-1 md:gap-1.5"
          style={{ pointerEvents: 'none' }}
        >
          <img
            src="/Logo3.png"
            alt="SEGUA"
            className="w-9 h-9 md:w-12 md:h-12 object-contain translate-y-1 md:translate-y-1.5 drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)]"
          />
          <img
            src="/gt.png"
            alt="Bandera de Guatemala"
            className="w-5 h-3 md:w-7 md:h-4 object-cover rounded-[2px] shadow-[0_1px_4px_rgba(0,0,0,0.45)]"
          />
        </div>
      </div>
    </div>
  );
}