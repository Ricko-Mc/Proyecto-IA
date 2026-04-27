import { useNavigate, useLocation } from 'react-router';
import { MessageSquare, BookOpen, Info, Gamepad } from 'lucide-react';

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: 'chat', label: 'Traducir', icon: MessageSquare, path: '/chat' },
    { id: 'dictionary', label: 'Diccionario', icon: BookOpen, path: '/dictionary' },
    { id: 'games', label: 'Juegos', icon: Gamepad, path: '/games' },
    { id: 'about', label: 'Acerca', icon: Info, path: '/about' },
  ];

  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-50"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
        boxShadow: '0 -6px 18px rgba(0, 0, 0, 0.08)',
        borderTop: '1px solid rgba(0, 0, 0, 0.08)',
      }}
    >
      <div className="flex items-center justify-around h-16 px-2 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname.startsWith(tab.path);

          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 ease-in-out py-1 rounded-xl ${
                isActive ? 'bg-[#4997D0]/10' : 'bg-transparent'
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-all duration-200 ease-in-out ${
                  isActive ? 'text-[#4997D0]' : 'text-gray-500'
                }`}
              />
              <span
                className={`text-[11px] mt-1 transition-all duration-200 ease-in-out truncate px-1 leading-none ${
                  isActive ? 'text-[#4997D0] font-semibold' : 'text-gray-500'
                }`}
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
