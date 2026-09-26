import mongoose from "mongoose";

import connectToDatabase from "@/lib/mongodb";

import Application from "@/models/Application";
import AIAnalysis from "@/models/AIAnalysis";
import User from "@/models/User";

import { analyzeJobWithAI } from "@/lib/ai";

import type {
  AIAnalysis as AIAnalysisType,
  JobAnalysisResult,
} from "@/types/ai";

export class ApplicationForAIAnalysisNotFoundError
  extends Error {}

function isValidObjectId(value: string): boolean {
  return mongoose.isValidObjectId(value);
}

function toDTO(
  doc: AIAnalysisType & { _id: unknown }
): AIAnalysisType {
  return {
    ...doc,

    _id: String(doc._id),
    userId: String(doc.userId),
    applicationId: String(doc.applicationId),

    createdAt: new Date(
      doc.createdAt
    ).toISOString(),

    updatedAt: new Date(
      doc.updatedAt
    ).toISOString(),
  };
}

export async function getLatestAIAnalysis(
  userId: string,
  applicationId: string
): Promise<AIAnalysisType | null> {
  if (!isValidObjectId(applicationId)) {
    return null;
  }

  await connectToDatabase();

  const doc = await AIAnalysis.findOne({
    userId: new mongoose.Types.ObjectId(userId),
    applicationId: new mongoose.Types.ObjectId(
      applicationId
    ),
  })
    .sort({
      createdAt: -1,
    })
    .lean();

  return doc
    ? toDTO(doc as never)
    : null;
}

function buildExperienceText(user: {
  experience: Array<{
    title: string;
    company: string;
    description?: string;
  }>;
}): string {
  return user.experience
    .map((entry) =>
      [
        entry.title,
        entry.company,
        entry.description,
      ]
        .filter(Boolean)
        .join(" — ")
    )
    .join("\n");
}

export async function createAIAnalysis(input: {
  userId: string;
  applicationId: string;
  jobDescription: string;
  resumeText?: string;
}): Promise<AIAnalysisType> {
  if (!isValidObjectId(input.applicationId)) {
    throw new ApplicationForAIAnalysisNotFoundError();
  }

  await connectToDatabase();

  const userObjectId =
    new mongoose.Types.ObjectId(input.userId);

  const applicationObjectId =
    new mongoose.Types.ObjectId(
      input.applicationId
    );

  const [application, user] =
    await Promise.all([
      Application.findOne({
        _id: applicationObjectId,
        userId: userObjectId,
      })
        .select("company jobTitle")
        .lean(),

      User.findById(userObjectId)
        .select("skills experience resumeText")
        .lean(),
    ]);

  if (!application || !user) {
    throw new ApplicationForAIAnalysisNotFoundError();
  }

  const profile = user as unknown as {
    skills: string[];
    experience: Array<{
      title: string;
      company: string;
      description?: string;
    }>;
    resumeText?: string;
  };

  const resumeText =
    input.resumeText?.trim() ||
    profile.resumeText?.trim() ||
    undefined;

  const result: JobAnalysisResult =
    await analyzeJobWithAI({
      jobDescription: input.jobDescription,

      profileSkills:
        profile.skills || [],

      profileExperience:
        buildExperienceText(profile),

      resumeText,
    });

  const doc = await AIAnalysis.create({
    userId: userObjectId,

    applicationId:
      applicationObjectId,

    matchScore:
      result.matchScore,

    strengths:
      result.strengths,

    gaps:
      result.gaps,

    suggestions:
      result.suggestions,

    matchedSkills:
      result.matchedSkills,

    missingSkills:
      result.missingSkills,

    resumeKeywords:
      result.resumeKeywords,

    interviewQuestions:
      result.interviewQuestions,

    summary:
      result.summary,

    provider: "groq",
  });

  return toDTO(
    doc.toObject() as never
  );
}
