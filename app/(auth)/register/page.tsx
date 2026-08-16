'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { ArrowRight, ArrowLeft, Check, Sparkles, User, Calendar } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('2000-01-15');
  const [gender, setGender] = useState<'man' | 'woman' | 'non-binary' | 'other'>('man');

  // Client-side 18+ check
  const is18Plus = () => {
    const dob = new Date(dateOfBirth);
    if (isNaN(dob.getTime())) return false;
    const ageDiffMs = Date.now() - dob.getTime();
    const ageDate = new Date(ageDiffMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    return age >= 18;
  };

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Please enter your full name (Mandatory).');
      return;
    }

    if (!is18Plus()) {
      setError('You must be at least 18 years old to join Elance.');
      return;
    }

    setIsLoading(true);
    const success = await register({
      email,
      password,
      firstName: fullName.trim(),
      name: fullName.trim(),
      dateOfBirth,
      gender,
    });
    setIsLoading(false);

    if (success) {
      router.push('/onboarding');
    } else {
      setError('Registration failed. Please verify your details.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-zinc-950 text-white">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Step Indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative w-6 h-6 flex items-center justify-center">
              <span className="absolute left-0 w-4 h-4 rounded-full bg-rose-600 opacity-90" />
              <span className="absolute right-0 w-4 h-4 rounded-full bg-pink-500 opacity-80 mix-blend-multiply" />
            </div>
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
              Step {step} of 2
            </span>
          </div>
          <div className="flex gap-1.5">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step ? 'w-6 bg-rose-500' : s < step ? 'w-3 bg-rose-700' : 'w-3 bg-zinc-800'
                }`}
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs text-center font-semibold">
            {error}
          </div>
        )}

        {/* Step 1: Account Credentials */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">Create Account</h2>
              <p className="text-xs text-zinc-400 mt-1">Begin your journey to intentional connections</p>
            </div>

            <div>
              <label className="text-xs text-zinc-300 font-semibold">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full mt-1 bg-zinc-950 border border-zinc-800 text-white text-sm px-4 py-2.5 rounded-2xl focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-300 font-semibold">Password (min 6 characters)</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                className="w-full mt-1 bg-zinc-950 border border-zinc-800 text-white text-sm px-4 py-2.5 rounded-2xl focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>

            <Button
              type="button"
              variant="gradient"
              size="lg"
              className="w-full mt-2"
              onClick={() => {
                if (email && password.length >= 6) setStep(2);
                else setError('Please enter a valid email and password with at least 6 characters.');
              }}
            >
              Continue <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        {/* Step 2: Personal Identity & 18+ DOB */}
        {step === 2 && (
          <form onSubmit={handleFinish} className="space-y-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">Your Identity</h2>
              <p className="text-xs text-zinc-400 mt-1">Enter your real full name and age details</p>
            </div>

            <div>
              <label className="text-xs text-zinc-300 font-semibold flex items-center justify-between">
                <span>Full Name <span className="text-rose-500">*</span></span>
                <span className="text-[10px] text-rose-400 font-bold">MANDATORY</span>
              </label>
              <div className="relative mt-1">
                <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full bg-zinc-950 border border-zinc-800 text-white text-sm pl-10 pr-4 py-2.5 rounded-2xl focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-300 font-semibold">Date of Birth (Must be 18+)</label>
              <div className="relative mt-1">
                <Calendar className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  required
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white text-sm pl-10 pr-4 py-2.5 rounded-2xl focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-300 font-semibold">Gender Identity</label>
              <select
                value={gender}
                onChange={(e: any) => setGender(e.target.value)}
                className="w-full mt-1 bg-zinc-950 border border-zinc-800 text-white text-xs px-3.5 py-2.5 rounded-2xl focus:outline-none focus:border-rose-500"
              >
                <option value="man">Man</option>
                <option value="woman">Woman</option>
                <option value="non-binary">Non-binary</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button type="submit" variant="gradient" isLoading={isLoading} className="flex-1">
                Next: Photo Setup →
              </Button>
            </div>
          </form>
        )}

        <div className="text-center text-xs text-zinc-400">
          Already have an account?{' '}
          <Link href="/login" className="text-rose-400 font-bold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
