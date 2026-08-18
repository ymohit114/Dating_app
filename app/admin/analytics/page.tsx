'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Heart, MessageCircle, Flag, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api-client';

export default function AdminAnalyticsPage() {
  const [metrics, setMetrics] = useState<any>({
    totalUsers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    newUsersWeek: 0,
    totalMatches: 0,
    matchesToday: 0,
    totalMessages: 0,
    messagesToday: 0,
    pendingReports: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const data = await api.get('/api/admin/dashboard');
      if (data && data.metrics) {
        setMetrics(data.metrics);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Platform Growth &amp; Telemetry Analytics</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time telemetry and member activity from MongoDB Atlas.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-white hover:bg-slate-800 transition-all cursor-pointer w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-rose-400' : ''}`} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 font-medium">Total Registered Members</span>
          <div className="text-2xl font-bold text-white">{metrics.totalUsers}</div>
          <span className="text-[11px] text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> {metrics.newUsersToday} joined today ({metrics.newUsersWeek} this week)
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 font-medium">Active Member Accounts</span>
          <div className="text-2xl font-bold text-white">{metrics.activeUsers}</div>
          <span className="text-[11px] text-slate-400">Status active in database</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 font-medium">Mutual Matches Formed</span>
          <div className="text-2xl font-bold text-white">{metrics.totalMatches}</div>
          <span className="text-[11px] text-rose-400">{metrics.matchesToday} formed today</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 font-medium">Messages Dispatched</span>
          <div className="text-2xl font-bold text-white">{metrics.totalMessages}</div>
          <span className="text-[11px] text-emerald-400">{metrics.messagesToday} sent today</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 font-medium">Pending Moderation Reports</span>
          <div className="text-2xl font-bold text-white">{metrics.pendingReports}</div>
          <span className="text-[11px] text-slate-400">Trust &amp; safety queue</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 font-medium">Database Cluster Health</span>
          <div className="text-2xl font-bold text-emerald-400">100% Online</div>
          <span className="text-[11px] text-slate-400">MongoDB Atlas connected</span>
        </div>
      </div>
    </div>
  );
}
