import { Schema, models, model, type Document, type Types } from "mongoose";
import { APPLICATION_STATUSES, type ApplicationStatus } from "@/constants/application-status";
import { JOB_TYPES, type JobType } from "@/constants/job-type";
import { WORK_MODES, type WorkMode } from "@/constants/work-mode";

export interface ApplicationDocument extends Document {
  userId: Types.ObjectId;
  company: string;
  jobTitle: string;
  status: ApplicationStatus;
  jobType?: JobType;
  workMode?: WorkMode;
  jobUrl?: string;
  description?: string;
  location?: string;
  salary?: string;
  notes?: string;
  appliedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<ApplicationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    company: { type: String, required: true, trim: true },
    jobTitle: { type: String, required: true, trim: true },
    status: { type: String, enum: APPLICATION_STATUSES, default: "SAVED" },
    jobType: { type: String, enum: JOB_TYPES },
    workMode: { type: String, enum: WORK_MODES },
    jobUrl: { type: String },
    description: { type: String },
    location: { type: String },
    salary: { type: String },
    notes: { type: String },
    appliedAt: { type: Date },
  },
  { timestamps: true }
);

ApplicationSchema.index({ userId: 1, createdAt: -1 });

export default models.Application || model<ApplicationDocument>("Application", ApplicationSchema);
