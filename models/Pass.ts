import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPassDocument extends Document {
  fromUser: mongoose.Types.ObjectId;
  toUser: mongoose.Types.ObjectId;
  createdAt: Date;
}

const PassSchema = new Schema<IPassDocument>(
  {
    fromUser: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    toUser: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

PassSchema.index({ fromUser: 1, toUser: 1 }, { unique: true });

export const Pass: Model<IPassDocument> =
  mongoose.models.Pass || mongoose.model<IPassDocument>('Pass', PassSchema);

export default Pass;
