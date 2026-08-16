import { z } from 'zod';

export const registerSchema = z.object({
  firstName: z.string().min(2, 'Name must be at least 2 characters').max(50),
  name: z.string().optional(),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  dateOfBirth: z.string().refine((val) => {
    const dob = new Date(val);
    if (isNaN(dob.getTime())) return false;
    const ageDiffMs = Date.now() - dob.getTime();
    const ageDate = new Date(ageDiffMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    return age >= 18;
  }, 'You must be at least 18 years old to join Elance'),
  gender: z.enum(['man', 'woman', 'non-binary', 'other']),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const profileSchema = z.object({
  name: z.string().max(100).optional(),
  firstName: z.string().max(100).optional(),
  dateOfBirth: z.string().optional(),
  age: z.number().optional(),
  gender: z.enum(['man', 'woman', 'non-binary', 'other']).optional(),
  interestedIn: z.union([z.enum(['men', 'women', 'everyone']), z.array(z.string())]).optional(),
  city: z.string().max(100).optional(),
  location: z.object({
    type: z.string().optional(),
    coordinates: z.array(z.number()).optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  bio: z.string().max(1000).optional(),
  job: z.string().max(100).optional(),
  company: z.string().max(100).optional(),
  school: z.string().max(100).optional(),
  height: z.number().optional(),
  occupation: z.string().max(100).optional(),
  education: z.string().max(100).optional(),
  relationshipGoal: z.string().optional(),
  interests: z.array(z.string()).optional(),
  passions: z.array(z.string()).optional(),
  prompts: z.array(z.any()).optional(),
  photos: z.array(z.any()).max(9).optional(),
});

export const preferenceSchema = z.object({
  minAge: z.number().min(18).max(99).default(18),
  maxAge: z.number().min(18).max(99).default(45),
  maxDistance: z.number().min(1).max(300).default(50),
  interestedIn: z.enum(['men', 'women', 'everyone']).default('everyone'),
  relationshipGoals: z.array(z.string()).optional(),
  city: z.string().optional(),
});

export const swipeSchema = z.object({
  targetUserId: z.string().min(1),
  action: z.enum(['like', 'pass', 'superlike']),
});

export const messageSchema = z.object({
  receiverId: z.string().min(1),
  text: z.string().min(1).max(2000),
  mediaUrl: z.string().url().optional(),
  type: z.enum(['text', 'image', 'audio', 'icebreaker']).default('text'),
});

export const sendMessageSchema = z.object({
  conversationId: z.string().optional(),
  message: z.string().min(1).max(2000).optional(),
  text: z.string().min(1).max(2000).optional(),
  messageType: z.enum(['text', 'image', 'audio', 'icebreaker']).default('text'),
  type: z.enum(['text', 'image', 'audio', 'icebreaker']).optional(),
  mediaUrl: z.string().url().optional(),
});

export const discoverActionSchema = z.object({
  targetUserId: z.string().min(1),
  action: z.enum(['like', 'pass', 'superlike']),
});

export const nearbyQuerySchema = z.object({
  radiusKm: z.coerce.number().default(5),
  limit: z.coerce.number().default(20),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  maxDistance: z.coerce.number().optional(),
});

export const locationUpdateSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  city: z.string().optional(),
});

export const reportSchema = z.object({
  reportedUserId: z.string().min(1),
  reason: z.enum(['harassment', 'fake_profile', 'inappropriate_content', 'scam', 'underage', 'other']),
  description: z.string().max(1000).optional(),
});

export const blockSchema = z.object({
  blockedUserId: z.string().min(1),
  reason: z.string().max(500).optional(),
});
