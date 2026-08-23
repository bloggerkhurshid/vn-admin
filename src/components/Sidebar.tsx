import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Video, ShieldCheck, Users, User, LogOut, VideoIcon, Settings, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { admin, logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Templates', path: '/templates', icon: Video },
    { label: 'Categories', path: '/categories', icon: Layers },
    { label: 'App Users', path: '/users', icon: Users },
    { label: 'App Settings', path: '/settings', icon: Settings },
  ];

  if (admin?.role === 'super_admin') {
    navItems.push({ label: 'Manage Admins', path: '/admins', icon: ShieldCheck });
  }

  navItems.push({ label: 'My Profile', path: '/profile', icon: User });

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-2xl border-r border-zinc-200/80 dark:border-zinc-800/80 transition-transform duration-300 ease-out flex flex-col justify-between shadow-2xl md:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Logo Header */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-zinc-200/80 dark:border-zinc-800/80">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
                <VideoIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-zinc-900 dark:text-white leading-none tracking-tight text-sm">VN Templates</h1>
                <span className="text-[10px] tracking-wider text-indigo-600 dark:text-indigo-400 font-semibold uppercase">Admin Studio</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="md:hidden p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              ✕
            </button>
          </div>

          {/* Navigation links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-600 text-white dark:bg-indigo-600 dark:text-white font-semibold shadow-md shadow-indigo-500/20'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100/80 dark:hover:bg-zinc-900/80'
                  }`
                }
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer profile / logout */}
        <div className="p-3.5 border-t border-zinc-200/80 dark:border-zinc-800/80">
          <div className="flex items-center gap-3 px-1 mb-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-zinc-800 to-zinc-900 text-white dark:from-zinc-100 dark:to-white dark:text-zinc-950 font-bold flex items-center justify-center text-xs shadow-sm">
              {admin?.name?.substring(0, 2).toUpperCase() || 'AD'}
            </div>
            <div className="truncate flex-1">
              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">{admin?.name}</p>
              <span className="text-[10px] text-zinc-400 block truncate capitalize">
                {admin?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 border border-zinc-200/80 dark:border-zinc-800/80 transition-all duration-200"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
