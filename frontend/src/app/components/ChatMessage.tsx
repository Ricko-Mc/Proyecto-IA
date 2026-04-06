import { VideoPlayer } from './VideoPlayer';
import { VideoCarousel } from './VideoCarousel';
import { Button } from './ui/button';
import { Loader2, Send } from 'lucide-react';

export interface Message {
  id: string;
  type: 'user' | 'system';
  text: string;
  videoUrl?: string;
  signLabel?: string;
  isLoading?: boolean;
  notFound?: boolean;
  notFoundWord?: string;
  videos?: Array<{ word: string; videoUrl: string }>;
}

interface ChatMessageProps {
  message: Message;
  onRequestWord?: (word: string) => void;
}

export function ChatMessage({ message, onRequestWord }: ChatMessageProps) {
  if (message.type === 'user') {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[70%] bg-[#4997D0] text-white rounded-2xl rounded-tr-sm px-4 py-3">
          <p className="text-sm">{message.text}</p>
        </div>
      </div>
    );
  }

  // System message
  return (
    <div className="flex justify-start mb-6">
      <div className="max-w-[90%]">
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
        ) : message.videos && message.videos.length > 0 ? (
          <div className="space-y-2">
            <VideoCarousel items={message.videos} />
          </div>
        ) : message.videoUrl && message.signLabel ? (
          <div className="space-y-2">
            <VideoPlayer videoUrl={message.videoUrl} signLabel={message.signLabel} />
          </div>
        ) : null}
      </div>
    </div>
  );
}