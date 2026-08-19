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
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-black border-r border-zinc-800 transition-transform duration-300 ease-in-out flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Logo Header */}
          <div className="h-16 flex items-center gap-3 px-6 border-b border-zinc-800 bg-zinc-950">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-md">
              <VideoIcon className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="font-bold text-white leading-none tracking-tight">VN Templates</h1>
              <span className="text-[10px] tracking-widest text-zinc-400 font-semibold uppercase">Admin Panel</span>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm font-semibold'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`
                }
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer profile / logout */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-white text-black font-bold flex items-center justify-center text-xs">
              {admin?.name?.substring(0, 2).toUpperCase() || 'AD'}
            </div>
            <div className="truncate flex-1">
              <p className="text-sm font-semibold text-zinc-100 truncate">{admin?.name}</p>
              <span className="text-[11px] text-zinc-400 block truncate capitalize">
                {admin?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-zinc-300 hover:bg-white hover:text-black border border-zinc-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
