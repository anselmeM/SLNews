"use server";

import { auth } from "@/auth";
import { invalidate } from "@/lib/cache";
import { db } from "@/lib/db";

export async function getFollowState(authorId: string): Promise<{
  following: boolean;
  followerCount: number;
}> {
  const session = await auth();

  const [followerCount, existing] = await Promise.all([
    db.follow.count({ where: { followingId: authorId } }),
    session?.user?.id
      ? db.follow.findUnique({
          where: {
            followerId_followingId: { followerId: session.user.id, followingId: authorId },
          },
          select: { id: true },
        })
      : Promise.resolve(null),
  ]);

  return { following: Boolean(existing), followerCount };
}

export async function toggleFollow(authorId: string): Promise<{
  success: boolean;
  following: boolean;
  followerCount: number;
  error?: string;
}> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, following: false, followerCount: 0, error: "You must be signed in to follow contributors." };

  if (authorId === session.user.id) return { success: false, following: false, followerCount: 0, error: "You cannot follow yourself." };

  try {
    const existing = await db.follow.findUnique({
      where: {
        followerId_followingId: { followerId: session.user.id, followingId: authorId },
      },
    });

    if (existing) {
      await db.follow.delete({ where: { id: existing.id } });
    } else {
      await db.follow.create({ data: { followerId: session.user.id, followingId: authorId } });
    }

    const followerCount = await db.follow.count({ where: { followingId: authorId } });
    invalidate("following:");
    return { success: true, following: !existing, followerCount };
  } catch {
    return { success: false, following: false, followerCount: 0, error: "Failed to update follow. Please try again." };
  }
}
