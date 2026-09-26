import type { ApplicationStatus } from "@/constants/application-status";
import type { InterviewType } from "@/constants/interview-types";

export interface ApplicationStats {
  total: number;
  saved: number;
  applied: number;
  screening: number;
  interview: number;
  offer: number;
  rejected: number;
  withdrawn: number;
}

export interface InterviewStats {
  total: number;
  upcoming: number;
  past: number;
}

export interface RecentApplication {
  _id: string;
  company: string;
  jobTitle: string;
  status: ApplicationStatus;
  appliedAt?: string;
  createdAt: string;
}

export interface UpcomingInterview {
  _id: string;
  applicationId: string;
  company: string;
  jobTitle: string;
  type: InterviewType;
  scheduledAt: string;
  interviewer?: string;
  meetingUrl?: string;
}

export interface StatusDistributionEntry {
  status: ApplicationStatus;
  count: number;
}

export interface TrendPoint {
  date: string;
  count: number;
}

export interface DashboardData {
  stats: {
    totalApplications: number;
    saved: number;
    applied: number;
    screening: number;
    interview: number;
    offer: number;
    rejected: number;
    withdrawn: number;
    totalInterviews: number;
    upcomingInterviews: number;
    pastInterviews: number;
  };
  recentApplications: RecentApplication[];
  upcomingInterviews: UpcomingInterview[];
  statusDistribution: StatusDistributionEntry[];
  applicationTrend: TrendPoint[];
  interviewTrend: TrendPoint[];
}
