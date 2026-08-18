'use client';

import React, { useState, useEffect } from 'react';
import { History, Shield, Filter, Search, RefreshCw, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api-client';

interface AuditLogItem {
  id: string;
  admin: string;
  action: string;
  target: string;
  ip: string;
  time: string;
  details: string;
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/api/admin/audit-logs');
      if (res && res.logs) {
        setLogs(res.logs);
      }
    } catch (e) {
      console.error('Failed to load audit logs:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Security &amp; Audit Trail Logs</h1>
          <p className="text-xs text-slate-400 mt-1">
            Immutable ledger of administrative actions, user moderations, and security events from MongoDB.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-white hover:bg-slate-800 transition-all cursor-pointer w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-rose-400' : ''}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {isLoading ? (
        <div className="p-16 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading audit logs from database...</span>
        </div>
      ) : logs.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 text-slate-400 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-sm font-bold text-white">No Audit Events Logged Yet</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            When staff administrators perform user bans, verification approvals, or role updates, real audit logs will appear here.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Timestamp</th>
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
      )}
    </div>
  );
}
