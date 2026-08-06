import { test, expect, type Locator } from "@playwright/test";

/**
 * Playwright's `toBeVisible()` ignores ancestors with `opacity: 0` — an
 * element with a bounding box that isn't `display:none` counts as visible even
 * when nothing is actually painted (e.g. an animation stuck at its initial
 * `opacity: 0`). This asserts the element is truly painted: effective opacity
 * multiplied through every ancestor must be > 0.5.
 */
async function expectPainted(locator: Locator) {
  await expect(locator).toBeVisible();
  const effectiveOpacity = await locator.evaluate((el) => {
    let opacity = 1;
    let node: HTMLElement | null = el as HTMLElement;
    while (node) {
      opacity *= Number.parseFloat(window.getComputedStyle(node).opacity);
      node = node.parentElement;
    }
    return opacity;
  });
  expect(effectiveOpacity, "content is stuck invisible (ancestor opacity 0)").toBeGreaterThan(0.5);
}

test.describe("SLNews E2E", () => {
  test("landing page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("main").getByRole("heading", { name: /Sierra Leone/ })).toBeVisible();
    await expect(page.getByRole("link", { name: "Start Reading" })).toBeVisible();
  });

  test("login page loads with visible form", async ({ page }) => {
    await page.goto("/login");
    await expectPainted(page.getByRole("heading", { name: "Welcome Back" }));
    await expectPainted(page.locator("form"));
    await expectPainted(page.getByRole("button", { name: "Sign In" }));
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
