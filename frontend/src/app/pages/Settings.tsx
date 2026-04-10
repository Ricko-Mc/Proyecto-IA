import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { GuatemalanFlag } from '../components/GuatemalanFlag';
import { BottomNav } from '../components/BottomNav';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { ArrowLeft, Moon, Sun, Monitor, Camera, Trash2, User, ShieldCheck } from 'lucide-react';

type StoredUser = {
  name: string;
  email: string;
  avatar_url?: string | null;
  roles?: string[];
  [key: string]: unknown;
};

export function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/');
      return;
    }
    const parsedUser = JSON.parse(userData) as StoredUser;
    setUser(parsedUser);
    setName(parsedUser.name);
    setEmail(parsedUser.email);
    setAvatarUrl((parsedUser.avatar_url as string | null | undefined) ?? null);

    // Load theme preference
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' || 'system';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, [navigate]);

  const applyTheme = (newTheme: 'light' | 'dark' | 'system') => {
    const root = document.documentElement;
    if (newTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    } else {
      root.classList.toggle('dark', newTheme === 'dark');
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  const handleSave = () => {
    if (!user) return;
    const updatedUser: StoredUser = {
      ...user,
      name,
      email,
      avatar_url: avatarUrl,
    };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    navigate('/chat');
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : null;
      setAvatarUrl(result);
    };
    reader.readAsDataURL(file);

    e.currentTarget.value = '';
  };

  const handleRemovePhoto = () => {
    setAvatarUrl(null);
  };

  if (!user) return null;

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
          <h1 className="text-base font-semibold">Ajustes</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-6">
        <div className="space-y-6">
          {/* Theme Section */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold">Apariencia</h2>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleThemeChange('light')}
                className={`p-3 border rounded-lg flex flex-col items-center gap-2 transition-colors ${
                  theme === 'light'
                    ? 'border-[#4997D0] bg-[#4997D0]/10'
                    : 'border-border hover:bg-muted'
                }`}
              >
                <Sun className="w-5 h-5" />
                <span className="text-xs">Claro</span>
              </button>
              <button
                onClick={() => handleThemeChange('dark')}
                className={`p-3 border rounded-lg flex flex-col items-center gap-2 transition-colors ${
                  theme === 'dark'
                    ? 'border-[#4997D0] bg-[#4997D0]/10'
                    : 'border-border hover:bg-muted'
                }`}
              >
                <Moon className="w-5 h-5" />
                <span className="text-xs">Oscuro</span>
              </button>
              <button
                onClick={() => handleThemeChange('system')}
                className={`p-3 border rounded-lg flex flex-col items-center gap-2 transition-colors ${
                  theme === 'system'
                    ? 'border-[#4997D0] bg-[#4997D0]/10'
                    : 'border-border hover:bg-muted'
                }`}
              >
                <Monitor className="w-5 h-5" />
                <span className="text-xs">Sistema</span>
              </button>
            </div>
          </div>

          {/* User Info Section */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold">Información personal</h2>
            <div className="rounded-xl border border-border p-3 sm:p-4 space-y-3">
              <Label className="text-xs">Foto de perfil</Label>
              <div className="flex items-center gap-3">
                <Avatar className="w-14 h-14 border border-border">
                  <AvatarImage src={avatarUrl ?? undefined} alt="Foto de perfil" />
                  <AvatarFallback className="bg-[#4997D0] text-white">
                    <User className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-wrap gap-2">
                  <Label
                    htmlFor="avatar-upload"
                    className="inline-flex items-center gap-2 h-9 px-3 rounded-md border border-border cursor-pointer text-xs hover:bg-muted"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Subir foto
                  </Label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRemovePhoto}
                    className="h-9 text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                    Quitar
                  </Button>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs">Nombre</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="h-9 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            className="w-full bg-[#4997D0] hover:bg-[#3A7FB8] h-9 text-sm"
          >
            Guardar cambios
          </Button>

          {user.roles?.some((rol) => rol === 'admin' || rol === 'moderador') ? (
            <div className="rounded-xl border border-border p-3 sm:p-4 space-y-2">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#4997D0]" />
                Modo administrador
              </h2>
              <p className="text-xs text-muted-foreground">
                Revisa y gestiona las solicitudes de señas enviadas por los usuarios.
              </p>
              <Button
                onClick={() => navigate('/admin/reportes')}
                variant="outline"
                className="w-full"
              >
                Ir a gestión de solicitudes
              </Button>
              {user.roles?.includes('admin') ? (
                <Button
                  onClick={() => navigate('/admin/usuarios')}
                  variant="outline"
                  className="w-full"
                >
                  Ir a gestión de usuarios
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {/* Bottom Navigation (Mobile only) */}
      <BottomNav />
    </div>
  );
}
