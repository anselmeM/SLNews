"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

const TOPICS = [
  "World",
  "Africa",
  "Business",
  "Tech",
  "Health",
  "Sports",
  "Culture",
];

export default function WorldTabFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentTopic = searchParams.get("topic") || "World";

  function navigate(topic: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (topic === "World") {
      params.delete("topic");
    } else {
      params.set("topic", topic);
    }
    const qs = params.toString();
    startTransition(() => {
      router.push(`/world${qs ? `?${qs}` : ""}`);
    });
  }

  return (
    <>
      <nav className="flex overflow-x-auto scrollbar-hide gap-2.5 mb-6 pb-1">
        {TOPICS.map((topic) => {
          const active = currentTopic === topic;
          return (
            <button
              key={topic}
              onClick={() => navigate(topic)}
              disabled={isPending}
              className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-colors duration-200 cursor-pointer ${
                active
                  ? "bg-primary text-white shadow-sm"
                  : "bg-surface-variant text-on-surface-variant hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {topic}
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
