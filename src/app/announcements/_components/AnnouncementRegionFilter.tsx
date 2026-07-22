"use client";

import { useRouter } from "next/navigation";

const REGIONS = ["All Regions", "Western Area", "Northern Province", "Southern Province", "Eastern Province"];

export default function AnnouncementRegionFilter({
  currentRegion,
  currentCategory,
}: {
  currentRegion: string;
  currentCategory: string;
}) {
  const router = useRouter();

  function updateRegion(region: string) {
    const params = new URLSearchParams();
    if (region !== "All Regions") params.set("region", region);
    if (currentCategory !== "All") params.set("category", currentCategory);
    const query = params.toString();
    router.push(`/announcements${query ? `?${query}` : ""}`);
  }

  return (
    <div className="relative w-full md:w-auto">
      <span
        className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        location_on
      </span>
      <select
        aria-label="Filter by region"
        value={currentRegion}
        onChange={(event) => updateRegion(event.target.value)}
        className="appearance-none bg-surface-container-lowest border border-outline/30 text-on-surface font-label-md text-label-md py-2 pl-10 pr-10 rounded-full w-full md:w-64 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors shadow-sm"
      >
        {REGIONS.map((region) => (
          <option key={region} value={region}>
            {region}
          </option>
        ))}
      </select>
      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
        expand_more
      </span>
    </div>
  );
}
