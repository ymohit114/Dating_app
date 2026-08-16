import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IConversationDocument extends Document {
  matchId?: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  lastMessage?: mongoose.Types.ObjectId;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversationDocument>(
  {
    matchId: { type: Schema.Types.ObjectId, ref: 'Match', sparse: true },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
  },
  { timestamps: true }
);

export const Conversation: Model<IConversationDocument> =
  mongoose.models.Conversation || mongoose.model<IConversationDocument>('Conversation', ConversationSchema);

export default Conversation;
