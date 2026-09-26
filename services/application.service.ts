import mongoose, { type FilterQuery, type SortOrder } from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import { toSafeSearchRegex } from "@/lib/search";
import Application, { type ApplicationDocument } from "@/models/Application";
import type { ApplicationInput, ApplicationListQuery, UpdateApplicationInput } from "@/schemas/application.schema";
import type { Application as ApplicationDTO, ApplicationListResponse } from "@/types/application";

function toApplicationDTO(doc: ApplicationDocument): ApplicationDTO {
  return {
    _id: String(doc._id),
    userId: String(doc.userId),
    company: doc.company,
    jobTitle: doc.jobTitle,
    status: doc.status,
    jobType: doc.jobType,
    workMode: doc.workMode,
    jobUrl: doc.jobUrl,
    description: doc.description,
    location: doc.location,
    salary: doc.salary,
    notes: doc.notes,
    appliedAt: doc.appliedAt ? doc.appliedAt.toISOString() : undefined,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
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

export async function listApplications(
  userId: string,
  query: ApplicationListQuery
): Promise<ApplicationListResponse> {
  await connectToDatabase();

  const filter: FilterQuery<ApplicationDocument> = { userId };

  if (query.status) filter.status = query.status;
  if (query.jobType) filter.jobType = query.jobType;
  if (query.workMode) filter.workMode = query.workMode;

  if (query.search) {
    const pattern = toSafeSearchRegex(query.search);
    filter.$or = [{ company: pattern }, { jobTitle: pattern }, { location: pattern }];
  }

  const sortSpec: Record<string, SortOrder> = { [query.sort]: query.order === "asc" ? 1 : -1 };
  const skip = (query.page - 1) * query.limit;

  const [docs, total] = await Promise.all([
    Application.find(filter).sort(sortSpec).skip(skip).limit(query.limit),
    Application.countDocuments(filter),
  ]);

  const totalPages = Math.max(Math.ceil(total / query.limit), 1);

  return {
    applications: docs.map(toApplicationDTO),
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

export async function getApplicationById(
  applicationId: string,
  userId: string
): Promise<ApplicationDTO | null> {
  if (!isValidObjectId(applicationId)) return null;

  await connectToDatabase();
  const doc = await Application.findOne({ _id: applicationId, userId });
  return doc ? toApplicationDTO(doc) : null;
}

export async function createApplication(
  userId: string,
  data: ApplicationInput
): Promise<ApplicationDTO> {
  await connectToDatabase();

  const payload = cleanInput(data);
  const doc = await Application.create({
    ...payload,
    appliedAt: payload.appliedAt ? new Date(payload.appliedAt as string) : undefined,
    userId,
  });

  return toApplicationDTO(doc);
}

export async function updateApplication(
  applicationId: string,
  userId: string,
  data: UpdateApplicationInput
): Promise<ApplicationDTO | null> {
  if (!isValidObjectId(applicationId)) return null;

  await connectToDatabase();

  const payload = cleanInput(data);
  const update: Record<string, unknown> = { ...payload };
  if (payload.appliedAt) {
    update.appliedAt = new Date(payload.appliedAt as string);
  }

  const doc = await Application.findOneAndUpdate(
    { _id: applicationId, userId },
    { $set: update },
    { new: true, runValidators: true }
  );

  return doc ? toApplicationDTO(doc) : null;
}

export async function deleteApplication(applicationId: string, userId: string): Promise<boolean> {
  if (!isValidObjectId(applicationId)) return false;

  await connectToDatabase();
  const result = await Application.findOneAndDelete({ _id: applicationId, userId });
  return Boolean(result);
}
