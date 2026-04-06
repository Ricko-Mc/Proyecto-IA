import { useState } from "react";
import { GuatemalanFlag } from "../components/GuatemalanFlag";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Mail, ArrowLeft } from "lucide-react";

interface ForgotPasswordProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ForgotPassword({ open, onOpenChange }: ForgotPasswordProps) {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    // Simulate sending recovery email
    setTimeout(() => {
      setIsSubmitted(true);
      setIsLoading(false);
    }, 1500);
  };

  const handleClose = () => {
    setEmail("");
    setIsSubmitted(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <GuatemalanFlag size={60} />
          </div>
          <DialogTitle className="text-center text-2xl">
            {isSubmitted ? "¡Correo enviado!" : "Recuperar contraseña"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {isSubmitted
              ? "Hemos enviado instrucciones para recuperar tu contraseña a tu correo electrónico."
              : "Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña."}
          </DialogDescription>
        </DialogHeader>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Mail className="w-5 h-5" />
              </div>
              <Input
                type="email"
                placeholder="tu-email@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 pl-11"
                disabled={isLoading}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading || !email}
              className="w-full h-11 bg-[#4997D0] hover:bg-[#3A7FB8]"
            >
              {isLoading ? "Enviando..." : "Enviar instrucciones"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              className="w-full"
            >
              Cancelar
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-sm text-green-800">
                Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
              </p>
            </div>
            <Button
              onClick={handleClose}
              className="w-full bg-[#4997D0] hover:bg-[#3A7FB8]"
            >
              Entendido
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
