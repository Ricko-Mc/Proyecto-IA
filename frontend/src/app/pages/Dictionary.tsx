import { useState } from 'react';
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
import { ArrowLeft, Search, BookOpen, Filter } from 'lucide-react';
import logoImage from "../../assets/e41c511fb5325848e3b94c419443d02ff6cd7e02.png";

interface DictionaryWord {
  id: string;
  word: string;
  category: string;
  videoUrl: string;
}

const CATEGORIES = [
  'Todos',
  'Abecedario',
  'Saludos',
  'Colores',
  'Números',
  'Familia',
  'Emociones',
  'Animales',
  'Alimentos',
  'Verbos comunes'
];

const DICTIONARY_WORDS: DictionaryWord[] = [
  { id: '1', word: 'Hola', category: 'Saludos', videoUrl: 'hola.mp4' },
  { id: '2', word: 'Buenos días', category: 'Saludos', videoUrl: 'buenos-dias.mp4' },
  { id: '3', word: 'Buenas tardes', category: 'Saludos', videoUrl: 'buenas-tardes.mp4' },
  { id: '4', word: 'Buenas noches', category: 'Saludos', videoUrl: 'buenas-noches.mp4' },
  { id: '5', word: 'Gracias', category: 'Saludos', videoUrl: 'gracias.mp4' },
  { id: '6', word: 'Por favor', category: 'Saludos', videoUrl: 'por-favor.mp4' },
  { id: '7', word: 'Adiós', category: 'Saludos', videoUrl: 'adios.mp4' },
  { id: '8', word: 'A', category: 'Abecedario', videoUrl: 'letra-a.mp4' },
  { id: '9', word: 'B', category: 'Abecedario', videoUrl: 'letra-b.mp4' },
  { id: '10', word: 'C', category: 'Abecedario', videoUrl: 'letra-c.mp4' },
  { id: '11', word: 'Rojo', category: 'Colores', videoUrl: 'rojo.mp4' },
  { id: '12', word: 'Azul', category: 'Colores', videoUrl: 'azul.mp4' },
  { id: '13', word: 'Verde', category: 'Colores', videoUrl: 'verde.mp4' },
  { id: '14', word: 'Amarillo', category: 'Colores', videoUrl: 'amarillo.mp4' },
  { id: '15', word: 'Uno', category: 'Números', videoUrl: 'uno.mp4' },
  { id: '16', word: 'Dos', category: 'Números', videoUrl: 'dos.mp4' },
  { id: '17', word: 'Tres', category: 'Números', videoUrl: 'tres.mp4' },
  { id: '18', word: 'Mamá', category: 'Familia', videoUrl: 'mama.mp4' },
  { id: '19', word: 'Papá', category: 'Familia', videoUrl: 'papa.mp4' },
  { id: '20', word: 'Hermano', category: 'Familia', videoUrl: 'hermano.mp4' },
  { id: '21', word: 'Feliz', category: 'Emociones', videoUrl: 'feliz.mp4' },
  { id: '22', word: 'Triste', category: 'Emociones', videoUrl: 'triste.mp4' },
  { id: '23', word: 'Enojado', category: 'Emociones', videoUrl: 'enojado.mp4' },
  { id: '24', word: 'Perro', category: 'Animales', videoUrl: 'perro.mp4' },
  { id: '25', word: 'Gato', category: 'Animales', videoUrl: 'gato.mp4' },
];

interface DictionaryLayoutProps {
  onBack: () => void;
  children: React.ReactNode;
}

function DictionaryLayout({ onBack, children }: DictionaryLayoutProps) {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <div className="border-b border-border bg-background sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-14 md:h-16 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8 md:h-10 md:w-10 transition-all duration-200 ease-in-out">
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
          </Button>
          <img
            src={logoImage}
            alt="SEGUA"
            className="h-7 md:h-8 w-auto"
          />
          <div className="flex-1">
            <h1 className="text-sm md:text-base font-semibold flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-[#4997D0]" />
              Diccionario SEGUA
            </h1>
          </div>
        </div>
      </div>

      {children}

      {/* Bottom Navigation (Mobile only) */}
      <BottomNav />
    </div>
  );
}

