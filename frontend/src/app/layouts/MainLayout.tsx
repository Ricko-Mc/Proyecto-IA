import { useState } from 'react';
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleNavbarToggle = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  const isDictionaryPage = activePage === 'dictionary';

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f7f8fa] dark:bg-[rgba(10,10,10,0.82)]">
      <div className={`h-full ${isSidebarCollapsed ? 'w-16' : 'w-80'} transition-all duration-200 ease-in-out`}>
        <Sidebar
          conversations={[]}
          currentConversationId=""
          userName="Visitante SEGUA"
          userEmail="public@segua.local"
          avatarUrl={null}
          onNewConversation={onNewConversation}
          onSelectConversation={() => undefined}
          onDeleteConversation={() => undefined}
          isCollapsed={isSidebarCollapsed}
        />
      </div>

      <div className={`flex-1 flex flex-col min-h-0 ${isDictionaryPage ? 'bg-white dark:bg-white' : 'bg-[linear-gradient(180deg,#dff0ff_0%,#f3ecde_100%)] dark:bg-[linear-gradient(180deg,#0a0a0a_0%,#101010_100%)]'} overflow-hidden`}>
        <Navbar
          title={title}
          onToggleSidebar={handleNavbarToggle}
          onClearConversation={onClearConversation}
          showClearButton={showClearButton}
          onSearch={onNavbarSearch}
          activePage={activePage}
        />
        <div className="content-area flex-1 overflow-y-auto pb-16 md:pb-0">
          {children}
        </div>
      </div>
    </div>
  );
}
