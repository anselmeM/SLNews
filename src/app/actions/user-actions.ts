"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

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

export async function savePreferences(region: string | null, topics: string[]): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db.user.update({
    where: { id: session.user.id },
    data: {
      preferredRegion: region,
      preferredTopics: topics,
    },
  });
}

export async function updateProfile(data: {
  name?: string;
  image?: string | null;
  bio?: string | null;
  preferredRegion?: string | null;
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
        ...(data.preferredRegion !== undefined && { preferredRegion: data.preferredRegion }),
        ...(data.preferredTopics !== undefined && { preferredTopics: data.preferredTopics }),
      },
    });
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update profile" };
  }
}

export async function loadPreferences(): Promise<{
  preferredRegion: string | null;
  preferredTopics: string[];
  bio: string | null;
}> {
  const session = await auth();
  if (!session?.user?.id) return { preferredRegion: null, preferredTopics: [], bio: null };

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { preferredRegion: true, preferredTopics: true, bio: true },
  });

  return {
    preferredRegion: user?.preferredRegion || null,
    preferredTopics: user?.preferredTopics || [],
    bio: user?.bio || null,
  };
}
