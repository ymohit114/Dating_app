'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { 
  Sparkles, Heart, ShieldCheck, ArrowRight, 
  Lock, EyeOff, Flag, UserCheck, CheckCircle2 
} from 'lucide-react';

export default function LandingPage() {
  const steps = [
    { num: '01', title: 'Create Profile', desc: 'Add authentic photos, answer thoughtful prompts, and curate your core lifestyle passions.' },
    { num: '02', title: 'Discover People', desc: 'Explore candidates matching your exact preferences with our 6-factor weighted compatibility score.' },
    { num: '03', title: 'Like Someone', desc: 'Send likes with complete intentionality. Zero subscription fees, zero paywalled barriers.' },
    { num: '04', title: 'Mutual Match', desc: 'When attraction is mutual, an atomic match is formed instantly with celebratory confetti.' },
    { num: '05', title: 'Start Talking', desc: 'Engage through real-time messaging, icebreaker sparks, and plan memorable dates.' },
  ];

  const safetyFeatures = [
    {
      icon: UserCheck,
      title: 'Profile Verification',
      desc: 'Selfie pose checks verify members are genuinely who they claim to be, eliminating bots and catfishes.'
    },
    {
      icon: Flag,
      title: 'Proactive Reporting',
      desc: 'In-app moderation buttons on every profile and message thread trigger immediate review by safety admins.'
    },
    {
      icon: Lock,
      title: 'Blocking & Privacy',
      desc: 'Instantly block any account to vanish from their discovery stack and prevent all future communication.'
    },
    {
      icon: EyeOff,
      title: 'Secure Communication',
      desc: 'Encrypted token authentication, server-side data isolation, and protected privacy controls.'
    }
  ];

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-ivory-100 text-charcoal-900">
      {/* Background Soft Glows */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[650px] h-[450px] bg-gradient-to-tr from-plum-200/30 via-gold/10 to-clay/40 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-clay/60 bg-ivory-100/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <span className="absolute left-0 w-5 h-5 rounded-full bg-plum-700 opacity-90 shadow-sm" />
              <span className="absolute right-0 w-5 h-5 rounded-full bg-gold opacity-80 mix-blend-multiply shadow-sm" />
            </div>
            <span className="font-serif font-bold text-2xl tracking-tight text-plum-700">
              Elance
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-charcoal-700">
            <Link href="/discover" className="hover:text-plum-700 transition-colors">Discover</Link>
            <a href="#how-it-works" className="hover:text-plum-700 transition-colors">How It Works</a>
            <Link href="/safety" className="hover:text-plum-700 transition-colors">Safety</Link>
            <Link href="/help" className="hover:text-plum-700 transition-colors">Help</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-xs font-semibold">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" size="sm" className="text-xs font-semibold">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 pt-16 sm:pt-24 pb-20 text-center z-10 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-ivory-200 border border-clay text-xs text-charcoal-700 mb-8 backdrop-blur-md shadow-2xs">
          <div className="relative w-3.5 h-3.5 flex items-center justify-center">
            <span className="absolute left-0 w-2.5 h-2.5 rounded-full bg-plum-700" />
            <span className="absolute right-0 w-2.5 h-2.5 rounded-full bg-gold opacity-80 mix-blend-multiply" />
          </div>
          <span className="font-medium">Intentional Dating for 18+ Adults</span>
          <span className="bg-plum-100 text-plum-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
            FREE FOREVER
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold tracking-tight text-charcoal-900 max-w-4xl leading-[1.15] mb-6">
          Find meaningful connections.
        </h1>

        <p className="text-base sm:text-xl text-charcoal-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Meet people who share your interests, values and lifestyle. Thoughtfully designed with warm aesthetics and 100% free access for all members.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center max-w-md">
          <Link href="/register" className="w-full sm:w-auto">
            <Button variant="primary" size="lg" className="w-full sm:w-auto gap-2 text-base font-semibold shadow-lg shadow-plum-700/20">
              Get Started <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          <Link href="/login" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto gap-2">
              Login
            </Button>
          </Link>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4 py-20 border-t border-clay/60 w-full">
        <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-plum-700">Five Simple Steps</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-charcoal-900">How It Works</h2>
          <p className="text-xs sm:text-sm text-charcoal-600">The journey from authentic discovery to real connection</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {steps.map((s) => (
            <div
              key={s.num}
              className="p-6 rounded-3xl bg-surface-card border border-clay shadow-sm flex flex-col justify-between"
            >
              <div className="text-3xl font-serif font-bold text-plum-700/30 mb-4">{s.num}</div>
              <div>
                <h3 className="text-base font-serif font-bold text-charcoal-900 mb-2">{s.title}</h3>
                <p className="text-xs text-charcoal-600 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Safety Section */}
      <section className="max-w-6xl mx-auto px-4 py-20 border-t border-clay/60 w-full">
        <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-plum-700">Safety & Trust</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-charcoal-900">A Safer Environment</h2>
          <p className="text-xs sm:text-sm text-charcoal-600">
            Engineered with strict safety guardrails, verified identities, and proactive moderation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {safetyFeatures.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-3xl bg-surface-card border border-clay shadow-sm space-y-3"
              >
                <div className="w-11 h-11 rounded-2xl bg-plum-50 text-plum-700 flex items-center justify-center border border-plum-100">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-serif font-bold text-charcoal-900">{feat.title}</h3>
                <p className="text-xs text-charcoal-600 leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Link href="/safety">
            <Button variant="outline" size="md">
              Visit Safety Center & Community Guidelines →
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-clay/80 bg-ivory-200/60 py-12 text-xs text-charcoal-600">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="relative w-6 h-6 flex items-center justify-center">
              <span className="absolute left-0 w-4 h-4 rounded-full bg-plum-700 opacity-90" />
              <span className="absolute right-0 w-4 h-4 rounded-full bg-gold opacity-80 mix-blend-multiply" />
            </div>
            <span className="font-serif font-bold text-charcoal-900 text-sm">Elance</span>
            <span>— Meaningful connections for 18+</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 font-medium">
            <Link href="/safety" className="hover:text-plum-700">Safety</Link>
            <Link href="/help" className="hover:text-plum-700">Help & Support</Link>
            <Link href="/settings" className="hover:text-plum-700">Privacy & Terms</Link>
            <Link href="/settings" className="hover:text-plum-700">Account Deletion</Link>
            <Link href="/login" className="hover:text-plum-700">Login</Link>
            <Link href="/register" className="hover:text-plum-700">Sign Up</Link>
          </div>

          <p>© 2026 Elance Dating Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
