import connectToDatabase from '@/lib/mongodb';
import Profile from '@/models/Profile';
import User from '@/models/User';
import Block from '@/models/Block';
import Like from '@/models/Like';
import Pass from '@/models/Pass';
import { calculateDistanceKm } from '@/utils/distance';
import { calculateCompatibilityScore } from '@/services/discovery.service';
import { INITIAL_CURRENT_PROFILE, SEED_PROFILES } from '@/utils/seedData';

export class LocationService {
  async updateLocation(userId: string, latitude: number, longitude: number) {
    const conn = await connectToDatabase();
    if (conn) {
      await Profile.findOneAndUpdate(
        { userId },
        {
          $set: {
            location: {
              type: 'Point',
              coordinates: [longitude, latitude], // GeoJSON [lng, lat]
            },
          },
        }
      );
      return true;
    }
    INITIAL_CURRENT_PROFILE.location.coordinates = [longitude, latitude];
    return true;
  }

  async getNearbyProfiles(currentUserId: string, radiusKm: number = 5, limit: number = 20) {
    const conn = await connectToDatabase();

    if (conn) {
      const myProfile = await Profile.findOne({ userId: currentUserId }).lean();
      const userLng = myProfile?.location?.coordinates?.[0] ?? 77.209;
      const userLat = myProfile?.location?.coordinates?.[1] ?? 28.6139;

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

      const maxDistanceMeters = radiusKm * 1000;

      const nearbyDocs = await Profile.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [userLng, userLat],
            },
            $maxDistance: maxDistanceMeters,
          },
        },
      })
        .limit(limit * 2)
        .lean();

      return nearbyDocs
        .filter((doc: any) => {
          const docUserId = doc.userId?.toString();
          return docUserId && !excludedUserIds.has(docUserId) && activeUserIds.has(docUserId);
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
          };
        })
        .sort((a, b) => a.distanceKm - b.distanceKm)
        .slice(0, limit);
    }

    // Fallback seed calculation
    const [userLng, userLat] = INITIAL_CURRENT_PROFILE.location.coordinates;
    return SEED_PROFILES.map((p) => {
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
  }
}

export const locationService = new LocationService();
export default locationService;
