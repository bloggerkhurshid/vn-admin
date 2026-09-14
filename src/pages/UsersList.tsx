import React, { useEffect, useState } from 'react';
import { api } from '../api/axios';
import { AppUser } from '../types';
import { Users, Search, UserCheck, Trash2, X, AlertTriangle } from 'lucide-react';
import { ToastContainer, ToastMessage } from '../components/Toast';
import { timeAgo } from '../utils/timeAgo';

export const UsersList: React.FC = () => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [userToDelete, setUserToDelete] = useState<AppUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const addToast = (type: 'success' | 'error', message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch users list', err);
      addToast('error', 'Failed to fetch users list');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      const res = await api.delete(`/admin/users/${userToDelete.id}`);
      if (res.data.success) {
        setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
        addToast('success', res.data.message || `User ${userToDelete.name} deleted successfully.`);
        setUserToDelete(null);
      } else {
        addToast('error', res.data.message || 'Failed to delete user.');
      }
    } catch (err: any) {
      addToast('error', err.response?.data?.message || 'Failed to delete user account.');
    } finally {
      setIsDeleting(false);
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
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Mobile application registered end-users, status, and management</p>
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
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : 'bg-zinc-500/10 text-zinc-500 border border-zinc-500/30'
                        }`}
                      >
                        {u.status}
                      </span>
                      <button
                        onClick={() => setUserToDelete(u)}
                        className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        title={`Delete ${u.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-200/40 dark:border-zinc-800/40 text-zinc-500 dark:text-zinc-400">
                    <span>Joined</span>
                    <span className="font-mono text-zinc-700 dark:text-zinc-300 font-semibold" title={new Date(u.created_at).toLocaleString()}>
                      {timeAgo(u.created_at)}
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
                    <th className="py-3.5 px-6">Account Status</th>
                    <th className="py-3.5 px-6">Joined</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/40 dark:divide-zinc-800/40 text-zinc-700 dark:text-zinc-300">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-white/40 dark:hover:bg-zinc-900/40 transition-colors">
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                            {u.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-zinc-900 dark:text-white">{u.name}</div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400">{u.email}</div>
                          </div>
                        </div>
                      </td>

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

                      <td className="py-3.5 px-6 text-xs text-zinc-500 dark:text-zinc-400 font-medium" title={new Date(u.created_at).toLocaleString()}>
                        {timeAgo(u.created_at)}
                      </td>

                      <td className="py-3.5 px-6 text-right">
                        <button
                          onClick={() => setUserToDelete(u)}
                          className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all duration-200"
                          title={`Delete ${u.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md glass-card rounded-3xl p-6 border border-zinc-200/50 dark:border-zinc-800/80 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20">
                <Trash2 className="w-6 h-6" />
              </div>
              <button
                onClick={() => !isDeleting && setUserToDelete(null)}
                disabled={isDeleting}
                className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-white rounded-xl transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Delete User Account</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Are you sure you want to delete user <strong className="text-zinc-900 dark:text-white">{userToDelete.name}</strong> ({userToDelete.email})?
              </p>
              <div className="flex items-start gap-2 text-xs text-red-600 dark:text-red-400 mt-3 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>All saved templates, favorites, and profile data for this user will be permanently removed. This action cannot be undone.</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setUserToDelete(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete User</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};
