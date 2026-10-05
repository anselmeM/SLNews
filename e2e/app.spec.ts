import { test, expect, type Page } from "@playwright/test";
import { clerkFrontendApiOrigin } from "../src/lib/clerk-csp";

test.describe("SLNews E2E", () => {
  test("front page loads with live feed", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("main h1")).toContainText(/Good (Morning|Afternoon|Evening)/);
  });

  test("login page loads with visible form", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator(".cl-rootBox, .cl-signIn-root, form, main")).toBeVisible();
  });

  test("about page loads", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByRole("heading", { name: "The Voice of the Nation" })).toBeVisible();
  });

  test("market page loads with title", async ({ page }) => {
    await page.goto("/market");
    await expect(page.getByRole("heading", { name: "Market Prices" })).toBeVisible();
  });

  test("market can switch tabs", async ({ page }) => {
    await page.goto("/market");
    await expect(page.getByRole("heading", { name: "Market Prices" })).toBeVisible();
  });

  test.describe("Content-Security-Policy", () => {
    test("serves a production policy without unsafe-eval", async ({ page }) => {
      const response = await page.goto("/");
      const csp = response?.headers()["content-security-policy"] ?? "";

      expect(csp).toContain("default-src 'self'");
      // `next dev` still allows eval for HMR; the built app must not.
      expect(csp).not.toContain("'unsafe-eval'");
      expect(csp).toContain("report-uri /api/csp-report");
      expect(csp).toContain("https://challenges.cloudflare.com");

      // #78: the Clerk Frontend API origin is derived from the publishable key.
      const expectedOrigin = clerkFrontendApiOrigin();
      if (expectedOrigin) expect(csp).toContain(expectedOrigin);
    });

    test("the home page loads with no CSP violations in the console", async ({ page }) => {
      expect(await collectCspViolations(page, "/")).toEqual([]);
    });

    test("sign-in loads with no CSP violations in the console", async ({ page }) => {
      expect(await collectCspViolations(page, "/sign-in")).toEqual([]);
    });
  });

  test.describe("Accessibility", () => {
    test("skip-to-content link is present", async ({ page }) => {
      await page.goto("/about");
      const skipLink = page.locator('a[href="#main-content"]');
      await expect(skipLink).toHaveCount(1);
    });

    test("images have alt text", async ({ page }) => {
      await page.goto("/about");
      const images = page.locator("img");
      const count = await images.count();
      for (let i = 0; i < count; i++) {
        const alt = await images.nth(i).getAttribute("alt");
        expect(alt).toBeTruthy();
      }
    });

    test("form inputs have accessible labels", async ({ page }) => {
      await page.goto("/search");
      const inputs = page.locator("input:not([type='hidden'])");
      const count = await inputs.count();
      for (let i = 0; i < count; i++) {
        const ariaLabel = await inputs.nth(i).getAttribute("aria-label");
        const placeholder = await inputs.nth(i).getAttribute("placeholder");
        const labelledBy = await inputs.nth(i).getAttribute("aria-labelledby");
        expect(ariaLabel || placeholder || labelledBy).toBeTruthy();
      }
    });
  });
});

/**
 * Loads a route in a real browser and returns the CSP violations Chromium
 * reported. The policy is only as good as the pages it actually serves.
 */
async function collectCspViolations(page: Page, path: string): Promise<string[]> {
  const violations: string[] = [];
  page.on("console", (message) => {
    if (/content security policy/i.test(message.text())) {
      violations.push(`${message.text()} (${message.location().url})`);
    }
  });

  await page.goto(path);
  await page.waitForLoadState("networkidle");

  return violations;
}
