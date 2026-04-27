import { useNavigate } from 'react-router';
import { MainLayout } from '../layouts/MainLayout';
import { BottomNav } from '../components/BottomNav';

export function About() {
  const navigate = useNavigate();

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
    <MainLayout
      title="Acerca de"
      activePage="about"
      onNewConversation={handleNewConversation}
      showClearButton={false}
    >
      <div className="content-area flex-1 overflow-hidden pb-16 pt-4">
        <div className="flex h-full flex-col justify-center px-4 sm:px-6">
          <div className="flex justify-center">
            <img
              src="/umg.png"
              alt="Universidad Mariano Gálvez"
              className="h-12 w-auto md:h-14"
            />
          </div>
          <div className="mt-4 text-center">
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Equipo de Desarrollo
            </h1>
            <p className="mt-1 text-xs md:text-sm text-slate-600 dark:text-slate-300">
              Universidad Mariano Gálvez de Guatemala
            </p>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-1 md:gap-2 text-center text-slate-900 dark:text-white">
            {equipo.map((nombre, index) => (
              <div key={nombre} className="flex flex-col items-center gap-1 py-1">
                <span className="text-sm md:text-base font-semibold leading-tight">
                  {nombre}
                </span>
                <span className="text-[11px] md:text-xs text-slate-500 dark:text-slate-400">
                  5090-22-{index + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <BottomNav />
    </MainLayout>
  );
}
