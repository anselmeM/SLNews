"use client";

import { useMemo } from "react";

function extractTakeaways(summary: string | null, content: string): string[] {
  const points: string[] = [];

  if (summary && summary.trim().length > 20) {
    points.push(summary.trim());
  }

  // Split content into sentences and find key statements
  const paragraphs = content
    .split("\n\n")
    .map((p) => p.trim())
    .filter((p) => p.length > 40);

  for (const para of paragraphs) {
    if (points.length >= 3) break;
    // Check for sentences with strong informational signals
    const firstSentence = para.split(". ")[0]?.trim();
    if (
      firstSentence &&
      firstSentence.length > 30 &&
      !points.some((p) => p.includes(firstSentence) || firstSentence.includes(p))
    ) {
      points.push(firstSentence.endsWith(".") ? firstSentence : `${firstSentence}.`);
    }
  }

  return points.slice(0, 3);
}

export default function KeyTakeaways({
  summary,
  content,
}: {
  summary: string | null;
  content: string;
}) {
  const takeaways = useMemo(() => extractTakeaways(summary, content), [summary, content]);

  // Only render if article has sufficient substance
  if (takeaways.length < 2 || content.length < 180) {
    return null;
  }

  return (
    <aside
      aria-label="Executive Key Takeaways"
      className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-3xl p-5 sm:p-6 mb-8 shadow-xs"
    >
      <div className="flex items-center gap-2 mb-3.5">
        <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
          bolt
        </span>
        <h3 className="text-xs font-black uppercase tracking-wider text-primary">
          Key Takeaways
        </h3>
      </div>

      <ul className="space-y-2.5">
        {takeaways.map((point, i) => (
          <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm font-medium text-on-surface leading-relaxed">
            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2" />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
