import { defineConfig, devices } from "@playwright/test";

/**
 * These E2E specs exercise real API routes backed by MongoDB. They
 * require:
 *   - a reachable MongoDB instance (MONGODB_URI pointing at a
 *     disposable/test database — never production data)
 *   - GEMINI_API_KEY set (the AI flow test mocks the network call, but
 *     lib/ai.ts still requires the key to be present to construct the
 *     request)
 *   - the dev server reachable at PLAYWRIGHT_BASE_URL (defaults to
 *     http://localhost:3000)
 *
 * `webServer` below starts `npm run dev` automatically if nothing is
 * already listening on the port.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "npm run dev",
    url: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
