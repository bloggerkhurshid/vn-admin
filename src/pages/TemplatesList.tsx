import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { api } from '../api/axios';
import { TemplateItem } from '../types';
import { Plus, Search, Eye, Heart, Bookmark, Edit, Trash2, Video, QrCode, ExternalLink, X, Save, Image as ImageIcon, Check } from 'lucide-react';
import { ToastContainer, ToastMessage } from '../components/Toast';

export const TemplatesList: React.FC = () => {
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Preview Modal State
  const [previewMedia, setPreviewMedia] = useState<{ type: 'video' | 'qr'; url: string; title: string } | null>(null);

  // Template Form Modal State (Replaces standalone form page)
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<number | null>(null);

  // Form Field States
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Travel');
  const [formVnLink, setFormVnLink] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formStatus, setFormStatus] = useState<'published' | 'draft'>('published');
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formIsPremium, setFormIsPremium] = useState(false);

  // Form File Upload States
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>('');

  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string>('');

  const [submittingForm, setSubmittingForm] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [categoriesList, setCategoriesList] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    fetchCategories();
    fetchTemplates();
  }, [statusFilter, categoryFilter]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/admin/categories');
      if (res.data.success) {
        setCategoriesList(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/templates', {
        params: {
          status: statusFilter || undefined,
          category: categoryFilter || undefined,
          search: search || undefined,
        },
      });
      if (res.data.success) {
        setTemplates(res.data.data.items || []);
      }
    } catch (err) {
      addToast('error', 'Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTemplates();
  };

  const openCreateModal = () => {
    setEditingTemplateId(null);
    setFormTitle('');
    setFormCategory('Travel');
    setFormVnLink('');
    setFormTags('');
    setFormStatus('published');
    setFormIsFeatured(false);
    setFormIsPremium(false);
    setThumbnailFile(null);
    setThumbnailPreview('');
    setVideoFile(null);
    setVideoPreview('');
    setQrFile(null);
    setQrPreview('');
    setShowFormModal(true);
  };

  const openEditModal = (tpl: TemplateItem) => {
    setEditingTemplateId(tpl.id);
    setFormTitle(tpl.title);
    setFormCategory(tpl.category || 'Travel');
    setFormVnLink(tpl.vn_link || '');
    setFormTags(tpl.tags || '');
    setFormStatus(tpl.status);
    setFormIsFeatured(tpl.is_featured);
    setFormIsPremium(Boolean(tpl.is_premium));
    setThumbnailFile(null);
    setThumbnailPreview(tpl.thumbnail);
    setVideoFile(null);
    setVideoPreview(tpl.video_preview);
    setQrFile(null);
    setQrPreview(tpl.template_qr);
    setShowFormModal(true);
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleQrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setQrFile(file);
      setQrPreview(URL.createObjectURL(file));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitle.trim()) {
      addToast('error', 'Title is required');
      return;
    }

    if (!editingTemplateId) {
      if (!thumbnailFile) {
        addToast('error', 'Please select a Thumbnail image file');
        return;
      }
      if (!videoFile) {
        addToast('error', 'Please select a Video preview file (.mp4)');
        return;
      }
      if (!qrFile) {
        addToast('error', 'Please select a Template QR image file');
        return;
      }
    }

    setSubmittingForm(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('title', formTitle);
      formData.append('category', formCategory);
      formData.append('vn_link', formVnLink);
      formData.append('tags', formTags);
      formData.append('status', formStatus);
      formData.append('is_featured', formIsFeatured ? '1' : '0');
      formData.append('is_premium', formIsPremium ? '1' : '0');

      // Utility: compress and convert images to WEBP/JPEG blob to save bandwidth
      const compressImage = (file: File, maxDimension = 1200): Promise<File> => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = URL.createObjectURL(file);
          img.onload = () => {
            let { width, height } = img;
            if (width > maxDimension || height > maxDimension) {
              if (width > height) {
                height = Math.round((height * maxDimension) / width);
                width = maxDimension;
              } else {
                width = Math.round((width * maxDimension) / height);
                height = maxDimension;
              }
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", { type: 'image/webp' });
                  resolve(compressedFile);
                } else {
                  resolve(file);
                }
              },
              'image/webp',
              0.82
            );
          };
          img.onerror = () => resolve(file);
        });
      };

      if (thumbnailFile) {
        const compressedThumb = await compressImage(thumbnailFile, 1000);
        formData.append('thumbnail', compressedThumb);
      } else if (thumbnailPreview && !thumbnailPreview.startsWith('blob:')) {
        formData.append('thumbnail', thumbnailPreview);
      }

      if (videoFile) {
        formData.append('video_preview', videoFile);
      } else if (videoPreview && !videoPreview.startsWith('blob:')) {
        formData.append('video_preview', videoPreview);
      }

      if (qrFile) {
        const compressedQr = await compressImage(qrFile, 800);
        formData.append('template_qr', compressedQr);
      } else if (qrPreview && !qrPreview.startsWith('blob:')) {
        formData.append('template_qr', qrPreview);
      }

      const config = {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent: any) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        },
      };

      if (editingTemplateId) {
        await api.post(`/admin/templates/${editingTemplateId}`, formData, config);
        addToast('success', 'Template updated successfully');
      } else {
        await api.post('/admin/templates', formData, config);
        addToast('success', 'Template uploaded successfully');
      }

      setShowFormModal(false);
      fetchTemplates();
    } catch (err: any) {
      const serverErrors = err.response?.data?.errors;
      let errorMsg = err.response?.data?.message || err.message || 'Failed to save template';
      if (serverErrors && typeof serverErrors === 'object') {
        const details = Object.values(serverErrors).map(v => typeof v === 'object' ? JSON.stringify(v) : v).filter(Boolean).join(' ');
        if (details) errorMsg = details;
      }
      addToast('error', errorMsg);
    } finally {
      setSubmittingForm(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(`Are you sure you want to delete template "${title}"?`)) {
      return;
    }

    try {
      const res = await api.delete(`/admin/templates/${id}`);
      if (res.data.success) {
        addToast('success', `Template "${title}" deleted.`);
        setTemplates((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (err: any) {
      addToast('error', err.response?.data?.message || 'Failed to delete template.');
    }
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

      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Templates Library</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Upload and manage VN video editing templates</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-black dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black font-bold text-sm rounded-xl shadow-lg transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Template</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-center gap-3 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="w-full sm:flex-1 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or tags..."
            className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-900 dark:focus:border-white"
          />
        </form>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-1/2 sm:w-auto bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-300 text-xs sm:text-sm rounded-xl py-2 px-3 focus:outline-none focus:border-zinc-900 dark:focus:border-white"
          >
            <option value="">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-300 text-sm rounded-xl py-2 px-3 focus:outline-none focus:border-zinc-900 dark:focus:border-white"
          >
            <option value="">All Categories</option>
            {categoriesList.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>

          <button
            onClick={fetchTemplates}
            className="px-4 py-2 bg-zinc-900 dark:bg-zinc-800 hover:bg-black dark:hover:bg-zinc-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Filter
          </button>
        </div>
      </div>

      {/* Templates Table */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-md">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-zinc-900 dark:border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : templates.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 dark:text-zinc-400">
            <Video className="w-12 h-12 text-zinc-400 dark:text-zinc-600 mx-auto mb-3" />
            <p className="font-semibold text-zinc-900 dark:text-white">No templates found</p>
            <p className="text-xs text-zinc-500 mt-1">Upload a template or clear your search filters.</p>
          </div>
        ) : (
          <div className="w-full">
            {/* Mobile Touch-Friendly Card View (visible < 640px) */}
            <div className="block sm:hidden divide-y divide-zinc-200/50 dark:divide-zinc-800/50">
              {templates.map((tpl) => (
                <div key={tpl.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative group w-12 h-12 rounded-xl overflow-hidden bg-zinc-900 shrink-0">
                        <img src={tpl.thumbnail} alt={tpl.title} className="w-full h-full object-cover" />
                        <button
                          onClick={() => setPreviewMedia({ type: 'video', url: tpl.video_preview, title: tpl.title })}
                          className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 active:opacity-100"
                        >
                          <Video className="w-4 h-4" />
                        </button>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-sm text-zinc-900 dark:text-white leading-tight">{tpl.title}</span>
                          {tpl.is_premium && (
                            <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded bg-amber-500/20 text-amber-500 border border-amber-500/30">
                              ⭐ Premium
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                          <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
                            {tpl.category || 'General'}
                          </span>
                          <span>• {tpl.added_by.name}</span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        tpl.status === 'published'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-zinc-500/10 text-zinc-500 border border-zinc-500/20'
                      }`}
                    >
                      {tpl.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-200/40 dark:border-zinc-800/40">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400">
                        <Eye className="w-3 h-3 text-zinc-400" />
                        {tpl.views}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold">
                        <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                        {tpl.saves_count}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPreviewMedia({ type: 'qr', url: tpl.template_qr, title: tpl.title })}
                        className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                        title="QR Code"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(tpl)}
                        className="p-2 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                        title="Edit Template"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tpl.id, tpl.title)}
                        className="p-2 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Delete Template"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View (visible >= 640px) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-zinc-200/80 dark:border-zinc-800/80 text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400 tracking-wider">
                    <th className="py-3.5 px-4">Thumbnail</th>
                    <th className="py-3.5 px-4">Title & Details</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Added By</th>
                    <th className="py-3.5 px-4 text-center">Views / Likes</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-800/50 text-zinc-700 dark:text-zinc-300">
                  {templates.map((tpl) => (
                    <tr key={tpl.id} className="hover:bg-white/40 dark:hover:bg-zinc-900/40 transition-colors">
                      {/* Thumbnail */}
                      <td className="py-3.5 px-4">
                        <div className="relative group w-12 h-12 rounded-xl overflow-hidden bg-black border border-zinc-200 dark:border-zinc-800">
                          <img src={tpl.thumbnail} alt={tpl.title} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 transition-opacity">
                            <button
                              onClick={() => setPreviewMedia({ type: 'video', url: tpl.video_preview, title: tpl.title })}
                              title="Preview Video"
                              className="p-1 bg-white text-black rounded"
                            >
                              <Video className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setPreviewMedia({ type: 'qr', url: tpl.template_qr, title: tpl.title })}
                              title="View QR Code"
                              className="p-1 bg-zinc-800 text-white rounded"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Title */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-zinc-900 dark:text-white">{tpl.title}</span>
                          {tpl.is_premium && (
                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40">
                              ⭐ Premium
                            </span>
                          )}
                        </div>
                        {tpl.vn_link && (
                          <a
                            href={tpl.vn_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-white mt-0.5"
                          >
                            VN Link <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800">
                          {tpl.category || 'General'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            tpl.status === 'published'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : 'bg-zinc-500/10 text-zinc-500 border border-zinc-500/30'
                          }`}
                        >
                          {tpl.status}
                        </span>
                      </td>

                      {/* Added By & Date */}
                      <td className="py-3.5 px-4 text-xs">
                        <div className="font-medium text-zinc-900 dark:text-zinc-200">{tpl.added_by.name}</div>
                        <div className="text-zinc-500 mt-0.5">{new Date(tpl.created_at).toLocaleDateString()}</div>
                      </td>

                      {/* Stats */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-3 text-xs">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
                            <Eye className="w-3.5 h-3.5 text-zinc-400" />
                            {tpl.views}
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold border border-rose-200/80 dark:border-rose-900/50">
                            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                            {tpl.saves_count}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(tpl)}
                            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            title="Edit Template"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(tpl.id, tpl.title)}
                            className="p-2 rounded-lg text-zinc-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Delete Template"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* TEMPLATE FORM MODAL (Upload / Edit Template) */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="glass-modal rounded-2xl sm:rounded-3xl max-w-3xl w-full p-4 sm:p-7 space-y-6 shadow-2xl my-auto max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-5">
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <span>{editingTemplateId ? 'Edit Template' : 'Upload New Template'}</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Fill in metadata and select video, thumbnail, and QR image files
                </p>
              </div>
              <button
                onClick={() => setShowFormModal(false)}
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                    Template Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Aesthetic Summer Vlog"
                    className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-white transition-colors"
                  >
                    {categoriesList.length === 0 ? (
                      <option value="General">General</option>
                    ) : (
                      categoriesList.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  VN Template ID / Intent Link *
                </label>
                <input
                  type="text"
                  value={formVnLink}
                  onChange={async (e) => {
                    const val = e.target.value;
                    setFormVnLink(val);
                    if (val.trim()) {
                      try {
                        const qrDataUrl = await QRCode.toDataURL(val.trim(), { width: 600, margin: 2 });
                        setQrPreview(qrDataUrl);
                        // Convert Data URL to File object for form submission
                        const blob = await (await fetch(qrDataUrl)).blob();
                        const generatedFile = new File([blob], `qr_${Date.now()}.webp`, { type: 'image/webp' });
                        setQrFile(generatedFile);
                      } catch (err) {
                        console.error('QR generation failed', err);
                      }
                    }
                  }}
                  placeholder="e.g. 926992 or intent://template?id=926992#Intent..."
                  className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white transition-colors"
                />
                {qrPreview && (
                  <p className="text-[11px] text-emerald-400 mt-1.5 flex items-center gap-1 font-medium">
                    <Check className="w-3.5 h-3.5" /> Auto-generated QR image from Template ID!
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  Tags (Comma Separated)
                </label>
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  placeholder="travel, summer, vlogging, beatsync"
                  className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white transition-colors"
                />
              </div>

              {/* Status & Options Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-zinc-900/40 p-4 border border-zinc-800/80 rounded-2xl">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Publish Status
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="published"
                        checked={formStatus === 'published'}
                        onChange={() => setFormStatus('published')}
                        className="accent-white"
                      />
                      <span>Published</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="draft"
                        checked={formStatus === 'draft'}
                        onChange={() => setFormStatus('draft')}
                        className="accent-white"
                      />
                      <span>Draft</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Featured Status
                  </label>
                  <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsFeatured}
                      onChange={(e) => setFormIsFeatured(e.target.checked)}
                      className="w-4 h-4 rounded accent-white"
                    />
                    <span>Featured Template</span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Monetization
                  </label>
                  <label className="flex items-center gap-2 text-sm text-amber-400 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsPremium}
                      onChange={(e) => setFormIsPremium(e.target.checked)}
                      className="w-4 h-4 rounded accent-amber-500"
                    />
                    <span>⭐ Premium Template</span>
                  </label>
                </div>
              </div>

              {/* Media Upload Dropzones */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Thumbnail Dropzone */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                    Thumbnail Image *
                  </label>
                  <div className="border border-dashed border-zinc-700 hover:border-white rounded-2xl p-4 text-center bg-black transition-colors relative min-h-40 flex flex-col items-center justify-center group">
                    {thumbnailPreview ? (
                      <div className="relative w-full h-32 rounded-xl overflow-hidden">
                        <img src={thumbnailPreview} alt="Thumbnail" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <span className="text-xs font-semibold text-black bg-white px-3 py-1 rounded-lg">Change</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="w-7 h-7 text-zinc-500 mb-1.5" />
                        <p className="text-xs text-zinc-300 font-semibold">Click or drag image</p>
                        <p className="text-[10px] text-zinc-500 mt-1">JPG, PNG, WEBP</p>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleThumbnailChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </div>
                  {submittingForm && thumbnailFile && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono text-zinc-400">
                        <span>Thumbnail</span>
                        <span className="text-white font-bold">{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-white h-full transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Video Dropzone */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                    Video (.mp4) *
                  </label>
                  <div className="border border-dashed border-zinc-700 hover:border-white rounded-2xl p-4 text-center bg-black transition-colors relative min-h-40 flex flex-col items-center justify-center group">
                    {videoPreview ? (
                      <div className="relative w-full h-32 rounded-xl overflow-hidden bg-zinc-900 flex items-center justify-center">
                        <video src={videoPreview} className="w-full h-full object-cover" />
                        <div className="absolute top-2 right-2 bg-white text-black p-1 rounded-md">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    ) : (
                      <>
                        <Video className="w-7 h-7 text-zinc-500 mb-1.5" />
                        <p className="text-xs text-zinc-300 font-semibold">Click or drag MP4 video</p>
                        <p className="text-[10px] text-zinc-500 mt-1">Max 50MB</p>
                      </>
                    )}
                    <input
                      type="file"
                      accept="video/mp4,video/quicktime,video/webm"
                      onChange={handleVideoChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </div>
                  {submittingForm && videoFile && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono text-zinc-400">
                        <span>Video ({Math.round((videoFile.size / (1024 * 1024)).toFixed(1) as any)}MB)</span>
                        <span className="text-white font-bold">{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-white h-full transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* QR Dropzone */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                    QR Image *
                  </label>
                  <div className="border border-dashed border-zinc-700 hover:border-white rounded-2xl p-4 text-center bg-black transition-colors relative min-h-40 flex flex-col items-center justify-center group">
                    {qrPreview ? (
                      <div className="relative w-full h-32 rounded-xl overflow-hidden bg-white p-2 flex items-center justify-center">
                        <img src={qrPreview} alt="QR Code" className="max-h-full object-contain" />
                      </div>
                    ) : (
                      <>
                        <QrCode className="w-7 h-7 text-zinc-500 mb-1.5" />
                        <p className="text-xs text-zinc-300 font-semibold">Click or drag QR image</p>
                        <p className="text-[10px] text-zinc-500 mt-1">PNG, JPG</p>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleQrChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </div>
                  {submittingForm && qrFile && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono text-zinc-400">
                        <span>QR Code</span>
                        <span className="text-white font-bold">{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-white h-full transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Bar Container */}
              {submittingForm && (
                <div className="bg-black border border-zinc-800 rounded-2xl p-4 space-y-2.5 shadow-lg">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-zinc-300 flex items-center gap-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                      <span>Uploading Template Media Files...</span>
                    </span>
                    <span className="text-white font-mono text-sm">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-zinc-900 rounded-full h-2.5 overflow-hidden border border-zinc-800">
                    <div
                      className="bg-white h-full rounded-full transition-all duration-200 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingForm}
                  className="px-6 py-2.5 bg-white hover:bg-zinc-200 text-black text-sm font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {submittingForm ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Uploading ({uploadProgress}%)</span>
                    </div>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{editingTemplateId ? 'Save Changes' : 'Publish Template'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Preview Modal */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="glass-modal rounded-2xl sm:rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl my-auto max-h-[92vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{previewMedia.title}</h3>
            {previewMedia.type === 'video' ? (
              <video src={previewMedia.url} controls autoPlay className="w-full rounded-xl max-h-80 bg-black border border-zinc-200 dark:border-zinc-800" />
            ) : (
              <div className="bg-white p-4 rounded-xl flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
                <img src={previewMedia.url} alt="QR Code" className="w-48 h-48 object-contain" />
              </div>
            )}
            <button
              onClick={() => setPreviewMedia(null)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-indigo-500/20"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
