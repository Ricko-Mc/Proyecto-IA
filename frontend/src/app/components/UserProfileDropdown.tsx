import { useNavigate } from 'react-router';
import { User, Settings, HelpCircle, Info } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
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
  avatarUrl?: string | null;
  onLogout: () => void;
  mobileOnly?: boolean;
}

export function UserProfileDropdown({
  userName,
  userEmail,
  avatarUrl,
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
              <AvatarImage src={avatarUrl ?? undefined} alt={userName} />
              <AvatarFallback className="bg-[#4997D0] text-white text-[10px]">
                <User className="w-3 h-3" />
              </AvatarFallback>
            </Avatar>
          </button>
        ) : (
          <button className="flex items-center gap-3 p-2.5 rounded-[12px] bg-white/30 dark:bg-white/5 backdrop-blur-sm border border-white/40 dark:border-white/10 hover:bg-white/40 dark:hover:bg-white/10 transition-all duration-200 ease-in-out w-full focus:outline-none focus:ring-0">
            <Avatar className="w-9 h-9 flex-shrink-0">
              <AvatarImage src={avatarUrl ?? undefined} alt={userName} />
              <AvatarFallback className="bg-[#4997D0] text-white">
                <User className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-semibold truncate" style={{ fontFamily: 'Poppins, sans-serif', lineHeight: '1.2' }}>{userName}</p>
              <p className="text-[11px] text-gray-600 dark:text-gray-400 truncate" style={{ fontFamily: 'Poppins, sans-serif', lineHeight: '1.2' }}>{userEmail}</p>
            </div>
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side={mobileOnly ? "bottom" : "top"}
        className="w-[220px] rounded-xl p-2.5 z-50 bg-popover text-popover-foreground border border-border"
        style={{
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.18)',
          fontFamily: 'Poppins, sans-serif',
          position: 'relative',
        }}
      >
        
        <div className="flex flex-col items-center gap-1.5 mb-2 pt-1">
          <Avatar className="w-9 h-9">
            <AvatarImage src={avatarUrl ?? undefined} alt={userName} />
            <AvatarFallback className="bg-[#4997D0] text-white">
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <p className="text-xs font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>{userName}</p>
            <p className="text-[10px] text-muted-foreground" style={{ fontFamily: 'Poppins, sans-serif' }}>{userEmail}</p>
          </div>
        </div>

        <DropdownMenuSeparator className="my-1.5" />

        
        <DropdownMenuItem
          onClick={() => navigate('/settings')}
          className="px-3 py-2 cursor-pointer rounded-md transition-all duration-200 ease-in-out focus:bg-accent focus:text-accent-foreground"
        >
          <Settings className="w-4 h-4 mr-2 text-muted-foreground" />
          <span className="text-xs" style={{ fontFamily: 'Poppins, sans-serif' }}>Ajustes</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => navigate('/help')}
          className="px-3 py-2 cursor-pointer rounded-md transition-all duration-200 ease-in-out focus:bg-accent focus:text-accent-foreground"
        >
          <HelpCircle className="w-4 h-4 mr-2 text-muted-foreground" />
          <span className="text-xs" style={{ fontFamily: 'Poppins, sans-serif' }}>Obtener ayuda</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => navigate('/about')}
          className="px-3 py-2 cursor-pointer rounded-md transition-all duration-200 ease-in-out focus:bg-accent focus:text-accent-foreground"
        >
          <Info className="w-4 h-4 mr-2 text-muted-foreground" />
          <span className="text-xs" style={{ fontFamily: 'Poppins, sans-serif' }}>Más información</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1.5" />

        
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
