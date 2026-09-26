import { test, expect } from "@playwright/test";
import { registerAndLand } from "./helpers";

test("Flow 1 — a new user can register and land on the dashboard", async ({ page }) => {
  await registerAndLand(page, "Register");
  await expect(page.getByText("Register User")).toBeVisible();
});
