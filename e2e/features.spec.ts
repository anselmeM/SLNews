import { test, expect } from "@playwright/test";

test.describe("Market actions", () => {
  test("market page shows alert and report actions", async ({ page }) => {
    await page.goto("/market");
    await expect(page.getByRole("button", { name: /Set Price Alerts/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Report Price Change/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Set Alert/ })).toBeVisible();
  });

  test("signed-out users are redirected to login when setting an alert", async ({ page }) => {
    await page.goto("/market");
    await page.getByRole("button", { name: /Set Price Alerts/ }).click();
    await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fmarket$/);
  });

  test("market tabs navigate between markets", async ({ page }) => {
    await page.goto("/market");
    await page.getByRole("tab", { name: "Bo Market" }).click();
    await expect(page).toHaveURL(/market=Bo%20Market/);
    await expect(page.getByRole("heading", { name: "Market Prices" })).toBeVisible();
  });
});

test.describe("Contributor following", () => {
  test("author page shows follow control", async ({ page }) => {
    await page.goto("/home");
    const articleLink = page.locator('a[href^="/article/"]').first();
    await expect(articleLink).toBeVisible();
    await articleLink.click();
    await expect(page).toHaveURL(/\/article\//);

    const authorLink = page.locator('a[href^="/author/"]').first();
    await expect(authorLink).toBeVisible();
    await authorLink.click();
    await expect(page).toHaveURL(/\/author\//);
    await expect(page.getByRole("button", { name: /Follow/ })).toBeVisible();
  });

  test("signed-out users are redirected to login when following", async ({ page }) => {
    await page.goto("/home");
    const articleLink = page.locator('a[href^="/article/"]').first();
    await articleLink.click();
    const authorLink = page.locator('a[href^="/author/"]').first();
    await authorLink.click();
    await page.getByRole("button", { name: /Follow/ }).click();
    await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fauthor%2F/);
  });
});

test.describe("Announcements", () => {
  test("announcement card title links to notice detail", async ({ page }) => {
    await page.goto("/announcements");
    const cardLink = page.locator('a[href^="/announcements/"]').first();
    await expect(cardLink).toBeVisible();
    await cardLink.click();
    await expect(page).toHaveURL(/\/announcements\/[^/]+$/);
    await expect(page.locator("main")).toBeVisible();
  });

  test("notice detail page shows comments section", async ({ page }) => {
    await page.goto("/announcements");
    const cardLink = page.locator('a[href^="/announcements/"]').first();
    await cardLink.click();
    await expect(page.getByRole("heading", { name: /Comments/ })).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign in", exact: true })).toBeVisible();
  });
});

test.describe("Search filters", () => {
  test("search results expose category, province, and date filters", async ({ page }) => {
    await page.goto("/search?q=market");
    await expect(page.getByRole("group", { name: "Filter by category" })).toBeVisible();
    await expect(page.getByRole("group", { name: "Filter by province" })).toBeVisible();
    await expect(page.getByRole("group", { name: "Filter by date" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Last 7 days" })).toBeVisible();
  });
});

test.describe("Route metadata", () => {
  test("landing page exposes its own title", async ({ page }) => {
    await page.goto("/");
    const title = await page.title();
    expect(title).toContain("SLNews");
  });

  test("auth pages expose route titles", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveTitle(/Sign In \| SLNews/);
    await page.goto("/register");
    await expect(page).toHaveTitle(/Create Account \| SLNews/);
  });
});
