import type { Metadata } from "next";
import { Suspense } from "react";
import { getPersonalizedDigest } from "@/app/actions/digest-actions";
import BreakingNewsBanner from "@/app/home/_components/BreakingNewsBanner";
import EditorsPicks from "@/app/home/_components/EditorsPicks";
import FollowingFeed from "@/app/home/_components/FollowingFeed";
import HomeBriefingHero from "@/app/home/_components/HomeBriefingHero";
import HomeFeed from "@/app/home/_components/HomeFeed";
import LatestStories from "@/components/LatestStories";
import RecentlyViewed from "@/components/RecentlyViewed";
import { ShimmerFeed } from "@/components/Shimmer";
import WelcomeBanner from "@/components/WelcomeBanner";
import { fetchMixedHomeFeed, type NewsArticle } from "@/lib/news-service";
import { siteUrl } from "@/lib/site-url";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "NewsMediaOrganization",
  name: "SLNews",
  url: siteUrl("/"),
  description: "Local news, market prices, and community notices for Sierra Leone.",
  logo: siteUrl("/icon-512x512.png"),
};

export const metadata: Metadata = {
  title: "SLNews | Sierra Leone Community News & Daily Briefing",
  description:
    "Live news, daily personalized executive briefings, market prices, and community notices for Sierra Leone.",
  openGraph: {
    title: "SLNews | Sierra Leone Community News & Daily Briefing",
    description:
      "Live news, daily personalized executive briefings, market prices, and community notices for Sierra Leone.",
    type: "website",
    siteName: "SLNews",
  },
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

export default async function FrontPage() {
  const digest = await getPersonalizedDigest();

  return (
    <div className="max-w-3xl mx-auto w-full pt-2">
      {/* Welcome & First-time visitor banner */}
      <WelcomeBanner />

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

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
    </div>
  );
}
