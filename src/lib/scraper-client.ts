// Typed client for the Sierra Leone news scraper API (Render).
//
// The app is "customer #1" and consumes the LEGACY full-text endpoint
// `GET /api/news`. It must NOT move to the versioned `GET /v1/news` business
// contract: that payload is metadata-only — no `link`, no `paragraphs` — so the
// sync would silently skip every article.
//
// Error mapping (kept stable for the sync action):
//   - SCRAPER_API_KEY missing        -> Error("SCRAPER_API_KEY is not set")
//   - network failure                -> ScraperUnreachableError
//   - non-OK response (incl. 401)    -> Error("Scraper responded <status>")
//   - unexpected body shape          -> Error("Unexpected scraper payload")

export type ScraperArticle = {
  id?: number | string;
  title?: string;
  link?: string;
  author?: string;
  description?: string;
  category?: string[];
  imageUrl?: string;
  paragraphs?: string[];
  pubDate?: string;
  source?: string;
  createdAt?: string;
};

export type ScraperVideo = {
  id: number;
  videoId: string;
  title: string;
  url: string;
  description: string | null;
  thumbnailUrl: string | null;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
  category: string[];
};

/** Raised when the scraper host cannot be reached at the network level. */
export class ScraperUnreachableError extends Error {
  constructor() {
    super("Scraper unreachable");
    this.name = "ScraperUnreachableError";
  }
}

const DEFAULT_BASE_URL = "https://slnewsapiscapper.onrender.com";

function baseUrl(): string {
  return (process.env.SCRAPER_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, "");
}

function apiKey(): string {
  const key = process.env.SCRAPER_API_KEY;
  if (!key) throw new Error("SCRAPER_API_KEY is not set");
  return key;
}

function normalizePayload(json: unknown): ScraperArticle[] {
  if (Array.isArray(json)) return json as ScraperArticle[];
  if (json && typeof json === "object" && Array.isArray((json as { data?: unknown }).data)) {
    return (json as { data: ScraperArticle[] }).data;
  }
  throw new Error("Unexpected scraper payload");
}

function normalizeVideoPayload(json: unknown): ScraperVideo[] {
  if (Array.isArray(json)) return json as ScraperVideo[];
  if (json && typeof json === "object" && Array.isArray((json as { data?: unknown }).data)) {
    return (json as { data: ScraperVideo[] }).data;
  }
  throw new Error("Unexpected scraper payload");
}

/**
 * Fetch the latest scraped articles from the legacy full-text endpoint.
 *
 * Pinned to `/api/news` on purpose (see the file header): the app needs `link`
 * and `paragraphs`, which `/v1/news` does not provide. Every non-OK status
 * (401, 404, …) is therefore a real error, not a signal to try another route.
 */
export async function fetchScraperNews(): Promise<ScraperArticle[]> {
  const key = apiKey();
  const url = `${baseUrl()}/api/news`;

  let res: Response;
  try {
    res = await fetch(url, {
      cache: "no-store",
      headers: { Authorization: `Bearer ${key}` },
    });
  } catch (err) {
    void err;
    throw new ScraperUnreachableError();
  }

  if (!res.ok) {
    throw new Error(`Scraper responded ${res.status}`);
  }

  return normalizePayload(await res.json());
}

/**
 * Fetch scraped YouTube news videos and Shorts from the scraper API.
 */
export async function fetchScraperVideos(limit = 20, page = 1): Promise<ScraperVideo[]> {
  const key = apiKey();
  const base = baseUrl();
  const url = `${base}/api/videos?limit=${limit}&page=${page}`;

  let res: Response;
  try {
    res = await fetch(url, {
      cache: "no-store",
      headers: { Authorization: `Bearer ${key}` },
    });
  } catch (err) {
    void err;
    throw new ScraperUnreachableError();
  }

  if (!res.ok) {
    throw new Error(`Scraper responded ${res.status}`);
  }

  return normalizeVideoPayload(await res.json());
}

/**
 * Trigger an immediate ingestion cycle of all YouTube channel feeds.
 */
export async function triggerScraperVideoSync(): Promise<{ status: string; result?: unknown }> {
  const key = apiKey();
  const base = baseUrl();
  const url = `${base}/api/videos/sync`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    void err;
    throw new ScraperUnreachableError();
  }

  if (!res.ok) {
    throw new Error(`Scraper responded ${res.status}`);
  }

  return (await res.json()) as { status: string; result?: unknown };
}
