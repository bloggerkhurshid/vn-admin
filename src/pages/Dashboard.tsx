import React, { useEffect, useState } from 'react';
import { api } from '../api/axios';
import { DashboardStats } from '../types';
import { Video, Users, ShieldCheck, Heart, Calendar, PieChart as PieChartIcon, Activity, Sparkles } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../context/ThemeContext';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const res = await api.get('/admin/dashboard/stats');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard stats', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-zinc-900 dark:border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isDark = theme === 'dark';

  const statCards = [
    { title: 'Total Templates', value: stats?.total_templates || 0, icon: Video, color: 'from-blue-600 to-indigo-600' },
    { title: 'Registered Users', value: stats?.total_users || 0, icon: Users, color: 'from-violet-600 to-purple-600' },
    { title: 'Total Likes', value: stats?.total_saves || 0, icon: Heart, color: 'from-rose-500 to-red-600' },
    { title: 'Active Admins', value: stats?.total_admins || 0, icon: ShieldCheck, color: 'from-amber-500 to-orange-600' },
  ];

  // Colors for Donut Chart Slices
  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">System Dashboard</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Overview of template performance and distribution metrics</p>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-white rounded-xl text-xs font-semibold shadow-sm">
          <Calendar className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
          <span>This Month: +{stats?.templates_this_month || 0} Templates</span>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className="glass-card rounded-2xl p-5 hover:scale-[1.02] transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{card.title}</span>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-md text-white`}>
                <card.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">{card.value.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Donut & Graphical Breakdown Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AdMob Style User Registration Comparison Grid */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">User Acquisition Overview</h2>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-1.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Stats
            </span>
          </div>

          {(() => {
            const joinStats = stats?.user_join_stats || { today: 0, yesterday: 0, this_week: 0, this_month: 0 };
            
            // Calculate comparison percentages (Today vs Yesterday)
            const todayVsYesterday = joinStats.yesterday > 0 
              ? Math.round(((joinStats.today - joinStats.yesterday) / joinStats.yesterday) * 100) 
              : (joinStats.today > 0 ? 100 : 0);

            const admobCards = [
              {
                label: 'Today so far',
                value: joinStats.today,
                subtext: 'vs Yesterday',
                diff: todayVsYesterday,
                color: 'from-emerald-500/10 to-teal-500/10',
                borderColor: 'border-emerald-500/20',
                accentColor: 'text-emerald-600 dark:text-emerald-400',
              },
              {
                label: 'Yesterday',
                value: joinStats.yesterday,
                subtext: 'Completed',
                diff: null,
                color: 'from-blue-500/10 to-indigo-500/10',
                borderColor: 'border-blue-500/20',
                accentColor: 'text-blue-600 dark:text-blue-400',
              },
              {
                label: 'This week so far',
                value: joinStats.this_week,
                subtext: 'Current 7 Days',
                diff: null,
                color: 'from-violet-500/10 to-purple-500/10',
                borderColor: 'border-violet-500/20',
                accentColor: 'text-violet-600 dark:text-violet-400',
              },
              {
                label: 'This month so far',
                value: joinStats.this_month,
                subtext: 'Current Month',
                diff: null,
                color: 'from-pink-500/10 to-rose-500/10',
                borderColor: 'border-pink-500/20',
                accentColor: 'text-pink-600 dark:text-pink-400',
              },
            ];

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {admobCards.map((card, idx) => (
                  <div
                    key={idx}
                    className={`p-5 rounded-2xl bg-gradient-to-br ${card.color} border ${card.borderColor} flex flex-col justify-between hover:scale-[1.01] transition-transform`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                        {card.label}
                      </span>
                      {card.diff !== null && (
                        <span
                          className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                            card.diff >= 0
                              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                              : 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
                          }`}
                        >
                          {card.diff >= 0 ? `+${card.diff}%` : `${card.diff}%`}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex items-baseline justify-between">
                      <div>
                        <span className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight font-mono">
                          {card.value.toLocaleString()}
                        </span>
                        <span className="text-xs font-semibold text-zinc-400 ml-1.5">users</span>
                      </div>
                      <span className="text-[11px] font-medium text-zinc-400">{card.subtext}</span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        {/* Distribution Radial Meters */}
        <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Engagement Meters</h2>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6">
              Performance breakdown indicators across key library metrics.
            </p>

            {/* Radial Progress Ring Bars */}
            <div className="space-y-5">
              {/* Metric 1: Likes Ratio */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-zinc-700 dark:text-zinc-300">Likes Engagement Ratio</span>
                  <span className="text-rose-500 font-bold">
                    {Math.min(100, Math.round(((stats?.total_saves || 0) / Math.max(1, stats?.total_templates || 1)) * 10))}%
                  </span>
                </div>
                <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-rose-500 to-red-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.round(((stats?.total_saves || 0) / Math.max(1, stats?.total_templates || 1)) * 10))}%` }}
                  />
                </div>
              </div>

              {/* Metric 2: Monthly Upload Pace */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-zinc-700 dark:text-zinc-300">Monthly Upload Goal</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                    {Math.min(100, Math.round(((stats?.templates_this_month || 0) / 20) * 100))}%
                  </span>
                </div>
                <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.round(((stats?.templates_this_month || 0) / 20) * 100))}%` }}
                  />
                </div>
              </div>

              {/* Metric 3: Active User Index */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-zinc-700 dark:text-zinc-300">Active User Growth Index</span>
                  <span className="text-emerald-500 font-bold">
                    {Math.min(100, Math.round(((stats?.total_users || 0) / 50) * 100))}%
                  </span>
                </div>
                <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-400 to-teal-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.round(((stats?.total_users || 0) / 50) * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Registered Users & Top Liked Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registered Users */}
        <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-base font-bold text-zinc-900 dark:text-white">Recent Registered Users</h2>
              </div>
              <a
                href="/users"
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                View All →
              </a>
            </div>

            {stats?.recent_users && stats.recent_users.length > 0 ? (
              <div className="space-y-3">
                {stats.recent_users.map((u) => {
                  const initials = u.name
                    ? u.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
                    : 'U';

                  return (
                    <div
                      key={u.id}
                      className="p-3 rounded-xl bg-white/40 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/50 flex items-center justify-between hover:scale-[1.01] transition-transform"
                    >
                      <div className="flex items-center gap-3">
                        {u.avatar ? (
                          <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-full object-cover" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
                            {initials}
                          </div>
                        )}
                        <div>
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-white">{u.name}</h4>
                          <p className="text-[11px] text-zinc-400 font-mono">{u.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            u.status === 'banned'
                              ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400'
                              : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {u.status || 'Active'}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {new Date(u.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-zinc-500">No users registered yet.</p>
            )}
          </div>
        </div>

        {/* Top Liked Templates Table */}
        <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                <h2 className="text-base font-bold text-zinc-900 dark:text-white">Top Liked Templates</h2>
              </div>
              <a
                href="/templates"
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                View Library →
              </a>
            </div>

            {stats?.top_saved_templates && stats.top_saved_templates.length > 0 ? (
              <div className="space-y-3">
                {stats.top_saved_templates.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="p-3 rounded-xl bg-white/40 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/50 flex items-center justify-between hover:scale-[1.01] transition-transform"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={tpl.thumbnail}
                        alt={tpl.title}
                        className="w-10 h-10 rounded-lg object-cover bg-zinc-100 dark:bg-zinc-900 shadow-sm"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-white line-clamp-1">{tpl.title}</h4>
                        <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                          {tpl.category || 'General'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-xs font-bold">
                      <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                      <span>{tpl.saves_count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-500">No saved templates recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
