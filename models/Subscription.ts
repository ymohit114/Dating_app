import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISubscriptionDocument extends Document {
  userId: mongoose.Types.ObjectId;
  plan: 'free' | 'gold' | 'platinum';
  status: 'active' | 'expired' | 'cancelled';
  startDate: Date;
  expiresAt: Date;
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

const SubscriptionSchema = new Schema<ISubscriptionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    plan: { type: String, enum: ['free', 'gold', 'platinum'], default: 'free' },
    status: { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active' },
    startDate: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 10) }, // 10 years for free
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    features: {
      unlimitedLikes: { type: Boolean, default: false },
      seeWhoLikesYou: { type: Boolean, default: false },
      superLikesPerDay: { type: Number, default: 1 },
      boostsPerMonth: { type: Number, default: 0 },
      rewinds: { type: Boolean, default: false },
      passport: { type: Boolean, default: false },
      noAds: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export const Subscription: Model<ISubscriptionDocument> =
  mongoose.models.Subscription || mongoose.model<ISubscriptionDocument>('Subscription', SubscriptionSchema);

export default Subscription;
