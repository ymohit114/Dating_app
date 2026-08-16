import { NextResponse } from 'next/server';
import { extractAuthUser } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Profile from '@/models/Profile';
import User from '@/models/User';
import Block from '@/models/Block';
import Like from '@/models/Like';
import Pass from '@/models/Pass';
import { nearbyQuerySchema } from '@/lib/validations';
import { calculateCompatibilityScore } from '@/services/discovery.service';
import { calculateDistanceKm } from '@/utils/distance';
import { INITIAL_CURRENT_USER, INITIAL_CURRENT_PROFILE, SEED_PROFILES } from '@/utils/seedData';

export async function GET(req: Request) {
  try {
    const authUser = extractAuthUser(req);
    const currentUserId = authUser?.userId || INITIAL_CURRENT_USER._id;

    const { searchParams } = new URL(req.url);
    const radiusParam = searchParams.get('radiusKm') || '5';
    const limitParam = searchParams.get('limit') || '20';

    const parsedQuery = nearbyQuerySchema.safeParse({
      radiusKm: Number(radiusParam),
      limit: Number(limitParam),
    });

    const radiusKm = parsedQuery.success ? parsedQuery.data.radiusKm : 5;
    const limit = parsedQuery.success ? Math.min(20, parsedQuery.data.limit) : 20;

    const conn = await connectToDatabase();

    if (conn) {
      // 1. Fetch current user's profile and location
      const myProfile = await Profile.findOne({ userId: currentUserId }).lean();
      const userLng = myProfile?.location?.coordinates?.[0] ?? 77.209;
      const userLat = myProfile?.location?.coordinates?.[1] ?? 28.6139;

      // 2. Fetch exclusion list: blocked, blocking, already swiped
      const [blockedByMe, blockingMe, swipedLikes, swipedPasses, activeUsers] = await Promise.all([
        Block.find({ blockerId: currentUserId }).select('blockedId').lean(),
        Block.find({ blockedId: currentUserId }).select('blockerId').lean(),
        Like.find({ fromUser: currentUserId }).select('toUser').lean(),
        Pass.find({ fromUser: currentUserId }).select('toUser').lean(),
        User.find({ status: 'active' }).select('_id').lean(),
      ]);

      const activeUserIds = new Set(activeUsers.map((u: any) => u._id.toString()));

      const excludedUserIds = new Set([
        currentUserId,
        ...blockedByMe.map((b: any) => b.blockedId.toString()),
        ...blockingMe.map((b: any) => b.blockerId.toString()),
        ...swipedLikes.map((l: any) => l.toUser.toString()),
        ...swipedPasses.map((p: any) => p.toUser.toString()),
      ]);

      // 3. MongoDB 2dsphere Geospatial Query ($near in meters)
      const maxDistanceMeters = radiusKm * 1000;
      
      const nearbyDocs = await Profile.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [userLng, userLat], // [longitude, latitude]
            },
            $maxDistance: maxDistanceMeters,
          },
        },
      })
        .limit(limit * 2) // query slight buffer for preference filtering
        .lean();

      // 4. Apply eligibility & privacy transformation (NEVER expose exact GPS coordinates)
      const nearbyCandidates = nearbyDocs
        .filter((doc: any) => {
          const docUserId = doc.userId?.toString();
          if (!docUserId) return false;
          if (excludedUserIds.has(docUserId)) return false;
          if (!activeUserIds.has(docUserId)) return false;
          return true;
        })
        .map((doc: any) => {
          const [candLng, candLat] = doc.location?.coordinates || [userLng, userLat];
          const distKm = calculateDistanceKm(userLat, userLng, candLat, candLng);

          const birthdate = new Date(doc.dateOfBirth || '2000-01-01');
          let age = new Date().getFullYear() - birthdate.getFullYear();
          if (isNaN(age) || age < 18) age = 24;

          const compatibility = calculateCompatibilityScore(
            (myProfile as any) || INITIAL_CURRENT_PROFILE,
            {
              age,
              passions: doc.interests || [],
              relationshipGoal: doc.relationshipGoal,
              isVerified: doc.verificationStatus === 'verified',
              photos: doc.photos?.map((p: any) => (typeof p === 'string' ? p : p.url)) || [],
              bio: doc.bio,
            },
            distKm,
            radiusKm
          );

          // Return sanitized candidate object with APPROXIMATE distance only
          return {
            userId: doc.userId.toString(),
            _id: doc._id.toString(),
            name: doc.firstName || 'Candidate',
            age,
            city: doc.city || 'Nearby',
            country: doc.country || 'India',
            distanceKm: Number(distKm.toFixed(1)),
            approximateDistance: `${distKm.toFixed(1)} km away`,
            bio: doc.bio || '',
            job: doc.occupation || '',
            school: doc.education || '',
            photos: doc.photos?.map((p: any) => (typeof p === 'string' ? p : p.url)) || [],
            interests: doc.interests || [],
            passions: doc.interests || [],
            relationshipGoal: doc.relationshipGoal,
            isVerified: doc.verificationStatus === 'verified',
            compatibilityScore: compatibility.score,
            // Notice: Exact coordinates [candLng, candLat] are strictly omitted for privacy!
          };
        })
        .sort((a, b) => a.distanceKm - b.distanceKm)
        .slice(0, limit);

      return NextResponse.json({
        success: true,
        count: nearbyCandidates.length,
        radiusKm,
        users: nearbyCandidates,
      });
    }

    // Offline Mock Memory Fallback (calculating approximate distance using seed profiles)
    const [userLng, userLat] = INITIAL_CURRENT_PROFILE.location.coordinates;

    const nearbyFallback = SEED_PROFILES.map((p) => {
      const [candLng, candLat] = p.location.coordinates;
      const distKm = calculateDistanceKm(userLat, userLng, candLat, candLng);
      const comp = calculateCompatibilityScore(INITIAL_CURRENT_PROFILE, p, distKm, radiusKm);

      return {
        userId: p.userId,
        _id: p._id,
        name: p.name,
        age: p.age,
        city: p.location.city || 'Nearby',
        country: p.location.country || 'India',
        distanceKm: Number(distKm.toFixed(1)),
        approximateDistance: `${distKm.toFixed(1)} km away`,
        bio: p.bio,
        job: p.job,
        school: p.school,
        photos: p.photos,
        interests: p.passions,
        passions: p.passions,
        relationshipGoal: p.relationshipGoal,
        isVerified: p.isVerified,
        compatibilityScore: comp.score,
      };
    })
      .filter((p) => p.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, limit);

    return NextResponse.json({
      success: true,
      count: nearbyFallback.length,
      radiusKm,
      users: nearbyFallback,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
