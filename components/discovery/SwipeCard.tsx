'use client';

import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { IProfile, ActionType } from '@/types';
import { CheckCircle2, MapPin, Briefcase, ChevronDown, Sparkles, Heart, X, Star } from 'lucide-react';

interface SwipeCardProps {
  profile: IProfile & { compatibilityScore?: number };
  isFront: boolean;
  onSwipe: (action: ActionType) => void;
  onOpenDetails: (profile: IProfile) => void;
}

export function SwipeCard({ profile, isFront, onSwipe, onOpenDetails }: SwipeCardProps) {
  const [photoIndex, setPhotoIndex] = useState(0);

  // Motion physics
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-250, 0, 250], [-14, 0, 14]);

  // Stamp Opacities
  const likeOpacity = useTransform(x, [20, 120], [0, 1]);
  const nopeOpacity = useTransform(x, [-20, -120], [0, 1]);
  const superLikeOpacity = useTransform(y, [-20, -100], [0, 1]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 110;
    const velocityThreshold = 450;

    if (info.offset.y < -threshold || info.velocity.y < -velocityThreshold) {
      onSwipe('superlike');
    } else if (info.offset.x > threshold || info.velocity.x > velocityThreshold) {
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

  const currentPhoto = profile.photos[photoIndex] || profile.photos[0];
  const compScore = profile.compatibilityScore || 85;

  return (
    <motion.div
      style={isFront ? { x, y, rotate, zIndex: 20 } : { zIndex: 10, scale: 0.96, y: 10, opacity: 0.88 }}
      drag={isFront}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.8}
      onDragEnd={isFront ? handleDragEnd : undefined}
      className={`absolute inset-0 w-full h-[580px] max-h-[75vh] rounded-3xl overflow-hidden shadow-2xl bg-charcoal-900 border border-ivory-300/40 cursor-grab active:cursor-grabbing select-none transition-all ${
        isFront ? 'touch-none' : 'pointer-events-none'
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
      {profile.photos.length > 1 && (
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

      {/* Left/Right Tap Zones */}
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
            className="absolute top-8 left-6 z-30 border-4 border-emerald-500 text-emerald-400 font-serif font-black text-3xl px-4 py-1 rounded-2xl -rotate-12 uppercase tracking-wider bg-emerald-950/60 shadow-xl"
          >
            LIKE
          </motion.div>

          <motion.div
            style={{ opacity: nopeOpacity }}
            className="absolute top-8 right-6 z-30 border-4 border-plum-600 text-plum-400 font-serif font-black text-3xl px-4 py-1 rounded-2xl rotate-12 uppercase tracking-wider bg-plum-950/60 shadow-xl"
          >
            PASS
          </motion.div>

          <motion.div
            style={{ opacity: superLikeOpacity }}
            className="absolute top-1/3 inset-x-0 mx-auto w-fit z-30 border-4 border-gold text-gold font-serif font-black text-3xl px-6 py-2 rounded-2xl uppercase tracking-wider bg-charcoal-900/80 shadow-2xl"
          >
            SUPER LIKE
          </motion.div>
        </>
      )}

      {/* Bottom Profile Info Card */}
      <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-charcoal-900 via-charcoal-900/85 to-transparent pt-24 pb-5 px-5 flex flex-col justify-end">
        {/* Compatibility Pill & Badge */}
        <div className="flex items-center gap-2 mb-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/20 border border-gold/40 text-gold-light text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span>{compScore}% Compatible</span>
          </div>

          {profile.relationshipGoal && (
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/10 text-ivory-200 border border-white/10 backdrop-blur-md">
              {profile.relationshipGoal}
            </span>
          )}
        </div>

        {/* Name & Age */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
              {profile.name}
            </h2>
            <span className="text-2xl sm:text-3xl font-light text-ivory-300">
              {profile.age}
            </span>
            {profile.isVerified && (
              <CheckCircle2 className="w-5 h-5 text-gold fill-gold/20" />
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(profile);
            }}
            className="p-2 rounded-full bg-white/15 hover:bg-white/25 text-white backdrop-blur-md transition-all active:scale-95"
            title="View Full Profile"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

        {/* Location & Profession */}
        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-ivory-300">
          {profile.location?.city && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-plum-400" />
              <span>
                {profile.location.city} {profile.distanceKm ? `(${profile.distanceKm} km away)` : ''}
              </span>
            </div>
          )}
          {profile.job && (
            <div className="flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-gold" />
              <span className="truncate max-w-[180px]">{profile.job}</span>
            </div>
          )}
        </div>

        {/* Top Interests Tags */}
        {profile.passions && profile.passions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {profile.passions.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="text-[11px] px-2.5 py-0.5 rounded-full bg-ivory-100/10 text-ivory-200 backdrop-blur-md border border-ivory-100/15"
              >
                {tag}
              </span>
            ))}
            {profile.passions.length > 4 && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 text-ivory-400">
                +{profile.passions.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
