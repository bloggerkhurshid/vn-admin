import React, { useEffect, useState } from 'react';
import { api } from '../api/axios';
import { DashboardStats } from '../types';
import { Video, Users, ShieldCheck, Heart, Calendar, TrendingUp, Eye, Sparkles, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
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

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">System Dashboard</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Overview of template performance and analytics graphs</p>
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

      {/* Interactive Analytics Graphs Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template Upload Growth Area Graph */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-white" />
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Template Growth Graph</h2>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-zinc-800">
              Monthly Growth Trends
            </span>
          </div>

          <div className="h-72 w-full">
            {stats?.monthly_breakdown && stats.monthly_breakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.monthly_breakdown}>
                  <defs>
                    <linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isDark ? '#ffffff' : '#4f46e5'} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={isDark ? '#ffffff' : '#4f46e5'} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#27272a' : '#e4e4e7'} opacity={0.6} />
                  <XAxis dataKey="month" stroke={isDark ? '#a1a1aa' : '#71717a'} fontSize={12} tickLine={false} />
                  <YAxis stroke={isDark ? '#a1a1aa' : '#71717a'} fontSize={12} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#09090b' : '#ffffff',
                      borderColor: isDark ? '#27272a' : '#e4e4e7',
                      borderRadius: '12px',
                      color: isDark ? '#ffffff' : '#09090b',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke={isDark ? '#ffffff' : '#4f46e5'}
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorUploads)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-500 text-sm">
                No monthly graph data recorded yet
              </div>
            )}
          </div>
        </div>

        {/* Platform Insights & Analytics Breakdown Graph */}
        <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-indigo-600 dark:text-white" />
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Activity Graph</h2>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4">
              Detailed distribution of uploads across months.
            </p>

            <div className="h-44 w-full">
              {stats?.monthly_breakdown && stats.monthly_breakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.monthly_breakdown}>
                    <Bar dataKey="count" fill={isDark ? '#ffffff' : '#18181b'} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-zinc-400 text-xs">No graph data</div>
              )}
            </div>

            <div className="mt-4 space-y-2.5">
              <div className="p-3 rounded-xl bg-white/50 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between text-xs">
                <span className="text-zinc-600 dark:text-zinc-400">Total Likes</span>
                <span className="font-bold text-zinc-900 dark:text-white">{stats?.total_saves || 0} likes</span>
              </div>
              <div className="p-3 rounded-xl bg-white/50 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between text-xs">
                <span className="text-zinc-600 dark:text-zinc-400">Active Admins</span>
                <span className="font-bold text-zinc-900 dark:text-white">{stats?.total_admins || 0} admins</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Liked Templates Table */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Top Liked Templates</h2>
        {stats?.top_saved_templates && stats.top_saved_templates.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400 tracking-wider">
                  <th className="py-3 px-4">Template</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Added By</th>
                  <th className="py-3 px-4 text-center">Views</th>
                  <th className="py-3 px-4 text-center">Likes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
                {stats.top_saved_templates.map((tpl) => (
                  <tr key={tpl.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={tpl.thumbnail}
                          alt={tpl.title}
                          className="w-12 h-12 rounded-lg object-cover bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                        />
                        <span className="font-medium text-zinc-900 dark:text-white">{tpl.title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800">
                        {tpl.category || 'General'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-500 dark:text-zinc-400">{tpl.added_by.name}</td>
                    <td className="py-3 px-4 text-center font-medium">
                      <span className="inline-flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
                        <Eye className="w-3.5 h-3.5" />
                        {tpl.views}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-zinc-900 dark:text-white font-semibold bg-zinc-100 dark:bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-300 dark:border-zinc-700">
                        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                        {tpl.saves_count}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-zinc-500">No saved templates recorded yet.</p>
        )}
      </div>
    </div>
  );
};
