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
          <Users className="w-6 h-6 text-white" />
          <h1 className="text-2xl font-bold text-white tracking-tight">Registered App Users</h1>
        </div>
        <p className="text-sm text-zinc-400 mt-1">Mobile application registered end-users and favorite metrics</p>
      </div>

      {/* Search Bar */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name or email..."
            className="w-full bg-black border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-md">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-zinc-400">
            <UserCheck className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <p className="font-semibold text-white">No registered users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-xs font-semibold uppercase text-zinc-400 tracking-wider bg-black">
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Phone Number</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4 text-center">Saved Templates</th>
                  <th className="py-3.5 px-4">Registered Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-zinc-900/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-white text-black font-bold flex items-center justify-center text-xs">
                          {u.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{u.name}</div>
                          <div className="text-xs text-zinc-400">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-zinc-400">{u.phone || 'N/A'}</td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          u.status === 'active'
                            ? 'bg-zinc-800 text-white border border-zinc-600'
                            : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-white font-semibold bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800">
                        <Bookmark className="w-3.5 h-3.5 text-zinc-400" />
                        {u.saves_count || 0}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-zinc-400">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
