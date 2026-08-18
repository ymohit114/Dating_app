import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Profile from '@/models/Profile';
import Like from '@/models/Like';
import Match from '@/models/Match';
import Message from '@/models/Message';
import { requireAdminAuth } from '@/lib/auth';
import { resolveToCloudinaryUrl, getCloudinaryProfilePhoto } from '@/lib/cloudinary';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

const INDIAN_FEMALE_DATASET = [
  {
    name: 'Ananya Sharma',
    age: 23,
    city: 'South Delhi, New Delhi',
    coordinates: [77.2197, 28.5494],
    job: 'Fashion Stylist & Creative Director',
    school: 'NIFT Delhi',
    bio: 'Art gallery afternoons, pour-over specialty coffee, and finding beauty in everyday chaos ✨ Let’s get Italian food and debate 90s music.',
    passions: ['Specialty Coffee', 'Fashion', 'Modern Art', 'Travel'],
    photos: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80',
    ],
  },
  {
    name: 'Priya Mehra',
    age: 24,
    city: 'Cyber City, Gurugram',
    coordinates: [77.0888, 28.4947],
    job: 'Product Designer at Tech Studio',
    school: 'IIT Delhi',
    bio: 'Minimalist at heart, maximalist when it comes to sushi and weekend road trips 🚗 What’s the best song you discovered this week?',
    passions: ['Technology', 'Fine Dining', 'Podcasts', 'Architecture'],
    photos: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80',
    ],
  },
  {
    name: 'Riya Sen',
    age: 22,
    city: 'Bandra West, Mumbai',
    coordinates: [72.8295, 19.0596],
    job: 'Architecture Graduate & Painter',
    school: 'Sir JJ College of Architecture',
    bio: 'Film photography, sunsets by Carter Road, and cozy jazz clubs. Teach me something I don’t know 🎨',
    passions: ['Film Photography', 'Architecture', 'Music', 'Cinema'],
    photos: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&auto=format&fit=crop&q=80',
    ],
  },
  {
    name: 'Sneha Kapoor',
    age: 25,
    city: 'Indiranagar, Bengaluru',
    coordinates: [77.6412, 12.9784],
    job: 'Brand Marketing Lead',
    school: 'Symbiosis Pune',
    bio: 'Fueled by iced matcha, sourdough toast, and spontaneous weekend hikes 🌿 Looking for meaningful conversations and good energy.',
    passions: ['Hiking', 'Yoga', 'Matcha', 'Literature'],
    photos: [
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&auto=format&fit=crop&q=80',
    ],
  },
  {
    name: 'Aaradhya Varma',
    age: 24,
    city: 'Vasant Vihar, New Delhi',
    coordinates: [77.1585, 28.5603],
    job: 'Interior Architect',
    school: 'SPA Delhi',
    bio: 'Passionate about Scandinavian design, dogs, and cozy book cafés. Send me your best travel recommendation! ✈️',
    passions: ['Dogs', 'Architecture', 'Travel', 'Literature'],
    photos: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80',
    ],
  },
  {
    name: 'Tanvi Singhal',
    age: 23,
    city: 'Noida Sector 62',
    coordinates: [77.3628, 28.6271],
    job: 'Software Engineer & Pianist',
    school: 'DTU Delhi',
    bio: 'Coding by day, playing classical piano by night 🎹 Rooftop drinks or cozy coffee dates?',
    passions: ['Technology', 'Piano', 'Specialty Coffee', 'Gaming'],
    photos: [
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80',
    ],
  },
  {
    name: 'Meera Nair',
    age: 26,
    city: 'Koramangala, Bengaluru',
    coordinates: [77.6229, 12.9352],
    job: 'Clinical Psychologist & Writer',
    school: 'NIMHANS',
    bio: 'Deep listener, poetry lover, and amateur baker. Looking for authentic chemistry and mutual respect 🌸',
    passions: ['Literature', 'Baking', 'Yoga', 'Podcasts'],
    photos: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=80',
    ],
  },
  {
    name: 'Simran Khurana',
    age: 24,
    city: 'Defence Colony, New Delhi',
    coordinates: [77.2315, 28.5744],
    job: 'Content Strategist & Podcaster',
    school: 'Lady Shri Ram College',
    bio: 'Can talk for hours about cinema, psychology, and obscure food spots. Let’s find the best coffee in the city ☕',
    passions: ['Cinema', 'Podcasts', 'Fine Dining', 'Travel'],
    photos: [
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&auto=format&fit=crop&q=80',
    ],
  },
  {
    name: 'Kavya Reddy',
    age: 23,
    city: 'Jubilee Hills, Hyderabad',
    coordinates: [78.4069, 17.4319],
    job: 'UX Researcher',
    school: 'BITS Pilani',
    bio: 'Curious about human behavior, obsessed with golden hour lighting, and always ready for badminton 🏸',
    passions: ['Fitness', 'Technology', 'Photography', 'Travel'],
    photos: [
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80',
    ],
  },
  {
    name: 'Pooja Agarwal',
    age: 25,
    city: 'Connaught Place, New Delhi',
    coordinates: [77.2167, 28.6328],
    job: 'Art Curator & Gallery Manager',
    school: 'Delhi University',
    bio: 'Life is too short for boring conversations and bad coffee. Tell me what excites you most right now 💫',
    passions: ['Modern Art', 'Specialty Coffee', 'Literature', 'Cinema'],
    photos: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80',
    ],
  }
];

