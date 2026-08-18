'use client';

import { useEffect } from 'react';

/**
 * DevToolsGuard
 * Protects client-side UI from inspection, source viewing, right-click, and F12 hotkeys.
 */
export function DevToolsGuard() {
  useEffect(() => {
    // 1. Disable Right-Click (Context Menu)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // 2. Block Inspect / DevTools Keyboard Shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl + Shift + I (Inspect)
      // Ctrl + Shift + J (Console)
      // Ctrl + Shift + C (Element Selector)
      if (e.ctrlKey && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl + U (View Page Source)
      if (e.ctrlKey && ['u', 'U'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Cmd + Option + I / J (Mac OS)
      if (e.metaKey && e.altKey && ['i', 'I', 'j', 'J', 'c', 'C'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // 3. Clear and mute browser console logs for security
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      const noop = () => {};
      console.log = noop;
      console.info = noop;
      console.warn = noop;
      console.debug = noop;
    }

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, []);

  return null;
}
