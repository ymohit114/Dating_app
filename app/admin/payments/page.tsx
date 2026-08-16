'use client';

import React from 'react';
import { Receipt, CheckCircle2, DollarSign } from 'lucide-react';

export default function AdminPaymentsPage() {
  const transactions = [
    { id: 'pay_99182391', user: 'Alex Morgan (alex.morgan@example.com)', amount: '₹0.00 (100% Free MVP)', plan: 'Community Tier', status: 'verified', date: '2026-08-15 10:30' },
    { id: 'pay_88129034', user: 'Elena Rostova (elena.rostova@example.com)', amount: '₹0.00 (100% Free MVP)', plan: 'Community Tier', status: 'verified', date: '2026-08-14 14:15' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Verified Payment Transactions</h1>
        <p className="text-xs text-slate-400 mt-1">
          Server-verified gateway payment signatures and ledger telemetry.
        </p>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th className="p-4">Payment Signature ID</th>
              <th className="p-4">Member</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Plan Tier</th>
              <th className="p-4">Verification Status</th>
              <th className="p-4">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="p-4 font-mono text-xs text-rose-400 font-semibold">{tx.id}</td>
                <td className="p-4 text-white font-medium">{tx.user}</td>
                <td className="p-4 font-semibold text-slate-200">{tx.amount}</td>
                <td className="p-4 text-slate-400">{tx.plan}</td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                    <CheckCircle2 className="w-3 h-3" /> {tx.status}
                  </span>
                </td>
                <td className="p-4 text-slate-500 font-mono text-[11px]">{tx.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
