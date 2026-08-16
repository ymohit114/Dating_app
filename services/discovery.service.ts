import { IProfile, IDiscoveryFilters } from '@/types';
import { SEED_PROFILES, INITIAL_CURRENT_PROFILE } from '@/utils/seedData';
import { calculateDistanceKm } from '@/utils/distance';
import connectToDatabase from '@/lib/mongodb';
import Profile from '@/models/Profile';
import Like from '@/models/Like';
import Pass from '@/models/Pass';
import Block from '@/models/Block';

export interface ScoredProfile extends IProfile {
  compatibilityScore: number; // e.g. 88 -> "88% Compatible"
  compatibilityBreakdown?: {
    interests: number;
    distance: number;
    age: number;
    goal: number;
    activity: number;
    completeness: number;
  };
}

export function calculateCompatibilityScore(
  myProfile: Partial<IProfile>,
  candidate: Partial<IProfile>,
  distanceKm: number = 5,
  maxDistanceKm: number = 50
): { score: number; breakdown: any } {
  const myInterests: string[] = (myProfile.passions || myProfile.interests || []) as string[];
  const candidateInterests: string[] = (candidate.passions || candidate.interests || []) as string[];

  // 1. Interests Overlap (25%)
  const shared = myInterests.filter((item: string) => candidateInterests.includes(item));
  const interestScore = Math.min(
    25,
    Math.round((shared.length / Math.max(1, Math.min(myInterests.length, 5))) * 25)
  );

  // 2. Distance Fit (20%)
  const distRatio = Math.max(0, 1 - distanceKm / Math.max(10, maxDistanceKm));
  const distanceScore = Math.round(distRatio * 20);

  // 3. Age Fit (20%)
  const myAge = myProfile.age || 26;
  const candAge = candidate.age || 24;
  const ageDiff = Math.abs(myAge - candAge);
  const ageScore = ageDiff <= 2 ? 20 : ageDiff <= 5 ? 16 : Math.max(4, 20 - ageDiff * 2);

  // 4. Relationship Goal Match (15%)
  const goalScore =
    myProfile.relationshipGoal && candidate.relationshipGoal
      ? myProfile.relationshipGoal === candidate.relationshipGoal
        ? 15
        : 8
      : 10;

  // 5. Activity (10%)
  const activityScore = candidate.onlineStatus === 'online' ? 10 : 7;

  // 6. Profile Completeness (10%)
  const photosCount = candidate.photos?.length || 1;
  const hasBio = Boolean(candidate.bio && candidate.bio.length > 20);
  const isVerified = Boolean(candidate.isVerified);
  const completenessScore =
    (photosCount >= 3 ? 4 : 2) + (hasBio ? 3 : 1) + (isVerified ? 3 : 1);

  const total = Math.min(99, Math.max(45, interestScore + distanceScore + ageScore + goalScore + activityScore + completenessScore));

  return {
    score: total,
    breakdown: {
      interests: interestScore,
      distance: distanceScore,
      age: ageScore,
      goal: goalScore,
      activity: activityScore,
      completeness: completenessScore,
    },
  };
}

export async function getDiscoveryStack(
  currentUserId: string,
  userLocation: { lng: number; lat: number },
  filters?: Partial<IDiscoveryFilters>
): Promise<ScoredProfile[]> {
  const conn = await connectToDatabase();
  const minAge = filters?.minAge || 18;
  const maxAge = filters?.maxAge || 45;
  const maxDistanceKm = filters?.maxDistanceKm || 50;

  if (conn) {
    try {
      // Find IDs already liked, passed, or blocked
      const [swipedLikes, swipedPasses, blockedUsers, blockingUsers] = await Promise.all([
        Like.find({ fromUser: currentUserId }).select('toUser').lean(),
        Pass.find({ fromUser: currentUserId }).select('toUser').lean(),
        Block.find({ blockerId: currentUserId }).select('blockedId').lean(),
        Block.find({ blockedId: currentUserId }).select('blockerId').lean(),
      ]);

      const excludedUserIds = [
        currentUserId,
        ...swipedLikes.map((l: any) => l.toUser.toString()),
        ...swipedPasses.map((p: any) => p.toUser.toString()),
        ...blockedUsers.map((b: any) => b.blockedId.toString()),
        ...blockingUsers.map((b: any) => b.blockerId.toString()),
      ];

      const query: any = {
        userId: { $nin: excludedUserIds },
      };

      const dbProfiles = await Profile.find(query).lean();
      const myProfile = (await Profile.findOne({ userId: currentUserId }).lean()) || INITIAL_CURRENT_PROFILE;

      const scoredList: ScoredProfile[] = dbProfiles.map((p: any) => {
        const [pLng, pLat] = p.location?.coordinates || [77.209, 28.6139];
        const dist = calculateDistanceKm(userLocation.lat, userLocation.lng, pLat, pLng);
        
        // Calculate age from dateOfBirth
        const birthdate = new Date(p.dateOfBirth);
        let computedAge = new Date().getFullYear() - birthdate.getFullYear();
        if (isNaN(computedAge) || computedAge < 18) computedAge = 24;

        const profileObj: IProfile = {
          _id: p._id.toString(),
          userId: p.userId.toString(),
          name: p.firstName || 'Candidate',
          age: computedAge,
          birthdate: p.dateOfBirth?.toISOString() || '2001-01-01',
          gender: p.gender,
          interestedIn: p.interestedIn?.[0] || 'everyone',
          photos: p.photos?.map((ph: any) => (typeof ph === 'string' ? ph : ph.url)) || [],
          bio: p.bio || '',
          job: p.occupation || '',
          school: p.education || '',
          location: {
            type: 'Point',
            coordinates: [pLng, pLat],
            city: p.city || 'New Delhi',
            country: p.country || 'India',
          },
          passions: p.interests || [],
          prompts: [],
          relationshipGoal: p.relationshipGoal,
          isVerified: p.verificationStatus === 'verified',
          onlineStatus: 'online',
          distanceKm: dist,
        };

        const { score, breakdown } = calculateCompatibilityScore(myProfile as any, profileObj, dist, maxDistanceKm);

        return {
          ...profileObj,
          compatibilityScore: score,
          compatibilityBreakdown: breakdown,
        };
      });

      return scoredList
        .filter((p) => p.age >= minAge && p.age <= maxAge && (p.distanceKm || 0) <= maxDistanceKm)
        .sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    } catch (e) {
      console.warn('DB Discovery error, using fallback seed stack:', e);
    }
  }

  // Fallback to rich seed profiles with calculated compatibility score
  return SEED_PROFILES.map((p) => {
    const [pLng, pLat] = p.location.coordinates;
    const dist = calculateDistanceKm(userLocation.lat, userLocation.lng, pLat, pLng);
    const { score, breakdown } = calculateCompatibilityScore(INITIAL_CURRENT_PROFILE, p, dist, maxDistanceKm);

    return {
      ...p,
      distanceKm: dist,
      compatibilityScore: score,
      compatibilityBreakdown: breakdown,
    };
  })
    .filter((p) => p.age >= minAge && p.age <= maxAge && (p.distanceKm || 0) <= maxDistanceKm)
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore);
}
