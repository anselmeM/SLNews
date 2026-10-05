"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { feedInterestCategories, normalizeTopics } from "@/lib/interest-profile";

export async function toggleSavedArticle(articleId: string): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const existing = await db.savedArticle.findUnique({
    where: { userId_articleId: { userId: session.user.id, articleId } },
  });

  if (existing) {
    await db.savedArticle.delete({ where: { id: existing.id } });
    return false;
  } else {
    await db.savedArticle.create({
      data: { userId: session.user.id, articleId },
    });
    return true;
  }
}

export async function getSavedArticleIds(): Promise<string[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const saved = await db.savedArticle.findMany({
    where: { userId: session.user.id },
    select: { articleId: true },
  });

  return saved.map((s) => s.articleId);
}

/**
 * Topics the reader follows plus the categories of the stories they saved. The
 * home feed ranks its next page with this profile, so following a topic or
 * bookmarking a story changes what the reader is shown instead of only
 * re-titling the briefing card.
 */
export async function getFeedInterestCategories(): Promise<string[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  return [...(await feedInterestCategories(session.user.id))];
}

export async function savePreferences(topics: string[]): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db.user.update({
    where: { id: session.user.id },
    data: { preferredTopics: normalizeTopics(topics) },
  });
}

export async function updateProfile(data: {
  name?: string;
  image?: string | null;
  bio?: string | null;
  preferredTopics?: string[];
}): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    await db.user.update({
      where: { id: session.user.id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.image !== undefined && { image: data.image }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.preferredTopics !== undefined && {
          preferredTopics: normalizeTopics(data.preferredTopics),
        }),
      },
    });
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update profile" };
  }
}

export async function loadPreferences(): Promise<{
  preferredTopics: string[];
  bio: string | null;
  dailyBriefing: boolean;
}> {
  const session = await auth();
  if (!session?.user?.id) {
    return { preferredTopics: [], bio: null, dailyBriefing: false };
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { preferredTopics: true, bio: true, dailyBriefing: true },
  });

  return {
    preferredTopics: normalizeTopics(user?.preferredTopics || []),
    bio: user?.bio || null,
    dailyBriefing: user?.dailyBriefing ?? false,
  };
}

export async function setDailyBriefing(enabled: boolean): Promise<{ success: boolean }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false };

  try {
    await db.user.update({
      where: { id: session.user.id },
      data: { dailyBriefing: Boolean(enabled) },
    });
    return { success: true };
  } catch {
    return { success: false };
  }
}
