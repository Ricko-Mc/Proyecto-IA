import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Sidebar, Conversation } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { ChatMessage, Message } from '../components/ChatMessage';
import { WordNotFoundDialog } from '../components/WordNotFoundDialog';
import { BottomNav } from '../components/BottomNav';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
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
import { Send, BookOpen } from 'lucide-react';
import { api } from '../../services/api';

const WELCOME_PHRASES = [
  "Hola, ¿cómo estás?",
  "Buenos días",
  "Gracias",
  "Por favor",
  "Te quiero"
];

const getConversationStorageKey = () => `segua_conversations_public`;
const getCurrentConversationStorageKey = () => `segua_current_conversation_public`;
const PUBLIC_USER = {
  name: 'Visitante SEGUA',
  email: 'public@segua.local',
  avatar_url: null as string | null,
};

export function Chat() {
  const navigate = useNavigate();
  const [user, setUser] = useState<typeof PUBLIC_USER>(PUBLIC_USER);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [notFoundWord, setNotFoundWord] = useState('');
  const [showNotFoundDialog, setShowNotFoundDialog] = useState(false);
  const [insertedGamePrompt, setInsertedGamePrompt] = useState(false);
  const [correctResponseCount, setCorrectResponseCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [conversationToDelete, setConversationToDelete] = useState('');

  useEffect(() => {
    const conversationsKey = getConversationStorageKey();
    const currentConversationKey = getCurrentConversationStorageKey();

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
  }, []);

  useEffect(() => {
    if (!currentConversationId) return;
    const exists = conversations.some((conv) => conv.id === currentConversationId);
    if (!exists) {
      setCurrentConversationId('');
    }
  }, [conversations, currentConversationId]);

  useEffect(() => {
    localStorage.setItem(getConversationStorageKey(), JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem(getCurrentConversationStorageKey(), currentConversationId);
  }, [currentConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleNewConversation = () => {
    setCurrentConversationId('');
    setMessages([]);
    setInsertedGamePrompt(false);
  };

  const handleSelectConversation = (id: string) => {
    setCurrentConversationId(id);
    setMessages([]);
    setInsertedGamePrompt(false);
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
    setInsertedGamePrompt(false);
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

  const handleNavbarSearch = async (query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;
    setInputText(trimmedQuery);
    await enviarMensaje(trimmedQuery);
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
      text: textoUsuarioVisible || mensajeActual,
    };

    const loadingMessage: Message = {
      id: `msg-${Date.now()}-loading`,
      type: 'system',
      text: '',
      isLoading: true,
    };

    setMessages((prev) => [...prev, userMessage, loadingMessage]);

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

      const shouldFetchCategories =
        respuesta.tipo_respuesta === 'no_encontrado' ||
        (respuesta.tipo_respuesta === 'video' && respuesta.signo_encontrado && !respuesta.url_video);

      const categoryOptions = shouldFetchCategories
        ? await api
            .obtenerCategorias()
            .then((resultado) => resultado.categorias)
            .catch(() => [])
        : [];

      const urlVideoPermitida = respuesta.url_video;
      const isCorrectResponse =
        respuesta.tipo_respuesta === 'video' &&
        respuesta.signo_encontrado &&
        Boolean(urlVideoPermitida);
      const nextCorrectCount = correctResponseCount + (isCorrectResponse ? 1 : 0);
      const shouldInsertPrompt =
        isCorrectResponse &&
        nextCorrectCount >= 5 &&
        !insertedGamePrompt &&
        !messages.some((m) => m.gamePrompt);

      setMessages((prev) => {
        const filtered = prev.filter((m) => !m.isLoading);

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
          const videoMissing = !urlVideoPermitida;
          systemMessage = {
            id: `msg-${Date.now()}-response`,
            type: 'system',
            text: '',
            videoUrl: urlVideoPermitida || undefined,
            signLabel: respuesta.palabra_clave || undefined,
            noVideoAvailable: videoMissing,
            categoryPrompt: videoMissing,
            categories: videoMissing ? categoryOptions : undefined,
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
            categoryPrompt: true,
            categories: categoryOptions,
          };
        }

        const gamePromptMessage: Message | null = shouldInsertPrompt
          ? {
              id: `msg-${Date.now()}-game`,
              type: 'system',
              text: '¡Vas muy bien! ¿Quieres poner a prueba lo que has aprendido?',
              gamePrompt: true,
            }
          : null;

        return [
          ...filtered,
          systemMessage,
          ...(gamePromptMessage ? [gamePromptMessage] : []),
        ];
      });

      if (isCorrectResponse) {
        setCorrectResponseCount((prev) => prev + 1);
      }
      if (shouldInsertPrompt) {
        setInsertedGamePrompt(true);
      }

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

  const handleSelectCategory = (category: string) => {
    navigate(`/dictionary?category=${encodeURIComponent(category)}`);
  };

  const showWelcome = messages.length === 0;
  const charCount = inputText.length;
  const maxChars = 500;
  const activeVideoMessageId = [...messages]
    .reverse()
    .find((message) => message.type === 'system' && (Boolean(message.videoUrl) || Boolean(message.videos?.length)))?.id;

  return (
    <div className="flex h-screen w-screen rounded-none overflow-hidden bg-[#f7f8fa] dark:bg-[rgba(10,10,10,0.82)]">
      <div className={`h-full ${isSidebarCollapsed ? 'w-16' : 'w-80'} transition-all duration-200 ease-in-out`}>
        <Sidebar
          conversations={conversations}
          currentConversationId={currentConversationId}
          userName={user.name}
          userEmail={user.email}
          avatarUrl={user.avatar_url}
          onNewConversation={handleNewConversation}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversationFromSidebar}
          isCollapsed={isSidebarCollapsed}
        />
      </div>

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
        
        <Navbar
          title="Chat"
          onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
          onClearConversation={handleClearConversation}
          onSearch={handleNavbarSearch}
          activePage="chat"
        />

          

        
        <div
          className="content-area flex-1 overflow-y-auto pb-20 md:pb-0 pr-1"
          style={{ scrollbarGutter: 'stable' }}
        >
          <div className="max-w-3xl mx-auto px-2 md:px-3 py-2 md:py-4">
            {showWelcome ? (
              <div className="min-h-[63vh] md:min-h-[68vh] flex items-center justify-center -mt-5 md:-mt-8 px-2 md:px-4">
                <div className="w-full max-w-2xl text-center px-2 md:px-4 py-2 md:py-3">
                  <img
                    src="/logo1.png"
                    alt="SEGUA Logo"
                    width={168}
                    height={168}
                    loading="eager"
                    decoding="async"
                    className="w-20 h-20 md:w-32 md:h-32 mx-auto mb-2 md:mb-4"
                  />
                  <h2 className="text-base md:text-2xl font-semibold mb-1.5 md:mb-2.5 tracking-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    ¡Bienvenido a SEGUA!
                  </h2>
                  <p className="text-foreground/80 mb-3 md:mb-4 max-w-xl mx-auto text-xs md:text-sm px-1 md:px-2 leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Escribe una palabra o frase en español y te mostraré su seña en
                    Lengua de Señas de Guatemala.
                  </p>
                  <div className="space-y-1.5 md:space-y-2">
                    <p className="text-xs md:text-sm font-medium text-muted-foreground" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Prueba con estas frases:
                    </p>
                    <div className="grid grid-cols-2 md:flex md:flex-wrap gap-1.5 md:gap-2 justify-center px-1">
                      {WELCOME_PHRASES.map((phrase, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          onClick={() => handleTryPhrase(phrase)}
                          className="border-[#4997D0]/70 dark:border-[#3f3f3f] bg-white/70 dark:bg-white/5 text-[#4997D0] dark:text-[#dcdcdc] backdrop-blur-sm hover:bg-[#4997D0] dark:hover:bg-[#2a2a2a] hover:text-white text-[11px] md:text-xs h-7 md:h-8 py-1 px-2 md:px-3"
                        >
                          {phrase}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-2.5 md:mt-4 px-1">
                    <Button
                      onClick={handleOpenDictionary}
                      className="bg-[#4997D0]/90 dark:bg-[#1d1d1d]/90 border border-white/55 dark:border-white/10 backdrop-blur-sm hover:bg-[#3A7FB8] dark:hover:bg-[#2a2a2a] w-full md:w-auto text-xs md:text-sm h-9 md:h-10 py-2 px-4 md:px-5"
                    >
                      <BookOpen className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5" />
                      Explorar Diccionario
                    </Button>
                  </div>
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
                    onSelectCategory={handleSelectCategory}
                    onOpenDictionary={handleOpenDictionary}
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