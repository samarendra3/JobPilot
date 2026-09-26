import { describe, it, expect } from "vitest";
import mongoose from "mongoose";
import AIAnalysis from "@/models/AIAnalysis";

function buildDoc(overrides: Record<string, unknown> = {}) {
  return new AIAnalysis({
    userId: new mongoose.Types.ObjectId(),
    applicationId: new mongoose.Types.ObjectId(),
    matchScore: 75,
    strengths: [],
    gaps: [],
    suggestions: [],
    matchedSkills: [],
    missingSkills: [],
    resumeKeywords: [],
    interviewQuestions: [],
    summary: "A solid match for this role.",
    provider: "groq",
    ...overrides,
  });
}

describe("AIAnalysis model validation", () => {
  it("accepts provider 'groq'", () => {
    const error = buildDoc({ provider: "groq" }).validateSync();
    expect(error).toBeUndefined();
  });

  it("accepts provider 'gemini'", () => {
    const error = buildDoc({ provider: "gemini" }).validateSync();
    expect(error).toBeUndefined();
  });

  it("rejects an invalid provider value", () => {
    const error = buildDoc({ provider: "not-a-real-provider" }).validateSync();
    expect(error?.errors.provider).toBeDefined();
  });

  it("accepts a valid non-empty summary", () => {
    const error = buildDoc({ summary: "Great fit for the role." }).validateSync();
    expect(error).toBeUndefined();
  });

  it("rejects a missing summary", () => {
    const doc = buildDoc();
    doc.summary = undefined as unknown as string;
    const error = doc.validateSync();
    expect(error?.errors.summary).toBeDefined();
  });

  it("rejects an empty-string summary", () => {
    const error = buildDoc({ summary: "" }).validateSync();
    expect(error?.errors.summary).toBeDefined();
  });

  it("accepts empty arrays for all list fields", () => {
    const error = buildDoc({
      strengths: [],
      gaps: [],
      suggestions: [],
      matchedSkills: [],
      missingSkills: [],
      resumeKeywords: [],
      interviewQuestions: [],
    }).validateSync();
    expect(error).toBeUndefined();
  });

  it("accepts a complete Groq-shaped analysis document", () => {
    const error = buildDoc({
      provider: "groq",
      matchScore: 88,
      matchedSkills: ["React", "Node.js"],
      missingSkills: ["Go"],
      strengths: ["Strong frontend background"],
      gaps: ["No backend depth"],
      suggestions: ["Highlight backend projects"],
      resumeKeywords: ["React", "Node.js"],
      interviewQuestions: ["Describe a React project you led"],
      summary: "Strong overall match for the role.",
    }).validateSync();
    expect(error).toBeUndefined();
  });
});
