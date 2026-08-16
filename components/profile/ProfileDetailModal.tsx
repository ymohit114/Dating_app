'use client';

import React, { useState } from 'react';
import { IProfile, ActionType } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  X, CheckCircle2, MapPin, Briefcase, GraduationCap, 
  Ruler, Flag, Ban, Music2, Instagram, Heart, Star, Sparkles 
} from 'lucide-react';

interface ProfileDetailModalProps {
  profile: IProfile;
  onClose: () => void;
  onSwipe?: (action: ActionType) => void;
  onReport?: (profile: IProfile) => void;
  onBlock?: (profile: IProfile) => void;
}

export function ProfileDetailModal({
  profile,
  onClose,
  onSwipe,
  onReport,
  onBlock,
}: ProfileDetailModalProps) {
  const [selectedPhoto, setSelectedPhoto] = useState(profile.photos[0]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-zinc-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl my-auto">
        {/* Top Header Controls */}
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-zinc-950/70 hover:bg-zinc-950 text-white backdrop-blur-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Featured Photo Header */}
        <div className="relative w-full h-96 sm:h-[450px] bg-zinc-950">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={selectedPhoto || profile.photos[0]}
            alt={profile.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-black/30 pointer-events-none" />

          {/* Quick Photo Thumbnails */}
          {profile.photos.length > 1 && (
            <div className="absolute bottom-4 left-4 right-4 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {profile.photos.map((photo, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedPhoto(photo)}
                  className={`relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                    selectedPhoto === photo ? 'border-rose-500 scale-105 shadow-md' : 'border-white/30 opacity-70'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Profile Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Header Info */}
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                {profile.name}
              </h1>
              <span className="text-3xl font-light text-zinc-400">
                {profile.age}
              </span>
              {profile.isVerified && (
                <CheckCircle2 className="w-6 h-6 text-sky-400 fill-sky-400/20" />
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-zinc-300">
              {profile.location?.city && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-rose-400" />
                  <span>
                    {profile.location.city} {profile.distanceKm ? `• ${profile.distanceKm} km away` : ''}
                  </span>
                </div>
              )}
              {profile.job && (
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-amber-400" />
                  <span>{profile.job} {profile.company ? `at ${profile.company}` : ''}</span>
                </div>
              )}
              {profile.school && (
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-indigo-400" />
                  <span>{profile.school}</span>
                </div>
              )}
              {profile.height && (
                <div className="flex items-center gap-1.5">
                  <Ruler className="w-4 h-4 text-emerald-400" />
                  <span>{profile.height} cm</span>
                </div>
              )}
            </div>
          </div>

          {/* About / Bio */}
          {profile.bio && (
            <div className="bg-zinc-800/40 border border-zinc-800 rounded-2xl p-4">
              <h3 className="text-xs uppercase font-bold tracking-wider text-zinc-400 mb-2">
                About Me
              </h3>
              <p className="text-zinc-200 text-sm leading-relaxed whitespace-pre-line">
                {profile.bio}
              </p>
            </div>
          )}

          {/* Passions & Interests */}
          {profile.passions && profile.passions.length > 0 && (
            <div>
              <h3 className="text-xs uppercase font-bold tracking-wider text-zinc-400 mb-3">
                Passions & Interests
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.passions.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1.5 rounded-full bg-zinc-800 text-zinc-200 border border-zinc-700/60"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Profile Q&A Prompts */}
          {profile.prompts && profile.prompts.length > 0 && (
            <div className="space-y-4">
              {profile.prompts.map((prompt) => (
                <div
                  key={prompt.id}
                  className="bg-gradient-to-br from-zinc-800/80 to-zinc-850 border border-zinc-700/60 rounded-2xl p-5"
                >
                  <span className="text-xs font-semibold text-rose-400 block mb-1">
                    {prompt.question}
                  </span>
                  <p className="text-white font-medium text-base">
                    &ldquo;{prompt.answer}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Music & Socials */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {profile.spotifyTopArtist && (
              <div className="flex items-center gap-3 p-3.5 bg-emerald-950/20 border border-emerald-800/30 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Music2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] text-zinc-400">Spotify Anthem</div>
                  <div className="text-sm font-semibold text-white">{profile.spotifyTopArtist}</div>
                </div>
              </div>
            )}

            {profile.instagram && (
              <div className="flex items-center gap-3 p-3.5 bg-pink-950/20 border border-pink-800/30 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400">
                  <Instagram className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] text-zinc-400">Instagram</div>
                  <div className="text-sm font-semibold text-white">@{profile.instagram}</div>
                </div>
              </div>
            )}
          </div>

          {/* Floating Actions if onSwipe provided */}
          {onSwipe && (
            <div className="flex items-center justify-center gap-4 pt-4 border-t border-zinc-800">
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  onSwipe('pass');
                  onClose();
                }}
                className="flex-1 border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
              >
                <X className="w-5 h-5 mr-1" /> Pass
              </Button>

              <Button
                variant="gradient"
                size="lg"
                onClick={() => {
                  onSwipe('like');
                  onClose();
                }}
                className="flex-1"
              >
                <Heart className="w-5 h-5 mr-1 fill-white" /> Like
              </Button>
            </div>
          )}

          {/* Safety: Report and Block Buttons */}
          <div className="flex items-center justify-center gap-6 pt-4 border-t border-zinc-800/60 text-xs text-zinc-500">
            <button
              onClick={() => onReport?.(profile)}
              className="hover:text-rose-400 flex items-center gap-1 transition-colors"
            >
              <Flag className="w-3.5 h-3.5" /> Report {profile.name}
            </button>
            <span>•</span>
            <button
              onClick={() => onBlock?.(profile)}
              className="hover:text-zinc-300 flex items-center gap-1 transition-colors"
            >
              <Ban className="w-3.5 h-3.5" /> Block
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
