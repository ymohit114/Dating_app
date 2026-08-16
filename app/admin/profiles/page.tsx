'use client';

import React, { useState } from 'react';
import { UserCheck, ShieldCheck, Check, AlertTriangle, X, MapPin, Briefcase, Users } from 'lucide-react';
import { IProfile } from '@/types';

export default function AdminProfilesPage() {
  const [profiles, setProfiles] = useState<IProfile[]>([]);

  const handleAction = (profileId: string, action: string) => {
    alert(`Moderator action "${action}" recorded in Admin Audit Log for profile ${profileId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#F9FAFB] tracking-tight">Profile Moderation &amp; Auditing</h1>
        <p className="text-xs text-[#9CA3AF] mt-1">
          Inspect bio texts, prompt answers, relationship goals, and member attributes.
        </p>
      </div>

      {profiles.length === 0 ? (
        <div className="p-12 text-center bg-[#111827] border border-[#1F2937] rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-violet-950/40 border border-violet-800/40 text-violet-400 mx-auto flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <h2 className="text-sm font-bold text-white">No Profiles Registered Yet</h2>
          <p className="text-xs text-[#9CA3AF] max-w-sm mx-auto">
            When new users register and create their dating profile on the platform, they will appear here for moderation.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map((p) => (
            <div
              key={p._id}
              className="p-5 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {p.photos && p.photos[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.photos[0]}
                      alt=""
                      className="w-12 h-12 rounded-xl object-cover border border-[#1F2937]"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-[#0B1020] border border-[#1F2937] flex items-center justify-center font-bold text-violet-400">
                      {p.name?.[0] || 'U'}
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-sm text-white flex items-center gap-1.5">
                      <span>{p.name}, {p.age}</span>
                      {p.isVerified && <ShieldCheck className="w-4 h-4 text-blue-400" />}
                    </div>
                    <div className="text-xs text-[#9CA3AF] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#6B7280]" />
                      <span>{p.location?.city || 'India'}</span>
                    </div>
                  </div>
                </div>

                {p.job && (
                  <div className="text-xs text-[#D1D5DB] flex items-center gap-1.5 font-medium">
                    <Briefcase className="w-3.5 h-3.5 text-[#6B7280]" />
                    <span>{p.job}</span>
                  </div>
                )}

                {p.bio && (
                  <p className="text-xs text-[#D1D5DB] bg-[#0B1020] p-3 rounded-xl border border-[#1F2937] leading-relaxed">
                    &ldquo;{p.bio}&rdquo;
                  </p>
                )}
              </div>

              {/* Moderation Controls */}
              <div className="flex items-center gap-2 pt-3 border-t border-[#1F2937]">
                <button
                  onClick={() => handleAction(p._id, 'Approve Profile')}
                  className="flex-1 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-800/40 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" /> Approve
                </button>

                <button
                  onClick={() => handleAction(p._id, 'Send Warning Notice')}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-800/40 text-xs font-semibold transition-colors cursor-pointer"
                  title="Warn User"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleAction(p._id, 'Reject Profile Text')}
                  className="px-2.5 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/40 text-xs font-semibold transition-colors cursor-pointer"
                  title="Reject"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
