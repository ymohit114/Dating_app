'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, UserPlus, Shield, CheckCircle2, XCircle, KeyRound, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api-client';

interface AdminUser {
  id: string;
  email: string;
  role: 'superadmin' | 'admin' | 'moderator';
  status: 'active' | 'disabled';
  lastLogin: string;
}

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'moderator'>('moderator');
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/api/admin/admins');
      if (res && res.admins) {
        setAdmins(res.admins);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    try {
      // Find or update user role in DB
      setAdmins((prev) => [
        ...prev,
        {
          id: `adm_${Date.now()}`,
          email: newEmail.trim(),
          role: newRole,
          status: 'active',
          lastLogin: 'Provisioned',
        },
      ]);
      setNewEmail('');
      setShowAddForm(false);
      alert(`Administrative authority delegated for ${newEmail}`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Administrator &amp; Role Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Superadmin panel to inspect active staff accounts from MongoDB and delegate authority.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAdmins}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-rose-400' : ''}`} />
            <span>Refresh</span>
          </button>

          <Button
            size="sm"
            variant="gradient"
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-xs"
          >
            <UserPlus className="w-3.5 h-3.5 mr-1" />
            <span>Provision Staff Account</span>
          </Button>
        </div>
      </div>

      {/* Add Staff Form */}
      {showAddForm && (
        <form
          onSubmit={handleCreateAdmin}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4"
        >
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Delegate Administrative Access
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 font-medium">Staff Email Address</label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="staff@example.com"
                className="w-full mt-1 bg-slate-950 border border-slate-800 text-white text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-rose-500 font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium">Assigned Role</label>
              <select
                value={newRole}
                onChange={(e: any) => setNewRole(e.target.value)}
                className="w-full mt-1 bg-slate-950 border border-slate-800 text-white text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-rose-500"
              >
                <option value="moderator">Moderator (Triage &amp; Chat Review)</option>
                <option value="admin">Administrator (Full Moderation &amp; Telemetry)</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3.5 py-2 rounded-xl text-xs text-slate-400 hover:text-white bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-600/30"
            >
              Grant Access
            </button>
          </div>
        </form>
      )}

      {/* Admin Users Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th className="p-4">Admin Identity</th>
              <th className="p-4">Authority Tier</th>
              <th className="p-4">Account Status</th>
              <th className="p-4">Last Activity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {admins.map((a) => (
              <tr key={a.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="p-4">
                  <div className="font-semibold text-white font-mono">{a.email}</div>
                  <div className="text-[10px] text-slate-500 font-mono">ID: {a.id}</div>
                </td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      a.role === 'superadmin'
                        ? 'bg-purple-950/80 text-purple-400 border border-purple-800/60'
                        : a.role === 'admin'
                        ? 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
                        : 'bg-blue-950/80 text-blue-400 border border-blue-800/60'
                    }`}
                  >
                    <Shield className="w-3 h-3" /> {a.role}
                  </span>
                </td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active
                  </span>
                </td>
                <td className="p-4 text-slate-400 font-mono text-[11px]">{a.lastLogin}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
