import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: 1,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3100",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "node scripts/e2e-server.js",
    url: "http://localhost:3100",
    reuseExistingServer: false,
    timeout: 180_000,
    env: {
      PORT: "3100",
    },
  },
});
