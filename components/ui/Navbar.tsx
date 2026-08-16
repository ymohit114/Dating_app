'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Heart, User, ShieldCheck, Zap, SlidersHorizontal, MessageCircle, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function Navbar() {
  const pathname = usePathname();
  const { user, profile } = useAuth();
  const [boostActive, setBoostActive] = useState(false);

  const navItems = [
    { href: '/discover', label: 'Discover', icon: Sparkles },
    { href: '/likes', label: 'Likes', icon: Heart, badge: '3' },
    { href: '/matches', label: 'Matches', icon: MessageCircle, badge: '2' },
    { href: '/safety', label: 'Safety', icon: ShieldCheck },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  const handleBoost = () => {
    setBoostActive(true);
    setTimeout(() => setBoostActive(false), 5000);
  };

  // Hide on auth onboarding pages
  if (pathname === '/login' || pathname === '/register') return null;

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-clay/60 bg-ivory-100/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo with Signature Two Overlapping Circles Motif */}
          <Link href="/discover" className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9 flex items-center justify-center">
              {/* Left Circle (Deep Plum) */}
              <span className="absolute left-0 w-6 h-6 rounded-full bg-plum-700 opacity-90 transition-transform group-hover:scale-110 shadow-sm" />
              {/* Right Circle (Muted Gold) */}
              <span className="absolute right-0 w-6 h-6 rounded-full bg-gold opacity-80 mix-blend-multiply transition-transform group-hover:scale-110 shadow-sm" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-2xl tracking-tight text-plum-700">
                Elance
              </span>
              <span className="text-[9px] text-charcoal-600 -mt-1 font-medium tracking-widest uppercase">
                Meaningful Dating
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-ivory-200/80 p-1.5 rounded-full border border-clay">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-plum-700 text-white shadow-sm'
                      : 'text-charcoal-700 hover:text-plum-700 hover:bg-ivory-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  {item.badge && !isActive && (
                    <span className="bg-plum-700 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            {/* Boost Profile Button */}
            <button
              onClick={handleBoost}
              title="Profile Spotlight"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                boostActive
                  ? 'bg-plum-700 text-white border-plum-800 shadow-md animate-pulse'
                  : 'bg-ivory-200 text-plum-700 border-clay hover:bg-ivory-300'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-gold fill-gold" />
              <span className="hidden sm:inline">{boostActive ? 'Spotlight Active' : 'Spotlight'}</span>
            </button>

            {/* Admin Link (if admin) */}
            {user?.role === 'admin' && (
              <Link
                href="/admin"
                className="p-2 rounded-full text-charcoal-700 hover:text-plum-700 hover:bg-ivory-200 transition-colors"
                title="Admin Command"
              >
                <Shield className="w-4 h-4 text-plum-700" />
              </Link>
            )}

            {/* Settings & Discovery Preferences */}
            <Link
              href="/settings"
              className="p-2 rounded-full text-charcoal-700 hover:text-plum-700 hover:bg-ivory-200 transition-colors"
              title="Preferences & Safety"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </Link>

            {/* Avatar */}
            <Link href="/profile" className="flex items-center gap-2 pl-1 group">
              <div className="relative w-9 h-9 rounded-full overflow-hidden ring-2 ring-clay group-hover:ring-plum-700 transition-all">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={profile?.photos[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                  alt={profile?.name || 'Profile'}
                  className="w-full h-full object-cover"
                />
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-ivory-100/95 border-t border-clay backdrop-blur-lg px-2 py-1.5 flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center gap-0.5 p-2 rounded-2xl transition-all ${
                isActive
                  ? 'text-plum-700 font-bold scale-105'
                  : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] tracking-tight">{item.label}</span>
              {item.badge && !isActive && (
                <span className="absolute top-1 right-2 w-3.5 h-3.5 bg-plum-700 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
