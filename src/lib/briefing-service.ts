import { sendPushNotifications } from "@/app/actions/push-actions";
import { db } from "@/lib/db";
import { fetchMixedHomeFeed } from "@/lib/news-service";

export async function sendMorningBriefing(): Promise<{ sent: number; error?: string }> {
  const users = await db.user.findMany({
    where: { dailyBriefing: true },
    select: { id: true },
  });
  if (users.length === 0) return { sent: 0 };

  let articles;
  try {
    articles = await fetchMixedHomeFeed(3);
  } catch {
    return { sent: 0, error: "briefing skipped: could not load articles" };
  }
  if (articles.length === 0) return { sent: 0, error: "briefing skipped: no articles" };

  const top = articles[0];
  if (!top) return { sent: 0, error: "briefing skipped: no articles" };
  const more = articles.length - 1;
  const body =
    `${top.title}${more > 0 ? ` + ${more} more top stor${more > 1 ? "ies" : "y"}` : ""} — start your day with SLNews.`;

  return sendPushNotifications("Your Morning Briefing", body, "/home", {
    userIds: users.map((u) => u.id),
  });
}
