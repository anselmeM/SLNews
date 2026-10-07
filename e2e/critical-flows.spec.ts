import { test, expect, type Page } from "@playwright/test";

test.describe("Home & Navigation", () => {
  test("home page loads and shows articles", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/home");
    await expect(page.locator("main h1")).toContainText(/Good (Morning|Afternoon|Evening)/);
    await expect(page.locator("nav").last()).toBeVisible(); // bottom nav
  });

  test("bottom nav navigates between pages", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/home");
    await page.locator('a[aria-label="National News"]').click();
    await expect(page).toHaveURL("/local-news");
    await expect(page.locator("main h1")).toContainText("National News");

    await page.locator('a[aria-label="Shorts"]').click();
    await expect(page).toHaveURL("/reels");
  });

  test("hamburger drawer opens and shows links", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/home");
    await page.locator('button[aria-label="Open menu"]').click();
    await expect(page.locator("aside a[href='/market']")).toBeVisible();
    await expect(page.locator("aside a[href='/profile']")).toBeVisible();
    await expect(page.locator("aside a[href='/sign-in']")).toBeVisible();
  });
});

test.describe("Article header layout", () => {
  /**
   * The byline and the action buttons shared one row at every width, which on a
   * phone squeezed "October 6, 2026 · 1 min read" into a ~60px column beside the
   * icons. The byline now has its own line until `sm`.
   */
  async function openFirstArticle(page: Page) {
    await page.goto("/home");
    // Read the link and navigate directly: clicking a feed card means depending
    // on overlays, sticky bars and whether the card opens in a new tab, none of
    // which this test is about.
    const href = await page.locator('main a[href^="/article/"]').first().getAttribute("href");
    expect(href).toBeTruthy();
    await page.goto(href!);
    await expect(page.getByTestId("article-byline")).toBeVisible();
  }

  test("the byline sits above the action buttons on a phone", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openFirstArticle(page);

    const bylineBox = await page.getByTestId("article-byline").boundingBox();
    const actionsBox = await page.getByTestId("article-actions").boundingBox();

    expect(bylineBox).not.toBeNull();
    expect(actionsBox).not.toBeNull();
    // Whole byline above the action row, not beside it.
    expect(bylineBox!.y + bylineBox!.height).toBeLessThanOrEqual(actionsBox!.y + 1);
  });

  test("the byline and the action buttons share a row on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await openFirstArticle(page);

    const bylineBox = await page.getByTestId("article-byline").boundingBox();
    const actionsBox = await page.getByTestId("article-actions").boundingBox();

    expect(bylineBox).not.toBeNull();
    expect(actionsBox).not.toBeNull();
    // Same band vertically, actions to the right of the byline.
    expect(actionsBox!.y).toBeLessThan(bylineBox!.y + bylineBox!.height);
    expect(actionsBox!.x).toBeGreaterThan(bylineBox!.x + bylineBox!.width);
  });
});

test.describe("Search", () => {
  test("search results page works", async ({ page }) => {
    await page.goto("/search");
    await expect(page.locator("main h1")).toContainText("Search");
    await expect(page.getByPlaceholder("Search articles...")).toBeVisible();
  });

  test("search with query returns results", async ({ page }) => {
    await page.goto('/search?q=Sierra%20Leone');
    await expect(page.locator("main h1")).toContainText("Search Results");
  });
});

test.describe("News feed", () => {
  test("local news page loads", async ({ page }) => {
    await page.goto("/local-news");
    await expect(page.locator("main h1")).toContainText("National News");
  });

  test("world page loads", async ({ page }) => {
    await page.goto("/world");
    await expect(page.locator("main h1")).toContainText("International News");
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

  test("service worker registers in production", async ({ page }) => {
    await page.goto("/home");
    await page.waitForFunction(async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      return Boolean(registration?.active);
    });
  });
});

test.describe("Route protection", () => {
  test("profile redirects anonymous visitors to login", async ({ page }) => {
    await page.goto("/profile");
    await expect(page).toHaveURL(/(\/sign-in|\/login)/);
  });
});
