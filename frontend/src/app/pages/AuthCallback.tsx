
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Loader2, X, AlertCircle, ArrowLeft } from 'lucide-react';
import { api } from '../../services/api';

export function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [reporteEmail, setReporteEmail] = useState('');
  const [reporteMensaje, setReporteMensaje] = useState('');

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
    <div className="min-h-screen bg-gradient-to-br from-[#e0e7ff] to-[#f8fafc] dark:from-[#0a0a0a] dark:to-[#23272f] flex items-center justify-center p-6 relative">
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-[#111827] rounded-3xl shadow-2xl p-6 w-full max-w-md relative">
            <button
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:text-slate-300 dark:hover:text-white"
              onClick={() => setModalAbierto(false)}
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-center gap-4">
              <img src="/no.png" alt="Reportar problema" className="w-16 h-16 object-contain" />
              <div className="text-center">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Reportar problema</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Ingresa el Gmail y describe el problema para que podamos ayudarte.
                </p>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Gmail
                <input
                  type="email"
                  value={reporteEmail}
                  onChange={(event) => setReporteEmail(event.target.value)}
                  placeholder="tu-email@gmail.com"
                  className="mt-2 w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:border-blue-500 dark:focus:ring-blue-900"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Detalle del mensaje
                <textarea
                  value={reporteMensaje}
                  onChange={(event) => setReporteMensaje(event.target.value)}
                  placeholder="Explica qué ocurrió y cuál es el error"
                  className="mt-2 w-full min-h-[110px] rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:border-blue-500 dark:focus:ring-blue-900"
                />
              </label>
            </div>
            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                className="flex-1 rounded-full border border-slate-200 bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition"
                onClick={() => setModalAbierto(false)}
              >
                Cancelar
              </button>
              <button
                className="flex-1 rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition"
                onClick={() => setModalAbierto(false)}
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-md w-full text-center space-y-6 px-4 py-6">
        {error ? (
          <>
            <img
              src="/no.png"
              alt="No se pudo iniciar sesion"
              className="mx-auto mb-6 w-[190px] h-[190px] object-contain"
            />
            <h1 className="text-3xl font-bold text-slate-900 dark:text-[#f8fafc] mb-2">No se pudo iniciar sesión</h1>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-6">{error}</p>
            <div className="flex flex-col items-center justify-center gap-3">
              <span
                className="flex items-center justify-center gap-2 cursor-pointer w-full max-w-xs px-5 py-3 rounded-full bg-slate-100/90 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium transition hover:bg-slate-200 dark:hover:bg-slate-700"
                onClick={() => setModalAbierto(true)}
              >
                <AlertCircle className="w-4 h-4 text-slate-500 dark:text-slate-300" />
                Reportar problema
              </span>
              <span
                className="flex items-center justify-center gap-2 cursor-pointer w-full max-w-xs px-5 py-3 rounded-full bg-blue-600 text-white text-sm font-semibold shadow-lg shadow-blue-200/20 hover:bg-blue-700 transition"
                onClick={() => navigate('/', { replace: true })}
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al inicio
              </span>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-[#4997D0]/10 dark:bg-[#1a1a1a] flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-[#4997D0] dark:text-[#7a7a7a] animate-spin" />
            </div>
            <h1 className="text-xl font-semibold dark:text-[#efefef]">Iniciando sesión con Google...</h1>
            <p className="text-sm text-muted-foreground dark:text-[#8d8d8d]">Estamos validando tu cuenta, espera un momento.</p>
          </div>
        )}
      </div>
    </div>
  );
}
