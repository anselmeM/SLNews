"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

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

  const currentTopic = searchParams.get("topic") || "all";

  function navigate(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("topic");
    } else {
      params.set("topic", value);
    }
    const qs = params.toString();
    startTransition(() => {
      router.push(`/news${qs ? `?${qs}` : ""}`);
    });
  }

  return (
    <>
      <nav className="flex overflow-x-auto scrollbar-hide gap-2.5 mb-6 pb-1">
        {TOPICS.map((t) => {
          const active = currentTopic === t.value;
          return (
            <button
              key={t.value}
              onClick={() => navigate(t.value)}
              disabled={isPending}
              className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-colors duration-200 cursor-pointer ${
                active
                  ? "bg-primary text-white shadow-sm"
                  : "bg-surface-variant text-on-surface-variant hover:bg-gray-200 dark:hover:bg-gray-700"
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
