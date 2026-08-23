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
        {/* User Roles & Activity Distribution Pie Chart */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">User Base Distribution</h2>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-violet-50 dark:bg-zinc-900 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-zinc-800 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> User Roles & Access
            </span>
          </div>

          {(() => {
            const joinStats = stats?.user_join_stats || { today: 0, yesterday: 0, this_week: 0, this_month: 0 };
            const userPieData = [
              { name: 'Joined Today', value: joinStats.today, color: '#10b981' },
              { name: 'Joined Yesterday', value: joinStats.yesterday, color: '#3b82f6' },
              { name: 'Joined This Week', value: joinStats.this_week, color: '#8b5cf6' },
              { name: 'Joined This Month', value: joinStats.this_month, color: '#ec4899' },
            ];
            const totalRegistrations = userPieData.reduce((acc, curr) => acc + curr.value, 0);

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-6">
                <div className="h-64 w-full relative flex items-center justify-center">
                  {totalRegistrations > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={userPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={95}
                          paddingAngle={5}
                          dataKey="value"
                          nameKey="name"
                        >
                          {userPieData.map((entry, index) => (
                            <Cell key={`user-cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: isDark ? '#09090b' : '#ffffff',
                            borderColor: isDark ? '#27272a' : '#e4e4e7',
                            borderRadius: '12px',
                            color: isDark ? '#ffffff' : '#09090b',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-zinc-500 text-sm">No recent user registrations</div>
                  )}
                  {/* Donut Center Stat */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-black text-zinc-900 dark:text-white">{stats?.total_users || 0}</span>
                    <span className="text-[10px] uppercase font-bold text-zinc-400">Total Users</span>
                  </div>
                </div>

                {/* Custom Interactive Donut Legend */}
                <div className="space-y-2.5">
                  <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">User Registration Legend</h3>
                  {userPieData.map((item) => {
                    const percent = totalRegistrations > 0 ? Math.round((item.value / totalRegistrations) * 100) : 0;
                    return (
                      <div key={item.name} className="flex items-center justify-between p-2.5 rounded-xl bg-white/40 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/50">
                        <div className="flex items-center gap-2.5">
                          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="text-xs font-bold text-zinc-900 dark:text-white">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs font-bold text-zinc-900 dark:text-white">{item.value.toLocaleString()}</span>
                          <span className="text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
                            {percent}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
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

      {/* Top Liked Templates Table */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-base font-bold text-zinc-900 dark:text-white mb-4">Top Liked Templates</h2>
        {stats?.top_saved_templates && stats.top_saved_templates.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 border-b border-zinc-200/50 dark:border-zinc-800/50">
                  <th className="pb-3 px-2">Template</th>
                  <th className="pb-3 px-2">Category</th>
                  <th className="pb-3 px-2 text-center">Likes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/40 dark:divide-zinc-800/40">
                {stats.top_saved_templates.map((tpl) => (
                  <tr key={tpl.id} className="hover:bg-white/40 dark:hover:bg-zinc-900/40 transition-colors">
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={tpl.thumbnail}
                          alt={tpl.title}
                          className="w-9 h-9 rounded-lg object-cover bg-zinc-100 dark:bg-zinc-900"
                        />
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">{tpl.title}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-zinc-500 dark:text-zinc-400">
                      {tpl.category || 'General'}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold">
                        <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
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
