'use client';

import React, { useState } from 'react';
import { IDiscoveryFilters } from '@/types';
import { Button } from '@/components/ui/Button';
import { X, Sliders, ShieldCheck, MapPin } from 'lucide-react';

interface FilterModalProps {
  initialFilters?: Partial<IDiscoveryFilters>;
  onApply: (filters: Partial<IDiscoveryFilters>) => void;
  onClose: () => void;
}

export function FilterModal({
  initialFilters,
  onApply,
  onClose,
}: FilterModalProps) {
  const [maxDistance, setMaxDistance] = useState(initialFilters?.maxDistanceKm || 50);
  const [minAge, setMinAge] = useState(initialFilters?.minAge || 18);
  const [maxAge, setMaxAge] = useState(initialFilters?.maxAge || 35);
  const [verifiedOnly, setVerifiedOnly] = useState(initialFilters?.verifiedOnly || false);
  const [hasBioOnly, setHasBioOnly] = useState(initialFilters?.hasBioOnly || false);

  const handleSave = () => {
    onApply({
      maxDistanceKm: maxDistance,
      minAge,
      maxAge,
      verifiedOnly,
      hasBioOnly,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-rose-400" />
            <h2 className="text-lg font-bold text-white">Discovery Preferences</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-full bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Distance Range */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-300 font-medium flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rose-400" /> Maximum Distance
            </span>
            <span className="text-rose-400 font-bold">{maxDistance} km</span>
          </div>
          <input
            type="range"
            min="2"
            max="150"
            value={maxDistance}
            onChange={(e) => setMaxDistance(Number(e.target.value))}
            className="w-full accent-rose-500 bg-zinc-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* Age Range */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-300 font-medium">Age Range</span>
            <span className="text-rose-400 font-bold">
              {minAge} - {maxAge}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] text-zinc-400">Min Age</label>
              <input
                type="number"
                min="18"
                max={maxAge}
                value={minAge}
                onChange={(e) => setMinAge(Number(e.target.value))}
                className="w-full mt-1 bg-zinc-800 border border-zinc-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-zinc-400">Max Age</label>
              <input
                type="number"
                min={minAge}
                max="80"
                value={maxAge}
                onChange={(e) => setMaxAge(Number(e.target.value))}
                className="w-full mt-1 bg-zinc-800 border border-zinc-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-3 pt-2">
          <label className="flex items-center justify-between p-3 bg-zinc-800/60 rounded-2xl cursor-pointer hover:bg-zinc-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-sky-400" />
              <div>
                <div className="text-sm font-medium text-white">Verified Profiles Only</div>
                <div className="text-xs text-zinc-400">Only see photo-verified accounts</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="w-5 h-5 accent-rose-500 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-zinc-800/60 rounded-2xl cursor-pointer hover:bg-zinc-800">
            <div>
              <div className="text-sm font-medium text-white">Has Bio Written</div>
              <div className="text-xs text-zinc-400">Filter out blank profile bios</div>
            </div>
            <input
              type="checkbox"
              checked={hasBioOnly}
              onChange={(e) => setHasBioOnly(e.target.checked)}
              className="w-5 h-5 accent-rose-500 rounded cursor-pointer"
            />
          </label>
        </div>

        {/* Actions */}
        <div className="pt-3 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="gradient" className="flex-1" onClick={handleSave}>
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
