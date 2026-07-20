"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

const REGIONS = [
  { label: "All", value: "all" },
  { label: "Western", value: "Western Area" },
  { label: "Southern", value: "Southern" },
  { label: "Eastern", value: "Eastern" },
  { label: "Northern", value: "Northern" },
];

const TOPICS = [
  { label: "All", value: "all" },
  { label: "Politics", value: "Politics" },
  { label: "Economy", value: "Economy" },
  { label: "Education", value: "Education" },
];

export default function TabFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentRegion = searchParams.get("region") || "all";
  const currentTopic = searchParams.get("topic") || "all";

  function navigate(param: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete(param);
    } else {
      params.set(param, value);
    }
    const qs = params.toString();
    startTransition(() => {
      router.push(`/news${qs ? `?${qs}` : ""}`);
    });
  }

  return (
    <>
      <nav className="flex overflow-x-auto scrollbar-hide gap-2.5 mb-3 pb-1">
        {REGIONS.map((r) => {
          const active = currentRegion === r.value;
          return (
            <button
              key={r.value}
              onClick={() => navigate("region", r.value)}
              disabled={isPending}
              className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-colors duration-200 cursor-pointer ${
                active
                  ? "bg-primary text-white shadow-sm"
                  : "bg-surface-variant text-on-surface-variant hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {r.label}
            </button>
          );
        })}
      </nav>

      <nav className="flex overflow-x-auto scrollbar-hide gap-2.5 mb-6 pb-1">
        {TOPICS.map((t) => {
          const active = currentTopic === t.value;
          return (
            <button
              key={t.value}
              onClick={() => navigate("topic", t.value)}
              disabled={isPending}
              className={`px-3 py-1.5 rounded-full font-semibold text-xs whitespace-nowrap transition-colors duration-200 cursor-pointer ${
                active
                  ? "bg-secondary text-white shadow-sm"
                  : "bg-surface-container-lowest border border-outline/20 text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </nav>

      {isPending && (
        <div className="h-0.5 bg-primary/30 rounded-full overflow-hidden mb-4">
          <div className="h-full bg-primary w-1/3 rounded-full animate-[pulse_800ms_ease-in-out_infinite]" />
        </div>
      )}
    </>
  );
}
