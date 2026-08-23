import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Shield, Mail, Calendar } from 'lucide-react';

export const Profile: React.FC = () => {
  const { admin } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <User className="w-6 h-6 text-zinc-900 dark:text-white" />
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">My Admin Profile</h1>
      </div>

      <div className="glass-card rounded-3xl p-6 shadow-xl space-y-6">
        {/* Avatar header */}
        <div className="flex items-center gap-4 pb-6 border-b border-zinc-200/50 dark:border-zinc-800/50">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            {admin?.name?.substring(0, 2).toUpperCase() || 'AD'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{admin?.name}</h2>
            <span className="inline-flex items-center gap-1.5 mt-1 px-3 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800">
              <Shield className="w-3.5 h-3.5 text-zinc-500" />
              {admin?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
            </span>
          </div>
        </div>

        {/* Profile details */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl">
            <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400 text-sm">
              <Mail className="w-4 h-4 text-zinc-400" />
              <span>Email Address</span>
            </div>
            <span className="font-semibold text-zinc-900 dark:text-white text-sm">{admin?.email}</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl">
            <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400 text-sm">
              <Shield className="w-4 h-4 text-zinc-400" />
              <span>Account Status</span>
            </div>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-sm uppercase">{admin?.status || 'active'}</span>
          </div>

          {admin?.created_at && (
            <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl">
              <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400 text-sm">
                <Calendar className="w-4 h-4 text-zinc-400" />
                <span>Account Created</span>
              </div>
              <span className="font-semibold text-zinc-900 dark:text-white text-sm">
                {new Date(admin.created_at).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
