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
import { ArrowLeft, BookOpen, Search, Video, Filter } from 'lucide-react';
import { api } from '../../services/api';

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

interface DictionaryLayoutProps {
  onBack: () => void;
  children: React.ReactNode;
}

function DictionaryLayout({ onBack, children }: DictionaryLayoutProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-[#020617] pb-20 md:pb-0">
      
      <div className="sticky top-0 z-10 border-b border-black/5 dark:border-white/10 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 md:px-7 h-[72px] flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-9 w-9 rounded-[10px] bg-white dark:bg-[#1a1a1a] border border-[#dbe4ef] dark:border-[#333333] text-[#516276] dark:text-[#e4e4e4] hover:bg-[#eef4fc] dark:hover:bg-[#262626] transition-all duration-200 ease-in-out"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
          </Button>
          <img src="/logo_black.png" alt="SEGUA Logo" className="h-8 w-auto md:h-10" />
          <div className="flex-1">
            <h1 className="text-sm md:text-base font-semibold flex items-center gap-2 text-[#111f33] dark:text-[#f2f2f2]" style={{ fontFamily: 'Poppins, sans-serif' }}>
              <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-[#4997D0] dark:text-[#dcdcdc]" />
              Diccionario SEGUA
            </h1>
          </div>
        </div>
      </div>

      {children}

      
      <BottomNav />
    </div>
  );
}

export function Dictionary() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('Todos');
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

        const categoriasData = [
          'Todos',
          ...respuestaCategorias.categorias.map((categoria) => formatearEtiqueta(categoria)),
        ];

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
        const matchesCategory = selectedCategory === 'Todos' || word.category === selectedCategory;
        const matchesSearch = word.word.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      }),
    [words, selectedCategory, searchQuery]
  );

  const handleBack = () => {
    navigate('/chat');
  };

  const handleSearch = () => {
  };

  return (
    <DictionaryLayout onBack={handleBack}>
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

        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-2 scroll-smooth">
          {filteredWords.map((word) => (
            <button
              key={word.id}
              onClick={() => setSelectedWord(word)}
              className="group bg-muted dark:bg-[#171717] hover:bg-accent dark:hover:bg-[#1f1f1f] rounded-xl p-2 md:p-2 transition-all duration-200 ease-in-out hover:shadow-md border border-border dark:border-[#2d2d2d] hover:border-[#4997D0] dark:hover:border-[#404040]"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              <div className="aspect-square bg-gradient-to-br from-[#4997D0] to-[#2B5F8F] dark:from-[#232323] dark:to-[#151515] rounded-xl mb-2 p-2 md:p-3 flex items-center justify-center">
                <Video className="w-6 h-6 text-white" />
              </div>
              <p className="font-medium text-[11px] md:text-xs mb-1 group-hover:text-[#4997D0] dark:group-hover:text-[#d0d0d0] transition-colors duration-200 line-clamp-2">
                {word.word}
              </p>
              <p className="text-[9px] md:text-xs text-muted-foreground line-clamp-1">{word.category}</p>
            </button>
          ))}
        </div>

        {!loading && filteredWords.length === 0 && (
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
    </DictionaryLayout>
  );
}