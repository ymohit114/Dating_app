'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Bell, Search, ShieldCheck, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const isLoginPage = pathname?.startsWith('/admin/login');

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#0B1020] text-[#F9FAFB] flex flex-col md:flex-row antialiased">
      {/* SaaS Admin Sidebar */}
      <AdminSidebar />

      {/* Main Admin Canvas */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0B1020] overflow-x-hidden">
        {/* Top SaaS Header */}
        <header className="h-16 px-6 border-b border-[#1F2937] bg-[#111827]/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#9CA3AF]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden sm:inline">MongoDB Atlas Cluster Active &middot;</span>
              <span className="text-violet-400 font-mono text-[11px]">System Online</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 bg-[#0B1020] border border-[#1F2937] px-3 py-1.5 rounded-xl text-xs text-[#9CA3AF] w-64">
              <Search className="w-3.5 h-3.5 text-[#6B7280]" />
              <input
                type="text"
                placeholder="Search telemetry, users..."
                className="bg-transparent border-none outline-none text-xs text-white placeholder:text-[#6B7280] w-full"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#1F2937] border border-[#374151] flex items-center justify-center text-xs font-bold text-white">
                {user?.email?.[0]?.toUpperCase() || 'M'}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-white leading-tight">
                  {user?.email?.split('@')[0] || 'Mohit'}
                </div>
                <div className="text-[10px] text-violet-400 font-mono capitalize">
                  {user?.role || 'superadmin'}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Admin View */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
