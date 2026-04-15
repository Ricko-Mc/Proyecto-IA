import { useState } from 'react';
import { useNavigate } from 'react-router';
import { MessageSquarePlus, User, Settings, HelpCircle, Info, Search, Trash2, X, ShieldCheck } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Input } from './ui/input';
import { UserProfileDropdown } from './UserProfileDropdown';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from './ui/sheet';

export interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: Date;
}

interface SidebarProps {
  conversations: Conversation[];
  currentConversationId?: string;
  userName: string;
  userEmail: string;
  avatarUrl?: string | null;
  onNewConversation: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onLogout: () => void;
  isMobile?: boolean;
  onClose?: () => void;
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Ahora';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `Hace ${diffInMinutes} min`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `Hace ${diffInHours} h`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `Hace ${diffInDays} d`;
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `Hace ${diffInWeeks} sem`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  return `Hace ${diffInMonths} mes${diffInMonths > 1 ? 'es' : ''}`;
}

export function Sidebar({
  conversations,
  currentConversationId,
  userName,
  userEmail,
  avatarUrl,
  onNewConversation,
  onSelectConversation,
  onDeleteConversation,
  onLogout,
  isMobile = false,
  onClose
}: SidebarProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
    const roles = (() => {
      try {
        const userRaw = localStorage.getItem('user');
      if (!userRaw) return [] as string[];
      const parsed = JSON.parse(userRaw) as { roles?: string[] };
      return parsed.roles || [];
    } catch {
      return [] as string[];
    }
  })();
  const esAdminOModerador = roles.includes('admin') || roles.includes('moderador');

  const handleSelectConversation = (id: string) => {
    onSelectConversation(id);
    if (isMobile && onClose) {
      onClose();
    }
  };

  const handleNewConversation = () => {
    onNewConversation();
    if (isMobile && onClose) {
      onClose();
    }
  };

  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteConversation(id);
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className="flex flex-col h-full bg-white/20 dark:bg-white/5 backdrop-blur-sm border border-white/40 dark:border-white/10 rounded-[16px] overflow-hidden"
    >
      
      <div className="p-3 space-y-3">
        <div className="flex items-center gap-2">
          <Button
            onClick={handleNewConversation}
            className="flex-1 bg-[#4997D0] hover:bg-[#3A7FB8] dark:bg-[#1c1c1c] dark:hover:bg-[#2a2a2a] text-white h-9 text-xs rounded-[6px]"
          >
            <MessageSquarePlus className="w-3.5 h-3.5 mr-1.5" />
            Nueva conversación
          </Button>
          {onClose && (
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="h-9 w-9 hover:bg-gray-200 dark:hover:bg-[#252525] rounded-[6px]"
            >
              <X className="w-4 h-4 text-gray-600 dark:text-[#d6d6d6]" />
            </Button>
          )}
        </div>
        
        
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 pl-7 text-xs bg-white dark:bg-[#1a1a1a] dark:text-[#efefef] dark:placeholder:text-[#8d8d8d] border-0 rounded-[6px]"
          />
        </div>
      </div>

      
      <div className="flex-1 overflow-y-auto px-3">
        <div className="px-1 pt-1 pb-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground dark:text-[#8d8d8d]">
            Recientes
          </p>
        </div>
        {filteredConversations.length === 0 ? (
          <div className="px-1 py-3 text-center text-xs text-muted-foreground dark:text-[#8d8d8d]">
            {searchQuery ? 'No se encontraron conversaciones' : 'No hay conversaciones aún'}
          </div>
        ) : (
          <div className="space-y-1 pb-3">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className="group relative"
              >
                <button
                  onClick={() => handleSelectConversation(conversation.id)}
                  className={`w-full text-left p-2.5 rounded-[6px] transition-colors ${
                    currentConversationId === conversation.id
                      ? 'bg-transparent text-[#1f2937] dark:text-[#f0f0f0] font-semibold border-l-2 border-[#4997D0] dark:border-[#8d8d8d] pl-[0.625rem]'
                      : 'bg-transparent hover:bg-white/45 dark:hover:bg-[#1a1a1a]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1 mb-0.5">
                    <p className="text-xs truncate flex-1 line-clamp-1">{conversation.name}</p>
                    <span className="text-[9px] text-muted-foreground dark:text-[#8d8d8d] whitespace-nowrap">
                      {formatRelativeTime(conversation.timestamp)}
                    </span>
                  </div>
                  <p className="text-[9px] text-muted-foreground dark:text-[#8d8d8d] truncate line-clamp-1">
                    {conversation.lastMessage || 'Sin mensajes'}
                  </p>
                </button>
                
                
                <button
                  onClick={(e) => handleDeleteConversation(conversation.id, e)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-destructive hover:bg-destructive/90 text-white p-1 rounded-[4px]"
                  title="Eliminar"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      
      <div className="px-3 py-2 bg-transparent dark:bg-transparent">
        {esAdminOModerador ? (
          <div className="space-y-1.5 mb-2">
            <Button
              variant="outline"
              className="w-full h-8 text-xs rounded-[6px]"
              onClick={() => {
                navigate('/admin/reportes');
                if (isMobile && onClose) {
                  onClose();
                }
              }}
            >
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
              Gestionar solicitudes
            </Button>
            {roles.includes('admin') ? (
              <Button
                variant="outline"
                className="w-full h-8 text-xs rounded-[6px]"
                onClick={() => {
                  navigate('/admin/usuarios');
                  if (isMobile && onClose) {
                    onClose();
                  }
                }}
              >
                <User className="w-3.5 h-3.5 mr-1.5" />
                Gestionar usuarios
              </Button>
            ) : null}
          </div>
        ) : null}
        <div className="pt-2.5 border-t border-black/10 dark:border-white/10">
          <UserProfileDropdown
            userName={userName}
            userEmail={userEmail}
            avatarUrl={avatarUrl}
            onLogout={onLogout}
          />
        </div>
      </div>
    </div>
  );
}