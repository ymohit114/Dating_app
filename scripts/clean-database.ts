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
import Pass from '../models/Pass';
import Match from '../models/Match';
import Conversation from '../models/Conversation';
import Message from '../models/Message';
import Report from '../models/Report';
import Block from '../models/Block';
import AdminLog from '../models/AdminLog';
import { hashPassword } from '../lib/auth';

export async function setupExactTwoAccounts() {
  console.log('⚙️ Resetting database to exactly 2 accounts: 1 Admin and 1 Simple User...');
  const conn = await connectToDatabase();

  if (!conn) {
    console.log('⚠️ MongoDB not connected directly. Memory store configured for 2 accounts.');
    return;
  }

  try {
    // 1. Delete all collections
    await Promise.all([
      User.deleteMany({}),
      Profile.deleteMany({}),
      Like.deleteMany({}),
      Pass.deleteMany({}),
      Match.deleteMany({}),
      Conversation.deleteMany({}),
      Message.deleteMany({}),
      Report.deleteMany({}),
      Block.deleteMany({}),
      AdminLog.deleteMany({}),
    ]);

    const commonPasswordHash = await hashPassword('1234567890');

    // 2. Account #1: Superadmin (mohit@gmail.com)
    const adminUser = await User.create({
      _id: 'user_admin_mohit',
      email: 'mohit@gmail.com',
      passwordHash: commonPasswordHash,
      role: 'superadmin',
      status: 'active',
      isEmailVerified: true,
    });

    // 3. Account #2: Simple User (user@gmail.com)
    const simpleUser = await User.create({
      _id: 'user_simple_01',
      email: 'user@gmail.com',
      passwordHash: commonPasswordHash,
      role: 'user',
      status: 'active',
      isEmailVerified: true,
    });

    await Profile.create({
      userId: simpleUser._id,
      firstName: 'Rahul',
      dateOfBirth: new Date('1999-06-15'),
      gender: 'man',
      interestedIn: ['women'],
      photos: [
        {
          url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
          isPrimary: true,
          displayOrder: 0,
        },
      ],
      bio: 'Music lover, foodie & curious traveler exploring meaningful connections.',
      city: 'New Delhi',
      country: 'India',
      relationshipGoal: 'Long-term',
      interests: ['Music', 'Coffee', 'Travel'],
      isProfileComplete: true,
      verificationStatus: 'verified',
    });

    // 4. Record Admin Audit Log
    await AdminLog.create({
      adminId: adminUser._id.toString(),
      adminEmail: adminUser.email,
      action: 'system_initialized',
      targetType: 'system',
      targetId: 'two_accounts_configured',
      details: 'System configured with exactly 2 accounts: 1 Superadmin (mohit@gmail.com) and 1 Simple User (user@gmail.com).',
    });

    console.log('✅ Success! Exactly 2 accounts configured:');
    console.log('   1. Admin:       mohit@gmail.com  (Password: 1234567890)');
    console.log('   2. Simple User: user@gmail.com   (Password: 1234567890)');
  } catch (error) {
    console.error('❌ Error during setup:', error);
  }
}

if (require.main === module) {
  setupExactTwoAccounts().then(() => process.exit(0));
}
