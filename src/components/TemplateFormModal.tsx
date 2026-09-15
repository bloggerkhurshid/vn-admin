import React, { useState, useEffect } from 'react';
import { api } from '../api/axios';
import { X, ImageIcon, Video, QrCode, Check, Save } from 'lucide-react';
import QRCode from 'qrcode';
import { TemplateItem } from '../types';

interface TemplateFormModalProps {
  onClose: () => void;
  onSuccess?: () => void;
  editingTemplate?: TemplateItem | null;
  addToast: (type: 'success' | 'error', message: string) => void;
}

export const TemplateFormModal: React.FC<TemplateFormModalProps> = ({
  onClose,
  onSuccess,
  editingTemplate,
  addToast,
}) => {
  const [categoriesList, setCategoriesList] = useState<{ id: number; name: string }[]>([]);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Travel');
  const [formVnLink, setFormVnLink] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formStatus, setFormStatus] = useState<'published' | 'draft'>('published');
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formIsPremium, setFormIsPremium] = useState(false);

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>('');

  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string>('');

  const [submittingForm, setSubmittingForm] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    // Fetch categories for the select dropdown
    api.get('/admin/categories')
      .then(res => {
        if (res.data.success) {
          setCategoriesList(res.data.data || []);
        }
      })
      .catch(() => {});

    // Initialize form if editing
    if (editingTemplate) {
      setFormTitle(editingTemplate.title);
      setFormCategory(editingTemplate.category || 'Travel');
      setFormVnLink(editingTemplate.vn_link || '');
      setFormTags(editingTemplate.tags || '');
      setFormStatus(editingTemplate.status);
      setFormIsFeatured(editingTemplate.is_featured);
      setFormIsPremium(Boolean(editingTemplate.is_premium));
      setThumbnailPreview(editingTemplate.thumbnail);
      setVideoPreview(editingTemplate.video_preview);
      setQrPreview(editingTemplate.template_qr);
    }
  }, [editingTemplate]);

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

    if (!editingTemplate) {
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

      if (editingTemplate) {
        await api.post(`/admin/templates/${editingTemplate.id}`, formData, config);
        addToast('success', 'Template updated successfully');
      } else {
        await api.post('/admin/templates', formData, config);
        addToast('success', 'Template uploaded successfully');
      }

      if (onSuccess) onSuccess();
      onClose();
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

  return (
    <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative glass-modal rounded-2xl sm:rounded-3xl max-w-3xl w-full p-4 sm:p-7 space-y-6 shadow-2xl max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 my-0 sm:my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-200/50 dark:border-zinc-800/50 pb-4">
          <div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>{editingTemplate ? 'Edit Template' : 'Upload New Template'}</span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Fill in template metadata and upload video, thumbnail, and QR image files
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-5">
          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                Template Title *
              </label>
              <input
                type="text"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Aesthetic Summer Vlog"
                className="w-full glass-input rounded-xl py-2.5 px-3.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full glass-input rounded-xl py-2.5 px-3.5 text-sm"
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
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
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
                    const blob = await (await fetch(qrDataUrl)).blob();
                    const generatedFile = new File([blob], `qr_${Date.now()}.webp`, { type: 'image/webp' });
                    setQrFile(generatedFile);
                  } catch (err) {
                    console.error('QR generation failed', err);
                  }
                }
              }}
              placeholder="e.g. 926992 or intent://template?id=926992#Intent..."
              className="w-full glass-input rounded-xl py-2.5 px-3.5 text-sm"
            />
            {qrPreview && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1.5 flex items-center gap-1 font-medium">
                <Check className="w-3.5 h-3.5" /> Auto-generated QR image from Template ID!
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
              Tags (Comma Separated)
            </label>
            <input
              type="text"
              value={formTags}
              onChange={(e) => setFormTags(e.target.value)}
              placeholder="travel, summer, vlogging, beatsync"
              className="w-full glass-input rounded-xl py-2.5 px-3.5 text-sm"
            />
          </div>

          {/* Status & Options Row with Sleek Toggle Switches */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 glass-card rounded-2xl">
            {/* Publish Status Toggle */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                Publish Status
              </label>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setFormStatus(formStatus === 'published' ? 'draft' : 'published')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    formStatus === 'published' ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      formStatus === 'published' ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className="text-xs font-bold text-zinc-900 dark:text-white capitalize">
                  {formStatus}
                </span>
              </div>
            </div>

            {/* Featured Status Toggle */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                Featured Status
              </label>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setFormIsFeatured(!formIsFeatured)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    formIsFeatured ? 'bg-indigo-600' : 'bg-zinc-300 dark:bg-zinc-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      formIsFeatured ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className="text-xs font-bold text-zinc-900 dark:text-white">
                  {formIsFeatured ? 'Featured' : 'Normal'}
                </span>
              </div>
            </div>

            {/* Monetization Toggle */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                Monetization
              </label>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setFormIsPremium(!formIsPremium)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    formIsPremium ? 'bg-amber-500' : 'bg-zinc-300 dark:bg-zinc-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      formIsPremium ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  {formIsPremium ? '⭐ Premium' : 'Free Access'}
                </span>
              </div>
            </div>
          </div>

          {/* Media Upload Dropzones */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Thumbnail Dropzone */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                Thumbnail Image *
              </label>
              <div className="border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-indigo-500 rounded-2xl p-3 text-center glass-card transition-colors relative min-h-36 flex flex-col items-center justify-center group">
                {thumbnailPreview ? (
                  <div className="relative w-full h-28 rounded-xl overflow-hidden">
                    <img src={thumbnailPreview} alt="Thumbnail" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-xs font-semibold text-white bg-indigo-600 px-3 py-1 rounded-lg">Change</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="w-6 h-6 text-zinc-400 mb-1" />
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 font-semibold">Click or drag image</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">JPG, PNG, WEBP</p>
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
                  <div className="flex justify-between text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                    <span>Thumbnail</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-indigo-600 h-full transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}
            </div>

            {/* Video Dropzone */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                Video (.mp4) *
              </label>
              <div className="border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-indigo-500 rounded-2xl p-3 text-center glass-card transition-colors relative min-h-36 flex flex-col items-center justify-center group">
                {videoPreview ? (
                  <div className="relative w-full h-28 rounded-xl overflow-hidden bg-zinc-900 flex items-center justify-center">
                    <video src={videoPreview} className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 bg-indigo-600 text-white p-1 rounded-md">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ) : (
                  <>
                    <Video className="w-6 h-6 text-zinc-400 mb-1" />
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 font-semibold">Click or drag MP4 video</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">Max 50MB</p>
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
                  <div className="flex justify-between text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                    <span>Video ({Math.round((videoFile.size / (1024 * 1024)).toFixed(1) as any)}MB)</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-indigo-600 h-full transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}
            </div>

            {/* QR Dropzone */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                QR Image *
              </label>
              <div className="border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-indigo-500 rounded-2xl p-3 text-center glass-card transition-colors relative min-h-36 flex flex-col items-center justify-center group">
                {qrPreview ? (
                  <div className="relative w-full h-28 rounded-xl overflow-hidden bg-white p-1.5 flex items-center justify-center">
                    <img src={qrPreview} alt="QR Code" className="max-h-full object-contain" />
                  </div>
                ) : (
                  <>
                    <QrCode className="w-6 h-6 text-zinc-400 mb-1" />
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 font-semibold">Click or drag QR image</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">PNG, JPG</p>
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
                  <div className="flex justify-between text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                    <span>QR Code</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-indigo-600 h-full transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar Container */}
          {submittingForm && (
            <div className="glass-card rounded-2xl p-4 space-y-2.5 shadow-lg">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-zinc-900 dark:text-white flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-ping" />
                  <span>Uploading Template Media Files...</span>
                </span>
                <span className="text-indigo-600 dark:text-indigo-400 font-mono text-sm font-bold">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-200 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-200/50 dark:border-zinc-800/50">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingForm}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {submittingForm ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Uploading ({uploadProgress}%)</span>
                </div>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{editingTemplate ? 'Save Changes' : 'Publish Template'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
