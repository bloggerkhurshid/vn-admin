import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../api/axios';
import { ArrowLeft, Upload, Video, QrCode, Image as ImageIcon, Save, Check } from 'lucide-react';
import { ToastContainer, ToastMessage } from '../components/Toast';

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

  // File uploads or preview URLs
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>('');

  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    if (isEdit) {
      fetchTemplateDetails();
    }
  }, [id]);

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
        setIsFeatured(tpl.is_featured);
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

      if (isEdit) {
        await api.put(`/admin/templates/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        addToast('success', 'Template updated successfully');
      } else {
        await api.post('/admin/templates', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        addToast('success', 'Template uploaded successfully');
      }

      setTimeout(() => navigate('/templates'), 1000);
    } catch (err: any) {
      addToast('error', err.response?.data?.message || 'Failed to save template');
    } finally {
      setLoading(false);
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
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
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
          className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">{isEdit ? 'Edit Template' : 'Upload New Template'}</h1>
          <p className="text-sm text-slate-400 mt-0.5">Provide template files, QR deep link, and metadata</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Details Card */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-lg">
          <h2 className="text-lg font-bold text-slate-100 border-b border-slate-800 pb-3">1. Basic Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Template Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Aesthetic Summer Travel Vlog"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
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
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              VN Share Link (Decoded in QR)
            </label>
            <input
              type="url"
              value={vnLink}
              onChange={(e) => setVnLink(e.target.value)}
              placeholder="https://https://vt.tiktok.com/..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Tags (Comma Separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="travel, summer, vlogging, beatsync"
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Publish Status
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="published"
                    checked={status === 'published'}
                    onChange={() => setStatus('published')}
                    className="accent-indigo-500"
                  />
                  <span>Published</span>
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="draft"
                    checked={status === 'draft'}
                    onChange={() => setStatus('draft')}
                    className="accent-indigo-500"
                  />
                  <span>Draft</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Template Flags
              </label>
              <div className="flex flex-col sm:flex-row gap-4 pt-1">
                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded accent-indigo-500"
                  />
                  <span>Featured Template</span>
                </label>

                <label className="flex items-center gap-2 text-sm text-amber-400 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPremium}
                    onChange={(e) => setIsPremium(e.target.checked)}
                    className="w-4 h-4 rounded accent-amber-500"
                  />
                  <span>⭐ Premium Template (Requires Rewarded Ad to unlock)</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* File Uploaders Card */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-lg">
          <h2 className="text-lg font-bold text-slate-100 border-b border-slate-800 pb-3">2. Media Files & QR Code</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Thumbnail Upload */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Thumbnail Image *
              </label>
              <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-4 text-center bg-slate-950/60 transition-colors relative min-h-48 flex flex-col items-center justify-center">
                {thumbnailPreview ? (
                  <div className="relative w-full h-36 rounded-xl overflow-hidden group">
                    <img src={thumbnailPreview} alt="Thumbnail Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-xs text-white bg-indigo-600 px-3 py-1 rounded-lg">Change File</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="w-8 h-8 text-slate-500 mb-2" />
                    <p className="text-xs text-slate-400 font-medium">Click or drag image</p>
                    <p className="text-[10px] text-slate-600 mt-1">JPG, PNG, WEBP</p>
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

            {/* Video Preview Upload */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Video Preview (.mp4) *
              </label>
              <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-4 text-center bg-slate-950/60 transition-colors relative min-h-48 flex flex-col items-center justify-center">
                {videoPreview ? (
                  <div className="relative w-full h-36 rounded-xl overflow-hidden bg-black flex items-center justify-center">
                    <video src={videoPreview} className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 bg-indigo-600 text-white p-1 rounded">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ) : (
                  <>
                    <Video className="w-8 h-8 text-slate-500 mb-2" />
                    <p className="text-xs text-slate-400 font-medium">Click or drag MP4 video</p>
                    <p className="text-[10px] text-slate-600 mt-1">Max 50MB</p>
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

            {/* QR Code Upload */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Template QR Image *
              </label>
              <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-4 text-center bg-slate-950/60 transition-colors relative min-h-48 flex flex-col items-center justify-center">
                {qrPreview ? (
                  <div className="relative w-full h-36 rounded-xl overflow-hidden bg-white p-2 flex items-center justify-center">
                    <img src={qrPreview} alt="QR Code" className="max-h-full object-contain" />
                  </div>
                ) : (
                  <>
                    <QrCode className="w-8 h-8 text-slate-500 mb-2" />
                    <p className="text-xs text-slate-400 font-medium">Click or drag QR image</p>
                    <p className="text-[10px] text-slate-600 mt-1">PNG, JPG</p>
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
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link
            to="/templates"
            className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-sm transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
