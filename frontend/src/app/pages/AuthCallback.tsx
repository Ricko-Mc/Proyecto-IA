import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Loader2 } from 'lucide-react';

import { api } from '../../services/api';

export function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const procesarCallback = async () => {
      const hash = window.location.hash.startsWith('#')
        ? window.location.hash.slice(1)
        : window.location.hash;
      const hashParams = new URLSearchParams(hash);
      const searchParams = new URLSearchParams(window.location.search);

      const errorOAuth =
        searchParams.get('error_description') ||
        hashParams.get('error_description') ||
        searchParams.get('error') ||
        hashParams.get('error');

      if (errorOAuth) {
        setError(errorOAuth);
        return;
      }

      const token =
        searchParams.get('access_token') ||
        hashParams.get('access_token') ||
        '';

      if (!token) {
        setError('No se recibio token de autenticacion de Google');
        return;
      }

      localStorage.setItem('access_token', token);

      try {
        const perfil = await api.perfil();
        localStorage.setItem(
          'user',
          JSON.stringify({
            id: perfil.usuario_id,
            name: perfil.nombre_completo,
            email: perfil.email,
            roles: perfil.roles,
          })
        );
        navigate('/chat', { replace: true });
      } catch (e) {
        setError(e instanceof Error ? e.message : 'No se pudo completar el inicio de sesion');
      }
    };

    void procesarCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-4">
        {error ? (
          <div className="space-y-3">
            <h1 className="text-xl font-semibold">No se pudo iniciar sesion</h1>
            <p className="text-sm text-red-500">{error}</p>
            <button
              type="button"
              onClick={() => navigate('/', { replace: true })}
              className="px-4 py-2 rounded-md bg-[#4997D0] text-white"
            >
              Volver al inicio
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-[#4997D0]/10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-[#4997D0] animate-spin" />
            </div>
            <h1 className="text-xl font-semibold">Iniciando sesion con Google...</h1>
            <p className="text-sm text-muted-foreground">Estamos validando tu cuenta, espera un momento.</p>
          </div>
        )}
      </div>
    </div>
  );
}
