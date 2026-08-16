'use client';

import React from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { MetricCard } from '@/components/admin/MetricCard';
import { formatCurrencyINR } from '@/utils/formatters';
import { CreditCard, TrendingUp, Sparkles, Crown, Zap, CheckCircle2 } from 'lucide-react';

export default function AdminSubscriptionsPage() {
  const transactions = [
    {
      id: 'tx_101',
      user: 'Alex Morgan',
      plan: 'Tinder Gold (Monthly)',
      amount: 799,
      status: 'success',
      date: '2026-08-16 14:22',
      method: 'Razorpay UPI',
    },
    {
      id: 'tx_102',
      user: 'Elena Rostova',
      plan: 'Tinder Platinum (12 Months)',
      amount: 5999,
      status: 'success',
      date: '2026-08-16 11:05',
      method: 'Razorpay Card',
    },
    {
      id: 'tx_103',
      user: 'Maya Sharma',
      plan: '5 Profile Boosts Pack',
      amount: 499,
      status: 'success',
      date: '2026-08-15 19:40',
      method: 'Razorpay NetBanking',
    },
    {
      id: 'tx_104',
      user: 'Rohan Verma',
      plan: 'Tinder Gold (Monthly)',
      amount: 799,
      status: 'success',
      date: '2026-08-15 16:12',
      method: 'Razorpay UPI',
    },
  ];

  return (
    <div className="flex flex-1 min-h-[calc(100vh-64px)] bg-zinc-950">
      <AdminSidebar />

      <div className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Revenue & Subscriptions</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Track Razorpay gateway settlements, active tier distributions, and conversion rates
          </p>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard
            title="Monthly Recurring Revenue"
            value={formatCurrencyINR(592000)}
            change="+18.4%"
            icon={TrendingUp}
            color="emerald"
          />
          <MetricCard
            title="Active Gold Subscribers"
            value="1,850"
            change="+9.2%"
            icon={Sparkles}
            color="amber"
          />
          <MetricCard
            title="Active Platinum VIPs"
            value="720"
            change="+24.8%"
            icon={Crown}
            color="purple"
          />
        </div>

        {/* Transactions Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl space-y-4 p-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            Recent Razorpay Transactions
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950 text-zinc-400 uppercase font-semibold text-[10px] tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="px-4 py-3">Transaction ID</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Plan / Product</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Payment Method</th>
                  <th className="px-4 py-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-zinc-850/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-zinc-400">{tx.id}</td>
                    <td className="px-4 py-3 font-bold text-white">{tx.user}</td>
                    <td className="px-4 py-3">
                      <span className="text-zinc-200">{tx.plan}</span>
                    </td>
                    <td className="px-4 py-3 font-bold text-emerald-400">
                      {formatCurrencyINR(tx.amount)}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{tx.method}</td>
                    <td className="px-4 py-3 text-zinc-500">{tx.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
