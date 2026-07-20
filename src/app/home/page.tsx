import type { Metadata } from "next";
import { Suspense } from "react";
import BreakingNewsBanner from "./_components/BreakingNewsBanner";
import EditorsPicks from "./_components/EditorsPicks";
import PersonalizedFeed from "./_components/PersonalizedFeed";
import RecentlyViewed from "@/components/RecentlyViewed";
import LatestStories from "@/components/LatestStories";
import { ShimmerFeed } from "@/components/Shimmer";
import { fetchMixedHomeFeed, type NewsArticle } from "@/lib/news-service";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

export const metadata: Metadata = {
  title: "Home | SLNews",
  description: "Top stories and trending news from Sierra Leone.",
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

  return <PersonalizedFeed fallbackArticles={fallbackArticles} />;
}

export default async function Home() {
  return (
    <div className="max-w-3xl mx-auto w-full">
      <div className="mb-8 mt-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-on-surface mb-1.5 tracking-tighter leading-tight">{getGreeting()}</h1>
        <p className="font-medium text-gray-500 text-sm md:text-base tracking-tight">Find out what&apos;s happening around Sierra Leone</p>
      </div>

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
        <RecentlyViewed />
      </Suspense>

      <Suspense fallback={<ShimmerFeed count={4} />}>
        <HomeContent />
      </Suspense>
    </div>
  );
}
