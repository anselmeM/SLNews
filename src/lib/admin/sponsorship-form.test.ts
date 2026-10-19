import { describe, expect, it } from "vitest";
import { parseCampaignForm } from "./sponsorship-form";

function form(overrides: Record<string, string> = {}): FormData {
  const data = new FormData();
  const values: Record<string, string> = {
    placement: "feed",
    advertiser: "Orange SL",
    headline: "SCAN AND SAVE",
    body: "Every top-up this month",
    ctaLabel: "View more",
    ctaUrl: "https://example.com/offer",
    ...overrides,
  };
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

describe("parseCampaignForm", () => {
  it("accepts a valid campaign", () => {
    const parsed = parseCampaignForm(form());
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.value.placement).toBe("feed");
      expect(parsed.value.brandHex).toBe("#0B6FD1");
    }
  });

  it("rejects bad placements, long copy and relative URLs", () => {
    const bad = parseCampaignForm(
      form({
        placement: "sidebar",
        headline: "x".repeat(41),
        ctaUrl: "/relative",
      })
    );
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(bad.errors.length).toBeGreaterThanOrEqual(3);
  });

  it("rejects an end before the start", () => {
    const data = form();
    data.set("startsAt", "2026-11-02T00:00");
    data.set("endsAt", "2026-11-01T00:00");
    expect(parseCampaignForm(data).ok).toBe(false);
  });
});
