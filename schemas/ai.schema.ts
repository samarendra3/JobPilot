import { z } from "zod";

export const jobAnalysisSchema = z.object({
  applicationId: z
    .string()
    .regex(
      /^[a-f\d]{24}$/i,
      "Invalid application id"
    ),

  jobDescription: z
    .string()
    .trim()
    .min(
      50,
      "Job description must be at least 50 characters"
    )
    .max(20000),

  resumeText: z
    .string()
    .trim()
    .max(20000)
    .optional()
    .or(z.literal("")),
});

export const aiAnalysisQuerySchema = z.object({
  applicationId: z
    .string()
    .regex(
      /^[a-f\d]{24}$/i,
      "Invalid application id"
    ),
});

export type JobAnalysisInput =
  z.infer<typeof jobAnalysisSchema>;