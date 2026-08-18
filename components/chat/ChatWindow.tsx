'use client';

import React, { useState, useRef, useEffect } from 'react';
import { IMatch, IMessage, IProfile, IMessageReaction } from '@/types';
import { Button } from '@/components/ui/Button';
import { formatRelativeTime } from '@/utils/formatters';
import { ProfileDetailModal } from '@/components/profile/ProfileDetailModal';
import { 
  Send, Info, Sparkles, CheckCheck, X, 
  AlertCircle, Trash2, SmilePlus 
} from 'lucide-react';

interface ChatWindowProps {
  match: IMatch;
  messages: IMessage[];
  currentUserId: string;
  isTyping: boolean;
  onSendMessage: (text: string, mediaUrl?: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  onReactToMessage?: (messageId: string, emoji: string) => void;
}

const EMOJI_LIST = ['❤️', '😂', '🔥', '👍', '😮', '😢'];

const ICEBREAKERS = [
  "What's your all-time favorite travel destination? ✈️",
  "If you could have dinner with anyone dead or alive, who would it be? 🍽️",
  "Specialty pour-over coffee or rooftop sunset drinks? ☕🌅",
  "What is the best song you discovered this month? 🎵",
  "Art gallery afternoon or cozy weekend jazz club? 🎨🎷"
];

export function ChatWindow({
  match,
  messages,
  currentUserId,
  isTyping,
  onSendMessage,
  onDeleteMessage,
  onReactToMessage,
}: ChatWindowProps) {
  const [inputText, setInputText] = useState('');
  const [showIcebreakers, setShowIcebreakers] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [activeActionMessageId, setActiveActionMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const otherProfile = match.otherProfile;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText('');
      setShowIcebreakers(false);
    }
  };

  const handlePickIcebreaker = (icebreaker: string) => {
    onSendMessage(icebreaker);
    setShowIcebreakers(false);
  };

  // Group reactions by emoji
  const getReactionCounts = (reactions?: IMessageReaction[]) => {
    if (!reactions || reactions.length === 0) return [];
    const counts: Record<string, { count: number; hasReacted: boolean }> = {};
    reactions.forEach((r) => {
      if (!counts[r.emoji]) {
        counts[r.emoji] = { count: 0, hasReacted: false };
      }
      counts[r.emoji].count += 1;
      if (r.userId === currentUserId) {
        counts[r.emoji].hasReacted = true;
      }
    });
    return Object.entries(counts).map(([emoji, data]) => ({
      emoji,
      count: data.count,
      hasReacted: data.hasReacted,
    }));
  };

