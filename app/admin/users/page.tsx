'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, ShieldCheck, ShieldBan, 
  CheckCircle2, XCircle, AlertTriangle, RefreshCw 
} from 'lucide-react';

interface UserRecord {
  _id: string;
  email: string;
  role: 'user' | 'moderator' | 'admin' | 'superadmin';
  status: 'active' | 'suspended' | 'banned' | 'deleted';
  isVerified: boolean;
  name?: string;
  city?: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/users`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: newStatus }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, status: newStatus as any } : u))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleVerify = async (userId: string, currentVerified: boolean) => {
    try {
      const res = await fetch(`/api/admin/users`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isVerified: !currentVerified }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, isVerified: !currentVerified } : u))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F9FAFB] tracking-tight">Member Directory &amp; Control</h1>
          <p className="text-xs text-[#9CA3AF] mt-1">
            Search, verify, suspend, or ban user accounts across the platform.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#111827] border border-[#1F2937] text-xs font-semibold text-[#D1D5DB] hover:text-white hover:bg-[#1F2937] transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh List
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-[#111827] border border-[#1F2937] flex flex-col sm:flex-row items-center gap-3 justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0B1020] border border-[#1F2937] text-white text-xs pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-violet-500 font-mono placeholder:text-gray-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-[#6B7280]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0B1020] border border-[#1F2937] text-[#D1D5DB] text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-violet-500"
          >
            <option value="all">All Account Statuses</option>
            <option value="active">Active Members</option>
            <option value="suspended">Suspended Accounts</option>
            <option value="banned">Banned Accounts</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl bg-[#111827] border border-[#1F2937] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#D1D5DB]">
            <thead className="bg-[#0B1020] text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] border-b border-[#1F2937]">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Verification</th>
                <th className="p-4">Registered</th>
                <th className="p-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937]/80">
              {filteredUsers.map((u) => (
                <tr key={u._id} className="hover:bg-[#1F2937]/30 transition-colors">
                  <td className="p-4 font-medium text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#1F2937] border border-[#374151] flex items-center justify-center font-bold text-xs text-violet-400">
                        {u.name?.[0] || u.email[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{u.name || 'Anonymous Member'}</div>
                        <div className="text-[11px] text-[#9CA3AF] font-mono">{u.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <span className="font-mono text-[11px] uppercase bg-[#0B1020] px-2 py-0.5 rounded text-violet-300 border border-[#1F2937]">
                      {u.role}
                    </span>
                  </td>

                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        u.status === 'active'
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                          : u.status === 'suspended'
                          ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                          : 'bg-red-950/60 text-red-400 border border-red-800/40'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>

                  <td className="p-4">
                    <button
                      onClick={() => handleToggleVerify(u._id, u.isVerified)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-colors cursor-pointer ${
                        u.isVerified
                          ? 'bg-blue-950/60 text-blue-400 border-blue-800 hover:bg-blue-900/60'
                          : 'bg-[#1F2937] text-[#9CA3AF] border-[#374151] hover:bg-[#374151]'
                      }`}
                    >
                      <ShieldCheck className="w-3 h-3" />
                      {u.isVerified ? 'Verified Badge' : 'Unverified'}
                    </button>
                  </td>

                  <td className="p-4 text-[#9CA3AF] font-mono text-[11px]">
                    {new Date(u.createdAt).toISOString().substring(0, 10)}
                  </td>

                  <td className="p-4 text-right space-x-2">
                    {u.status === 'active' ? (
                      <>
                        <button
                          onClick={() => handleStatusChange(u._id, 'suspended')}
                          className="px-2.5 py-1 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-800/40 text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          Suspend
                        </button>
                        <button
                          onClick={() => handleStatusChange(u._id, 'banned')}
                          className="px-2.5 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/40 text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          Ban User
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleStatusChange(u._id, 'active')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/40 text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        Reactivate Account
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
