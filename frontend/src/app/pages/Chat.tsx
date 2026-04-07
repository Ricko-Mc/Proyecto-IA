import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Sidebar, Conversation } from '../components/Sidebar';
import { ChatMessage, Message } from '../components/ChatMessage';
import { GuatemalanFlag } from '../components/GuatemalanFlag';
import { LocationBadge } from '../components/LocationBadge';
import { WordNotFoundDialog } from '../components/WordNotFoundDialog';
import { BottomNav } from '../components/BottomNav';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Sheet, SheetContent } from '../components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { Send, Menu, Trash2, Eraser, BookOpen, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { UserProfileDropdown } from '../components/UserProfileDropdown';
import { api } from '../../services/api';


const WELCOME_PHRASES = [
  "Hola, ¿cómo estás?",
  "Buenos días",
  "Gracias",
  "Por favor",
  "Te quiero"
];

// Real videos from Firebase
const VIDEO_URLS: Record<string, string> = {
  'conejo': 'https://firebasestorage.googleapis.com/v0/b/lensegua-20316.appspot.com/o/00003%2F00011%2Fconejo.webm?alt=media&token=34084c16-5095-4707-8875-4028b7df5e12',
  'buenos días': 'https://firebasestorage.googleapis.com/v0/b/lensegua-20316.appspot.com/o/00003%2F00012%2Fbuenos%20di%CC%81as.webm?alt=media&token=4772ec8f-c69e-4852-bf15-32b0fe278bfb',
  'cómo estás': 'https://firebasestorage.googleapis.com/v0/b/lensegua-20316.appspot.com/o/00003%2F00012%2Fcomo%20esta%CC%81s.webm?alt=media&token=190cd44c-1be8-42c4-9aaa-f829e4067848',
  'hola': 'https://firebasestorage.googleapis.com/v0/b/lensegua-20316.appspot.com/o/00003%2F00012%2Fbuenos%20di%CC%81as.webm?alt=media&token=4772ec8f-c69e-4852-bf15-32b0fe278bfb',
};

// Default example messages with carousel
const EXAMPLE_MESSAGES: Message[] = [
  {
    id: 'demo-1',
    type: 'user',
    text: 'buenos días cómo estás'
  },
  {
    id: 'demo-2',
    type: 'system',
    text: '',
    videos: [
      { word: 'Buenos días', videoUrl: VIDEO_URLS['buenos días'] },
      { word: 'Cómo estás', videoUrl: VIDEO_URLS['cómo estás'] }
    ]
  }
];

