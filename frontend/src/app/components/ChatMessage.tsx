import { VideoPlayer } from './VideoPlayer';
import { VideoCarousel } from './VideoCarousel';
import { GameCarousel } from './GameCarousel';
import { AbecedarioCompleto } from './AbecedarioCompleto';
import { Button } from './ui/button';
import {
  Loader2,
  Send,
  Clapperboard,
  BookOpen,
  ArrowRight,
  Gamepad2,
} from 'lucide-react';

export interface Message {
  id: string;
  type: 'user' | 'system';
  text: string;
  videoUrl?: string;
  signLabel?: string;
  isLoading?: boolean;
  notFound?: boolean;
  notFoundWord?: string;
  noVideoAvailable?: boolean;
  suggestionWord?: string;
  videos?: Array<{ word: string; videoUrl: string }>;
  videosCompilacion?: Array<{ palabra: string; signo_id: string; url_video: string | null }>;
  disambiguationWord?: string;
  disambiguationOptions?: Array<{ label: string; clave: string }>;
  backendError?: boolean;
  gamePrompt?: boolean;
  categoryPrompt?: boolean;
  categories?: string[];
  wordsList?: string[];
  games?: Array<{ id: string; label: string; desc: string }>;
}

interface ChatMessageProps {
  message: Message;
  onRequestWord?: (word: string) => void;
  onSelectDisambiguation?: (word: string, clave: string, label: string) => void;
  onSelectCategory?: (category: string) => void;
  onOpenDictionary?: () => void;
  onSendMessage?: (message: string) => void;
  onNavigateToGames?: () => void;
  isActiveVideo?: boolean;
}

function InactiveVideoPlaceholder() {
  return (
    <div className="block w-[420px] min-w-[420px] h-[80px] bg-[#eeeeee] dark:bg-[#191919] rounded-[16px] border-0">
      <div className="w-full h-full flex items-center justify-center">
        <Clapperboard className="w-4 h-4 text-muted-foreground/60" />
      </div>
    </div>
  );
}

