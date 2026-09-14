import React, { useEffect, useState } from 'react';
import { api } from '../api/axios';
import { AppConfig } from '../types';
import { Settings, DollarSign, Save, FileText, Shield, Scale, Send, Mail, Key, Eye, EyeOff, Sparkles, RotateCcw } from 'lucide-react';
import { ToastContainer, ToastMessage } from '../components/Toast';

interface NotificationPreset {
  id: string;
  badge: string;
  icon: string;
  name: string;
  title: string;
  message: string;
  launchUrl?: string;
}

const NOTIFICATION_PRESETS: NotificationPreset[] = [
  {
    id: 'trending',
    badge: 'Trending',
    icon: '🔥',
    name: 'Viral Templates',
    title: '🔥 Trending Viral Templates Just Dropped!',
    message: 'New aesthetic reels & TikTok editing templates are now available. Tap to use them in VN Video Editor!',
  },
  {
    id: 'cinematic',
    badge: 'Cinematic',
    icon: '🎬',
    name: 'Cinema LUTs',
    title: '🎬 New Cinematic & Film LUT Templates',
    message: 'Transform your raw footage into high-end cinema quality with our newest color grading templates. Try now!',
  },
  {
    id: 'update',
    badge: 'App Update',
    icon: '🚀',
    name: 'Version 1.0.5 Live',
    title: '🚀 App Update v1.0.5 Is Here!',
    message: 'Smoother video playback, Google In-App updates & new features added. Update now on Google Play!',
  },
  {
    id: 'beatsync',
    badge: 'Music & Beats',
    icon: '🎵',
    name: 'Beat Sync',
    title: '🎵 Fast Beat-Sync Video Templates Added',
    message: 'Sync your cuts perfectly to trending rhythms with just one tap. Create your viral reel today!',
  },
  {
    id: 'weekend',
    badge: 'Weekend',
    icon: '🎉',
    name: 'Weekend Edit',
    title: '🎉 Weekend Creator Special: 30+ New Styles',
    message: 'Fresh weekend vlog, travel & aesthetic templates are waiting for you. Level up your timeline!',
  },
  {
    id: 'review',
    badge: 'Community',
    icon: '⭐',
    name: 'Rate Us',
    title: '⭐ Loving VN Templates? Support Us with 5 Stars!',
    message: 'Your feedback helps us create better templates every week. Tap here to leave a quick review on Google Play!',
  },
  {
    id: 'reels',
    badge: 'Social Media',
    icon: '⚡',
    name: 'Instagram Reels',
    title: '⚡ Go Viral This Week on Instagram & TikTok',
    message: 'Top video creators are using these trending templates. Jump on the trend before everyone else does!',
  },
  {
    id: 'aesthetic',
    badge: 'Aesthetic',
    icon: '✨',
    name: 'Vintage & Retro',
    title: '✨ 90s Vintage & Retro Film Templates Added',
    message: 'Give your memories a nostalgic film look with grainy textures, date stamps & VHS effects.',
  },
];

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

  // Google Auth States
  const [googleAuthEnabled, setGoogleAuthEnabled] = useState(true);
  const [googleClientId, setGoogleClientId] = useState('');
  const [googleClientSecret, setGoogleClientSecret] = useState('');
  const [showGoogleSecret, setShowGoogleSecret] = useState(false);

  // SMTP Email States
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [smtpEncryption, setSmtpEncryption] = useState('tls');
  const [smtpFromEmail, setSmtpFromEmail] = useState('');
  const [smtpFromName, setSmtpFromName] = useState('VN Templates');
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [testingSmtp, setTestingSmtp] = useState(false);

  // Manual Notification States
  const [customTitle, setCustomTitle] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [customLaunchUrl, setCustomLaunchUrl] = useState('');
  const [sendingNotification, setSendingNotification] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

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
        setBackgroundMode((cfg.background_mode as any) || 'dark');
        setAdsEnabled(Boolean(cfg.ads_enabled));
        setAdmobBannerId(cfg.admob_banner_id || '');
        setAdmobInterstitialId(cfg.admob_interstitial_id || '');
        setAdmobNativeId(cfg.admob_native_id || '');
        setAdmobAppOpenId(cfg.admob_app_open_id || '');
        setOnesignalAppId(cfg.onesignal_app_id || '');
        setOnesignalRestKey(cfg.onesignal_rest_key || '');
        setGoogleAuthEnabled(Boolean(cfg.google_auth_enabled));
        setGoogleClientId(cfg.google_client_id || '');
        setGoogleClientSecret(cfg.google_client_secret || '');
        setSmtpHost(cfg.smtp_host || '');
        setSmtpPort(Number(cfg.smtp_port) || 587);
        setSmtpUser(cfg.smtp_user || '');
        setSmtpPass(cfg.smtp_pass || '');
        setSmtpEncryption(cfg.smtp_encryption || 'tls');
        setSmtpFromEmail(cfg.smtp_from_email || '');
        setSmtpFromName(cfg.smtp_from_name || 'VN Templates');
        setVnPackageName(cfg.vn_package_name || 'com.frontrow.vlog');
        setPrivacyPolicyUrl(cfg.privacy_policy_url || '');
        setTermsUrl(cfg.terms_url || '');
        setPrivacyPolicyMarkdown(cfg.privacy_policy_markdown || '');
        setTermsMarkdown(cfg.terms_markdown || '');
        setCopyrightPolicyMarkdown(cfg.copyright_policy_markdown || '');
      }
    } catch (err) {
      addToast('error', 'Failed to fetch settings from API.');
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
        setSelectedPresetId(null);
      } else {
        addToast('error', res.data.message || 'Failed to send push notification.');
      }
    } catch (err: any) {
      addToast('error', err.response?.data?.message || 'Error sending push notification.');
    } finally {
      setSendingNotification(false);
    }
  };

  const handleTestSmtp = async () => {
    if (!testEmailAddress.trim()) {
      addToast('error', 'Please enter a valid destination email address for testing.');
      return;
    }
    setTestingSmtp(true);
    try {
      const res = await api.post('/admin/smtp/test', {
        email: testEmailAddress.trim()
      });
      if (res.data.success) {
        addToast('success', res.data.message || 'Test email dispatched successfully via SMTP!');
      } else {
        addToast('error', res.data.message || 'SMTP test failed.');
      }
    } catch (err: any) {
      addToast('error', err.response?.data?.message || 'SMTP connection/auth error.');
    } finally {
      setTestingSmtp(false);
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
        google_auth_enabled: googleAuthEnabled ? 1 : 0,
        google_client_id: googleClientId,
        google_client_secret: googleClientSecret,
        ads_enabled: adsEnabled ? 1 : 0,
        admob_banner_id: admobBannerId,
        admob_interstitial_id: admobInterstitialId,
        admob_native_id: admobNativeId,
        admob_app_open_id: admobAppOpenId,
        onesignal_app_id: onesignalAppId,
        onesignal_rest_key: onesignalRestKey,
        smtp_host: smtpHost,
        smtp_port: smtpPort,
        smtp_user: smtpUser,
        smtp_pass: smtpPass,
        smtp_encryption: smtpEncryption,
        smtp_from_email: smtpFromEmail,
        smtp_from_name: smtpFromName,
        vn_package_name: vnPackageName,
        privacy_policy_url: privacyPolicyUrl,
        terms_url: termsUrl,
        privacy_policy_markdown: privacyPolicyMarkdown,
        terms_markdown: termsMarkdown,
        copyright_policy_markdown: copyrightPolicyMarkdown,
      });

      if (res.data.success) {
        addToast('success', 'App settings, Google auth & SMTP credentials updated successfully!');
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

  const [activeTab, setActiveTab] = useState<'ads' | 'push' | 'google' | 'smtp' | 'legal'>('ads');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-indigo-600 dark:border-white border-t-transparent rounded-full animate-spin"></div>
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
            Manage AdMob monetization, push notifications, Google auth, SMTP credentials, and legal policies
          </p>
        </div>
      </div>

      {/* Tab Pill Navigation */}
      <div className="flex items-center gap-2 p-1.5 glass-card rounded-2xl w-fit flex-wrap">
        <button
          type="button"
          onClick={() => setActiveTab('ads')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'ads'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Monetization &amp; Ads</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('push')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'push'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Push Notifications</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('google')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'google'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Google Auth</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('smtp')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'smtp'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>SMTP Email</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('legal')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'legal'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Legal &amp; Policies</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* TAB 1: AdMob Ads Manager */}
        {activeTab === 'ads' && (
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
        )}

        {/* TAB 2: OneSignal Push Notifications & Broadcast */}
        {activeTab === 'push' && (
          <div className="space-y-6">
            <div className="glass-card rounded-3xl p-6 space-y-5">
              <div className="flex items-center gap-2 border-b border-zinc-200/50 dark:border-zinc-800/50 pb-3">
                <span className="text-xl">🔔</span>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">OneSignal Push Notifications</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                    OneSignal App ID
                  </label>
                  <input
                    type="text"
                    value={onesignalAppId}
                    onChange={(e) => setOnesignalAppId(e.target.value)}
                    placeholder="e.g. 5eb7a318-6b87-430b-93de-..."
                    className="w-full glass-input rounded-xl py-2.5 px-3.5 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                    OneSignal REST API Key (For Auto-Pushing New Templates)
                  </label>
                  <input
                    type="password"
                    value={onesignalRestKey}
                    onChange={(e) => setOnesignalRestKey(e.target.value)}
                    placeholder="os_v2_app_..."
                    className="w-full glass-input rounded-xl py-2.5 px-3.5 text-xs font-mono"
                  />
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                    When set, creating any new template in the admin panel automatically broadcasts push notifications to all mobile users.
                  </p>
                </div>
              </div>
            </div>

            {/* Manual Push Notification Broadcast Card */}
            <div className="glass-card rounded-3xl p-6 space-y-5">
              <div className="flex items-center gap-2 border-b border-zinc-200/50 dark:border-zinc-800/50 pb-3">
                <Send className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Send Manual Push Notification</h2>
              </div>

              <div className="space-y-5">
                {/* Quick Notification Presets */}
                <div className="space-y-2.5 bg-zinc-500/5 dark:bg-zinc-900/40 p-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/80">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                        Quick Notification Presets
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold">
                        1-Click Auto Fill
                      </span>
                    </div>
                    {(customTitle || customMessage) && (
                      <button
                        type="button"
                        onClick={() => {
                          setCustomTitle('');
                          setCustomMessage('');
                          setCustomImageUrl('');
                          setCustomLaunchUrl('');
                          setSelectedPresetId(null);
                        }}
                        className="text-[11px] text-zinc-400 hover:text-rose-500 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Clear</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {NOTIFICATION_PRESETS.map((preset) => {
                      const isSelected = selectedPresetId === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            setSelectedPresetId(preset.id);
                            setCustomTitle(preset.title);
                            setCustomMessage(preset.message);
                            if (preset.launchUrl) setCustomLaunchUrl(preset.launchUrl);
                            addToast('success', `Applied preset: "${preset.name}"`);
                          }}
                          className={`p-3 rounded-xl text-left transition-all border cursor-pointer flex flex-col justify-between group ${
                            isSelected
                              ? 'bg-indigo-600/15 border-indigo-500 text-indigo-600 dark:text-indigo-300 shadow-sm ring-1 ring-indigo-500/50 scale-[1.02]'
                              : 'bg-white/80 dark:bg-zinc-900/80 border-zinc-200/70 dark:border-zinc-800/80 hover:border-indigo-400 hover:shadow-sm text-zinc-700 dark:text-zinc-300'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1.5">
                            <span className="text-base">{preset.icon}</span>
                            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 group-hover:text-indigo-500">
                              {preset.badge}
                            </span>
                          </div>
                          <div className="text-xs font-bold truncate text-zinc-900 dark:text-white">
                            {preset.name}
                          </div>
                          <div className="text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                            {preset.title}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                    Notification Title *
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => {
                      setCustomTitle(e.target.value);
                      setSelectedPresetId(null);
                    }}
                    placeholder="e.g. 🔥 Trending Template Released!"
                    className="w-full glass-input rounded-xl py-2.5 px-3.5 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                    Notification Message *
                  </label>
                  <textarea
                    rows={3}
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Check out our new exclusive VN video editing template available now..."
                    className="w-full glass-input rounded-xl p-3.5 text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                      Big Banner Image URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={customImageUrl}
                      onChange={(e) => setCustomImageUrl(e.target.value)}
                      placeholder="https://example.com/banner.jpg"
                      className="w-full glass-input rounded-xl py-2.5 px-3.5 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                      Click Launch URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={customLaunchUrl}
                      onChange={(e) => setCustomLaunchUrl(e.target.value)}
                      placeholder="https://vntemplates.com"
                      className="w-full glass-input rounded-xl py-2.5 px-3.5 text-xs font-mono"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSendManualNotification}
                  disabled={sendingNotification}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
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
          </div>
        )}

        {/* TAB 3: Google Authentication Settings */}
        {activeTab === 'google' && (
          <div className="glass-card rounded-3xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-200/50 dark:border-zinc-800/50 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔑</span>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Google Authentication</h2>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={googleAuthEnabled}
                  onChange={(e) => setGoogleAuthEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                <span className="ml-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  {googleAuthEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  Google Client ID (OAuth 2.0 Web / Android)
                </label>
                <input
                  type="text"
                  value={googleClientId}
                  onChange={(e) => setGoogleClientId(e.target.value)}
                  placeholder="e.g. 1234567890-abcdef.apps.googleusercontent.com"
                  className="w-full glass-input rounded-xl py-2.5 px-3.5 text-xs font-mono"
                />
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                  OAuth 2.0 Client ID generated from Google Cloud Console Credentials.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  Google Client Secret (App Secret)
                </label>
                <div className="relative">
                  <input
                    type={showGoogleSecret ? 'text' : 'password'}
                    value={googleClientSecret}
                    onChange={(e) => setGoogleClientSecret(e.target.value)}
                    placeholder="e.g. GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full glass-input rounded-xl py-2.5 px-3.5 pr-10 text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGoogleSecret(!showGoogleSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  >
                    {showGoogleSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                  OAuth 2.0 Client Secret / App Secret used to verify server authorization tokens.
                </p>
              </div>

              <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-800/30 rounded-2xl">
                <p className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">
                  💡 When Google Authentication is enabled with Client ID &amp; App Secret, the app will verify authentication tokens and automatically register or sign in users with their Google credentials.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SMTP Email Settings */}
        {activeTab === 'smtp' && (
          <div className="space-y-6">
            <div className="glass-card rounded-3xl p-6 space-y-5">
              <div className="flex items-center gap-2 border-b border-zinc-200/50 dark:border-zinc-800/50 pb-3">
                <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">SMTP Credentials &amp; Server Configuration</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                    SMTP Host *
                  </label>
                  <input
                    type="text"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    placeholder="e.g. smtp.gmail.com or mail.yourdomain.com"
                    className="w-full glass-input rounded-xl py-2.5 px-3.5 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                    SMTP Port *
                  </label>
                  <input
                    type="number"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(parseInt(e.target.value) || 587)}
                    placeholder="587 or 465"
                    className="w-full glass-input rounded-xl py-2.5 px-3.5 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                    Encryption
                  </label>
                  <select
                    value={smtpEncryption}
                    onChange={(e) => setSmtpEncryption(e.target.value)}
                    className="w-full glass-input rounded-xl py-2.5 px-3.5 text-xs"
                  >
                    <option value="tls">TLS (Port 587 - Recommended)</option>
                    <option value="ssl">SSL (Port 465)</option>
                    <option value="none">None (Port 25)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                    SMTP Username / Email
                  </label>
                  <input
                    type="text"
                    value={smtpUser}
                    onChange={(e) => setSmtpUser(e.target.value)}
                    placeholder="e.g. notifications@yourdomain.com"
                    className="w-full glass-input rounded-xl py-2.5 px-3.5 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                    SMTP Password / App Password
                  </label>
                  <input
                    type="password"
                    value={smtpPass}
                    onChange={(e) => setSmtpPass(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full glass-input rounded-xl py-2.5 px-3.5 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                    From Email Address
                  </label>
                  <input
                    type="email"
                    value={smtpFromEmail}
                    onChange={(e) => setSmtpFromEmail(e.target.value)}
                    placeholder="e.g. noreply@vntemplates.com"
                    className="w-full glass-input rounded-xl py-2.5 px-3.5 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                    From Display Name
                  </label>
                  <input
                    type="text"
                    value={smtpFromName}
                    onChange={(e) => setSmtpFromName(e.target.value)}
                    placeholder="e.g. VN Templates"
                    className="w-full glass-input rounded-xl py-2.5 px-3.5 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Test Email Card */}
            <div className="glass-card rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-zinc-200/50 dark:border-zinc-800/50 pb-3">
                <span className="text-xl">✉️</span>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Live SMTP Test Tool</h2>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Send a real test message to confirm your SMTP host, port, credentials, and SSL/TLS handshake before users request password resets.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="email"
                  value={testEmailAddress}
                  onChange={(e) => setTestEmailAddress(e.target.value)}
                  placeholder="Enter email address for test message..."
                  className="w-full glass-input rounded-xl py-2.5 px-3.5 text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={handleTestSmtp}
                  disabled={testingSmtp}
                  className="w-full sm:w-auto shrink-0 py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-500/20"
                >
                  {testingSmtp ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      <span>Send Test Email</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Markdown Legal Policies Editor */}
        {activeTab === 'legal' && (
          <div className="glass-card rounded-3xl p-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-zinc-200/50 dark:border-zinc-800/50 pb-3">
            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">App Legal &amp; Policies (Markdown Format)</h2>
          </div>

          {/* Privacy Policy */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Shield className="w-4 h-4 text-emerald-500" />
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider">
                Privacy Policy (Markdown)
              </label>
            </div>
            <textarea
              rows={6}
              value={privacyPolicyMarkdown}
              onChange={(e) => setPrivacyPolicyMarkdown(e.target.value)}
              placeholder="# Privacy Policy..."
              className="w-full glass-input rounded-xl p-3.5 text-xs font-mono leading-relaxed"
            />
          </div>

          {/* Terms & Conditions */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Scale className="w-4 h-4 text-indigo-500" />
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider">
                Terms &amp; Conditions (Markdown)
              </label>
            </div>
            <textarea
              rows={6}
              value={termsMarkdown}
              onChange={(e) => setTermsMarkdown(e.target.value)}
              placeholder="# Terms &amp; Conditions..."
              className="w-full glass-input rounded-xl p-3.5 text-xs font-mono leading-relaxed"
            />
          </div>

          {/* Copyright Policy */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <FileText className="w-4 h-4 text-rose-500" />
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider">
                Copyright Policy (Markdown)
              </label>
            </div>
            <textarea
              rows={6}
              value={copyrightPolicyMarkdown}
              onChange={(e) => setCopyrightPolicyMarkdown(e.target.value)}
              placeholder="# Copyright Policy..."
              className="w-full glass-input rounded-xl p-3.5 text-xs font-mono leading-relaxed"
            />
          </div>
        </div>
      )}

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
