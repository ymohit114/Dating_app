'use client';

import React from 'react';
import { RotateCcw, X, Star, Heart } from 'lucide-react';
import { ActionType } from '@/types';

interface SwipeControlsProps {
  onSwipe: (action: ActionType) => void;
  onRewind: () => void;
  canRewind: boolean;
  disabled?: boolean;
}

export function SwipeControls({
  onSwipe,
  onRewind,
  canRewind,
  disabled = false,
}: SwipeControlsProps) {
  return (
    <div className="flex items-center justify-center gap-3 sm:gap-5 py-3 select-none w-full max-w-sm mx-auto px-4">
      {/* Rewind */}
      <button
        type="button"
        onClick={onRewind}
        disabled={!canRewind || disabled}
        className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-zinc-900 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-lg hover:bg-amber-500/10 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
        title="Rewind Last Swipe"
      >
        <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Dislike / Pass */}
      <button
        type="button"
        onClick={() => onSwipe('pass')}
        disabled={disabled}
        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-red-400 hover:border-red-500/50 flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 disabled:opacity-40 transition-all cursor-pointer"
        title="Pass"
      >
        <X className="w-6 h-6 sm:w-8 sm:h-8 stroke-[2.5]" />
      </button>

      {/* Super Like */}
      <button
        type="button"
        onClick={() => onSwipe('superlike')}
        disabled={disabled}
        className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-zinc-900 border border-blue-500/50 text-blue-400 flex items-center justify-center shadow-lg hover:bg-blue-500/10 hover:scale-105 active:scale-95 disabled:opacity-40 transition-all cursor-pointer"
        title="Super Like"
      >
        <Star className="w-5 h-5 fill-blue-400/20" />
      </button>

      {/* Like */}
      <button
        type="button"
        onClick={() => onSwipe('like')}
        disabled={disabled}
        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-rose-600 to-pink-500 text-white flex items-center justify-center shadow-xl shadow-rose-600/30 hover:from-rose-500 hover:to-pink-400 hover:scale-105 active:scale-95 disabled:opacity-40 transition-all cursor-pointer"
        title="Like Profile"
      >
        <Heart className="w-6 h-6 sm:w-8 sm:h-8 fill-white" />
      </button>
    </div>
  );
}
