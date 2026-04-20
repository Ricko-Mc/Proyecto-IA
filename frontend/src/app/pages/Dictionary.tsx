import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { VideoPlayer } from '../components/VideoPlayer';
import { BottomNav } from '../components/BottomNav';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Sheet, SheetContent } from '../components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { BookOpen, Search, Video, Filter, Play, Palette, PawPrint, Apple, Hand } from 'lucide-react';
import { api } from '../../services/api';
import { toYouTubeThumbnailUrl } from '../../services/youtube';
import { MainLayout } from '../layouts/MainLayout';

interface DictionaryWord {
  id: string;
  word: string;
  category: string;
  videoUrl: string | null;
}

const formatearEtiqueta = (valor: string): string =>
  valor
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letra) => letra.toUpperCase());

const convertirEtiquetaACategoria = (valor: string): string =>
  valor.toLowerCase().replaceAll(' ', '_');

export function Dictionary() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [activeSearchQuery, setActiveSearchQuery] = useState('');
  const [selectedWord, setSelectedWord] = useState<DictionaryWord | null>(null);
  const [words, setWords] = useState<DictionaryWord[]>([]);
  const [visibleCount, setVisibleCount] = useState(20);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [slowLoading, setSlowLoading] = useState(false);
  const [pageVisible, setPageVisible] = useState(false);
  const [categoriesPrefetched, setCategoriesPrefetched] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [error, setError] = useState('');
  const [wordsLoaded, setWordsLoaded] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const pageRef = useRef<HTMLDivElement | null>(null);
  const thumbnailCache = useRef<Record<string, boolean>>({});

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    const searchParam = params.get('search');

    if (categoryParam) {
      setSelectedCategory(formatearEtiqueta(categoryParam));
    }
    if (searchParam) {
      setSearchInput(searchParam);
      setActiveSearchQuery(searchParam);
    }

    const cargarCategorias = async () => {
      setLoading(true);
      setError('');
      try {
        const respuestaCategorias = await api.obtenerCategorias();
        const categoriasData = respuestaCategorias.categorias.map((categoria) => formatearEtiqueta(categoria));
        setCategories(categoriasData);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'No se pudo cargar el diccionario');
      } finally {
        setLoading(false);
      }
    };

    void cargarCategorias();
  }, [location.search]);

  useEffect(() => {
    const node = pageRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPageVisible(true);
          observer.disconnect();
        }
      },
      { root: null, threshold: 0.1 }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!pageVisible || categories.length === 0 || categoriesPrefetched) return;

    const rawCategories = categories.map(convertirEtiquetaACategoria);
    void Promise.all(rawCategories.map((categoria) => api.obtenerSignosPorCategoria(categoria)))
      .then(() => setCategoriesPrefetched(true))
      .catch(() => setCategoriesPrefetched(true));
  }, [pageVisible, categories, categoriesPrefetched]);

  useEffect(() => {
    setVisibleCount(20);
  }, [searchPerformed, words.length]);

  const filteredWords = useMemo(
    () =>
      words.filter((word) => {
        const matchesCategory = !selectedCategory || word.category === selectedCategory;
        const matchesSearch = !activeSearchQuery.trim() || word.word.toLowerCase().includes(activeSearchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      }),
    [words, selectedCategory, activeSearchQuery]
  );

  const displayedWords = filteredWords.slice(0, visibleCount);
  const canLoadMore = visibleCount < filteredWords.length;
  const shouldShowResults = searchPerformed;

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 20, filteredWords.length));
  };


  useEffect(() => {
    if (!canLoadMore || !loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleCount((prev) => Math.min(prev + 20, filteredWords.length));
          }
        });
      },
      { rootMargin: '200px', threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [canLoadMore, filteredWords.length]);

  useEffect(() => {
    if (displayedWords.length === 0) return;

    displayedWords.slice(0, 15).forEach((word) => {
      const thumbnailUrl = toYouTubeThumbnailUrl(word.videoUrl);
      if (!thumbnailUrl || thumbnailCache.current[thumbnailUrl]) return;
      const img = new Image();
      img.src = thumbnailUrl;
      thumbnailCache.current[thumbnailUrl] = true;
    });
  }, [displayedWords]);

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'colores':
        return Palette;
      case 'animales':
        return PawPrint;
      case 'alimentos':
        return Apple;
      case 'saludos':
        return Hand;
      default:
        return Video;
    }
  };

  const cargarSignos = async (query: string, category: string | null) => {
    setLoading(true);
    setSlowLoading(false);
    setError('');
    const slowTimer = window.setTimeout(() => setSlowLoading(true), 3000);

    try {
      let respuestaSignos;

      if (category && query) {
        const categoryData = await api.obtenerSignosPorCategoria(category);
        const signosFiltrados = categoryData.signos.filter((signo) =>
          formatearEtiqueta(signo.palabra).toLowerCase().includes(query.toLowerCase())
        );
        respuestaSignos = { ...categoryData, signos: signosFiltrados };
      } else if (category) {
        respuestaSignos = await api.obtenerSignosPorCategoria(category);
      } else if (query) {
        const allSigns = await api.obtenerTodosLosSignos();
        respuestaSignos = {
          ...allSigns,
          signos: allSigns.signos.filter((signo) =>
            formatearEtiqueta(signo.palabra).toLowerCase().includes(query.toLowerCase())
          ),
        };
      } else {
        respuestaSignos = await api.obtenerTodosLosSignos();
      }

      const wordsData: DictionaryWord[] = respuestaSignos.signos.map((signo) => ({
        id: signo.signo_id,
        word: formatearEtiqueta(signo.palabra),
        category: formatearEtiqueta(signo.categoria),
        videoUrl: signo.url_video ?? null,
      }));
      setWords(wordsData);
      setWordsLoaded(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar el diccionario');
    } finally {
      clearTimeout(slowTimer);
      setSlowLoading(false);
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const query = searchInput.trim();
    setActiveSearchQuery(query);
    setSearchPerformed(true);
    void cargarSignos(query, selectedCategory ? convertirEtiquetaACategoria(selectedCategory) : null);
  };

  return (
    <MainLayout
      title="Diccionario"
      activePage="dictionary"
      showClearButton={false}
      onNavbarSearch={setSearchInput}
      onNewConversation={() => navigate('/chat')}
    >
      <div ref={pageRef} className="flex-1 bg-white dark:bg-white">
        <div className="max-w-7xl mx-auto px-3 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8">
          
          <div className="text-center mb-4 md:mb-6 pt-2 md:pt-4">
          <h2 className="text-lg md:text-2xl lg:text-3xl font-semibold mb-1 md:mb-2">
            ¿Qué seña deseas aprender?
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground">
            Explora nuestro diccionario de Lengua de Señas de Guatemala
          </p>
        </div>

        
        <div className="mb-5 md:mb-7">
          <div className="max-w-5xl mx-auto rounded-2xl border border-border dark:border-[#2d2d2d] bg-card dark:bg-[#111111] p-3 md:p-4">
            <div className="grid grid-cols-1 md:grid-cols-[1.35fr_1fr_auto] gap-2 md:gap-3 items-end">
              <div className="space-y-1.5">
                <label className="text-xs md:text-sm font-semibold text-foreground flex items-center gap-2">
                  <Search className="w-4 h-4 text-[#4997D0] dark:text-[#d0d0d0]" />
                  Buscar por palabra
                </label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Ej: agua, tamal, buenos dias..."
                    value={searchInput}
                    onChange={(e) => {
                      setSearchInput(e.target.value);
                      setSelectedCategory('');
                      setActiveSearchQuery('');
                      setSearchPerformed(false);
                      setWords([]);
                      setWordsLoaded(false);
                      setError('');
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        handleSearch();
                      }
                    }}
                    className="h-10 md:h-11 pl-9 pr-3 text-xs md:text-sm bg-background dark:bg-[#171717] border border-border dark:border-[#313131] focus:border-[#4997D0] dark:focus:border-[#4a4a4a]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs md:text-sm font-semibold text-foreground flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#4997D0] dark:text-[#d0d0d0]" />
                  Filtrar por tema
                </label>
                <Select
                  value={selectedCategory}
                  onValueChange={(value) => {
                    setSelectedCategory(value);
                    setSearchInput('');
                    setActiveSearchQuery('');
                    setSearchPerformed(false);
                    setWords([]);
                    setWordsLoaded(false);
                    setError('');
                  }}
                >
                  <SelectTrigger className="h-10 md:h-11 bg-background dark:bg-[#171717] border border-border dark:border-[#313131] text-xs md:text-sm">
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleSearch}
                className="h-10 md:h-11 px-4 md:px-6 bg-[#4997D0] hover:bg-[#3A7FB8] dark:bg-[#1f1f1f] dark:hover:bg-[#2b2b2b] text-white text-xs md:text-sm w-full md:w-auto"
              >
                BUSCAR
              </Button>
            </div>
          </div>
        </div>

        
{shouldShowResults && (
          <div className="mb-3 md:mb-4">
            <h3 className="text-sm md:text-lg font-semibold">
              Resultados ({filteredWords.length})
            </h3>
            {loading ? (
              <p className="text-xs text-muted-foreground mt-1">Cargando diccionario...</p>
            ) : null}
            {slowLoading ? (
              <p className="text-xs text-muted-foreground mt-1">Esto está tardando más de lo normal...</p>
            ) : null}
            {error ? (
              <p className="text-xs text-red-500 mt-1">{error}</p>
            ) : null}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="w-full flex items-center justify-between gap-3 rounded-3xl border border-border bg-white/90 text-left px-4 py-3 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-3xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 w-36 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
                    <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
                  </div>
                </div>
                <div className="h-8 w-20 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
              </div>
            ))}
          </div>
        ) : !shouldShowResults ? (
          <div className="text-center py-10 md:py-16">
            <p className="text-sm text-slate-500">Ingresa una palabra o selecciona una categoría para ver resultados.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayedWords.map((word) => {
              const Icon = getCategoryIcon(word.category);
              return (
                <button
                  key={word.id}
                  onClick={() => setSelectedWord(word)}
                  className="w-full flex items-center justify-between gap-3 rounded-3xl border border-border bg-white/90 text-left px-4 py-3 transition hover:border-[#4997D0] hover:bg-[#f5fbff]"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-3xl bg-[#4997D0]/10 text-[#4997D0]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{word.word}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{word.category}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#4997D0] bg-[#4997D0]/10 px-3 py-2 text-xs font-semibold text-[#1769aa]">
                    <Play className="h-4 w-4" />
                    Ver
                  </span>
                </button>
              );
            })}
            {canLoadMore && (
              <div className="flex flex-col items-center gap-3 py-4">
                <Button
                  onClick={handleLoadMore}
                  className="bg-[#4997D0] hover:bg-[#3A7FB8] dark:bg-[#1f1f1f] dark:hover:bg-[#2b2b2b] text-white text-xs md:text-sm px-5 py-2"
                >
                  Cargar más
                </Button>
                <div ref={loadMoreRef} className="h-1 w-full" />
              </div>
            )}
          </div>
        )}

        {shouldShowResults && !loading && filteredWords.length === 0 && (
          <div className="text-center py-8 md:py-12">
            <p className="text-xs md:text-sm text-muted-foreground">
              No se encontraron resultados para tu búsqueda
            </p>
          </div>
        )}
      </div>

      <Sheet open={!!selectedWord} onOpenChange={() => setSelectedWord(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto p-0 dark:bg-[#101010] dark:border-l-[#2a2a2a]">
          {selectedWord && (
            <div className="h-full flex flex-col">
              <div className="px-5 md:px-6 pt-6 pb-4 border-b border-border dark:border-[#2a2a2a] bg-background/95 dark:bg-[#111111]/95 backdrop-blur">
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                  Diccionario
                </p>
                <h2 className="text-2xl md:text-3xl font-semibold leading-tight">{selectedWord.word}</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Categoria: {selectedWord.category}
                </p>
              </div>

              <div className="flex-1 overflow-y-auto px-5 md:px-6 py-5 space-y-5">
                <div className="rounded-xl border border-border dark:border-[#2a2a2a] bg-card dark:bg-[#151515] p-3 md:p-4">
                  <div className="flex justify-center">
                    {selectedWord.videoUrl ? (
                      <VideoPlayer
                        videoUrl={selectedWord.videoUrl}
                        signLabel={selectedWord.word}
                      />
                    ) : (
                      <div className="bg-muted dark:bg-[#1f1f1f] rounded-lg p-6 text-sm text-muted-foreground text-center w-full">
                        Aun no hay video disponible para esta sena.
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-muted/70 dark:bg-[#1a1a1a] rounded-xl p-4 md:p-5">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                    Recomendacion
                  </p>
                  <p className="text-sm text-foreground leading-relaxed">
                    Esta es la sena para <span className="font-medium">"{selectedWord.word}"</span> en
                    Lengua de Señas de Guatemala. Observa cuidadosamente el movimiento de las manos
                    y repitelo varias veces para mejorar la fluidez.
                  </p>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
      </div>
    </MainLayout>
  );
}