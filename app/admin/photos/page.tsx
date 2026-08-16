'use client';

import React, { useState } from 'react';
import { Image as ImageIcon, Check, X, Trash2, Flag, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface PhotoItem {
  id: string;
  userName: string;
  url: string;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  uploadedAt: string;
}

export default function AdminPhotosPage() {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);

  const handleAction = (photoId: string, newStatus: PhotoItem['status']) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === photoId ? { ...p, status: newStatus } : p))
    );
  };

  const handleRemove = (photoId: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F9FAFB] tracking-tight">Photo Moderation Pool</h1>
          <p className="text-xs text-[#9CA3AF] mt-1">
            Review uploaded member profile photos for authenticity and community guidelines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono bg-[#111827] border border-[#1F2937] text-violet-400 px-3 py-1.5 rounded-xl">
            {photos.filter((p) => p.status === 'pending').length} Photos Pending
          </span>
        </div>
      </div>

      {photos.length === 0 ? (
        <div className="p-12 text-center bg-[#111827] border border-[#1F2937] rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-sm font-bold text-white">Photo Moderation Queue Clear</h2>
          <p className="text-xs text-[#9CA3AF] max-w-sm mx-auto">
            All user-uploaded photos have been moderated. New profile uploads will appear here for review.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((item) => (
            <div
              key={item.id}
              className="bg-[#111827] border border-[#1F2937] rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between"
            >
              <div className="relative aspect-[3/4] bg-[#0B1020] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt=""
                  className="w-full h-full object-cover"
                />

                <div className="absolute top-2.5 left-2.5">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      item.status === 'approved'
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-700/60'
                        : item.status === 'flagged'
                        ? 'bg-red-950/80 text-red-400 border border-red-700/60'
                        : 'bg-amber-950/80 text-amber-400 border border-amber-700/60'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>

              <div className="p-3.5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white truncate">{item.userName}</span>
                  <span className="text-[11px] text-[#9CA3AF] font-mono">{item.uploadedAt}</span>
                </div>

                <div className="flex items-center gap-1.5 pt-2 border-t border-[#1F2937]">
                  <button
                    onClick={() => handleAction(item.id, 'approved')}
                    className="flex-1 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-800/40 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" /> Approve
                  </button>

                  <button
                    onClick={() => handleAction(item.id, 'flagged')}
                    className="p-1.5 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 text-amber-400 border border-amber-800/40 text-xs transition-colors cursor-pointer"
                  >
                    <Flag className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleRemove(item.id)}
                    className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/40 text-xs transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
