'use client';

import React, { useState } from 'react';
import { BellRing, Send, CheckCircle2, Users, ShieldCheck, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface BroadcastItem {
  id: string;
  title: string;
  message: string;
  target: string;
  sentAt: string;
}

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState('all');
  const [isSending, setIsSending] = useState(false);
  const [sentHistory, setSentHistory] = useState<BroadcastItem[]>([]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    setIsSending(true);
    setTimeout(() => {
      setSentHistory((prev) => [
        {
          id: Date.now().toString(),
          title: title.trim(),
          message: message.trim(),
          target: targetAudience === 'all' ? 'All Users' : targetAudience === 'verified' ? 'Verified Users' : 'Active Swipers',
          sentAt: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
        },
        ...prev,
      ]);
      setTitle('');
      setMessage('');
      setIsSending(false);
      alert('System broadcast announcement dispatched successfully!');
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">System Announcement Dispatcher</h1>
        <p className="text-xs text-slate-400 mt-1">
          Broadcast push notifications and in-app safety alerts to specific member segments.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Creator Form */}
        <form onSubmit={handleSend} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <BellRing className="w-4 h-4 text-rose-500" />
            <span>Create New Announcement</span>
          </h2>

          <div>
            <label className="text-xs font-semibold text-slate-300">Notification Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Profile Verification Reminder"
              className="w-full mt-1 bg-slate-950 border border-slate-800 text-white text-xs px-4 py-2.5 rounded-xl focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300">Target Segment</label>
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full mt-1 bg-slate-950 border border-slate-800 text-slate-300 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-rose-500"
            >
              <option value="all">All Registered Members</option>
              <option value="verified">Verified Badge Holders</option>
              <option value="active">Active Swipers in Past 24h</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300">Broadcast Message Body</label>
            <textarea
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write the message text clearly..."
              className="w-full mt-1 bg-slate-950 border border-slate-800 text-white text-xs p-3 rounded-xl focus:outline-none focus:border-rose-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSending}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-semibold text-xs shadow-md shadow-rose-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            {isSending ? 'Dispatching Broadcast...' : 'Broadcast Announcement'}
          </button>
        </form>

        {/* History Stream */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white">Broadcast History</h2>

          {sentHistory.length === 0 ? (
            <div className="p-12 text-center bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                <Megaphone className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-white">No Broadcasts Dispatched Yet</h3>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                Dispatched platform announcements and community safety alerts will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sentHistory.map((item) => (
                <div key={item.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{item.title}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{item.sentAt}</span>
                  </div>
                  <p className="text-xs text-slate-400">{item.message}</p>
                  <div className="pt-1 flex items-center gap-1 text-[10px] text-slate-500">
                    <Users className="w-3 h-3" />
                    <span>Target: {item.target}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
