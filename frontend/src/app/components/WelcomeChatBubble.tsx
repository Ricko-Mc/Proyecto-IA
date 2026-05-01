import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';

interface WelcomeChatBubbleProps {
  onDismiss?: () => void;
}

export function WelcomeChatBubble({ onDismiss }: WelcomeChatBubbleProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`fixed bottom-24 md:bottom-6 right-4 md:right-6 max-w-xs pointer-events-auto transition-all duration-700 ease-out transform ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      }`}
    >
      {/* Nube de chat */}
      <div className="bg-white dark:bg-[#2a2a2a] rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 md:p-5 relative">
        {/* Puntero de la nube */}
        <div className="absolute bottom-0 right-6 w-0 h-0 border-l-8 border-r-0 border-t-8 border-l-transparent border-t-white dark:border-t-[#2a2a2a]" />
        
        {/* Contenido */}
        <div className="flex gap-3 items-start pr-4">
          {/* Ícono */}
          <div className="flex-shrink-0 mt-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4997D0] to-[#3A7FB8] flex items-center justify-center shadow-md">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Texto */}
          <div className="flex-1">
            <p className="font-semibold text-sm md:text-base text-gray-900 dark:text-white mb-2">
              ¡Hola! 👋
            </p>
            <p className="text-xs md:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              Soy tu asistente para aprender lenguaje de señas.
              <br />
              <br />
              Puedo ayudarte a practicar abecedario, saludos, colores, animales, alimentos o frases comunes.
              <br />
              <br />
              <span className="font-medium">Prueba escribiendo una palabra (ej: "rojo"), preguntar cómo se dice (ej: "¿Cómo se dice gato?"), di "Quiero aprender la palabra..." o pide "abecedario completo" para ver todas las letras.</span>
            </p>
          </div>
        </div>

        {/* Botón de cerrar */}
        <button
          onClick={onDismiss}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label="Cerrar"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Estilo global para la animación de entrada más suave */}
      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
