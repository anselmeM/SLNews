"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function toggleReaction(articleId: string, emoji: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const existing = await db.articleReaction.findUnique({
    where: { articleId_userId_emoji: { articleId, userId: session.user.id, emoji } },
  });

  if (existing) {
    await db.articleReaction.delete({ where: { id: existing.id } });
    return { added: false, emoji };
  }

  await db.articleReaction.create({
    data: { articleId, userId: session.user.id, emoji },
  });

  return { added: true, emoji };
}

export async function getReactions(articleId: string) {
  const reactions = await db.articleReaction.groupBy({
    by: ["emoji"],
    where: { articleId },
    _count: true,
  });

  const session = await auth();
  const userReactions = session?.user?.id
    ? await db.articleReaction.findMany({
        where: { articleId, userId: session.user.id },
        select: { emoji: true },
      })
    : [];

  const userEmojis = new Set(userReactions.map((r) => r.emoji));
  const map: Record<string, { count: number; reacted: boolean }> = {};

  for (const r of reactions) {
    map[r.emoji] = { count: r._count, reacted: userEmojis.has(r.emoji) };
  }

  return map;
}
