import type { Metadata } from "next";
import Link from "next/link";
import AnnouncementCard from "@/components/AnnouncementCard";
import type { Announcement } from "@/components/AnnouncementCard";
import ComingSoonButton from "@/components/ComingSoonButton";
import { cachedFetch } from "@/lib/cache";
import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export const metadata: Metadata = {
  title: "Announcements | SLNews",
  description: "Community notices, events, and public announcements across Sierra Leone.",
};

const REGIONS = ["All Regions", "Western Area", "Northern Province", "Southern Province", "Eastern Province"];
const CATEGORIES = ["All", "Government", "NGO Announcement", "Local Event", "Death Notice"];

export default async function CommunityAnnouncementsPage(props: {
  searchParams: Promise<{ region?: string; category?: string }>;
}) {
  const { region: regionParam, category: categoryParam } = await props.searchParams;
  const currentRegion = regionParam || "All Regions";
  const currentCategory = categoryParam || "All";

  const where: Prisma.AnnouncementWhereInput = { published: true };

  if (currentCategory !== "All") {
    where.category = currentCategory;
  }
  if (currentRegion !== "All Regions") {
    where.location = currentRegion;
  }

  let announcements: Announcement[] = [];
  try {
    announcements = await cachedFetch(`announcements:${currentRegion}:${currentCategory}`, async () =>
      db.announcement.findMany({ where, orderBy: { createdAt: "desc" } })
    , 120);
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
        <div className="relative w-full md:w-auto">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
          <select
            aria-label="Filter by region"
            defaultValue={currentRegion}
            onChange={(e) => {
              const params = new URLSearchParams(window.location.search);
              if (e.target.value === "All Regions") params.delete("region");
              else params.set("region", e.target.value);
              window.location.search = params.toString();
            }}
            className="appearance-none bg-surface-container-lowest border border-outline/30 text-on-surface font-label-md text-label-md py-2 pl-10 pr-10 rounded-full w-full md:w-64 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors shadow-sm"
          >
            {REGIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
        </div>

        <div className="w-full overflow-x-auto scrollbar-hide pb-1">
          <div className="flex gap-2 min-w-max">
            {CATEGORIES.map((cat) => {
              const isActive = currentCategory === cat;
              const params = new URLSearchParams();
              if (currentRegion !== "All Regions") params.set("region", currentRegion);
              if (cat !== "All") params.set("category", cat);
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

      <div className="fixed bottom-[calc(96px+env(safe-area-inset-bottom,0px))] right-4 md:bottom-8 md:right-8 z-40">
        <ComingSoonButton message="Notice posting coming soon!" className="bg-primary text-on-primary rounded-full px-4 py-3 shadow-[0_8px_16px_rgba(27,28,28,0.12)] flex items-center gap-2 hover:bg-on-primary-container transition-colors active:scale-95 cursor-pointer">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
          <span className="font-label-md text-label-md hidden md:inline">Post Notice</span>
        </ComingSoonButton>
      </div>
    </div>
  );
}
