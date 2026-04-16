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

const getConversationStorageKey = (email: string) => `segua_conversations_${email}`;
const getCurrentConversationStorageKey = (email: string) => `segua_current_conversation_${email}`;

export function Chat() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string; email: string; avatar_url?: string | null } | null>(null);
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
    const parsedUser = JSON.parse(userData) as { name: string; email: string; avatar_url?: string | null };
    setUser(parsedUser);

    const conversationsKey = getConversationStorageKey(parsedUser.email);
    const currentConversationKey = getCurrentConversationStorageKey(parsedUser.email);

    try {
      const savedConversations = localStorage.getItem(conversationsKey);
      if (savedConversations) {
        const parsedConversations = JSON.parse(savedConversations) as Array<{
          id: string;
          name: string;
          lastMessage: string;
          timestamp: string;
        }>;
        setConversations(
          parsedConversations.map((conv) => ({
            ...conv,
            timestamp: new Date(conv.timestamp),
          }))
        );
      } else {
        setConversations([]);
      }
    } catch {
      setConversations([]);
    }

    const savedCurrentConversation = localStorage.getItem(currentConversationKey);
    setCurrentConversationId(savedCurrentConversation || '');
    setMessages([]);
  }, [navigate]);

  useEffect(() => {
    if (!currentConversationId) return;
    const exists = conversations.some((conv) => conv.id === currentConversationId);
    if (!exists) {
      setCurrentConversationId('');
    }
  }, [conversations, currentConversationId]);

  useEffect(() => {
    if (!user?.email) return;
    localStorage.setItem(getConversationStorageKey(user.email), JSON.stringify(conversations));
  }, [conversations, user?.email]);

  useEffect(() => {
    if (!user?.email) return;
    localStorage.setItem(getCurrentConversationStorageKey(user.email), currentConversationId);
  }, [currentConversationId, user?.email]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleNewConversation = () => {
    setCurrentConversationId('');
    setMessages([]);
  };

  const handleSelectConversation = (id: string) => {
    setCurrentConversationId(id);
    setMessages([]);
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
    if (user?.email) {
      localStorage.removeItem(getConversationStorageKey(user.email));
      localStorage.removeItem(getCurrentConversationStorageKey(user.email));
    }
    navigate('/');
  };

  const handleRequestWord = (word: string) => {
    setNotFoundWord(word);
    setShowNotFoundDialog(true);
  };

  const enviarMensaje = async (
    mensaje: string,
    claveDesambiguacion?: string,
    textoUsuarioVisible?: string
  ) => {
    if (!mensaje.trim()) return;

    const mensajeActual = mensaje;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      type: 'user',
      text: textoUsuarioVisible || mensajeActual
    };

    setMessages((prev) => [...prev, userMessage]);
    const loadingMessage: Message = {
      id: `msg-${Date.now()}-loading`,
      type: 'system',
      text: '',
      isLoading: true
    };

    setMessages(prev => [...prev, loadingMessage]);

    try {
      const hasCurrentConversation = conversations.some((conv) => conv.id === currentConversationId);
      const conversationIdToUse = hasCurrentConversation ? currentConversationId : '';

      const respuesta = await api.chat(
        mensajeActual,
        conversationIdToUse || undefined,
        claveDesambiguacion
      );

      if (!conversationIdToUse && respuesta.conversacion_id) {
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
        const urlVideoPermitida = respuesta.url_video;

        let systemMessage: Message;
        if (respuesta.tipo_respuesta === 'desambiguacion') {
          systemMessage = {
            id: `msg-${Date.now()}-response`,
            type: 'system',
            text: respuesta.respuesta_ia,
            disambiguationWord: respuesta.palabra_clave || mensajeActual,
            disambiguationOptions: respuesta.opciones || [],
          };
        } else if (respuesta.tipo_respuesta === 'video' && respuesta.signo_encontrado) {
          systemMessage = {
            id: `msg-${Date.now()}-response`,
            type: 'system',
            text: '',
            videoUrl: urlVideoPermitida || undefined,
            signLabel: respuesta.palabra_clave || undefined,
            noVideoAvailable: !urlVideoPermitida,
            suggestionWord: mensajeActual,
          };
        } else if (respuesta.tipo_respuesta === 'error_backend') {
          systemMessage = {
            id: `msg-${Date.now()}-response`,
            type: 'system',
            text: respuesta.respuesta_ia,
            backendError: true,
          };
        } else {
          systemMessage = {
            id: `msg-${Date.now()}-response`,
            type: 'system',
            text: respuesta.respuesta_ia,
            notFound: true,
            notFoundWord: mensajeActual,
          };
        }
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
            text: 'No se pudo conectar con el backend. Revisa que el servidor este encendido.',
            backendError: true,
          },
        ];
      });
    }

    if (currentConversationId && conversations.some((conv) => conv.id === currentConversationId)) {
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
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    const mensajeActual = inputText;
    setInputText('');
    await enviarMensaje(mensajeActual);
  };

  const handleSelectDisambiguation = async (word: string, clave: string, label: string) => {
    await enviarMensaje(word, clave, label);
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
  const activeVideoMessageId = [...messages]
    .reverse()
    .find((message) => message.type === 'system' && (Boolean(message.videoUrl) || Boolean(message.videos?.length)))?.id;

  return (
    <div className="flex h-screen w-screen rounded-none overflow-hidden bg-[#f7f8fa] dark:bg-[rgba(10,10,10,0.82)]">
      <div className="hidden md:block w-80 h-full">
        <Sidebar
          conversations={conversations}
          currentConversationId={currentConversationId}
          userName={user.name}
          userEmail={user.email}
          avatarUrl={user.avatar_url}
          onNewConversation={handleNewConversation}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversationFromSidebar}
          onLogout={handleLogout}
        />
      </div>

      
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-1.5 w-72 bg-transparent border-0">
          <Sidebar
            conversations={conversations}
            currentConversationId={currentConversationId}
            userName={user.name}
            userEmail={user.email}
            avatarUrl={user.avatar_url}
            onNewConversation={handleNewConversation}
            onSelectConversation={handleSelectConversation}
            onDeleteConversation={handleDeleteConversationFromSidebar}
            onLogout={handleLogout}
            isMobile={true}
            onClose={() => setIsMobileMenuOpen(false)}
          />
        </SheetContent>
      </Sheet>

      
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

      
      <WordNotFoundDialog
        word={notFoundWord}
        open={showNotFoundDialog}
        onOpenChange={setShowNotFoundDialog}
      />

      
      <div className="flex-1 flex flex-col min-h-0 bg-[linear-gradient(180deg,#dff0ff_0%,#f3ecde_100%)] dark:bg-[linear-gradient(180deg,#0a0a0a_0%,#101010_100%)] overflow-hidden">
        
        <div className="topbar h-[78px] w-full px-4 md:px-7 flex items-center justify-between bg-transparent border-b border-black/5 dark:border-white/10">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9 rounded-full bg-white dark:bg-[#1a1a1a] border border-[#dbe4ef] dark:border-[#333333] text-[#516276] dark:text-[#e4e4e4] hover:bg-[#eef4fc] dark:hover:bg-[#262626]"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-4 h-4" />
          </Button>

          
          <div className="hidden md:flex items-center gap-2.5 flex-1 min-w-0">
            <img
              src="/logo2.png"
              alt="SEGUA"
              className="w-[28px] h-[28px] object-contain"
            />
            <div className="flex-1 min-w-0">
              <h2 className="text-[14px] font-semibold tracking-[0.15px] text-[#111f33] dark:text-[#f2f2f2] truncate">
                {currentConversationId
                  ? conversations.find(c => c.id === currentConversationId)?.name || 'SEGUA'
                  : 'SEGUA'}
              </h2>
            </div>

            <div className="flex items-center gap-3">
            <LocationBadge />
            <Button
              variant="ghost"
              onClick={handleOpenDictionary}
              className="h-[38px] px-[14px] gap-2 rounded-[12px] border border-[#93c2ef] dark:border-[#3a3a3a] bg-white dark:bg-[#171717] text-[#3f86cc] dark:text-[#e9e9e9] font-semibold transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:bg-[#edf6ff] dark:hover:bg-[#222222] hover:shadow-[0_6px_14px_rgba(63,134,204,0.2)] dark:hover:shadow-[0_6px_14px_rgba(0,0,0,0.45)]"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Diccionario
            </Button>

            {currentConversationId && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClearConversation}
                  title="Limpiar conversación"
                  className="h-[36px] w-[36px] rounded-[10px] bg-white dark:bg-[#171717] border border-[#dbe4ef] dark:border-[#333333] text-[#75859a] dark:text-[#d4d4d4] hover:-translate-y-0.5 hover:bg-[#edf4fc] dark:hover:bg-[#232323]"
                >
                  <Eraser className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setConversationToDelete(currentConversationId);
                    setShowDeleteDialog(true);
                  }}
                  title="Eliminar conversación"
                  className="h-[36px] w-[36px] rounded-[10px] bg-white dark:bg-[#171717] border border-[#f1d2d6] dark:border-[#4a2a2a] text-[#ef4444] dark:text-[#ff7d7d] hover:-translate-y-0.5 hover:bg-[#fff1f2] dark:hover:bg-[#231515]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </>
            )}
            </div>
          </div>

          
          <div className="md:hidden flex-1 flex justify-center">
            <img
              src="/logo2.png"
              alt="SEGUA"
              className="h-8 w-auto"
            />
          </div>

          
          <div className="md:hidden">
            <UserProfileDropdown
              userName={user.name}
              userEmail={user.email}
              avatarUrl={user.avatar_url}
              onLogout={handleLogout}
              mobileOnly={true}
            />
          </div>

        </div>

        
        <div
          className="content-area flex-1 overflow-y-auto pb-20 md:pb-0 pr-1"
          style={{ scrollbarGutter: 'stable' }}
        >
          <div className="max-w-3xl mx-auto px-2 md:px-3 py-2 md:py-4">
            {showWelcome ? (
              <div className="text-center py-2 md:py-4">
                <img
                  src="/Logo3.png"
                  alt="SEGUA Logo"
                  className="w-16 h-16 md:w-32 md:h-32 mx-auto mb-2 md:mb-4"
                />
                <h2 className="text-sm md:text-lg font-semibold mb-1.5 md:mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  ¡Bienvenido a SEGUA!
                </h2>
                <p className="text-muted-foreground mb-3 md:mb-4 max-w-sm mx-auto text-xs md:text-sm px-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Escribe una palabra o frase en español y te mostraré su seña en
                  Lengua de Señas de Guatemala
                </p>
                <div className="space-y-1 md:space-y-2">
                  <p className="text-xs md:text-sm font-medium text-muted-foreground" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Prueba con estas frases:
                  </p>
                  <div className="grid grid-cols-2 md:flex md:flex-wrap gap-0.5 md:gap-1.5 justify-center px-2">
                    {WELCOME_PHRASES.map((phrase, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        onClick={() => handleTryPhrase(phrase)}
                        className="border-[#4997D0]/70 dark:border-[#3f3f3f] bg-white/55 dark:bg-white/5 text-[#4997D0] dark:text-[#dcdcdc] backdrop-blur-sm hover:bg-[#4997D0] dark:hover:bg-[#2a2a2a] hover:text-white text-xs md:text-sm h-7 md:h-8 py-1 px-2 md:px-3"
                      >
                        {phrase}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="mt-2 md:mt-3 px-2">
                  <Button
                    onClick={handleOpenDictionary}
                    className="bg-[#4997D0]/90 dark:bg-[#1d1d1d]/90 border border-white/55 dark:border-white/10 backdrop-blur-sm hover:bg-[#3A7FB8] dark:hover:bg-[#2a2a2a] w-full md:w-auto text-xs md:text-sm h-9 md:h-10 py-2"
                  >
                    <BookOpen className="w-3 h-3 md:w-4 md:h-4 mr-1.5" />
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
                    onSelectDisambiguation={handleSelectDisambiguation}
                    isActiveVideo={message.id === activeVideoMessageId}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        
        <div className="chat-input-wrap bg-transparent p-4 md:p-7 mb-16 md:mb-0 border-t border-black/5 dark:border-white/10">
          <div className="max-w-3xl mx-auto">
            <div
              className="chat-input flex items-end gap-3 rounded-[16px] p-3 bg-white/72 dark:bg-[rgba(18,18,18,0.78)] border border-black/5 dark:border-white/10 backdrop-blur-md"
            >
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
                  className="min-h-[34px] md:min-h-[38px] max-h-[96px] resize-none pr-9 md:pr-10 py-2 text-xs md:text-sm leading-[1.35] border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0 dark:text-[#efefef] dark:placeholder:text-[#8c8c8c]"
                />
                <div className="absolute bottom-0.5 right-1 text-[9px] md:text-xs text-muted-foreground">
                  {charCount}/{maxChars}
                </div>
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputText.trim()}
                className="h-[34px] md:h-[38px] px-3 md:px-4 bg-[#4997D0] dark:bg-[#1f1f1f] hover:bg-[#3A7FB8] dark:hover:bg-[#2c2c2c] rounded-none"
              >
                <Send className="w-3 md:w-3.5 h-3 md:h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      
      <BottomNav />
    </div>
  );
}