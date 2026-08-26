import { describe, it, expect } from "vitest";
import {
  formatArticleWhatsAppDigest,
  formatBriefingWhatsAppDigest,
  getWhatsAppShareUrl,
} from "../whatsapp-formatter";

describe("WhatsApp News Digest Formatter", () => {
  const sampleArticle = {
    id: "art-123",
    title: "Bank of Sierra Leone Introduces New Monetary Framework",
    summary: "The central bank announced comprehensive measures to stabilize the Leone currency.",
    content: "The central bank announced comprehensive measures to stabilize the Leone currency.\n\nCommercial banks and foreign exchange bureaus must comply with daily reporting standards. The governor highlighted key foreign reserve targets.",
    location: "Freetown",
    category: "Economy",
    source: "Awoko",
  };

  it("formats article into rich WhatsApp markdown text", () => {
    const text = formatArticleWhatsAppDigest(sampleArticle, "https://slnews.sl");

    expect(text).toContain("🇸🇱 *SLNews Exclusive*");
    expect(text).toContain("📰 *Bank of Sierra Leone Introduces New Monetary Framework*");
    expect(text).toContain("⚡ *Key Takeaways:*");
    expect(text).toContain("📍 *Region:* Freetown");
    expect(text).toContain("🏷️ *Category:* Economy");
    expect(text).toContain("🔗 *Read full story:* https://slnews.sl/article/art-123");
  });

  it("formats morning briefing with lead story and regional highlights", () => {
    const sampleBriefing = {
      dateFormatted: "Wednesday, August 26, 2026",
      greeting: "Good Morning Freetown",
      leadStory: {
        id: "lead-1",
        title: "National Grid Expansion Reaches Southern Province",
        summary: "Electricity supply connected to 15,000 new households.",
      },
      regionalStories: [
        { id: "reg-1", title: "Cocoa Harvest Exceeds Targets in Kenema", location: "Kenema" },
        { id: "reg-2", title: "New Road Opens in Port Loko", location: "Port Loko" },
      ],
    };

    const text = formatBriefingWhatsAppDigest(sampleBriefing, "https://slnews.sl");

    expect(text).toContain("🇸🇱 *SLNews Daily Briefing*");
    expect(text).toContain("Good Morning Freetown!");
    expect(text).toContain("⭐ *Top Headline:*");
    expect(text).toContain("*National Grid Expansion Reaches Southern Province*");
    expect(text).toContain("[Kenema] Cocoa Harvest Exceeds Targets in Kenema");
    expect(text).toContain("https://slnews.sl/home");
  });

  it("generates a valid wa.me URL with encoded text", () => {
    const rawText = "Hello *Sierra Leone* & Freetown!";
    const url = getWhatsAppShareUrl(rawText);

    expect(url.startsWith("https://wa.me/?text=")).toBe(true);
    expect(url).toContain("Hello%20*Sierra%20Leone*%20%26%20Freetown!");
  });
});
