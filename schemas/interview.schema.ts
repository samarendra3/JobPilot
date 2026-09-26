import { z } from "zod";
import mongoose from "mongoose";
import { INTERVIEW_TYPES } from "@/constants/interview-types";

const SORTABLE_FIELDS = ["scheduledAt", "createdAt", "updatedAt", "interviewer", "type"] as const;
const SORT_ORDERS = ["asc", "desc"] as const;

const objectIdSchema = z.string().refine((value) => mongoose.isValidObjectId(value), {
  message: "Invalid application ID",
});

export const interviewSchema = z.object({
  applicationId: objectIdSchema,
  type: z.enum(INTERVIEW_TYPES),
  scheduledAt: z.string().refine((value) => !Number.isNaN(Date.parse(value)), "Enter a valid date and time"),
  meetingUrl: z.string().trim().url("Enter a valid URL").max(2000).optional().or(z.literal("")),
  interviewer: z.string().trim().max(200).optional().or(z.literal("")),
  notes: z.string().trim().max(5000).optional().or(z.literal("")),
});

export const updateInterviewSchema = interviewSchema.partial();

export type InterviewInput = z.infer<typeof interviewSchema>;
export type UpdateInterviewInput = z.infer<typeof updateInterviewSchema>;

export const interviewListQuerySchema = z
  .object({
    search: z.string().trim().max(200).optional(),
    type: z.enum(INTERVIEW_TYPES).optional(),
    applicationId: objectIdSchema.optional(),
    from: z
      .string()
      .refine((value) => !Number.isNaN(Date.parse(value)), "Enter a valid from date")
      .optional(),
    to: z
      .string()
      .refine((value) => !Number.isNaN(Date.parse(value)), "Enter a valid to date")
      .optional(),
    sort: z.enum(SORTABLE_FIELDS).default("scheduledAt"),
    order: z.enum(SORT_ORDERS).default("asc"),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
  })
  .refine((data) => !data.from || !data.to || Date.parse(data.from) <= Date.parse(data.to), {
    message: "'from' date must be before or equal to 'to' date",
    path: ["from"],
  });

export type InterviewListQuery = z.infer<typeof interviewListQuerySchema>;