  return (
    <div className="h-full max-h-full flex flex-col bg-zinc-950 text-white overflow-hidden">
      {/* Fixed Sticky Header - Never scrolls */}
      <div className="h-16 px-4 border-b border-zinc-800 bg-zinc-900/95 backdrop-blur-md flex items-center justify-between shadow-sm shrink-0 sticky top-0 z-20">
        {/* Profile preview click */}
        <div
          onClick={() => setShowProfileModal(true)}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-zinc-700 group-hover:ring-rose-500 transition-all">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={otherProfile?.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
              alt={otherProfile?.name || ''}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors">
                {otherProfile?.name}
              </h3>
              {otherProfile?.age && (
                <span className="text-xs text-zinc-400">{otherProfile.age}</span>
              )}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Online
            </div>
          </div>
        </div>

        {/* Info / Profile Details Action */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowProfileModal(true)}
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            title="View Profile Details"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrollable Message Stream - Only this section scrolls */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        {/* Match Header banner */}
        <div className="text-center py-6 border-b border-zinc-800/80 mb-4">
          <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden ring-4 ring-rose-500/20 shadow-lg mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={otherProfile?.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="text-base font-bold text-white">You matched with {otherProfile?.name}</h3>
          <p className="text-xs text-zinc-400 mt-1">{otherProfile?.location?.city || 'New Delhi'}</p>
        </div>

        {/* Messages */}
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUserId;
          const isDeleted = msg.isDeleted;
          const reactionCounts = getReactionCounts(msg.reactions);

          return (
            <div
              key={msg._id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group/msg relative`}
              onMouseLeave={() => setActiveActionMessageId(null)}
            >
              <div className="flex items-center gap-2 max-w-[80%]">
                {/* Hover action toolbar for reactions and delete */}
                {!isDeleted && (
                  <div
                    className={`opacity-0 group-hover/msg:opacity-100 transition-opacity flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-full px-2 py-1 shadow-lg ${
                      isMe ? 'order-first' : 'order-last'
                    }`}
                  >
                    {/* Emoji Reaction Bar */}
                    <div className="flex items-center gap-1">
                      {EMOJI_LIST.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => onReactToMessage?.(msg._id, emoji)}
                          className="hover:scale-125 transition-transform text-xs p-0.5 cursor-pointer"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>

                    {/* Delete Message Button (for own messages) */}
                    {isMe && onDeleteMessage && (
                      <button
                        type="button"
                        onClick={() => onDeleteMessage(msg._id)}
                        className="text-zinc-400 hover:text-red-400 p-1 transition-colors cursor-pointer border-l border-zinc-800 ml-1"
                        title="Delete message"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm transition-all ${
                    isDeleted
                      ? 'bg-zinc-900/60 text-zinc-500 italic border border-zinc-800/80 rounded-2xl'
                      : isMe
                      ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-br-none shadow-rose-600/10'
                      : 'bg-zinc-900 text-zinc-100 border border-zinc-800 rounded-bl-none'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
              </div>

              {/* Reaction badges */}
              {reactionCounts.length > 0 && !isDeleted && (
                <div className={`flex gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                  {reactionCounts.map(({ emoji, count, hasReacted }) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => onReactToMessage?.(msg._id, emoji)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all cursor-pointer ${
                        hasReacted
                          ? 'bg-rose-500/20 border border-rose-500/50 text-rose-300 shadow-xs'
                          : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <span>{emoji}</span>
                      {count > 1 && <span className="text-[10px] font-bold">{count}</span>}
                    </button>
                  ))}
                </div>
              )}

              {/* Timestamp */}
              <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-zinc-500">
                <span>{formatRelativeTime(msg.createdAt)}</span>
                {isMe && !isDeleted && (
                  <CheckCheck className={`w-3 h-3 ${msg.read ? 'text-rose-400' : 'text-zinc-600'}`} />
                )}
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-zinc-400 text-xs italic">
            <span className="w-2 h-2 bg-rose-500 rounded-full animate-bounce" />
            <span className="w-2 h-2 bg-rose-500 rounded-full animate-bounce [animation-delay:0.2s]" />
            <span className="w-2 h-2 bg-rose-500 rounded-full animate-bounce [animation-delay:0.4s]" />
            <span>{otherProfile?.name} is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Icebreaker Prompts Tray */}
      {showIcebreakers && (
        <div className="p-3 bg-zinc-900/95 border-t border-zinc-800 space-y-2 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Conversation Starters
            </span>
            <button
              onClick={() => setShowIcebreakers(false)}
              className="text-zinc-400 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto">
            {ICEBREAKERS.map((starter, idx) => (
              <button
                key={idx}
                onClick={() => handlePickIcebreaker(starter)}
                className="text-left text-xs p-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-300 transition-colors border border-zinc-800 cursor-pointer"
              >
                {starter}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Fixed Bottom Input Bar - Never moves */}
      <form onSubmit={handleSend} className="p-3 border-t border-zinc-800 bg-zinc-900/95 shrink-0 sticky bottom-0 z-20">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowIcebreakers(!showIcebreakers)}
            className="p-2.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-rose-400 transition-colors cursor-pointer"
            title="Icebreaker Sparks"
          >
            <Sparkles className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Message ${otherProfile?.name || '...'}`}
            className="flex-1 bg-zinc-950 border border-zinc-800 text-white text-sm px-4 py-2.5 rounded-2xl focus:outline-none focus:border-rose-500 transition-colors"
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 text-white hover:from-rose-500 hover:to-pink-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-rose-600/30 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* User Profile Modal */}
      {showProfileModal && otherProfile && (
        <ProfileDetailModal
          profile={otherProfile}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </div>
  );
}
