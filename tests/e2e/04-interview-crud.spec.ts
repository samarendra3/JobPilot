import { test, expect } from "@playwright/test";
import { registerAndLand } from "./helpers";

test("Flow 4 — create an application, then create/edit/delete an interview for it", async ({
  page,
}) => {
  await registerAndLand(page, "InterviewCrud");

  await page.goto("/dashboard/applications/new");
  await page.getByLabel("Company").fill("Globex Inc");
  await page.getByLabel("Job Title").fill("Backend Engineer");
  await page.getByRole("button", { name: /add application/i }).click();
  await expect(page).toHaveURL(/\/dashboard\/applications/, { timeout: 15_000 });

  await page.goto("/dashboard/interviews/new");
  const applicationSelect = page.getByLabel(/application/i);
  const optionValue = await applicationSelect
    .locator("option", { hasText: "Globex Inc" })
    .first()
    .getAttribute("value");
  await applicationSelect.selectOption(optionValue ?? "");
  await page.getByLabel(/^date$/i).fill("2027-01-15");
  await page.getByLabel(/^time$/i).fill("10:00");
  await page.getByRole("button", { name: /add interview|create interview/i }).click();

  await expect(page).toHaveURL(/\/dashboard\/interviews/, { timeout: 15_000 });
  await expect(page.getByText("Globex Inc")).toBeVisible();

  await page.getByText("Globex Inc").click();
  await page.getByRole("link", { name: /edit/i }).click();
  await page.getByLabel(/interviewer/i).fill("Jane Recruiter");
  await page.getByRole("button", { name: /save|update/i }).click();

  await expect(page.getByText("Jane Recruiter")).toBeVisible({ timeout: 15_000 });

  await page.getByRole("button", { name: /delete/i }).click();
  await page.getByRole("button", { name: /confirm|yes|delete/i }).last().click();

  await expect(page).toHaveURL(/\/dashboard\/interviews/, { timeout: 15_000 });
});
