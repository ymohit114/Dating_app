'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { ChatList } from '@/components/chat/ChatList';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { ArrowLeft, Sparkles, HeartHandshake } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { IMatch } from '@/types';

export default function ChatDetailPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.matchId as string;
  const { user } = useAuth();
  const { matches, messages, isTyping, sendMessage, deleteMessage, reactToMessage } = useChat(matchId);
  const [matchDetails, setMatchDetails] = useState<IMatch | null>(null);
  const [isLoadingMatch, setIsLoadingMatch] = useState(true);

  useEffect(() => {
    const found = matches.find((m) => m._id === matchId);
    if (found) {
      setMatchDetails(found);
      setIsLoadingMatch(false);
    } else {
      // Fetch fresh matches if not present in initial load
      api.get('/api/matches')
        .then((res) => {
          if (res && res.matches) {
            const m = res.matches.find((item: IMatch) => item._id === matchId);
            if (m) setMatchDetails(m);
          }
        })
        .catch(() => {})
        .finally(() => setIsLoadingMatch(false));
    }
  }, [matchId, matches]);

  const otherUser = matchDetails?.otherProfile;
  const otherUserId = otherUser?.userId || otherUser?._id || '';

  return (
    <div className="flex-1 flex max-w-6xl mx-auto w-full border-x border-zinc-800/80 bg-zinc-950 min-h-[calc(100vh-64px)] overflow-hidden">
      {/* Sidebar List (hidden on mobile when chat open) */}
      <div className="hidden md:block w-96 flex-shrink-0">
        <ChatList matches={matches} activeMatchId={matchId} />
      </div>

      {/* Main Chat Window */}
      <div className="flex-1 flex flex-col min-w-0 bg-zinc-950">
        {/* Mobile back link bar */}
        <div className="md:hidden px-4 py-2.5 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <Link href="/matches" className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" /> All Matches
          </Link>
          {otherUser && (
            <span className="text-xs font-bold text-white truncate max-w-[160px]">
              {otherUser.name}
            </span>
          )}
        </div>

        {matchDetails ? (
          <ChatWindow
            match={matchDetails}
            messages={messages}
            currentUserId={user?._id || ''}
            isTyping={isTyping}
            onSendMessage={(text, media) =>
              sendMessage(
                text,
                media,
                user?._id || '',
                otherUserId
              )
            }
            onDeleteMessage={(messageId) => deleteMessage(messageId)}
            onReactToMessage={(messageId, emoji) => reactToMessage(messageId, emoji, user?._id || '')}
          />
        ) : isLoadingMatch ? (
          <div className="flex-1 flex items-center justify-center p-8 text-center text-zinc-400 text-xs">
            <span className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mr-2" />
            <span>Loading conversation...</span>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">Conversation Not Found</h3>
            <p className="text-xs text-zinc-400 max-w-sm">
              This match may have been unmatched or is no longer active.
            </p>
            <Link
              href="/matches"
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold border border-zinc-700"
            >
              Back to Matches
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
