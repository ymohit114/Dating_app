'use client';

import React, { useState } from 'react';
import { CreditCard, TrendingUp, Sparkles, Crown, Zap, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function AdminSubscriptionsPage() {
  const [transactions] = useState<any[]>([]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Revenue &amp; Subscriptions</h1>
        <p className="text-xs text-slate-400 mt-1">
          Track verified Razorpay gateway subscriptions, active tier distributions, and conversion rates.
        </p>
      </div>

      {/* Plans Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Free Tier</span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40">Active</span>
          </div>
          <div className="text-2xl font-bold text-white">₹0</div>
          <p className="text-[11px] text-slate-400">Default tier for all registered members</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Gold Tier
            </span>
            <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-800/40">Razorpay</span>
          </div>
          <div className="text-2xl font-bold text-white">₹799 / mo</div>
          <p className="text-[11px] text-slate-400">Unlimited likes &amp; see who liked you</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-violet-400 flex items-center gap-1">
              <Crown className="w-3.5 h-3.5" /> Platinum Tier
            </span>
            <span className="text-[10px] font-bold text-violet-400 bg-violet-950/60 px-2 py-0.5 rounded-full border border-violet-800/40">Razorpay</span>
          </div>
          <div className="text-2xl font-bold text-white">₹1,499 / mo</div>
          <p className="text-[11px] text-slate-400">Priority likes &amp; message before match</p>
        </div>
      </div>

      {/* Transactions Table / Empty State */}
      {transactions.length === 0 ? (
        <div className="p-12 text-center bg-[#111827] border border-[#1F2937] rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-950/40 border border-amber-800/40 text-amber-400 mx-auto flex items-center justify-center">
            <CreditCard className="w-6 h-6" />
          </div>
          <h2 className="text-sm font-bold text-white">No Paid Transactions Yet</h2>
          <p className="text-xs text-[#9CA3AF] max-w-sm mx-auto">
            When users upgrade their subscription plans via Razorpay gateway, real payment signatures and ledger telemetry will appear here.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-[#111827] border border-[#1F2937] overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0B1020] text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-[#1F2937]">
              <tr>
                <th className="p-4">Transaction ID</th>
                <th className="p-4">Member</th>
                <th className="p-4">Plan Tier</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937]/80">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-[#1F2937]/30 transition-colors">
                  <td className="p-4 font-mono text-rose-400">{tx.id}</td>
                  <td className="p-4 text-white font-semibold">{tx.user}</td>
                  <td className="p-4 text-slate-300">{tx.plan}</td>
                  <td className="p-4 text-white font-bold">{tx.amount}</td>
                  <td className="p-4">
                    <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
                      {tx.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400 font-mono text-[11px]">{tx.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
