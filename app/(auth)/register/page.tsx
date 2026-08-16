'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
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

    if (!is18Plus()) {
      setError('You must be at least 18 years old to join Elance.');
      return;
    }

    setIsLoading(true);
    const success = await register({
      email,
      password,
      firstName,
      name: firstName,
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
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-ivory-100">
      <div className="w-full max-w-md bg-surface-card border border-clay rounded-3xl p-8 shadow-xl space-y-6 relative overflow-hidden">
        {/* Step Indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative w-6 h-6 flex items-center justify-center">
              <span className="absolute left-0 w-4 h-4 rounded-full bg-plum-700 opacity-90" />
              <span className="absolute right-0 w-4 h-4 rounded-full bg-gold opacity-80 mix-blend-multiply" />
            </div>
            <span className="text-xs font-bold text-plum-700 uppercase tracking-wider">
              Step {step} of 2
            </span>
          </div>
          <div className="flex gap-1.5">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step ? 'w-6 bg-plum-700' : s < step ? 'w-3 bg-plum-500' : 'w-3 bg-clay'
                }`}
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-plum-50 border border-plum-200 text-plum-800 text-xs text-center font-medium">
            {error}
          </div>
        )}

        {/* Step 1: Account Credentials */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-3xl font-serif font-bold text-charcoal-900">Create Account</h2>
              <p className="text-xs text-charcoal-600 mt-1">Begin your journey to intentional connections</p>
            </div>

            <div>
              <label className="text-xs text-charcoal-700 font-semibold">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full mt-1 bg-ivory-50 border border-clay text-charcoal-900 text-sm px-4 py-2.5 rounded-2xl focus:outline-none focus:border-plum-700 transition-colors shadow-2xs"
              />
            </div>

            <div>
              <label className="text-xs text-charcoal-700 font-semibold">Password (min 6 characters)</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                className="w-full mt-1 bg-ivory-50 border border-clay text-charcoal-900 text-sm px-4 py-2.5 rounded-2xl focus:outline-none focus:border-plum-700 transition-colors shadow-2xs"
              />
            </div>

            <Button
              type="button"
              variant="primary"
              size="lg"
              className="w-full"
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
              <h2 className="text-3xl font-serif font-bold text-charcoal-900">Personal Details</h2>
              <p className="text-xs text-charcoal-600 mt-1">Adults (18+) only platform</p>
            </div>

            <div>
              <label className="text-xs text-charcoal-700 font-semibold">First Name</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Your first name"
                className="w-full mt-1 bg-ivory-50 border border-clay text-charcoal-900 text-sm px-4 py-2.5 rounded-2xl focus:outline-none focus:border-plum-700 transition-colors shadow-2xs"
              />
            </div>

            <div>
              <label className="text-xs text-charcoal-700 font-semibold">Date of Birth (Must be 18+)</label>
              <input
                type="date"
                required
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full mt-1 bg-ivory-50 border border-clay text-charcoal-900 text-sm px-4 py-2.5 rounded-2xl focus:outline-none focus:border-plum-700 transition-colors shadow-2xs"
              />
            </div>

            <div>
              <label className="text-xs text-charcoal-700 font-semibold">Gender Identity</label>
              <select
                value={gender}
                onChange={(e: any) => setGender(e.target.value)}
                className="w-full mt-1 bg-ivory-50 border border-clay text-charcoal-900 text-xs px-3.5 py-2.5 rounded-2xl focus:outline-none focus:border-plum-700"
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
              <Button type="submit" variant="primary" isLoading={isLoading} className="flex-1">
                Next: Profile Setup →
              </Button>
            </div>
          </form>
        )}

        <div className="text-center text-xs text-charcoal-600">
          Already have an account?{' '}
          <Link href="/login" className="text-plum-700 font-bold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
