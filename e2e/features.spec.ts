import { test, expect, type Page } from "@playwright/test";

test.describe("Market actions", () => {
  test("market page shows alert and report actions", async ({ page }) => {
    await page.goto("/market");
    await expect(page.getByRole("button", { name: /Set Price Alerts/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Report Price Change/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Set Alert/ })).toBeVisible();
  });

  test("signed-out users are prompted to sign in when setting an alert", async ({ page }) => {
    await page.goto("/market");
    await page.getByRole("button", { name: /Set Price Alerts/ }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("heading", { name: /Get Real-Time Price Alerts/ })).toBeVisible();
    await page.getByRole("link", { name: /Sign In/ }).click();
    await expect(page).toHaveURL(/(\/sign-in|\/login)/);
  });

  test("market tabs navigate between markets", async ({ page }) => {
    await page.goto("/market");
    await page.getByRole("tab", { name: "Bo Market" }).click();
    await expect(page).toHaveURL(/market=Bo%20Market/);
    await expect(page.getByRole("heading", { name: "Market Prices" })).toBeVisible();
  });
});

test.describe("Contributor following", () => {
  // The home page streams several sections (briefing, latest, editors' picks,
  // feed). Locating and clicking a link straight away races that stream: under
  // CI load the "first" article link can be replaced mid-click, so the
  // navigation never commits. Go to "/" (not "/home", which just redirects),
  // let the stream settle, then click and wait for the navigation explicitly.
  async function openFirstArticle(page: Page) {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const articleLink = page.locator('main a[href^="/article/"]').first();
    await articleLink.scrollIntoViewIfNeeded();
    await Promise.all([page.waitForURL(/\/article\//), articleLink.click()]);
  }

  async function openFirstAuthor(page: Page) {
    const authorLink = page.locator('main a[href^="/author/"]').first();
    await authorLink.scrollIntoViewIfNeeded();
    await Promise.all([page.waitForURL(/\/author\//), authorLink.click()]);
  }

  test("author page shows follow control", async ({ page }) => {
    await openFirstArticle(page);
    await openFirstAuthor(page);
    await expect(page.getByRole("button", { name: /Follow/ })).toBeVisible();
  });

  test("signed-out users are redirected to login when following", async ({ page }) => {
    await openFirstArticle(page);
    await openFirstAuthor(page);
    await page.getByRole("button", { name: /Follow/ }).click();
    await expect(page).toHaveURL(/(\/sign-in|\/login)/);
  });
});

test.describe("Announcements", () => {
  // The "Post a Notice" action link (/announcements/post) also matches
  // a[href^="/announcements/"] and precedes the cards in the DOM — exclude it
  // so these tests click a real notice card, not the form page.
  const noticeCard = 'a[href^="/announcements/"]:not([href$="/post"])';

  test("announcement card title links to notice detail", async ({ page }) => {
    await page.goto("/announcements");
    const cardLink = page.locator(noticeCard).first();
    await expect(cardLink).toBeVisible();
    await cardLink.click();
    await expect(page).toHaveURL(/\/announcements\/[^/]+$/);
    await expect(page.locator("main")).toBeVisible();
  });

  test("notice detail page shows comments section", async ({ page }) => {
    await page.goto("/announcements");
    const cardLink = page.locator(noticeCard).first();
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
    await page.goto("/sign-in");
    await expect(page).toHaveTitle(/Sign In \| SLNews/);
    await page.goto("/sign-up");
    await expect(page).toHaveTitle(/Create Account \| SLNews/);
  });
});
