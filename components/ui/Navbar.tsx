'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Heart, User, ShieldCheck, SlidersHorizontal, MessageCircle, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function Navbar() {
  const pathname = usePathname();
  const { user, profile } = useAuth();

  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/onboarding';
  const isChatDetailPage = pathname.startsWith('/chat/');

  const navItems = [
    { href: '/discover', label: 'Discover', icon: Sparkles },
    { href: '/likes', label: 'Likes', icon: Heart },
    { href: '/matches', label: 'Matches', icon: MessageCircle },
    { href: '/safety', label: 'Safety', icon: ShieldCheck },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  if (isAuthPage) return null;

  return (
    <>
      {/* Top Header */}
      {!isChatDetailPage && (
        <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md text-white">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            {/* Logo with Signature Two Overlapping Circles Motif */}
            <Link href="/discover" prefetch={true} className="flex items-center gap-2.5 group">
              <div className="relative w-9 h-9 flex items-center justify-center">
                {/* Left Circle */}
                <span className="absolute left-0 w-6 h-6 rounded-full bg-rose-600 opacity-90 transition-transform group-hover:scale-110 shadow-sm" />
                {/* Right Circle */}
                <span className="absolute right-0 w-6 h-6 rounded-full bg-pink-500 opacity-80 mix-blend-multiply transition-transform group-hover:scale-110 shadow-sm" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-2xl tracking-tight text-white">
                  Elance
                </span>
                <span className="text-[9px] text-zinc-400 -mt-1 font-medium tracking-widest uppercase">
                  Meaningful Dating
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 bg-zinc-900/90 p-1.5 rounded-full border border-zinc-800">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={true}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md shadow-rose-600/30'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Action Controls */}
            <div className="flex items-center gap-2">
              {/* Admin Link (if admin) */}
              {(user?.role === 'admin' || user?.role === 'superadmin') && (
                <Link
                  href="/admin/dashboard"
                  prefetch={true}
                  className="p-2 rounded-full text-zinc-400 hover:text-rose-400 hover:bg-zinc-900 transition-colors"
                  title="Admin Command"
                >
                  <Shield className="w-4 h-4" />
                </Link>
              )}

              {/* Settings & Discovery Preferences */}
              <Link
                href="/settings"
                prefetch={true}
                className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
                title="Preferences & Safety"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </Link>

              {/* Avatar */}
              <Link href="/profile" prefetch={true} className="flex items-center gap-2 pl-1 group">
                <div className="relative w-9 h-9 rounded-full overflow-hidden ring-2 ring-zinc-700 group-hover:ring-rose-500 transition-all">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={profile?.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                    alt={profile?.name || 'Profile'}
                    className="w-full h-full object-cover"
                  />
                </div>
              </Link>
            </div>
          </div>
        </header>
      )}

      {/* Mobile Bottom Navigation Bar (Hidden in Active Chat to maximize screen keyboard space) */}
      {!isChatDetailPage && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 border-t border-zinc-800 backdrop-blur-lg px-2 py-1.5 flex justify-around items-center safe-area-bottom">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={`relative flex flex-col items-center gap-0.5 p-2 rounded-2xl transition-all ${
                  isActive
                    ? 'text-rose-500 font-bold scale-105'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] tracking-tight font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </>
  );
}
