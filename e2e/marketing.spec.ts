import { test, expect } from "@playwright/test";
import { clerkFrontendApiOrigin } from "../src/lib/clerk-csp";

test.describe("Marketing site", () => {
  test("landing page sells the app and carries no reader chrome", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("main h1")).toContainText(
      /Sierra Leone news, in your pocket/i
    );
    await expect(
      page.getByRole("link", { name: "Features", exact: true })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Get the app" })).toBeVisible();
    await expect(page.locator('button[aria-label="Open menu"]')).toHaveCount(0);
  });

  test("feature and FAQ pages load", async ({ page }) => {
    await page.goto("/features");
    await expect(page.locator("main h1")).toContainText(
      /What.s inside the app/i
    );
    await page.goto("/faq");
    await expect(page.locator("main h1")).toContainText(
      /Questions and answers/i
    );
  });

  test("legal and download pages stay reachable", async ({ page }) => {
    for (const path of ["/privacy", "/terms", "/delete-account", "/download"]) {
      const response = await page.goto(path);
      expect(response?.status(), path).toBeLessThan(400);
    }
  });

  test("retired reader routes redirect to the marketing site", async ({
    page,
  }) => {
    await page.goto("/home");
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("main h1")).toContainText(/Sierra Leone news/i);
    await page.goto("/saved");
    await expect(page).toHaveURL(/\/$/);
  });

  test("serves a production CSP without unsafe-eval", async ({ page }) => {
    const response = await page.goto("/");
    const csp = response?.headers()["content-security-policy"] ?? "";
    expect(csp).toContain("default-src 'self'");
    expect(csp).not.toContain("'unsafe-eval'");
    expect(csp).toContain("report-uri /api/csp-report");
    const expectedOrigin = clerkFrontendApiOrigin();
    if (expectedOrigin) expect(csp).toContain(expectedOrigin);
  });

  test("skip link and image alternatives are present", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('a[href="#main-content"]')).toHaveCount(1);
    const images = page.locator("img");
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      expect(await images.nth(i).getAttribute("alt")).toBeTruthy();
    }
  });
});
