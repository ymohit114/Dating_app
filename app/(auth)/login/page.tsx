'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('user@gmail.com');
  const [password, setPassword] = useState('1234567890');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const success = await login(email, password);
    setIsLoading(false);
    if (success) {
      router.push('/discover');
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-ivory-100">
      <div className="w-full max-w-md bg-surface-card border border-clay rounded-3xl p-8 shadow-xl space-y-6 relative overflow-hidden">
        {/* Logo & Heading */}
        <div className="text-center space-y-2">
          <div className="relative w-12 h-12 mx-auto flex items-center justify-center mb-2">
            <div className="w-10 h-10 rounded-2xl bg-plum text-white flex items-center justify-center shadow-lg transform -rotate-6">
              <Sparkles className="w-5 h-5 text-gold" />
            </div>
          </div>
          <h1 className="font-serif text-3xl font-bold text-ink">
            Welcome back
          </h1>
          <p className="text-sm text-ink-muted">
            Sign in to continue your journey on Elance
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-ink-faint absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@gmail.com"
                className="w-full bg-white border border-clay text-ink pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-plum focus:ring-1 focus:ring-plum transition-all text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="w-5 h-5 text-ink-faint absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-white border border-clay text-ink pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-plum focus:ring-1 focus:ring-plum transition-all text-sm"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full mt-2"
          >
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        {/* Sign Up Prompt */}
        <div className="text-center pt-4 border-t border-clay">
          <p className="text-sm text-ink-muted">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold text-plum hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
