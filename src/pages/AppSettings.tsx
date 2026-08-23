import React, { useEffect, useState } from 'react';
import { api } from '../api/axios';
import { AppConfig } from '../types';
import { Settings, DollarSign, Save, FileText, Shield, Scale, Send } from 'lucide-react';
import { ToastContainer, ToastMessage } from '../components/Toast';

export const AppSettings: React.FC = () => {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Form Field States
  const [appName, setAppName] = useState('VN Templates');
  const [primaryColor, setPrimaryColor] = useState('#000000');
  const [secondaryColor, setSecondaryColor] = useState('#18181b');
  const [accentColor, setAccentColor] = useState('#ffffff');
  const [backgroundMode, setBackgroundMode] = useState<'dark' | 'light'>('dark');
  const [adsEnabled, setAdsEnabled] = useState(true);
  const [admobBannerId, setAdmobBannerId] = useState('');
  const [admobInterstitialId, setAdmobInterstitialId] = useState('');
  const [admobNativeId, setAdmobNativeId] = useState('');
  const [admobAppOpenId, setAdmobAppOpenId] = useState('');
  const [onesignalAppId, setOnesignalAppId] = useState('');
  const [onesignalRestKey, setOnesignalRestKey] = useState('');
  const [vnPackageName, setVnPackageName] = useState('com.frontrow.vlog');
  const [privacyPolicyUrl, setPrivacyPolicyUrl] = useState('');
  const [termsUrl, setTermsUrl] = useState('');

  // Manual Notification States
  const [customTitle, setCustomTitle] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [customLaunchUrl, setCustomLaunchUrl] = useState('');
  const [sendingNotification, setSendingNotification] = useState(false);

  // Markdown Legal Policies States
  const [privacyPolicyMarkdown, setPrivacyPolicyMarkdown] = useState('');
  const [termsMarkdown, setTermsMarkdown] = useState('');
  const [copyrightPolicyMarkdown, setCopyrightPolicyMarkdown] = useState('');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await api.get('/app/config');
      if (res.data.success) {
        const cfg: AppConfig = res.data.data;
        setConfig(cfg);
        setAppName(cfg.app_name);
        setPrimaryColor(cfg.primary_color);
        setSecondaryColor(cfg.secondary_color);
        setAccentColor(cfg.accent_color);
        setBackgroundMode(cfg.background_mode);
        setAdsEnabled(cfg.ads_enabled);
        setAdmobBannerId(cfg.admob_banner_id);
        setAdmobInterstitialId(cfg.admob_interstitial_id);
        setAdmobNativeId(cfg.admob_native_id);
        setAdmobAppOpenId(cfg.admob_app_open_id || '');
        setOnesignalAppId(cfg.onesignal_app_id || '');
        setOnesignalRestKey(cfg.onesignal_rest_key || '');
        setVnPackageName(cfg.vn_package_name);
        setPrivacyPolicyUrl(cfg.privacy_policy_url);
        setTermsUrl(cfg.terms_url);
        setPrivacyPolicyMarkdown(cfg.privacy_policy_markdown || '');
        setTermsMarkdown(cfg.terms_markdown || '');
        setCopyrightPolicyMarkdown(cfg.copyright_policy_markdown || '');
      }
    } catch (err) {
      addToast('error', 'Failed to load app settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendManualNotification = async () => {
    if (!customTitle.trim() || !customMessage.trim()) {
      addToast('error', 'Please enter a notification Title and Message.');
      return;
    }

    setSendingNotification(true);
    try {
      const res = await api.post('/admin/notifications/send', {
        title: customTitle.trim(),
        message: customMessage.trim(),
        image_url: customImageUrl.trim(),
        launch_url: customLaunchUrl.trim(),
      });

      if (res.data.success) {
        addToast('success', res.data.message || 'Push notification sent to all active users!');
        setCustomTitle('');
        setCustomMessage('');
        setCustomImageUrl('');
        setCustomLaunchUrl('');
      } else {
        addToast('error', res.data.message || 'Failed to send push notification.');
      }
    } catch (err: any) {
      addToast('error', err.response?.data?.message || 'Error sending push notification.');
    } finally {
      setSendingNotification(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await api.post('/admin/app/config', {
        app_name: appName,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        accent_color: accentColor,
        background_mode: backgroundMode,
        ads_enabled: adsEnabled ? 1 : 0,
        admob_banner_id: admobBannerId,
        admob_interstitial_id: admobInterstitialId,
        admob_native_id: admobNativeId,
        admob_app_open_id: admobAppOpenId,
        onesignal_app_id: onesignalAppId,
        onesignal_rest_key: onesignalRestKey,
        vn_package_name: vnPackageName,
        privacy_policy_url: privacyPolicyUrl,
        terms_url: termsUrl,
        privacy_policy_markdown: privacyPolicyMarkdown,
        terms_markdown: termsMarkdown,
        copyright_policy_markdown: copyrightPolicyMarkdown,
      });

      if (res.data.success) {
        addToast('success', 'App settings & markdown legal policies updated successfully!');
      }
    } catch (err: any) {
      addToast('error', err.response?.data?.message || 'Failed to update settings.');
    } finally {
      setSaving(false);
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
    <div className="space-y-6 max-w-4xl mx-auto">
      <ToastContainer toasts={toasts} onDismiss={(idStr) => setToasts((prev) => prev.filter((t) => t.id !== idStr))} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-zinc-900 dark:text-white" />
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">App &amp; Policy Settings</h1>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Manage AdMob monetization IDs &amp; Markdown Legal Policies for the mobile app
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* AdMob Ads Manager */}
        <div className="glass-card rounded-3xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-200/50 dark:border-zinc-800/50 pb-3">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">AdMob Ads Monetization</h2>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={adsEnabled}
                onChange={(e) => setAdsEnabled(e.target.checked)}
                className="w-4 h-4 rounded accent-indigo-600"
              />
              <span className="text-xs font-semibold text-zinc-900 dark:text-white uppercase tracking-wider">Enable Ads</span>
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                AdMob Banner Unit ID
              </label>
              <input
                type="text"
                value={admobBannerId}
                onChange={(e) => setAdmobBannerId(e.target.value)}
                placeholder="ca-app-pub-3940256099942544/6300978111"
                className="w-full glass-input rounded-xl py-2.5 px-3.5 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                AdMob Interstitial Unit ID
              </label>
              <input
                type="text"
                value={admobInterstitialId}
                onChange={(e) => setAdmobInterstitialId(e.target.value)}
                placeholder="ca-app-pub-3940256099942544/1033173712"
                className="w-full glass-input rounded-xl py-2.5 px-3.5 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                AdMob Native Unit ID
              </label>
              <input
                type="text"
                value={admobNativeId}
                onChange={(e) => setAdmobNativeId(e.target.value)}
                placeholder="ca-app-pub-3940256099942544/2247696110"
                className="w-full glass-input rounded-xl py-2.5 px-3.5 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                AdMob App Open Unit ID
              </label>
              <input
                type="text"
                value={admobAppOpenId}
                onChange={(e) => setAdmobAppOpenId(e.target.value)}
                placeholder="ca-app-pub-3940256099942544/9257395921"
                className="w-full glass-input rounded-xl py-2.5 px-3.5 text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* OneSignal Push Notifications Manager */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-5 shadow-md">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
            <span className="text-xl">🔔</span>
            <h2 className="text-lg font-bold text-white">OneSignal Push Notifications</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                OneSignal App ID
              </label>
              <input
                type="text"
                value={onesignalAppId}
                onChange={(e) => setOnesignalAppId(e.target.value)}
                placeholder="e.g. 5eb7a318-6b87-430b-93de-..."
                className="w-full bg-black border border-zinc-800 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-zinc-600 font-mono focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                OneSignal REST API Key (For Auto-Pushing New Templates)
              </label>
              <input
                type="password"
                value={onesignalRestKey}
                onChange={(e) => setOnesignalRestKey(e.target.value)}
                placeholder="os_v2_app_..."
                className="w-full bg-black border border-zinc-800 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-zinc-600 font-mono focus:outline-none focus:border-white"
              />
              <p className="text-[11px] text-zinc-400 mt-1">
                When set, creating any new template in the admin panel automatically broadcasts push notifications to all mobile users.
              </p>
            </div>
          </div>
        </div>

        {/* Manual Push Notification Broadcast Card */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-5 shadow-md">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
            <Send className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Send Manual Push Notification</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Notification Title *
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="e.g. 🔥 Trending Template Released!"
                className="w-full bg-black border border-zinc-800 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Notification Message *
              </label>
              <textarea
                rows={3}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Check out our new exclusive VN video editing template available now..."
                className="w-full bg-black border border-zinc-800 rounded-xl p-3.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Big Banner Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  placeholder="https://example.com/banner.jpg"
                  className="w-full bg-black border border-zinc-800 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Click Launch URL (Optional)
                </label>
                <input
                  type="url"
                  value={customLaunchUrl}
                  onChange={(e) => setCustomLaunchUrl(e.target.value)}
                  placeholder="https://vntemplates.com"
                  className="w-full bg-black border border-zinc-800 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white font-mono"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSendManualNotification}
              disabled={sendingNotification}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              {sendingNotification ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Broadcast Notification Now</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Markdown Legal Policies Editor */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-5 shadow-md">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
            <FileText className="w-5 h-5 text-white" />
            <h2 className="text-lg font-bold text-white">App Legal &amp; Policies (Markdown Format)</h2>
          </div>

          {/* Privacy Policy */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Shield className="w-4 h-4 text-emerald-400" />
              <label className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
                Privacy Policy (Markdown)
              </label>
            </div>
            <textarea
              rows={6}
              value={privacyPolicyMarkdown}
              onChange={(e) => setPrivacyPolicyMarkdown(e.target.value)}
              placeholder="# Privacy Policy..."
              className="w-full bg-black border border-zinc-800 rounded-xl p-3.5 text-xs text-white placeholder-zinc-600 font-mono focus:outline-none focus:border-white leading-relaxed"
            />
          </div>

          {/* Terms & Conditions */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Scale className="w-4 h-4 text-indigo-400" />
              <label className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
                Terms &amp; Conditions (Markdown)
              </label>
            </div>
            <textarea
              rows={6}
              value={termsMarkdown}
              onChange={(e) => setTermsMarkdown(e.target.value)}
              placeholder="# Terms &amp; Conditions..."
              className="w-full bg-black border border-zinc-800 rounded-xl p-3.5 text-xs text-white placeholder-zinc-600 font-mono focus:outline-none focus:border-white leading-relaxed"
            />
          </div>

          {/* Copyright Policy */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <FileText className="w-4 h-4 text-rose-400" />
              <label className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
                Copyright Policy (Markdown)
              </label>
            </div>
            <textarea
              rows={6}
              value={copyrightPolicyMarkdown}
              onChange={(e) => setCopyrightPolicyMarkdown(e.target.value)}
              placeholder="# Copyright Policy..."
              className="w-full bg-black border border-zinc-800 rounded-xl p-3.5 text-xs text-white placeholder-zinc-600 font-mono focus:outline-none focus:border-white leading-relaxed"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 px-4 bg-white hover:bg-zinc-200 text-black font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>Save App Settings &amp; Policies</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
