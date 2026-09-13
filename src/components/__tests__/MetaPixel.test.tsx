import { render } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import MetaPixel from "../MetaPixel";
import * as metaPixelUtil from "@/lib/meta-pixel";

vi.mock("next/navigation", () => ({
  usePathname: () => "/home",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("next/script", () => ({
  default: ({
    id,
    dangerouslySetInnerHTML,
  }: {
    id: string;
    dangerouslySetInnerHTML?: { __html: string };
  }) => (
    <script
      id={id}
      dangerouslySetInnerHTML={dangerouslySetInnerHTML}
      data-testid="meta-pixel-script"
    />
  ),
}));

describe("MetaPixel Component", () => {
  const originalEnv = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID = originalEnv;
  });

  it("renders nothing when NEXT_PUBLIC_FACEBOOK_PIXEL_ID is not configured", () => {
    const { container } = render(<MetaPixel />);
    expect(container.innerHTML).toBe("");
  });

  it("renders pixel script with configured pixel ID", () => {
    process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID = "9988776655";
    const { container } = render(<MetaPixel />);

    const script = container.querySelector("#meta-pixel-init");
    expect(script).not.toBeNull();
    expect(script?.innerHTML).toContain("9988776655");
    expect(script?.innerHTML).toContain("fbq('init', '9988776655');");
    expect(script?.innerHTML).toContain("https://connect.facebook.net/en_US/fbevents.js");
  });

  it("calls trackMetaEvent on subsequent route updates", () => {
    process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID = "9988776655";
    const trackSpy = vi.spyOn(metaPixelUtil, "trackMetaEvent").mockImplementation(() => {});

    // Initial mount ignores first track to prevent duplicate PageView
    const { rerender } = render(<MetaPixel />);
    expect(trackSpy).not.toHaveBeenCalled();

    rerender(<MetaPixel />);
    trackSpy.mockRestore();
  });
});
