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
  Bot,
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
      label: 'Managed Profiles & Chat Ops',
      items: [
        { label: 'Managed Profiles & Chats', href: '/admin/managed-chats', icon: Bot, badge: 'New' },
      ],
    },
    {
      label: 'Members & Moderation',
      items: [
        { label: 'Users', href: '/admin/users', icon: Users },
        { label: 'Profiles', href: '/admin/profiles', icon: UserCheck },
        { label: 'Photos', href: '/admin/photos', icon: ImageIcon },
        { label: 'Reports', href: '/admin/reports', icon: Flag },
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
          className="p-2 rounded-xl bg-[#1F2937] text-[#9CA3AF] hover:text-white cursor-pointer"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-[#111827] border-r border-[#1F2937] flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Branding */}
        <div className="p-5 border-b border-[#1F2937] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-600/30">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-white tracking-tight">
                Elance Admin
              </div>
              <div className="text-[10px] text-violet-400 font-mono tracking-wide">
                OPERATIONS SUITE
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-none">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {section.label && (
                <div className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  {section.label}
                </div>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                // Check Superadmin permissions
                if (item.superadminOnly && user?.role !== 'superadmin') {
                  return null;
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={true}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-violet-600 text-white shadow-md shadow-violet-600/20'
                        : 'text-[#9CA3AF] hover:text-white hover:bg-[#1F2937]/70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-pink-500/20 text-pink-400 border border-pink-500/30">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* User Info & Logout Footer */}
        <div className="p-4 border-t border-[#1F2937] bg-[#0B1020]/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-violet-600/20 border border-violet-500/40 text-violet-300 flex items-center justify-center font-bold text-xs shrink-0">
              {user?.email?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate">
                {user?.email || 'admin@elance.internal'}
              </div>
              <div className="text-[10px] text-violet-400 font-mono capitalize">
                {user?.role || 'Staff Operator'}
              </div>
            </div>
          </div>

          <button
            onClick={handleAdminLogout}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-all cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
}

export default AdminSidebar;
