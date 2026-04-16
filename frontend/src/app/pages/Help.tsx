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
    setTimeout(() => {
      setIsSubmitted(true);
      setIsSubmitting(false);
      setTimeout(() => {
        navigate('/chat');
      }, 2000);
    }, 1500);
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0 bg-[linear-gradient(180deg,#F1F8FF_0%,#DDEEFF_55%,#EEF7FF_100%)] dark:bg-[linear-gradient(180deg,#0a0a0a_0%,#101010_100%)]">
      
      <div className="sticky top-0 z-10 border-b border-black/5 dark:border-white/10 bg-transparent">
        <div className="max-w-4xl mx-auto px-4 md:px-7 h-[72px] flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/chat')}
            className="h-9 w-9 rounded-[10px] bg-white dark:bg-[#1a1a1a] border border-[#dbe4ef] dark:border-[#333333] text-[#516276] dark:text-[#e4e4e4] hover:bg-[#eef4fc] dark:hover:bg-[#262626] transition-all duration-200 ease-in-out"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <GuatemalanFlag size={24} />
          <h1 className="text-base font-semibold text-[#111f33] dark:text-[#f2f2f2]">Obtener ayuda</h1>
        </div>
      </div>

      
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-6">
        <div className="rounded-2xl border border-white/70 dark:border-white/10 bg-white/86 dark:bg-[#121212]/90 shadow-[0_10px_28px_rgba(13,43,76,0.08)] dark:shadow-[0_10px_28px_rgba(0,0,0,0.35)] p-4 sm:p-5">
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
              className="w-full bg-[#4997D0] hover:bg-[#3A7FB8] dark:bg-[#1f1f1f] dark:hover:bg-[#2b2b2b] h-9 text-sm"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Enviando...' : 'Enviar mensaje'}
            </Button>
          </form>
        )}
        </div>
      </div>

      
      <BottomNav />
    </div>
  );
}
