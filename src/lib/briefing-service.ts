import { sendPushNotifications } from "@/app/actions/push-actions";
import { db } from "@/lib/db";
import { buildPersonalizedDigest } from "@/lib/digest-generator";
import { fetchMixedHomeFeed } from "@/lib/news-service";

export function formatMorningBriefingPayload(digest: {
  leadStory?: { title: string } | null;
  topicStories?: unknown[];
  regionalStories?: unknown[];
  quickBriefs?: unknown[];
  totalReadTimeMinutes?: number;
}, user?: {
  name?: string | null;
  preferredRegion?: string | null;
  preferredTopics?: string[];
}) {
  let title = "🌅 Your Morning Briefing";
  if (user?.preferredRegion) {
    title = `🌅 ${user.preferredRegion} & Top Stories`;
  } else if (user?.preferredTopics && user.preferredTopics.length > 0) {
    title = `🌅 ${user.preferredTopics[0]} & Morning Brief`;
  }

  const leadTitle = digest.leadStory?.title || "Today's top stories are ready";
  const moreCount =
    (digest.topicStories?.length || 0) +
    (digest.regionalStories?.length || 0) +
    (digest.quickBriefs?.length || 0);

  const body = `${leadTitle}${
    moreCount > 0 ? ` (+${moreCount} stories)` : ""
  } — ${digest.totalReadTimeMinutes || 3} min read on SLNews.`;

  const todayStr = new Date().toISOString().slice(0, 10);

  return {
    title,
    body,
    url: "/digest",
    tag: `slnews-morning-briefing-${todayStr}`,
    actions: [{ action: "open", title: "Listen / Read" }],
  };
}

export async function sendMorningBriefing(): Promise<{ sent: number; error?: string }> {
  const users = await db.user.findMany({
    where: { dailyBriefing: true },
    select: { id: true, name: true, preferredRegion: true, preferredTopics: true },
  });

  let articles;
  try {
    articles = await fetchMixedHomeFeed(25);
  } catch {
    return { sent: 0, error: "briefing skipped: could not load articles" };
  }
  if (!articles || articles.length === 0) {
    return { sent: 0, error: "briefing skipped: no articles" };
  }

  let totalSent = 0;

  if (users.length > 0) {
    for (const user of users) {
      const digest = buildPersonalizedDigest({
        userName: user.name,
        preferredRegion: user.preferredRegion,
        preferredTopics: user.preferredTopics,
        articles,
      });

      if (!digest.leadStory) continue;

      const payload = formatMorningBriefingPayload(digest, user);
      const result = await sendPushNotifications(
        payload.title,
        payload.body,
        payload.url,
        {
          userId: user.id,
          tag: payload.tag,
          actions: payload.actions,
        }
      );
      if (result.sent > 0) {
        totalSent += result.sent;
      }
    }
  } else {
    // If no users explicitly checked dailyBriefing, broadcast a general morning digest
    const digest = buildPersonalizedDigest({
      articles,
    });

    if (digest.leadStory) {
      const payload = formatMorningBriefingPayload(digest);
      const result = await sendPushNotifications(
        payload.title,
        payload.body,
        payload.url,
        {
          tag: payload.tag,
          actions: payload.actions,
        }
      );
      totalSent += result.sent;
    }
  }

  return { sent: totalSent };
}
