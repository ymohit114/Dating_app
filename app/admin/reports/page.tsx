'use client';

import React, { useState, useEffect } from 'react';
import { Flag, RefreshCw } from 'lucide-react';
import { IReport } from '@/types';

export default function AdminReportsPage() {
  const [reports, setReports] = useState<IReport[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/reports');
      const data = await res.json();
      if (data.reports) setReports(data.reports);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUpdateStatus = async (reportId: string, newStatus: IReport['status']) => {
    try {
      const res = await fetch('/api/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, action: newStatus }),
      });
      if (res.ok) {
        setReports((prev) =>
          prev.map((r) => (r._id === reportId ? { ...r, status: newStatus } : r))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = reports.filter((r) => filterStatus === 'all' || r.status === filterStatus);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F9FAFB] tracking-tight">Trust &amp; Safety Incident Reports</h1>
          <p className="text-xs text-[#9CA3AF] mt-1">
            Review abuse, harassment, and community policy violations reported by members.
          </p>
        </div>

        <button
          onClick={fetchReports}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#111827] border border-[#1F2937] text-xs font-semibold text-[#D1D5DB] hover:text-white hover:bg-[#1F2937] transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Queue
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1F2937] pb-3 overflow-x-auto">
        {['all', 'pending', 'reviewing', 'resolved', 'dismissed'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              filterStatus === st
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xs'
                : 'text-[#9CA3AF] hover:text-white hover:bg-[#111827]'
            }`}
          >
            {st} ({st === 'all' ? reports.length : reports.filter((r) => r.status === st).length})
          </button>
        ))}
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        {filtered.map((report) => (
          <div
            key={report._id}
            className="p-5 rounded-2xl bg-[#111827] border border-[#1F2937] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-[#374151] transition-all"
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-red-400 uppercase tracking-wide flex items-center gap-1">
                  <Flag className="w-3.5 h-3.5" /> {report.reason.replace(/_/g, ' ')}
                </span>
                <span className="text-[#374151]">&bull;</span>
                <span className="text-[#9CA3AF] text-xs font-mono">
                  {new Date(report.createdAt).toISOString().substring(0, 16).replace('T', ' ')}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    report.status === 'pending'
                      ? 'bg-red-950/60 text-red-400 border border-red-800/40'
                      : report.status === 'resolved'
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                      : 'bg-[#0B1020] text-[#9CA3AF] border border-[#1F2937]'
                  }`}
                >
                  {report.status}
                </span>
              </div>

              <div className="text-xs text-[#D1D5DB]">
                <span className="text-[#9CA3AF]">Reporter:</span>{' '}
                <strong className="text-white">{report.reporterProfile?.name || report.reporterId}</strong> &rarr;{' '}
                <span className="text-[#9CA3AF]">Reported:</span>{' '}
                <strong className="text-white">{report.reportedProfile?.name || report.reportedUserId}</strong>
              </div>

              {report.description && (
                <p className="text-xs text-[#9CA3AF] bg-[#0B1020] p-3 rounded-xl border border-[#1F2937] leading-relaxed">
                  &ldquo;{report.description}&rdquo;
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
              {report.status === 'pending' && (
                <button
                  onClick={() => handleUpdateStatus(report._id, 'reviewing')}
                  className="px-3 py-1.5 rounded-xl bg-[#1F2937] hover:bg-[#374151] text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Assign to Me
                </button>
              )}

              <button
                onClick={() => handleUpdateStatus(report._id, 'resolved')}
                className="px-3 py-1.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-800/40 text-xs font-semibold transition-colors cursor-pointer"
              >
                Resolve &amp; Warn
              </button>

              <button
                onClick={() => handleUpdateStatus(report._id, 'dismissed')}
                className="px-3 py-1.5 rounded-xl bg-[#1F2937] hover:bg-[#374151] text-[#9CA3AF] text-xs font-semibold transition-colors cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
