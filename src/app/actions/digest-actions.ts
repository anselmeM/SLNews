"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { buildPersonalizedDigest, type PersonalizedDigest } from "@/lib/digest-generator";
import { fetchMixedHomeFeed } from "@/lib/news-service";

export async function getPersonalizedDigest(): Promise<PersonalizedDigest> {
  const session = await auth();
  let userName: string | null = null;
  let preferredRegion: string | null = null;
  let preferredTopics: string[] = [];

  if (session?.user?.id) {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, preferredRegion: true, preferredTopics: true },
    });
    if (user) {
      userName = user.name;
      preferredRegion = user.preferredRegion;
      preferredTopics = user.preferredTopics || [];
    }
  }

  let articles: Awaited<ReturnType<typeof fetchMixedHomeFeed>> = [];
  try {
    articles = await fetchMixedHomeFeed(30);
  } catch {
    articles = [];
  }

  return buildPersonalizedDigest({
    userName,
    preferredRegion,
    preferredTopics,
    articles,
  });
}
