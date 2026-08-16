'use client';

import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, Heart, MessageCircle, Flag, Calendar } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const [dateRange, setDateRange] = useState<'today' | '7d' | '30d' | '90d'>('7d');

  const stats = {
    registrations: dateRange === 'today' ? 48 : dateRange === '7d' ? 312 : 1240,
    profileCompletion: '86.4%',
    dailyActiveUsers: dateRange === 'today' ? 840 : 1280,
    totalLikes: dateRange === 'today' ? 1420 : 9840,
    totalPasses: dateRange === 'today' ? 3100 : 21400,
    matchesCreated: dateRange === 'today' ? 126 : 890,
    messagesExchanged: dateRange === 'today' ? 2450 : 16800,
    reportsFiled: dateRange === 'today' ? 3 : 19,
    retentionD7: '64.8%',
  };

  return (
    <div className="space-y-6">
      {/* Header & Date Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Platform Growth & Telemetry Analytics</h1>
          <p className="text-xs text-slate-400 mt-1">
            Deep dive into funnels, swiping velocity, retention rates, and engagement.
          </p>
        </div>

        {/* Date Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 self-start sm:self-auto">
          {(['today', '7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-1 text-xs font-semibold rounded-xl uppercase tracking-wider transition-all ${
                dateRange === range
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {range === 'today' ? 'Today' : range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 font-medium">New Registrations</span>
          <div className="text-2xl font-bold text-white">{stats.registrations.toLocaleString()}</div>
          <span className="text-[11px] text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +18.4% conversion rate
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 font-medium">Profile Completion Rate</span>
          <div className="text-2xl font-bold text-white">{stats.profileCompletion}</div>
          <span className="text-[11px] text-slate-400">Onboarding wizard funnel</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 font-medium">Mutual Matches</span>
          <div className="text-2xl font-bold text-white">{stats.matchesCreated.toLocaleString()}</div>
          <span className="text-[11px] text-rose-400">9.1% swipe-to-match ratio</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 font-medium">Likes Sent</span>
          <div className="text-2xl font-bold text-white">{stats.totalLikes.toLocaleString()}</div>
          <span className="text-[11px] text-slate-400">Passes: {stats.totalPasses.toLocaleString()}</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 font-medium">Messages Dispatched</span>
          <div className="text-2xl font-bold text-white">{stats.messagesExchanged.toLocaleString()}</div>
          <span className="text-[11px] text-emerald-400">Real-time socket delivery</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 font-medium">D7 Retention</span>
          <div className="text-2xl font-bold text-white">{stats.retentionD7}</div>
          <span className="text-[11px] text-slate-400">Top quartile performance</span>
        </div>
      </div>
    </div>
  );
}
