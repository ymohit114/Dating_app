import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAdminLogDocument extends Document {
  adminId: mongoose.Types.ObjectId;
  adminEmail?: string;
  action:
    | 'admin_login'
    | 'user_suspended'
    | 'user_banned'
    | 'user_reactivated'
    | 'user_verified'
    | 'profile_approved'
    | 'profile_rejected'
    | 'photo_approved'
    | 'photo_rejected'
    | 'photo_removed'
    | 'report_resolved'
    | 'report_dismissed'
    | 'report_reviewing'
    | 'admin_created'
    | 'role_changed'
    | 'admin_disabled'
    | 'notification_sent'
    | 'settings_updated'
    | 'moderation_view_messages';
  targetType?: 'user' | 'profile' | 'photo' | 'report' | 'block' | 'match' | 'conversation' | 'subscription' | 'admin';
  targetId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  details?: string;
  createdAt: Date;
}

const AdminLogSchema = new Schema<IAdminLogDocument>(
  {
    adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    adminEmail: { type: String, trim: true },
    action: {
      type: String,
      required: true,
      index: true,
    },
    targetType: {
      type: String,
      enum: ['user', 'profile', 'photo', 'report', 'block', 'match', 'conversation', 'subscription', 'admin'],
      index: true,
    },
    targetId: { type: String, index: true },
    metadata: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },
    details: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AdminLogSchema.index({ createdAt: -1 });

export const AdminLog: Model<IAdminLogDocument> =
  mongoose.models.AdminLog || mongoose.model<IAdminLogDocument>('AdminLog', AdminLogSchema);

export default AdminLog;
