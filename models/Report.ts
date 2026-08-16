import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReportDocument extends Document {
  reporterId: mongoose.Types.ObjectId;
  reportedUserId: mongoose.Types.ObjectId;
  reason: string;
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: Date;
}

const ReportSchema = new Schema<IReportDocument>(
  {
    reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reportedUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reason: {
      type: String,
      enum: ['inappropriate_photos', 'spam', 'harassment', 'underage', 'fake_profile', 'other'],
      required: true,
    },
    description: { type: String },
    status: {
      type: String,
      enum: ['pending', 'reviewing', 'reviewed', 'resolved', 'dismissed'],
      default: 'pending',
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

export const Report: Model<IReportDocument> =
  mongoose.models.Report || mongoose.model<IReportDocument>('Report', ReportSchema);

export default Report;