export function ChatMessage({
  message,
  onRequestWord,
  onSelectDisambiguation,
  onSelectCategory,
  onOpenDictionary,
  onSendMessage,
  onNavigateToGames,
  isActiveVideo = false,
}: ChatMessageProps) {
  const botBubbleClass =
    'space-y-3 rounded-[18px] px-4 py-3 backdrop-blur-[10px] bg-[rgba(255,255,255,0.4)] dark:bg-[rgba(20,20,20,0.78)] dark:border dark:border-[#303030]';

  if (message.type === 'user') {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[70%] text-white rounded-[18px] px-4 py-3 bg-[linear-gradient(135deg,#3bc8ff,#5ea8ff)] dark:bg-[linear-gradient(135deg,#232323,#313131)] shadow-[0_8px_18px_rgba(59,200,255,0.28)] dark:shadow-[0_8px_18px_rgba(0,0,0,0.4)]">
          <p className="text-sm">{message.text}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-start mb-6">
      <div className="w-full">
        {message.isLoading ? (
          <div className="flex items-center gap-3 py-4 px-4 rounded-[18px] backdrop-blur-[10px] bg-[rgba(255,255,255,0.4)] dark:bg-[rgba(20,20,20,0.78)] dark:border dark:border-[#303030]">
            <Loader2 className="w-5 h-5 animate-spin text-[#4997D0] dark:text-[#d8d8d8]" />
            <span className="text-sm text-muted-foreground">Procesando...</span>
          </div>
        ) : message.gamePrompt ? (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {message.text}
            </p>
            <button
              onClick={onNavigateToGames}
              className="inline-flex items-center gap-2 rounded-[16px] bg-[#4997D0] hover:bg-[#3A7FB8] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(73,151,208,0.30)] transition-colors"
            >
              <Gamepad2 className="h-4 w-4" />
              Ir a Juegos
            </button>
          </div>
        ) : message.backendError ? (
          <div className={botBubbleClass}>
            <p className="text-sm text-destructive font-medium">Error del servidor</p>
            <p className="text-sm text-muted-foreground">
              {message.text || 'No se pudo procesar tu solicitud en este momento.'}
            </p>
          </div>
        ) : message.notFound ? (
          <div className={botBubbleClass}>
            <p className="text-sm text-destructive font-medium">
              Palabra no encontrada
            </p>
            <p className="text-sm text-muted-foreground">
              Lo sentimos, "{message.notFoundWord || 'esta palabra'}" aún no tiene seña disponible en nuestro sistema.
            </p>
            <div className="mt-4 rounded-[16px] border border-[#4997D0]/20 bg-white/80 dark:bg-[#0f1720]/90 p-3">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
                ¿Quizás quieres explorar por categorías?
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {message.categories && message.categories.length > 0 ? (
                  message.categories.map((category) => (
                    <Button
                      key={category}
                      size="sm"
                      variant="outline"
                      onClick={() => onSelectCategory?.(category)}
                      className="gap-2 rounded-full border-[#4997D0] text-[#12477f] hover:bg-[#4997d0]/10 hover:text-[#0f3f6f] dark:border-[#5ea8ff]/60 dark:text-[#cde6ff] dark:hover:bg-[#2c4f75]/60"
                    >
                      <ArrowRight className="w-4 h-4" />
                      {category}
                    </Button>
                  ))
                ) : (
                  <p className="text-sm text-slate-700 dark:text-slate-300">No se pudo cargar la lista de categorías en este momento.</p>
                )}
              </div>
              <Button
                size="sm"
                className="w-full justify-center bg-[#4997D0] hover:bg-[#3A7FB8] dark:bg-[#1f1f1f] dark:hover:bg-[#2b2b2b]"
                onClick={onOpenDictionary}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Ver Diccionario Completo
              </Button>
            </div>
          </div>
        ) : message.noVideoAvailable ? (
          <div className={botBubbleClass}>
            <p className="text-sm text-destructive font-medium">
              Aun no hay video disponible para esta seña
            </p>
            <p className="text-sm text-muted-foreground">
              Mientras tanto, puedes explorar otros signos por categoría.
            </p>
            <div className="mt-4 rounded-[16px] border border-[#4997D0]/20 bg-white/80 dark:bg-[#0f1720]/90 p-3">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
                ¿Quizás quieres explorar por categorías?
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {message.categories && message.categories.length > 0 ? (
                  message.categories.map((category) => (
                    <Button
                      key={category}
                      size="sm"
                      variant="outline"
                      onClick={() => onSelectCategory?.(category)}
                      className="gap-2 rounded-full border-[#4997D0] text-[#12477f] hover:bg-[#4997d0]/10 hover:text-[#0f3f6f] dark:border-[#5ea8ff]/60 dark:text-[#cde6ff] dark:hover:bg-[#2c4f75]/60"
                    >
                      <ArrowRight className="w-4 h-4" />
                      {category}
                    </Button>
                  ))
                ) : (
                  <p className="text-sm text-slate-700 dark:text-slate-300">No se pudo cargar la lista de categorías en este momento.</p>
                )}
              </div>
              <Button
                size="sm"
                className="w-full justify-center bg-[#4997D0] hover:bg-[#3A7FB8] dark:bg-[#1f1f1f] dark:hover:bg-[#2b2b2b]"
                onClick={onOpenDictionary}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Ver Diccionario Completo
              </Button>
            </div>
          </div>
        ) : message.disambiguationOptions && message.disambiguationOptions.length > 0 ? (
          <div className={botBubbleClass}>
            <p className="text-sm text-foreground">
              {message.text || 'La palabra tiene mas de una seña. Elige una opcion:'}
            </p>
            <div className="flex flex-col gap-2">
              {message.disambiguationOptions.map((option) => (
                <Button
                  key={option.clave}
                  size="sm"
                  variant="outline"
                  className="justify-start border-[#4997D0] text-[#4997D0] hover:bg-[#4997D0] hover:text-white dark:border-[#3a3a3a] dark:text-[#d8d8d8] dark:hover:bg-[#2a2a2a]"
                  onClick={() =>
                    onSelectDisambiguation?.(
                      message.disambiguationWord || message.notFoundWord || '',
                      option.clave,
                      option.label
                    )
                  }
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        ) : message.videosCompilacion && message.videosCompilacion.length > 0 ? (
          <div className="space-y-2">
            {message.text ? (
              <div className="rounded-[18px] px-4 py-3 backdrop-blur-[10px] bg-[rgba(255,255,255,0.4)] dark:bg-[rgba(18,30,46,0.68)] dark:border dark:border-[#2f435d]">
                <p className="text-sm text-foreground">{message.text}</p>
              </div>
            ) : null}
            {isActiveVideo ? (
              <AbecedarioCompleto videos={message.videosCompilacion} active={isActiveVideo} />
            ) : (
              <InactiveVideoPlaceholder />
            )}
          </div>
        ) : message.videos && message.videos.length > 0 ? (
          <div className="space-y-2">
            {message.text ? (
              <div className="rounded-[18px] px-4 py-3 backdrop-blur-[10px] bg-[rgba(255,255,255,0.4)] dark:bg-[rgba(18,30,46,0.68)] dark:border dark:border-[#2f435d]">
                <p className="text-sm text-foreground">{message.text}</p>
              </div>
            ) : null}
            {message.videos.length > 0 ? (
              isActiveVideo ? (
                <VideoCarousel items={message.videos} active={isActiveVideo} />
              ) : (
                <InactiveVideoPlaceholder />
              )
            ) : (
              <div className="rounded-[18px] px-4 py-3 backdrop-blur-[10px] bg-[rgba(255,255,255,0.4)] dark:bg-[rgba(18,30,46,0.68)] dark:border dark:border-[#2f435d]">
                <p className="text-sm text-foreground">No hay videos disponibles en esta categoría.</p>
              </div>
            )}
          </div>
        ) : message.videoUrl && message.signLabel ? (
          <div className="space-y-2 max-w-md">
            {message.text ? (
              <div className="rounded-[18px] px-4 py-3 backdrop-blur-[10px] bg-[rgba(255,255,255,0.4)] dark:bg-[rgba(18,30,46,0.68)] dark:border dark:border-[#2f435d]">
                <p className="text-sm text-foreground">{message.text}</p>
              </div>
            ) : null}
            {isActiveVideo ? (
              <VideoPlayer videoUrl={message.videoUrl} signLabel={message.signLabel} active={isActiveVideo} />
            ) : (
              <InactiveVideoPlaceholder />
            )}
          </div>
        ) : message.wordsList && message.wordsList.length > 0 ? (
          <div className="space-y-2">
            {message.text ? (
              <div className="rounded-[18px] px-4 py-3 backdrop-blur-[10px] bg-[rgba(255,255,255,0.4)] dark:bg-[rgba(18,30,46,0.68)] dark:border dark:border-[#2f435d]">
                <p className="text-sm text-foreground">{message.text}</p>
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {message.wordsList.map((word, index) => (
                <button
                  key={index}
                  onClick={() => onSendMessage?.(word)}
                  className="inline-flex m-0.5 px-3 py-1.5 rounded-full bg-[#DBEAFE] hover:bg-[#BFDBFE] text-slate-700 text-sm font-medium border border-[#BFDBFE] transition-colors cursor-pointer"
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        ) : message.text ? (
          <div className="rounded-[18px] px-4 py-3 backdrop-blur-[10px] bg-[rgba(255,255,255,0.4)] dark:bg-[rgba(18,30,46,0.68)] dark:border dark:border-[#2f435d]">
            <p className="text-sm text-foreground">{message.text}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}