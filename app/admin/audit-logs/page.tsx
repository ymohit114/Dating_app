'use client';

import React, { useState } from 'react';
import { History, Shield, Filter, Search } from 'lucide-react';

export default function AdminAuditLogsPage() {
  const [logs] = useState([
    { id: 'log_1', admin: 'admin@elance.app', action: 'USER_SUSPENDED', target: 'user_seed_6', ip: '192.168.1.101', time: '2026-08-16 16:30:12', details: 'Automated repeat spam triggers' },
    { id: 'log_2', admin: 'admin@elance.app', action: 'REPORT_RESOLVED', target: 'rep_1', ip: '192.168.1.101', time: '2026-08-16 15:45:00', details: 'Incident dismissed after review' },
    { id: 'log_3', admin: 'superadmin@elance.app', action: 'ADMIN_LOGIN', target: 'session_881', ip: '10.0.0.4', time: '2026-08-16 14:00:22', details: 'Console session authenticated' },
    { id: 'log_4', admin: 'moderator@elance.app', action: 'PHOTO_APPROVED', target: 'ph_1', ip: '192.168.1.45', time: '2026-08-16 12:15:30', details: 'Selfie pose check matched' },
    { id: 'log_5', admin: 'admin@elance.app', action: 'USER_VERIFIED', target: 'user_current_101', ip: '192.168.1.101', time: '2026-08-16 10:00:00', details: 'Blue checkmark badge granted' },
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Security &amp; Audit Trail Logs</h1>
        <p className="text-xs text-slate-400 mt-1">
          Immutable ledger of all administrative logins, moderation actions, and permission changes.
        </p>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th className="p-4">Timestamp (UTC)</th>
              <th className="p-4">Staff Admin</th>
              <th className="p-4">Action Type</th>
              <th className="p-4">Target Resource</th>
              <th className="p-4">IP Address</th>
              <th className="p-4">Action Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
            {logs.map((l) => (
              <tr key={l.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="p-4 text-slate-400">{l.time}</td>
                <td className="p-4 text-white font-semibold font-sans">{l.admin}</td>
                <td className="p-4">
                  <span className="bg-slate-800 px-2 py-0.5 rounded text-rose-400 border border-slate-700 font-bold">
                    {l.action}
                  </span>
                </td>
                <td className="p-4 text-slate-300">{l.target}</td>
                <td className="p-4 text-slate-500">{l.ip}</td>
                <td className="p-4 text-slate-400 font-sans">{l.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
