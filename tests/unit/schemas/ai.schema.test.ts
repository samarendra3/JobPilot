import { describe, it, expect } from "vitest";
import { jobAnalysisSchema, aiAnalysisQuerySchema } from "@/schemas/ai.schema";

const validApplicationId = "507f1f77bcf86cd799439011";

describe("jobAnalysisSchema", () => {
  const validDescription = "a".repeat(60);

  it("accepts valid input", () => {
    expect(
      jobAnalysisSchema.safeParse({
        applicationId: validApplicationId,
        jobDescription: validDescription,
      }).success
    ).toBe(true);
  });

  it("rejects an invalid applicationId", () => {
    expect(
      jobAnalysisSchema.safeParse({
        applicationId: "not-valid",
        jobDescription: validDescription,
      }).success
    ).toBe(false);
  });

  it("rejects a job description shorter than 50 characters", () => {
    expect(
      jobAnalysisSchema.safeParse({
        applicationId: validApplicationId,
        jobDescription: "too short",
      }).success
    ).toBe(false);
  });

  it("rejects a job description over 20000 characters", () => {
    expect(
      jobAnalysisSchema.safeParse({
        applicationId: validApplicationId,
        jobDescription: "a".repeat(20001),
      }).success
    ).toBe(false);
  });

  it("rejects resumeText over 20000 characters", () => {
    expect(
      jobAnalysisSchema.safeParse({
        applicationId: validApplicationId,
        jobDescription: validDescription,
        resumeText: "a".repeat(20001),
      }).success
    ).toBe(false);
  });

  it("rejects a missing jobDescription", () => {
    expect(jobAnalysisSchema.safeParse({ applicationId: validApplicationId }).success).toBe(false);
  });
});

describe("aiAnalysisQuerySchema", () => {
  it("accepts a valid ObjectId", () => {
    expect(aiAnalysisQuerySchema.safeParse({ applicationId: validApplicationId }).success).toBe(
      true
    );
  });

  it("rejects an invalid ObjectId, e.g. a Mongo operator payload", () => {
    expect(
      aiAnalysisQuerySchema.safeParse({ applicationId: { $ne: null } }).success
    ).toBe(false);
  });
});
