'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { 
  ShieldCheck, AlertTriangle, Lock, Eye, Flag, 
  Ban, HeartHandshake, PhoneCall, UserX, CheckCircle2 
} from 'lucide-react';

export default function SafetyCenterPage() {
  const safetyRules = [
    {
      icon: Lock,
      title: 'Never Send Money or Share Financial Details',
      desc: 'Never transfer funds, share bank OTPs, crypto wallets, or credit card numbers, regardless of the emergency claimed.',
    },
    {
      icon: Eye,
      title: 'Protect Your Personal Information',
      desc: 'Never share your home address, workplace location, or private contact details until you have established solid mutual trust.',
    },
    {
      icon: HeartHandshake,
      title: 'Meet in Populated Public Places',
      desc: 'For first dates, meet in public spots (cafes, restaurants, galleries). Arrange your own transport and inform a close friend.',
    },
    {
      icon: Flag,
      title: 'Report Inappropriate & Suspicious Behavior',
      desc: 'Use the in-app Report button immediately if someone is aggressive, promotes commercial services, or requests financial favors.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 w-full space-y-10">
      {/* Hero */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" /> Safety Center
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Your Safety & Privacy Come First
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto">
          AuraMatch is built on mutual respect, verified identities, and automated safety moderation.
        </p>
      </div>

      {/* Safety Guidelines Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {safetyRules.map((rule, idx) => {
          const Icon = rule.icon;
          return (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">{rule.title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{rule.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Action Tools */}
      <div className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-6">
        <h3 className="text-lg font-bold text-white">Emergency & Safety Controls</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/verify" className="p-4 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-2xl flex flex-col items-center text-center gap-2 transition-colors">
            <CheckCircle2 className="w-6 h-6 text-sky-400" />
            <span className="text-xs font-bold text-white">Photo Verification</span>
            <span className="text-[11px] text-zinc-400">Get your verified blue checkmark</span>
          </Link>

          <Link href="/settings" className="p-4 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-2xl flex flex-col items-center text-center gap-2 transition-colors">
            <Ban className="w-6 h-6 text-amber-400" />
            <span className="text-xs font-bold text-white">Privacy & Incognito</span>
            <span className="text-[11px] text-zinc-400">Control who can discover you</span>
          </Link>

          <Link href="/help" className="p-4 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-2xl flex flex-col items-center text-center gap-2 transition-colors">
            <PhoneCall className="w-6 h-6 text-rose-400" />
            <span className="text-xs font-bold text-white">Support Helpdesk</span>
            <span className="text-[11px] text-zinc-400">24/7 dedicated support team</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
