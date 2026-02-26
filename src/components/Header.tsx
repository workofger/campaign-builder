import { Moon, Sun } from 'lucide-react';
import { LOGOS } from '@/data/constants';

interface HeaderProps {
  darkMode: boolean;
  onToggleDark: () => void;
}

export function Header({ darkMode, onToggleDark }: HeaderProps) {
  return (
    <header className="bg-black border-b border-pr-yellow/20 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img src={LOGOS.fullColor} alt="Partrunner" className="h-8" />
        <div className="hidden sm:block">
          <h1 className="font-display text-xl text-pr-yellow tracking-wide">CAMPAIGN BUILDER</h1>
        </div>
      </div>
      <button
        onClick={onToggleDark}
        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
      >
        {darkMode ? <Sun size={20} className="text-pr-yellow" /> : <Moon size={20} className="text-white" />}
      </button>
    </header>
  );
}
