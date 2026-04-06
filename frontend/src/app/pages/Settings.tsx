import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { GuatemalanFlag } from '../components/GuatemalanFlag';
import { BottomNav } from '../components/BottomNav';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ArrowLeft, Moon, Sun, Monitor } from 'lucide-react';

export function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/');
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    setName(parsedUser.name);
    setEmail(parsedUser.email);

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
    const updatedUser = { name, email };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    navigate('/chat');
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
        </div>
      </div>

      {/* Bottom Navigation (Mobile only) */}
      <BottomNav />
    </div>
  );
}
