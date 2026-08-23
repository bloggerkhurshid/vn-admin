export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: 'super_admin' | 'admin';
  avatar?: string | null;
  status: 'active' | 'disabled';
  created_by?: number | null;
  created_by_name?: string | null;
  created_at: string;
}

export interface AppUser {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  status: 'active' | 'banned';
  saves_count?: number;
  created_at: string;
}

export interface TemplateItem {
  id: number;
  title: string;
  category?: string;
  thumbnail: string;
  video_preview: string;
  template_qr: string;
  vn_link?: string;
  tags?: string;
  is_featured: boolean;
  is_premium: boolean;
  status: 'published' | 'draft';
  views: number;
  saves_count: number;
  added_by: {
    id: number;
    name: string;
  };
  created_at: string;
  updated_at?: string;
}

export interface DashboardStats {
  total_templates: number;
  total_users: number;
  total_admins: number;
  total_saves: number;
  templates_this_month: number;
  user_join_stats?: {
    today: number;
    yesterday: number;
    this_week: number;
    this_month: number;
  };
  recent_users?: AppUser[];
  top_saved_templates: TemplateItem[];
  monthly_breakdown?: { month: string; count: number }[];
}

export interface AppConfig {
  id: number;
  app_name: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_mode: 'dark' | 'light';
  ads_enabled: boolean;
  admob_banner_id: string;
  admob_interstitial_id: string;
  admob_native_id: string;
  admob_app_open_id: string;
  onesignal_app_id?: string;
  onesignal_rest_key?: string;
  vn_package_name: string;
  privacy_policy_url: string;
  terms_url: string;
  privacy_policy_markdown?: string;
  terms_markdown?: string;
  copyright_policy_markdown?: string;
  updated_at?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string>;
}
