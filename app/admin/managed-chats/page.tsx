'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, MessageSquare, Sparkles, Send, RefreshCw, 
  Trash2, Plus, ShieldCheck, HeartHandshake, Eye, 
  MapPin, CheckCircle2, AlertCircle, Bot
} from 'lucide-react';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';

interface ManagedProfile {
  _id: string;
  userId: string;
  name: string;
  age: number;
  city: string;
  job: string;
  bio: string;
  photos: string[];
  likesReceived: number;
  activeMatches: number;
  totalMessagesReceived: number;
  createdAt: string;
}

interface ConversationItem {
  matchId: string;
  managedProfile: {
    userId: string;
    name: string;
    photo: string;
  };
  realUser: {
    userId: string;
    name: string;
    email: string;
    photo: string;
    city: string;
  };
  lastMessage: string;
  lastMessageAt: string;
  messages: Array<{
    _id: string;
    senderId: string;
    receiverId: string;
    text: string;
    isManagedSender: boolean;
    createdAt: string;
    isDeleted?: boolean;
  }>;
}

export default function AdminManagedChatsPage() {
  const [activeTab, setActiveTab] = useState<'chats' | 'profiles'>('chats');
  const [profiles, setProfiles] = useState<ManagedProfile[]>([]);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [generateCount, setGenerateCount] = useState(10);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [profRes, chatRes] = await Promise.all([
        api.get('/api/admin/managed-profiles'),
        api.get('/api/admin/managed-chats'),
      ]);

      if (profRes && profRes.profiles) {
        setProfiles(profRes.profiles);
      }
      if (chatRes && chatRes.conversations) {
        setConversations(chatRes.conversations);
        if (!selectedMatchId && chatRes.conversations.length > 0) {
          setSelectedMatchId(chatRes.conversations[0].matchId);
        }
      }
    } catch (err) {
      console.error('Failed to load managed profiles/chats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedMatchId, conversations]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setStatusMessage(`Generating ${generateCount} Indian female profiles...`);
    try {
      const res = await api.post('/api/admin/managed-profiles', { count: generateCount });
      if (res && res.success) {
        setStatusMessage(res.message);
        await fetchAllData();
        setActiveTab('profiles');
      }
    } catch (err) {
      console.error(err);
      setStatusMessage('Generation failed');
    } finally {
      setIsGenerating(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const handleDeleteProfile = async (id: string) => {
    if (!confirm('Are you sure you want to delete this managed profile?')) return;
    try {
      await api.delete(`/api/admin/managed-profiles?id=${id}`);
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to delete ALL managed profiles and reset?')) return;
    try {
      await api.delete('/api/admin/managed-profiles');
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedMatchId) return;

    const currentConv = conversations.find(c => c.matchId === selectedMatchId);
    if (!currentConv) return;

    setIsSending(true);
    try {
      const res = await api.post('/api/admin/managed-chats', {
        matchId: selectedMatchId,
        managedUserId: currentConv.managedProfile.userId,
        realUserId: currentConv.realUser.userId,
        text: replyText.trim(),
      });

      if (res && res.success) {
        setReplyText('');
        await fetchAllData();
      }
    } catch (err) {
      console.error('Failed to send reply:', err);
    } finally {
      setIsSending(false);
    }
  };

  const activeConversation = conversations.find(c => c.matchId === selectedMatchId);

  return (
    <div className="space-y-6">
      {/* Top Banner & Generation Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111827] border border-[#1F2937] p-6 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-pink-500/10 border border-pink-500/30 text-pink-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Managed Indian Profiles &amp; Operator Console
              </h1>
              <p className="text-xs text-[#9CA3AF] mt-0.5">
                Manage synthetic Indian female profiles, inspect incoming user chats, and reply as the profile.
              </p>
            </div>
          </div>
        </div>

        {/* 1-Click Generator Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={generateCount}
            onChange={(e) => setGenerateCount(Number(e.target.value))}
            className="bg-[#0B1020] border border-[#1F2937] text-white text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-rose-500"
          >
            <option value={5}>5 Profiles</option>
            <option value={10}>10 Profiles</option>
            <option value={25}>25 Profiles</option>
            <option value={50}>50 Profiles</option>
          </select>

          <Button
            size="sm"
            variant="gradient"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="text-xs font-bold shadow-md shadow-rose-600/30"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            {isGenerating ? 'Generating...' : `Generate ${generateCount} Indian Profiles`}
          </Button>

          <button
            onClick={fetchAllData}
            className="p-2 rounded-xl bg-[#0B1020] border border-[#1F2937] text-[#9CA3AF] hover:text-white transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-rose-400' : ''}`} />
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1F2937] pb-3">
        <button
          onClick={() => setActiveTab('chats')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'chats'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
              : 'text-[#9CA3AF] hover:text-white bg-[#111827] border border-[#1F2937]'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Live Operator Chat Inbox ({conversations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profiles')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'profiles'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
              : 'text-[#9CA3AF] hover:text-white bg-[#111827] border border-[#1F2937]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Managed Profiles Roster ({profiles.length})</span>
        </button>
      </div>

      {/* TAB 1: Live Operator Chat Console */}
      {activeTab === 'chats' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[560px]">
          {/* Left Column: Real Users Chat List */}
          <div className="bg-[#111827] border border-[#1F2937] rounded-3xl p-4 flex flex-col space-y-3">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Incoming Conversations
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {conversations.length} Active
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 max-h-[500px]">
              {conversations.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs space-y-2">
                  <HeartHandshake className="w-8 h-8 mx-auto text-slate-600" />
                  <p>No active user conversations yet.</p>
                  <p className="text-[11px] text-slate-500">
                    When real users like or message any managed profile, chats will appear here for operator replies.
                  </p>
                </div>
              ) : (
                conversations.map((conv) => {
                  const isSelected = conv.matchId === selectedMatchId;
                  return (
                    <div
                      key={conv.matchId}
                      onClick={() => setSelectedMatchId(conv.matchId)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-rose-950/60 to-purple-950/60 border-rose-500 shadow-md'
                          : 'bg-[#0B1020] border-[#1F2937] hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Real user avatar */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={conv.realUser.photo}
                          alt=""
                          className="w-11 h-11 rounded-xl object-cover border border-[#1F2937] shrink-0"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-white truncate">
                              {conv.realUser.name}
                            </h4>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          {/* Profile they matched with */}
                          <div className="flex items-center gap-1 text-[10px] text-pink-400 font-semibold mt-0.5">
                            <span>Chatting with:</span>
                            <span className="text-white underline">{conv.managedProfile.name}</span>
                          </div>

                          <p className="text-[11px] text-slate-400 truncate mt-1">
                            {conv.lastMessage}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Live Chat Operator Window */}
          <div className="lg:col-span-2 bg-[#111827] border border-[#1F2937] rounded-3xl flex flex-col h-[560px] overflow-hidden shadow-xl">
            {activeConversation ? (
              <>
                {/* Header: Displays both Real User and Profile they are talking to */}
                <div className="p-4 border-b border-[#1F2937] bg-[#0B1020] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={activeConversation.realUser.photo}
                      alt=""
                      className="w-10 h-10 rounded-xl object-cover border border-[#1F2937]"
                    />
                    <div>
                      <div className="font-bold text-xs text-white flex items-center gap-2">
                        <span>{activeConversation.realUser.name}</span>
                        <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
                          Registered User
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{activeConversation.realUser.email}</span>
                        <span>•</span>
                        <span>{activeConversation.realUser.city}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Replying As:</span>
                    <div className="text-xs font-bold text-pink-400">
                      {activeConversation.managedProfile.name}
                    </div>
                  </div>
                </div>

                {/* Message Stream */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0B1020]/40">
                  {activeConversation.messages.map((msg) => {
                    const isOperator = msg.isManagedSender;
                    return (
                      <div
                        key={msg._id}
                        className={`flex flex-col ${isOperator ? 'items-end' : 'items-start'}`}
                      >
                        <div className="text-[10px] text-slate-500 mb-0.5 px-1 font-mono">
                          {isOperator ? `${activeConversation.managedProfile.name} (You / Operator)` : activeConversation.realUser.name}
                        </div>
                        <div
                          className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                            isOperator
                              ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-br-none shadow-md'
                              : 'bg-[#1F2937] text-slate-200 rounded-bl-none border border-slate-700/60'
                          }`}
                        >
                          <p>{msg.text}</p>
                        </div>
                        <span className="text-[9px] text-slate-500 font-mono mt-0.5 px-1">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Operator Reply Input Form */}
                <form onSubmit={handleSendReply} className="p-3.5 border-t border-[#1F2937] bg-[#0B1020] flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Reply to ${activeConversation.realUser.name} as ${activeConversation.managedProfile.name}...`}
                    className="flex-1 bg-[#111827] border border-[#1F2937] text-white text-xs px-4 py-2.5 rounded-xl focus:outline-none focus:border-rose-500"
                  />
                  <Button
                    type="submit"
                    variant="gradient"
                    size="sm"
                    disabled={isSending || !replyText.trim()}
                    className="text-xs font-bold"
                  >
                    <Send className="w-3.5 h-3.5 mr-1" />
                    <span>Send Reply</span>
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 text-xs space-y-2">
                <MessageSquare className="w-10 h-10 text-slate-700" />
                <p>Select an incoming conversation from the left to start operator messaging.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Managed Profiles Roster */}
      {activeTab === 'profiles' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Active Managed Profiles ({profiles.length})
            </span>
            {profiles.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Managed Profiles</span>
              </button>
            )}
          </div>

          {profiles.length === 0 ? (
            <div className="p-16 text-center bg-[#111827] border border-[#1F2937] rounded-3xl space-y-3">
              <Bot className="w-12 h-12 text-pink-500 mx-auto" />
              <h3 className="text-sm font-bold text-white">No Managed Profiles Generated Yet</h3>
              <p className="text-xs text-[#9CA3AF] max-w-sm mx-auto">
                Click the &quot;Generate Indian Profiles&quot; button above to generate realistic Indian female profiles with photos, coordinates, and bios.
              </p>
              <Button size="sm" variant="gradient" onClick={handleGenerate}>
                Generate 10 Indian Profiles Now
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {profiles.map((p) => (
                <div
                  key={p._id}
                  className="p-5 rounded-3xl bg-[#111827] border border-[#1F2937] space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={
                          typeof p.photos?.[0] === 'string'
                            ? p.photos[0]
                            : (p.photos?.[0] as any)?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=ec4899&color=fff&size=128`
                        }
                        alt={p.name}
                        className="w-14 h-14 rounded-2xl object-cover border border-[#1F2937]"
                      />
                      <div>
                        <div className="font-bold text-sm text-white flex items-center gap-1.5">
                          <span>{p.name}, {p.age}</span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-pink-950 text-pink-400 border border-pink-800">
                            Managed
                          </span>
                        </div>
                        <div className="text-xs text-[#9CA3AF] font-medium">{p.job}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-rose-500" />
                          <span>{p.city}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed bg-[#0B1020] p-3 rounded-2xl border border-[#1F2937]">
                      {p.bio}
                    </p>

                    {/* Telemetry Stats */}
                    <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                      <div className="p-2 rounded-xl bg-[#0B1020] border border-[#1F2937]">
                        <div className="text-xs font-bold text-rose-400">{p.likesReceived}</div>
                        <div className="text-[9px] text-slate-500 uppercase">Likes</div>
                      </div>
                      <div className="p-2 rounded-xl bg-[#0B1020] border border-[#1F2937]">
                        <div className="text-xs font-bold text-emerald-400">{p.activeMatches}</div>
                        <div className="text-[9px] text-slate-500 uppercase">Matches</div>
                      </div>
                      <div className="p-2 rounded-xl bg-[#0B1020] border border-[#1F2937]">
                        <div className="text-xs font-bold text-blue-400">{p.totalMessagesReceived}</div>
                        <div className="text-[9px] text-slate-500 uppercase">Messages</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#1F2937] flex justify-end">
                    <button
                      onClick={() => handleDeleteProfile(p._id)}
                      className="text-xs text-slate-500 hover:text-red-400 flex items-center gap-1 p-1"
                      title="Delete profile"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
