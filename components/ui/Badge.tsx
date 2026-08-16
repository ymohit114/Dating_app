'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'gold' | 'verified' | 'boost' | 'outline' | 'plum';
}

export function Badge({
  children,
  className,
  variant = 'default',
  ...props
}: BadgeProps) {
  const base = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide';

  const variants = {
    default: 'bg-ivory-200 text-charcoal-800 border border-clay',
    plum: 'bg-plum-100 text-plum-700 border border-plum-200 font-semibold',
    gold: 'bg-gold/15 text-gold-dark border border-gold/30 font-bold',
    verified: 'bg-gold/20 text-gold-dark border border-gold/40',
    boost: 'bg-plum-700/15 text-plum-700 border border-plum-700/30',
    outline: 'border border-clay text-charcoal-600',
  };

  return (
    <span className={twMerge(clsx(base, variants[variant], className))} {...props}>
      {children}
    </span>
  );
}
