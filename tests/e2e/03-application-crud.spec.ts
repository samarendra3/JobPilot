import { test, expect } from "@playwright/test";
import { registerAndLand } from "./helpers";

test("Flow 3 — create, view, edit, and delete an application", async ({ page }) => {
  await registerAndLand(page, "AppCrud");

  await page.goto("/dashboard/applications");
  await page.getByRole("link", { name: /add application|new application/i }).click();

  await page.getByLabel("Company").fill("Acme Corp");
  await page.getByLabel("Job Title").fill("Software Engineer");
  await page.getByRole("button", { name: /add application/i }).click();

  await expect(page).toHaveURL(/\/dashboard\/applications/, { timeout: 15_000 });
  await expect(page.getByText("Acme Corp")).toBeVisible();

  await page.getByText("Acme Corp").click();
  await expect(page.getByText("Software Engineer")).toBeVisible();

  await page.getByRole("link", { name: /edit/i }).click();
  await page.getByLabel("Company").fill("Acme Corp Updated");
  await page.getByRole("button", { name: /save|update/i }).click();

  await expect(page.getByText("Acme Corp Updated")).toBeVisible({ timeout: 15_000 });

  await page.getByRole("button", { name: /delete/i }).click();
  await page.getByRole("button", { name: /confirm|yes|delete/i }).last().click();

  await expect(page).toHaveURL(/\/dashboard\/applications/, { timeout: 15_000 });
  await expect(page.getByText("Acme Corp Updated")).not.toBeVisible();
});
