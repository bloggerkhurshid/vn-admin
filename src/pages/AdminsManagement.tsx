import React, { useEffect, useState } from 'react';
import { api } from '../api/axios';
import { AdminUser } from '../types';
import { ShieldCheck, UserPlus, KeyRound, Copy, Check, Trash2 } from 'lucide-react';
import { ToastContainer, ToastMessage } from '../components/Toast';

export const AdminsManagement: React.FC = () => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Add Admin Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addName, setAddName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addRole, setAddRole] = useState<'super_admin' | 'admin'>('admin');
  const [submittingAdd, setSubmittingAdd] = useState(false);

  // Share Link Modal State
  const [activeShareModal, setActiveShareModal] = useState<{
    title: string;
    subtitle: string;
    url: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/admins');
      if (res.data.success) {
        setAdmins(res.data.data);
      }
    } catch (err: any) {
      addToast('error', err.response?.data?.message || 'Failed to fetch admins list.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingAdd(true);

    try {
      const res = await api.post('/admin/admins', {
        name: addName,
        email: addEmail,
        role: addRole,
      });

      if (res.data.success) {
        addToast('success', 'Admin created! Share the activation link.');
        setShowAddModal(false);
        setAddName('');
        setAddEmail('');
        fetchAdmins();

        if (res.data.data.set_password_url) {
          setActiveShareModal({
            title: 'Admin Account Created',
            subtitle: `Share this set-password link with ${addName} (${addEmail}):`,
            url: res.data.data.set_password_url,
          });
        }
      }
    } catch (err: any) {
      addToast('error', err.response?.data?.message || 'Failed to create admin.');
    } finally {
      setSubmittingAdd(false);
    }
  };

  const handleSendSetPassword = async (admin: AdminUser) => {
    try {
      const res = await api.post(`/admin/admins/${admin.id}/send-set-password`);
      if (res.data.success) {
        setActiveShareModal({
          title: 'Send Set-Password Link',
          subtitle: `Activation link generated for ${admin.name}:`,
          url: res.data.data.set_password_url,
        });
      }
    } catch (err: any) {
      addToast('error', err.response?.data?.message || 'Failed to generate link.');
    }
  };

  const handleSendResetPassword = async (admin: AdminUser) => {
    try {
      const res = await api.post(`/admin/admins/${admin.id}/send-reset-password`);
      if (res.data.success) {
        setActiveShareModal({
          title: 'Reset Password Link Issued',
          subtitle: `Send this reset link to ${admin.name}:`,
          url: res.data.data.reset_password_url,
        });
      }
    } catch (err: any) {
      addToast('error', err.response?.data?.message || 'Failed to generate reset link.');
    }
  };

  const handleToggleStatus = async (admin: AdminUser) => {
    const newStatus = admin.status === 'active' ? 'disabled' : 'active';
    try {
      const res = await api.put(`/admin/admins/${admin.id}`, {
        name: admin.name,
        role: admin.role,
        status: newStatus,
      });

      if (res.data.success) {
        addToast('success', `Admin status updated to ${newStatus}.`);
        setAdmins((prev) =>
          prev.map((a) => (a.id === admin.id ? { ...a, status: newStatus } : a))
        );
      }
    } catch (err: any) {
      addToast('error', 'Failed to update admin status.');
    }
  };

  const handleDeleteAdmin = async (admin: AdminUser) => {
    if (admin.role === 'super_admin') {
      addToast('error', 'Super Admin accounts cannot be deleted.');
      return;
    }

    if (!window.confirm(`Delete admin account for ${admin.name}?`)) {
      return;
    }

    try {
      const res = await api.delete(`/admin/admins/${admin.id}`);
      if (res.data.success) {
        addToast('success', 'Admin deleted.');
        setAdmins((prev) => prev.filter((a) => a.id !== admin.id));
      }
    } catch (err: any) {
      addToast('error', err.response?.data?.message || 'Failed to delete admin.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addToast = (type: 'success' | 'error', message: string) => {
    const idStr = Date.now().toString();
    setToasts((prev) => [...prev, { id: idStr, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== idStr));
    }, 4000);
  };

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onDismiss={(idStr) => setToasts((prev) => prev.filter((t) => t.id !== idStr))} />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-white" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Admin Management</h1>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Super Admin restricted area. Manage administrative accounts and password activation links.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-zinc-200 text-black font-bold text-sm rounded-xl shadow-lg transition-all shrink-0 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Admin</span>
        </button>
      </div>

      {/* Admins Table */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-md">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-xs font-semibold uppercase text-zinc-400 tracking-wider bg-black">
                  <th className="py-3.5 px-4">Admin Name</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Created Date & By</th>
                  <th className="py-3.5 px-4 text-right">Password Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {admins.map((adm) => (
                  <tr key={adm.id} className="hover:bg-zinc-900/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">{adm.name}</td>
                    <td className="py-3.5 px-4 text-zinc-300">{adm.email}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-900 text-white border border-zinc-700">
                        {adm.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(adm)}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                          adm.status === 'active'
                            ? 'bg-zinc-800 text-white border border-zinc-600'
                            : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                        }`}
                      >
                        {adm.status}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <div className="text-zinc-300">{new Date(adm.created_at).toLocaleDateString()}</div>
                      <div className="text-zinc-500">by {adm.created_by_name || 'System'}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleSendSetPassword(adm)}
                          className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-white rounded-lg border border-zinc-800 transition-colors cursor-pointer"
                          title="Generate Set Password link"
                        >
                          Set Password Link
                        </button>
                        <button
                          onClick={() => handleSendResetPassword(adm)}
                          className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 rounded-lg border border-zinc-800 transition-colors flex items-center gap-1 cursor-pointer"
                          title="Generate Reset Password link"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>Reset Link</span>
                        </button>
                        {adm.role !== 'super_admin' && (
                          <button
                            onClick={() => handleDeleteAdmin(adm)}
                            className="p-1.5 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                            title="Delete Admin"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl sm:rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-5 shadow-2xl my-auto max-h-[92vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white">Create Admin Account</h3>
            <p className="text-xs text-zinc-400">
              Admin accounts are created without a password. A set-password link will be generated after creation.
            </p>

            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="e.g. Sarah Connor"
                  className="w-full bg-black border border-zinc-800 rounded-xl py-2.5 px-3.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  placeholder="sarah@vntemplates.com"
                  className="w-full bg-black border border-zinc-800 rounded-xl py-2.5 px-3.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Role
                </label>
                <select
                  value={addRole}
                  onChange={(e) => setAddRole(e.target.value as any)}
                  className="w-full bg-black border border-zinc-800 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-white"
                >
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-sm font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAdd}
                  className="px-5 py-2.5 bg-white hover:bg-zinc-200 text-black text-sm font-bold rounded-xl shadow-lg"
                >
                  {submittingAdd ? 'Creating...' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Link Modal */}
      {activeShareModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl sm:rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-5 shadow-2xl my-auto max-h-[92vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white">{activeShareModal.title}</h3>
            <p className="text-xs text-zinc-400">{activeShareModal.subtitle}</p>

            <div className="flex items-center gap-2 p-3 bg-black border border-zinc-800 rounded-xl">
              <input
                type="text"
                readOnly
                value={activeShareModal.url}
                className="bg-transparent text-xs text-zinc-300 flex-1 outline-none font-mono"
              />
              <button
                onClick={() => copyToClipboard(activeShareModal.url)}
                className="p-2 bg-white hover:bg-zinc-200 text-black rounded-lg transition-colors shrink-0 flex items-center gap-1 text-xs font-bold"
              >
                {copied ? <Check className="w-4 h-4 text-black" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            <button
              onClick={() => setActiveShareModal(null)}
              className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-semibold rounded-xl"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
