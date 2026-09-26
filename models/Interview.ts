import { Schema, models, model, type Document, type Types } from "mongoose";
import { INTERVIEW_TYPES, type InterviewType } from "@/constants/interview-types";

export interface InterviewDocument extends Document {
  userId: Types.ObjectId;
  applicationId: Types.ObjectId;
  type: InterviewType;
  scheduledAt: Date;
  meetingUrl?: string;
  interviewer?: string;
  location?: string;
  notes?: string;
  feedback?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InterviewSchema = new Schema<InterviewDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    applicationId: { type: Schema.Types.ObjectId, ref: "Application", required: true, index: true },
    type: { type: String, enum: INTERVIEW_TYPES, required: true },
    scheduledAt: { type: Date, required: true },
    meetingUrl: { type: String },
    interviewer: { type: String },
    location: { type: String },
    notes: { type: String },
    feedback: { type: String },
  },
  { timestamps: true }
);

InterviewSchema.index({ userId: 1, scheduledAt: 1 });

export default models.Interview || model<InterviewDocument>("Interview", InterviewSchema);
