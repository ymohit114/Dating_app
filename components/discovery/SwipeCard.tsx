'use client';

import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { IProfile, ActionType } from '@/types';
import { CheckCircle2, MapPin, Briefcase, ChevronDown, Sparkles } from 'lucide-react';

interface SwipeCardProps {
  profile: IProfile & { compatibilityScore?: number };
  isFront: boolean;
  onSwipe: (action: ActionType) => void;
  onOpenDetails: (profile: IProfile) => void;
}

export function SwipeCard({ profile, isFront, onSwipe, onOpenDetails }: SwipeCardProps) {
  const [photoIndex, setPhotoIndex] = useState(0);

  // Horizontal motion physics
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-250, 0, 250], [-14, 0, 14]);

  // Stamp Opacities (Left for Pass, Right for Like)
  const likeOpacity = useTransform(x, [20, 120], [0, 1]);
  const nopeOpacity = useTransform(x, [-20, -120], [0, 1]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 100;
    const velocityThreshold = 400;

    // Strictly Horizontal Swipes: Left = Pass, Right = Like
    if (info.offset.x > threshold || info.velocity.x > velocityThreshold) {
      onSwipe('like');
    } else if (info.offset.x < -threshold || info.velocity.x < -velocityThreshold) {
      onSwipe('pass');
    }
  };

  const handlePhotoNav = (e: React.MouseEvent, direction: 'left' | 'right') => {
    e.stopPropagation();
    if (direction === 'left') {
      setPhotoIndex((prev) => (prev > 0 ? prev - 1 : profile.photos.length - 1));
    } else {
      setPhotoIndex((prev) => (prev < profile.photos.length - 1 ? prev + 1 : 0));
    }
  };

  const getPhotoUrl = (photo: any): string => {
    if (!photo) return '';
    if (typeof photo === 'string') return photo;
    return photo.url || photo.thumbnail || '';
  };
  const currentPhoto =
    getPhotoUrl(profile.photos?.[photoIndex]) ||
    getPhotoUrl(profile.photos?.[0]) ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'User')}&background=ec4899&color=fff&size=400`;
  const compScore = profile.compatibilityScore || 88;

  return (
    <motion.div
      style={isFront ? { x, rotate, zIndex: 20 } : { zIndex: 10, scale: 0.96, y: 8, opacity: 0.85 }}
      drag={isFront ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={isFront ? handleDragEnd : undefined}
      className={`absolute inset-0 w-full h-full max-h-[68vh] sm:max-h-[75vh] rounded-3xl overflow-hidden shadow-2xl bg-zinc-900 border border-zinc-800 cursor-grab active:cursor-grabbing select-none transition-all ${
        isFront ? 'touch-pan-y' : 'pointer-events-none'
      }`}
    >
      {/* Photo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={currentPhoto}
        alt={profile.name}
        className="w-full h-full object-cover pointer-events-none"
        draggable={false}
      />

      {/* Top Story Indicators */}
      {profile.photos && profile.photos.length > 1 && (
        <div className="absolute top-3 inset-x-3 z-30 flex gap-1.5 px-2">
          {profile.photos.map((_, idx) => (
            <div
              key={idx}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                idx === photoIndex ? 'bg-white shadow-sm' : 'bg-white/35 backdrop-blur-sm'
              }`}
            />
          ))}
        </div>
      )}

      {/* Left/Right Tap Zones for changing photos */}
      {isFront && (
        <div className="absolute inset-0 z-20 flex">
          <div
            className="w-1/2 h-4/5"
            onClick={(e) => handlePhotoNav(e, 'left')}
            title="Previous Photo"
          />
          <div
            className="w-1/2 h-4/5"
            onClick={(e) => handlePhotoNav(e, 'right')}
            title="Next Photo"
          />
        </div>
      )}

      {/* Visual Stamps on Drag */}
      {isFront && (
        <>
          <motion.div
            style={{ opacity: likeOpacity }}
            className="absolute top-8 left-6 z-30 border-4 border-emerald-500 text-emerald-400 font-black text-2xl sm:text-3xl px-4 py-1 rounded-2xl -rotate-12 uppercase tracking-wider bg-emerald-950/80 shadow-xl pointer-events-none"
          >
            LIKE
          </motion.div>

          <motion.div
            style={{ opacity: nopeOpacity }}
            className="absolute top-8 right-6 z-30 border-4 border-rose-600 text-rose-400 font-black text-2xl sm:text-3xl px-4 py-1 rounded-2xl rotate-12 uppercase tracking-wider bg-rose-950/80 shadow-xl pointer-events-none"
          >
            PASS
          </motion.div>
        </>
      )}

      {/* Bottom Profile Info Card */}
      <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent pt-24 pb-4 px-4 sm:px-5 flex flex-col justify-end">
        {/* Compatibility Pill & Badge */}
        <div className="flex items-center gap-2 mb-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[11px] font-semibold backdrop-blur-md">
            <Sparkles className="w-3 h-3 text-rose-400" />
            <span>{compScore}% Match</span>
          </div>

          {profile.relationshipGoal && (
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/10 text-zinc-300 border border-white/10 backdrop-blur-md">
              {profile.relationshipGoal}
            </span>
          )}
        </div>

        {/* Name & Age */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate">
              {profile.name}
            </h2>
            {profile.age && (
              <span className="text-xl sm:text-2xl font-light text-zinc-300">
                {profile.age}
              </span>
            )}
            {profile.isVerified && (
              <CheckCircle2 className="w-4 h-4 text-sky-400 fill-sky-400/20 shrink-0" />
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(profile);
            }}
            className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white backdrop-blur-md transition-all active:scale-95 shrink-0 ml-2 cursor-pointer"
            title="View Full Profile"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Location & Profession */}
        <div className="flex flex-wrap items-center gap-2.5 mt-1 text-xs text-zinc-300">
          {profile.location?.city && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="truncate max-w-[140px]">
                {profile.location.city}
              </span>
            </div>
          )}
          {profile.job && (
            <div className="flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span className="truncate max-w-[140px]">{profile.job}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
