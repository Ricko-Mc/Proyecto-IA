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
      <div className="min-h-screen px-1 md:px-3 py-2 md:py-3">
        <div className="max-w-full mx-auto">
          <GameCarousel />
        </div>
      </div>

      <BottomNav />
    </MainLayout>
  );
}
