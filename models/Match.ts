import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMatchDocument extends Document {
  user1: mongoose.Types.ObjectId;
  user2: mongoose.Types.ObjectId;
  conversationId?: mongoose.Types.ObjectId;
  status: 'active' | 'unmatched' | 'blocked';
  matchedAt: Date;
  lastMessage?: string;
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MatchSchema = new Schema<IMatchDocument>(
  {
    user1: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    user2: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation' },
    status: { type: String, enum: ['active', 'unmatched', 'blocked'], default: 'active' },
    matchedAt: { type: Date, default: Date.now },
    lastMessage: { type: String },
    lastMessageAt: { type: Date },
  },
  { timestamps: true }
);

// DB-level unique compound index with normalized user ordering to prevent duplicate A-B and B-A matches
MatchSchema.index({ user1: 1, user2: 1 }, { unique: true });

export const Match: Model<IMatchDocument> =
  mongoose.models.Match || mongoose.model<IMatchDocument>('Match', MatchSchema);

export default Match;
