interface SplashScreenProps {
  fadeOut?: boolean;
}

export function SplashScreen({ fadeOut = false }: SplashScreenProps) {
  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[linear-gradient(180deg,#dff0ff_0%,#f3ecde_100%)] transition-opacity duration-500 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <style>{`
        @keyframes splashProgress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        @keyframes splashDot {
          0%, 20% { opacity: 0; }
          40%, 60% { opacity: 1; }
          80%, 100% { opacity: 0; }
        }
        .splash-dot {
          display: inline-block;
          font-size: 0.875rem;
          line-height: 1rem;
          margin-left: 0.1rem;
          color: #000000;
          animation: splashDot 1.5s infinite ease-in-out;
          opacity: 0;
        }
        .splash-dot.delay-1 {
          animation-delay: 0.25s;
        }
        .splash-dot.delay-2 {
          animation-delay: 0.5s;
        }
      `}</style>
      <div className="max-w-sm w-full px-5 text-center">
        <img
          src="/logo1.png"
          alt="SEGUA Logo"
          className="mx-auto mb-6 h-24 w-auto"
          width={96}
          height={96}
          loading="eager"
          decoding="async"
        />
        <div className="mx-auto mb-5 h-3 w-full max-w-xs overflow-hidden rounded-full bg-[#d4e8fc]">
          <div
            className="h-full bg-[#38bdf8]"
            style={{
              width: '0%',
              animation: 'splashProgress 1.5s ease forwards',
            }}
          />
        </div>
        <p className="text-sm font-semibold text-slate-900">
          Cargando SEGUA
          <span className="inline-flex items-center justify-center ml-1">
            <span className="splash-dot">.</span>
            <span className="splash-dot delay-1">.</span>
            <span className="splash-dot delay-2">.</span>
          </span>
        </p>
      </div>
    </div>
  );
}
