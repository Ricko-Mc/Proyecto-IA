import { useState } from 'react';
import { useNavigate } from 'react-router';
import { MainLayout } from '../layouts/MainLayout';
import { GameCarousel } from '../components/GameCarousel';
import { BottomNav } from '../components/BottomNav';

export function Games() {
  const navigate = useNavigate();
  const [showBottomNav, setShowBottomNav] = useState(true);

  return (
    <MainLayout
      title="Juegos"
      activePage="games"
      showClearButton={false}
      onNewConversation={() => navigate('/chat')}
      onToggleBottomNav={() => setShowBottomNav((prev) => !prev)}
      showBottomNav={showBottomNav}
    >
      <div className="h-screen overflow-hidden px-1 md:px-3 py-2 md:py-3">
        <div className="max-w-full mx-auto">
          <GameCarousel />
        </div>
      </div>

      {showBottomNav && <BottomNav />}
    </MainLayout>
  );
}
