import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import Application from "@/models/Application";
import Interview from "@/models/Interview";
import { APPLICATION_STATUSES } from "@/constants/application-status";
import type {
  ApplicationStats,
  InterviewStats,
  RecentApplication,
  UpcomingInterview,
  StatusDistributionEntry,
  TrendPoint,
  DashboardData,
} from "@/types/dashboard";

const TREND_MONTHS = 6;
const RECENT_APPLICATIONS_LIMIT = 5;
const UPCOMING_INTERVIEWS_LIMIT = 5;

function toObjectId(userId: string) {
  return new mongoose.Types.ObjectId(userId);
}

function trendStartDate(months: number): Date {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
  return start;
}

function monthBuckets(months: number): string[] {
  const now = new Date();
  const buckets: string[] = [];
  for (let i = months - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return buckets;
}

function fillTrend(buckets: string[], counts: Map<string, number>): TrendPoint[] {
  return buckets.map((date) => ({ date, count: counts.get(date) ?? 0 }));
}

export async function getApplicationStats(userId: string): Promise<ApplicationStats> {
  await connectToDatabase();

  const results = await Application.aggregate<{ _id: string; count: number }>([
    { $match: { userId: toObjectId(userId) } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const countByStatus = new Map(results.map((r) => [r._id, r.count]));
  const total = results.reduce((sum, r) => sum + r.count, 0);

  return {
    total,
    saved: countByStatus.get("SAVED") ?? 0,
    applied: countByStatus.get("APPLIED") ?? 0,
    screening: countByStatus.get("SCREENING") ?? 0,
    interview: countByStatus.get("INTERVIEW") ?? 0,
    offer: countByStatus.get("OFFER") ?? 0,
    rejected: countByStatus.get("REJECTED") ?? 0,
    withdrawn: countByStatus.get("WITHDRAWN") ?? 0,
  };
}

export async function getInterviewStats(userId: string): Promise<InterviewStats> {
  await connectToDatabase();

  const now = new Date();
  const [total, upcoming] = await Promise.all([
    Interview.countDocuments({ userId }),
    Interview.countDocuments({ userId, scheduledAt: { $gte: now } }),
  ]);

  return { total, upcoming, past: total - upcoming };
}

export async function getApplicationStatusDistribution(userId: string): Promise<StatusDistributionEntry[]> {
  await connectToDatabase();

  const results = await Application.aggregate<{ _id: string; count: number }>([
    { $match: { userId: toObjectId(userId) } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const countByStatus = new Map(results.map((r) => [r._id, r.count]));

  return APPLICATION_STATUSES.map((status) => ({
    status,
    count: countByStatus.get(status) ?? 0,
  }));
}

export async function getRecentApplications(userId: string): Promise<RecentApplication[]> {
  await connectToDatabase();

  const docs = await Application.find({ userId })
    .sort({ createdAt: -1 })
    .limit(RECENT_APPLICATIONS_LIMIT)
    .select("company jobTitle status appliedAt createdAt");

  return docs.map((doc) => ({
    _id: String(doc._id),
    company: doc.company,
    jobTitle: doc.jobTitle,
    status: doc.status,
    appliedAt: doc.appliedAt ? doc.appliedAt.toISOString() : undefined,
    createdAt: doc.createdAt.toISOString(),
  }));
}

export async function getUpcomingInterviews(userId: string): Promise<UpcomingInterview[]> {
  await connectToDatabase();

  const docs = await Interview.find({ userId, scheduledAt: { $gte: new Date() } })
    .sort({ scheduledAt: 1 })
    .limit(UPCOMING_INTERVIEWS_LIMIT)
    .select("applicationId type scheduledAt interviewer meetingUrl")
    .populate("applicationId", "company jobTitle");

  const entries: UpcomingInterview[] = [];

  for (const doc of docs) {
    const application = doc.applicationId as unknown as
      | { _id: unknown; company: string; jobTitle: string }
      | null;

    if (!application || typeof application !== "object" || !("company" in application)) {
      continue;
    }

    entries.push({
      _id: String(doc._id),
      applicationId: String(application._id),
      company: application.company,
      jobTitle: application.jobTitle,
      type: doc.type,
      scheduledAt: doc.scheduledAt.toISOString(),
      interviewer: doc.interviewer,
      meetingUrl: doc.meetingUrl,
    });
  }

  return entries;
}

export async function getApplicationTrend(userId: string): Promise<TrendPoint[]> {
  await connectToDatabase();

  const start = trendStartDate(TREND_MONTHS);
  const results = await Application.aggregate<{ _id: string; count: number }>([
    { $match: { userId: toObjectId(userId), createdAt: { $gte: start } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
  ]);

  const counts = new Map(results.map((r) => [r._id, r.count]));
  return fillTrend(monthBuckets(TREND_MONTHS), counts);
}

export async function getInterviewTrend(userId: string): Promise<TrendPoint[]> {
  await connectToDatabase();

  const start = trendStartDate(TREND_MONTHS);
  const results = await Interview.aggregate<{ _id: string; count: number }>([
    { $match: { userId: toObjectId(userId), scheduledAt: { $gte: start } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$scheduledAt" } },
        count: { $sum: 1 },
      },
    },
  ]);

  const counts = new Map(results.map((r) => [r._id, r.count]));
  return fillTrend(monthBuckets(TREND_MONTHS), counts);
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const [applicationStats, interviewStats, recentApplications, upcomingInterviews, statusDistribution, applicationTrend, interviewTrend] =
    await Promise.all([
      getApplicationStats(userId),
      getInterviewStats(userId),
      getRecentApplications(userId),
      getUpcomingInterviews(userId),
      getApplicationStatusDistribution(userId),
      getApplicationTrend(userId),
      getInterviewTrend(userId),
    ]);

  return {
    stats: {
      totalApplications: applicationStats.total,
      saved: applicationStats.saved,
      applied: applicationStats.applied,
      screening: applicationStats.screening,
      interview: applicationStats.interview,
      offer: applicationStats.offer,
      rejected: applicationStats.rejected,
      withdrawn: applicationStats.withdrawn,
      totalInterviews: interviewStats.total,
      upcomingInterviews: interviewStats.upcoming,
      pastInterviews: interviewStats.past,
    },
    recentApplications,
    upcomingInterviews,
    statusDistribution,
    applicationTrend,
    interviewTrend,
  };
}
