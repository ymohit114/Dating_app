'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { IProfile } from '@/types';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProfileDetailModal } from '@/components/profile/ProfileDetailModal';
import { MatchCelebrationModal } from '@/components/discovery/MatchCelebrationModal';
import { Sparkles, Heart, Star, Check, X, ShieldCheck, HeartHandshake } from 'lucide-react';

interface InboundLike {
  profile: IProfile;
  likedAt: string;
  type: string;
}

export default function LikesPage() {
  const { user, profile: myProfile } = useAuth();
  const [likes, setLikes] = useState<InboundLike[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<IProfile | null>(null);
  const [matchedProfile, setMatchedProfile] = useState<IProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLikes = async () => {
    try {
      const res = await api.get('/api/likes');
      if (res && res.likes) {
        setLikes(res.likes);
      }
    } catch {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLikes();
  }, []);

  const handleInstantMatch = async (targetProfile: IProfile) => {
    try {
      const targetId = targetProfile.userId || targetProfile._id;
      const res = await api.post('/api/discover/action', {
        targetUserId: targetId,
        action: 'like',
      });

      setLikes((prev) => prev.filter((l) => (l.profile.userId || l.profile._id) !== targetId));

      if (res?.isMatch) {
        setMatchedProfile(targetProfile);
      }
    } catch (err) {
      console.error('Match error:', err);
    }
  };

  const handlePass = async (targetProfile: IProfile) => {
    try {
      const targetId = targetProfile.userId || targetProfile._id;
      await api.post('/api/discover/action', {
        targetUserId: targetId,
        action: 'pass',
      });
      setLikes((prev) => prev.filter((l) => (l.profile.userId || l.profile._id) !== targetId));
    } catch (err) {
      console.error('Pass error:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Who Liked You</h1>
            <span className="bg-rose-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
              {likes.length}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            People who swiped right on your profile. Match back with 1-click to start chatting!
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-semibold w-fit">
          <ShieldCheck className="w-4 h-4" /> Free Instant Matches Unlocked
        </div>
      </div>

      {isLoading ? (
        <div className="p-16 text-center text-zinc-400 text-sm flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <span>Checking your likes &amp; match requests...</span>
        </div>
      ) : likes.length === 0 ? (
        <div className="p-12 text-center bg-zinc-900/60 border border-zinc-800 rounded-3xl space-y-3 max-w-md mx-auto my-8">
          <div className="w-14 h-14 rounded-2xl bg-rose-950/40 border border-rose-800/40 text-rose-400 mx-auto flex items-center justify-center">
            <Heart className="w-7 h-7" />
          </div>
          <h2 className="text-base font-bold text-white">No New Likes Yet</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            When someone likes your profile, their request will appear right here so you can match and start chatting.
          </p>
          <div className="pt-2">
            <Link
              href="/discover"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white text-xs font-bold shadow-lg shadow-rose-600/25 hover:from-rose-500 hover:to-pink-500 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" /> Start Swiping on Discover
            </Link>
          </div>
        </div>
      ) : (
        /* Grid of Inbound Likes */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {likes.map((item) => {
            const profile = item.profile;
            return (
              <div
                key={profile._id || profile.userId}
                onClick={() => setSelectedProfile(profile)}
                className="relative aspect-[3/4] rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-900 shadow-lg group cursor-pointer hover:scale-[1.02] transition-transform"
              >
                {/* Photo */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={profile.photos?.[0] || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800'}
                  alt=""
                  className="w-full h-full object-cover"
                />

                {/* Super Like Badge */}
                {item.type === 'superlike' && (
                  <div className="absolute top-3 right-3 z-20 bg-cyan-500 text-zinc-950 p-1.5 rounded-full shadow-lg">
                    <Star className="w-4 h-4 fill-zinc-950" />
                  </div>
                )}

                {/* Interactive Overlay */}
                <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent p-3 pt-12 flex flex-col justify-end">
                  <div className="text-white font-bold text-sm truncate">
                    {profile.name || 'Member'}, {profile.age || 24}
                  </div>
                  <div className="text-[11px] text-zinc-300 truncate">
                    {profile.location?.city || 'Near you'}
                  </div>

                  {/* 1-Click Match / Pass */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePass(profile);
                      }}
                      className="p-2 rounded-full bg-zinc-800/90 hover:bg-red-600 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                      title="Pass"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInstantMatch(profile);
                      }}
                      className="flex-1 py-1.5 px-3 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-md cursor-pointer transition-all"
                    >
                      <Heart className="w-3.5 h-3.5 fill-white" /> Match Back
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Profile Detail Modal */}
      {selectedProfile && (
        <ProfileDetailModal
          profile={selectedProfile}
          onClose={() => setSelectedProfile(null)}
          onSwipe={(act) => {
            if (act === 'like' || act === 'superlike') {
              handleInstantMatch(selectedProfile);
            } else {
              handlePass(selectedProfile);
            }
            setSelectedProfile(null);
          }}
        />
      )}

      {/* Match Celebration Modal */}
      {matchedProfile && (
        <MatchCelebrationModal
          currentProfilePhoto={myProfile?.photos?.[0] || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800'}
          matchedProfile={matchedProfile}
          onClose={() => setMatchedProfile(null)}
        />
      )}
    </div>
  );
}
