export interface ReelVideo {
  id: string;
  title: string;
  summary: string;
  videoUrl: string;
  thumbnailUrl: string;
  source: string;
  sourceImage?: string;
  category: string;
  location?: string;
  publishedAt: string;
  authorId: string;
  commentsCount?: number;
  status?: string;
}

// Curated high-quality Sierra Leone news video shorts & reels
// representing top broadcaster and social media channels.
export const CURATED_SL_REELS: ReelVideo[] = [
  {
    id: "reel-ayv-broadcast-sunday",
    title: "AYV on Sunday — National Broadcast & Current Affairs",
    summary:
      "AYV Media Empire's flagship Sunday current affairs broadcast covering Sierra Leone's political, economic, and civic developments.",
    videoUrl: "https://www.youtube.com/watch?v=nwgfRYK1wHg",
    thumbnailUrl: "https://i.ytimg.com/vi/nwgfRYK1wHg/hqdefault.jpg",
    source: "AYV News Sierra Leone",
    sourceImage: "/globe.svg",
    category: "National",
    location: "Freetown",
    publishedAt: new Date().toISOString(),
    authorId: "ayv-news",
    commentsCount: 24,
    status: "PUBLISHED",
  },
  {
    id: "reel-sl-data-dilemma",
    title: "Sierra Leone Governance & Demographic Dilemmas",
    summary:
      "An in-depth report on Sierra Leone's data management, institutional reforms, and census impact on regional resource distribution.",
    videoUrl: "https://www.youtube.com/shorts/iDODE3SUhVI",
    thumbnailUrl: "https://i.ytimg.com/vi/iDODE3SUhVI/hqdefault.jpg",
    source: "Saving Africa Uncensored",
    sourceImage: "/globe.svg",
    category: "Politics",
    location: "National",
    publishedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    authorId: "saving-africa",
    commentsCount: 18,
    status: "PUBLISHED",
  },
  {
    id: "reel-un-first-lady-speech",
    title: "Sierra Leone First Lady Address at United Nations",
    summary:
      "Sierra Leone First Lady Fatima Maada Bio delivers an international keynote at the United Nations advancing child protection and girl-child education.",
    videoUrl: "https://www.youtube.com/shorts/cxEnjSGquY4",
    thumbnailUrl: "https://i.ytimg.com/vi/cxEnjSGquY4/hqdefault.jpg",
    source: "GBS News SL",
    sourceImage: "/globe.svg",
    category: "Society",
    location: "Freetown",
    publishedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    authorId: "gbs-news",
    commentsCount: 32,
    status: "PUBLISHED",
  },
  {
    id: "reel-freetown-aerial-progress",
    title: "Freetown Aerial Landscape & Coastal Infrastructure Progress",
    summary:
      "Stunning 4K drone cinematography capturing the Atlantic coastline, Western Area peninsula, and ongoing infrastructure expansion in Freetown.",
    videoUrl: "https://www.youtube.com/shorts/nmMUC8Zi8FQ",
    thumbnailUrl: "https://i.ytimg.com/vi/nmMUC8Zi8FQ/hqdefault.jpg",
    source: "Cultural Travels SL",
    sourceImage: "/globe.svg",
    category: "Tourism",
    location: "Freetown",
    publishedAt: new Date(Date.now() - 3600000 * 14).toISOString(),
    authorId: "cultural-travels",
    commentsCount: 41,
    status: "PUBLISHED",
  },
  {
    id: "reel-africanews-electoral",
    title: "Sierra Leone Electoral Updates and Political Briefing",
    summary:
      "Africanews analysis on parliamentary proceedings, constitutional governance, and electoral commission press briefings in Sierra Leone.",
    videoUrl: "https://www.youtube.com/shorts/1ZoeGbcwNN8",
    thumbnailUrl: "https://i.ytimg.com/vi/1ZoeGbcwNN8/hqdefault.jpg",
    source: "Africanews",
    sourceImage: "/globe.svg",
    category: "Politics",
    location: "National",
    publishedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    authorId: "africanews",
    commentsCount: 15,
    status: "PUBLISHED",
  },
  {
    id: "reel-leone-stars-afcon",
    title: "Leone Stars Football Match Highlights & Tactical Analysis",
    summary:
      "Official Confederation of African Football (CAF) tournament highlights featuring Sierra Leone's national team in continental competitive action.",
    videoUrl: "https://www.youtube.com/watch?v=cIjsnuWRM4U",
    thumbnailUrl: "https://i.ytimg.com/vi/cIjsnuWRM4U/hqdefault.jpg",
    source: "CAF TV / Leone Stars",
    sourceImage: "/globe.svg",
    category: "Sports",
    location: "Freetown",
    publishedAt: new Date(Date.now() - 3600000 * 22).toISOString(),
    authorId: "caf-tv",
    commentsCount: 57,
    status: "PUBLISHED",
  },
];
