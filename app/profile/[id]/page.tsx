'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { IProfile } from '@/types';
import { SEED_PROFILES } from '@/utils/seedData';
import { Button } from '@/components/ui/Button';
import { 
  CheckCircle2, MapPin, Briefcase, GraduationCap, 
  Ruler, ArrowLeft, Heart, X, Star, Flag, Ban, Music2, Instagram 
} from 'lucide-react';
import Link from 'next/link';

export default function ViewProfileDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [profile, setProfile] = useState<IProfile | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string>('');
  const [likedToast, setLikedToast] = useState(false);

  useEffect(() => {
    // Find in seed or fetch API
    const found = SEED_PROFILES.find((p) => p._id === id || p.userId === id) || SEED_PROFILES[0];
    setProfile(found);
    setSelectedPhoto(found.photos[0]);
  }, [id]);

  if (!profile) return null;

  const handleLike = () => {
    setLikedToast(true);
    setTimeout(() => {
      setLikedToast(false);
      router.push('/discover');
    }, 1200);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 w-full space-y-6">
      {/* Top Back Nav */}
      <div className="flex items-center justify-between">
        <Link href="/discover" className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Discovery
        </Link>
      </div>

      {likedToast && (
        <div className="p-3 bg-rose-500 text-white text-xs font-bold text-center rounded-2xl shadow-lg animate-in fade-in">
          Liked {profile.name}! Moving back to deck...
        </div>
      )}

      {/* Main Profile Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
        {/* Photo Gallery */}
        <div className="relative w-full h-[450px] bg-zinc-950">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={selectedPhoto || profile.photos[0]}
            alt={profile.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent pointer-events-none" />

          {profile.photos.length > 1 && (
            <div className="absolute bottom-4 left-4 right-4 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {profile.photos.map((photo, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedPhoto(photo)}
                  className={`relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                    selectedPhoto === photo ? 'border-rose-500 scale-105 shadow' : 'border-white/30 opacity-70'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-3xl font-extrabold text-white">{profile.name}</h1>
              <span className="text-3xl font-light text-zinc-400">{profile.age}</span>
              {profile.isVerified && (
                <CheckCircle2 className="w-6 h-6 text-sky-400 fill-sky-400/20" />
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-zinc-300">
              {profile.location?.city && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-rose-400" />
                  <span>{profile.location.city} {profile.distanceKm ? `(${profile.distanceKm} km away)` : ''}</span>
                </div>
              )}
              {profile.job && (
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-amber-400" />
                  <span>{profile.job}</span>
                </div>
              )}
              {profile.school && (
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-indigo-400" />
                  <span>{profile.school}</span>
                </div>
              )}
            </div>
          </div>

          {profile.bio && (
            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
              <span className="text-xs uppercase font-bold text-zinc-400 block mb-1">About</span>
              <p className="text-sm text-zinc-200 leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {profile.passions && profile.passions.length > 0 && (
            <div>
              <span className="text-xs uppercase font-bold text-zinc-400 block mb-2">Interests</span>
              <div className="flex flex-wrap gap-2">
                {profile.passions.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1.5 rounded-full bg-zinc-950 text-zinc-300 border border-zinc-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {profile.prompts && profile.prompts.length > 0 && (
            <div className="space-y-3">
              {profile.prompts.map((p) => (
                <div key={p.id} className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl">
                  <span className="text-xs font-semibold text-rose-400 block mb-1">{p.question}</span>
                  <p className="text-sm font-medium text-white">&ldquo;{p.answer}&rdquo;</p>
                </div>
              ))}
            </div>
          )}

          {/* Bottom Action bar */}
          <div className="flex items-center justify-center gap-4 pt-4 border-t border-zinc-800">
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push('/discover')}
              className="flex-1 border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
            >
              <X className="w-5 h-5 mr-1" /> Pass
            </Button>
            <Button
              variant="gradient"
              size="lg"
              onClick={handleLike}
              className="flex-1"
            >
              <Heart className="w-5 h-5 mr-1 fill-white" /> Like Profile
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
