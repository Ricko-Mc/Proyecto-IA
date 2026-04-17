import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
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


export function Dictionary() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWord, setSelectedWord] = useState<DictionaryWord | null>(null);
  const [words, setWords] = useState<DictionaryWord[]>([]);
  const [categories, setCategories] = useState<string[]>(['Todos']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarDiccionario = async () => {
      setLoading(true);
      setError('');
      try {
        const [respuestaSignos, respuestaCategorias] = await Promise.all([
          api.obtenerTodosLosSignos(),
          api.obtenerCategorias(),
        ]);

        const wordsData: DictionaryWord[] = respuestaSignos.signos.map((signo) => ({
          id: signo.signo_id,
          word: formatearEtiqueta(signo.palabra),
          category: formatearEtiqueta(signo.categoria),
          videoUrl: signo.url_video ?? null,
        }));

        const categoriasData = respuestaCategorias.categorias.map((categoria) => formatearEtiqueta(categoria));

        setWords(wordsData);
        setCategories(categoriasData);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'No se pudo cargar el diccionario');
      } finally {
        setLoading(false);
      }
    };

    void cargarDiccionario();
  }, []);

  const filteredWords = useMemo(
    () =>
      words.filter((word) => {
        const matchesCategory = !selectedCategory || word.category === selectedCategory;
        const matchesSearch = !searchQuery.trim() || word.word.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      }),
    [words, selectedCategory, searchQuery]
  );

  const shouldShowResults = searchQuery.trim().length > 0 || selectedCategory !== '';

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

  const handleSearch = () => {
    // The dictionary filters in real time via the navbar and local search input.
  };

  return (
    <MainLayout
      title="Diccionario"
      activePage="dictionary"
      showClearButton={false}
      onNavbarSearch={setSearchQuery}
      onNewConversation={() => navigate('/chat')}
    >
      <div className="flex-1 bg-white dark:bg-white">
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
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-10 md:h-11 pl-9 pr-3 text-xs md:text-sm bg-background dark:bg-[#171717] border border-border dark:border-[#313131] focus:border-[#4997D0] dark:focus:border-[#4a4a4a]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs md:text-sm font-semibold text-foreground flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#4997D0] dark:text-[#d0d0d0]" />
                  Filtrar por tema
                </label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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

        
        <div className="mb-3 md:mb-4">
          <h3 className="text-sm md:text-lg font-semibold">
            Resultados ({filteredWords.length})
          </h3>
          {loading ? (
            <p className="text-xs text-muted-foreground mt-1">Cargando diccionario...</p>
          ) : null}
          {error ? (
            <p className="text-xs text-red-500 mt-1">{error}</p>
          ) : null}
        </div>

        {!shouldShowResults ? (
          <div className="text-center py-10 md:py-16">
            <p className="text-sm text-slate-500">Ingresa una palabra o selecciona una categoría para ver resultados.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredWords.map((word) => {
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