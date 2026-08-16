'use client';

import React from 'react';
import { MapPin, ShieldCheck, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface LocationPermissionModalProps {
  isOpen: boolean;
  onAllow: () => void;
  onDeny: () => void;
  isLoading?: boolean;
}

export function LocationPermissionModal({
  isOpen,
  onAllow,
  onDeny,
  isLoading = false,
}: LocationPermissionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-surface-card border border-clay rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onDeny}
          className="absolute top-4 right-4 p-2 rounded-full text-charcoal-500 hover:text-charcoal-900 hover:bg-ivory-200 transition-colors"
          title="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 bg-plum-100 rounded-full animate-ping opacity-50" />
          <div className="w-16 h-16 rounded-full bg-plum-700 text-white flex items-center justify-center shadow-lg shadow-plum-700/25">
            <MapPin className="w-8 h-8" />
          </div>
        </div>

        {/* Text */}
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-plum-700">Location Permission</span>
          <h2 className="text-2xl font-serif font-bold text-charcoal-900">
            Allow location access to discover people near you
          </h2>
          <p className="text-xs text-charcoal-600 leading-relaxed max-w-xs mx-auto">
            Elance uses your approximate location to calculate nearby matches within 5 km.
          </p>
        </div>

        {/* Privacy Note */}
        <div className="p-3.5 rounded-2xl bg-ivory-200/80 border border-clay flex items-start gap-2.5 text-xs text-charcoal-700">
          <ShieldCheck className="w-4 h-4 text-plum-700 shrink-0 mt-0.5" />
          <span>
            <strong>Your privacy is protected:</strong> We only show approximate distance (e.g. &ldquo;1.4 km away&rdquo;). Your exact GPS coordinates are never shared with other users.
          </span>
        </div>

        {/* Buttons */}
        <div className="space-y-2">
          <Button
            variant="primary"
            size="lg"
            className="w-full font-semibold shadow-lg shadow-plum-700/20"
            onClick={onAllow}
            isLoading={isLoading}
          >
            Allow Location Access
          </Button>

          <Button
            variant="ghost"
            size="md"
            className="w-full text-xs text-charcoal-600"
            onClick={onDeny}
            disabled={isLoading}
          >
            Not Now
          </Button>
        </div>
      </div>
    </div>
  );
}
