import type { ApplicationStatus } from "@/constants/application-status";
import type { JobType } from "@/constants/job-type";
import type { WorkMode } from "@/constants/work-mode";

export interface Application {
  _id: string;
  userId: string;
  company: string;
  jobTitle: string;
  status: ApplicationStatus;
  jobType?: JobType;
  workMode?: WorkMode;
  jobUrl?: string;
  description?: string;
  location?: string;
  salary?: string;
  notes?: string;
  appliedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApplicationListResponse {
  applications: Application[];
  pagination: PaginationMeta;
}
