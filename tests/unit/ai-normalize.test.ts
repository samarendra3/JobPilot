import { describe, it, expect } from "vitest";
import { parseJsonText, normalizeResult } from "@/lib/ai";

describe("parseJsonText", () => {
  it("parses plain JSON", () => {
    expect(parseJsonText('{"a":1}')).toEqual({ a: 1 });
  });

  it("parses JSON wrapped in a ```json fenced block", () => {
    const text = '```json\n{"a":1}\n```';
    expect(parseJsonText(text)).toEqual({ a: 1 });
  });

  it("parses JSON wrapped in a plain fenced block", () => {
    const text = '```\n{"a":1}\n```';
    expect(parseJsonText(text)).toEqual({ a: 1 });
  });

  it("extracts JSON from surrounding extra text", () => {
    const text = 'Here is the analysis:\n{"a":1}\nHope this helps!';
    expect(parseJsonText(text)).toEqual({ a: 1 });
  });

  it("returns null for unparseable garbage", () => {
    expect(parseJsonText("not json at all")).toBeNull();
  });

  it("returns null for empty input", () => {
    expect(parseJsonText("")).toBeNull();
  });
});

describe("normalizeResult", () => {
  const validRaw = {
    matchScore: 82,
    matchedSkills: ["React", "TypeScript"],
    missingSkills: ["Go"],
    strengths: ["Strong frontend experience"],
    gaps: ["No backend experience"],
    suggestions: ["Highlight React projects"],
    resumeKeywords: ["React", "Next.js"],
    interviewQuestions: ["Describe a React project you led"],
    summary: "Good match overall.",
  };

  it("normalizes a valid response", () => {
    const result = normalizeResult(validRaw);
    expect(result.matchScore).toBe(82);
    expect(result.summary).toBe("Good match overall.");
    expect(result.matchedSkills).toEqual(["React", "TypeScript"]);
  });

  it("throws AIProviderError when value is not an object", () => {
    expect(() => normalizeResult("not an object")).toThrow("AI returned an invalid response");
    expect(() => normalizeResult(null)).toThrow("AI returned an invalid response");
  });

  it("defaults matchScore to 0 when missing", () => {
    const { matchScore, ...rest } = validRaw;
    expect(normalizeResult(rest).matchScore).toBe(0);
  });

  it("defaults matchScore to 0 when not a number", () => {
    expect(normalizeResult({ ...validRaw, matchScore: "not-a-number" }).matchScore).toBe(0);
  });

  it("clamps a score above 100 down to 100", () => {
    const result = normalizeResult({ ...validRaw, matchScore: 150 });
    expect(result.matchScore).toBe(100);
  });

  it("clamps a score below 0 up to 0", () => {
    const result = normalizeResult({ ...validRaw, matchScore: -20 });
    expect(result.matchScore).toBe(0);
  });

  it("throws when summary is missing", () => {
    const { summary, ...rest } = validRaw;
    expect(() => normalizeResult(rest)).toThrow("AI returned an incomplete analysis");
  });

  it("throws when summary is whitespace-only", () => {
    expect(() => normalizeResult({ ...validRaw, summary: "   " })).toThrow(
      "AI returned an incomplete analysis"
    );
  });

  it("throws when summary is not a string", () => {
    expect(() => normalizeResult({ ...validRaw, summary: 12345 })).toThrow(
      "AI returned an incomplete analysis"
    );
  });

  it("throws AI returned an incomplete analysis when no recognizable fields are present", () => {
    expect(() => normalizeResult({ foo: "bar", baz: 42 })).toThrow(
      "AI returned an incomplete analysis"
    );
  });

  it("falls back gaps/strengths to missingSkills/matchedSkills when arrays are empty", () => {
    const result = normalizeResult({
      ...validRaw,
      strengths: [],
      gaps: [],
    });
    expect(result.strengths).toEqual(validRaw.matchedSkills.slice(0, 10));
    expect(result.gaps).toEqual(validRaw.missingSkills.slice(0, 10));
  });

  it("filters out non-string entries from arrays", () => {
    const result = normalizeResult({
      ...validRaw,
      matchedSkills: ["React", 123, null, {}, "TypeScript"],
    });
    expect(result.matchedSkills).toEqual(["React", "TypeScript"]);
  });

  it("caps arrays at their maximum item count", () => {
    const result = normalizeResult({
      ...validRaw,
      matchedSkills: Array.from({ length: 50 }, (_, i) => `skill-${i}`),
    });
    expect(result.matchedSkills).toHaveLength(20);
  });

  it("treats a malformed (non-object) array field as empty", () => {
    const result = normalizeResult({ ...validRaw, suggestions: "not-an-array" });
    expect(result.suggestions).toEqual([]);
  });

  it("truncates an oversized summary to 3000 characters", () => {
    const result = normalizeResult({ ...validRaw, summary: "a".repeat(4000) });
    expect(result.summary).toHaveLength(3000);
  });
});
