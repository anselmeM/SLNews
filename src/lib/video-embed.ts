export type VideoProvider =
  | "facebook"
  | "instagram"
  | "youtube"
  | "tiktok"
  | "direct"
  | "unknown";

export interface ParsedVideo {
  provider: VideoProvider;
  originalUrl: string;
  embedUrl: string;
  videoId?: string;
  isVertical: boolean;
  providerLabel: string;
  providerIcon: string;
}

export function parseVideoUrl(rawUrl: string): ParsedVideo {
  const url = rawUrl.trim();

  // 1. Instagram Reel or Post
  const igMatch = url.match(
    /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:reel|p|tv)\/([A-Za-z0-9_-]+)/i
  );
  if (igMatch && igMatch[1]) {
    const id = igMatch[1];
    return {
      provider: "instagram",
      originalUrl: url,
      embedUrl: `https://www.instagram.com/reel/${id}/embed`,
      videoId: id,
      isVertical: true,
      providerLabel: "Instagram Reel",
      providerIcon: "photo_camera",
    };
  }

  // 2. Facebook Video / Reel / Watch
  const fbMatch = url.match(
    /(?:https?:\/\/)?(?:www\.|m\.|web\.)?(?:facebook\.com|fb\.watch)\/(?:watch\/?\?v=(\d+)|reel\/([A-Za-z0-9_-]+)|[A-Za-z0-9_.-]+\/videos\/(\d+)|([A-Za-z0-9_-]+))/i
  );
  if (url.includes("facebook.com") || url.includes("fb.watch")) {
    const id = fbMatch?.[1] || fbMatch?.[2] || fbMatch?.[3] || fbMatch?.[4];
    return {
      provider: "facebook",
      originalUrl: url,
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
        url
      )}&show_text=false&autoplay=1&mute=0`,
      videoId: id,
      isVertical: url.includes("/reel/"),
      providerLabel: "Facebook Video",
      providerIcon: "smart_display",
    };
  }

  // 3. YouTube Shorts or Video
  const ytShortMatch = url.match(
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([A-Za-z0-9_-]+)/i
  );
  if (ytShortMatch && ytShortMatch[1]) {
    const id = ytShortMatch[1];
    return {
      provider: "youtube",
      originalUrl: url,
      embedUrl: `https://www.youtube.com/embed/${id}?autoplay=1&playsinline=1&rel=0&modestbranding=1&loop=1`,
      videoId: id,
      isVertical: true,
      providerLabel: "YouTube Short",
      providerIcon: "play_circle",
    };
  }

  const ytStandardMatch = url.match(
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]+)/i
  );
  if (ytStandardMatch && ytStandardMatch[1]) {
    const id = ytStandardMatch[1];
    return {
      provider: "youtube",
      originalUrl: url,
      embedUrl: `https://www.youtube.com/embed/${id}?autoplay=1&playsinline=1&rel=0&modestbranding=1`,
      videoId: id,
      isVertical: false,
      providerLabel: "YouTube",
      providerIcon: "play_circle",
    };
  }

  // 4. TikTok Video
  const tiktokMatch = url.match(
    /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@[A-Za-z0-9_.-]+\/video\/(\d+)/i
  );
  if (tiktokMatch && tiktokMatch[1]) {
    const id = tiktokMatch[1];
    return {
      provider: "tiktok",
      originalUrl: url,
      embedUrl: `https://www.tiktok.com/embed/v2/${id}`,
      videoId: id,
      isVertical: true,
      providerLabel: "TikTok",
      providerIcon: "videocam",
    };
  }

  // 5. Direct Video Streams (.mp4, .webm, .m3u8)
  if (/\.(mp4|webm|m3u8)(\?.*)?$/i.test(url)) {
    return {
      provider: "direct",
      originalUrl: url,
      embedUrl: url,
      isVertical: true,
      providerLabel: "Video Clip",
      providerIcon: "movie",
    };
  }

  // Fallback
  return {
    provider: "unknown",
    originalUrl: url,
    embedUrl: url,
    isVertical: true,
    providerLabel: "External Video",
    providerIcon: "play_arrow",
  };
}
