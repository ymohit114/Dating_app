'use client';

import React, { useState, useEffect } from 'react';
import { IProfile, ActionType } from '@/types';
import { 
  MapPin, Heart, X, Sparkles, CheckCircle2, 
  ShieldCheck, Sliders, RefreshCw, AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface NearbyCandidate extends IProfile {
  distanceKm: number;
  approximateDistance: string;
  compatibilityScore?: number;
  city?: string;
}

interface PeopleNearbySectionProps {
  permissionGranted: boolean;
  permissionDenied: boolean;
  onRequestPermission: () => void;
  onOpenProfile: (profile: IProfile) => void;
  onSwipeAction: (userId: string, action: ActionType) => void;
}

const RADIUS_OPTIONS = [5, 10, 25, 50];

export function PeopleNearbySection({
  permissionGranted,
  permissionDenied,
  onRequestPermission,
  onOpenProfile,
  onSwipeAction,
}: PeopleNearbySectionProps) {
  const [radiusKm, setRadiusKm] = useState<number>(5);
  const [nearbyUsers, setNearbyUsers] = useState<NearbyCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNearbyUsers = async (radius: number) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/discover/nearby?radiusKm=${radius}&limit=20`);
      const data = await res.json();
      if (data.users) {
        setNearbyUsers(data.users);
      }
    } catch (err) {
      console.error('Error loading nearby candidates:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (permissionGranted) {
      fetchNearbyUsers(radiusKm);
    }
  }, [permissionGranted, radiusKm]);

  const handleAction = (candidate: NearbyCandidate, action: ActionType) => {
    onSwipeAction(candidate.userId, action);
    // Remove swiped candidate from nearby grid
    setNearbyUsers((prev) => prev.filter((u) => u.userId !== candidate.userId));
  };

  return (
    <section className="w-full max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header & Radius Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-clay">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-plum-100 text-plum-700">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-charcoal-900">
                People Nearby You
              </h2>
              <p className="text-xs text-charcoal-600">
                {permissionGranted
                  ? `${nearbyUsers.length} ${nearbyUsers.length === 1 ? 'person' : 'people'} within ${radiusKm} km`
                  : `Discover eligible matches within ${radiusKm} km`}
              </p>
            </div>
          </div>
        </div>

        {/* Radius Controls */}
        <div className="flex items-center gap-1.5 bg-ivory-200/80 p-1.5 rounded-2xl border border-clay self-start sm:self-auto">
          <span className="text-[11px] font-semibold text-charcoal-600 px-2">Radius:</span>
          {RADIUS_OPTIONS.map((r) => (
            <button
              key={r}
              onClick={() => setRadiusKm(r)}
              className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all ${
                radiusKm === r
                  ? 'bg-plum-700 text-white shadow-xs'
                  : 'text-charcoal-700 hover:bg-ivory-100'
              }`}
            >
              {r} km
            </button>
          ))}
        </div>
      </div>

      {/* Permission Request Banner (If not yet granted) */}
      {!permissionGranted && (
        <div className="p-6 rounded-3xl bg-surface-card border border-clay shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-plum-100 text-plum-700 flex items-center justify-center shrink-0 mx-auto sm:mx-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-charcoal-900">
                {permissionDenied ? 'Location access was denied' : 'Enable Location for Nearby Candidates'}
              </h3>
              <p className="text-xs text-charcoal-600 mt-0.5 max-w-md">
                {permissionDenied
                  ? 'Click retry below or check your browser address bar permissions to discover people within 5 km.'
                  : 'Allow location access to discover people near you. Exact GPS coordinates are never revealed.'}
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={onRequestPermission}
            className="shrink-0 font-semibold"
          >
            {permissionDenied ? 'Retry Location Access' : 'Enable Location'}
          </Button>
        </div>
      )}

      {/* Grid of Nearby Candidates */}
      {permissionGranted && (
        <>
          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <div className="relative w-10 h-10 mx-auto flex items-center justify-center">
                <span className="absolute left-0 w-6 h-6 rounded-full bg-plum-700 opacity-80 animate-ping" />
                <span className="absolute right-0 w-6 h-6 rounded-full bg-gold opacity-80 mix-blend-multiply animate-pulse" />
              </div>
              <p className="text-xs text-charcoal-600 font-medium">
                Searching for members within {radiusKm} km...
              </p>
            </div>
          ) : nearbyUsers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {nearbyUsers.map((candidate) => (
                <div
                  key={candidate.userId || candidate._id}
                  onClick={() => onOpenProfile(candidate)}
                  className="bg-surface-card border border-clay rounded-3xl overflow-hidden shadow-sm hover:shadow-md hover:border-plum-300 transition-all group cursor-pointer flex flex-col justify-between"
                >
                  {/* Photo Container */}
                  <div className="relative aspect-[4/5] overflow-hidden bg-charcoal-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={candidate.photos[0]}
                      alt={candidate.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Approximate Distance Pill */}
                    <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full bg-charcoal-900/80 text-ivory-100 text-[11px] font-semibold backdrop-blur-md border border-white/10 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-plum-400" />
                      <span>{candidate.approximateDistance}</span>
                    </div>

                    {/* Compatibility Pill */}
                    {candidate.compatibilityScore && (
                      <div className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded-full bg-gold/90 text-charcoal-900 text-[10px] font-bold shadow-sm">
                        {candidate.compatibilityScore}%
                      </div>
                    )}

                    {/* Bottom gradient on photo */}
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-charcoal-900/80 to-transparent flex items-end p-3">
                      <div className="text-white font-serif font-bold text-base leading-tight">
                        {candidate.name}, <span className="font-sans font-normal text-sm text-ivory-200">{candidate.age}</span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-xs text-charcoal-600 flex items-center gap-1">
                        <span>{candidate.city}</span>
                        {candidate.job && <span>• {candidate.job}</span>}
                      </div>

                      {candidate.bio && (
                        <p className="text-xs text-charcoal-700 mt-1 line-clamp-2 leading-relaxed">
                          {candidate.bio}
                        </p>
                      )}

                      {/* Top Interests */}
                      {candidate.passions && candidate.passions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {candidate.passions.slice(0, 3).map((p) => (
                            <span
                              key={p}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-ivory-200 text-charcoal-700 border border-clay"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 1-Click Action Buttons */}
                    <div className="flex items-center gap-2 pt-3 border-t border-clay/60">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction(candidate, 'pass');
                        }}
                        className="flex-1 py-1.5 rounded-xl bg-ivory-200 hover:bg-clay text-charcoal-700 hover:text-charcoal-900 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                        title="Pass"
                      >
                        <X className="w-3.5 h-3.5" /> Pass
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction(candidate, 'like');
                        }}
                        className="flex-1 py-1.5 rounded-xl bg-plum-700 hover:bg-plum-800 text-white text-xs font-semibold flex items-center justify-center gap-1 shadow-sm transition-colors"
                        title="Like"
                      >
                        <Heart className="w-3.5 h-3.5 fill-white" /> Like
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-12 px-4 rounded-3xl bg-surface-card border border-clay space-y-3">
              <div className="w-12 h-12 rounded-full bg-ivory-200 text-charcoal-500 mx-auto flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="text-base font-serif font-bold text-charcoal-900">
                No suitable people found within {radiusKm} km
              </h4>
              <p className="text-xs text-charcoal-600 max-w-sm mx-auto">
                Try increasing your discovery distance to 10 km, 25 km, or 50 km to find more candidates.
              </p>
              <div className="pt-2 flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRadiusKm(radiusKm < 50 ? (radiusKm === 5 ? 10 : radiusKm === 10 ? 25 : 50) : 5)}
                >
                  Expand to {radiusKm === 5 ? '10 km' : radiusKm === 10 ? '25 km' : '50 km'}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => fetchNearbyUsers(radiusKm)}
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1" /> Retry Search
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
