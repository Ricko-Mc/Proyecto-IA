import { VideoPlayer } from './VideoPlayer';
import { VideoCarousel } from './VideoCarousel';
import { Button } from './ui/button';
import { Loader2, Send, Clapperboard } from 'lucide-react';

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
  disambiguationWord?: string;
  disambiguationOptions?: Array<{ label: string; clave: string }>;
}

interface ChatMessageProps {
  message: Message;
  onRequestWord?: (word: string) => void;
  onSelectDisambiguation?: (word: string, clave: string, label: string) => void;
  isActiveVideo?: boolean;
}

function InactiveVideoPlaceholder() {
  return (
    <div className="block w-[420px] min-w-[420px] h-[80px] bg-[#eeeeee] rounded-[16px] border-0">
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
  isActiveVideo = false,
}: ChatMessageProps) {
  if (message.type === 'user') {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[70%] bg-[#4997D0] text-white rounded-2xl rounded-tr-sm px-4 py-3">
          <p className="text-sm">{message.text}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-start mb-6">
      <div className="w-full">
        {message.isLoading ? (
          <div className="flex items-center gap-3 py-4 px-4 bg-muted rounded-2xl rounded-tl-sm">
            <Loader2 className="w-5 h-5 animate-spin text-[#4997D0]" />
            <span className="text-sm text-muted-foreground">Procesando...</span>
          </div>
        ) : message.notFound ? (
          <div className="space-y-3 bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
            <p className="text-sm text-destructive font-medium">
              Palabra no encontrada
            </p>
            <p className="text-sm text-muted-foreground">
              Lo sentimos, "{message.notFoundWord || 'esta palabra'}" aún no tiene seña disponible en nuestro sistema.
            </p>
            <Button
              onClick={() => onRequestWord?.(message.notFoundWord || '')}
              size="sm"
              className="w-full bg-[#4997D0] hover:bg-[#3A7FB8]"
            >
              <Send className="w-4 h-4 mr-2" />
              Solicitar esta palabra
            </Button>
          </div>
        ) : message.noVideoAvailable ? (
          <div className="space-y-3 bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
            <p className="text-sm text-destructive font-medium">
              Aun no hay video disponible para esta seña
            </p>
            <p className="text-sm text-muted-foreground">
              Puedes enviarnos la sugerencia para agregar esta seña al sistema.
            </p>
            <Button
              onClick={() => onRequestWord?.(message.suggestionWord || message.signLabel || '')}
              size="sm"
              className="w-full bg-[#4997D0] hover:bg-[#3A7FB8]"
            >
              <Send className="w-4 h-4 mr-2" />
              Enviar sugerencia de seña
            </Button>
          </div>
        ) : message.disambiguationOptions && message.disambiguationOptions.length > 0 ? (
          <div className="space-y-3 bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
            <p className="text-sm text-foreground">
              {message.text || 'La palabra tiene mas de una seña. Elige una opcion:'}
            </p>
            <div className="flex flex-col gap-2">
              {message.disambiguationOptions.map((option) => (
                <Button
                  key={option.clave}
                  size="sm"
                  variant="outline"
                  className="justify-start border-[#4997D0] text-[#4997D0] hover:bg-[#4997D0] hover:text-white"
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
        ) : message.videos && message.videos.length > 0 ? (
          <div className="space-y-2">
            {message.text ? (
              <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                <p className="text-sm text-foreground">{message.text}</p>
              </div>
            ) : null}
            {isActiveVideo ? (
              <VideoCarousel items={message.videos} active={isActiveVideo} />
            ) : (
              <InactiveVideoPlaceholder />
            )}
          </div>
        ) : message.videoUrl && message.signLabel ? (
          <div className="space-y-2">
            {message.text ? (
              <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                <p className="text-sm text-foreground">{message.text}</p>
              </div>
            ) : null}
            {isActiveVideo ? (
              <VideoPlayer videoUrl={message.videoUrl} signLabel={message.signLabel} active={isActiveVideo} />
            ) : (
              <InactiveVideoPlaceholder />
            )}
          </div>
        ) : message.text ? (
          <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
            <p className="text-sm text-foreground">{message.text}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}