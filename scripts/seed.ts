import fs from 'fs';
import path from 'path';

// Parse .env.local if present
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        process.env[key] = value.trim();
      }
    });
  }
} catch (e) {
  console.warn('Could not parse .env.local:', e);
}

import connectToDatabase from '../lib/mongodb';
import User from '../models/User';
import Profile from '../models/Profile';
import Like from '../models/Like';
import Match from '../models/Match';
import Conversation from '../models/Conversation';
import Message from '../models/Message';
import Report from '../models/Report';
import Block from '../models/Block';
import AdminLog from '../models/AdminLog';
import { hashPassword } from '../lib/auth';
import { 
  SEED_PROFILES, 
  INITIAL_CURRENT_USER, 
  INITIAL_CURRENT_PROFILE,
  SEED_MATCHES,
  SEED_MESSAGES,
  SEED_REPORTS 
} from '../utils/seedData';

export async function seedDatabase() {
  console.log('🌱 Connecting to MongoDB Atlas cluster at:', process.env.MONGODB_URI?.split('@')[1]?.split('/')[0] || 'MongoDB URI');
  const conn = await connectToDatabase();

  if (!conn) {
    console.log('⚠️ MongoDB is not accessible right now. Mock memory fallback is active.');
    return;
  }

  try {
    console.log('Clearing old collections for clean testing state...');
    await Promise.all([
      User.deleteMany({}),
      Profile.deleteMany({}),
      Like.deleteMany({}),
      Match.deleteMany({}),
      Conversation.deleteMany({}),
      Message.deleteMany({}),
      Report.deleteMany({}),
      Block.deleteMany({}),
      AdminLog.deleteMany({}),
    ]);

    const defaultPasswordHash = await hashPassword('password123');
    const adminPasswordHash = await hashPassword('1234567890');

    // 1. Create Superadmin & Admin
    const superadmin = await User.create({
      _id: 'user_superadmin_01',
      email: 'mohit@gmail.com',
      passwordHash: adminPasswordHash,
      role: 'superadmin',
      status: 'active',
      isEmailVerified: true,
    });

    const admin = await User.create({
      _id: 'user_admin_01',
      email: 'admin@elance.app',
      passwordHash: adminPasswordHash,
      role: 'admin',
      status: 'active',
      isEmailVerified: true,
    });

    // 2. Create Current Demo User (Alex Morgan)
    const currentUser = await User.create({
      _id: INITIAL_CURRENT_USER._id,
      email: INITIAL_CURRENT_USER.email,
      passwordHash: defaultPasswordHash,
      role: 'user',
      status: 'active',
      isEmailVerified: true,
    });

    await Profile.create({
      ...INITIAL_CURRENT_PROFILE,
      userId: currentUser._id,
      dateOfBirth: new Date(INITIAL_CURRENT_PROFILE.birthdate),
      location: {
        type: 'Point',
        coordinates: INITIAL_CURRENT_PROFILE.location.coordinates, // [77.2090, 28.6139]
      },
      isProfileComplete: true,
      verificationStatus: 'verified',
    });

    // 3. Create Candidate Profiles
    console.log(`Seeding ${SEED_PROFILES.length} nearby candidate profiles with GeoJSON coordinates...`);
    for (const p of SEED_PROFILES) {
      const u = await User.create({
        _id: p.userId,
        email: `${p.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        passwordHash: defaultPasswordHash,
        role: 'user',
        status: 'active',
        isEmailVerified: true,
      });

      await Profile.create({
        userId: u._id,
        firstName: p.name,
        dateOfBirth: new Date(p.birthdate),
        gender: p.gender,
        interestedIn: [p.interestedIn],
        bio: p.bio,
        city: p.location.city || 'New Delhi',
        country: p.location.country || 'India',
        occupation: p.job,
        education: p.school,
        interests: p.passions,
        relationshipGoal: p.relationshipGoal as any,
        photos: p.photos.map((url, idx) => ({ url, isPrimary: idx === 0, displayOrder: idx })),
        location: {
          type: 'Point',
          coordinates: p.location.coordinates,
        },
        isProfileComplete: true,
        verificationStatus: p.isVerified ? 'verified' : 'unverified',
      });
    }

    // 4. Create Reciprocal Likes & Matches (Elena, Maya, Sophie)
    console.log('Seeding mutual matches and conversations...');
    for (const matchSeed of SEED_MATCHES) {
      const [u1, u2] = matchSeed.users;
      
      await Like.create({ fromUser: u1, toUser: u2 });
      await Like.create({ fromUser: u2, toUser: u1 });

      const conv = await Conversation.create({
        participants: [u1, u2],
      });

      const matchDoc = await Match.create({
        _id: matchSeed._id,
        user1: u1,
        user2: u2,
        conversationId: conv._id,
        status: 'active',
        matchedAt: new Date(matchSeed.matchedAt),
        lastMessage: matchSeed.lastMessage,
        lastMessageAt: new Date(matchSeed.lastMessageAt || matchSeed.matchedAt),
      });

      await Conversation.findByIdAndUpdate(conv._id, { matchId: matchDoc._id });
    }

    // 5. Seed Messages
    for (const m of SEED_MESSAGES) {
      await Message.create({
        _id: m._id,
        matchId: m.matchId,
        senderId: m.senderId,
        receiverId: m.receiverId,
        text: m.text,
        read: m.read,
        createdAt: new Date(m.createdAt),
      });
    }

    // 6. Seed Safety Incident Reports
    for (const r of SEED_REPORTS) {
      await Report.create({
        _id: r._id,
        reporterId: r.reporterId,
        reportedUserId: r.reportedUserId,
        reason: r.reason,
        description: r.description,
        status: r.status,
        createdAt: new Date(r.createdAt),
      });
    }

    // 7. Seed Initial Admin Log
    await AdminLog.create({
      adminId: superadmin._id,
      adminEmail: superadmin.email,
      action: 'admin_login',
      targetType: 'admin',
      targetId: superadmin._id.toString(),
      details: 'System database seeded and verified successfully.',
    });

    console.log('✨ SUCCESS: MongoDB Atlas database connected & fully populated with real production test records!');
  } catch (error) {
    console.error('❌ Database seeding error:', error);
  }
}

if (require.main === module) {
  seedDatabase().then(() => process.exit(0));
}
