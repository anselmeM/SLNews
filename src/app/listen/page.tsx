import type { Metadata } from "next";
import ListenPageClient from "./_components/ListenPageClient";
import { fetchMixedHomeFeed } from "@/lib/news-service";

export const metadata: Metadata = {
  title: "Audio Studio & Podcasts | SLNews",
  description: "Listen to continuous voice streams and curated audio playlists of Sierra Leone news.",
};

export const dynamic = "force-dynamic";

export default async function ListenPage() {
  let articles: Awaited<ReturnType<typeof fetchMixedHomeFeed>> = [];
  try {
    articles = await fetchMixedHomeFeed(30);
  } catch {
    articles = [];
  }

  return (
    <div className="w-full min-h-screen pb-16">
      <ListenPageClient initialArticles={articles} />
    </div>
  );
}
