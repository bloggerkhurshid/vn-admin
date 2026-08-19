import React from 'react';
import { Menu, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onMenuToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { admin } = useAuth();

  return (
    <header className="h-16 border-b border-zinc-800 bg-black/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 md:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 md:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs text-zinc-400">Welcome back,</span>
          <span className="text-sm font-semibold text-white">{admin?.name}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-900 text-white border border-zinc-700">
          <Shield className="w-3.5 h-3.5 text-zinc-300" />
          {admin?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
        </span>
      </div>
    </header>
  );
};
