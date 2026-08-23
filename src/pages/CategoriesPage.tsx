import React, { useEffect, useState } from 'react';
import { api } from '../api/axios';
import { Layers, Plus, Edit2, Trash2, X, Image as ImageIcon, Upload as UploadIcon, Check } from 'lucide-react';
import { ToastContainer, ToastMessage } from '../components/Toast';

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  thumbnail: string;
  created_at: string;
}

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [name, setName] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/admin/categories');
      if (res.data.success) {
        setCategories(res.data.data);
      }
    } catch (err: any) {
      addToast('error', err.response?.data?.message || 'Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setName('');
    setThumbnailFile(null);
    setThumbnailPreview('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setName(cat.name);
    setThumbnailFile(null);
    setThumbnailPreview(cat.thumbnail);
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('error', 'Category name is required.');
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('name', name);
    if (thumbnailFile) {
      formData.append('thumbnail', thumbnailFile);
    }

    try {
      if (editingCategory) {
        const res = await api.post(`/admin/categories/${editingCategory.id}`, formData);
        if (res.data.success) {
          addToast('success', 'Category updated successfully!');
          fetchCategories();
          setIsModalOpen(false);
        }
      } else {
        const res = await api.post('/admin/categories', formData);
        if (res.data.success) {
          addToast('success', 'Category created successfully!');
          fetchCategories();
          setIsModalOpen(false);
        }
      }
    } catch (err: any) {
      addToast('error', err.response?.data?.message || 'Failed to save category.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (cat: CategoryItem) => {
    if (!window.confirm(`Are you sure you want to delete category "${cat.name}"?`)) return;

    try {
      const res = await api.delete(`/admin/categories/${cat.id}`);
      if (res.data.success) {
        addToast('success', 'Category deleted successfully!');
        setCategories((prev) => prev.filter((item) => item.id !== cat.id));
      }
    } catch (err: any) {
      addToast('error', err.response?.data?.message || 'Failed to delete category.');
    }
  };

  const addToast = (type: 'success' | 'error', message: string) => {
    const idStr = Date.now().toString();
    setToasts((prev) => [...prev, { id: idStr, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== idStr));
    }, 4000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <ToastContainer toasts={toasts} onDismiss={(idStr) => setToasts((prev) => prev.filter((t) => t.id !== idStr))} />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-6 h-6 text-zinc-900 dark:text-white" />
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Categories Management</h1>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Create, update, and manage template categories with custom thumbnails
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-black dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black font-bold rounded-xl shadow-lg transition-all text-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Categories Glass Container */}
      <div className="glass-card rounded-3xl overflow-hidden">
        {/* Mobile Touch-Friendly Card View (visible < 640px) */}
        <div className="block sm:hidden divide-y divide-zinc-200/50 dark:divide-zinc-800/50">
          {categories.map((cat) => (
            <div key={cat.id} className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {cat.thumbnail ? (
                  <img
                    src={cat.thumbnail}
                    alt={cat.name}
                    className="w-12 h-12 rounded-xl object-cover bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-400 shrink-0">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-base text-zinc-900 dark:text-white leading-tight">{cat.name}</h3>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono mt-0.5 block">{cat.slug}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleOpenEditModal(cat)}
                  className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl transition-colors font-semibold text-xs flex items-center gap-1"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(cat)}
                  className="p-2.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl transition-colors font-semibold text-xs flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <div className="p-8 text-center text-zinc-500 text-sm">
              No categories found. Click "Add New Category" to create one.
            </div>
          )}
        </div>

        {/* Desktop Clean Glass Table View (visible >= 640px) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-700 dark:text-zinc-300">
            <thead className="text-xs uppercase font-semibold text-zinc-400 dark:text-zinc-500 border-b border-zinc-200/50 dark:border-zinc-800/50">
              <tr>
                <th className="px-6 py-4">Thumbnail</th>
                <th className="px-6 py-4">Category Name</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/40 dark:divide-zinc-800/40">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-white/40 dark:hover:bg-zinc-900/40 transition-colors">
                  <td className="px-6 py-3.5">
                    {cat.thumbnail ? (
                      <img
                        src={cat.thumbnail}
                        alt={cat.name}
                        className="w-11 h-11 rounded-xl object-cover bg-zinc-100 dark:bg-zinc-900"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-400">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-3.5 font-bold text-zinc-900 dark:text-white text-sm">{cat.name}</td>
                  <td className="px-6 py-3.5 text-zinc-500 dark:text-zinc-400 font-mono text-xs">{cat.slug}</td>
                  <td className="px-6 py-3.5 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEditModal(cat)}
                      className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 rounded-xl transition-colors inline-flex items-center gap-1.5 text-xs font-semibold"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 rounded-xl transition-colors inline-flex items-center gap-1.5 text-xs font-semibold"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                    No categories found. Click "Add New Category" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-5 bg-black/60 dark:bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="glass-modal rounded-2xl sm:rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-5 my-0 sm:my-auto max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                  Category Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Travel, Vlog, Reels"
                  required
                  className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl py-2.5 px-3.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                  Category Thumbnail Image
                </label>
                <div className="flex items-center gap-4">
                  {thumbnailPreview ? (
                    <img
                      src={thumbnailPreview}
                      alt="Preview"
                      className="w-16 h-16 rounded-2xl object-cover border border-zinc-200 dark:border-zinc-700"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-500">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}

                  <label className="flex-1 cursor-pointer bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 flex items-center justify-center gap-2 text-xs font-semibold text-zinc-800 dark:text-white transition-colors">
                    <UploadIcon className="w-4 h-4" />
                    <span>{thumbnailFile ? thumbnailFile.name : 'Choose Thumbnail Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-800 dark:text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-black dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black font-bold rounded-xl text-sm transition-all flex items-center gap-1.5"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingCategory ? 'Save Changes' : 'Create Category'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
