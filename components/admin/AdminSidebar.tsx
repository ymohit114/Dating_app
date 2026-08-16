'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Image as ImageIcon,
  Flag,
  ShieldBan,
  HeartHandshake,
  MessageSquareWarning,
  BellRing,
  CreditCard,
  Receipt,
  BarChart3,
  ShieldAlert,
  History,
  Settings,
  LogOut,
  Shield,
  Menu,
  X,
} from 'lucide-react';

interface NavSection {
  label?: string;
  items: {
    label: string;
    href: string;
    icon: React.ElementType;
    badge?: string;
    superadminOnly?: boolean;
  }[];
}

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleAdminLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  const navSections: NavSection[] = [
    {
      items: [
        { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      label: 'Members & Moderation',
      items: [
        { label: 'Users', href: '/admin/users', icon: Users },
        { label: 'Profiles', href: '/admin/profiles', icon: UserCheck },
        { label: 'Photos', href: '/admin/photos', icon: ImageIcon },
        { label: 'Reports', href: '/admin/reports', icon: Flag, badge: '3' },
        { label: 'Blocks', href: '/admin/blocks', icon: ShieldBan },
      ],
    },
    {
      label: 'Activity & Interactions',
      items: [
        { label: 'Matches', href: '/admin/matches', icon: HeartHandshake },
        { label: 'Messages', href: '/admin/messages', icon: MessageSquareWarning },
        { label: 'Notifications', href: '/admin/notifications', icon: BellRing },
      ],
    },
    {
      label: 'Monetization & Insights',
      items: [
        { label: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
        { label: 'Payments', href: '/admin/payments', icon: Receipt },
        { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
      ],
    },
    {
      label: 'Security & System',
      items: [
        { label: 'Administrators', href: '/admin/admins', icon: ShieldAlert, superadminOnly: true },
        { label: 'Audit Logs', href: '/admin/audit-logs', icon: History },
        { label: 'Settings', href: '/admin/settings', icon: Settings },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Top Toggle Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#111827] border-b border-[#1F2937] text-white sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center font-black text-sm">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm tracking-tight">Elance Admin</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl bg-[#1F2937] text-[#9CA3AF] hover:text-white"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Overlay on Mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-xs"
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-[#111827] border-r border-[#1F2937] flex flex-col justify-between shrink-0 text-[#F9FAFB] select-none transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="h-16 px-6 border-b border-[#1F2937] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-md shadow-violet-600/30 text-white font-black text-sm">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-sm text-white tracking-tight flex items-center gap-1.5">
                  <span>Elance</span>
                  <span className="text-[10px] font-semibold uppercase bg-violet-950/80 text-violet-300 px-1.5 py-0.5 rounded border border-violet-800/60">
                    Control
                  </span>
                </div>
                <span className="text-[10px] text-[#9CA3AF] font-mono tracking-wide">
                  v2.4 SaaS Engine
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="p-3 space-y-4 overflow-y-auto max-h-[calc(100vh-145px)] scrollbar-none">
            {navSections.map((section, idx) => (
              <div key={idx} className="space-y-1">
                {section.label && (
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                    {section.label}
                  </div>
                )}
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/admin/dashboard' && pathname?.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-950/40 font-bold'
                          : 'text-[#9CA3AF] hover:text-white hover:bg-[#1F2937]/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#9CA3AF]'}`} />
                        <span>{item.label}</span>
                      </div>

                      {item.badge && (
                        <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-xs">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Admin Session Profile & Logout */}
        <div className="p-3 border-t border-[#1F2937] bg-[#0B1020]/80">
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#111827] border border-[#1F2937] mb-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 border border-violet-500/40 flex items-center justify-center text-xs font-bold text-white shrink-0">
                {user?.email?.[0]?.toUpperCase() || 'M'}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-semibold text-white truncate">
                  {user?.email || 'mohit@gmail.com'}
                </div>
                <div className="text-[10px] text-violet-400 font-mono capitalize">
                  {user?.role || 'superadmin'}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleAdminLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-[#9CA3AF] hover:text-white hover:bg-red-950/40 hover:border-red-800/50 border border-transparent transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit Admin Portal</span>
          </button>
        </div>
      </aside>
    </>
  );
}
