import { describe, it, expect } from "vitest";
import { parseVideoUrl } from "../video-embed";

describe("Video Embed URL Parser", () => {
  it("parses Instagram Reel URLs", () => {
    const parsed = parseVideoUrl("https://www.instagram.com/reel/C8xyz123abc/");
    expect(parsed.provider).toBe("instagram");
    expect(parsed.embedUrl).toBe("https://www.instagram.com/reel/C8xyz123abc/embed");
    expect(parsed.isVertical).toBe(true);
    expect(parsed.providerLabel).toBe("Instagram Reel");
  });

  it("parses Facebook Video and Reel URLs", () => {
    const parsedWatch = parseVideoUrl("https://www.facebook.com/watch/?v=987654321");
    expect(parsedWatch.provider).toBe("facebook");
    expect(parsedWatch.embedUrl).toContain("plugins/video.php");

    const parsedReel = parseVideoUrl("https://www.facebook.com/reel/123456789");
    expect(parsedReel.provider).toBe("facebook");
    expect(parsedReel.isVertical).toBe(true);
  });

  it("parses YouTube Shorts URLs", () => {
    const parsed = parseVideoUrl("https://www.youtube.com/shorts/3f4Y2N4w1bY");
    expect(parsed.provider).toBe("youtube");
    expect(parsed.videoId).toBe("3f4Y2N4w1bY");
    expect(parsed.embedUrl).toContain("https://www.youtube.com/embed/3f4Y2N4w1bY");
    expect(parsed.isVertical).toBe(true);
  });

  it("parses YouTube Standard Video URLs", () => {
    const parsed = parseVideoUrl("https://youtu.be/dQw4w9WgXcQ");
    expect(parsed.provider).toBe("youtube");
    expect(parsed.videoId).toBe("dQw4w9WgXcQ");
    expect(parsed.isVertical).toBe(false);
  });

  it("parses TikTok Video URLs", () => {
    const parsed = parseVideoUrl("https://www.tiktok.com/@switsalone/video/7123456789012345678");
    expect(parsed.provider).toBe("tiktok");
    expect(parsed.videoId).toBe("7123456789012345678");
    expect(parsed.isVertical).toBe(true);
  });

  it("identifies direct video MP4 streams", () => {
    const parsed = parseVideoUrl("https://cdn.slnews.sl/videos/freetown-parade.mp4");
    expect(parsed.provider).toBe("direct");
    expect(parsed.embedUrl).toBe("https://cdn.slnews.sl/videos/freetown-parade.mp4");
  });
});
