import { useNavigate } from 'react-router';
import { MainLayout } from '../layouts/MainLayout';
import { GameCarousel } from '../components/GameCarousel';
import { BottomNav } from '../components/BottomNav';

export function Games() {
  const navigate = useNavigate();

  return (
    <MainLayout
      title="Juegos"
      activePage="games"
      showClearButton={false}
      onNewConversation={() => navigate('/chat')}
    >
      <div className="min-h-full px-1 md:px-3 py-3 md:py-5">
        <div className="max-w-[1500px] mx-auto">
          <div className="text-center mb-4 md:mb-6">
            <h2 className="text-2xl md:text-4xl font-semibold text-slate-900 dark:text-slate-100">
              Apartado de Juegos
            </h2>
            <p className="mt-2 text-sm md:text-lg text-slate-700/90 dark:text-slate-300">
              Practica lo aprendido con dinamicas interactivas en Lengua de Señas de Guatemala.
            </p>
          </div>

          <GameCarousel />
        </div>
      </div>

      <BottomNav />
    </MainLayout>
  );
}
