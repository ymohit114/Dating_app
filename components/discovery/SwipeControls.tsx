'use client';

import React from 'react';
import { RotateCcw, X, Star, Heart, Zap } from 'lucide-react';
import { ActionType } from '@/types';

interface SwipeControlsProps {
  onSwipe: (action: ActionType) => void;
  onRewind: () => void;
  canRewind: boolean;
  onBoost?: () => void;
  disabled?: boolean;
}

export function SwipeControls({
  onSwipe,
  onRewind,
  canRewind,
  onBoost,
  disabled = false,
}: SwipeControlsProps) {
  return (
    <div className="flex items-center justify-center gap-3 sm:gap-4 py-4 select-none">
      {/* Rewind */}
      <button
        onClick={onRewind}
        disabled={!canRewind || disabled}
        className="w-12 h-12 rounded-full bg-surface-card border border-gold/40 text-gold flex items-center justify-center shadow-md hover:bg-gold/10 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all"
        title="Rewind Last Swipe"
      >
        <RotateCcw className="w-5 h-5" />
      </button>

      {/* Dislike / Pass */}
      <button
        onClick={() => onSwipe('pass')}
        disabled={disabled}
        className="w-15 h-15 sm:w-16 sm:h-16 p-4 rounded-full bg-surface-card border border-charcoal-700/60 text-charcoal-700 hover:text-plum-700 flex items-center justify-center shadow-lg hover:border-plum-700/40 hover:scale-105 active:scale-95 disabled:opacity-40 transition-all"
        title="Pass"
      >
        <X className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.5]" />
      </button>

      {/* Super Like */}
      <button
        onClick={() => onSwipe('superlike')}
        disabled={disabled}
        className="w-12 h-12 rounded-full bg-surface-card border border-gold text-gold flex items-center justify-center shadow-md hover:bg-gold/15 hover:scale-105 active:scale-95 disabled:opacity-40 transition-all"
        title="Super Like"
      >
        <Star className="w-5 h-5 fill-gold/20" />
      </button>

      {/* Like */}
      <button
        onClick={() => onSwipe('like')}
        disabled={disabled}
        className="w-15 h-15 sm:w-16 sm:h-16 p-4 rounded-full bg-plum-700 text-white flex items-center justify-center shadow-xl shadow-plum-700/30 hover:bg-plum-800 hover:scale-105 active:scale-95 disabled:opacity-40 transition-all"
        title="Like Profile"
      >
        <Heart className="w-7 h-7 sm:w-8 sm:h-8 fill-white" />
      </button>

      {/* Boost */}
      <button
        onClick={onBoost}
        disabled={disabled}
        className="w-12 h-12 rounded-full bg-surface-card border border-clay text-charcoal-700 flex items-center justify-center shadow-md hover:bg-clay/40 hover:scale-105 active:scale-95 disabled:opacity-40 transition-all"
        title="Free Boost"
      >
        <Zap className="w-5 h-5 text-plum-700" />
      </button>
    </div>
  );
}
