import { test, expect } from "@playwright/test";
import { registerAndLand } from "./helpers";

/**
 * This flow mocks the Groq HTTP call itself (not our own API route), so
 * the real /api/ai/job-analysis route handler, auth, ownership check, and
 * response normalization all still run for real — only the outbound
 * network call to Groq is intercepted. No real AI provider call is
 * made in this automated test.
 */
test("Flow 7 — run AI job analysis against a mocked Groq response", async ({ page }) => {
  await page.route("https://api.groq.com/**", async (route) => {
    const mockAnalysis = {
      matchScore: 78,
      matchedSkills: ["React", "TypeScript"],
      missingSkills: ["Kubernetes"],
      strengths: ["Strong frontend background"],
      gaps: ["No infra experience"],
      suggestions: ["Highlight your React project leadership"],
      resumeKeywords: ["React", "Next.js"],
      interviewQuestions: ["Describe a challenging React project you led"],
      summary: "Good overall match for this frontend-leaning role.",
    };

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: "chatcmpl-mock",
        object: "chat.completion",
        created: Date.now(),
        model: "openai/gpt-oss-20b",
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: JSON.stringify(mockAnalysis),
            },
            finish_reason: "stop",
          },
        ],
      }),
    });
  });

  await registerAndLand(page, "AIAnalysis");

  await page.goto("/dashboard/applications/new");
  await page.getByLabel("Company").fill("Initech");
  await page.getByLabel("Job Title").fill("Frontend Engineer");
  await page.getByRole("button", { name: /add application/i }).click();
  await expect(page).toHaveURL(/\/dashboard\/applications/, { timeout: 15_000 });

  await page.goto("/dashboard/ai-analysis");
  const applicationSelect = page.getByLabel(/application/i);
  const optionValue = await applicationSelect
    .locator("option", { hasText: "Initech" })
    .first()
    .getAttribute("value");
  await applicationSelect.selectOption(optionValue ?? "");
  await page
    .getByLabel(/job description/i)
    .fill(
      "We are looking for a Frontend Engineer with strong React and TypeScript experience to join our team and build delightful user interfaces."
    );
  await page.getByRole("button", { name: /run analysis|analyze/i }).click();

  await expect(page.getByText(/78/)).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("React")).toBeVisible();
  await expect(page.getByText("Kubernetes")).toBeVisible();
  await expect(page.getByText(/highlight your react project leadership/i)).toBeVisible();
  await expect(
    page.getByText(/describe a challenging react project you led/i)
  ).toBeVisible();
});
