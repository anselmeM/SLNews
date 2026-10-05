import type { NewsArticle } from "./news-service";
import { calculateReadingTime } from "./reading-time";

export type DigestArticle = {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  location?: string;
  imageUrl: string;
  publishedAt: string;
  source: string;
  readTimeMinutes: number;
  matchReasons: string[];
};

export type DigestQuickBrief = {
  id: string;
  title: string;
  brief: string;
  category: string;
};

export type PersonalizedDigest = {
  dateFormatted: string;
  greeting: string;
  totalReadTimeMinutes: number;
  preferredTopics: string[];
  leadStory: DigestArticle | null;
  topicStories: DigestArticle[];
  quickBriefs: DigestQuickBrief[];
  fallbackToNational: boolean;
};

export type DigestOptions = {
  userName?: string | null;
  preferredTopics?: string[];
  articles: NewsArticle[];
  targetDate?: Date;
};

export function scoreAndFilterDigestArticles(
  articles: NewsArticle[],
  preferredTopics: string[] = []
): { article: DigestArticle; score: number }[] {
  const normTopics = preferredTopics.map((t) => t.trim().toLowerCase());
  const now = Date.now();

  return articles
    .map((art) => {
      let score = 0;
      const reasons: string[] = [];

      // Topic check
      if (normTopics.length > 0 && art.category) {
        const artCat = art.category.toLowerCase();
        const matched = normTopics.find((t) => artCat.includes(t) || t.includes(artCat));
        if (matched) {
          score += 4;
          reasons.push(art.category);
        }
      }

      // Recency scoring
      const pubTime = new Date(art.publishedAt).getTime();
      const ageHours = (now - pubTime) / (1000 * 60 * 60);
      if (ageHours <= 24) {
        score += 3;
      } else if (ageHours <= 48) {
        score += 1;
      }

      const readTime = calculateReadingTime(art.content || art.summary || "");

      return {
        article: {
          id: art.id,
          title: art.title,
          summary: art.summary,
          content: art.content,
          category: art.category,
          location: art.location,
          imageUrl: art.imageUrl,
          publishedAt: art.publishedAt,
          source: art.source,
          readTimeMinutes: readTime.minutes,
          matchReasons: reasons,
        },
        score,
      };
    })
    .sort((a, b) => b.score - a.score);
}

export function buildPersonalizedDigest(options: DigestOptions): PersonalizedDigest {
  const { userName, preferredTopics = [], articles, targetDate = new Date() } = options;

  const hours = targetDate.getHours();
  let timeGreeting = "Good Morning";
  if (hours >= 12 && hours < 17) {
    timeGreeting = "Good Afternoon";
  } else if (hours >= 17) {
    timeGreeting = "Good Evening";
  }

  const greeting = userName ? `${timeGreeting}, ${userName.split(" ")[0]}` : `${timeGreeting}`;

  const dateFormatted = targetDate.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const hasPreferences = preferredTopics.length > 0;
  const scored = scoreAndFilterDigestArticles(articles, preferredTopics);

  if (scored.length === 0) {
    return {
      dateFormatted,
      greeting,
      totalReadTimeMinutes: 0,
      preferredTopics,
      leadStory: null,
      topicStories: [],
      quickBriefs: [],
      fallbackToNational: true,
    };
  }

  const usedIds = new Set<string>();

  // 1. Lead Story: highest scoring article
  const topCandidate = scored[0];
  const leadStory = topCandidate ? topCandidate.article : null;
  if (leadStory) {
    usedIds.add(leadStory.id);
  }

  // 2. Topic Stories
  const normTopics = preferredTopics.map((t) => t.trim().toLowerCase());
  const topicStories: DigestArticle[] = [];
  if (normTopics.length > 0) {
    for (const item of scored) {
      if (usedIds.has(item.article.id)) continue;
      const cat = item.article.category.toLowerCase();
      if (normTopics.some((t) => cat.includes(t) || t.includes(cat))) {
        topicStories.push(item.article);
        usedIds.add(item.article.id);
        if (topicStories.length >= 4) break;
      }
    }
  }

  // Fallback for general stories if preferences yielded few items
  if (topicStories.length === 0) {
    for (const item of scored) {
      if (usedIds.has(item.article.id)) continue;
      topicStories.push(item.article);
      usedIds.add(item.article.id);
      if (topicStories.length >= 4) break;
    }
  }

  // 4. Quick Briefs (short punchy takeaways from remaining top articles)
  const quickBriefs: DigestQuickBrief[] = [];
  for (const item of scored) {
    if (usedIds.has(item.article.id)) continue;
    const briefText = item.article.summary || item.article.content.slice(0, 150) + "...";
    quickBriefs.push({
      id: item.article.id,
      title: item.article.title,
      brief: briefText,
      category: item.article.category,
    });
    usedIds.add(item.article.id);
    if (quickBriefs.length >= 4) break;
  }

  // Calculate total read time across all selected stories
  const totalReadTime =
    (leadStory ? leadStory.readTimeMinutes : 0) +
    topicStories.reduce((acc, s) => acc + s.readTimeMinutes, 0);

  return {
    dateFormatted,
    greeting,
    totalReadTimeMinutes: Math.max(1, Math.round(totalReadTime)),
    preferredTopics,
    leadStory,
    topicStories,
    quickBriefs,
    fallbackToNational: !hasPreferences,
  };
}

export function generateDigestAudioScript(digest: PersonalizedDigest): string {
  const parts: string[] = [
    `${digest.greeting}. Here is your Sierra Leone news digest for ${digest.dateFormatted}.`,
  ];

  if (digest.leadStory) {
    parts.push(`Today's lead story: ${digest.leadStory.title}. ${digest.leadStory.summary}`);
  }

  if (digest.topicStories.length > 0) {
    parts.push("In top stories you follow:");
    digest.topicStories.forEach((s) => {
      parts.push(`${s.title}. ${s.summary}`);
    });
  }

  if (digest.quickBriefs.length > 0) {
    parts.push("And quick briefs around Sierra Leone:");
    digest.quickBriefs.forEach((b) => {
      parts.push(`${b.title}. ${b.brief}`);
    });
  }

  parts.push("That is your SLNews digest. Stay informed throughout the day on SLNews.");
  return parts.join(" ");
}
