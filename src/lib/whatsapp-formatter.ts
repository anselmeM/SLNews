/**
 * Utility functions for formatting viral, high-readability WhatsApp news digests
 * with standard WhatsApp formatting syntax (*bold*, _italic_, ~strikethrough~, bullet lists).
 */

export interface ArticleSharePayload {
  id: string;
  title: string;
  summary?: string | null;
  content: string;
  location?: string;
  category?: string;
  source?: string;
}

export interface BriefingSharePayload {
  dateFormatted: string;
  greeting?: string;
  leadStory?: {
    id: string;
    title: string;
    summary?: string;
    category?: string;
  } | null;
  regionalStories?: Array<{
    id: string;
    title: string;
    location?: string;
  }>;
}

function extractKeyPoints(summary: string | null | undefined, content: string): string[] {
  const points: string[] = [];

  if (summary && summary.trim().length > 20) {
    points.push(summary.trim());
  }

  const paragraphs = content
    .split("\n\n")
    .map((p) => p.trim())
    .filter((p) => p.length > 40);

  for (const para of paragraphs) {
    if (points.length >= 2) break;
    const firstSentence = para.split(". ")[0]?.trim();
    if (
      firstSentence &&
      firstSentence.length > 30 &&
      !points.some((p) => p.includes(firstSentence) || firstSentence.includes(p))
    ) {
      points.push(firstSentence.endsWith(".") ? firstSentence : `${firstSentence}.`);
    }
  }

  return points.slice(0, 2);
}

export function formatArticleWhatsAppDigest(
  article: ArticleSharePayload,
  siteUrl = "https://slnews.sl"
): string {
  const keyPoints = extractKeyPoints(article.summary, article.content);
  const articleUrl = `${siteUrl.replace(/\/$/, "")}/article/${article.id}`;
  const locationTag = article.location ? `📍 *Region:* ${article.location}` : "📍 *Coverage:* Sierra Leone";

  const lines: string[] = [
    "🇸🇱 *SLNews Exclusive*",
    `📰 *${article.title.trim()}*`,
    "",
  ];

  if (keyPoints.length > 0) {
    lines.push("⚡ *Key Takeaways:*");
    for (const pt of keyPoints) {
      lines.push(`• ${pt}`);
    }
    lines.push("");
  }

  lines.push(locationTag);
  if (article.category) {
    lines.push(`🏷️ *Category:* ${article.category}`);
  }
  lines.push(`🔗 *Read full story:* ${articleUrl}`);

  return lines.join("\n");
}

export function formatBriefingWhatsAppDigest(
  briefing: BriefingSharePayload,
  siteUrl = "https://slnews.sl"
): string {
  const homeUrl = `${siteUrl.replace(/\/$/, "")}/home`;
  const lines: string[] = [
    `🇸🇱 *SLNews Daily Briefing* — _${briefing.dateFormatted}_`,
    briefing.greeting ? `${briefing.greeting}!` : "Good Morning Sierra Leone!",
    "",
  ];

  if (briefing.leadStory) {
    lines.push(`⭐ *Top Headline:*`);
    lines.push(`*${briefing.leadStory.title.trim()}*`);
    if (briefing.leadStory.summary) {
      lines.push(`${briefing.leadStory.summary.slice(0, 160)}...`);
    }
    lines.push("");
  }

  if (briefing.regionalStories && briefing.regionalStories.length > 0) {
    lines.push(`📌 *Provincial & National Highlights:*`);
    for (const story of briefing.regionalStories.slice(0, 3)) {
      const loc = story.location ? `[${story.location}] ` : "";
      lines.push(`• ${loc}${story.title}`);
    }
    lines.push("");
  }

  lines.push(`👉 *Open your personalized digest & audio playlist:*`);
  lines.push(`${homeUrl}`);

  return lines.join("\n");
}

export function getWhatsAppShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
