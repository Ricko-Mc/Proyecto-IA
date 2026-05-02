import { useState, useEffect, useRef } from 'react';
import { Textarea } from './ui/textarea';
import { api } from '../../services/api';

interface InputWithSuggestionsProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  maxChars?: number;
  onSelectSuggestion?: (suggestion: string) => void;
}

interface Suggestion {
  palabra: string;
  categoria: string;
}

export function InputWithSuggestions({
  value,
  onChange,
  onKeyDown,
  placeholder = 'Escribe una palabra o frase...',
  maxChars = 500,
  onSelectSuggestion,
}: InputWithSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      const trimmed = value.trim();
      
      if (trimmed.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsLoading(true);
      try {
        const categoriesToSearch = ['abecedario', 'frases_comunes', 'saludos', 'alimentos', 'animales', 'colores'];
        const allSuggestions: Suggestion[] = [];

        for (const categoria of categoriesToSearch) {
          try {
            const resultado = await api.obtenerSignosPorCategoria(categoria);
            if (resultado.signos && Array.isArray(resultado.signos)) {
              resultado.signos.forEach((signo: any) => {
                if (signo.palabra) {
                  // Normalizar para comparación: quitar guiones bajos y minúsculas
                  const palabraNormalizada = signo.palabra.replace(/_/g, ' ').toLowerCase();
                  const query = trimmed.toLowerCase();
                  
                  if (palabraNormalizada.includes(query) || palabraNormalizada.startsWith(query)) {
                    allSuggestions.push({
                      palabra: signo.palabra,   // guardamos el original para la API
                      categoria: categoria,
                    });
                  }
                }
              });
            }
          } catch {
            // Ignorar errores de categoría específica
          }
        }

        const uniqueSuggestions = Array.from(
          new Map(allSuggestions.map(s => [s.palabra.toLowerCase(), s])).values()
        ).sort((a, b) => a.palabra.localeCompare(b.palabra));

        setSuggestions(uniqueSuggestions.slice(0, 6));
        setShowSuggestions(uniqueSuggestions.length > 0);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      onKeyDown?.(e);
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        if (selectedIndex >= 0) {
          e.preventDefault();
          handleSelectSuggestion(suggestions[selectedIndex].palabra);
        } else {
          onKeyDown?.(e);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        break;
      default:
        onKeyDown?.(e);
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    // Al insertar en el input, mostramos sin guiones bajos
    const displayValue = suggestion.replace(/_/g, ' ');
    onChange(displayValue);
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedIndex(-1);
    onSelectSuggestion?.(displayValue);
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (
      suggestionsRef.current &&
      !suggestionsRef.current.contains(e.target as Node) &&
      textareaRef.current &&
      !textareaRef.current.contains(e.target as Node)
    ) {
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper para mostrar la categoría de forma legible
  const formatCategoria = (cat: string) =>
    cat.replace(/_/g, ' ');

  return (
    <div className="relative w-full">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, maxChars))}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="min-h-[34px] md:min-h-[38px] max-h-[96px] resize-none pr-9 md:pr-10 py-2 text-xs md:text-sm leading-[1.35] border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0 dark:text-[#efefef] dark:placeholder:text-[#8c8c8c]"
      />

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-[#2a2a2a] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.palabra}-${index}`}
              onClick={() => handleSelectSuggestion(suggestion.palabra)}
              className={`w-full text-left px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm transition-colors ${
                index === selectedIndex
                  ? 'bg-[#4997D0] text-white'
                  : 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-[#3a3a3a]'
              } ${index !== suggestions.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''}`}
            >
              <div className="flex items-center justify-between gap-2">
                {/* Mostrar palabra sin guiones bajos */}
                <span className="flex-1 truncate">
                  {suggestion.palabra.replace(/_/g, ' ')}
                </span>
                <span className="text-[10px] md:text-xs opacity-60 flex-shrink-0">
                  {formatCategoria(suggestion.categoria)}
                </span>
              </div>
            </button>
          ))}
          {isLoading && (
            <div className="px-3 md:px-4 py-2 text-center text-xs text-gray-500">
              Cargando sugerencias...
            </div>
          )}
        </div>
      )}
    </div>
  );
}