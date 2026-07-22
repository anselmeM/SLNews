import { test, expect } from "@playwright/test";

test.describe("Home & Navigation", () => {
  test("home page loads and shows articles", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/home");
    await expect(page.locator("h1")).toContainText(/Good (Morning|Afternoon|Evening)/);
    await expect(page.locator("nav").last()).toBeVisible(); // bottom nav
  });

  test("bottom nav navigates between pages", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/home");
    await page.locator('a[aria-label="Local News"]').click();
    await expect(page).toHaveURL("/local-news");
    await expect(page.locator("h1")).toContainText("Local News");

    await page.locator('a[aria-label="Saved"]').click();
    await expect(page).toHaveURL("/saved");
  });

  test("hamburger drawer opens and shows links", async ({ page }) => {
    await page.goto("/home");
    await page.locator('button[aria-label="Open menu"]').click();
    await expect(page.locator("text=International")).toBeVisible();
    await expect(page.locator("text=Sign In")).toBeVisible();
  });
});

test.describe("Search", () => {
  test("search results page works", async ({ page }) => {
    await page.goto("/search");
    await expect(page.locator("h1")).toContainText("Search");
    await expect(page.locator("text=Trending Topics")).toBeVisible();
  });

  test("search with query returns results", async ({ page }) => {
    await page.goto('/search?q=Sierra%20Leone');
    await expect(page.locator("h1")).toContainText("Search Results");
  });
});

test.describe("News feed", () => {
  test("local news page loads", async ({ page }) => {
    await page.goto("/local-news");
    await expect(page.locator("h1")).toContainText("Local News");
  });

  test("world page loads", async ({ page }) => {
    await page.goto("/world");
    await expect(page.locator("h1")).toContainText("International News");
  });
});

test.describe("PWA", () => {
  test("manifest loads", async ({ page }) => {
    const response = await page.goto("/manifest.json");
    expect(response?.status()).toBe(200);
    const json = await response?.json();
    expect(json.name).toContain("SLNews");
    expect(json.icons.length).toBeGreaterThan(0);
  });

  test("service worker registered", async ({ page }) => {
    const response = await page.goto("/sw.js");
    expect(response?.status()).toBe(200);
  });
});

test.describe("Route protection", () => {
  test("profile redirects anonymous visitors to login", async ({ page }) => {
    await page.goto("/profile");
    await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fprofile$/);
  });
});
