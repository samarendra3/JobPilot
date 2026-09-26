import {
  Schema,
  models,
  model,
  type Document,
  type Types,
} from "mongoose";

export interface AIAnalysisDocument extends Document {
  userId: Types.ObjectId;
  applicationId: Types.ObjectId;

  matchScore: number;

  strengths: string[];
  gaps: string[];
  suggestions: string[];

  matchedSkills: string[];
  missingSkills: string[];

  resumeKeywords: string[];
  interviewQuestions: string[];

  summary: string;

  provider: "gemini" | "openai" | "groq";

  createdAt: Date;
  updatedAt: Date;
}

const AIAnalysisSchema =
  new Schema<AIAnalysisDocument>(
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      applicationId: {
        type: Schema.Types.ObjectId,
        ref: "Application",
        required: true,
        index: true,
      },

      matchScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },

      strengths: {
        type: [String],
        default: [],
      },

      gaps: {
        type: [String],
        default: [],
      },

      suggestions: {
        type: [String],
        default: [],
      },

      matchedSkills: {
        type: [String],
        default: [],
      },

      missingSkills: {
        type: [String],
        default: [],
      },

      resumeKeywords: {
        type: [String],
        default: [],
      },

      interviewQuestions: {
        type: [String],
        default: [],
      },

      summary: {
        type: String,
        required: true,
      },

      provider: {
        type: String,
        enum: ["gemini", "openai", "groq"],
        required: true,
      },
    },
    {
      timestamps: true,
    }
  );

AIAnalysisSchema.index({
  userId: 1,
  applicationId: 1,
  createdAt: -1,
});

export default
  models.AIAnalysis ||
  model<AIAnalysisDocument>(
    "AIAnalysis",
    AIAnalysisSchema
  );