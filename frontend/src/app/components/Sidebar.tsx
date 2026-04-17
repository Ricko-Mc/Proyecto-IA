import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { MessageSquare, BookOpen, Gamepad, Users, MessageSquarePlus, ChevronLeft } from 'lucide-react';
import { Button } from './ui/button';

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
  isMobile?: boolean;
  isCollapsed?: boolean;
  onClose?: () => void;
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
  isMobile = false,
  isCollapsed = false,
  onClose,
}: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const activePath = location.pathname;

  const handleNewConversation = () => {
    onNewConversation();
    if (isMobile && onClose) {
      onClose();
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile && onClose) {
      onClose();
    }
  };

  const isActive = (path: string) => activePath === path;

  const navItems = [
    {
      path: '/chat',
      label: 'Chat',
      icon: MessageSquare,
    },
  ];

  const operationItems = [
    {
      path: '/dictionary',
      label: 'Diccionario',
      icon: BookOpen,
    },
    {
      path: '/chat',
      label: 'Juego',
      icon: Gamepad,
      disableActive: true,
    },
  ];

  return (
    <div className={`flex flex-col h-full ${isCollapsed ? 'w-16' : 'w-full'} bg-[rgba(244,249,255,0.55)] dark:bg-[rgba(18,18,18,0.42)] backdrop-blur-xl border border-[rgba(164,194,224,0.35)] dark:border-white/10 overflow-hidden shadow-[0_10px_28px_rgba(13,43,76,0.06)] dark:shadow-[0_10px_28px_rgba(0,0,0,0.25)] transition-all duration-200 ease-in-out`}>
      <div className={`px-3 ${isCollapsed ? 'py-3' : 'py-4'} ${isCollapsed ? 'space-y-3' : 'space-y-4'}`}>
        <div className="flex items-center justify-center">
          {!isCollapsed && (
            <img src="/logo1.png" alt="SEGUA Logo" className="h-28 w-auto object-contain" />
          )}
        </div>

        <Button
          onClick={handleNewConversation}
          className={`w-full flex items-center justify-center gap-2 bg-[#4997D0] hover:bg-[#3A7FB8] text-white ${isCollapsed ? 'h-11 w-11 p-0 rounded-full' : 'h-11 rounded-[14px]'} transition-all duration-200 ease-in-out`}
        >
          <MessageSquarePlus className="w-4 h-4" />
          {!isCollapsed && <span className="text-sm font-medium">Nueva conversación</span>}
        </Button>
      </div>

      <div className={`flex-1 overflow-y-auto px-3 ${isCollapsed ? 'py-2' : 'py-3'}`}>
        {!isCollapsed && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400 mb-2">
            GENERAL
          </p>
        )}
        <div className={`grid ${isCollapsed ? 'gap-2' : 'gap-1'}`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const selected = isActive(item.path);
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => handleNavigate(item.path)}
                className={`flex ${isCollapsed ? 'justify-center' : 'items-center'} gap-3 w-full rounded-lg ${isCollapsed ? 'p-2.5' : 'px-2 py-2'} transition ${selected ? 'bg-slate-900/5 dark:bg-white/10 text-slate-950 dark:text-white font-semibold' : 'text-slate-800 dark:text-slate-200 hover:bg-white/5 dark:hover:bg-white/5'}`}
              >
                <Icon className="h-5 w-5 text-slate-900 dark:text-slate-100" />
                {!isCollapsed && <span className="text-sm">{item.label}</span>}
              </button>
            );
          })}
        </div>

        {!isCollapsed && (
          <div className="mt-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400 mb-2">
              OPERACIONES
            </p>
          </div>
        )}
        <div className={`grid ${isCollapsed ? 'gap-2' : 'gap-1'}`}>
          {operationItems.map((item) => {
            const Icon = item.icon;
            const selected = isActive(item.path) && !item.disableActive;
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => handleNavigate(item.path)}
                className={`flex ${isCollapsed ? 'justify-center' : 'items-center'} gap-3 w-full rounded-lg ${isCollapsed ? 'p-2.5' : 'px-2 py-2'} transition ${selected ? 'bg-slate-900/5 dark:bg-white/10 text-slate-950 dark:text-white font-semibold' : 'text-slate-800 dark:text-slate-200 hover:bg-white/5 dark:hover:bg-white/5'}`}
              >
                <Icon className="h-5 w-5 text-slate-900 dark:text-slate-100" />
                {!isCollapsed && <span className="text-sm">{item.label}</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-auto px-3 py-4 border-t border-black/10 dark:border-white/10 bg-transparent">
        <button
          type="button"
          onClick={() => handleNavigate('/about')}
          className={`flex ${isCollapsed ? 'justify-center' : 'items-center'} gap-2 w-full ${isCollapsed ? 'h-11 px-0' : 'px-2 py-2'} rounded-lg text-slate-800 dark:text-slate-200 transition hover:bg-white/5 dark:hover:bg-white/5`}
        >
          <Users className="h-4 w-4" />
          {!isCollapsed && <span className="text-sm">Acerca de SEGUA</span>}
        </button>
      </div>
    </div>
  );
}
