import { z } from "zod";
import { APPLICATION_STATUSES } from "@/constants/application-status";
import { JOB_TYPES } from "@/constants/job-type";
import { WORK_MODES } from "@/constants/work-mode";

const SORTABLE_FIELDS = ["createdAt", "updatedAt", "appliedAt", "company", "jobTitle", "status"] as const;
const SORT_ORDERS = ["asc", "desc"] as const;

export const applicationSchema = z.object({
  company: z.string().trim().min(1, "Company is required").max(200),
  jobTitle: z.string().trim().min(1, "Job title is required").max(200),
  status: z.enum(APPLICATION_STATUSES).default("SAVED"),
  jobType: z.enum(JOB_TYPES).optional().or(z.literal("")),
  workMode: z.enum(WORK_MODES).optional().or(z.literal("")),
  jobUrl: z.string().trim().url("Enter a valid URL").max(2000).optional().or(z.literal("")),
  description: z.string().max(10000).optional().or(z.literal("")),
  location: z.string().trim().max(200).optional().or(z.literal("")),
  salary: z.string().trim().max(100).optional().or(z.literal("")),
  notes: z.string().max(5000).optional().or(z.literal("")),
  appliedAt: z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), "Enter a valid date")
    .optional()
    .or(z.literal("")),
});

export const updateApplicationSchema = applicationSchema.partial();

export type ApplicationInput = z.infer<typeof applicationSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;

export const applicationListQuerySchema = z.object({
  search: z.string().trim().max(200).optional(),
  status: z.enum(APPLICATION_STATUSES).optional(),
  jobType: z.enum(JOB_TYPES).optional(),
  workMode: z.enum(WORK_MODES).optional(),
  sort: z.enum(SORTABLE_FIELDS).default("createdAt"),
  order: z.enum(SORT_ORDERS).default("desc"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type ApplicationListQuery = z.infer<typeof applicationListQuerySchema>;
