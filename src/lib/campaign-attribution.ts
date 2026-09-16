/**
 * First-touch campaign attribution for Meta / social ad traffic.
 *
 * Captures the standard UTM parameters plus the Meta click id (`fbclid`) from
 * the landing URL and stores the first touch that carried campaign data. This
 * is the campaign context December ad calibration depends on: it lets Pixel
 * events and internal share links carry the source/campaign that brought a
 * reader in.
 */

export const ATTRIBUTION_STORAGE_KEY = "slnews:attribution";

export type CampaignAttribution = {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  fbclid?: string;
  referrer?: string;
  landingPath?: string;
  capturedAt: string;
};

export type StorageLike = Pick<Storage, "getItem" | "setItem">;

type CampaignField = "source" | "medium" | "campaign" | "content" | "term" | "fbclid";

const PARAM_MAP: Record<string, CampaignField> = {
  utm_source: "source",
  utm_medium: "medium",
  utm_campaign: "campaign",
  utm_content: "content",
  utm_term: "term",
  fbclid: "fbclid",
};

const MAX_VALUE_LENGTH = 200;

function clamp(value: string): string {
  return value.trim().slice(0, MAX_VALUE_LENGTH);
}

function defaultStorage(): StorageLike | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** Extracts campaign fields from a query string; returns null when none are present. */
export function parseCampaignParams(params: URLSearchParams): Partial<CampaignAttribution> | null {
  const result: Partial<CampaignAttribution> = {};
  let found = false;
  for (const [param, field] of Object.entries(PARAM_MAP)) {
    const value = params.get(param);
    if (value && value.trim()) {
      result[field] = clamp(value);
      found = true;
    }
  }
  return found ? result : null;
}

export function getStoredAttribution(
  storage: StorageLike | null = defaultStorage()
): CampaignAttribution | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(ATTRIBUTION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CampaignAttribution;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export function storeAttribution(
  attribution: CampaignAttribution,
  storage: StorageLike | null = defaultStorage()
): void {
  if (!storage) return;
  try {
    storage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(attribution));
  } catch {
    // Ignore storage quota / privacy-mode failures — attribution is best-effort.
  }
}

/**
 * Captures campaign attribution on first touch only. If a campaign touch has
 * already been stored, it is returned unchanged (first-touch wins) and nothing
 * is overwritten — a later ad click cannot steal credit from the original.
 */
export function captureFirstTouchAttribution(options: {
  search: string | URLSearchParams;
  referrer?: string;
  landingPath?: string;
  now?: Date;
  storage?: StorageLike | null;
}): CampaignAttribution | null {
  const storage = options.storage === undefined ? defaultStorage() : options.storage;
  const existing = getStoredAttribution(storage);
  if (existing) return existing;

  const params =
    typeof options.search === "string" ? new URLSearchParams(options.search) : options.search;
  const parsed = parseCampaignParams(params);
  if (!parsed) return null;

  const attribution: CampaignAttribution = {
    ...parsed,
    referrer: options.referrer ? clamp(options.referrer) : undefined,
    landingPath: options.landingPath ? clamp(options.landingPath) : undefined,
    capturedAt: (options.now ?? new Date()).toISOString(),
  };
  storeAttribution(attribution, storage);
  return attribution;
}

/** Query string that re-applies stored campaign fields to internal share links. */
export function attributionQueryString(attribution: CampaignAttribution | null): string {
  if (!attribution) return "";
  const params = new URLSearchParams();
  for (const [param, field] of Object.entries(PARAM_MAP)) {
    const value = attribution[field];
    if (value) params.set(param, value);
  }
  return params.toString();
}
