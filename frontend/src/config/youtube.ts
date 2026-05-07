/**
 * Configuración global para YouTube
 * Suprime errores de postMessage que no afectan la funcionalidad de reproducción
 */

// Capturar errores de postMessage de YouTube sin afectar la funcionalidad
const originalError = console.error;
console.error = function (...args: unknown[]) {
  const errorStr = String(args[0]);
  
  // Ignorar errores de postMessage de YouTube (no son críticos)
  if (
    errorStr.includes('postMessage') && 
    errorStr.includes('youtube') &&
    errorStr.includes('origin')
  ) {
    return;
  }
  
  originalError.apply(console, args as Parameters<typeof originalError>);
};

// Configurar YouTube API para funcionar con localhost
if (typeof window !== 'undefined') {
  // Pre-resolver la promesa de API de YouTube
  if (!window.__youtubeApiReadyPromise) {
    window.__youtubeApiReadyPromise = new Promise((resolve) => {
      const checkYT = () => {
        if (window.YT?.Player) {
          resolve(window.YT);
        } else {
          setTimeout(checkYT, 100);
        }
      };
      checkYT();
    });
  }
}

export {};
