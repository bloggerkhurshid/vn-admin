import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../api/axios';
import { ArrowLeft, Video, QrCode, Image as ImageIcon, Save, Check } from 'lucide-react';
import { ToastContainer, ToastMessage } from '../components/Toast';
import QRCode from 'qrcode';

interface CategoryItem {
  id: number;
  name: string;
}

export const TemplateForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Travel');
  const [vnLink, setVnLink] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [categoriesList, setCategoriesList] = useState<CategoryItem[]>([]);

  // File uploads or preview URLs
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>('');

  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchTemplateDetails();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/admin/categories');
      if (res.data.success) {
        setCategoriesList(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch categories list');
    }
  };

  const fetchTemplateDetails = async () => {
    try {
      const res = await api.get(`/api/templates/${id}`);
      if (res.data.success) {
        const tpl = res.data.data;
        setTitle(tpl.title);
        setCategory(tpl.category || 'Travel');
        setVnLink(tpl.vn_link || '');
        setTags(tpl.tags || '');
        setStatus(tpl.status);
        setIsFeatured(Boolean(tpl.is_featured));
        setIsPremium(Boolean(tpl.is_premium));
        setThumbnailPreview(tpl.thumbnail);
        setVideoPreview(tpl.video_preview);
        setQrPreview(tpl.template_qr);
      }
    } catch (err) {
      addToast('error', 'Failed to fetch template details');
    } finally {
      setFetching(false);
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      addToast('error', 'Title is required');
      return;
    }

    if (!isEdit && (!thumbnailFile && !thumbnailPreview)) {
      addToast('error', 'Thumbnail image is required');
      return;
    }

    if (!isEdit && (!videoFile && !videoPreview)) {
      addToast('error', 'Video preview is required');
      return;
    }

    if (!isEdit && (!qrFile && !qrPreview)) {
      addToast('error', 'Template QR code image is required');
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('category', category);
      formData.append('vn_link', vnLink);
      formData.append('tags', tags);
      formData.append('status', status);
      formData.append('is_featured', isFeatured ? '1' : '0');
      formData.append('is_premium', isPremium ? '1' : '0');

      if (thumbnailFile) formData.append('thumbnail', thumbnailFile);
      if (videoFile) formData.append('video_preview', videoFile);
      if (qrFile) formData.append('template_qr', qrFile);

      const config = {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent: any) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        },
      };

      if (isEdit) {
        await api.post(`/admin/templates/${id}`, formData, config);
        addToast('success', 'Template updated successfully');
      } else {
        await api.post('/admin/templates', formData, config);
        addToast('success', 'Template uploaded successfully');
      }

      setTimeout(() => navigate('/templates'), 1000);
    } catch (err: any) {
      addToast('error', err.response?.data?.message || 'Failed to save template');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const addToast = (type: 'success' | 'error', message: string) => {
    const toastId = Date.now().toString();
    setToasts((prev) => [...prev, { id: toastId, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toastId));
    }, 4000);
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-indigo-600 dark:border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <ToastContainer toasts={toasts} onDismiss={(toastId) => setToasts((prev) => prev.filter((t) => t.id !== toastId))} />

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/templates"
          className="p-2.5 glass-card rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">{isEdit ? 'Edit Template' : 'Upload New Template'}</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Provide template files, QR deep link, and metadata</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Details Card */}
        <div className="glass-card rounded-3xl p-6 space-y-5">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white border-b border-zinc-200/50 dark:border-zinc-800/50 pb-3">1. Basic Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                Template Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Aesthetic Summer Travel Vlog"
                className="w-full glass-input rounded-xl py-3 px-4 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full glass-input rounded-xl py-3 px-4 text-sm"
              >
                {categoriesList.length === 0 ? (
                  <option value="General" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">General</option>
                ) : (
                  categoriesList.map((cat) => (
                    <option key={cat.id} value={cat.name} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
                      {cat.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
              VN Template ID / Intent Link *
            </label>
            <input
              type="text"
              value={vnLink}
              onChange={async (e) => {
                const val = e.target.value;
                setVnLink(val);
                if (val.trim()) {
                  try {
                    const qrDataUrl = await QRCode.toDataURL(val.trim(), { width: 600, margin: 2 });
                    setQrPreview(qrDataUrl);
                    const blob = await (await fetch(qrDataUrl)).blob();
                    const generatedFile = new File([blob], `qr_${Date.now()}.webp`, { type: 'image/webp' });
                    setQrFile(generatedFile);
                  } catch (err) {
                    console.error('QR generation failed', err);
                  }
                }
              }}
              placeholder="e.g. 926992 or intent://template?id=926992#Intent..."
              className="w-full glass-input rounded-xl py-3 px-4 text-sm"
            />
            {qrPreview && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1.5 flex items-center gap-1 font-medium">
                <Check className="w-3.5 h-3.5" /> Auto-generated QR image from Template ID!
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
              Tags (Comma Separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="travel, summer, vlogging, beatsync"
              className="w-full glass-input rounded-xl py-3 px-4 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                Publish Status
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-zinc-900 dark:text-white cursor-pointer font-medium">
                  <input
                    type="radio"
                    name="status"
                    value="published"
                    checked={status === 'published'}
                    onChange={() => setStatus('published')}
                    className="accent-indigo-600"
                  />
                  <span>Published</span>
                </label>
                <label className="flex items-center gap-2 text-sm text-zinc-900 dark:text-white cursor-pointer font-medium">
                  <input
                    type="radio"
                    name="status"
                    value="draft"
                    checked={status === 'draft'}
                    onChange={() => setStatus('draft')}
                    className="accent-indigo-600"
                  />
                  <span>Draft</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Template Flags
              </label>
              <div className="flex flex-col sm:flex-row gap-4 pt-1">
                <label className="flex items-center gap-2 text-sm text-zinc-900 dark:text-white cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded accent-indigo-600"
                  />
                  <span>Featured Template</span>
                </label>

                <label className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPremium}
                    onChange={(e) => setIsPremium(e.target.checked)}
                    className="w-4 h-4 rounded accent-amber-500"
                  />
                  <span>⭐ Premium Template</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* File Uploaders Card */}
        <div className="glass-card rounded-3xl p-6 space-y-6">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white border-b border-zinc-200/50 dark:border-zinc-800/50 pb-3">2. Media Files &amp; QR Code</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Thumbnail Upload */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                Thumbnail Image *
              </label>
              <div className="border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-indigo-500 rounded-2xl p-4 text-center glass-card transition-colors relative min-h-48 flex flex-col items-center justify-center group">
                {thumbnailPreview ? (
                  <div className="relative w-full h-36 rounded-xl overflow-hidden">
                    <img src={thumbnailPreview} alt="Thumbnail Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-xs text-white bg-indigo-600 px-3 py-1 rounded-lg">Change File</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="w-8 h-8 text-zinc-400 mb-2" />
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 font-semibold">Click or drag image</p>
                    <p className="text-[10px] text-zinc-400 mt-1">JPG, PNG, WEBP</p>
                  </>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleThumbnailChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>
              {loading && thumbnailFile && (
                <div className="space-y-1 mt-2">
                  <div className="flex justify-between text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                    <span>Uploading Thumbnail</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-mono font-bold">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}
            </div>

            {/* Video Preview Upload */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                Video Preview (.mp4) *
              </label>
              <div className="border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-indigo-500 rounded-2xl p-4 text-center glass-card transition-colors relative min-h-48 flex flex-col items-center justify-center">
                {videoPreview ? (
                  <div className="relative w-full h-36 rounded-xl overflow-hidden bg-black flex items-center justify-center">
                    <video src={videoPreview} className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 bg-indigo-600 text-white p-1 rounded">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ) : (
                  <>
                    <Video className="w-8 h-8 text-zinc-400 mb-2" />
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 font-semibold">Click or drag MP4 video</p>
                    <p className="text-[10px] text-zinc-400 mt-1">Max 50MB</p>
                  </>
                )}
                <input
                  type="file"
                  accept="video/mp4,video/quicktime,video/webm"
                  onChange={handleVideoChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>
              {loading && videoFile && (
                <div className="space-y-1 mt-2">
                  <div className="flex justify-between text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                    <span>Uploading Video</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-mono font-bold">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}
            </div>

            {/* QR Code Upload */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                Template QR Image *
              </label>
              <div className="border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-indigo-500 rounded-2xl p-4 text-center glass-card transition-colors relative min-h-48 flex flex-col items-center justify-center">
                {qrPreview ? (
                  <div className="relative w-full h-36 rounded-xl overflow-hidden bg-white p-2 flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
                    <img src={qrPreview} alt="QR Code" className="max-h-full object-contain" />
                  </div>
                ) : (
                  <>
                    <QrCode className="w-8 h-8 text-zinc-400 mb-2" />
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 font-semibold">Click or drag QR image</p>
                    <p className="text-[10px] text-zinc-400 mt-1">PNG, JPG</p>
                  </>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleQrChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>
              {loading && qrFile && (
                <div className="space-y-1 mt-2">
                  <div className="flex justify-between text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                    <span>Uploading QR Image</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-mono font-bold">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Upload Progress Bar */}
        {loading && (
          <div className="glass-card rounded-3xl p-5 space-y-3 shadow-lg">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-zinc-900 dark:text-white flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-ping" />
                <span>Uploading Template Media Files...</span>
              </span>
              <span className="text-indigo-600 dark:text-indigo-400 font-mono text-sm font-bold">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-3 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-300 ease-out shadow-sm shadow-indigo-500/50"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link
            to="/templates"
            className="px-5 py-3 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold rounded-xl text-sm transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Uploading ({uploadProgress}%)</span>
              </div>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isEdit ? 'Save Changes' : 'Publish Template'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
