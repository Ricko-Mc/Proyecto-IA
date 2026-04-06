import { useNavigate, useLocation } from 'react-router';
import { MessageSquare, BookOpen, Clock, User } from 'lucide-react';

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: 'chat', label: 'Chat', icon: MessageSquare, path: '/chat' },
    { id: 'dictionary', label: 'Diccionario', icon: BookOpen, path: '/dictionary' },
    { id: 'history', label: 'Historial', icon: Clock, path: '/chat' },
    { id: 'profile', label: 'Perfil', icon: User, path: '/settings' },
  ];

  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white z-50"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
        boxShadow: '0 -1px 3px rgba(0, 0, 0, 0.06)',
        borderTop: '0.5px solid rgba(0, 0, 0, 0.08)',
      }}
    >
      <div className="flex items-center justify-around h-16 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;

          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 ease-in-out py-1"
            >
              <Icon
                className={`w-5 h-5 transition-all duration-200 ease-in-out ${
                  isActive ? 'text-[#4997D0]' : 'text-gray-500'
                }`}
              />
              <span
                className={`text-[11px] mt-1 transition-all duration-200 ease-in-out truncate px-1 ${
                  isActive ? 'text-[#4997D0] font-medium' : 'text-gray-500'
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
