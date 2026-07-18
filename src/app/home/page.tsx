import type { Metadata } from "next";
import { Suspense } from "react";
import BreakingNewsBanner from "./_components/BreakingNewsBanner";
import EditorsPicks from "./_components/EditorsPicks";
import PersonalizedFeed from "./_components/PersonalizedFeed";
import RecentlyViewed from "@/components/RecentlyViewed";
import { fetchMixedHomeFeed } from "@/lib/news-service";

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
  const fallbackArticles = await fetchMixedHomeFeed(PAGE_SIZE + 1);
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
        <BreakingNewsBanner />
      </Suspense>

      <Suspense fallback={null}>
        <EditorsPicks />
      </Suspense>

      <Suspense fallback={null}>
        <RecentlyViewed />
      </Suspense>

      <Suspense fallback={
        <div className="animate-pulse space-y-4">
          <div className="h-40 bg-gray-100 rounded-xl" />
          <div className="h-24 bg-gray-100 rounded-xl" />
          <div className="h-24 bg-gray-100 rounded-xl" />
          <div className="h-24 bg-gray-100 rounded-xl" />
        </div>
      }>
        <HomeContent />
      </Suspense>
    </div>
  );
}
