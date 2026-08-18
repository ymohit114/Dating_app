'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/ui/Navbar';

export function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');
  const isChatDetailRoute = pathname?.startsWith('/chat/');
  const isAuthRoute = pathname === '/login' || pathname === '/register' || pathname === '/onboarding';

  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-[#0B1020] text-[#F9FAFB] flex flex-col antialiased selection:bg-purple-600 selection:text-white">
        {children}
      </div>
    );
  }

  // Normal User Dating Environment
  return (
    <div className="bg-zinc-950 text-white min-h-screen flex flex-col antialiased selection:bg-rose-600 selection:text-white">
      <Navbar />
      <main className={`flex-1 flex flex-col relative ${isChatDetailRoute || isAuthRoute ? 'pb-0' : 'pb-16 md:pb-0'}`}>
        {children}
      </main>
    </div>
  );
}

export default AppLayoutWrapper;
