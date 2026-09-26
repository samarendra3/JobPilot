import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const createMock = vi.fn();

class MockAPIError extends Error {
  status?: number;

  constructor(status: number | undefined, message: string) {
    super(message);
    this.status = status;
  }
}

vi.mock("groq-sdk", () => {
  class Groq {
    chat = {
      completions: {
        create: (...args: unknown[]) => createMock(...args),
      },
    };

    static APIError = MockAPIError;
  }

  return { default: Groq };
});

const validInput = {
  jobDescription:
    "We are looking for a Frontend Engineer with React and TypeScript experience.",
  profileSkills: ["React", "TypeScript"],
  profileExperience: "Frontend Engineer at Acme — built dashboards.",
  resumeText: "React, TypeScript, Next.js",
};

const validAnalysis = {
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

function chatCompletion(content: string) {
  return {
    choices: [
      {
        message: {
          content,
        },
      },
    ],
  };
}

describe("analyzeJobWithAI (Groq provider)", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    createMock.mockReset();
    process.env = { ...originalEnv, GROQ_API_KEY: "test-key" };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("throws AIProviderError when GROQ_API_KEY is missing", async () => {
    delete process.env.GROQ_API_KEY;
    const { analyzeJobWithAI } = await import("@/lib/ai");

    await expect(analyzeJobWithAI(validInput)).rejects.toThrow(
      "AI service is not configured"
    );
    expect(createMock).not.toHaveBeenCalled();
  });

  it("returns a normalized result on a successful call", async () => {
    createMock.mockResolvedValueOnce(
      chatCompletion(JSON.stringify(validAnalysis))
    );

    const { analyzeJobWithAI } = await import("@/lib/ai");
    const result = await analyzeJobWithAI(validInput);

    expect(result.matchScore).toBe(82);
    expect(result.summary).toBe("Good match overall.");
    expect(createMock).toHaveBeenCalledTimes(1);

    const callArgs = createMock.mock.calls[0][0];
    expect(callArgs.response_format).toEqual({ type: "json_object" });
    expect(callArgs.messages[0].role).toBe("system");
    expect(callArgs.messages[1].role).toBe("user");
    expect(callArgs.messages[1].content).toContain("<job_description>");
  });

  it("parses a markdown-fenced JSON response", async () => {
    const fenced = "```json\n" + JSON.stringify(validAnalysis) + "\n```";
    createMock.mockResolvedValueOnce(chatCompletion(fenced));

    const { analyzeJobWithAI } = await import("@/lib/ai");
    const result = await analyzeJobWithAI(validInput);

    expect(result.matchScore).toBe(82);
  });

  it("retries unparseable garbage and eventually throws a safe error", async () => {
    createMock.mockResolvedValue(chatCompletion("not json at all"));

    const { analyzeJobWithAI } = await import("@/lib/ai");

    await expect(analyzeJobWithAI(validInput)).rejects.toThrow(
      "AI service is temporarily unavailable. Please try again in a moment."
    );
    expect(createMock).toHaveBeenCalledTimes(3);
  }, 10_000);

  it("retries unparseable garbage and succeeds if a later attempt is valid", async () => {
    createMock
      .mockResolvedValueOnce(chatCompletion("not json at all"))
      .mockResolvedValueOnce(chatCompletion(JSON.stringify(validAnalysis)));

    const { analyzeJobWithAI } = await import("@/lib/ai");
    const result = await analyzeJobWithAI(validInput);

    expect(result.matchScore).toBe(82);
    expect(createMock).toHaveBeenCalledTimes(2);
  }, 10_000);

  it("rejects a response with none of the expected fields, even after retries", async () => {
    createMock.mockResolvedValue(
      chatCompletion(JSON.stringify({ foo: "bar" }))
    );

    const { analyzeJobWithAI } = await import("@/lib/ai");

    await expect(analyzeJobWithAI(validInput)).rejects.toThrow(
      "AI service is temporarily unavailable. Please try again in a moment."
    );
  }, 10_000);

  it("retries and eventually rejects when Groq omits the summary field", async () => {
    const { summary, ...withoutSummary } = validAnalysis;
    void summary;
    createMock.mockResolvedValue(
      chatCompletion(JSON.stringify(withoutSummary))
    );

    const { analyzeJobWithAI } = await import("@/lib/ai");

    await expect(analyzeJobWithAI(validInput)).rejects.toThrow(
      "AI service is temporarily unavailable. Please try again in a moment."
    );
    expect(createMock).toHaveBeenCalledTimes(3);
  }, 10_000);

  it("retries and eventually rejects a whitespace-only summary", async () => {
    createMock.mockResolvedValue(
      chatCompletion(JSON.stringify({ ...validAnalysis, summary: "   " }))
    );

    const { analyzeJobWithAI } = await import("@/lib/ai");

    await expect(analyzeJobWithAI(validInput)).rejects.toThrow(
      "AI service is temporarily unavailable. Please try again in a moment."
    );
  }, 10_000);

  it("recovers if a later attempt includes a valid summary", async () => {
    const { summary, ...withoutSummary } = validAnalysis;
    void summary;
    createMock
      .mockResolvedValueOnce(chatCompletion(JSON.stringify(withoutSummary)))
      .mockResolvedValueOnce(chatCompletion(JSON.stringify(validAnalysis)));

    const { analyzeJobWithAI } = await import("@/lib/ai");
    const result = await analyzeJobWithAI(validInput);

    expect(result.summary).toBe(validAnalysis.summary);
    expect(createMock).toHaveBeenCalledTimes(2);
  }, 10_000);

  it("clamps an out-of-range matchScore", async () => {
    createMock.mockResolvedValueOnce(
      chatCompletion(JSON.stringify({ ...validAnalysis, matchScore: 500 }))
    );

    const { analyzeJobWithAI } = await import("@/lib/ai");
    const result = await analyzeJobWithAI(validInput);

    expect(result.matchScore).toBe(100);
  });

  it("defaults matchScore to 0 when non-numeric rather than failing", async () => {
    createMock.mockResolvedValueOnce(
      chatCompletion(
        JSON.stringify({ ...validAnalysis, matchScore: "not-a-number" })
      )
    );

    const { analyzeJobWithAI } = await import("@/lib/ai");
    const result = await analyzeJobWithAI(validInput);

    expect(result.matchScore).toBe(0);
  });

  it("treats missing/malformed arrays as empty rather than failing", async () => {
    createMock.mockResolvedValueOnce(
      chatCompletion(
        JSON.stringify({
          ...validAnalysis,
          matchedSkills: "not-an-array",
          missingSkills: undefined,
        })
      )
    );

    const { analyzeJobWithAI } = await import("@/lib/ai");
    const result = await analyzeJobWithAI(validInput);

    expect(result.matchedSkills).toEqual([]);
    expect(result.missingSkills).toEqual([]);
  });

  it("retries on a 429 and eventually succeeds", async () => {
    createMock
      .mockRejectedValueOnce(new MockAPIError(429, "rate limited"))
      .mockResolvedValueOnce(chatCompletion(JSON.stringify(validAnalysis)));

    const { analyzeJobWithAI } = await import("@/lib/ai");
    const result = await analyzeJobWithAI(validInput);

    expect(result.matchScore).toBe(82);
    expect(createMock).toHaveBeenCalledTimes(2);
  }, 10_000);

  it("throws the safe unavailable message after exhausting retries on repeated 503s", async () => {
    createMock.mockRejectedValue(new MockAPIError(503, "service unavailable"));

    const { analyzeJobWithAI } = await import("@/lib/ai");

    await expect(analyzeJobWithAI(validInput)).rejects.toThrow(
      "AI service is temporarily unavailable. Please try again in a moment."
    );
  }, 10_000);

  it("fails fast without retrying on a non-retryable 401", async () => {
    createMock.mockRejectedValueOnce(new MockAPIError(401, "invalid api key"));

    const { analyzeJobWithAI } = await import("@/lib/ai");

    await expect(analyzeJobWithAI(validInput)).rejects.toThrow(
      "AI service request failed"
    );
    expect(createMock).toHaveBeenCalledTimes(1);
  });

  it("never leaks the raw provider error message in the thrown error", async () => {
    createMock.mockRejectedValue(
      new MockAPIError(500, "super secret internal provider detail")
    );

    const { analyzeJobWithAI } = await import("@/lib/ai");

    try {
      await analyzeJobWithAI(validInput);
      throw new Error("expected analyzeJobWithAI to throw");
    } catch (error) {
      expect((error as Error).message).not.toContain(
        "super secret internal provider detail"
      );
    }
  }, 10_000);
});
