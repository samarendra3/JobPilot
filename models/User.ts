import {
  Schema,
  models,
  model,
  type Document,
} from "mongoose";

export interface ExperienceEntry {
  title: string;
  company: string;
  startDate?: Date;
  endDate?: Date;
  description?: string;
}

export interface EducationEntry {
  institution: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface UserDocument extends Document {
  name: string;
  email: string;
  passwordHash: string;

  image?: string;
  headline?: string;
  phone?: string;
  location?: string;

  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;

  resumeText?: string;

  skills: string[];

  experience: ExperienceEntry[];

  education: EducationEntry[];

  createdAt: Date;
  updatedAt: Date;
}

const ExperienceSchema =
  new Schema<ExperienceEntry>(
    {
      title: {
        type: String,
        required: true,
        trim: true,
      },

      company: {
        type: String,
        required: true,
        trim: true,
      },

      startDate: {
        type: Date,
      },

      endDate: {
        type: Date,
      },

      description: {
        type: String,
        trim: true,
      },
    },
    {
      _id: false,
    }
  );

const EducationSchema =
  new Schema<EducationEntry>(
    {
      institution: {
        type: String,
        required: true,
        trim: true,
      },

      degree: {
        type: String,
        trim: true,
      },

      fieldOfStudy: {
        type: String,
        trim: true,
      },

      startDate: {
        type: Date,
      },

      endDate: {
        type: Date,
      },
    },
    {
      _id: false,
    }
  );

const UserSchema =
  new Schema<UserDocument>(
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
      },

      passwordHash: {
        type: String,
        required: true,
      },

      image: {
        type: String,
        trim: true,
      },

      headline: {
        type: String,
        trim: true,
        maxlength: 160,
      },

      phone: {
        type: String,
        trim: true,
        maxlength: 30,
      },

      location: {
        type: String,
        trim: true,
        maxlength: 160,
      },

      linkedinUrl: {
        type: String,
        trim: true,
        maxlength: 500,
      },

      githubUrl: {
        type: String,
        trim: true,
        maxlength: 500,
      },

      portfolioUrl: {
        type: String,
        trim: true,
        maxlength: 500,
      },

      resumeText: {
        type: String,
        trim: true,
        maxlength: 30000,
      },

      skills: {
        type: [String],
        default: [],
      },

      experience: {
        type: [ExperienceSchema],
        default: [],
      },

      education: {
        type: [EducationSchema],
        default: [],
      },
    },

    {
      timestamps: true,
    }
  );

export default
  models.User ||
  model<UserDocument>(
    "User",
    UserSchema
  );