export async function GET(req: Request) {
  try {
    const { user, errorResponse } = requireAdminAuth(req);
    if (errorResponse) return errorResponse;

    const conn = await connectToDatabase();
    if (!conn) return NextResponse.json({ success: true, profiles: [] });

    // Fetch all managed profiles
    const managedUsers = await User.find({ isManaged: true }).select('_id email createdAt').lean();
    const managedUserIds = managedUsers.map(u => u._id);

    const profiles = await Profile.find({
      $or: [
        { isManaged: true },
        { userId: { $in: managedUserIds } },
      ],
    }).lean();

    // Enrich with live telemetry (matches count, likes count, last active)
    const enriched = await Promise.all(
      profiles.map(async (p: any) => {
        const uId = p.userId?.toString() || p._id.toString();
        const [likesCount, matchesCount, messagesCount] = await Promise.all([
          Like.countDocuments({ toUser: uId }),
          Match.countDocuments({ $or: [{ user1: uId }, { user2: uId }], status: 'active' }),
          Message.countDocuments({ receiverId: uId }),
        ]);

        return {
          _id: p._id.toString(),
          userId: uId,
          name: p.name || p.firstName,
          age: p.dateOfBirth
            ? Math.abs(new Date(Date.now() - new Date(p.dateOfBirth).getTime()).getUTCFullYear() - 1970)
            : 24,
          city: p.city || p.location?.city || 'New Delhi',
          job: p.job || p.occupation || 'Creative Professional',
          bio: p.bio,
          photos: (p.photos && p.photos.length > 0)
            ? p.photos.map((ph: any, pIdx: number) => resolveToCloudinaryUrl(ph, pIdx + 1))
            : [getCloudinaryProfilePhoto(1)],
          likesReceived: likesCount,
          activeMatches: matchesCount,
          totalMessagesReceived: messagesCount,
          createdAt: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'Active',
          isManaged: true,
        };
      })
    );

    return NextResponse.json({
      success: true,
      count: enriched.length,
      profiles: enriched,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { user, errorResponse } = requireAdminAuth(req);
    if (errorResponse) return errorResponse;

    const body = await req.json().catch(() => ({}));
    const countToGenerate = Math.min(Math.max(Number(body.count) || 10, 1), 50);

    const conn = await connectToDatabase();
    if (!conn) return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });

    const passwordHash = await bcrypt.hash('SecureBotPass2026!', 10);
    const createdList = [];

    for (let i = 0; i < countToGenerate; i++) {
      const template = INDIAN_FEMALE_DATASET[i % INDIAN_FEMALE_DATASET.length];
      const uniqueSuffix = Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
      const email = `${template.name.toLowerCase().replace(/[^a-z]/g, '')}_${uniqueSuffix}@managed.elance.internal`;

      // 1. Create User Document
      const newUser = await User.create({
        email,
        passwordHash,
        role: 'user',
        status: 'active',
        isEmailVerified: true,
        isManaged: true,
      });

      // 2. Calculate DOB based on age
      const dob = new Date();
      dob.setFullYear(dob.getFullYear() - template.age);

      // 3. Create Profile Document
      const newProfile = await Profile.create({
        userId: newUser._id,
        name: template.name,
        firstName: template.name.split(' ')[0],
        dateOfBirth: dob,
        gender: 'woman',
        interestedIn: ['men'],
        bio: template.bio,
        city: template.city,
        country: 'India',
        occupation: template.job,
        job: template.job,
        school: template.school,
        interests: template.passions,
        passions: template.passions,
        relationshipGoal: 'Long-term',
        photos: template.photos,
        location: {
          type: 'Point',
          coordinates: template.coordinates as [number, number],
          city: template.city.split(',')[0].trim(),
          state: 'Delhi',
          country: 'India',
        },
        isProfileComplete: true,
        isManaged: true,
        verificationStatus: 'verified',
      });

      createdList.push({
        userId: newUser._id.toString(),
        name: template.name,
        email,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Generated ${createdList.length} Indian female profiles successfully!`,
      profiles: createdList,
    });
  } catch (error: any) {
    console.error('Failed to generate managed profiles:', error);
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { user, errorResponse } = requireAdminAuth(req);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(req.url);
    const profileId = searchParams.get('id');

    const conn = await connectToDatabase();
    if (!conn) return NextResponse.json({ error: 'Database error' }, { status: 500 });

    if (profileId) {
      const prof = await Profile.findById(profileId);
      if (prof) {
        await User.findByIdAndDelete(prof.userId);
        await Profile.findByIdAndDelete(profileId);
      }
      return NextResponse.json({ success: true, message: 'Managed profile deleted' });
    }

    // Wipe all managed profiles
    const managedUsers = await User.find({ isManaged: true }).select('_id');
    const uIds = managedUsers.map(u => u._id);
    await User.deleteMany({ isManaged: true });
    await Profile.deleteMany({ $or: [{ isManaged: true }, { userId: { $in: uIds } }] });

    return NextResponse.json({ success: true, message: 'All managed profiles cleared' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}
