import { useNavigate } from 'react-router';
import { GuatemalanFlag } from '../components/GuatemalanFlag';
import { Button } from '../components/ui/button';
import { Home } from 'lucide-react';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <GuatemalanFlag size={100} className="mx-auto mb-6" />
        <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Página no encontrada
        </h2>
        <p className="text-muted-foreground mb-8">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        <Button
          onClick={() => navigate('/')}
          className="bg-[#4997D0] hover:bg-[#3A7FB8]"
        >
          <Home className="w-4 h-4 mr-2" />
          Volver al inicio
        </Button>
      </div>
    </div>
  );
}
