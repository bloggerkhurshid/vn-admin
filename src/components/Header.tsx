import React from 'react';
import { Menu, Shield, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  onMenuToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { admin } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-black/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 md:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Welcome back,</span>
          <span className="text-sm font-semibold text-zinc-900 dark:text-white">{admin?.name}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Light / Dark Mode Switcher */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-white border border-zinc-300 dark:border-zinc-700">
          <Shield className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-300" />
          {admin?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
        </span>
      </div>
    </header>
  );
};
