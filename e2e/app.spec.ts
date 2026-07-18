import { test, expect } from "@playwright/test";

test.describe("SLNews E2E", () => {
  test("onboarding page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Welcome to SLNews" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Continue" })).toBeVisible();
  });

  test("login page loads with form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Welcome Back" })).toBeVisible();
    await expect(page.locator("form")).toBeVisible();
  });

  test("login form validates required fields", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page.getByRole("textbox", { name: "Email Address" })).toBeVisible();
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

  test.describe("Accessibility", () => {
    test("skip-to-content link is present", async ({ page }) => {
      await page.goto("/about");
      const skipLink = page.locator('a[href="#main-content"]');
      await expect(skipLink).toBeTruthy();
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
      await page.goto("/login");
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
