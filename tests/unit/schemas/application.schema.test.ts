import { describe, it, expect } from "vitest";
import {
  applicationSchema,
  updateApplicationSchema,
  applicationListQuerySchema,
} from "@/schemas/application.schema";

describe("applicationSchema", () => {
  const valid = {
    company: "Acme Corp",
    jobTitle: "Software Engineer",
    status: "APPLIED" as const,
  };

  it("accepts valid minimal input", () => {
    expect(applicationSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects an empty company", () => {
    expect(applicationSchema.safeParse({ ...valid, company: "" }).success).toBe(false);
  });

  it("rejects an invalid status enum", () => {
    expect(applicationSchema.safeParse({ ...valid, status: "NOT_A_STATUS" }).success).toBe(false);
  });

  it("rejects an invalid jobType enum", () => {
    expect(applicationSchema.safeParse({ ...valid, jobType: "BOGUS" }).success).toBe(false);
  });

  it("rejects an invalid workMode enum", () => {
    expect(applicationSchema.safeParse({ ...valid, workMode: "BOGUS" }).success).toBe(false);
  });

  // Regression: the "Select job type" / "Select work mode" placeholder
  // options submit an empty string, not undefined. Before this schema
  // allowed "" as a valid value, every application create/update with
  // those optional dropdowns left unset failed validation client- and
  // server-side, making it impossible to save an application without
  // picking both a job type and work mode.
  it("accepts an empty-string jobType (unset dropdown placeholder)", () => {
    expect(applicationSchema.safeParse({ ...valid, jobType: "" }).success).toBe(true);
  });

  it("accepts an empty-string workMode (unset dropdown placeholder)", () => {
    expect(applicationSchema.safeParse({ ...valid, workMode: "" }).success).toBe(true);
  });

  it("rejects an invalid jobUrl", () => {
    expect(applicationSchema.safeParse({ ...valid, jobUrl: "not-a-url" }).success).toBe(false);
  });

  it("accepts an empty-string jobUrl (optional)", () => {
    expect(applicationSchema.safeParse({ ...valid, jobUrl: "" }).success).toBe(true);
  });

  it("rejects a malformed appliedAt date", () => {
    expect(applicationSchema.safeParse({ ...valid, appliedAt: "not-a-date" }).success).toBe(false);
  });

  it("rejects an oversized company name", () => {
    expect(applicationSchema.safeParse({ ...valid, company: "a".repeat(201) }).success).toBe(false);
  });

  it("rejects an oversized description", () => {
    expect(
      applicationSchema.safeParse({ ...valid, description: "a".repeat(10001) }).success
    ).toBe(false);
  });

  it("does not require every field for a partial update schema", () => {
    expect(updateApplicationSchema.safeParse({ status: "OFFER" }).success).toBe(true);
    expect(updateApplicationSchema.safeParse({}).success).toBe(true);
  });
});

describe("applicationListQuerySchema", () => {
  it("applies sensible defaults", () => {
    const result = applicationListQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(10);
      expect(result.data.sort).toBe("createdAt");
      expect(result.data.order).toBe("desc");
    }
  });

  it("rejects a sort field that is not on the allowlist", () => {
    expect(applicationListQuerySchema.safeParse({ sort: "passwordHash" }).success).toBe(false);
  });

  it("rejects an unsupported sort order", () => {
    expect(applicationListQuerySchema.safeParse({ order: "sideways" }).success).toBe(false);
  });

  it("rejects a limit above the maximum page size", () => {
    expect(applicationListQuerySchema.safeParse({ limit: "500" }).success).toBe(false);
  });

  it("rejects a page below 1", () => {
    expect(applicationListQuerySchema.safeParse({ page: "0" }).success).toBe(false);
  });

  it("rejects a non-whitelisted status filter", () => {
    expect(applicationListQuerySchema.safeParse({ status: "HACKED" }).success).toBe(false);
  });

  it("does not accept a raw object (e.g. a Mongo operator) for a string filter", () => {
    const result = applicationListQuerySchema.safeParse({
      search: { $ne: null },
    });
    expect(result.success).toBe(false);
  });
});
