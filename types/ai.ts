export interface AIAnalysis {
  _id: string;
  userId: string;
  applicationId: string;

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

  createdAt: string;
  updatedAt: string;
}

export interface JobAnalysisRequest {
  applicationId: string;
  jobDescription: string;
  resumeText?: string;
}

export interface JobAnalysisResult {
  matchScore: number;

  strengths: string[];
  gaps: string[];
  suggestions: string[];

  matchedSkills: string[];
  missingSkills: string[];

  resumeKeywords: string[];
  interviewQuestions: string[];

  summary: string;
}