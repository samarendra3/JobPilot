import { z } from "zod";

const optionalUrl =
  z
    .string()
    .trim()
    .url()
    .max(500)
    .optional()
    .or(z.literal(""));

const experienceEntrySchema =
  z.object({
    title: z
      .string()
      .trim()
      .min(1)
      .max(120),

    company: z
      .string()
      .trim()
      .min(1)
      .max(120),

    startDate: z
      .string()
      .trim()
      .max(20)
      .optional()
      .or(z.literal("")),

    endDate: z
      .string()
      .trim()
      .max(20)
      .optional()
      .or(z.literal("")),

    description: z
      .string()
      .trim()
      .max(2000)
      .optional()
      .or(z.literal("")),
  });

const educationEntrySchema =
  z.object({
    institution: z
      .string()
      .trim()
      .min(1)
      .max(160),

    degree: z
      .string()
      .trim()
      .max(120)
      .optional()
      .or(z.literal("")),

    fieldOfStudy: z
      .string()
      .trim()
      .max(120)
      .optional()
      .or(z.literal("")),

    startDate: z
      .string()
      .trim()
      .max(20)
      .optional()
      .or(z.literal("")),

    endDate: z
      .string()
      .trim()
      .max(20)
      .optional()
      .or(z.literal("")),
  });

export const updateProfileSchema =
  z.object({
    name: z
      .string()
      .trim()
      .min(2)
      .max(100),

    headline: z
      .string()
      .trim()
      .max(160)
      .optional()
      .or(z.literal("")),

    phone: z
      .string()
      .trim()
      .max(30)
      .optional()
      .or(z.literal("")),

    location: z
      .string()
      .trim()
      .max(160)
      .optional()
      .or(z.literal("")),

    image: optionalUrl,

    linkedinUrl: optionalUrl,

    githubUrl: optionalUrl,

    portfolioUrl: optionalUrl,

    skills: z
      .array(
        z
          .string()
          .trim()
          .min(1)
          .max(80)
      )
      .max(50),

    experience:
      z.array(
        experienceEntrySchema
      ).max(20),

    education:
      z.array(
        educationEntrySchema
      ).max(20),

    resumeText: z
      .string()
      .trim()
      .max(30000)
      .optional()
      .or(z.literal("")),
  });

export type UpdateProfileInput =
  z.infer<
    typeof updateProfileSchema
  >;