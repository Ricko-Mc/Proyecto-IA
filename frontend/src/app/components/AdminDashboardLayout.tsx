import { ReactNode, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  BookOpen,
  CircleHelp,
  MessageSquare,
  RefreshCw,
  Settings,
  ShieldCheck,
  Users,
} from 'lucide-react';

import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';

type StoredUser = {
  name?: string;
  email?: string;
  roles?: string[];
};

type ModuloActivo = 'reportes' | 'usuarios';

interface AdminDashboardLayoutProps {
  title: string;
  subtitle?: string;
  active: ModuloActivo;
  onReload?: () => void;
  children: ReactNode;
}

function iniciales(nombre?: string): string {
  if (!nombre) return 'U';
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return 'U';
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return `${partes[0][0] ?? ''}${partes[1][0] ?? ''}`.toUpperCase();
}

export function AdminDashboardLayout({
  title,
  subtitle,
  active,
  onReload,
  children,
}: AdminDashboardLayoutProps) {
  const navigate = useNavigate();

  const user = useMemo(() => {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    try {
      return JSON.parse(raw) as StoredUser;
    } catch {
      return null;
    }
  }, []);

  const roles = user?.roles ?? [];
  const esAdmin = roles.includes('admin');
  const esAdminOModerador = esAdmin || roles.includes('moderador');

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#e9f5ff,_#f7fbff_40%,_#ffffff_85%)] p-3 md:p-6">
      <div className="mx-auto flex w-full max-w-7xl gap-4 md:gap-5">
        <aside className="hidden md:flex md:w-[280px] md:flex-col rounded-2xl border border-[#d9e9f6] bg-white/90 backdrop-blur p-3 shadow-[0_18px_36px_-26px_rgba(58,127,184,0.8)]">
          <div className="mb-3 rounded-xl border border-[#e1edf7] bg-[#f5faff] p-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-[#4997D0] text-white text-xs">
                  {iniciales(user?.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{user?.name || 'Usuario'}</p>
                <p className="truncate text-xs text-muted-foreground">{user?.email || ''}</p>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate('/chat')}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Chat
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate('/dictionary')}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Diccionario
            </Button>
            {esAdminOModerador ? (
              <Button
                variant={active === 'reportes' ? 'default' : 'ghost'}
                className={active === 'reportes' ? 'w-full justify-start bg-[#4997D0] hover:bg-[#3A7FB8]' : 'w-full justify-start'}
                onClick={() => navigate('/admin/reportes')}
              >
                <ShieldCheck className="mr-2 h-4 w-4" />
                Solicitudes
              </Button>
            ) : null}
            {esAdmin ? (
              <Button
                variant={active === 'usuarios' ? 'default' : 'ghost'}
                className={active === 'usuarios' ? 'w-full justify-start bg-[#4997D0] hover:bg-[#3A7FB8]' : 'w-full justify-start'}
                onClick={() => navigate('/admin/usuarios')}
              >
                <Users className="mr-2 h-4 w-4" />
                Usuarios
              </Button>
            ) : null}
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate('/settings')}
            >
              <Settings className="mr-2 h-4 w-4" />
              Ajustes
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate('/help')}
            >
              <CircleHelp className="mr-2 h-4 w-4" />
              Ayuda
            </Button>
          </div>
        </aside>

        <main className="flex-1 space-y-4">
          <div className="rounded-2xl border border-[#d9e9f6] bg-white/90 backdrop-blur px-4 py-3 md:px-5 md:py-4 shadow-[0_18px_36px_-26px_rgba(58,127,184,0.8)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="text-lg md:text-xl font-semibold">{title}</h1>
                {subtitle ? <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p> : null}
              </div>
              {onReload ? (
                <Button variant="outline" onClick={onReload}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Recargar
                </Button>
              ) : null}
            </div>
          </div>

          <div className="md:hidden rounded-xl border border-[#d9e9f6] bg-white/90 p-2 flex gap-2 overflow-x-auto">
            <Button variant="outline" size="sm" onClick={() => navigate('/chat')}>
              Chat
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/dictionary')}>
              Diccionario
            </Button>
            {esAdminOModerador ? (
              <Button
                variant={active === 'reportes' ? 'default' : 'outline'}
                size="sm"
                className={active === 'reportes' ? 'bg-[#4997D0] hover:bg-[#3A7FB8]' : ''}
                onClick={() => navigate('/admin/reportes')}
              >
                Solicitudes
              </Button>
            ) : null}
            {esAdmin ? (
              <Button
                variant={active === 'usuarios' ? 'default' : 'outline'}
                size="sm"
                className={active === 'usuarios' ? 'bg-[#4997D0] hover:bg-[#3A7FB8]' : ''}
                onClick={() => navigate('/admin/usuarios')}
              >
                Usuarios
              </Button>
            ) : null}
            <Button variant="outline" size="sm" onClick={() => navigate('/settings')}>
              Ajustes
            </Button>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}
