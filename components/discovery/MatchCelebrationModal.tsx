'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { IProfile } from '@/types';
import { Button } from '@/components/ui/Button';
import { MessageCircle, Heart, Sparkles, X } from 'lucide-react';
import Link from 'next/link';

interface MatchCelebrationModalProps {
  currentProfilePhoto: string;
  matchedProfile: IProfile;
  onClose: () => void;
}

export function MatchCelebrationModal({
  currentProfilePhoto,
  matchedProfile,
  onClose,
}: MatchCelebrationModalProps) {
  useEffect(() => {
    // Fire confetti particles
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#f43f5e', '#ec4899', '#fbbf24', '#38bdf8'],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#f43f5e', '#ec4899', '#fbbf24', '#38bdf8'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 text-center shadow-2xl overflow-hidden">
        {/* Glowing Background aura */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-800/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="text-xs uppercase font-bold tracking-widest text-amber-400">
            Mutual Attraction
          </span>
          <Sparkles className="w-5 h-5 text-amber-400" />
        </div>

        <h1 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-rose-400 via-pink-400 to-amber-300 bg-clip-text text-transparent italic tracking-tight mb-2">
          It&apos;s a Match!
        </h1>

        <p className="text-sm text-zinc-400 mb-8">
          You and <span className="font-semibold text-white">{matchedProfile.name}</span> liked each other.
        </p>

        {/* Dual Avatars */}
        <div className="relative flex items-center justify-center -space-x-6 mb-8">
          <div className="relative w-28 h-28 rounded-full overflow-hidden ring-4 ring-rose-500 shadow-xl shadow-rose-500/30 -rotate-6 transition-transform hover:rotate-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentProfilePhoto}
              alt="You"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="z-10 w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center text-white shadow-lg ring-4 ring-zinc-900">
            <Heart className="w-5 h-5 fill-white" />
          </div>

          <div className="relative w-28 h-28 rounded-full overflow-hidden ring-4 ring-pink-500 shadow-xl shadow-pink-500/30 rotate-6 transition-transform hover:rotate-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={matchedProfile.photos[0]}
              alt={matchedProfile.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col gap-3">
          <Link href={`/chat/match_${matchedProfile.userId}`} className="w-full">
            <Button variant="gradient" size="lg" className="w-full gap-2">
              <MessageCircle className="w-5 h-5" />
              Say Hello to {matchedProfile.name}
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="md"
            onClick={onClose}
            className="text-zinc-400 hover:text-white"
          >
            Keep Swiping
          </Button>
        </div>
      </div>
    </div>
  );
}
