import { describe, it, expect } from "vitest";
import {
  interviewSchema,
  updateInterviewSchema,
  interviewListQuerySchema,
} from "@/schemas/interview.schema";

const validApplicationId = "507f1f77bcf86cd799439011";

describe("interviewSchema", () => {
  const valid = {
    applicationId: validApplicationId,
    type: "TECHNICAL" as const,
    scheduledAt: "2026-01-15T10:00:00.000Z",
  };

  it("accepts valid minimal input", () => {
    expect(interviewSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects an invalid ObjectId for applicationId", () => {
    expect(interviewSchema.safeParse({ ...valid, applicationId: "not-an-object-id" }).success).toBe(
      false
    );
  });

  it("rejects an invalid interview type", () => {
    expect(interviewSchema.safeParse({ ...valid, type: "BOGUS_TYPE" }).success).toBe(false);
  });

  it("rejects a malformed scheduledAt date", () => {
    expect(interviewSchema.safeParse({ ...valid, scheduledAt: "not-a-date" }).success).toBe(false);
  });

  it("rejects an invalid meetingUrl", () => {
    expect(interviewSchema.safeParse({ ...valid, meetingUrl: "not-a-url" }).success).toBe(false);
  });

  it("accepts an empty-string meetingUrl (optional)", () => {
    expect(interviewSchema.safeParse({ ...valid, meetingUrl: "" }).success).toBe(true);
  });

  it("rejects an oversized interviewer field", () => {
    expect(interviewSchema.safeParse({ ...valid, interviewer: "a".repeat(201) }).success).toBe(
      false
    );
  });

  it("allows a partial update schema without every field", () => {
    expect(updateInterviewSchema.safeParse({ notes: "Went well" }).success).toBe(true);
  });
});

describe("interviewListQuerySchema", () => {
  it("applies sensible defaults", () => {
    const result = interviewListQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sort).toBe("scheduledAt");
      expect(result.data.order).toBe("asc");
    }
  });

  it("rejects a from date after the to date", () => {
    const result = interviewListQuerySchema.safeParse({
      from: "2026-06-01T00:00:00.000Z",
      to: "2026-01-01T00:00:00.000Z",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a from date before the to date", () => {
    const result = interviewListQuerySchema.safeParse({
      from: "2026-01-01T00:00:00.000Z",
      to: "2026-06-01T00:00:00.000Z",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid applicationId filter", () => {
    expect(interviewListQuerySchema.safeParse({ applicationId: "bogus" }).success).toBe(false);
  });

  it("rejects an unsupported sort field", () => {
    expect(interviewListQuerySchema.safeParse({ sort: "userId" }).success).toBe(false);
  });
});
