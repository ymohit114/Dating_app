'use client';

import React from 'react';
import { useChat } from '@/hooks/useChat';
import { ChatList } from '@/components/chat/ChatList';
import { Flame, MessageCircleHeart } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function MatchesPage() {
  const { matches } = useChat();

  return (
    <div className="flex-1 flex max-w-6xl mx-auto w-full border-x border-zinc-800/80 bg-zinc-950 min-h-[calc(100vh-64px)]">
      {/* Matches List Column */}
      <div className="w-full md:w-96 flex-shrink-0">
        <ChatList matches={matches} />
      </div>

      {/* Empty Selection State for Desktop */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-center p-8 text-center bg-zinc-950/60">
        <div className="w-20 h-20 rounded-3xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-4">
          <MessageCircleHeart className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Your Conversations</h2>
        <p className="text-xs text-zinc-400 max-w-sm mb-6 leading-relaxed">
          Select a match from the left sidebar to start chatting, send voice notes, and plan your next coffee date!
        </p>
        <Link href="/discover">
          <Button variant="gradient" size="md" className="gap-2">
            <Flame className="w-4 h-4 fill-white" /> Discover More Matches
          </Button>
        </Link>
      </div>
    </div>
  );
}