export function Chat() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [notFoundWord, setNotFoundWord] = useState('');
  const [showNotFoundDialog, setShowNotFoundDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [conversationToDelete, setConversationToDelete] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/');
      return;
    }
    setUser(JSON.parse(userData));

    // Start with no conversations - show welcome screen
    setConversations([]);
    setCurrentConversationId('');
    setMessages([]);
  }, [navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleNewConversation = () => {
    setCurrentConversationId('');
    setMessages([]);
  };

  const handleSelectConversation = (id: string) => {
    setCurrentConversationId(id);
    // Load default messages for demo conversation
    if (id === 'conv-default') {
      setMessages(EXAMPLE_MESSAGES);
    } else {
      setMessages([]);
    }
  };

  const handleDeleteConversation = () => {
    if (!conversationToDelete) return;
    setConversations(conversations.filter(c => c.id !== conversationToDelete));
    if (currentConversationId === conversationToDelete) {
      setCurrentConversationId('');
      setMessages([]);
    }
    setConversationToDelete('');
    setShowDeleteDialog(false);
  };

  const handleDeleteConversationFromSidebar = (id: string) => {
    setConversationToDelete(id);
    setShowDeleteDialog(true);
  };

  const handleClearConversation = () => {
    setMessages([]);
    // Update conversation timestamp
    if (currentConversationId) {
      setConversations(prev =>
        prev.map(conv =>
          conv.id === currentConversationId
            ? { ...conv, lastMessage: '', timestamp: new Date() }
            : conv
        )
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    navigate('/');
  };

  const handleRequestWord = (word: string) => {
    setNotFoundWord(word);
    setShowNotFoundDialog(true);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const mensajeActual = inputText;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      type: 'user',
      text: mensajeActual
    };

    setMessages((prev) => [...prev, userMessage]);

    // Simulate processing
    const loadingMessage: Message = {
      id: `msg-${Date.now()}-loading`,
      type: 'system',
      text: '',
      isLoading: true
    };

    setMessages(prev => [...prev, loadingMessage]);

    try {
      const respuesta = await api.chat(mensajeActual, currentConversationId || undefined);

      if (!currentConversationId && respuesta.conversacion_id) {
        setCurrentConversationId(respuesta.conversacion_id);
        const nuevaConv: Conversation = {
          id: respuesta.conversacion_id,
          name: mensajeActual.slice(0, 30),
          lastMessage: mensajeActual,
          timestamp: new Date(),
        };
        setConversations((prev) => [nuevaConv, ...prev]);
      }

      setMessages(prev => {
        const filtered = prev.filter(m => !m.isLoading);
        const textoAsistente = respuesta.url_video
          ? respuesta.respuesta_ia
          : `${respuesta.respuesta_ia}\n\nAun no hay video disponible para esta sena.`;
        const systemMessage: Message = respuesta.signo_encontrado
          ? {
              id: `msg-${Date.now()}-response`,
              type: 'system',
              text: textoAsistente,
              videoUrl: respuesta.url_video || undefined,
              signLabel: respuesta.palabra_clave || undefined,
            }
          : {
              id: `msg-${Date.now()}-response`,
              type: 'system',
              text: respuesta.respuesta_ia,
              notFound: true,
              notFoundWord: mensajeActual,
            };
        return [...filtered, systemMessage];
      });
    } catch (_error) {
      setMessages(prev => {
        const filtered = prev.filter(m => !m.isLoading);
        return [
          ...filtered,
          {
            id: `msg-${Date.now()}-error`,
            type: 'system',
            text: '',
            notFound: true,
            notFoundWord: 'No se pudo conectar con el backend',
          },
        ];
      });
    }

    // Update conversation
    if (currentConversationId) {
      setConversations(prev =>
        prev.map(conv =>
          conv.id === currentConversationId
            ? { 
                ...conv,
                lastMessage: mensajeActual,
                name: messages.length === 0 ? mensajeActual.slice(0, 30) : conv.name,
                timestamp: new Date()
              }
            : conv
        )
      );
    }

    setInputText('');
  };

  const handleTryPhrase = (phrase: string) => {
    setInputText(phrase);
  };

  const handleOpenDictionary = () => {
    navigate('/dictionary');
  };

  if (!user) return null;

  const showWelcome = messages.length === 0;
  const charCount = inputText.length;
  const maxChars = 500;

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 lg:w-80">
        <Sidebar
          conversations={conversations}
          currentConversationId={currentConversationId}
          userName={user.name}
          userEmail={user.email}
          onNewConversation={handleNewConversation}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversationFromSidebar}
          onLogout={handleLogout}
        />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-72">
          <Sidebar
            conversations={conversations}
            currentConversationId={currentConversationId}
            userName={user.name}
            userEmail={user.email}
            onNewConversation={handleNewConversation}
            onSelectConversation={handleSelectConversation}
            onDeleteConversation={handleDeleteConversationFromSidebar}
            onLogout={handleLogout}
            isMobile={true}
            onClose={() => setIsMobileMenuOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar conversación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente esta conversación
              y todos sus mensajes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConversation}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Word Not Found Dialog */}
      <WordNotFoundDialog
        word={notFoundWord}
        open={showNotFoundDialog}
        onOpenChange={setShowNotFoundDialog}
      />

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-14 border-b border-border px-3 py-2 flex items-center gap-2 bg-background">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-4 h-4" />
          </Button>

          {/* Desktop header */}
          <div className="hidden md:flex items-center gap-2 flex-1">
            <img
              src="/logo2.png"
              alt="SEGUA"
              className="h-8 w-auto"
            />
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold truncate">
                {currentConversationId
                  ? conversations.find(c => c.id === currentConversationId)?.name || 'SEGUA'
                  : 'SEGUA'}
              </h2>
            </div>
            <LocationBadge />
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenDictionary}
              className="border-[#4997D0] text-[#4997D0] hover:bg-[#4997D0] hover:text-white h-8 text-xs transition-all duration-200 ease-in-out"
            >
              <BookOpen className="w-3.5 h-3.5 mr-1.5" />
              Diccionario
            </Button>
          </div>

          {/* Mobile header - centered logo */}
          <div className="md:hidden flex-1 flex justify-center">
            <img
              src="/logo2.png"
              alt="SEGUA"
              className="h-7 w-auto"
            />
          </div>

          {/* Mobile profile avatar */}
          <div className="md:hidden">
            <UserProfileDropdown
              userName={user.name}
              userEmail={user.email}
              onLogout={handleLogout}
              mobileOnly={true}
            />
          </div>

          {currentConversationId && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearConversation}
                title="Limpiar conversación"
                className="hidden md:flex h-8 w-8"
              >
                <Eraser className="w-4 h-4 text-muted-foreground" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setConversationToDelete(currentConversationId);
                  setShowDeleteDialog(true);
                }}
                title="Eliminar conversación"
                className="hidden md:flex h-8 w-8"
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </>
          )}
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="max-w-3xl mx-auto px-2 md:px-3 py-2 md:py-4">
            {showWelcome ? (
              <div className="text-center py-2 md:py-4">
                <img
                  src="/edited-photo.png"
                  alt="SEGUA Logo"
                  className="w-16 h-16 md:w-32 md:h-32 mx-auto mb-2 md:mb-4"
                />
                <h2 className="text-xs md:text-sm font-semibold mb-1 md:mb-1.5" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  ¡Bienvenido a SEGUA!
                </h2>
                <p className="text-muted-foreground mb-2 md:mb-3 max-w-sm mx-auto text-[10px] md:text-xs px-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Escribe una palabra o frase en español y te mostraré su seña en
                  Lengua de Señas de Guatemala
                </p>
                <div className="space-y-1 md:space-y-2">
                  <p className="text-[9px] md:text-xs font-medium text-muted-foreground" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Prueba con estas frases:
                  </p>
                  <div className="grid grid-cols-2 md:flex md:flex-wrap gap-0.5 md:gap-1.5 justify-center px-2">
                    {WELCOME_PHRASES.map((phrase, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        onClick={() => handleTryPhrase(phrase)}
                        className="border-[#4997D0] text-[#4997D0] hover:bg-[#4997D0] hover:text-white text-[8px] md:text-xs h-6 md:h-7 py-0.5 md:py-1 px-1.5 md:px-2.5"
                      >
                        {phrase}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="mt-2 md:mt-3 px-2">
                  <Button
                    onClick={handleOpenDictionary}
                    className="bg-[#4997D0] hover:bg-[#3A7FB8] w-full md:w-auto text-[9px] md:text-xs h-8 md:h-auto py-1.5 md:py-2"
                  >
                    <BookOpen className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 mr-1.5" />
                    Explorar Diccionario
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    onRequestWord={handleRequestWord}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input area */}
        <div className="border-t border-border bg-background p-1.5 md:p-2 mb-16 md:mb-0">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-1 md:gap-1.5">
              <div className="flex-1 relative">
                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value.slice(0, maxChars))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Escribe una palabra o frase..."
                  className="min-h-[36px] md:min-h-[44px] max-h-[80px] resize-none pr-9 md:pr-11 text-xs md:text-sm"
                />
                <div className="absolute bottom-1 right-1 text-[9px] md:text-xs text-muted-foreground">
                  {charCount}/{maxChars}
                </div>
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputText.trim()}
                className="h-[36px] md:h-[44px] px-2 md:px-3 bg-[#4997D0] hover:bg-[#3A7FB8]"
              >
                <Send className="w-3 md:w-3.5 h-3 md:h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation (Mobile only) */}
      <BottomNav />
    </div>
  );
}