'use client';

import React, { useState } from 'react';
import { ShieldBan, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AdminBlocksPage() {
  const [blocks, setBlocks] = useState<any[]>([]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#F9FAFB] tracking-tight">Block Relationships &amp; Abuse Analysis</h1>
        <p className="text-xs text-[#9CA3AF] mt-1">
          Inspect member-to-member block activity to identify systemic harassment patterns.
        </p>
      </div>

      <div className="p-3.5 rounded-2xl bg-[#111827] border border-[#1F2937] flex items-center gap-2.5 text-xs text-[#9CA3AF]">
        <AlertCircle className="w-4 h-4 text-violet-400 shrink-0" />
        <span>
          Blocking automatically hides members from each other&apos;s discovery stacks and restricts all messaging channels.
        </span>
      </div>

      {blocks.length === 0 ? (
        <div className="p-12 text-center bg-[#111827] border border-[#1F2937] rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-sm font-bold text-white">No Block Relationships Found</h2>
          <p className="text-xs text-[#9CA3AF] max-w-sm mx-auto">
            Zero member blocks on record. User block actions will appear here for audit and investigation.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-[#111827] border border-[#1F2937] overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs text-[#D1D5DB]">
            <thead className="bg-[#0B1020] text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] border-b border-[#1F2937]">
              <tr>
                <th className="p-4">Blocker (Member Initiating)</th>
                <th className="p-4">Blocked Account</th>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Context / Stated Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937]/80">
              {blocks.map((b) => (
                <tr key={b.id} className="hover:bg-[#1F2937]/30 transition-colors">
                  <td className="p-4 font-semibold text-white">{b.blocker}</td>
                  <td className="p-4 text-red-400 font-mono flex items-center gap-1.5">
                    <ShieldBan className="w-3.5 h-3.5" />
                    <span>{b.blocked}</span>
                  </td>
                  <td className="p-4 text-[#9CA3AF] font-mono text-[11px]">{b.date}</td>
                  <td className="p-4 text-[#D1D5DB]">{b.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
