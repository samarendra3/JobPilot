import { test, expect } from "@playwright/test";
import { registerAndLand } from "./helpers";

const VIEWPORTS = [
  { name: "375px", width: 375, height: 812 },
  { name: "390px", width: 390, height: 844 },
  { name: "430px", width: 430, height: 932 },
  { name: "768px", width: 768, height: 1024 },
  { name: "1024px", width: 1024, height: 768 },
  { name: "1280px", width: 1280, height: 800 },
  { name: "1440px", width: 1440, height: 900 },
];

for (const viewport of VIEWPORTS) {
  test(`login page has no horizontal overflow at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/login");

    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));

    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });
}

test("mobile sidebar opens and closes with keyboard (Escape) on a narrow viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await registerAndLand(page, "Responsive");

  const menuButton = page.getByRole("button", { name: /open navigation menu/i });
  await menuButton.click();
  await expect(page.getByRole("dialog", { name: /dashboard navigation/i })).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: /dashboard navigation/i })).not.toBeVisible();
});
