import { test, expect } from "@playwright/test";
import { registerAndLand } from "./helpers";

test("Flow 5 — edit profile, add skills/experience/education, and verify persistence on reload", async ({
  page,
}) => {
  await registerAndLand(page, "Profile");

  await page.goto("/dashboard/profile");
  await page.getByLabel(/professional headline/i).fill("Senior Software Engineer");
  await page.getByLabel(/^skills$|skills \(comma/i).fill("React, TypeScript, Node.js");

  await page.getByRole("button", { name: /^add$/i }).first().click();
  await page.getByLabel(/job title/i).fill("Staff Engineer");
  await page.getByLabel(/^company$/i).fill("Acme Corp");

  await page.getByRole("button", { name: /^add$/i }).last().click();
  await page.getByLabel(/institution/i).fill("State University");

  await page.getByRole("button", { name: /save profile/i }).click();
  await expect(page.getByText(/saved successfully/i)).toBeVisible({ timeout: 15_000 });

  await page.reload();
  await expect(page.getByLabel(/professional headline/i)).toHaveValue("Senior Software Engineer");
  await expect(page.getByLabel(/job title/i)).toHaveValue("Staff Engineer");
  await expect(page.getByLabel(/institution/i)).toHaveValue("State University");
});
