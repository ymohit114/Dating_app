'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient' | 'danger' | 'gold';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 select-none';

  const variants = {
    primary: 'bg-plum-700 hover:bg-plum-800 text-white shadow-md shadow-plum-700/20',
    secondary: 'bg-ivory-200 hover:bg-ivory-300 text-charcoal-900 border border-clay',
    outline: 'border border-clay hover:border-plum-700/40 text-charcoal-800 hover:bg-ivory-200/60',
    ghost: 'hover:bg-ivory-200 text-charcoal-700 hover:text-charcoal-900',
    gradient: 'bg-gradient-to-r from-plum-700 via-plum-800 to-plum-900 text-white shadow-lg shadow-plum-700/25 hover:brightness-105',
    gold: 'bg-gold hover:bg-gold-dark text-white font-semibold shadow-md shadow-gold/25',
    danger: 'bg-red-700 hover:bg-red-800 text-white',
  };

  const sizes = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5',
    md: 'text-sm px-5 py-2.5 gap-2',
    lg: 'text-base px-7 py-3.5 gap-2.5 font-semibold',
    icon: 'p-3 aspect-square',
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          {/* Signature Overlapping Circles Loading Motif */}
          <span className="relative flex w-4 h-4 items-center justify-center">
            <span className="absolute w-3 h-3 rounded-full bg-current opacity-75 animate-ping" />
            <span className="w-2.5 h-2.5 rounded-full bg-current" />
          </span>
          Processing...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
