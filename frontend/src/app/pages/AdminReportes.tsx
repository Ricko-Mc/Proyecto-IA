import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ClipboardCheck, Loader2 } from 'lucide-react';

import { api } from '../../services/api';
import { Reporte } from '../../types';
import { AdminDashboardLayout } from '../components/AdminDashboardLayout';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

const ESTADOS = ['pendiente', 'en_revision', 'resuelto', 'rechazado'] as const;
const PAGE_SIZE_OPTIONS = [5, 10, 15] as const;

type EstadoReporte = (typeof ESTADOS)[number];

type StoredUser = {
  name: string;
  email: string;
  roles?: string[];
};

export function AdminReportes() {
  const navigate = useNavigate();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [tamanoPagina, setTamanoPagina] = useState<number>(5);
  const [paginaActual, setPaginaActual] = useState(1);
  const [actualizandoEstado, setActualizandoEstado] = useState<Record<string, boolean>>({});
  const [error, setError] = useState('');

  const esAdminOModerador = useMemo(
    () => Boolean(user?.roles?.some((rol) => rol === 'admin' || rol === 'moderador')),
    [user]
  );

  const cargarReportes = async (estado?: string) => {
    setCargando(true);
    setError('');
    try {
      const data = await api.listarReportes(estado);
      setReportes(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar los reportes');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    const userRaw = localStorage.getItem('user');
    if (!userRaw) {
      navigate('/', { replace: true });
      return;
    }

    const parsed = JSON.parse(userRaw) as StoredUser;
    setUser(parsed);

    const tieneRol = parsed.roles?.some((rol) => rol === 'admin' || rol === 'moderador');
    if (!tieneRol) {
      navigate('/chat', { replace: true });
      return;
    }

    void cargarReportes();
  }, [navigate]);

  const aplicarFiltro = async (estado: string) => {
    setFiltroEstado(estado);
    setPaginaActual(1);
    if (estado === 'todos') {
      await cargarReportes();
      return;
    }
    await cargarReportes(estado);
  };

  const actualizarEstado = async (reporteId: string, estado: EstadoReporte) => {
    const reportesPrevios = reportes;
    setReportes((prev) =>
      prev.map((reporte) =>
        reporte.id === reporteId ? { ...reporte, estado } : reporte
      )
    );
    setActualizandoEstado((prev) => ({ ...prev, [reporteId]: true }));

    try {
      const actualizado = await api.actualizarReporte(reporteId, { estado });
      setReportes((prev) =>
        prev.map((reporte) => (reporte.id === reporteId ? { ...reporte, ...actualizado } : reporte))
      );
    } catch (e) {
      setReportes(reportesPrevios);
      setError(e instanceof Error ? e.message : 'No se pudo actualizar el reporte');
    } finally {
      setActualizandoEstado((prev) => ({ ...prev, [reporteId]: false }));
    }
  };

  const totalPaginas = Math.max(1, Math.ceil(reportes.length / tamanoPagina));
  const paginaSegura = Math.min(paginaActual, totalPaginas);
  const inicio = (paginaSegura - 1) * tamanoPagina;
  const fin = inicio + tamanoPagina;
  const reportesPagina = reportes.slice(inicio, fin);

  const badgeEstado = (estado: string) => {
    if (estado === 'resuelto') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (estado === 'en_revision') return 'bg-amber-50 text-amber-700 border-amber-200';
    if (estado === 'rechazado') return 'bg-rose-50 text-rose-700 border-rose-200';
    return 'bg-sky-50 text-sky-700 border-sky-200';
  };

  if (!user || !esAdminOModerador) {
    return null;
  }

  return (
    <AdminDashboardLayout
      title="Solicitudes de seña"
      subtitle="Revisa, prioriza y actualiza el estado de cada solicitud."
      active="reportes"
      onReload={() => void aplicarFiltro(filtroEstado)}
    >
      <div className="space-y-5">

        {error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="rounded-2xl border border-[#d9e9f6] bg-white/90 backdrop-blur p-4 md:p-5 space-y-4 shadow-[0_12px_34px_-22px_rgba(58,127,184,0.7)]">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-wrap gap-2">
              {['todos', ...ESTADOS].map((estado) => (
                <Button
                  key={estado}
                  variant={filtroEstado === estado ? 'default' : 'outline'}
                  className={filtroEstado === estado ? 'bg-[#4997D0] hover:bg-[#3A7FB8]' : ''}
                  onClick={() => void aplicarFiltro(estado)}
                >
                  {estado}
                </Button>
              ))}
            </div>

            <div className="space-y-1.5 min-w-[120px]">
              <Label>Mostrar</Label>
              <Select
                value={String(tamanoPagina)}
                onValueChange={(value) => {
                  setTamanoPagina(Number(value));
                  setPaginaActual(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((opcion) => (
                    <SelectItem key={opcion} value={String(opcion)}>
                      {opcion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ClipboardCheck className="w-4 h-4 text-[#4997D0]" />
              {reportes.length} solicitudes
            </div>
            <Badge variant="outline" className="text-xs border-[#c7ddf0] bg-[#f4f9fd]">
              Página {paginaSegura} de {totalPaginas}
            </Badge>
          </div>

          {cargando ? (
            <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">Cargando reportes...</div>
          ) : reportesPagina.length === 0 ? (
            <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
              No hay solicitudes para mostrar.
            </div>
          ) : (
            <div className="space-y-3">
              {reportesPagina.map((reporte) => {
                const actualizando = Boolean(actualizandoEstado[reporte.id]);
                return (
                <div
                  key={reporte.id}
                  className="rounded-xl border border-[#d5e7f5] bg-white p-4 space-y-3 transition-shadow hover:shadow-[0_10px_24px_-22px_rgba(58,127,184,0.9)]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">{reporte.signo_id}</p>
                      <p className="text-xs text-muted-foreground">Motivo: {reporte.motivo}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full border ${badgeEstado(reporte.estado)}`}>
                      {reporte.estado}
                    </span>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Creado: {new Date(reporte.created_at).toLocaleString()}
                  </div>

                  <div className="flex items-center gap-2">
                    <Select
                      value={reporte.estado}
                      onValueChange={(estado) => void actualizarEstado(reporte.id, estado as EstadoReporte)}
                      disabled={actualizando}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ESTADOS.map((estado) => (
                          <SelectItem key={estado} value={estado}>
                            {estado}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {actualizando ? <Loader2 className="w-4 h-4 animate-spin text-[#4997D0]" /> : null}
                  </div>
                </div>
              );
              })}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-[#e4eff8] pt-3">
            <p className="text-xs text-muted-foreground">
              Mostrando {reportes.length === 0 ? 0 : inicio + 1} a {Math.min(fin, reportes.length)} de {reportes.length}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaginaActual((prev) => Math.max(1, prev - 1))}
                disabled={paginaSegura <= 1}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaginaActual((prev) => Math.min(totalPaginas, prev + 1))}
                disabled={paginaSegura >= totalPaginas}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
