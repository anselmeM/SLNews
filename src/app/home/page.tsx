import type { Metadata } from "next";
import { Suspense } from "react";
import BreakingNewsBanner from "./_components/BreakingNewsBanner";
import EditorsPicks from "./_components/EditorsPicks";
import FollowingFeed from "./_components/FollowingFeed";
import HomeBriefingHero from "./_components/HomeBriefingHero";
import HomeFeed from "./_components/HomeFeed";
import { getPersonalizedDigest } from "@/app/actions/digest-actions";
import LatestStories from "@/components/LatestStories";
import RecentlyViewed from "@/components/RecentlyViewed";
import { ShimmerFeed } from "@/components/Shimmer";
import { fetchMixedHomeFeed, type NewsArticle } from "@/lib/news-service";

export const metadata: Metadata = {
  title: "Home & Daily Briefing | SLNews",
  description: "Personalized daily news briefing, top stories and trending headlines from Sierra Leone.",
};

const PAGE_SIZE = 10;

async function HomeContent() {
  let fallbackArticles: NewsArticle[] = [];
  try {
    fallbackArticles = await fetchMixedHomeFeed(PAGE_SIZE + 1);
  } catch {
    fallbackArticles = [];
  }
  const hasMore = fallbackArticles.length > PAGE_SIZE;
  if (hasMore) fallbackArticles.pop();

  return <HomeFeed fallbackArticles={fallbackArticles} />;
}

export default async function Home() {
  const digest = await getPersonalizedDigest();

  return (
    <div className="max-w-3xl mx-auto w-full pt-2">
      {/* Personalized Executive Briefing Hero Card */}
      <HomeBriefingHero digest={digest} />

      <Suspense fallback={null}>
        <LatestStories />
      </Suspense>

      <Suspense fallback={null}>
        <BreakingNewsBanner />
      </Suspense>

      <Suspense fallback={null}>
        <EditorsPicks />
      </Suspense>

      <Suspense fallback={null}>
        <FollowingFeed />
      </Suspense>

      <Suspense fallback={null}>
        <RecentlyViewed />
      </Suspense>

      <Suspense fallback={<ShimmerFeed count={4} />}>
        <HomeContent />
      </Suspense>
    </div>
  );
}
