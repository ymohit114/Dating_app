'use client';

import { useEffect } from 'react';
import socketManager from '@/lib/socket';

export function useSocketEvent<T = any>(eventName: string, handler: (data: T) => void) {
  useEffect(() => {
    const unsubscribe = socketManager.subscribe(eventName, handler);
    return () => {
      unsubscribe();
    };
  }, [eventName, handler]);
}
