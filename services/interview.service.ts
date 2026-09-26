import mongoose, { type FilterQuery, type SortOrder } from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import { toSafeSearchRegex } from "@/lib/search";
import Interview, { type InterviewDocument } from "@/models/Interview";
import { getApplicationById } from "@/services/application.service";
import type { InterviewInput, InterviewListQuery, UpdateInterviewInput } from "@/schemas/interview.schema";
import type { Interview as InterviewDTO, InterviewWithApplication, InterviewListResponse } from "@/types/interview";

interface PopulatedApplication {
  _id: unknown;
  company: string;
  jobTitle: string;
}

function isPopulatedApplication(value: unknown): value is PopulatedApplication {
  return typeof value === "object" && value !== null && "company" in value;
}

function toInterviewDTO(doc: InterviewDocument): InterviewDTO {
  const applicationIdValue = doc.applicationId as unknown;
  const applicationId = isPopulatedApplication(applicationIdValue)
    ? String(applicationIdValue._id)
    : String(applicationIdValue);

  return {
    _id: String(doc._id),
    userId: String(doc.userId),
    applicationId,
    type: doc.type,
    scheduledAt: doc.scheduledAt.toISOString(),
    meetingUrl: doc.meetingUrl,
    interviewer: doc.interviewer,
    location: doc.location,
    notes: doc.notes,
    feedback: doc.feedback,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

function toInterviewWithApplicationDTO(doc: InterviewDocument): InterviewWithApplication {
  const base = toInterviewDTO(doc);
  const populated = doc.applicationId as unknown;

  return {
    ...base,
    application: isPopulatedApplication(populated)
      ? { _id: String(populated._id), company: populated.company, jobTitle: populated.jobTitle }
      : null,
  };
}

function cleanInput<T extends Record<string, unknown>>(data: T): Partial<T> {
  const result: Partial<T> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === "" || value === undefined) continue;
    (result as Record<string, unknown>)[key] = value;
  }
  return result;
}

export function isValidObjectId(id: string): boolean {
  return mongoose.isValidObjectId(id);
}

export async function verifyUserApplication(applicationId: string, userId: string): Promise<boolean> {
  const application = await getApplicationById(applicationId, userId);
  return Boolean(application);
}

export async function listInterviews(
  userId: string,
  query: InterviewListQuery
): Promise<InterviewListResponse> {
  await connectToDatabase();

  const filter: FilterQuery<InterviewDocument> = { userId };

  if (query.type) filter.type = query.type;
  if (query.applicationId) filter.applicationId = query.applicationId;

  if (query.from || query.to) {
    filter.scheduledAt = {};
    if (query.from) filter.scheduledAt.$gte = new Date(query.from);
    if (query.to) filter.scheduledAt.$lte = new Date(query.to);
  }

  if (query.search) {
    const pattern = toSafeSearchRegex(query.search);
    filter.$or = [{ interviewer: pattern }, { notes: pattern }];
  }

  const sortSpec: Record<string, SortOrder> = { [query.sort]: query.order === "asc" ? 1 : -1 };
  const skip = (query.page - 1) * query.limit;

  const [docs, total] = await Promise.all([
    Interview.find(filter)
      .sort(sortSpec)
      .skip(skip)
      .limit(query.limit)
      .populate("applicationId", "company jobTitle"),
    Interview.countDocuments(filter),
  ]);

  const totalPages = Math.max(Math.ceil(total / query.limit), 1);

  return {
    interviews: docs.map(toInterviewWithApplicationDTO),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages,
      hasNextPage: query.page < totalPages,
      hasPreviousPage: query.page > 1,
    },
  };
}

export async function getInterviewById(
  interviewId: string,
  userId: string
): Promise<InterviewWithApplication | null> {
  if (!isValidObjectId(interviewId)) return null;

  await connectToDatabase();
  const doc = await Interview.findOne({ _id: interviewId, userId }).populate(
    "applicationId",
    "company jobTitle"
  );
  return doc ? toInterviewWithApplicationDTO(doc) : null;
}

export async function createInterview(
  userId: string,
  data: InterviewInput
): Promise<InterviewDTO | "APPLICATION_NOT_FOUND"> {
  const applicationOwned = await verifyUserApplication(data.applicationId, userId);
  if (!applicationOwned) {
    return "APPLICATION_NOT_FOUND";
  }

  await connectToDatabase();

  const payload = cleanInput(data);
  const doc = await Interview.create({
    ...payload,
    scheduledAt: new Date(payload.scheduledAt as string),
    userId,
  });

  return toInterviewDTO(doc);
}

export async function updateInterview(
  interviewId: string,
  userId: string,
  data: UpdateInterviewInput
): Promise<InterviewDTO | null | "APPLICATION_NOT_FOUND"> {
  if (!isValidObjectId(interviewId)) return null;

  if (data.applicationId) {
    const applicationOwned = await verifyUserApplication(data.applicationId, userId);
    if (!applicationOwned) {
      return "APPLICATION_NOT_FOUND";
    }
  }

  await connectToDatabase();

  const payload = cleanInput(data);
  const update: Record<string, unknown> = { ...payload };
  if (payload.scheduledAt) {
    update.scheduledAt = new Date(payload.scheduledAt as string);
  }

  const doc = await Interview.findOneAndUpdate(
    { _id: interviewId, userId },
    { $set: update },
    { new: true, runValidators: true }
  );

  return doc ? toInterviewDTO(doc) : null;
}

export async function deleteInterview(interviewId: string, userId: string): Promise<boolean> {
  if (!isValidObjectId(interviewId)) return false;

  await connectToDatabase();
  const result = await Interview.findOneAndDelete({ _id: interviewId, userId });
  return Boolean(result);
}
