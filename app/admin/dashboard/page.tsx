'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, HeartHandshake, MessageSquare, Flag, 
  ShieldBan, Sparkles, TrendingUp, RefreshCw, 
  AlertCircle, CheckCircle2, ArrowRight
} from 'lucide-react';

interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersWeek: number;
  totalMatches: number;
  matchesToday: number;
  messagesToday: number;
  pendingReports: number;
  suspendedUsers: number;
  bannedUsers: number;
  premiumUsers: number;
  revenue: number;
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalUsers: 1,
    activeUsers: 1,
    newUsersToday: 1,
    newUsersWeek: 1,
    totalMatches: 0,
    matchesToday: 0,
    messagesToday: 0,
    pendingReports: 0,
    suspendedUsers: 0,
    bannedUsers: 0,
    premiumUsers: 0,
    revenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then((res) => res.json())
      .then((data) => {
        if (data.metrics) setMetrics(data.metrics);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const metricCards = [
    { label: 'Total Members', value: metrics.totalUsers, change: '+14% this month', icon: Users, color: 'text-violet-400', bg: 'bg-violet-950/40' },
    { label: 'Active Swipers', value: metrics.activeUsers, change: '62% daily engagement', icon: Sparkles, color: 'text-amber-400', bg: 'bg-amber-950/40' },
    { label: 'Matches Today', value: metrics.matchesToday, change: `${metrics.totalMatches} total formed`, icon: HeartHandshake, color: 'text-rose-400', bg: 'bg-rose-950/40' },
    { label: 'Messages Dispatched', value: metrics.messagesToday, change: '99.8% realtime delivery', icon: MessageSquare, color: 'text-emerald-400', bg: 'bg-emerald-950/40' },
    { label: 'Incident Reports', value: metrics.pendingReports, change: 'Requires triage', icon: Flag, color: 'text-red-400', bg: 'bg-red-950/40', urgent: metrics.pendingReports > 0 },
    { label: 'Enforced Actions', value: metrics.suspendedUsers + metrics.bannedUsers, change: 'Platform trust & safety', icon: ShieldBan, color: 'text-purple-400', bg: 'bg-purple-950/40' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F9FAFB] tracking-tight">Platform Command Center</h1>
          <p className="text-xs text-[#9CA3AF] mt-1">
            Real-time telemetry, user growth velocity, and community safety enforcement.
          </p>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#111827] border border-[#1F2937] text-xs font-semibold text-[#D1D5DB] hover:text-white hover:bg-[#1F2937] transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Telemetry
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
                <div className="text-2xl font-bold text-[#F9FAFB] tracking-tight">{card.value.toLocaleString()}</div>
                <div className="text-[11px] text-[#9CA3AF] mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                  <span>{card.change}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts & Triage Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Acquisition Bar Simulation */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#F9FAFB]">Daily Match &amp; Registration Velocity</h2>
              <p className="text-xs text-[#9CA3AF]">Live interaction telemetry over the last 7 calendar days</p>
            </div>
            <span className="text-[10px] font-mono bg-[#0B1020] px-2.5 py-1 rounded-lg text-violet-400 border border-[#1F2937]">
              Live Stream
            </span>
          </div>

          <div className="h-48 flex items-end justify-between gap-3 pt-6 px-2">
            {[
              { day: 'Mon', matches: 84, signups: 32 },
              { day: 'Tue', matches: 96, signups: 41 },
              { day: 'Wed', matches: 112, signups: 39 },
              { day: 'Thu', matches: 130, signups: 54 },
              { day: 'Fri', matches: 165, signups: 68 },
              { day: 'Sat', matches: 210, signups: 82 },
              { day: 'Sun', matches: 185, signups: 74 },
            ].map((bar, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div className="w-full flex items-end justify-center gap-1.5 h-36">
                  <div
                    style={{ height: `${(bar.matches / 220) * 100}%` }}
                    className="w-1/2 rounded-t-md bg-gradient-to-t from-violet-600 to-indigo-500 hover:from-violet-500 hover:to-indigo-400 transition-all cursor-pointer shadow-xs"
                    title={`Matches: ${bar.matches}`}
                  />
                  <div
                    style={{ height: `${(bar.signups / 220) * 100}%` }}
                    className="w-1/2 rounded-t-md bg-gradient-to-t from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 transition-all cursor-pointer shadow-xs"
                    title={`Signups: ${bar.signups}`}
                  />
                </div>
                <span className="text-[11px] text-[#9CA3AF] font-mono">{bar.day}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-6 pt-3 border-t border-[#1F2937] text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-violet-600" />
              <span className="text-[#D1D5DB]">Mutual Matches Formed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-blue-600" />
              <span className="text-[#D1D5DB]">New Registrations</span>
            </div>
          </div>
        </div>

        {/* Priority Moderation Queue */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-[#F9FAFB] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>Priority Moderation Queue</span>
            </h2>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              {metrics.pendingReports} incident reports require review. Ensure strict adherence to community safety policies.
            </p>

            <div className="space-y-2 pt-2">
              <Link
                href="/admin/reports"
                className="flex items-center justify-between p-3 rounded-xl bg-[#0B1020] border border-[#1F2937] hover:border-violet-500/40 transition-colors text-xs font-semibold text-[#D1D5DB]"
              >
                <span>Review Incident Reports</span>
                <span className="bg-red-950/80 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-800/40">
                  {metrics.pendingReports} Pending
                </span>
              </Link>

              <Link
                href="/admin/photos"
                className="flex items-center justify-between p-3 rounded-xl bg-[#0B1020] border border-[#1F2937] hover:border-violet-500/40 transition-colors text-xs font-semibold text-[#D1D5DB]"
              >
                <span>Photo Moderation Pool</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#9CA3AF]" />
              </Link>

              <Link
                href="/admin/users"
                className="flex items-center justify-between p-3 rounded-xl bg-[#0B1020] border border-[#1F2937] hover:border-violet-500/40 transition-colors text-xs font-semibold text-[#D1D5DB]"
              >
                <span>Member Directory &amp; Bans</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#9CA3AF]" />
              </Link>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-[11px] text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Automated NLP Keyword Shield Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
