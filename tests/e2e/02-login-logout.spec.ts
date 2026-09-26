import { test, expect } from "@playwright/test";
import { uniqueEmail, TEST_PASSWORD } from "./helpers";

test("Flow 2 — register, logout, then log back in", async ({ page }) => {
  const email = uniqueEmail("login");

  await page.goto("/register");
  await page.getByLabel("Name").fill("Login Flow User");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(TEST_PASSWORD);
  await page.getByLabel("Confirm password").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: /create account/i }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });

  await page.getByRole("button", { name: /open user menu/i }).click();
  await page.getByRole("menu").getByRole("button", { name: /logout/i }).click();
  await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();

  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
});
