'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, Lock, Mail, AlertTriangle, ArrowRight, Eye, EyeOff, KeyRound } from 'lucide-react';
import { api } from '@/lib/api-client';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('mohit@gmail.com');
  const [password, setPassword] = useState('1234567890');
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
      const res = await api.post('/api/auth/login', { email, password });
      
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
    <div className="w-full max-w-md bg-[#111827] border border-[#1F2937] rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 space-y-6 relative overflow-hidden my-auto">
      {/* Top Gradient Bar */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-violet-600 via-indigo-500 to-blue-600" />

      {/* Brand & Header */}
      <div className="text-center space-y-2 pt-2">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/30 text-violet-400 mx-auto flex items-center justify-center shadow-lg shadow-violet-500/10 mb-3">
          <Shield className="w-7 h-7" />
        </div>
        <div className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase bg-violet-950/60 text-violet-300 border border-violet-800/50 mb-1">
          ELANCE ADMIN
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#F9FAFB]">
          Control Console
        </h1>
        <p className="text-xs text-[#9CA3AF]">
          Authorized personnel only. Enter your credentials to access system management.
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#D1D5DB] block">Admin Email</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@elance.app"
              className="w-full bg-[#0B1020] border border-[#1F2937] text-[#F9FAFB] text-sm pl-10 pr-4 py-2.5 rounded-2xl focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-all font-mono placeholder:text-gray-600"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#D1D5DB] block">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[#0B1020] border border-[#1F2937] text-[#F9FAFB] text-sm pl-10 pr-10 py-2.5 rounded-2xl focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-all placeholder:text-gray-600"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#D1D5DB] transition-colors p-1 cursor-pointer"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-violet-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed mt-2"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>Authenticating Session...</span>
            </span>
          ) : (
            <>
              <span>Sign In to Admin Panel</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Security Footer */}
      <div className="pt-3 border-t border-[#1F2937] text-center space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-violet-400 font-medium">
          <KeyRound className="w-3.5 h-3.5" />
          <span>Protected administrative access</span>
        </div>
        <p className="text-[10px] text-[#6B7280]">
          All access attempts, device telemetry, and audit logs are recorded.
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen w-full bg-[#0B1020] text-[#F9FAFB] flex items-center justify-center p-4 antialiased">
      <Suspense fallback={
        <div className="p-8 text-center text-gray-400 text-sm flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading Admin Console...</span>
        </div>
      }>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
