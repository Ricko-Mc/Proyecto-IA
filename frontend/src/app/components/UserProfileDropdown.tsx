import { useNavigate } from 'react-router';
import { User, Settings, HelpCircle, Info } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface UserProfileDropdownProps {
  userName: string;
  userEmail: string;
  onLogout: () => void;
  mobileOnly?: boolean;
}

export function UserProfileDropdown({
  userName,
  userEmail,
  onLogout,
  mobileOnly = false,
}: UserProfileDropdownProps) {
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {mobileOnly ? (
          <button className="h-6 w-6 rounded-full transition-all duration-200 ease-in-out hover:opacity-80">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="bg-[#4997D0] text-white text-[10px]">
                <User className="w-3 h-3" />
              </AvatarFallback>
            </Avatar>
          </button>
        ) : (
          <button className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-sidebar-accent transition-all duration-200 ease-in-out w-full">
            <Avatar className="w-9 h-9">
              <AvatarFallback className="bg-[#4997D0] text-white">
                <User className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-medium truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>{userName}</p>
              <p className="text-[10px] text-muted-foreground truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>{userEmail}</p>
            </div>
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side={mobileOnly ? "bottom" : "top"}
        className="w-[220px] bg-white rounded-xl p-2.5 z-50"
        style={{
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          fontFamily: 'Poppins, sans-serif',
          position: 'relative',
        }}
      >
        {/* User Info */}
        <div className="flex flex-col items-center gap-1.5 mb-2 pt-1">
          <Avatar className="w-9 h-9">
            <AvatarFallback className="bg-[#4997D0] text-white">
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <p className="text-xs font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>{userName}</p>
            <p className="text-[10px] text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>{userEmail}</p>
          </div>
        </div>

        <DropdownMenuSeparator className="my-1.5" />

        {/* Menu Items */}
        <DropdownMenuItem
          onClick={() => navigate('/settings')}
          className="px-3 py-2 cursor-pointer hover:bg-gray-100 rounded-md transition-all duration-200 ease-in-out"
        >
          <Settings className="w-4 h-4 mr-2 text-gray-600" />
          <span className="text-xs" style={{ fontFamily: 'Poppins, sans-serif' }}>Ajustes</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => navigate('/help')}
          className="px-3 py-2 cursor-pointer hover:bg-gray-100 rounded-md transition-all duration-200 ease-in-out"
        >
          <HelpCircle className="w-4 h-4 mr-2 text-gray-600" />
          <span className="text-xs" style={{ fontFamily: 'Poppins, sans-serif' }}>Obtener ayuda</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => navigate('/about')}
          className="px-3 py-2 cursor-pointer hover:bg-gray-100 rounded-md transition-all duration-200 ease-in-out"
        >
          <Info className="w-4 h-4 mr-2 text-gray-600" />
          <span className="text-xs" style={{ fontFamily: 'Poppins, sans-serif' }}>Más información</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1.5" />

        {/* Logout Button */}
        <div className="px-2 pt-0.5">
          <button
            onClick={onLogout}
            className="w-full h-8 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs font-bold transition-all duration-200 ease-in-out shadow-sm"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Cerrar sesión
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
