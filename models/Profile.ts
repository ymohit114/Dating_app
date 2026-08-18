import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProfileDocument extends Document {
  userId: mongoose.Types.ObjectId;
  firstName?: string;
  name?: string;
  dateOfBirth?: Date;
  gender: 'man' | 'woman' | 'non-binary' | 'other';
  interestedIn: string[];
  bio: string;
  city: string;
  country: string;
  occupation?: string;
  education?: string;
  job?: string;
  school?: string;
  interests: string[];
  passions?: string[];
  relationshipGoal: 'Long-term' | 'Short-term' | 'Friendship' | 'Marriage' | 'Not Sure';
  photos: any[];
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
    city?: string;
    state?: string;
    country?: string;
  };
  isProfileComplete: boolean;
  isManaged?: boolean;
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const ProfileSchema = new Schema<IProfileDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    firstName: { type: String, trim: true, maxLength: 50 },
    name: { type: String, trim: true, maxLength: 50 },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['man', 'woman', 'non-binary', 'other'],
      default: 'man',
    },
    interestedIn: {
      type: [String],
      default: ['women'],
    },
    bio: { type: String, default: '', maxLength: 1000 },
    city: { type: String, default: 'New Delhi', trim: true },
    country: { type: String, default: 'India', trim: true },
    occupation: { type: String, trim: true, maxLength: 100 },
    education: { type: String, trim: true, maxLength: 100 },
    job: { type: String, trim: true, maxLength: 100 },
    school: { type: String, trim: true, maxLength: 100 },
    interests: { type: [String], default: [] },
    passions: { type: [String], default: [] },
    relationshipGoal: {
      type: String,
      enum: ['Long-term', 'Short-term', 'Friendship', 'Marriage', 'Not Sure'],
      default: 'Long-term',
    },
    photos: {
      type: [Schema.Types.Mixed] as any,
      default: [],
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [77.2090, 28.6139], // Default Delhi coordinates
      },
      city: { type: String, default: 'New Delhi' },
      state: { type: String, default: 'Delhi' },
      country: { type: String, default: 'India' },
    },
    isProfileComplete: { type: Boolean, default: false },
    isManaged: { type: Boolean, default: false },
    verificationStatus: {
      type: String,
      enum: ['unverified', 'pending', 'verified', 'rejected'],
      default: 'unverified',
    },
  },
  { timestamps: true }
);

ProfileSchema.index({ location: '2dsphere' });

export const Profile: Model<IProfileDocument> =
  mongoose.models.Profile || mongoose.model<IProfileDocument>('Profile', ProfileSchema);

export default Profile;
