import { Moon, Sun, LogOut } from 'lucide-react';
import { LOGOS } from '@/data/constants';

interface HeaderProps {
  darkMode: boolean;
  onToggleDark: () => void;
  userName?: string;
  userEmail?: string;
  userAvatar?: string | null;
  onSignOut?: () => void;
}

export function Header({
  darkMode,
  onToggleDark,
  userName,
  userEmail,
  userAvatar,
  onSignOut,
}: HeaderProps) {
  return (
    <header className="bg-black border-b border-pr-yellow/20 px-4 py-3 flex items-center justify-between font-sans">
      <div className="flex items-center gap-3">
        <img src={LOGOS.fullColor} alt="Partrunner" className="h-8" />
        <div className="hidden sm:block">
          <h1 className="font-display text-xl text-pr-yellow tracking-wide">CAMPAIGN BUILDER</h1>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {(userName || userEmail) && (
          <div className="hidden sm:flex items-center gap-2">
            {userAvatar ? (
              <img
                src={userAvatar}
                alt=""
                className="w-7 h-7 rounded-full border border-white/20"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-pr-yellow/20 flex items-center justify-center text-xs font-bold text-pr-yellow">
                {(userName || userEmail || '?')[0].toUpperCase()}
              </div>
            )}
            <span className="text-sm text-white/50 max-w-[160px] truncate">
              {userName || userEmail}
            </span>
          </div>
        )}
        <button
          onClick={onToggleDark}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          {darkMode ? (
            <Sun size={20} className="text-pr-yellow" />
          ) : (
            <Moon size={20} className="text-white" />
          )}
        </button>
        {onSignOut && (
          <button
            onClick={onSignOut}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            title="Cerrar sesión"
          >
            <LogOut size={20} className="text-white/50 hover:text-white" />
          </button>
        )}
      </div>
    </header>
  );
}
