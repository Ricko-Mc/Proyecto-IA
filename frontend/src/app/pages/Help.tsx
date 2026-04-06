import { useState } from 'react';
import { useNavigate } from 'react-router';
import { GuatemalanFlag } from '../components/GuatemalanFlag';
import { BottomNav } from '../components/BottomNav';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ArrowLeft, Send } from 'lucide-react';

export function Help() {
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setIsSubmitting(true);
    // Simulate sending message
    setTimeout(() => {
      setIsSubmitted(true);
      setIsSubmitting(false);
      setTimeout(() => {
        navigate('/chat');
      }, 2000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <div className="border-b border-border bg-background sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/chat')}
            className="h-8 w-8"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <GuatemalanFlag size={24} />
          <h1 className="text-base font-semibold">Obtener ayuda</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-6">
        {isSubmitted ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-green-600 dark:text-green-500" />
            </div>
            <h2 className="text-lg font-semibold mb-2">¡Mensaje enviado!</h2>
            <p className="text-sm text-muted-foreground">
              Nuestro equipo revisará tu mensaje y te responderá pronto.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-base font-semibold">¿En qué podemos ayudarte?</h2>
              <p className="text-xs text-muted-foreground">
                Envía tu consulta, sugerencia o reporte de error a nuestro equipo de desarrollo.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="subject" className="text-xs">Asunto</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ej: Error en video, Sugerencia de mejora..."
                className="h-9 text-sm"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="message" className="text-xs">Mensaje</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe tu consulta o problema con el mayor detalle posible..."
                className="min-h-[150px] text-sm resize-none"
                disabled={isSubmitting}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || !subject.trim() || !message.trim()}
              className="w-full bg-[#4997D0] hover:bg-[#3A7FB8] h-9 text-sm"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Enviando...' : 'Enviar mensaje'}
            </Button>
          </form>
        )}
      </div>

      {/* Bottom Navigation (Mobile only) */}
      <BottomNav />
    </div>
  );
}
