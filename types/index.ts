export type UserRole = 'user' | 'moderator' | 'admin' | 'superadmin';

export interface IUser {
  _id: string;
  email: string;
  phone?: string;
  passwordHash?: string;
  role: UserRole;
  isVerified: boolean;
  isBanned: boolean;
  createdAt: string;
  updatedAt: string;
}

export type GenderType = 'man' | 'woman' | 'non-binary' | 'other';
export type InterestedInType = 'men' | 'women' | 'everyone';
export type RelationshipGoalType = 
  | 'Long-term'
  | 'Short-term'
  | 'Friendship'
  | 'Marriage'
  | 'Not Sure'
  | 'Long-term partner' 
  | 'Long-term, open to short' 
  | 'Short-term, open to long' 
  | 'Short-term fun' 
  | 'New friends' 
  | 'Still figuring it out';

export interface IProfilePrompt {
  id: string;
  question: string;
  answer: string;
}

export interface ILocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
  city?: string;
  state?: string;
  country?: string;
}

export interface IProfile {
  _id: string;
  userId: string;
  name: string;
  firstName?: string;
  age: number;
  birthdate: string;
  gender: GenderType;
  interestedIn: InterestedInType;
  photos: string[];
  bio: string;
  job?: string;
  company?: string;
  school?: string;
  height?: number; // cm
  location: ILocation;
  passions: string[];
  interests?: string[];
  prompts: IProfilePrompt[];
  relationshipGoal?: RelationshipGoalType;
  isVerified: boolean;
  isBoosted?: boolean;
  boostExpiresAt?: string;
  onlineStatus?: 'online' | 'offline' | 'away';
  lastActive?: string;
  distanceKm?: number; // Computed during discovery
  ratingScore?: number; // ELO / desirability score
  instagram?: string;
  spotifyTopArtist?: string;
}

export type ActionType = 'like' | 'pass' | 'superlike';

export interface ILike {
  _id: string;
  fromUserId: string;
  toUserId: string;
  type: ActionType;
  createdAt: string;
}

export interface IMatch {
  _id: string;
  users: string[]; // user IDs
  matchedAt: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: Record<string, number>;
  active: boolean;
  otherProfile?: IProfile; // Joined / populated profile
}

export interface IMessageReaction {
  userId: string;
  emoji: string;
}

export interface IMessage {
  _id: string;
  matchId: string;
  senderId: string;
  receiverId: string;
  text: string;
  mediaUrl?: string;
  type?: 'text' | 'image' | 'audio' | 'system' | 'icebreaker';
  read: boolean;
  isDeleted?: boolean;
  reactions?: IMessageReaction[];
  createdAt: string;
}

export interface IConversation {
  _id: string;
  matchId: string;
  participants: string[];
  lastMessage?: IMessage;
  updatedAt: string;
}

export type SubscriptionPlan = 'free' | 'gold' | 'platinum';

export interface ISubscription {
  _id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: 'active' | 'expired' | 'cancelled';
  startDate: string;
  expiresAt: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  features: {
    unlimitedLikes: boolean;
    seeWhoLikesYou: boolean;
    superLikesPerDay: number;
    boostsPerMonth: number;
    rewinds: boolean;
    passport: boolean;
    noAds: boolean;
  };
}

export interface IReport {
  _id: string;
  reporterId: string;
  reportedUserId: string;
  reason: 'inappropriate_photos' | 'spam' | 'harassment' | 'underage' | 'fake_profile' | 'other';
  description?: string;
  status: 'pending' | 'reviewing' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: string;
  reportedProfile?: IProfile;
  reporterProfile?: IProfile;
}

export interface IBlock {
  _id: string;
  blockerId: string;
  blockedUserId: string;
  createdAt: string;
}

export interface IDiscoveryFilters {
  gender?: InterestedInType;
  minAge: number;
  maxAge: number;
  maxDistanceKm: number;
  hasBioOnly?: boolean;
  verifiedOnly?: boolean;
  relationshipGoals?: RelationshipGoalType[];
}

export interface INotification {
  id: string;
  userId: string;
  type: 'match' | 'like' | 'superlike' | 'message' | 'system';
  title: string;
  message: string;
  avatar?: string;
  actionUrl?: string;
  read: boolean;
  createdAt: string;
}
