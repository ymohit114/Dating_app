'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSwipe } from '@/hooks/useSwipe';
import { useAuth } from '@/hooks/useAuth';
import { useLocationPermission } from '@/hooks/useLocationPermission';
import { SwipeCard } from '@/components/discovery/SwipeCard';
import { SwipeControls } from '@/components/discovery/SwipeControls';
import { FilterModal } from '@/components/discovery/FilterModal';
import { MatchCelebrationModal } from '@/components/discovery/MatchCelebrationModal';
import { ProfileDetailModal } from '@/components/profile/ProfileDetailModal';
import { LocationPermissionModal } from '@/components/discovery/LocationPermissionModal';
import { PeopleNearbySection } from '@/components/discovery/PeopleNearbySection';
import { IProfile, IDiscoveryFilters, ActionType } from '@/types';
import { Button } from '@/components/ui/Button';
import { SlidersHorizontal, RefreshCw, Sparkles, MapPin } from 'lucide-react';

export default function DiscoverPage() {
  const router = useRouter();
  const { user, profile: myProfile, isLoading: isAuthLoading } = useAuth();
  
  const {
    permissionStatus,
    isLoading: isLocationLoading,
    showExplanationModal,
    requestLocation,
    openPermissionPrompt,
    closeExplanationModal,
  } = useLocationPermission();

  const [filters, setFilters] = useState<Partial<IDiscoveryFilters>>({
    minAge: 18,
    maxAge: 40,
    maxDistanceKm: 50,
  });
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [detailProfile, setDetailProfile] = useState<IProfile | null>(null);

  // Protected route check
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  // Prompt location permission explanation modal on first discover visit
  useEffect(() => {
    if (!isAuthLoading && user && permissionStatus === 'prompt') {
      const hasPrompted = sessionStorage.getItem('elance_location_prompted');
      if (!hasPrompted) {
        openPermissionPrompt();
        sessionStorage.setItem('elance_location_prompted', 'true');
      }
    }
  }, [isAuthLoading, user, permissionStatus, openPermissionPrompt]);

  const {
    currentProfile,
    nextProfile,
    deck,
    hasCards,
    canRewind,
    isLoading,
    activeMatch,
    swipe,
    rewind,
    clearMatch,
    refetch,
  } = useSwipe(filters);

  // Keyboard hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showFilterModal || detailProfile || activeMatch || showExplanationModal) return;
      if (e.key === 'ArrowLeft') {
        swipe('pass');
      } else if (e.key === 'ArrowRight') {
        swipe('like');
      } else if (e.key === 'ArrowUp') {
        swipe('superlike');
      } else if (e.key === 'Backspace' || e.key === 'z') {
        rewind();
      } else if (e.key === ' ' && currentProfile) {
        setDetailProfile(currentProfile);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showFilterModal, detailProfile, activeMatch, showExplanationModal, currentProfile, swipe, rewind]);

  if (isAuthLoading || !user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="relative w-12 h-12 flex items-center justify-center mb-3">
          <span className="absolute left-0 w-8 h-8 rounded-full bg-plum-700 opacity-80 animate-ping" />
          <span className="absolute right-0 w-8 h-8 rounded-full bg-gold opacity-80 mix-blend-multiply animate-pulse" />
        </div>
        <span className="text-xs font-semibold text-charcoal-600">Loading candidate stack...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center p-2 sm:p-4 w-full relative space-y-8">
      {/* Top Stack Container */}
      <div className="w-full max-w-lg mx-auto flex flex-col items-center">
        {/* Filter Bar */}
        <div className="w-full flex items-center justify-between px-2 mb-2">
          <div className="flex items-center gap-1.5 text-xs text-charcoal-700 font-medium">
            <span className="relative flex w-3 h-3 items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-plum-700" />
            </span>
            <span>Candidates near {myProfile?.location?.city || 'Delhi'} ({deck.length} in stack)</span>
          </div>

          <button
            onClick={() => setShowFilterModal(true)}
            className="flex items-center gap-1.5 text-xs px-3.5 py-1.5 bg-ivory-200 hover:bg-ivory-300 text-charcoal-800 rounded-full border border-clay transition-colors font-medium shadow-2xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-plum-700" />
            <span>Filters</span>
          </button>
        </div>

        {/* Main Swipeable Card Deck */}
        <div className="relative w-full h-[580px] max-h-[75vh] flex items-center justify-center">
          {isLoading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <span className="absolute left-0 w-8 h-8 rounded-full bg-plum-700 opacity-80 animate-ping" />
                <span className="absolute right-0 w-8 h-8 rounded-full bg-gold opacity-80 mix-blend-multiply animate-pulse" />
              </div>
              <span className="text-xs font-semibold text-charcoal-600">Calculating compatibility scores...</span>
            </div>
          ) : hasCards ? (
            <>
              {nextProfile && (
                <SwipeCard
                  key={nextProfile._id}
                  profile={nextProfile}
                  isFront={false}
                  onSwipe={swipe}
                  onOpenDetails={(p) => setDetailProfile(p)}
                />
              )}

              {currentProfile && (
                <SwipeCard
                  key={currentProfile._id}
                  profile={currentProfile}
                  isFront={true}
                  onSwipe={swipe}
                  onOpenDetails={(p) => setDetailProfile(p)}
                />
              )}
            </>
          ) : (
            <div className="text-center p-8 bg-surface-card border border-clay rounded-3xl space-y-4 max-w-sm shadow-md">
              <div className="w-14 h-14 rounded-full bg-plum-100 text-plum-700 mx-auto flex items-center justify-center">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-serif font-bold text-charcoal-900">You&apos;re All Caught Up</h3>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                You have reviewed all compatible candidates in your immediate deck. Scroll down to browse people nearby within 5 km!
              </p>
              <div className="flex gap-2 justify-center pt-2">
                <Button variant="outline" size="sm" onClick={() => setShowFilterModal(true)}>
                  Adjust Filters
                </Button>
                <Button variant="primary" size="sm" onClick={refetch}>
                  <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh Stack
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Swipe Controls */}
        <div className="w-full">
          <SwipeControls
            onSwipe={swipe}
            onRewind={rewind}
            canRewind={canRewind}
            disabled={!hasCards}
          />
        </div>
      </div>

      {/* People Nearby You Section (Max 20 profiles within 5km radius) */}
      <PeopleNearbySection
        permissionGranted={permissionStatus === 'granted'}
        permissionDenied={permissionStatus === 'denied'}
        onRequestPermission={requestLocation}
        onOpenProfile={(p) => setDetailProfile(p)}
        onSwipeAction={(targetUserId, act) => {
          swipe(act);
        }}
      />

      {/* Location Permission Explanation Modal */}
      <LocationPermissionModal
        isOpen={showExplanationModal}
        onAllow={async () => {
          await requestLocation();
        }}
        onDeny={closeExplanationModal}
        isLoading={isLocationLoading}
      />

      {/* Filter Modal */}
      {showFilterModal && (
        <FilterModal
          initialFilters={filters}
          onApply={(newFilters) => setFilters((prev) => ({ ...prev, ...newFilters }))}
          onClose={() => setShowFilterModal(false)}
        />
      )}

      {/* Match Celebration Modal */}
      {activeMatch && activeMatch.profile && (
        <MatchCelebrationModal
          currentProfilePhoto={myProfile?.photos[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800'}
          matchedProfile={activeMatch.profile}
          onClose={clearMatch}
        />
      )}

      {/* Detailed Profile Modal */}
      {detailProfile && (
        <ProfileDetailModal
          profile={detailProfile}
          onClose={() => setDetailProfile(null)}
          onSwipe={(act) => {
            swipe(act);
            setDetailProfile(null);
          }}
        />
      )}
    </div>
  );
}
