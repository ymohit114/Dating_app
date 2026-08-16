'use client';

import React, { useState, useEffect } from 'react';
import { HeartHandshake, MessageSquare, CheckCircle2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api-client';

interface AdminMatchItem {
  _id: string;
  matchedAt: string;
  status: string;
  lastMessage: string;
  lastMessageAt: string;
  user1: {
    _id: string;
    name: string;
    email: string;
    photo: string;
  };
  user2: {
    _id: string;
    name: string;
    email: string;
    photo: string;
  };
}

export default function AdminMatchesPage() {
  const [matches, setMatches] = useState<AdminMatchItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMatches = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/api/admin/matches');
      if (res && res.matches) {
        setMatches(res.matches);
      }
    } catch (err) {
      console.error('Failed to fetch admin matches:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1F2937]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#F9FAFB] tracking-tight">Mutual Match Health &amp; Telemetry</h1>
            <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {matches.length} Total Matches
            </span>
          </div>
          <p className="text-xs text-[#9CA3AF] mt-1">
            Monitor real-time mutual match formation and user conversations from MongoDB.
          </p>
        </div>

        <button
          onClick={fetchMatches}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#111827] border border-[#1F2937] text-xs font-semibold text-white hover:bg-[#1F2937] transition-all cursor-pointer w-fit"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
          <span>Refresh</span>
        </button>
      </div>

      {isLoading ? (
        <div className="p-16 text-center text-[#9CA3AF] text-xs flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading matches telemetry...</span>
        </div>
      ) : matches.length === 0 ? (
        <div className="p-12 text-center bg-[#111827] border border-[#1F2937] rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-950/40 border border-rose-800/40 text-rose-400 mx-auto flex items-center justify-center">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h2 className="text-sm font-bold text-white">No Matches Formed Yet</h2>
          <p className="text-xs text-[#9CA3AF] max-w-sm mx-auto">
            When users swipe right on each other, real mutual matches and conversations will appear here.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-[#111827] border border-[#1F2937] overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs text-[#D1D5DB]">
            <thead className="bg-[#0B1020] text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] border-b border-[#1F2937]">
              <tr>
                <th className="p-4">Matched Pair (User A &harr; User B)</th>
                <th className="p-4">Match Timestamp</th>
                <th className="p-4">Last Conversation Activity</th>
                <th className="p-4">Status &amp; Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937]/80">
              {matches.map((m) => (
                <tr key={m._id} className="hover:bg-[#1F2937]/30 transition-colors">
                  <td className="p-4 font-semibold text-white">
                    <div className="flex items-center gap-3">
                      {/* Avatars */}
                      <div className="flex -space-x-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={m.user1?.photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'}
                          alt=""
                          className="w-8 h-8 rounded-full ring-2 ring-[#111827] object-cover"
                        />
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={m.user2?.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt=""
                          className="w-8 h-8 rounded-full ring-2 ring-[#111827] object-cover"
                        />
                      </div>
                      <div>
                        <div className="text-white font-bold">
                          {m.user1?.name} &amp; {m.user2?.name}
                        </div>
                        <div className="text-[10px] text-[#9CA3AF]">
                          {m.user1?.email} &harr; {m.user2?.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-[#9CA3AF] font-mono text-[11px]">
                    {new Date(m.matchedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="p-4">
                    <span className="flex items-center gap-1.5 text-[#D1D5DB] text-xs truncate max-w-xs">
                      <MessageSquare className="w-3.5 h-3.5 text-[#6B7280] shrink-0" />
                      <span className="truncate">&ldquo;{m.lastMessage || 'No messages yet'}&rdquo;</span>
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                      <Link
                        href="/admin/messages"
                        className="text-xs text-rose-400 hover:underline font-semibold"
                      >
                        Inspect Chat &rarr;
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
