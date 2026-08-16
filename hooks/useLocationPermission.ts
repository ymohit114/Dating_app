'use client';

import { useState, useEffect, useCallback } from 'react';

export type PermissionStatusType = 'prompt' | 'granted' | 'denied' | 'unsupported';

interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

export function useLocationPermission() {
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatusType>('prompt');
  const [coords, setCoords] = useState<LocationCoords | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showExplanationModal, setShowExplanationModal] = useState(false);

  // Check initial permission status if browser Permission API is supported
  useEffect(() => {
    if (typeof window === 'undefined' || !navigator?.permissions) return;

    navigator.permissions
      .query({ name: 'geolocation' as PermissionName })
      .then((status) => {
        setPermissionStatus(status.state as PermissionStatusType);
        status.onchange = () => {
          setPermissionStatus(status.state as PermissionStatusType);
        };
      })
      .catch(() => {
        // Fallback for older browsers
      });
  }, []);

  // Request location with Browser Geolocation API
  const requestLocation = useCallback(async (): Promise<LocationCoords | null> => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setPermissionStatus('unsupported');
      setErrorMsg('Geolocation is not supported by your current browser.');
      return null;
    }

    setIsLoading(true);
    setErrorMsg(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const loc: LocationCoords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };

          setCoords(loc);
          setPermissionStatus('granted');
          setIsLoading(false);
          setShowExplanationModal(false);

          // Securely send coordinates to backend
          try {
            await fetch('/api/location/update', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                latitude: loc.latitude,
                longitude: loc.longitude,
                accuracy: loc.accuracy,
              }),
            });
          } catch (err) {
            console.error('Failed to sync location to backend:', err);
          }

          resolve(loc);
        },
        (error) => {
          setIsLoading(false);
          setShowExplanationModal(false);
          if (error.code === error.PERMISSION_DENIED) {
            setPermissionStatus('denied');
            setErrorMsg('Location permission was denied. Please allow location access to discover people nearby.');
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            setErrorMsg('Location information is currently unavailable.');
          } else if (error.code === error.TIMEOUT) {
            setErrorMsg('Location request timed out. Please retry.');
          } else {
            setErrorMsg('An unknown error occurred while retrieving location.');
          }
          resolve(null);
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes cache to prevent continuous GPS drain
        }
      );
    });
  }, []);

  const openPermissionPrompt = useCallback(() => {
    setShowExplanationModal(true);
  }, []);

  const closeExplanationModal = useCallback(() => {
    setShowExplanationModal(false);
  }, []);

  return {
    permissionStatus,
    coords,
    isLoading,
    errorMsg,
    showExplanationModal,
    requestLocation,
    openPermissionPrompt,
    closeExplanationModal,
  };
}
