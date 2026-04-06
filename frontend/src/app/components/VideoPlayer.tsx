import { useRef, useEffect } from 'react';

interface VideoPlayerProps {
  videoUrl: string;
  signLabel: string;
}

export function VideoPlayer({ videoUrl, signLabel }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Auto play when video loads
    video.play().catch(() => {
      // Ignore autoplay errors (some browsers block autoplay)
    });
  }, [videoUrl]);

  return (
    <div className="w-full max-w-sm md:max-w-lg">
      <div className="relative bg-gray-900 rounded-lg md:rounded-xl overflow-hidden aspect-video shadow-lg">
        {/* Video element - behaves like a GIF */}
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-cover"
          playsInline
          autoPlay
          loop
          muted
          preload="auto"
        />
        
        {/* Optional label overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 md:p-3">
          <p className="text-white text-xs md:text-sm font-medium text-center">
            {signLabel}
          </p>
        </div>
      </div>
    </div>
  );
}