'use client';

import React, { useState, useEffect } from 'react';
import { UserCheck, ShieldCheck, Check, AlertTriangle, X, MapPin, Briefcase, Users, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api-client';

interface AdminUserProfile {
  _id: string;
  name: string;
  email: string;
  city: string;
  role: string;
  status: string;
  isVerified: boolean;
  createdAt: string;
}

export default function AdminProfilesPage() {
  const [users, setUsers] = useState<AdminUserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfiles = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/api/admin/users');
      if (res && res.users) {
        setUsers(res.users);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleToggleVerify = async (userId: string, currentStatus: boolean) => {
    try {
      await api.patch('/api/admin/users', { userId, isVerified: !currentStatus });
      fetchProfiles();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F9FAFB] tracking-tight">Profile Directory &amp; Verification</h1>
          <p className="text-xs text-[#9CA3AF] mt-1">
            Inspect registered member profiles, locations, and manage blue checkmark verifications from MongoDB.
          </p>
        </div>

        <button
          onClick={fetchProfiles}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#111827] border border-[#1F2937] text-xs font-semibold text-white hover:bg-[#1F2937] transition-all cursor-pointer w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-rose-400' : ''}`} />
          <span>Refresh Directory</span>
        </button>
      </div>

      {isLoading ? (
        <div className="p-16 text-center text-[#9CA3AF] text-xs flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading profiles from database...</span>
        </div>
      ) : users.length === 0 ? (
        <div className="p-12 text-center bg-[#111827] border border-[#1F2937] rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-950/40 border border-rose-800/40 text-rose-400 mx-auto flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <h2 className="text-sm font-bold text-white">No Profiles Registered Yet</h2>
          <p className="text-xs text-[#9CA3AF] max-w-sm mx-auto">
            When new users register and create their dating profile on the platform, they will appear here for moderation.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((p) => (
            <div
              key={p._id}
              className="p-5 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#0B1020] border border-[#1F2937] flex items-center justify-center font-bold text-rose-400 text-base">
                    {p.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white flex items-center gap-1.5">
                      <span>{p.name || 'Member'}</span>
                      {p.isVerified && <ShieldCheck className="w-4 h-4 text-blue-400" />}
                    </div>
                    <div className="text-xs text-[#9CA3AF] font-mono">
                      {p.email}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-[#D1D5DB] pt-1">
                  <div className="flex items-center gap-1.5 text-[#9CA3AF]">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>Location: {p.city || 'Not Specified'}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-slate-500 font-mono">
                      Joined: {new Date(p.createdAt).toLocaleDateString()}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      p.status === 'active'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-red-950 text-red-400 border border-red-800'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#1F2937] flex gap-2">
                <button
                  onClick={() => handleToggleVerify(p._id, p.isVerified)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    p.isVerified
                      ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{p.isVerified ? 'Revoke Verified' : 'Grant Verified'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
