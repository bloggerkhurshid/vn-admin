import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Shield, Mail, Calendar } from 'lucide-react';

export const Profile: React.FC = () => {
  const { admin } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <User className="w-6 h-6 text-white" />
        <h1 className="text-2xl font-bold text-white tracking-tight">My Admin Profile</h1>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-md space-y-6">
        {/* Avatar header */}
        <div className="flex items-center gap-4 pb-6 border-b border-zinc-800">
          <div className="w-16 h-16 rounded-2xl bg-white text-black font-extrabold text-2xl flex items-center justify-center shadow-lg">
            {admin?.name?.substring(0, 2).toUpperCase() || 'AD'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{admin?.name}</h2>
            <span className="inline-flex items-center gap-1 mt-1 px-3 py-0.5 rounded-full text-xs font-semibold bg-zinc-900 text-white border border-zinc-700">
              <Shield className="w-3.5 h-3.5 text-zinc-300" />
              {admin?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
            </span>
          </div>
        </div>

        {/* Profile details */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-black border border-zinc-800 rounded-xl">
            <div className="flex items-center gap-3 text-zinc-400 text-sm">
              <Mail className="w-4 h-4 text-zinc-500" />
              <span>Email Address</span>
            </div>
            <span className="font-semibold text-white text-sm">{admin?.email}</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-black border border-zinc-800 rounded-xl">
            <div className="flex items-center gap-3 text-zinc-400 text-sm">
              <Shield className="w-4 h-4 text-zinc-500" />
              <span>Account Status</span>
            </div>
            <span className="font-semibold text-white text-sm uppercase">{admin?.status || 'active'}</span>
          </div>

          {admin?.created_at && (
            <div className="flex items-center justify-between p-4 bg-black border border-zinc-800 rounded-xl">
              <div className="flex items-center gap-3 text-zinc-400 text-sm">
                <Calendar className="w-4 h-4 text-zinc-500" />
                <span>Account Created</span>
              </div>
              <span className="font-semibold text-white text-sm">
                {new Date(admin.created_at).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
