import React, { useEffect, useState } from 'react';
import { api } from '../api/axios';
import { DashboardStats } from '../types';
import { Video, Users, ShieldCheck, Bookmark, Calendar, TrendingUp, Eye, Sparkles } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

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
        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Templates', value: stats?.total_templates || 0, icon: Video },
    { title: 'Registered Users', value: stats?.total_users || 0, icon: Users },
    { title: 'Total Likes', value: stats?.total_saves || 0, icon: Bookmark },
    { title: 'Active Admins', value: stats?.total_admins || 0, icon: ShieldCheck },
  ];

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">System Dashboard</h1>
          <p className="text-sm text-zinc-400 mt-1">Overview of template performance and system metrics</p>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-700 text-white rounded-xl text-xs font-semibold">
          <Calendar className="w-4 h-4 text-zinc-400" />
          <span>This Month: +{stats?.templates_this_month || 0} Templates</span>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-all shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{card.title}</span>
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md">
                <card.icon className="w-5 h-5 text-black" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-white">{card.value.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Chart & Top Templates Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts Monthly Upload Breakdown */}
        <div className="lg:col-span-2 bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-white" />
              <h2 className="text-lg font-bold text-white">Monthly Upload Activity</h2>
            </div>
          </div>

          <div className="h-72 w-full">
            {stats?.monthly_breakdown && stats.monthly_breakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.monthly_breakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.6} />
                  <XAxis dataKey="month" stroke="#a1a1aa" fontSize={12} tickLine={false} />
                  <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', color: '#ffffff' }}
                  />
                  <Bar dataKey="count" fill="#ffffff" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-500 text-sm">
                No monthly breakdown data recorded yet
              </div>
            )}
          </div>
        </div>

        {/* Platform Insights */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-white" />
              <h2 className="text-lg font-bold text-white">Platform Summary</h2>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              VN Video Editor templates distribution system. App users scan deep link QR codes or copy VN share links directly into their editor.
            </p>
            <div className="mt-6 space-y-3">
              <div className="p-3.5 rounded-xl bg-black border border-zinc-800 flex items-center justify-between text-xs">
                <span className="text-zinc-400">Total User Favorites</span>
                <span className="font-bold text-white">{stats?.total_saves} saves</span>
              </div>
              <div className="p-3.5 rounded-xl bg-black border border-zinc-800 flex items-center justify-between text-xs">
                <span className="text-zinc-400">Active Admins</span>
                <span className="font-bold text-white">{stats?.total_admins} admins</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Liked Templates Table */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-md">
        <h2 className="text-lg font-bold text-white mb-4">Top Liked Templates</h2>
        {stats?.top_saved_templates && stats.top_saved_templates.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-xs font-semibold uppercase text-zinc-400 tracking-wider">
                  <th className="py-3 px-4">Template</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Added By</th>
                  <th className="py-3 px-4 text-center">Views</th>
                  <th className="py-3 px-4 text-center">Likes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {stats.top_saved_templates.map((tpl) => (
                  <tr key={tpl.id} className="hover:bg-zinc-900/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={tpl.thumbnail}
                          alt={tpl.title}
                          className="w-12 h-12 rounded-lg object-cover bg-zinc-900 border border-zinc-800"
                        />
                        <span className="font-medium text-white">{tpl.title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-900 text-zinc-300 border border-zinc-800">
                        {tpl.category || 'General'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-400">{tpl.added_by.name}</td>
                    <td className="py-3 px-4 text-center font-medium">
                      <span className="inline-flex items-center gap-1 text-zinc-400">
                        <Eye className="w-3.5 h-3.5" />
                        {tpl.views}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-white font-semibold bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-700">
                        <Bookmark className="w-3.5 h-3.5 text-zinc-300" />
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
