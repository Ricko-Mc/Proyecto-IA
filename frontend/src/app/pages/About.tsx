import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar.tsx';
import { Users } from 'lucide-react';

export function About() {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const equipo = [
    'Gustavo Ariel Barrientos García',
    'Andrea Sofía Chafolla Méndez',
    'Carmi Emileny Cuxum González',
    'Dilan René Escobar Rodríguez',
    'Steev Zankhoj Figueroa Ortiz',
    'Josué Daniel Figueroa Herrera',
    'Ricardo Javier Galindo Flores',
    'Jeffry Alejandro Urbina Saravia',
  ];

  const handleNewConversation = () => {
    navigate('/chat');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f7f8fa] dark:bg-[rgba(10,10,10,0.82)]">
      <div className={`h-full ${isSidebarCollapsed ? 'w-16' : 'w-80'} transition-all duration-200 ease-in-out`}>
        <Sidebar
          conversations={[]}
          currentConversationId=""
          userName="Visitante SEGUA"
          userEmail="public@segua.local"
          avatarUrl={null}
          onNewConversation={handleNewConversation}
          onSelectConversation={() => undefined}
          onDeleteConversation={() => undefined}
          isCollapsed={isSidebarCollapsed}
        />
      </div>

      <div className="flex-1 flex flex-col min-h-0 bg-[linear-gradient(180deg,#dff0ff_0%,#f3ecde_100%)] dark:bg-[linear-gradient(180deg,#0a0a0a_0%,#101010_100%)] overflow-hidden">
        <Navbar
          title="Acerca de SEGUA"
          onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
          showClearButton={false}
        />

        <div className="content-area flex-1 overflow-y-auto pb-8 pt-6">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="flex justify-center">
              <img
                src="/umg.png"
                alt="Universidad Mariano Gálvez"
                className="h-20 w-auto"
              />
            </div>
            <div className="mt-6 text-center">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Equipo de Desarrollo
              </h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Universidad Mariano Gálvez de Guatemala
              </p>
            </div>

            <div className="mt-8 space-y-2">
              {equipo.map((nombre) => (
                <div key={nombre} className="flex items-center gap-3 text-sm text-slate-900 dark:text-white">
                  <Users className="h-5 w-5 text-[#4997D0]" />
                  <span>{nombre}</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