export function Dictionary() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWord, setSelectedWord] = useState<DictionaryWord | null>(null);

  const filteredWords = DICTIONARY_WORDS.filter((word) => {
    const matchesCategory = selectedCategory === 'Todos' || word.category === selectedCategory;
    const matchesSearch = word.word.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleBack = () => {
    navigate('/chat');
  };

  const handleSearch = () => {
    // Search is already applied in real-time
  };

  return (
    <DictionaryLayout onBack={handleBack}>
      <div className="max-w-7xl mx-auto px-3 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8">
        {/* Title Section */}
        <div className="text-center mb-4 md:mb-6 pt-2 md:pt-4">
          <h2 className="text-lg md:text-2xl lg:text-3xl font-semibold mb-1 md:mb-2">
            ¿Qué seña deseas aprender?
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground">
            Explora nuestro diccionario de Lengua de Señas de Guatemala
          </p>
        </div>

        {/* Main Search Bar */}
        <div className="mb-4 md:mb-6">
          <div className="relative max-w-3xl mx-auto">
            <Search className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por palabra..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 md:h-12 pl-9 md:pl-11 pr-3 md:pr-4 text-xs md:text-sm bg-background border-2 border-border focus:border-[#4997D0] rounded-lg md:rounded-xl"
            />
          </div>
        </div>

        {/* Divider with "O" */}
        <div className="relative py-3 md:py-4 mb-3 md:mb-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-border"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 md:px-4 bg-background text-lg md:text-xl lg:text-2xl font-semibold text-muted-foreground">
              Ó
            </span>
          </div>
        </div>

        {/* Filter by Category */}
        <div className="mb-4 md:mb-6">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="w-4 h-4 md:w-5 md:h-5 text-[#4997D0]" />
              <label className="text-xs md:text-sm font-semibold text-foreground">
                Buscar por tema
              </label>
            </div>
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-9 md:h-10 bg-background border-2 border-border text-xs md:text-sm flex-1">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleSearch}
                className="h-9 md:h-10 px-3 md:px-6 bg-[#4997D0] hover:bg-[#3A7FB8] text-white text-xs md:text-sm"
              >
                BUSCAR
              </Button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-3 md:mb-4">
          <h3 className="text-sm md:text-lg font-semibold">
            Resultados ({filteredWords.length})
          </h3>
        </div>

        {/* Word Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3 scroll-smooth">
          {filteredWords.map((word) => (
            <button
              key={word.id}
              onClick={() => setSelectedWord(word)}
              className="group bg-muted hover:bg-accent rounded-lg md:rounded-xl p-2 md:p-3 transition-all duration-200 ease-in-out hover:shadow-md border border-border hover:border-[#4997D0]"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              <div className="aspect-square bg-gradient-to-br from-[#4997D0] to-[#2B5F8F] rounded-lg mb-2 flex items-center justify-center">
                <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <p className="font-medium text-[11px] md:text-xs mb-1 group-hover:text-[#4997D0] transition-colors duration-200 line-clamp-2">
                {word.word}
              </p>
              <p className="text-[9px] md:text-xs text-muted-foreground line-clamp-1">{word.category}</p>
            </button>
          ))}
        </div>

        {filteredWords.length === 0 && (
          <div className="text-center py-8 md:py-12">
            <p className="text-xs md:text-sm text-muted-foreground">
              No se encontraron resultados para tu búsqueda
            </p>
          </div>
        )}
      </div>

      {/* Word Detail Sheet */}
      <Sheet open={!!selectedWord} onOpenChange={() => setSelectedWord(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          {selectedWord && (
            <div className="space-y-6 pt-6">
              <div>
                <h2 className="text-2xl font-semibold mb-2">{selectedWord.word}</h2>
                <p className="text-sm text-muted-foreground">
                  Categoría: {selectedWord.category}
                </p>
              </div>

              <div className="flex justify-center">
                <VideoPlayer
                  videoUrl={selectedWord.videoUrl}
                  signLabel={selectedWord.word}
                />
              </div>

              <div className="bg-muted rounded-lg p-4">
                <p className="text-sm text-foreground">
                  Esta es la seña para <span className="font-medium">"{selectedWord.word}"</span> en
                  Lengua de Señas de Guatemala. Observa cuidadosamente el movimiento de las manos
                  y practica hasta que te sientas cómodo.
                </p>
              </div>

              <Button
                onClick={() => setSelectedWord(null)}
                className="w-full bg-[#4997D0] hover:bg-[#3A7FB8]"
              >
                Cerrar
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </DictionaryLayout>
  );
}