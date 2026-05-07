import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Menu } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';

interface MainLayoutProps {
  title: string;
  children: React.ReactNode;
  activePage: string;
  onNavbarSearch?: (query: string) => void;
  onClearConversation?: () => void;
  showClearButton?: boolean;
  onNewConversation: () => void;
  onToggleBottomNav?: () => void;
  showBottomNav?: boolean;
  onRequestExit?: (callback: () => void) => void;
}

export function MainLayout({
  title,
  children,
  activePage,
  onNavbarSearch,
  onClearConversation,
  showClearButton = true,
  onNewConversation,
  onToggleBottomNav,
  showBottomNav,
  onRequestExit,
}: MainLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('segua_sidebar_collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  const handleNavbarToggle = () => {
    setIsSidebarCollapsed((prev: boolean) => {
      const newState = !prev;
      localStorage.setItem('segua_sidebar_collapsed', JSON.stringify(newState));
      return newState;
    });
  };

  const isDictionaryPage = activePage === 'dictionary';
  const isGamesPage = activePage === 'games';
  const sidebarCollapsed = isSidebarCollapsed;

  useEffect(() => {
    localStorage.setItem('segua_sidebar_collapsed', JSON.stringify(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f7f8fa] dark:bg-[rgba(10,10,10,0.82)]">
      <div className={`hidden md:block h-full ${sidebarCollapsed ? 'w-16' : 'w-80'} transition-all duration-200 ease-in-out`}>
        <Sidebar
          conversations={[]}
          currentConversationId=""
          userName="Visitante SEGUA"
          userEmail="public@segua.local"
          avatarUrl={null}
          onNewConversation={onNewConversation}
          onSelectConversation={() => undefined}
          onDeleteConversation={() => undefined}
          isCollapsed={sidebarCollapsed}
          onRequestExit={onRequestExit}
        />
      </div>

      <div className={`flex-1 flex flex-col min-h-0 ${isDictionaryPage ? 'bg-white dark:bg-white' : 'bg-[linear-gradient(180deg,#dff0ff_0%,#f3ecde_100%)] dark:bg-[linear-gradient(180deg,#0a0a0a_0%,#101010_100%)]'} overflow-hidden`}>
        {!isGamesPage && (
          <Navbar
            title={title}
            onToggleSidebar={handleNavbarToggle}
            onClearConversation={onClearConversation}
            showClearButton={showClearButton}
            onSearch={onNavbarSearch}
            activePage={activePage}
          />
        )}
        <div className={`content-area relative flex-1 overflow-y-auto pb-20 md:pb-0 ${isGamesPage ? '' : ''}`}>
          {isGamesPage && (
            <>
              <button
                type="button"
                onClick={handleNavbarToggle}
                className="absolute top-4 left-4 z-50 hidden h-11 w-11 items-center justify-center rounded-full text-slate-900 dark:text-slate-100 transition hover:bg-transparent hover:text-[#111f33] dark:hover:text-white md:flex"
                aria-label={sidebarCollapsed ? 'Expandir barra lateral' : 'Contraer barra lateral'}
              >
                <Menu className="h-5 w-5" />
              </button>
              {onToggleBottomNav && (
                <button
                  type="button"
                  onClick={onToggleBottomNav}
                  className="absolute top-4 right-4 z-50 h-11 w-11 rounded-full text-slate-900 transition hover:text-[#1f5ebf] md:hidden"
                  aria-label={showBottomNav ? 'Ocultar barra de juegos' : 'Mostrar barra de juegos'}
                >
                  {showBottomNav ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
                </button>
              )}
            </>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
