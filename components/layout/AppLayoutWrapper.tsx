'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/ui/Navbar';

export function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  if (isAdminRoute) {
    // Isolated Admin Environment: Completely unattached from dating app UI
    return (
      <div className="min-h-screen bg-[#0B1020] text-[#F9FAFB] flex flex-col antialiased selection:bg-purple-600 selection:text-white">
        {children}
      </div>
    );
  }

  // Normal User Dating Environment
  return (
    <div className="bg-[#FAF6F1] text-[#1F1A1C] min-h-screen flex flex-col antialiased selection:bg-[#8B2942] selection:text-white">
      <Navbar />
      <main className="flex-1 flex flex-col relative pb-20 md:pb-0">
        {children}
      </main>
    </div>
  );
}

export default AppLayoutWrapper;
