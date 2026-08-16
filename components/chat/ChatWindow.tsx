'use client';

import React, { useState, useRef, useEffect } from 'react';
import { IMatch, IMessage, IProfile, IMessageReaction } from '@/types';
import { Button } from '@/components/ui/Button';
import { formatRelativeTime } from '@/utils/formatters';
import { ProfileDetailModal } from '@/components/profile/ProfileDetailModal';
import { 
  Send, Phone, Video, Info, Sparkles, 
  CheckCheck, X, PhoneOff, AlertCircle, 
  Trash2, SmilePlus 
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
  const [activeCallType, setActiveCallType] = useState<'audio' | 'video' | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [activeActionMessageId, setActiveActionMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

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

  const startCall = async (type: 'audio' | 'video') => {
    setActiveCallType(type);
    setMediaError(null);

    if (typeof window !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: type === 'video',
        });
        setMediaStream(stream);
        if (type === 'video' && localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch {
        setMediaError(
          type === 'video'
            ? 'Camera and microphone access are required to start a video call.'
            : 'Microphone access is required to start a voice call.'
        );
      }
    }
  };

  const endCall = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((t) => t.stop());
      setMediaStream(null);
    }
    setActiveCallType(null);
    setMediaError(null);
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
    <div className="h-full flex flex-col bg-zinc-950 text-white">
      {/* Chat Top Header */}
      <div className="h-16 px-4 border-b border-zinc-800 bg-zinc-900/90 backdrop-blur-md flex items-center justify-between shadow-sm">
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

        {/* Audio / Video / Details Action */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => startCall('audio')}
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Start Voice Call"
          >
            <Phone className="w-4 h-4" />
          </button>
          <button
            onClick={() => startCall('video')}
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Start Video Call"
          >
            <Video className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowProfileModal(true)}
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            title="View Profile Details"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Match Header banner */}
        <div className="text-center py-6 border-b border-zinc-800/80 mb-4">
          <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden ring-4 ring-rose-500/20 shadow-lg mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={otherProfile?.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
              alt={otherProfile?.name || ''}
              className="w-full h-full object-cover"
            />
          </div>
          <h4 className="text-base font-bold text-white">
            You matched with {otherProfile?.name}
          </h4>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto mt-0.5">
            {otherProfile?.job ? `${otherProfile.job} • ` : ''}
            {otherProfile?.location?.city || 'Nearby'}
          </p>
        </div>

        {/* Chat Bubbles */}
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUserId;
          const reactionCounts = getReactionCounts(msg.reactions);
          const isActionOpen = activeActionMessageId === msg._id;

          return (
            <div
              key={msg._id}
              className={`relative group flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              {!isMe && (
                <div className="w-7 h-7 rounded-full overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={otherProfile?.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex flex-col max-w-[78%] sm:max-w-md">
                {/* Bubble + Action Container */}
                <div className="relative group/bubble">
                  {/* Floating Action Menu (Reactions & Delete) */}
                  {!msg.isDeleted && (
                    <div
                      className={`absolute top-0 -translate-y-full mb-1 z-30 flex items-center gap-1 bg-zinc-900/95 border border-zinc-800 rounded-full px-2 py-1 shadow-xl opacity-0 group-hover/bubble:opacity-100 transition-opacity ${
                        isMe ? 'right-0' : 'left-0'
                      }`}
                    >
                      {/* Emoji Bar */}
                      {EMOJI_LIST.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => onReactToMessage?.(msg._id, emoji)}
                          className="hover:scale-125 transition-transform text-sm p-1 cursor-pointer"
                          title={`React with ${emoji}`}
                        >
                          {emoji}
                        </button>
                      ))}

                      {/* Delete button (for sender) */}
                      {isMe && onDeleteMessage && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Delete this message for everyone?')) {
                              onDeleteMessage(msg._id);
                            }
                          }}
                          className="text-zinc-400 hover:text-red-400 p-1 ml-1 rounded-full hover:bg-zinc-800 transition-colors cursor-pointer"
                          title="Delete message"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Bubble Content */}
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      msg.isDeleted
                        ? 'bg-zinc-900/40 text-zinc-500 border border-zinc-800/60 italic'
                        : isMe
                        ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-br-none'
                        : 'bg-zinc-900 text-zinc-100 border border-zinc-800 rounded-bl-none'
                    }`}
                  >
                    {msg.mediaUrl && !msg.isDeleted && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={msg.mediaUrl}
                        alt=""
                        className="rounded-xl mb-2 max-h-60 object-cover w-full"
                      />
                    )}
                    <p className={msg.isDeleted ? 'text-xs text-zinc-500 flex items-center gap-1.5' : ''}>
                      {msg.isDeleted ? '🚫 This message was deleted' : msg.text}
                    </p>
                    <div
                      className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${
                        isMe ? 'text-rose-200' : 'text-zinc-500'
                      }`}
                    >
                      <span>{formatRelativeTime(msg.createdAt)}</span>
                      {isMe && !msg.isDeleted && <CheckCheck className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                </div>

                {/* Reaction Pills Below Bubble */}
                {reactionCounts.length > 0 && !msg.isDeleted && (
                  <div className={`flex flex-wrap gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    {reactionCounts.map((r) => (
                      <button
                        key={r.emoji}
                        type="button"
                        onClick={() => onReactToMessage?.(msg._id, r.emoji)}
                        className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border cursor-pointer transition-all ${
                          r.hasReacted
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold'
                            : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                        }`}
                      >
                        <span>{r.emoji}</span>
                        <span>{r.count}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Typing indicator bubble */}
        {isTyping && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full overflow-hidden shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={otherProfile?.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="bg-zinc-900 border border-zinc-800 px-4 py-2.5 rounded-2xl rounded-bl-none flex items-center gap-1.5">
              <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Icebreaker Drawer Toggle */}
      {showIcebreakers && (
        <div className="p-3 bg-zinc-900 border-t border-zinc-800 animate-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-semibold text-rose-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" /> Icebreaker Ideas
            </span>
            <button
              onClick={() => setShowIcebreakers(false)}
              className="text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ICEBREAKERS.map((ice, i) => (
              <button
                key={i}
                onClick={() => handlePickIcebreaker(ice)}
                className="text-xs bg-zinc-950 hover:bg-zinc-800 text-zinc-200 px-3 py-1.5 rounded-full border border-zinc-800 transition-colors text-left cursor-pointer"
              >
                {ice}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Message Input Bar */}
      <form
        onSubmit={handleSend}
        className="p-3 sm:p-4 bg-zinc-900 border-t border-zinc-800 flex items-center gap-2"
      >
        <button
          type="button"
          onClick={() => setShowIcebreakers(!showIcebreakers)}
          className={`p-2.5 rounded-full transition-colors cursor-pointer ${
            showIcebreakers
              ? 'bg-rose-500 text-white font-bold shadow-md'
              : 'text-zinc-400 hover:text-white bg-zinc-950 border border-zinc-800'
          }`}
          title="Icebreaker Sparks"
        >
          <Sparkles className="w-4 h-4" />
        </button>

        <input
          type="text"
          placeholder={`Message ${otherProfile?.name || '...'}`}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 bg-zinc-950 border border-zinc-800 text-white text-sm px-4 py-2.5 rounded-full focus:outline-none focus:border-rose-500 transition-colors"
        />

        <Button
          type="submit"
          variant="gradient"
          size="sm"
          disabled={!inputText.trim()}
          className="p-2.5 rounded-full aspect-square"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>

      {/* Detailed Profile Modal */}
      {showProfileModal && otherProfile && (
        <ProfileDetailModal
          profile={otherProfile}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      {/* Voice / Video Call Modal */}
      {activeCallType && otherProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-lg animate-fade-in">
          <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center shadow-2xl flex flex-col items-center">
            {mediaError ? (
              <div className="space-y-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-rose-950 text-rose-400 mx-auto flex items-center justify-center">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white">Media Permission Required</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">{mediaError}</p>
                <Button variant="outline" size="sm" onClick={endCall}>
                  Dismiss
                </Button>
              </div>
            ) : (
              <>
                {activeCallType === 'video' && mediaStream ? (
                  <div className="relative w-48 h-64 rounded-2xl overflow-hidden bg-zinc-950 mb-4 border border-zinc-800">
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="relative w-28 h-28 rounded-full overflow-hidden ring-4 ring-rose-500/30 shadow-xl mb-4 animate-pulse">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={otherProfile.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                      alt={otherProfile.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <h3 className="text-xl font-bold text-white mb-1">{otherProfile.name}</h3>
                <span className="text-xs text-rose-400 font-semibold mb-8 uppercase tracking-wider">
                  {activeCallType === 'video' ? 'Video Call Connected' : 'Voice Call in Progress...'}
                </span>

                <div className="flex items-center gap-4">
                  <button
                    onClick={endCall}
                    className="p-4 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg shadow-red-600/30 cursor-pointer"
                    title="End Call"
                  >
                    <PhoneOff className="w-6 h-6" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
