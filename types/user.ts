export interface ExperienceEntry {
  title: string;
  company: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface EducationEntry {
  institution: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
}

export interface User {
  _id: string;

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

  resume?: ResumeMetadata | null;

  skills: string[];

  experience: ExperienceEntry[];

  education: EducationEntry[];

  createdAt: string;

  updatedAt: string;
}

export interface ResumeMetadata {
  fileName: string;

  contentType: string;

  size: number;

  updatedAt: string;
}

export type PublicUser =
  Omit<User, "passwordHash">;