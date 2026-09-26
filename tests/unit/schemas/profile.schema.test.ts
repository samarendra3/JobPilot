import { describe, it, expect } from "vitest";
import { updateProfileSchema } from "@/schemas/profile.schema";

function validExperience() {
  return { title: "Engineer", company: "Acme", startDate: "2020-01", endDate: "2022-01", description: "" };
}

function validEducation() {
  return { institution: "State University", degree: "BSc", fieldOfStudy: "CS" };
}

function validPayload() {
  return {
    name: "Jane Doe",
    headline: "",
    phone: "",
    location: "",
    image: "",
    linkedinUrl: "",
    githubUrl: "",
    portfolioUrl: "",
    skills: ["React", "TypeScript"],
    experience: [validExperience()],
    education: [validEducation()],
    resumeText: "",
  };
}

describe("updateProfileSchema", () => {
  it("accepts a valid full payload", () => {
    expect(updateProfileSchema.safeParse(validPayload()).success).toBe(true);
  });

  it("rejects a name shorter than 2 characters", () => {
    expect(updateProfileSchema.safeParse({ ...validPayload(), name: "J" }).success).toBe(false);
  });

  it("rejects an invalid linkedinUrl", () => {
    expect(
      updateProfileSchema.safeParse({ ...validPayload(), linkedinUrl: "not-a-url" }).success
    ).toBe(false);
  });

  it("rejects more than 50 skills", () => {
    const result = updateProfileSchema.safeParse({
      ...validPayload(),
      skills: Array.from({ length: 51 }, (_, i) => `skill-${i}`),
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty-string skill entry", () => {
    const result = updateProfileSchema.safeParse({
      ...validPayload(),
      skills: ["React", ""],
    });
    expect(result.success).toBe(false);
  });

  it("rejects more than 20 experience entries", () => {
    const result = updateProfileSchema.safeParse({
      ...validPayload(),
      experience: Array.from({ length: 21 }, () => validExperience()),
    });
    expect(result.success).toBe(false);
  });

  it("rejects an experience entry missing a required field", () => {
    const result = updateProfileSchema.safeParse({
      ...validPayload(),
      experience: [{ title: "Engineer" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects an education entry missing a required field", () => {
    const result = updateProfileSchema.safeParse({
      ...validPayload(),
      education: [{ degree: "BSc" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects resumeText over 30000 characters", () => {
    const result = updateProfileSchema.safeParse({
      ...validPayload(),
      resumeText: "a".repeat(30001),
    });
    expect(result.success).toBe(false);
  });

  it("accepts resumeText at exactly the 30000 character limit", () => {
    const result = updateProfileSchema.safeParse({
      ...validPayload(),
      resumeText: "a".repeat(30000),
    });
    expect(result.success).toBe(true);
  });

  it("strips unknown fields such as an attempted role/isAdmin override", () => {
    const result = updateProfileSchema.safeParse({
      ...validPayload(),
      role: "admin",
      isAdmin: true,
      userId: "someone-elses-id",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty("role");
      expect(result.data).not.toHaveProperty("isAdmin");
      expect(result.data).not.toHaveProperty("userId");
    }
  });
});
