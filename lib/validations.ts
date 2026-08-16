import { z } from 'zod';

export const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(50),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  dateOfBirth: z.string().refine((val) => {
    const dob = new Date(val);
    if (isNaN(dob.getTime())) return false;
    const ageDiffMs = Date.now() - dob.getTime();
    const ageDate = new Date(ageDiffMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    return age >= 18;
  }, 'You must be at least 18 years old to join AuraMatch'),
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
  photos: z.array(z.string()).max(9).optional(),
});

export const preferenceSchema = z.object({
  minAge: z.number().min(18).max(99).default(18),
  maxAge: z.number().min(18).max(99).default(45),
  maxDistance: z.number().min(1).max(300).default(50),
  interestedIn: z.enum(['men', 'women', 'everyone']).default('everyone'),
  relationshipGoals: z.array(z.string()).optional(),
  city: z.string().optional(),
});

export const discoverActionSchema = z.object({
  targetUserId: z.string().min(1, 'Target user ID is required'),
  action: z.enum(['like', 'pass']),
});

export const sendMessageSchema = z.object({
  conversationId: z.string().min(1, 'Conversation ID is required'),
  message: z.string().min(1, 'Message cannot be empty').max(2000),
  messageType: z.enum(['text', 'image', 'audio', 'icebreaker']).default('text'),
});

export const reportSchema = z.object({
  reportedUser: z.string().min(1, 'Reported user ID is required'),
  reason: z.enum([
    'Fake Profile',
    'Spam',
    'Harassment',
    'Scam',
    'Impersonation',
    'Inappropriate Content',
    'Other'
  ]),
  description: z.string().max(1000).optional(),
});

export const blockSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

export const locationUpdateSchema = z.object({
  latitude: z.number().min(-90, 'Latitude must be >= -90').max(90, 'Latitude must be <= 90'),
  longitude: z.number().min(-180, 'Longitude must be >= -180').max(180, 'Longitude must be <= 180'),
  accuracy: z.number().optional(),
});

export const nearbyQuerySchema = z.object({
  radiusKm: z.coerce.number().min(1).max(150).default(5),
  limit: z.coerce.number().min(1).max(20).default(20),
});

