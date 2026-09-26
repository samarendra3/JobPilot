import type {
  PublicUser,
  ResumeMetadata,
} from "@/types/user";

import connectToDatabase
  from "@/lib/mongodb";

import Resume
  from "@/models/Resume";

export async function getResumeMetadata(
  userId: string
): Promise<ResumeMetadata | null> {
  await connectToDatabase();

  const resumeDoc =
    await Resume.findOne({
      userId,
    })
      .select(
        "fileName contentType size updatedAt"
      )
      .lean();

  if (!resumeDoc) {
    return null;
  }

  const doc = resumeDoc as unknown as {
    fileName: string;
    contentType: string;
    size: number;
    updatedAt: Date;
  };

  return {
    fileName: doc.fileName,
    contentType: doc.contentType,
    size: doc.size,
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export function toPublicProfile(
  userDoc: {
    _id: unknown;

    name: string;

    email: string;

    image?: string;

    headline?: string;

    phone?: string;

    location?: string;

    linkedinUrl?: string;

    githubUrl?: string;

    portfolioUrl?: string;

    resumeText?: string;

    skills: string[];

    experience: unknown[];

    education: unknown[];

    createdAt: Date;

    updatedAt: Date;
  },

  resume?: ResumeMetadata | null
): PublicUser {
  return {
    _id: String(
      userDoc._id
    ),

    name: userDoc.name,

    email: userDoc.email,

    image: userDoc.image,

    headline:
      userDoc.headline,

    phone:
      userDoc.phone,

    location:
      userDoc.location,

    linkedinUrl:
      userDoc.linkedinUrl,

    githubUrl:
      userDoc.githubUrl,

    portfolioUrl:
      userDoc.portfolioUrl,

    resumeText:
      userDoc.resumeText,

    resume:
      resume ?? null,

    skills:
      userDoc.skills,

    experience:
      userDoc.experience as PublicUser["experience"],

    education:
      userDoc.education as PublicUser["education"],

    createdAt:
      userDoc.createdAt.toISOString(),

    updatedAt:
      userDoc.updatedAt.toISOString(),
  };
}