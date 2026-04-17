import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Menu, Info, Eraser, Search, MessageSquare, BookOpen, Gamepad, ArrowLeft, ArrowRight, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { LocationBadge } from './LocationBadge';
import { api } from '../../services/api';
import type { Signo } from '../../types';
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

const sectionItems = [
  {
    path: '/chat',
    label: 'Chat',
    icon: MessageSquare,
  },
  {
    path: '/dictionary',
    label: 'Diccionario',
    icon: BookOpen,
  },
  {
    path: '/chat',
    label: 'Juego',
    icon: Gamepad,
  },
  {
    path: '/about',
    label: 'Acerca de SEGUA',
    icon: Info,
  },
];

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
  const [helpStep, setHelpStep] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allSigns, setAllSigns] = useState<Signo[]>([]);

  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const placeholder = activePage === 'dictionary' ? 'Buscar signo...' : 'Buscar...';

  const normalizedQuery = searchQuery.toLowerCase().trim();

  const matchingSectionItems = useMemo(
    () =>
      sectionItems.filter((item) =>
        item.label.toLowerCase().includes(normalizedQuery)
      ),
    [normalizedQuery]
  );

  const matchingSignItems = useMemo(
    () =>
      allSigns
        .filter((signo) => signo.palabra.toLowerCase().includes(normalizedQuery))
        .slice(0, 5),
    [allSigns, normalizedQuery]
  );

  const closeSuggestions = () => setShowSuggestions(false);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setShowSuggestions(Boolean(value.trim()));
    if (activePage === 'dictionary') {
      onSearch?.(value);
    }
  };

  const navigateToSection = (path: string) => {
    navigate(path);
    closeSuggestions();
  };

  const navigateToDictionarySearch = (term: string) => {
    navigate(`/dictionary?search=${encodeURIComponent(term)}`);
    setSearchQuery(term);
    setShowSuggestions(false);
  };

  const executeSearch = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    const exactSectionMatch = sectionItems.find(
      (item) => item.label.toLowerCase() === trimmed.toLowerCase()
    );

    if (exactSectionMatch) {
      navigateToSection(exactSectionMatch.path);
      return;
    }

    const exactSignMatch = allSigns.find(
      (signo) => signo.palabra.toLowerCase() === trimmed.toLowerCase()
    );

    if (exactSignMatch) {
      navigateToDictionarySearch(exactSignMatch.palabra);
      return;
    }

    if (matchingSectionItems.length > 0) {
      navigateToSection(matchingSectionItems[0].path);
      return;
    }

    if (matchingSignItems.length > 0) {
      navigateToDictionarySearch(matchingSignItems[0].palabra);
      return;
    }

    if (activePage === 'dictionary') {
      onSearch?.(trimmed);
      closeSuggestions();
    }
  };

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      executeSearch(searchQuery);
    }
  };

  useEffect(() => {
    if (!normalizedQuery || allSigns.length > 0) return;

    let mounted = true;
    api.obtenerTodosLosSignos()
      .then((response) => {
        if (mounted) {
          setAllSigns(response.signos);
        }
      })
      .catch(() => {
        // Ignore load errors for suggestions.
      });

    return () => {
      mounted = false;
    };
  }, [normalizedQuery, allSigns.length]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeSuggestions();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (activePage !== 'dictionary' || !onSearch) return;

    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search') || '';
    if (searchParam) {
      setSearchQuery(searchParam);
      onSearch(searchParam);
      setShowSuggestions(false);
    }
  }, [activePage, location.search, onSearch]);

  const handleInputChange = (value: string) => {
    handleSearchChange(value);
  };

  const helpSteps = [
    {
      image: '/inicio.jpeg',
      title: 'Inicio de SEGUA',
      description:
        'Aquí puedes ver el inicio de la interfaz. Usa el menú para navegar entre el chat, el diccionario y más.',
    },
    {
      image: '/chat.jpeg',
      title: 'Chat interactivo',
      description:
        'Escribe una palabra o frase y el chat te mostrará la seña correspondiente.',
    },
    {
      image: '/videomostrado.png',
      title: 'Video de la seña',
      description:
        'Cuando el sistema encuentre el video, se mostrará aquí para que puedas ver y repetir el movimiento de la seña.',
    },
    {
      image: '/limpiar.jpeg',
      title: 'Limpiar conversación',
      description:
        'Usa esta opción cuando quieras empezar de nuevo y borrar el historial actual del chat.',
    },
    {
      image: '/filtradodiccionario.jpeg',
      title: 'Filtrar diccionario',
      description:
        'Selecciona una categoría para ver solo los signos relacionados con ese tema.',
    },
    {
      image: '/barrabusqueda.jpeg',
      title: 'Barra de búsqueda',
      description:
        'Escribe aquí cualquier palabra para encontrar su seña rápidamente en el diccionario.',
    },
    {
      image: '/sidebar.jpeg',
      title: 'Menú lateral',
      description:
        'Abre el sidebar para cambiar de sección, iniciar una nueva conversación o ver opciones generales.',
    },
  ];

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
                onFocus={() => setShowSuggestions(Boolean(searchQuery.trim()))}
                onKeyDown={handleSearchKeyDown}
                className="h-10 w-full pl-10 pr-3 rounded-full border border-border/30 bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400"
              />
              {showSuggestions && normalizedQuery.length > 0 && (
                <div
                  ref={dropdownRef}
                  className="absolute left-0 right-0 mt-2 overflow-hidden rounded-3xl border border-border/60 bg-white shadow-lg dark:border-slate-700 dark:bg-[#0f172a] z-30"
                >
                  <div className="divide-y divide-slate-200 dark:divide-slate-800">
                    {matchingSectionItems.length > 0 && (
                      <div className="p-2">
                        <p className="px-3 pb-2 text-[11px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                          Secciones
                        </p>
                        {matchingSectionItems.map((item) => {
                          const Icon = item.icon;
                          return (
                            <button
                              key={item.path + item.label}
                              type="button"
                              onClick={() => navigateToSection(item.path)}
                              className="flex w-full items-center gap-3 px-3 py-3 text-left text-sm text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900"
                            >
                              <Icon className="h-4 w-4 text-[#4997D0]" />
                              <span className="truncate">{item.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {matchingSignItems.length > 0 && (
                      <div className="p-2">
                        <p className="px-3 pb-2 text-[11px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                          Signos
                        </p>
                        {matchingSignItems.map((signo) => (
                          <button
                            key={signo.signo_id}
                            type="button"
                            onClick={() => navigateToDictionarySearch(signo.palabra)}
                            className="flex w-full items-center gap-3 px-3 py-3 text-left text-sm text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900"
                          >
                            <BookOpen className="h-4 w-4 text-[#4997D0]" />
                            <div className="min-w-0">
                              <p className="truncate font-medium">{signo.palabra}</p>
                              <p className="truncate text-xs text-slate-500 dark:text-slate-400">Signo</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {matchingSectionItems.length === 0 && matchingSignItems.length === 0 && (
                      <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                        No se encontraron sugerencias para "{searchQuery}".
                      </div>
                    )}
                  </div>
                </div>
              )}
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
            onClick={() => {
              setHelpStep(0);
              setIsInfoOpen(true);
            }}
            title="Información"
          >
            <Info className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <AlertDialog open={isInfoOpen} onOpenChange={setIsInfoOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-start justify-between gap-2">
              <AlertDialogTitle>Guía rápida</AlertDialogTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                onClick={() => setIsInfoOpen(false)}
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </AlertDialogHeader>
          <AlertDialogDescription className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
            <div className="space-y-3">
              <div className="rounded-3xl border border-border bg-slate-50 dark:bg-[#0e1625] p-3">
                <img
                  src={helpSteps[helpStep].image}
                  alt={helpSteps[helpStep].title}
                  className="w-full rounded-2xl object-cover"
                />
              </div>
              <div>
                <p className="text-base font-semibold text-slate-900 dark:text-white">
                  {helpSteps[helpStep].title}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                  {helpSteps[helpStep].description}
                </p>
              </div>
            </div>
          </AlertDialogDescription>
          <AlertDialogFooter className="flex items-center justify-between gap-2">
            <div className="flex-1 text-left">
              <Button
                variant="outline"
                onClick={() => setHelpStep((prev) => Math.max(prev - 1, 0))}
                disabled={helpStep === 0}
                className="rounded-full border border-[#dbe4ef] text-slate-700 dark:border-[#333333] dark:text-[#d4d4d4]"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 text-center text-xs text-slate-500 dark:text-slate-400">
              {helpStep + 1}/{helpSteps.length}
            </div>
            <div className="flex-1 text-right">
              {helpStep < helpSteps.length - 1 ? (
                <Button
                  onClick={() => setHelpStep((prev) => Math.min(prev + 1, helpSteps.length - 1))}
                  className="ml-auto rounded-full bg-[#4997D0] text-white hover:bg-[#3A7FB8]"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <AlertDialogAction className="ml-auto rounded-full bg-[#4997D0] text-white hover:bg-[#3A7FB8]">
                  <X className="h-4 w-4" />
                </AlertDialogAction>
              )}
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
