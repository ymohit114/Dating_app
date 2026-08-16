'use client';

import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, ShieldAlert, Eye, Search, RefreshCw, 
  Trash2, User, Clock, CheckCircle2, HeartHandshake 
} from 'lucide-react';
import { api } from '@/lib/api-client';

interface AdminMessageItem {
  _id: string;
  matchId: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  text: string;
  isDeleted: boolean;
  mediaUrl?: string;
  reactions?: { userId: string; emoji: string }[];
  createdAt: string;
}

interface AdminConversation {
  _id: string;
  matchedAt: string;
  status: string;
  lastMessage: string;
  lastMessageAt: string;
  messageCount: number;
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
  messages: AdminMessageItem[];
}

export default function AdminMessagesModerationPage() {
  const [conversations, setConversations] = useState<AdminConversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchConversations = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const res = await api.get('/api/admin/messages');
      if (res && res.conversations) {
        setConversations(res.conversations);
        if (!selectedConvId && res.conversations.length > 0) {
          setSelectedConvId(res.conversations[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch admin messages:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    // Live auto-refresh every 3.5 seconds
    const interval = setInterval(() => fetchConversations(true), 3500);
    return () => clearInterval(interval);
  }, []);

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message as Admin?')) return;
    try {
      await api.delete(`/api/messages?messageId=${messageId}`);
      fetchConversations(true);
    } catch (err) {
      console.error('Admin delete message error:', err);
    }
  };

  const filteredConversations = conversations.filter((c) => {
    const text = `${c.user1?.name} ${c.user1?.email} ${c.user2?.name} ${c.user2?.email} ${c.lastMessage}`.toLowerCase();
    return text.includes(searchTerm.toLowerCase());
  });

  const activeConversation = conversations.find((c) => c._id === selectedConvId) || conversations[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1F2937]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Live User Chat &amp; Conversations</h1>
            <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {conversations.length} Active Threads
            </span>
          </div>
          <p className="text-xs text-[#9CA3AF] mt-1">
            Real-time chat monitor: View all messages exchanged between matched members.
          </p>
        </div>

        <button
          onClick={() => fetchConversations()}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#111827] border border-[#1F2937] text-xs font-semibold text-white hover:bg-[#1F2937] transition-all cursor-pointer w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-rose-400' : 'text-slate-400'}`} />
          <span>Refresh Live</span>
        </button>
      </div>

      {isLoading ? (
        <div className="p-16 text-center text-[#9CA3AF] text-xs flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading live user conversations from database...</span>
        </div>
      ) : conversations.length === 0 ? (
        <div className="p-12 text-center bg-[#111827] border border-[#1F2937] rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-950/40 border border-rose-800/40 text-rose-400 mx-auto flex items-center justify-center">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-white">No Conversations Formed Yet</h2>
          <p className="text-xs text-[#9CA3AF] max-w-sm mx-auto">
            When users match with each other and start chatting, their live messages and conversation threads will appear right here.
          </p>
        </div>
      ) : (
        /* 2-Column Split: Conversations List + Transcript Inspector */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Conversations List (5 cols) */}
          <div className="lg:col-span-5 bg-[#111827] border border-[#1F2937] rounded-2xl overflow-hidden shadow-sm flex flex-col h-[650px]">
            {/* Search */}
            <div className="p-3 border-b border-[#1F2937] bg-[#0B1020]">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search user, email or message..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#111827] border border-[#1F2937] text-white text-xs pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#1F2937]/80">
              {filteredConversations.map((conv) => {
                const isSelected = (activeConversation?._id === conv._id);
                return (
                  <div
                    key={conv._id}
                    onClick={() => setSelectedConvId(conv._id)}
                    className={`p-4 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1F2937]/80 border-l-4 border-rose-500'
                        : 'hover:bg-[#1F2937]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        {/* Overlapping Avatars */}
                        <div className="flex -space-x-2 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={conv.user1?.photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'}
                            alt=""
                            className="inline-block h-7 w-7 rounded-full ring-2 ring-[#111827] object-cover"
                          />
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={conv.user2?.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                            alt=""
                            className="inline-block h-7 w-7 rounded-full ring-2 ring-[#111827] object-cover"
                          />
                        </div>
                        <span className="text-xs font-bold text-white truncate max-w-[160px]">
                          {conv.user1?.name} &amp; {conv.user2?.name}
                        </span>
                      </div>

                      <span className="text-[10px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">
                        {conv.messageCount} msgs
                      </span>
                    </div>

                    <p className="text-xs text-[#9CA3AF] truncate mt-1">
                      &ldquo;{conv.lastMessage}&rdquo;
                    </p>

                    <div className="flex items-center justify-between mt-2 text-[10px] text-[#6B7280]">
                      <span>{conv.user1?.email} &harr; {conv.user2?.email}</span>
                      <span>{new Date(conv.lastMessageAt || conv.matchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Live Message Transcript Viewer (7 cols) */}
          <div className="lg:col-span-7 bg-[#111827] border border-[#1F2937] rounded-2xl overflow-hidden shadow-sm flex flex-col h-[650px]">
            {activeConversation ? (
              <>
                {/* Transcript Header */}
                <div className="p-4 bg-[#0B1020] border-b border-[#1F2937] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={activeConversation.user1?.photo}
                        alt=""
                        className="w-8 h-8 rounded-full ring-2 ring-rose-500 object-cover"
                      />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={activeConversation.user2?.photo}
                        alt=""
                        className="w-8 h-8 rounded-full ring-2 ring-pink-500 object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white">
                        {activeConversation.user1?.name} &harr; {activeConversation.user2?.name}
                      </h3>
                      <p className="text-[10px] text-[#9CA3AF]">
                        {activeConversation.user1?.email} &amp; {activeConversation.user2?.email}
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Matched
                  </span>
                </div>

                {/* Message Stream */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0B1020]/60">
                  {activeConversation.messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[#6B7280]">
                      <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
                      <p className="text-xs">No messages sent in this match yet.</p>
                    </div>
                  ) : (
                    activeConversation.messages.map((msg) => {
                      const isUser1 = msg.senderId === activeConversation.user1._id;
                      return (
                        <div
                          key={msg._id}
                          className={`flex flex-col ${isUser1 ? 'items-start' : 'items-end'} space-y-1`}
                        >
                          {/* Sender badge & time */}
                          <div className="flex items-center gap-2 text-[10px] text-[#9CA3AF] px-1 font-mono">
                            <span className={`font-bold ${isUser1 ? 'text-rose-400' : 'text-pink-400'}`}>
                              {msg.senderName}
                            </span>
                            <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                          </div>

                          {/* Bubble */}
                          <div className="group relative flex items-center gap-2">
                            <div
                              className={`px-4 py-2.5 rounded-2xl text-xs max-w-sm leading-relaxed ${
                                msg.isDeleted
                                  ? 'bg-[#1F2937]/50 text-slate-500 italic border border-[#374151]'
                                  : isUser1
                                  ? 'bg-[#1F2937] text-white border border-[#374151] rounded-tl-none'
                                  : 'bg-rose-950/60 text-rose-100 border border-rose-800/50 rounded-tr-none'
                              }`}
                            >
                              <p>{msg.text}</p>

                              {/* Reactions */}
                              {msg.reactions && msg.reactions.length > 0 && (
                                <div className="flex gap-1 mt-1.5 pt-1 border-t border-white/10">
                                  {msg.reactions.map((r, i) => (
                                    <span key={i} className="text-xs bg-black/40 px-1.5 py-0.5 rounded-full">
                                      {r.emoji}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Admin Delete Action */}
                            {!msg.isDeleted && (
                              <button
                                onClick={() => handleDeleteMessage(msg._id)}
                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-red-950/80 text-red-400 hover:text-white hover:bg-red-700 transition-all cursor-pointer"
                                title="Admin Delete this message"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer status bar */}
                <div className="p-3 bg-[#0B1020] border-t border-[#1F2937] flex items-center justify-between text-[11px] text-[#9CA3AF]">
                  <span>Total Messages: {activeConversation.messages.length}</span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Live Syncing
                  </span>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center p-8 text-center text-[#6B7280] text-xs">
                Select a conversation from the left to inspect live messages.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
