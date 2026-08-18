import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILikeDocument extends Document {
  fromUser: mongoose.Types.ObjectId;
  toUser: mongoose.Types.ObjectId;
  scheduledMatchAt?: Date;
  isProcessed?: boolean;
  createdAt: Date;
}

const LikeSchema = new Schema<ILikeDocument>(
  {
    fromUser: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    toUser: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    scheduledMatchAt: { type: Date, index: true },
    isProcessed: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// DB-level unique compound index to strictly prevent duplicate likes
LikeSchema.index({ fromUser: 1, toUser: 1 }, { unique: true });

export const Like: Model<ILikeDocument> =
  mongoose.models.Like || mongoose.model<ILikeDocument>('Like', LikeSchema);

export default Like;
