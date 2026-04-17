import { useState, type KeyboardEvent } from 'react';
import { Menu, Info, Eraser, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { LocationBadge } from './LocationBadge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface NavbarProps {
  title: string;
  onToggleSidebar: () => void;
  onClearConversation?: () => void;
  showClearButton?: boolean;
  onSearch?: (query: string) => void;
  activePage?: string;
}

export function Navbar({
  title,
  onToggleSidebar,
  onClearConversation,
  showClearButton = true,
  onSearch,
  activePage,
}: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const placeholder = activePage === 'dictionary' ? 'Buscar signo...' : 'Buscar...';

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    if (activePage === 'dictionary') {
      onSearch?.(value);
    }
  };

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (activePage !== 'dictionary') {
        onSearch?.(searchQuery.trim());
      }
    }
  };

  const navbarClass = activePage === 'dictionary'
    ? 'topbar h-[78px] w-full px-4 md:px-7 flex items-center gap-3 bg-white border-b border-slate-200'
    : 'topbar h-[78px] w-full px-4 md:px-7 flex items-center gap-3 bg-transparent border-b border-black/5 dark:border-white/10';

  return (
    <>
      <div className={navbarClass}>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full text-[#516276] dark:text-[#e4e4e4] hover:bg-transparent hover:text-[#111f33] dark:hover:text-white"
            onClick={onToggleSidebar}
          >
            <Menu className="w-4 h-4" />
          </Button>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold tracking-[0.15px] text-[#111f33] dark:text-[#f2f2f2]">
              {title}
            </p>
          </div>
          <div className="flex-1 min-w-0">
            <div className="relative mx-auto max-w-xl">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder={placeholder}
                value={searchQuery}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="h-10 w-full pl-10 pr-3 rounded-full border border-border/30 bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <LocationBadge />

          {showClearButton && onClearConversation && (
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-[12px] bg-white dark:bg-[#171717] border border-[#dbe4ef] dark:border-[#333333] text-[#75859a] dark:text-[#d4d4d4] hover:bg-[#edf4fc] dark:hover:bg-[#232323]"
              onClick={onClearConversation}
              title="Limpiar conversación"
            >
              <Eraser className="w-4 h-4" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-[12px] bg-white dark:bg-[#171717] border border-[#dbe4ef] dark:border-[#333333] text-[#75859a] dark:text-[#d4d4d4] hover:bg-[#edf4fc] dark:hover:bg-[#232323]"
            onClick={() => setIsInfoOpen(true)}
            title="Información"
          >
            <Info className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <AlertDialog open={isInfoOpen} onOpenChange={setIsInfoOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cómo usar SEGUA?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <p>
              Escribe una palabra o frase en español para ver su seña en Lengua de Señas de Guatemala.
            </p>
            <p>
              Usa las frases sugeridas cuando quieras probar ejemplos rápidos.
            </p>
            <p>
              El diccionario te permite explorar las señas por categorías y encontrar contenido educativo.
            </p>
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cerrar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => setIsInfoOpen(false)}
              className="bg-[#4997D0] text-white hover:bg-[#3A7FB8]"
            >
              Entendido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
