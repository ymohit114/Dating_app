'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, HeartHandshake, MessageSquare, Flag, 
  ShieldBan, Sparkles, TrendingUp, RefreshCw, 
  AlertCircle, CheckCircle2, ArrowRight
} from 'lucide-react';
import { api } from '@/lib/api-client';

interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersWeek: number;
  totalMatches: number;
  matchesToday: number;
  totalMessages: number;
  messagesToday: number;
  pendingReports: number;
  suspendedUsers: number;
  bannedUsers: number;
  premiumUsers: number;
  revenue: number;
}

interface ChartBar {
  day: string;
  dateStr: string;
  signups: number;
  matches: number;
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalUsers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    newUsersWeek: 0,
    totalMatches: 0,
    matchesToday: 0,
    totalMessages: 0,
    messagesToday: 0,
    pendingReports: 0,
    suspendedUsers: 0,
    bannedUsers: 0,
    premiumUsers: 0,
    revenue: 0,
  });
  const [chartData, setChartData] = useState<ChartBar[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTelemetry = async () => {
    setIsLoading(true);
    try {
      const data = await api.get('/api/admin/dashboard');
      if (data && data.metrics) {
        setMetrics(data.metrics);
      }
      if (data && data.chartData) {
        setChartData(data.chartData);
      }
    } catch (e) {
      console.error('Failed to load admin telemetry:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, []);

  const maxVal = Math.max(
    ...chartData.map((b) => Math.max(b.matches, b.signups)),
    1
  );

  const metricCards = [
    { label: 'Total Registered Members', value: metrics.totalUsers, subtitle: `${metrics.newUsersToday} joined today`, icon: Users, color: 'text-violet-400', bg: 'bg-violet-950/40' },
    { label: 'Active Member Accounts', value: metrics.activeUsers, subtitle: 'Live MongoDB status', icon: Sparkles, color: 'text-amber-400', bg: 'bg-amber-950/40' },
    { label: 'Total Mutual Matches', value: metrics.totalMatches, subtitle: `${metrics.matchesToday} formed today`, icon: HeartHandshake, color: 'text-rose-400', bg: 'bg-rose-950/40' },
    { label: 'Total Messages Sent', value: metrics.totalMessages, subtitle: `${metrics.messagesToday} sent today`, icon: MessageSquare, color: 'text-emerald-400', bg: 'bg-emerald-950/40' },
    { label: 'Pending Incident Reports', value: metrics.pendingReports, subtitle: metrics.pendingReports > 0 ? 'Requires attention' : 'Queue clean', icon: Flag, color: 'text-red-400', bg: 'bg-red-950/40', urgent: metrics.pendingReports > 0 },
    { label: 'Enforced Actions', value: metrics.suspendedUsers + metrics.bannedUsers, subtitle: `${metrics.bannedUsers} banned, ${metrics.suspendedUsers} suspended`, icon: ShieldBan, color: 'text-purple-400', bg: 'bg-purple-950/40' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F9FAFB] tracking-tight">Platform Command Center</h1>
          <p className="text-xs text-[#9CA3AF] mt-1">
            Real-time telemetry and database metrics from MongoDB Atlas.
          </p>
        </div>

        <button
          onClick={fetchTelemetry}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#111827] border border-[#1F2937] text-xs font-semibold text-[#D1D5DB] hover:text-white hover:bg-[#1F2937] transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-rose-400' : ''}`} />
          <span>Refresh Live</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metricCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className={`p-5 rounded-2xl bg-[#111827] border ${
                card.urgent ? 'border-red-500/40 shadow-lg shadow-red-950/20' : 'border-[#1F2937]'
              } flex flex-col justify-between space-y-3 transition-all hover:border-[#374151]`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#9CA3AF]">{card.label}</span>
                <div className={`p-2 rounded-xl border border-[#1F2937] ${card.bg} ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <div className="text-2xl font-bold text-[#F9FAFB] tracking-tight">
                  {isLoading ? '...' : card.value.toLocaleString()}
                </div>
                <div className="text-[11px] text-[#9CA3AF] mt-1 flex items-center gap-1">
                  <span>{card.subtitle}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Real Charts & Priority Moderation Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Acquisition Bar Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#F9FAFB]">Daily Match &amp; Registration Velocity</h2>
              <p className="text-xs text-[#9CA3AF]">Live interaction telemetry over the last 7 calendar days</p>
            </div>
            <span className="text-[10px] font-mono bg-[#0B1020] px-2.5 py-1 rounded-lg text-emerald-400 border border-emerald-800/40">
              Live Database
            </span>
          </div>

          <div className="h-48 flex items-end justify-between gap-3 pt-6 px-2">
            {chartData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-xs text-[#6B7280]">
                Loading real weekly trends...
              </div>
            ) : (
              chartData.map((bar, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div className="w-full flex items-end justify-center gap-1.5 h-36">
                    <div
                      style={{ height: `${Math.max((bar.matches / maxVal) * 100, 8)}%` }}
                      className="w-1/2 rounded-t-md bg-gradient-to-t from-rose-600 to-pink-500 hover:from-rose-500 hover:to-pink-400 transition-all cursor-pointer shadow-xs"
                      title={`${bar.dateStr}: ${bar.matches} Matches`}
                    />
                    <div
                      style={{ height: `${Math.max((bar.signups / maxVal) * 100, 8)}%` }}
                      className="w-1/2 rounded-t-md bg-gradient-to-t from-violet-600 to-indigo-500 hover:from-violet-500 hover:to-indigo-400 transition-all cursor-pointer shadow-xs"
                      title={`${bar.dateStr}: ${bar.signups} Signups`}
                    />
                  </div>
                  <span className="text-[11px] text-[#9CA3AF] font-mono">{bar.day}</span>
                </div>
              ))
            )}
          </div>

          <div className="flex items-center justify-center gap-6 pt-3 border-t border-[#1F2937] text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-rose-600" />
              <span className="text-[#D1D5DB]">Mutual Matches Formed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-violet-600" />
              <span className="text-[#D1D5DB]">New Registrations</span>
            </div>
          </div>
        </div>

        {/* Priority Moderation Queue */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-[#F9FAFB] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>Priority Moderation Actions</span>
            </h2>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              {metrics.pendingReports} incident reports require review. Inspect user conversations and profiles.
            </p>

            <div className="space-y-2 pt-2">
              <Link
                href="/admin/messages"
                className="flex items-center justify-between p-3 rounded-xl bg-[#0B1020] border border-[#1F2937] hover:border-rose-500/40 transition-colors text-xs font-semibold text-[#D1D5DB]"
              >
                <span>Live Chat Monitor</span>
                <span className="bg-rose-500/10 text-rose-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-500/30">
                  {metrics.totalMessages} Msgs
                </span>
              </Link>

              <Link
                href="/admin/users"
                className="flex items-center justify-between p-3 rounded-xl bg-[#0B1020] border border-[#1F2937] hover:border-rose-500/40 transition-colors text-xs font-semibold text-[#D1D5DB]"
              >
                <span>Member Directory &amp; Status</span>
                <span className="text-[10px] text-slate-400 font-mono">{metrics.totalUsers} Members</span>
              </Link>

              <Link
                href="/admin/reports"
                className="flex items-center justify-between p-3 rounded-xl bg-[#0B1020] border border-[#1F2937] hover:border-rose-500/40 transition-colors text-xs font-semibold text-[#D1D5DB]"
              >
                <span>Review Incident Reports</span>
                <span className="bg-red-950/80 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-800/40">
                  {metrics.pendingReports} Pending
                </span>
              </Link>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-[11px] text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Real-time MongoDB Atlas Telemetry Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
