'use client';

import React, { useState } from 'react';
import { ShieldAlert, UserPlus, Shield, CheckCircle2, XCircle, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface AdminUser {
  id: string;
  email: string;
  role: 'superadmin' | 'admin' | 'moderator';
  status: 'active' | 'disabled';
  lastLogin: string;
}

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([
    { id: 'adm_1', email: 'mohit@gmail.com', role: 'superadmin', status: 'active', lastLogin: 'Just now' },
    { id: 'adm_2', email: 'admin@elance.app', role: 'admin', status: 'active', lastLogin: '2 hours ago' },
    { id: 'adm_3', email: 'moderator@elance.app', role: 'moderator', status: 'active', lastLogin: 'Yesterday' },
  ]);

  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'moderator'>('moderator');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;
    setAdmins([
      ...admins,
      {
        id: `adm_${Date.now()}`,
        email: newEmail,
        role: newRole,
        status: 'active',
        lastLogin: 'Never',
      },
    ]);
    setNewEmail('');
    setShowAddForm(false);
    alert(`Administrative invitation created for ${newEmail}`);
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    setAdmins((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: currentStatus === 'active' ? 'disabled' : 'active' } : a))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Administrator &amp; Role Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Superadmin panel to provision moderator accounts, delegate authority, and revoke access.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" /> Provision Personnel
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <form onSubmit={handleCreateAdmin} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white">Provision New Staff Access</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs text-slate-300 font-semibold">Staff Email</label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="staff@elance.app"
                className="w-full mt-1 bg-slate-950 border border-slate-800 text-white text-xs px-3.5 py-2 rounded-xl focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 font-semibold">Assigned Role</label>
              <select
                value={newRole}
                onChange={(e: any) => setNewRole(e.target.value)}
                className="w-full mt-1 bg-slate-950 border border-slate-800 text-slate-300 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-rose-500"
              >
                <option value="moderator">Moderator (Reports & Photos)</option>
                <option value="admin">Administrator (Full Dashboard)</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm"
            >
              Create Account
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th className="p-4">Personnel</th>
              <th className="p-4">Authorization Role</th>
              <th className="p-4">Access Status</th>
              <th className="p-4">Last Login</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {admins.map((adm) => (
              <tr key={adm.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="p-4 font-mono font-semibold text-white">{adm.email}</td>
                <td className="p-4">
                  <span className="font-mono text-[11px] uppercase bg-slate-800 px-2 py-0.5 rounded text-rose-400 border border-slate-700">
                    {adm.role}
                  </span>
                </td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      adm.status === 'active'
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                        : 'bg-red-950/60 text-red-400 border border-red-800/40'
                    }`}
                  >
                    {adm.status}
                  </span>
                </td>
                <td className="p-4 text-slate-500 font-mono text-[11px]">{adm.lastLogin}</td>
                <td className="p-4 text-right space-x-2">
                  {adm.role !== 'superadmin' && (
                    <button
                      onClick={() => handleToggleStatus(adm.id, adm.status)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition-colors"
                    >
                      {adm.status === 'active' ? 'Disable Access' : 'Re-enable Access'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
