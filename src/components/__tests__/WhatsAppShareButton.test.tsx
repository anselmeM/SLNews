import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import WhatsAppShareButton from "@/components/WhatsAppShareButton";
import { trackMetaEvent } from "@/lib/meta-pixel";
import type { NewsArticle } from "@/lib/news-service";

vi.mock("@/lib/meta-pixel", () => ({ trackMetaEvent: vi.fn() }));
vi.mock("@/lib/haptics", () => ({ vibrateLight: vi.fn() }));

const article: NewsArticle = {
  id: "share-1",
  title: "Sierra Leone Headline",
  summary: "A short summary",
  content: "Body copy for the article that is long enough to be summarised.",
  imageUrl: "/x.png",
  category: "National",
  source: "SLNews",
  publishedAt: new Date().toISOString(),
  authorId: "u1",
};

describe("WhatsAppShareButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("opens a pre-formatted WhatsApp digest and fires the Share event", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

    render(<WhatsAppShareButton article={article} />);
    fireEvent.click(screen.getByRole("button", { name: /share on whatsapp/i }));

    expect(openSpy).toHaveBeenCalledTimes(1);
    const url = String(openSpy.mock.calls[0]?.[0] ?? "");
    expect(url.startsWith("https://wa.me/?text=")).toBe(true);
    expect(decodeURIComponent(url)).toContain("Sierra Leone Headline");

    expect(trackMetaEvent).toHaveBeenCalledWith(
      "Share",
      expect.objectContaining({ method: "whatsapp", content_ids: ["share-1"] })
    );
  });
});
