import type { Metadata } from "next";
import Link from "next/link";
import AnnouncementRegionFilter from "./_components/AnnouncementRegionFilter";
import AnnouncementCard from "@/components/AnnouncementCard";
import type { Announcement } from "@/components/AnnouncementCard";
import { ANNOUNCEMENT_CATEGORIES } from "@/lib/announcement-constants";
import { cachedFetch } from "@/lib/cache";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Announcements | SLNews",
  description: "Community notices, events, and public announcements across Sierra Leone.",
};

const CATEGORIES = ANNOUNCEMENT_CATEGORIES;

export default async function CommunityAnnouncementsPage(props: {
  searchParams: Promise<{ region?: string; category?: string; q?: string }>;
}) {
  const { region: regionParam, category: categoryParam, q: queryParam } = await props.searchParams;
  const currentRegion = regionParam || "All Regions";
  const currentCategory = categoryParam || "All";
  const currentQuery = queryParam || "";

  let announcements: Announcement[] = [];
  try {
    announcements = await cachedFetch(`announcements:${currentRegion}:${currentCategory}:${currentQuery}`, async () => {
      const where: Record<string, unknown> = { published: true };
      if (currentCategory !== "All") where.category = currentCategory;
      if (currentRegion !== "All Regions") where.location = currentRegion;
      if (currentQuery) {
        where.OR = [
          { title: { contains: currentQuery, mode: "insensitive" } },
          { organization: { contains: currentQuery, mode: "insensitive" } },
          { body: { contains: currentQuery, mode: "insensitive" } },
        ];
      }
      return db.announcement.findMany({ where, orderBy: { createdAt: "desc" } });
    }, 120);
  } catch {
    announcements = [];
  }

  return (
    <div className="w-full relative min-h-screen">
      <div className="mb-6">
        <h1 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-primary font-black tracking-tighter uppercase">
          Community Notices
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Important announcements, local events, and government notices.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
        <AnnouncementRegionFilter currentRegion={currentRegion} currentCategory={currentCategory} currentQuery={currentQuery} />

        <div className="w-full md:w-auto flex gap-2">
          {/* Search */}
          <form className="relative flex-1 md:flex-initial">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
            <input
              name="q"
              defaultValue={currentQuery}
              placeholder="Search notices..."
              className="w-full md:w-56 bg-surface-container-lowest border border-outline/30 rounded-xl py-2.5 pl-10 pr-4 text-sm text-on-surface placeholder-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {currentQuery && (
              <Link
                href={`/announcements${currentRegion !== "All Regions" ? `?region=${encodeURIComponent(currentRegion)}` : ""}${currentCategory !== "All" ? `${currentRegion !== "All Regions" ? "&" : "?"}category=${encodeURIComponent(currentCategory)}` : ""}`}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </Link>
            )}
            <button type="submit" hidden />
          </form>

          {/* Category pills - shown below on mobile */}
        </div>
      </div>

      <div className="w-full overflow-x-auto scrollbar-hide pb-1 mb-4">
        <div className="flex gap-2 min-w-max">
          {CATEGORIES.map((cat) => {
            const isActive = currentCategory === cat;
            const params = new URLSearchParams();
            if (currentRegion !== "All Regions") params.set("region", currentRegion);
            if (cat !== "All") params.set("category", cat);
            if (currentQuery) params.set("q", currentQuery);
            const qs = params.toString();
            return (
              <Link
                key={cat}
                href={`/announcements${qs ? `?${qs}` : ""}`}
                className={`px-4 py-1.5 rounded-full whitespace-nowrap transition-colors shadow-sm font-label-md text-label-md inline-block ${
                  isActive
                    ? "bg-primary-container text-on-primary-container"
                    : "bg-surface-container-lowest border border-outline/30 text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                {cat}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pb-24">
        {announcements.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <span className="material-symbols-outlined text-4xl mb-2 opacity-50 text-on-surface-variant">campaign</span>
            <p className="font-semibold text-sm text-on-surface-variant">No announcements found.</p>
          </div>
        ) : (
          announcements.map((a) => (
            <AnnouncementCard key={a.id} announcement={a} />
          ))
        )}
      </div>

      <Link
        href="/announcements/post"
        className="fixed bottom-[calc(96px+env(safe-area-inset-bottom,0px))] right-4 md:bottom-8 md:right-8 z-40 bg-primary text-on-primary rounded-full px-4 py-3 shadow-[0_8px_16px_rgba(27,28,28,0.12)] flex items-center gap-2 hover:bg-on-primary-container transition-colors active:scale-95"
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
        <span className="font-label-md text-label-md hidden md:inline">Post Notice</span>
      </Link>
    </div>
  );
}
