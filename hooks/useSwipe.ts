'use client';

import { useState, useCallback, useEffect } from 'react';
import { IProfile, ActionType } from '@/types';
import { api } from '@/lib/api-client';
import { SEED_PROFILES } from '@/utils/seedData';

export function useSwipe(filters?: any) {
  const [deck, setDeck] = useState<IProfile[]>([]);
  const [history, setHistory] = useState<{ profile: IProfile; action: ActionType }[]>([]);
  const [activeMatch, setActiveMatch] = useState<{ isMatch: boolean; profile?: IProfile } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStack = useCallback(async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters?.minAge) queryParams.set('minAge', filters.minAge.toString());
      if (filters?.maxAge) queryParams.set('maxAge', filters.maxAge.toString());
      if (filters?.maxDistanceKm) queryParams.set('maxDistanceKm', filters.maxDistanceKm.toString());
      if (filters?.verifiedOnly) queryParams.set('verifiedOnly', 'true');

      const data = await api.get(`/api/discover?${queryParams.toString()}`);
      if (data.profiles && data.profiles.length > 0) {
        setDeck(data.profiles);
      } else {
        setDeck(SEED_PROFILES);
      }
    } catch {
      setDeck(SEED_PROFILES);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchStack();
  }, [fetchStack]);

  const swipe = async (action: ActionType): Promise<void> => {
    if (deck.length === 0) return;

    const currentProfile = deck[0];
    const remainingDeck = deck.slice(1);

    // Track for rewind
    setHistory((prev) => [{ profile: currentProfile, action }, ...prev]);
    setDeck(remainingDeck);

    try {
      const data = await api.post('/api/discover/action', {
        targetUserId: currentProfile.userId,
        action,
      });

      if (data.isMatch || data.matched) {
        setActiveMatch({ isMatch: true, profile: currentProfile });
      }
    } catch {
      // Fallback preview
      if (action === 'superlike' || Math.random() > 0.45) {
        setActiveMatch({ isMatch: true, profile: currentProfile });
      }
    }
  };

  const rewind = () => {
    if (history.length === 0) return;
    const lastItem = history[0];
    setHistory((prev) => prev.slice(1));
    setDeck((prev) => [lastItem.profile, ...prev]);
  };

  const clearMatch = () => {
    setActiveMatch(null);
  };

  return {
    currentProfile: deck[0] || null,
    nextProfile: deck[1] || null,
    deck,
    hasCards: deck.length > 0,
    canRewind: history.length > 0,
    isLoading,
    activeMatch,
    swipe,
    rewind,
    clearMatch,
    refetch: fetchStack,
  };
}
