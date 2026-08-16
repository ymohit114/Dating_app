import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMessageReactionItem {
  userId: string;
  emoji: string;
}

export interface IMessageDocument extends Document {
  matchId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  text: string;
  originalText?: string;
  mediaUrl?: string;
  type: 'text' | 'image' | 'audio' | 'system' | 'icebreaker';
  read: boolean;
  isDeleted: boolean;
  reactions: IMessageReactionItem[];
  createdAt: Date;
}

const ReactionSchema = new Schema(
  {
    userId: { type: String, required: true },
    emoji: { type: String, required: true },
  },
  { _id: false }
);

const MessageSchema = new Schema<IMessageDocument>(
  {
    matchId: { type: Schema.Types.ObjectId, ref: 'Match', required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    originalText: { type: String },
    mediaUrl: { type: String },
    type: { type: String, enum: ['text', 'image', 'audio', 'system', 'icebreaker'], default: 'text' },
    read: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    reactions: { type: [ReactionSchema], default: [] },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

MessageSchema.index({ matchId: 1, createdAt: 1 });

export const Message: Model<IMessageDocument> =
  mongoose.models.Message || mongoose.model<IMessageDocument>('Message', MessageSchema);

export default Message;
