import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProfilePhoto {
  url: string;
  isPrimary: boolean;
  displayOrder: number;
}

export interface IProfileDocument extends Document {
  userId: mongoose.Types.ObjectId;
  firstName: string;
  dateOfBirth: Date;
  gender: 'man' | 'woman' | 'non-binary' | 'other';
  interestedIn: string[];
  bio: string;
  city: string;
  country: string;
  occupation?: string;
  education?: string;
  interests: string[];
  relationshipGoal: 'Long-term' | 'Short-term' | 'Friendship' | 'Marriage' | 'Not Sure';
  photos: IProfilePhoto[];
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  isProfileComplete: boolean;
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const ProfileSchema = new Schema<IProfileDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    firstName: { type: String, required: true, trim: true, maxLength: 50 },
    dateOfBirth: {
      type: Date,
      required: true,
      validate: {
        validator: function (dob: Date) {
          const ageDiffMs = Date.now() - dob.getTime();
          const ageDate = new Date(ageDiffMs);
          const age = Math.abs(ageDate.getUTCFullYear() - 1970);
          return age >= 18;
        },
        message: 'Must be at least 18 years of age to register.',
      },
    },
    gender: {
      type: String,
      enum: ['man', 'woman', 'non-binary', 'other'],
      required: true,
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
    interests: { type: [String], default: [] },
    relationshipGoal: {
      type: String,
      enum: ['Long-term', 'Short-term', 'Friendship', 'Marriage', 'Not Sure'],
      default: 'Long-term',
    },
    photos: [
      {
        url: { type: String, required: true },
        isPrimary: { type: Boolean, default: false },
        displayOrder: { type: Number, default: 0 },
      },
    ],
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [lng, lat]
        default: [77.2090, 28.6139],
      },
    },
    isProfileComplete: { type: Boolean, default: false },
    verificationStatus: {
      type: String,
      enum: ['unverified', 'pending', 'verified', 'rejected'],
      default: 'unverified',
    },
  },
  { timestamps: true }
);

ProfileSchema.index({ location: '2dsphere' });
ProfileSchema.index({ interestedIn: 1, gender: 1 });

export const Profile: Model<IProfileDocument> =
  mongoose.models.Profile || mongoose.model<IProfileDocument>('Profile', ProfileSchema);

export default Profile;
