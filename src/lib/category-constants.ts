/**
 * Canonical news categories and alias normalizations for SLNews.
 * The app is "customer #1" of the SLNews scraper API.
 * Scraper category names (e.g. "Local", "Politics & Law", "Economy & Business")
 * are normalized to canonical app categories so every ingested article matches
 * app navigation feeds.
 */

export const CATEGORY_ALIASES: Record<string, string> = {
  Local: "National",
  District: "National",
  Provincial: "National",
  Opinion: "National",
  "In Focus": "National",
  "Politics & Law": "Politics",
  "Economy & Business": "Economy",
};

export const CANONICAL_CATEGORIES = [
  "National",
  "Politics",
  "Economy",
  "World",
  "Sports",
  "Tech",
  "Health",
  "Culture",
  "Environment",
  "Society",
] as const;

export type CanonicalCategory = (typeof CANONICAL_CATEGORIES)[number];

/**
 * Normalizes any category string (from scraper or external API) to canonical form.
 */
export function normalizeCategory(rawName: string): string {
  const trimmed = rawName.trim();
  if (!trimmed) return "National";
  return CATEGORY_ALIASES[trimmed] ?? trimmed;
}
