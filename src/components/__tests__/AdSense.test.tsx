import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { AdSlot, NativeAdCard, AdBanner } from "@/components/AdSense";
import { getActiveSponsorCampaign } from "@/lib/sponsor-config";
import { useAppStore } from "@/store/useAppStore";

describe("AdSense and AdSlot Component", () => {
  beforeEach(() => {
    useAppStore.setState({ dataSaver: false });
  });

  it("retrieves active sponsor campaign matching slot and category", () => {
    const marketCampaign = getActiveSponsorCampaign("market_fx_sponsor");
    expect(marketCampaign).not.toBeNull();
    expect(marketCampaign?.id).toBe("sl-remit-sendwave");

    const economyCampaign = getActiveSponsorCampaign("article_mid", "Economy");
    expect(economyCampaign).not.toBeNull();
    expect(economyCampaign?.id).toBe("rokel-digital-banking");
  });

  it("renders direct partner sponsor card with badge and CTA", () => {
    render(<AdSlot slotId="market_fx_sponsor" format="horizontal" />);
    expect(screen.getByText("Official FX Partner")).toBeInTheDocument();
    expect(screen.getByText(/Send Money to Sierra Leone/i)).toBeInTheDocument();
    expect(screen.getByText("Send Money Now")).toBeInTheDocument();
  });

  it("renders in-article rectangle sponsor card correctly", () => {
    render(<AdSlot slotId="article_mid" format="rectangle" category="Economy" />);
    expect(screen.getByText("Sponsored")).toBeInTheDocument();
    expect(screen.getByText(/Rokel SimKorpor/i)).toBeInTheDocument();
    expect(screen.getByText("Get Started")).toBeInTheDocument();
  });

  it("renders native in-feed ad card", () => {
    render(<NativeAdCard />);
    expect(screen.getByText("Sponsored")).toBeInTheDocument();
    expect(screen.getByText(/Launch Your Digital Product/i)).toBeInTheDocument();
  });

  it("renders legacy AdBanner helper", () => {
    render(<AdBanner slot="123456" />);
    expect(screen.getByText("Partner")).toBeInTheDocument();
  });

  it("suppresses ad rendering when Data Saver mode is active", () => {
    useAppStore.setState({ dataSaver: true });
    const { container } = render(<AdSlot slotId="market_fx_sponsor" format="horizontal" />);
    expect(container.firstChild).toBeNull();
  });
});
