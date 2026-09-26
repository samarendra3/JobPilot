import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}@example.test`;
}

export const TEST_PASSWORD = "TestPassword123!";

export async function registerAndLand(page: Page, namePrefix: string): Promise<string> {
  const email = uniqueEmail(namePrefix);

  await page.goto("/register");
  await page.getByLabel("Name").fill(`${namePrefix} User`);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(TEST_PASSWORD);
  await page.getByLabel("Confirm password").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: /create account/i }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });

  return email;
}
