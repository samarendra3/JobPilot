import path from "node:path";
import { test, expect } from "@playwright/test";
import { registerAndLand } from "./helpers";

const TEST_PDF = path.join(__dirname, "..", "fixtures", "test-resume.pdf");

test("Flow 6 — upload, download, and delete a resume", async ({ page }) => {
  await registerAndLand(page, "Resume");

  await page.goto("/dashboard/profile");
  await expect(page.getByText(/no resume uploaded/i)).toBeVisible();

  await page.getByLabel(/upload resume/i).setInputFiles(TEST_PDF);
  await expect(page.getByText(/uploaded successfully/i)).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("test-resume.pdf")).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("link", { name: /download/i }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("test-resume.pdf");

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: /^delete$/i }).click();

  await expect(page.getByText(/no resume uploaded/i)).toBeVisible({ timeout: 15_000 });
});
