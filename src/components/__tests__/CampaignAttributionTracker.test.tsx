import { render } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CampaignAttributionTracker from "@/components/CampaignAttributionTracker";
import { ATTRIBUTION_STORAGE_KEY } from "@/lib/campaign-attribution";
import { trackCustomMetaEvent } from "@/lib/meta-pixel";

const searchParams = { current: new URLSearchParams() };

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useSearchParams: () => searchParams.current,
}));
vi.mock("@/lib/meta-pixel", () => ({ trackCustomMetaEvent: vi.fn() }));

describe("CampaignAttributionTracker", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
    searchParams.current = new URLSearchParams();
  });

  it("captures first-touch attribution and fires CampaignLanding", () => {
    searchParams.current = new URLSearchParams(
      "utm_source=facebook&utm_medium=cpc&utm_campaign=dec_freetown"
    );

    render(<CampaignAttributionTracker />);

    expect(trackCustomMetaEvent).toHaveBeenCalledWith(
      "CampaignLanding",
      expect.objectContaining({ source: "facebook", medium: "cpc", campaign: "dec_freetown" })
    );
    const stored = JSON.parse(window.localStorage.getItem(ATTRIBUTION_STORAGE_KEY) || "{}");
    expect(stored.source).toBe("facebook");
  });

  it("does not fire again once a first touch is already stored", () => {
    window.localStorage.setItem(
      ATTRIBUTION_STORAGE_KEY,
      JSON.stringify({ source: "tiktok", capturedAt: new Date().toISOString() })
    );
    searchParams.current = new URLSearchParams("utm_source=facebook");

    render(<CampaignAttributionTracker />);

    expect(trackCustomMetaEvent).not.toHaveBeenCalled();
  });

  it("does nothing when there are no campaign parameters", () => {
    searchParams.current = new URLSearchParams("page=2");

    render(<CampaignAttributionTracker />);

    expect(trackCustomMetaEvent).not.toHaveBeenCalled();
  });
});
