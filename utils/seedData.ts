import { IProfile, IUser, IMatch, IMessage, IReport } from '@/types';

// Superadmin / Main User Profile
export const INITIAL_CURRENT_USER: IUser = {
  _id: 'user_admin_mohit',
  email: 'mohit@gmail.com',
  phone: '+91 9876543210',
  role: 'superadmin',
  isVerified: true,
  isBanned: false,
  createdAt: '2026-01-01T10:00:00.000Z',
  updatedAt: '2026-08-16T10:00:00.000Z',
};

export const INITIAL_CURRENT_PROFILE: IProfile = {
  _id: 'prof_mohit_01',
  userId: 'user_admin_mohit',
  name: 'Mohit Yadav',
  age: 24,
  birthdate: '2000-01-01',
  gender: 'man',
  interestedIn: 'women',
  photos: [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
  ],
  bio: 'Software engineer & tech enthusiast exploring meaningful connections. ☕✨',
  job: 'Lead Product Engineer',
  company: '',
  school: '',
  height: 178,
  location: {
    type: 'Point',
    coordinates: [77.2090, 28.6139],
    city: 'New Delhi',
    state: 'Delhi',
    country: 'India',
  },
  passions: ['Tech', 'Photography', 'Travel'],
  prompts: [],
  relationshipGoal: 'Long-term',
  isVerified: true,
  isBoosted: false,
  onlineStatus: 'online',
};

export const ADMIN_USER: IUser = INITIAL_CURRENT_USER;

// No fake candidates or mock decks
export const SEED_PROFILES: IProfile[] = [];
export const SEED_MATCHES: IMatch[] = [];
export const SEED_MESSAGES: IMessage[] = [];
export const SEED_REPORTS: IReport[] = [];
export const SEED_LIKES_INBOUND: any[] = [];
