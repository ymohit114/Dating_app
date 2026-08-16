'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, Lock, Mail, AlertTriangle, ArrowRight, Eye, EyeOff, KeyRound } from 'lucide-react';
import { api } from '@/lib/api-client';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const err = searchParams?.get('error');
      if (err === 'insufficient_privileges') {
        setError('Access Denied: Your account does not have administrative privileges.');
      }
    } catch {
      // Ignore
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setError('');

    try {
      const res = await api.post('/api/auth/login', { email: email.trim(), password });
      
      if (res && res.user) {
        // Verify user has admin/moderator/superadmin role
        const role = res.user.role;
        if (role === 'moderator' || role === 'admin' || role === 'superadmin') {
          const redirectPath = searchParams?.get('redirect') || '/admin/dashboard';
          router.push(redirectPath);
          return;
        } else {
          setError('Access Denied: Your account does not have administrative privileges.');
          setIsLoading(false);
          return;
        }
      }

      setError('Invalid admin credentials. Please check your email and password.');
    } catch (err: any) {
      console.error('Admin login error:', err);
      setError(err?.message || 'Invalid admin credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0B1020] relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#111827] border border-[#1F2937] rounded-3xl p-8 shadow-2xl space-y-6 relative z-10">
        {/* Header with Admin Shield */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-600 p-0.5 mx-auto shadow-xl shadow-rose-600/30">
            <div className="w-full h-full bg-[#111827] rounded-[14px] flex items-center justify-center">
              <Shield className="w-7 h-7 text-rose-500" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Control Panel Login
            </h1>
            <p className="text-xs text-[#9CA3AF] mt-1 font-mono">
              Elance Admin &amp; Moderation Suite
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="leading-relaxed font-medium">{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#D1D5DB] tracking-wide uppercase">
              Admin Email
            </label>
            <div className="relative mt-1">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full bg-[#0B1020] border border-[#1F2937] text-white text-xs pl-10 pr-4 py-3 rounded-2xl focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#D1D5DB] tracking-wide uppercase">
              Password
            </label>
            <div className="relative mt-1">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#0B1020] border border-[#1F2937] text-white text-xs pl-10 pr-10 py-3 rounded-2xl focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Authenticating Admin...</span>
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Enter Admin Console</span>
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </>
            )}
          </button>
        </form>

        {/* Footer Note */}
        <div className="pt-4 border-t border-[#1F2937] text-center">
          <p className="text-[11px] text-[#6B7280]">
            Protected by Elance Role-Based Security. Authorized personnel only.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0B1020] flex items-center justify-center text-white text-xs">Loading...</div>}>
      <AdminLoginForm />
    </Suspense>
  );
}
