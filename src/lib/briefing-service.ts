import { sendPushNotifications } from "@/app/actions/push-actions";
import { db } from "@/lib/db";
import { buildPersonalizedDigest } from "@/lib/digest-generator";
import { fetchMixedHomeFeed } from "@/lib/news-service";

export async function sendMorningBriefing(): Promise<{ sent: number; error?: string }> {
  const users = await db.user.findMany({
    where: { dailyBriefing: true },
    select: { id: true, name: true, preferredRegion: true, preferredTopics: true },
  });
  if (users.length === 0) return { sent: 0 };

  let articles;
  try {
    articles = await fetchMixedHomeFeed(25);
  } catch {
    return { sent: 0, error: "briefing skipped: could not load articles" };
  }
  if (articles.length === 0) return { sent: 0, error: "briefing skipped: no articles" };

  let totalSent = 0;

  // Process personalized briefings per user
  for (const user of users) {
    const digest = buildPersonalizedDigest({
      userName: user.name,
      preferredRegion: user.preferredRegion,
      preferredTopics: user.preferredTopics,
      articles,
    });

    if (!digest.leadStory) continue;

    let title = "Your Morning Briefing";
    if (user.preferredRegion) {
      title = `${user.preferredRegion} & Top Stories`;
    } else if (user.preferredTopics.length > 0) {
      title = `${user.preferredTopics[0]} & Morning Brief`;
    }

    const leadTitle = digest.leadStory.title;
    const moreCount = digest.topicStories.length + digest.regionalStories.length + digest.quickBriefs.length;
    const body =
      `${leadTitle}${moreCount > 0 ? ` (+${moreCount} curated stories)` : ""} — ${digest.totalReadTimeMinutes} min read on SLNews.`;

    const result = await sendPushNotifications(title, body, "/digest", {
      userIds: [user.id],
    });
    if (result.sent > 0) {
      totalSent += result.sent;
    }
  }

  return { sent: totalSent };
}
