import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { AlertCircle, Send } from "lucide-react";

interface WordNotFoundDialogProps {
  word: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WordNotFoundDialog({ word, open, onOpenChange }: WordNotFoundDialogProps) {
  const [feedback, setFeedback] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async () => {
    setIsLoading(true);
    setSubmitError('');
    try {
      const normalizada = word
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, '')
        .trim()
        .replace(/\s+/g, '_');

      await new Promise((resolve) => setTimeout(resolve, 300));
      setIsSubmitted(true);
    } catch (e) {
      setIsSubmitted(false);
      setSubmitError(e instanceof Error ? e.message : 'No se pudo enviar la solicitud');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFeedback("");
    setIsSubmitted(false);
    setSubmitError('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-amber-600" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            {isSubmitted ? "¡Solicitud enviada!" : "Palabra no encontrada"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {isSubmitted ? (
              <>
                Gracias por tu colaboración. Nuestro equipo revisará tu solicitud
                y trabajará para agregar esta seña al diccionario.
              </>
            ) : (
              <>
                La palabra <span className="font-semibold">"{word}"</span> aún no está
                disponible en nuestro diccionario.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {!isSubmitted ? (
          <div className="space-y-4">
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm text-foreground mb-3">
                ¿Te gustaría solicitar que agreguemos esta palabra?
              </p>
              <Textarea
                placeholder="Opcional: Agrega contexto o comentarios sobre esta palabra..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="min-h-[100px] resize-none"
              />
              {submitError ? (
                <p className="text-xs text-destructive mt-2">{submitError}</p>
              ) : null}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1 bg-[#4997D0] hover:bg-[#3A7FB8]"
              >
                <Send className="w-4 h-4 mr-2" />
                {isLoading ? "Enviando..." : "Enviar solicitud"}
              </Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={handleClose}
            className="w-full bg-[#4997D0] hover:bg-[#3A7FB8]"
          >
            Entendido
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
