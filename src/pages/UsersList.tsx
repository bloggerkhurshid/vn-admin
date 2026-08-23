import React, { useEffect, useState } from 'react';
import { api } from '../api/axios';
import { AppUser } from '../types';
import { Users, Bookmark, Search, UserCheck } from 'lucide-react';

export const UsersList: React.FC = () => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch users list', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-zinc-900 dark:text-white" />
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Registered App Users</h1>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Mobile application registered end-users and favorite metrics</p>
      </div>

      {/* Search Bar */}
      <div className="glass-card rounded-2xl p-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name or email..."
            className="w-full glass-input rounded-xl py-2 pl-10 pr-4 text-sm"
          />
        </div>
      </div>

      {/* Users Container */}
      <div className="glass-card rounded-3xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-indigo-600 dark:border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-zinc-400">
            <UserCheck className="w-12 h-12 text-zinc-500 mx-auto mb-3" />
            <p className="font-semibold text-zinc-900 dark:text-white">No registered users found</p>
          </div>
        ) : (
          <div className="w-full">
            {/* Mobile Touch Card View (< 640px) */}
            <div className="block sm:hidden divide-y divide-zinc-200/50 dark:divide-zinc-800/50">
              {filteredUsers.map((u) => (
                <div key={u.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold flex items-center justify-center text-xs shadow-md">
                        {u.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-zinc-900 dark:text-white">{u.name}</div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">{u.email}</div>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        u.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : 'bg-zinc-500/10 text-zinc-500 border border-zinc-500/30'
                      }`}
                    >
                      {u.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-200/40 dark:border-zinc-800/40 text-zinc-500 dark:text-zinc-400">
                    <span>Phone: {u.phone || 'N/A'}</span>
                    <span className="inline-flex items-center gap-1.5 font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-lg border border-rose-200/80 dark:border-rose-900/50">
                      <Bookmark className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                      {u.saves_count ?? 0} saved
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View (>= 640px) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-zinc-200/50 dark:border-zinc-800/50 text-xs uppercase font-semibold text-zinc-400 dark:text-zinc-500">
                    <th className="py-3.5 px-6">User</th>
                    <th className="py-3.5 px-6">Phone Number</th>
                    <th className="py-3.5 px-6">Account Status</th>
                    <th className="py-3.5 px-6 text-center">Saved Templates</th>
                    <th className="py-3.5 px-6">Registered Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/40 dark:divide-zinc-800/40 text-zinc-700 dark:text-zinc-300">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-white/40 dark:hover:bg-zinc-900/40 transition-colors">
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                            {u.name ? u.name.substring(0, 2).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-zinc-900 dark:text-white">{u.name}</div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-6 text-zinc-500 dark:text-zinc-400">{u.phone || 'N/A'}</td>

                      <td className="py-3.5 px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            u.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : 'bg-zinc-500/10 text-zinc-500 border border-zinc-500/30'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-6 text-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200/80 dark:border-indigo-900/50">
                          <Bookmark className="w-3.5 h-3.5 fill-indigo-500 text-indigo-500" />
                          {u.saves_count ?? 0} saved
                        </span>
                      </td>

                      <td className="py-3.5 px-6 text-xs text-zinc-500 dark:text-zinc-400">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
