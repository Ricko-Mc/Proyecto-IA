import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Loader2, UserPlus, Users } from 'lucide-react';

import { api } from '../../services/api';
import { RolSistema, UsuarioAdmin } from '../../types';
import { AdminDashboardLayout } from '../components/AdminDashboardLayout';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../components/ui/sheet';

type StoredUser = {
  roles?: string[];
};

const PAGE_SIZE_OPTIONS = [5, 10, 15] as const;

export function AdminUsuarios() {
  const navigate = useNavigate();
  const debounceFiltroRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const filtroInicializadoRef = useRef(false);
  const [roles, setRoles] = useState<RolSistema[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [filtroCorreo, setFiltroCorreo] = useState('');
  const [cargando, setCargando] = useState(true);
  const [cargandoLista, setCargandoLista] = useState(true);
  const [creandoUsuario, setCreandoUsuario] = useState(false);
  const [actualizandoRolEmail, setActualizandoRolEmail] = useState<Record<string, boolean>>({});
  const [error, setError] = useState('');
  const [drawerCrearAbierto, setDrawerCrearAbierto] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [tamanoPagina, setTamanoPagina] = useState<number>(5);

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rolNuevo, setRolNuevo] = useState('usuario');

  const esAdmin = useMemo(() => {
    const raw = localStorage.getItem('user');
    if (!raw) return false;
    try {
      const user = JSON.parse(raw) as StoredUser;
      return Boolean(user.roles?.includes('admin'));
    } catch {
      return false;
    }
  }, []);

  const cargarUsuarios = async (correo?: string) => {
    setCargandoLista(true);
    setError('');
    try {
      const usuariosResp = await api.listarUsuariosAdmin(correo);
      setUsuarios(usuariosResp);
      setPaginaActual(1);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar los usuarios');
    } finally {
      setCargandoLista(false);
    }
  };

  const cargarInicial = async () => {
    setCargando(true);
    setError('');
    try {
      const [rolesResp, usuariosResp] = await Promise.all([
        api.listarRolesSistema(),
        api.listarUsuariosAdmin(),
      ]);

      setRoles(rolesResp);
      setUsuarios(usuariosResp);

      if (rolesResp.length > 0 && !rolesResp.some((rol) => rol.nombre === rolNuevo)) {
        setRolNuevo(rolesResp[0].nombre);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar el módulo de usuarios');
    } finally {
      setCargando(false);
      setCargandoLista(false);
    }
  };

  useEffect(() => {
    if (!esAdmin) {
      navigate('/chat', { replace: true });
      return;
    }
    void cargarInicial();
  }, [esAdmin, navigate]);

  useEffect(() => {
    if (!filtroInicializadoRef.current) {
      filtroInicializadoRef.current = true;
      return;
    }

    if (debounceFiltroRef.current) {
      clearTimeout(debounceFiltroRef.current);
    }

    debounceFiltroRef.current = setTimeout(() => {
      void cargarUsuarios(filtroCorreo.trim() || undefined);
    }, 400);

    return () => {
      if (debounceFiltroRef.current) {
        clearTimeout(debounceFiltroRef.current);
      }
    };
  }, [filtroCorreo]);

  const ejecutarFiltroAhora = () => {
    if (debounceFiltroRef.current) {
      clearTimeout(debounceFiltroRef.current);
    }
    void cargarUsuarios(filtroCorreo.trim() || undefined);
  };

  const handleCrear = async () => {
    if (!nombre.trim() || !email.trim() || !password.trim() || !rolNuevo.trim()) {
      setError('Completa nombre, correo, contraseña y rol');
      return;
    }

    setError('');
    try {
      setCreandoUsuario(true);
      const usuarioCreado = await api.crearUsuarioAdmin({
        nombre_completo: nombre.trim(),
        email: email.trim(),
        password,
        rol: rolNuevo,
      });

      setUsuarios((prev) => {
        const correoFiltro = filtroCorreo.trim().toLowerCase();
        if (correoFiltro && !usuarioCreado.email.toLowerCase().includes(correoFiltro)) {
          return prev;
        }
        return [usuarioCreado, ...prev.filter((u) => u.id !== usuarioCreado.id)];
      });

      setNombre('');
      setEmail('');
      setPassword('');
      setDrawerCrearAbierto(false);
      setPaginaActual(1);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo crear el usuario');
    } finally {
      setCreandoUsuario(false);
    }
  };

  const handleActualizarRol = async (usuarioEmail: string, nuevoRol: string) => {
    const usuariosPrevios = usuarios;
    setUsuarios((prev) =>
      prev.map((usuario) =>
        usuario.email === usuarioEmail ? { ...usuario, rol: nuevoRol } : usuario
      )
    );

    setActualizandoRolEmail((prev) => ({ ...prev, [usuarioEmail]: true }));
    setError('');
    try {
      const actualizado = await api.asignarRolUsuario({ email: usuarioEmail, rol: nuevoRol });
      setUsuarios((prev) =>
        prev.map((usuario) => (usuario.id === actualizado.id ? { ...usuario, ...actualizado } : usuario))
      );
    } catch (e) {
      setUsuarios(usuariosPrevios);
      setError(e instanceof Error ? e.message : 'No se pudo actualizar rol');
    } finally {
      setActualizandoRolEmail((prev) => ({ ...prev, [usuarioEmail]: false }));
    }
  };

  const totalPaginas = Math.max(1, Math.ceil(usuarios.length / tamanoPagina));
  const paginaSegura = Math.min(paginaActual, totalPaginas);
  const inicio = (paginaSegura - 1) * tamanoPagina;
  const fin = inicio + tamanoPagina;
  const usuariosPagina = usuarios.slice(inicio, fin);

  if (!esAdmin) {
    return null;
  }

  return (
    <AdminDashboardLayout
      title="Administración de usuarios"
      subtitle="Gestiona cuentas, roles y acceso sin recargar toda la vista."
      active="usuarios"
      onReload={ejecutarFiltroAhora}
    >
      <div className="space-y-5">
        <div className="flex justify-end">
          <Button
            className="bg-[#4997D0] hover:bg-[#3A7FB8] dark:bg-[#1f1f1f] dark:hover:bg-[#2b2b2b]"
            onClick={() => setDrawerCrearAbierto(true)}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Crear usuario
          </Button>
        </div>

        {error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="rounded-2xl border border-[#d9e9f6] dark:border-[#2a2a2a] bg-white/90 dark:bg-[#111111]/95 backdrop-blur p-4 md:p-5 space-y-4 shadow-[0_12px_34px_-22px_rgba(58,127,184,0.7)] dark:shadow-[0_16px_30px_-20px_rgba(0,0,0,0.7)]">
          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <div className="flex-1 space-y-1.5">
              <Label>Buscar por correo</Label>
              <Input
                value={filtroCorreo}
                onChange={(e) => setFiltroCorreo(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    ejecutarFiltroAhora();
                  }
                }}
                placeholder="ejemplo@dominio.com"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={ejecutarFiltroAhora}>
                Filtrar
              </Button>
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
          </div>

          <div className="flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4 text-[#4997D0] dark:text-[#c8c8c8]" />
              {usuarios.length} usuarios
            </div>
            <Badge variant="outline" className="text-xs border-[#c7ddf0] bg-[#f4f9fd] dark:border-[#3a3a3a] dark:bg-[#1c1c1c] dark:text-[#d4d4d4]">
              Página {paginaSegura} de {totalPaginas}
            </Badge>
          </div>

          {cargando || cargandoLista ? (
            <p className="text-sm text-muted-foreground">Cargando usuarios...</p>
          ) : usuariosPagina.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay usuarios para mostrar.</p>
          ) : (
            <div className="space-y-3">
              {usuariosPagina.map((usuario) => {
                const actualizando = Boolean(actualizandoRolEmail[usuario.email]);
                return (
                <div
                  key={usuario.id}
                  className="rounded-xl border border-[#d5e7f5] dark:border-[#2f2f2f] bg-white dark:bg-[#171717] p-3 md:p-4 transition-shadow hover:shadow-[0_10px_24px_-22px_rgba(58,127,184,0.9)] dark:hover:shadow-[0_10px_20px_-16px_rgba(0,0,0,0.65)]"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">{usuario.nombre_completo}</p>
                      <p className="text-xs text-muted-foreground">{usuario.email}</p>
                    </div>
                    <div className="flex items-center gap-2 min-w-[210px] justify-end">
                      <Select
                        value={usuario.rol}
                        disabled={actualizando}
                        onValueChange={(nuevoRol) => void handleActualizarRol(usuario.email, nuevoRol)}
                      >
                        <SelectTrigger className="w-[170px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((rol) => (
                            <SelectItem key={rol.id} value={rol.nombre}>
                              {rol.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {actualizando ? <Loader2 className="w-4 h-4 animate-spin text-[#4997D0] dark:text-[#d4d4d4]" /> : null}
                    </div>
                  </div>
                </div>
              );
              })}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-[#e4eff8] dark:border-[#2a2a2a] pt-3">
            <p className="text-xs text-muted-foreground">
              Mostrando {usuarios.length === 0 ? 0 : inicio + 1} a {Math.min(fin, usuarios.length)} de {usuarios.length}
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

        <Sheet open={drawerCrearAbierto} onOpenChange={setDrawerCrearAbierto}>
          <SheetContent side="right" className="w-full sm:max-w-md border-l-[#cde1f2] dark:border-l-[#2a2a2a] dark:bg-[#111111]">
            <SheetHeader>
              <SheetTitle>Crear usuario y asignar rol</SheetTitle>
              <SheetDescription>
                Completa los datos y se creará una cuenta con contraseña temporal.
              </SheetDescription>
            </SheetHeader>

            <div className="px-4 space-y-4">
              <div className="space-y-1.5">
                <Label>Nombre completo</Label>
                <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre Apellido" />
              </div>
              <div className="space-y-1.5">
                <Label>Correo</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@dominio.com" />
              </div>
              <div className="space-y-1.5">
                <Label>Contraseña temporal</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo recomendado: 8+" />
              </div>
              <div className="space-y-1.5">
                <Label>Rol</Label>
                <Select value={rolNuevo} onValueChange={setRolNuevo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((rol) => (
                      <SelectItem key={rol.id} value={rol.nombre}>
                        {rol.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={() => void handleCrear()}
                className="w-full bg-[#4997D0] hover:bg-[#3A7FB8]"
                disabled={creandoUsuario}
              >
                {creandoUsuario ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  'Crear usuario'
                )}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </AdminDashboardLayout>
  );
}
