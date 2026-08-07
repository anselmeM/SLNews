// Typed client for the Sierra Leone news scraper API (Render).
//
// Designed to be the app's "customer #1" integration: it targets a versioned
// `GET /v1/news` endpoint (the future business API contract) and falls back to
// the legacy `GET /api/news` until /v1 is deployed on the Render service.
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

/**
 * Fetch the latest scraped articles. Tries the versioned `/v1/news` endpoint
 * first; a 404 means the version isn't deployed yet, so it falls back to the
 * legacy `/api/news`. Any other non-OK status (e.g. 401) is a real error.
 */
export async function fetchScraperNews(): Promise<ScraperArticle[]> {
  const key = apiKey();
  const base = baseUrl();
  // The app is the full-text consumer: it reads `link`/`paragraphs`/`pubDate`
  // from the legacy endpoint. `/v1/news` is the metadata-only business contract
  // for future paying customers — the app must NOT switch to it, or the sync
  // would skip every article (no `link`, no full text).
  const urls = [`${base}/api/news`];

  let lastError: unknown;
  for (const url of urls) {
    let res: Response;
    try {
      res = await fetch(url, {
        cache: "no-store",
        headers: { Authorization: `Bearer ${key}` },
      });
    } catch (err) {
      lastError = new ScraperUnreachableError();
      void err;
      continue;
    }

    if (res.status === 404) {
      // Version not deployed yet — try the legacy endpoint.
      lastError = new Error(`Scraper responded 404`);
      continue;
    }
    if (!res.ok) {
      throw new Error(`Scraper responded ${res.status}`);
    }

    return normalizePayload(await res.json());
  }

  throw lastError instanceof Error ? lastError : new Error("Scraper unreachable");
}
