import { describe, it, expect } from "vitest";
import { formatBreakingPayload } from "@/lib/breaking-push-service";
import { formatMorningBriefingPayload } from "@/lib/briefing-service";

describe("Breaking Push & Morning Briefing formatting", () => {
  it("formats breaking news payload with direct article deep link", () => {
    const payload = formatBreakingPayload({
      id: "art-123",
      title: "President Declares New Education Initiative in Kenema",
      summary: "Full government scholarship announced for STEM students.",
    });

    expect(payload.title).toContain("BREAKING");
    expect(payload.body).toBe("President Declares New Education Initiative in Kenema");
    expect(payload.url).toBe("/article/art-123");
    expect(payload.tag).toBe("slnews-breaking-art-123");
    expect(payload.actions).toHaveLength(1);
    expect(payload.actions[0]?.title).toBe("Read Story");
  });

  it("formats morning briefing payload with personalized region", () => {
    const payload = formatMorningBriefingPayload(
      {
        leadStory: { title: "Bo District Mining Revenues Reach New High" },
        topicStories: [{}, {}],
        regionalStories: [{}],
        quickBriefs: [{}],
        totalReadTimeMinutes: 4,
      },
      {
        name: "Amara",
        preferredRegion: "Southern Province",
      }
    );

    expect(payload.title).toContain("Southern Province");
    expect(payload.body).toContain("Bo District Mining Revenues Reach New High");
    expect(payload.body).toContain("+4 stories");
    expect(payload.body).toContain("4 min read");
    expect(payload.url).toBe("/digest");
    expect(payload.tag).toMatch(/^slnews-morning-briefing-\d{4}-\d{2}-\d{2}$/);
  });

  it("formats morning briefing payload with fallback defaults", () => {
    const payload = formatMorningBriefingPayload({
      leadStory: null,
      totalReadTimeMinutes: 3,
    });

    expect(payload.title).toContain("Your Morning Briefing");
    expect(payload.body).toContain("Today's top stories are ready");
    expect(payload.url).toBe("/digest");
  });
});
