import { useEffect, useState } from 'react';
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
}

export function MainLayout({
  title,
  children,
  activePage,
  onNavbarSearch,
  onClearConversation,
  showClearButton = true,
  onNewConversation,
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
            <button
              type="button"
              onClick={handleNavbarToggle}
              className="absolute top-4 left-4 z-50 h-11 w-11 text-slate-900 dark:text-white transition hover:text-[#1f5ebf]"
              aria-label="Colapsar sidebar"
            >
              ≡
            </button>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
