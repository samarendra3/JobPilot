import type { InterviewType } from "@/constants/interview-types";

export interface Interview {
  _id: string;
  userId: string;
  applicationId: string;
  type: InterviewType;
  scheduledAt: string;
  meetingUrl?: string;
  interviewer?: string;
  location?: string;
  notes?: string;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewWithApplication extends Interview {
  application: {
    _id: string;
    company: string;
    jobTitle: string;
  } | null;
}

export interface InterviewPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface InterviewListResponse {
  interviews: InterviewWithApplication[];
  pagination: InterviewPaginationMeta;
}
