'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { IMatch } from '@/types';
import { formatRelativeTime } from '@/utils/formatters';
import { Search, Flame, Sparkles, CheckCircle2 } from 'lucide-react';

interface ChatListProps {
  matches: IMatch[];
  activeMatchId?: string;
}

export function ChatList({ matches, activeMatchId }: ChatListProps) {
  const [search, setSearch] = useState('');

  const filteredMatches = matches.filter((m) => {
    const name = m.otherProfile?.name || '';
    return name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="h-full flex flex-col bg-zinc-950 border-r border-zinc-800/80">
      {/* Top Search bar */}
      <div className="p-4 border-b border-zinc-800/80">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search matches & chats..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 text-white text-xs pl-9 pr-4 py-2.5 rounded-full focus:outline-none focus:border-rose-500 transition-colors"
          />
        </div>
      </div>

      {/* New Matches Horizontal Reel */}
      <div className="p-4 border-b border-zinc-800/80">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> New Matches
          </span>
          <span className="text-[10px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">
            {matches.length}
          </span>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {matches.map((m) => (
            <Link
              key={m._id}
              href={`/chat/${m._id}`}
              className="flex flex-col items-center gap-1 group flex-shrink-0"
            >
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-rose-500 p-0.5 group-hover:scale-105 transition-transform">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.otherProfile?.photos[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                  alt={m.otherProfile?.name || 'Match'}
                  className="w-full h-full object-cover rounded-xl"
                />
                {m.otherProfile?.onlineStatus === 'online' && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-zinc-950" />
                )}
              </div>
              <span className="text-[11px] font-medium text-zinc-300 max-w-[56px] truncate">
                {m.otherProfile?.name.split(' ')[0]}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/40">
        <div className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
          Conversations
        </div>

        {filteredMatches.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-xs">
            No conversations found. Start swiping to match!
          </div>
        ) : (
          filteredMatches.map((m) => {
            const isActive = m._id === activeMatchId;
            const profile = m.otherProfile;
            return (
              <Link
                key={m._id}
                href={`/chat/${m._id}`}
                className={`flex items-center gap-3.5 p-4 transition-colors ${
                  isActive
                    ? 'bg-zinc-900 border-l-4 border-rose-500'
                    : 'hover:bg-zinc-900/50'
                }`}
              >
                {/* Avatar */}
                <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={profile?.photos[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                    alt={profile?.name || ''}
                    className="w-full h-full object-cover"
                  />
                  {profile?.isVerified && (
                    <span className="absolute bottom-0 right-0 bg-zinc-950 rounded-full p-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 fill-sky-400/20" />
                    </span>
                  )}
                </div>

                {/* Info & Last message */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4 className="text-sm font-semibold text-white truncate">
                      {profile?.name}
                    </h4>
                    {m.lastMessageAt && (
                      <span className="text-[10px] text-zinc-500 flex-shrink-0">
                        {formatRelativeTime(m.lastMessageAt)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 truncate">
                    {m.lastMessage || 'Sent you a match! Say hello 👋'}
                  </p>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
