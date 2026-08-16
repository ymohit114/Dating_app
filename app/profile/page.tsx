'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { ProfileEditor } from '@/components/profile/ProfileEditor';
import { IProfile } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  CheckCircle2, MapPin, Briefcase, GraduationCap, 
  Edit3, Eye, ShieldCheck, Sparkles, LogOut 
} from 'lucide-react';

export default function ProfilePage() {
  const { user, profile, updateProfile, subscriptionTier, logout, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'preview' | 'edit'>('preview');

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-zinc-400">
          <span className="w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <span>Verifying secure session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-rose-500">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Authentication Required</h2>
        <p className="text-xs text-zinc-400 max-w-sm">
          Please log in with your credentials to access and manage your private profile.
        </p>
        <Link
          href="/login"
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white text-xs font-bold shadow-lg shadow-rose-600/25 hover:from-rose-500 hover:to-pink-500 transition-all"
        >
          Go to Sign In
        </Link>
      </div>
    );
  }

  const activeProfile: IProfile = profile || {
    _id: `prof_${user._id}`,
    userId: user._id,
    name: 'Mohit Yadav',
    age: 24,
    birthdate: '2000-01-01',
    gender: 'man',
    interestedIn: 'women',
    photos: [],
    bio: '',
    job: '',
    company: '',
    school: '',
    height: 178,
    location: { type: 'Point', coordinates: [77.209, 28.6139], city: 'New Delhi', state: 'Delhi', country: 'India' },
    passions: [],
    prompts: [],
    relationshipGoal: 'Long-term',
    isVerified: true,
    isBoosted: false,
    onlineStatus: 'online',
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 w-full space-y-6">
      {/* Top Banner Navigation */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Your Profile</h1>
          <p className="text-xs text-zinc-400 mt-0.5">Manage your identity, photos, and lifestyle badges</p>
        </div>

        {/* Preview / Edit Toggle */}
        <div className="flex items-center bg-zinc-900 border border-zinc-800 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> Preview
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              activeTab === 'edit'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit Profile
          </button>
        </div>
      </div>

      {activeTab === 'edit' ? (
        <ProfileEditor
          initialProfile={activeProfile}
          onSave={(updates) => {
            updateProfile(updates);
            setActiveTab('preview');
          }}
          onCancel={() => setActiveTab('preview')}
        />
      ) : (
        /* Profile Preview Mode */
        <div className="space-y-6">
          {/* Card Preview Container */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
            {/* Top Photo Gallery */}
            <div className="relative w-full h-96 sm:h-[420px] bg-zinc-950">
              {activeProfile.photos && activeProfile.photos[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activeProfile.photos[0]}
                  alt={activeProfile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 gap-2">
                  <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center text-2xl font-bold text-zinc-400">
                    {activeProfile.name?.[0] || 'M'}
                  </div>
                  <span className="text-xs">No photos uploaded yet</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent pointer-events-none" />

              {/* Status Badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                {subscriptionTier !== 'free' && (
                  <Badge variant="gold" className="uppercase font-extrabold tracking-wider">
                    <Sparkles className="w-3 h-3" /> {subscriptionTier.toUpperCase()} VIP
                  </Badge>
                )}
              </div>
            </div>

            {/* Content Details */}
            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-3xl font-black text-white">{activeProfile.name}</h2>
                  {activeProfile.age && (
                    <span className="text-3xl font-light text-zinc-400">{activeProfile.age}</span>
                  )}
                  {activeProfile.isVerified && (
                    <CheckCircle2 className="w-6 h-6 text-sky-400 fill-sky-400/20" />
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-zinc-300">
                  {activeProfile.location?.city && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-rose-400" />
                      <span>{activeProfile.location.city}</span>
                    </div>
                  )}
                  {activeProfile.job && (
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-amber-400" />
                      <span>{activeProfile.job} {activeProfile.company ? `at ${activeProfile.company}` : ''}</span>
                    </div>
                  )}
                  {activeProfile.school && (
                    <div className="flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-indigo-400" />
                      <span>{activeProfile.school}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bio */}
              {activeProfile.bio && (
                <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
                  <span className="text-xs uppercase font-bold text-zinc-400 block mb-1">
                    About Me
                  </span>
                  <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-line">
                    {activeProfile.bio}
                  </p>
                </div>
              )}

              {/* Passions */}
              {activeProfile.passions && activeProfile.passions.length > 0 && (
                <div>
                  <span className="text-xs uppercase font-bold text-zinc-400 block mb-2">
                    Passions &amp; Interests
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {activeProfile.passions?.map((p: string) => (
                      <span
                        key={p}
                        className="text-xs px-3 py-1.5 rounded-full bg-zinc-950 text-zinc-200 border border-zinc-800"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Prompts */}
              {activeProfile.prompts && activeProfile.prompts.length > 0 && (
                <div className="space-y-3">
                  {activeProfile.prompts?.map((prompt: any) => (
                    <div
                      key={prompt.id}
                      className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl"
                    >
                      <span className="text-xs font-semibold text-rose-400 block mb-1">
                        {prompt.question}
                      </span>
                      <p className="text-sm font-medium text-white">
                        &ldquo;{prompt.answer}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {!activeProfile.isVerified && (
              <Link href="/verify">
                <div className="p-5 bg-sky-950/20 border border-sky-500/30 rounded-3xl flex items-center justify-between hover:bg-sky-950/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-sky-400" />
                    <div>
                      <h4 className="text-sm font-bold text-white">Get Verified Badge</h4>
                      <p className="text-xs text-sky-300/80">3x higher match rate</p>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm">
                    Verify
                  </Button>
                </div>
              </Link>
            )}

            <Link href="/subscription">
              <div className="p-5 bg-amber-950/20 border border-amber-500/30 rounded-3xl flex items-center justify-between hover:bg-amber-950/30 transition-colors">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-amber-400" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Elance VIP Upgrade</h4>
                    <p className="text-xs text-amber-300/80">See who likes you &amp; boost</p>
                  </div>
                </div>
                <Button variant="gold" size="sm">
                  Upgrade
                </Button>
              </div>
            </Link>
          </div>

          {/* Sign Out Button */}
          <div className="text-center pt-4">
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 text-xs text-red-400 hover:text-red-300 p-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Sign Out of Account
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
