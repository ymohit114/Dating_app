import connectToDatabase from '@/lib/mongodb';
import Profile from '@/models/Profile';
import { INITIAL_CURRENT_PROFILE, INITIAL_CURRENT_USER } from '@/utils/seedData';

export class ProfileService {
  async getProfile(userId: string) {
    const conn = await connectToDatabase();
    if (conn) {
      const profile = await Profile.findOne({ userId }).lean();
      if (profile) return profile;
    }
    return INITIAL_CURRENT_PROFILE;
  }

  async updateProfile(userId: string, updates: Record<string, any>) {
    const conn = await connectToDatabase();
    if (conn) {
      const updated = await Profile.findOneAndUpdate(
        { userId },
        {
          $set: {
            ...updates,
            isProfileComplete: true,
          },
        },
        { new: true, upsert: true }
      ).lean();
      return updated;
    }

    return {
      ...INITIAL_CURRENT_PROFILE,
      ...updates,
      isProfileComplete: true,
    };
  }

  async addPhoto(userId: string, photoUrl: string, isPrimary: boolean = false) {
    const conn = await connectToDatabase();
    if (conn) {
      const profile = await Profile.findOne({ userId });
      if (profile) {
        if (profile.photos.length >= 6) {
          throw new Error('Maximum 6 photos allowed per profile.');
        }

        profile.photos.push({
          url: photoUrl,
          isPrimary: isPrimary || profile.photos.length === 0,
          displayOrder: profile.photos.length,
        });

        await profile.save();
        return profile.photos;
      }
    }

    return [
      ...INITIAL_CURRENT_PROFILE.photos.map((p, i) => ({ url: p, isPrimary: i === 0, displayOrder: i })),
      { url: photoUrl, isPrimary: false, displayOrder: INITIAL_CURRENT_PROFILE.photos.length },
    ];
  }

  async deletePhoto(userId: string, photoIndex: number) {
    const conn = await connectToDatabase();
    if (conn) {
      const profile = await Profile.findOne({ userId });
      if (profile && !isNaN(photoIndex)) {
        profile.photos.splice(photoIndex, 1);
        await profile.save();
        return profile.photos;
      }
    }

    return INITIAL_CURRENT_PROFILE.photos;
  }
}

export const profileService = new ProfileService();
export default profileService;
