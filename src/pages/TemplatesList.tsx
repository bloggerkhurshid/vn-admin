import React, { useEffect, useState } from 'react';
import { api } from '../api/axios';
import { TemplateItem } from '../types';
import { Plus, Search, Eye, Bookmark, Edit, Trash2, Video, QrCode, ExternalLink, X, Save, Image as ImageIcon, Check } from 'lucide-react';
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

  useEffect(() => {
    fetchTemplates();
  }, [statusFilter, categoryFilter]);

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

    try {
      const formData = new FormData();
      formData.append('title', formTitle);
      formData.append('category', formCategory);
      formData.append('vn_link', formVnLink);
      formData.append('tags', formTags);
      formData.append('status', formStatus);
      formData.append('is_featured', formIsFeatured ? '1' : '0');
      formData.append('is_premium', formIsPremium ? '1' : '0');

      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      } else if (thumbnailPreview && !thumbnailPreview.startsWith('blob:')) {
        formData.append('thumbnail', thumbnailPreview);
      }

      if (videoFile) {
        formData.append('video_preview', videoFile);
      } else if (videoPreview && !videoPreview.startsWith('blob:')) {
        formData.append('video_preview', videoPreview);
      }

      if (qrFile) {
        formData.append('template_qr', qrFile);
      } else if (qrPreview && !qrPreview.startsWith('blob:')) {
        formData.append('template_qr', qrPreview);
      }

      if (editingTemplateId) {
        await api.post(`/admin/templates/${editingTemplateId}`, formData);
        addToast('success', 'Template updated successfully');
      } else {
        await api.post('/admin/templates', formData);
        addToast('success', 'Template uploaded successfully');
      }

      setShowFormModal(false);
      fetchTemplates();
    } catch (err: any) {
      const serverErrors = err.response?.data?.errors;
      let errorMsg = err.response?.data?.message || 'Failed to save template';
      if (serverErrors && typeof serverErrors === 'object') {
        const details = Object.values(serverErrors).filter(Boolean).join(' ');
        if (details) errorMsg = details;
      }
      addToast('error', errorMsg);
    } finally {
      setSubmittingForm(false);
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
          <h1 className="text-2xl font-bold text-white tracking-tight">Templates Library</h1>
          <p className="text-sm text-zinc-400 mt-1">Upload and manage VN video editing templates</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-zinc-200 text-black font-bold text-sm rounded-xl shadow-lg transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Template</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or tags..."
            className="w-full bg-black border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-black border border-zinc-800 text-zinc-300 text-sm rounded-xl py-2 px-3 focus:outline-none focus:border-white"
          >
            <option value="">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-black border border-zinc-800 text-zinc-300 text-sm rounded-xl py-2 px-3 focus:outline-none focus:border-white"
          >
            <option value="">All Categories</option>
            <option value="Travel">Travel</option>
            <option value="Vlog">Vlog</option>
            <option value="Aesthetic">Aesthetic</option>
            <option value="Reels">Reels</option>
            <option value="Beat Sync">Beat Sync</option>
          </select>

          <button
            onClick={fetchTemplates}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Filter
          </button>
        </div>
      </div>

      {/* Templates Table */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-md">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : templates.length === 0 ? (
          <div className="p-12 text-center text-zinc-400">
            <Video className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <p className="font-semibold text-white">No templates found</p>
            <p className="text-xs text-zinc-500 mt-1">Upload a template or clear your search filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-xs font-semibold uppercase text-zinc-400 tracking-wider bg-black">
                  <th className="py-3.5 px-4">Thumbnail</th>
                  <th className="py-3.5 px-4">Title & Details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Added By</th>
                  <th className="py-3.5 px-4 text-center">Views / Saves</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {templates.map((tpl) => (
                  <tr key={tpl.id} className="hover:bg-zinc-900/60 transition-colors">
                    {/* Thumbnail */}
                    <td className="py-3.5 px-4">
                      <div className="relative group w-14 h-14 rounded-xl overflow-hidden bg-black border border-zinc-800">
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
                        <span className="font-semibold text-white">{tpl.title}</span>
                        {tpl.is_premium && (
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/40">
                            ⭐ Premium
                          </span>
                        )}
                      </div>
                      {tpl.vn_link && (
                        <a
                          href={tpl.vn_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white mt-0.5"
                        >
                          VN Link <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-900 text-zinc-300 border border-zinc-800">
                        {tpl.category || 'General'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          tpl.status === 'published'
                            ? 'bg-zinc-800 text-white border border-zinc-600'
                            : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                        }`}
                      >
                        {tpl.status}
                      </span>
                    </td>

                    {/* Added By & Date */}
                    <td className="py-3.5 px-4 text-xs">
                      <div className="font-medium text-zinc-200">{tpl.added_by.name}</div>
                      <div className="text-zinc-500 mt-0.5">{new Date(tpl.created_at).toLocaleDateString()}</div>
                    </td>

                    {/* Stats */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-3 text-xs">
                        <span className="inline-flex items-center gap-1 text-zinc-400">
                          <Eye className="w-3.5 h-3.5 text-zinc-500" />
                          {tpl.views}
                        </span>
                        <span className="inline-flex items-center gap-1 text-white font-semibold">
                          <Bookmark className="w-3.5 h-3.5 text-zinc-400" />
                          {tpl.saves_count}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(tpl)}
                          className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                          title="Edit Template"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(tpl.id, tpl.title)}
                          className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
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
        )}
      </div>

      {/* TEMPLATE FORM MODAL (Upload / Edit Template) */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-3xl w-full p-6 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {editingTemplateId ? 'Edit Template' : 'Upload New Template'}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">Fill in template details and upload media files</p>
              </div>
              <button
                onClick={() => setShowFormModal(false)}
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Template Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Aesthetic Travel Vlog"
                    className="w-full bg-black border border-zinc-800 rounded-xl py-2.5 px-3.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-white"
                  >
                    <option value="Travel">Travel</option>
                    <option value="Vlog">Vlog</option>
                    <option value="Aesthetic">Aesthetic</option>
                    <option value="Reels">Reels</option>
                    <option value="Beat Sync">Beat Sync</option>
                    <option value="Cinematic">Cinematic</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  VN Share Link (Decoded in QR)
                </label>
                <input
                  type="url"
                  value={formVnLink}
                  onChange={(e) => setFormVnLink(e.target.value)}
                  placeholder="https://vt.tiktok.com/..."
                  className="w-full bg-black border border-zinc-800 rounded-xl py-2.5 px-3.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Tags (Comma Separated)
                </label>
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  placeholder="travel, summer, vlogging, beatsync"
                  className="w-full bg-black border border-zinc-800 rounded-xl py-2.5 px-3.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Status
                  </label>
                  <div className="flex gap-4 pt-1">
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
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Featured
                  </label>
                  <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={formIsFeatured}
                      onChange={(e) => setFormIsFeatured(e.target.checked)}
                      className="w-4 h-4 rounded accent-white"
                    />
                    <span>Featured</span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Monetization
                  </label>
                  <label className="flex items-center gap-2 text-sm text-amber-400 font-semibold cursor-pointer pt-1">
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

              {/* Media File Upload Dropzones */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {/* Thumbnail */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                    Thumbnail *
                  </label>
                  <div className="border border-dashed border-zinc-700 hover:border-white rounded-xl p-3 text-center bg-black transition-colors relative min-h-36 flex flex-col items-center justify-center">
                    {thumbnailPreview ? (
                      <div className="relative w-full h-28 rounded-lg overflow-hidden">
                        <img src={thumbnailPreview} alt="Thumbnail" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="w-6 h-6 text-zinc-500 mb-1" />
                        <p className="text-xs text-zinc-400">Click or drag image</p>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleThumbnailChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </div>
                </div>

                {/* Video Preview */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                    Video (.mp4) *
                  </label>
                  <div className="border border-dashed border-zinc-700 hover:border-white rounded-xl p-3 text-center bg-black transition-colors relative min-h-36 flex flex-col items-center justify-center">
                    {videoPreview ? (
                      <div className="relative w-full h-28 rounded-lg overflow-hidden bg-zinc-900 flex items-center justify-center">
                        <video src={videoPreview} className="w-full h-full object-cover" />
                        <div className="absolute top-1 right-1 bg-white text-black p-1 rounded">
                          <Check className="w-3 h-3" />
                        </div>
                      </div>
                    ) : (
                      <>
                        <Video className="w-6 h-6 text-zinc-500 mb-1" />
                        <p className="text-xs text-zinc-400">Click or drag video</p>
                      </>
                    )}
                    <input
                      type="file"
                      accept="video/mp4,video/quicktime,video/webm"
                      onChange={handleVideoChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </div>
                </div>

                {/* QR Image */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                    QR Image *
                  </label>
                  <div className="border border-dashed border-zinc-700 hover:border-white rounded-xl p-3 text-center bg-black transition-colors relative min-h-36 flex flex-col items-center justify-center">
                    {qrPreview ? (
                      <div className="relative w-full h-28 rounded-lg overflow-hidden bg-white p-1 flex items-center justify-center">
                        <img src={qrPreview} alt="QR Code" className="max-h-full object-contain" />
                      </div>
                    ) : (
                      <>
                        <QrCode className="w-6 h-6 text-zinc-500 mb-1" />
                        <p className="text-xs text-zinc-400">Click or drag QR</p>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleQrChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-sm font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingForm}
                  className="px-5 py-2.5 bg-white hover:bg-zinc-200 text-black text-sm font-bold rounded-xl shadow-lg flex items-center gap-2"
                >
                  {submittingForm ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
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
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">{previewMedia.title}</h3>
            {previewMedia.type === 'video' ? (
              <video src={previewMedia.url} controls autoPlay className="w-full rounded-xl max-h-80 bg-black" />
            ) : (
              <div className="bg-white p-4 rounded-xl flex items-center justify-center">
                <img src={previewMedia.url} alt="QR Code" className="w-48 h-48 object-contain" />
              </div>
            )}
            <button
              onClick={() => setPreviewMedia(null)}
              className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold rounded-xl text-sm transition-colors"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
