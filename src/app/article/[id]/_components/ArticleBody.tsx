"use client";

import { useAppStore } from "@/store/useAppStore";

function cleanContent(content: string): string[] {
  // Split into paragraphs, filter out the "Source:" attribution line
  return content
    .split("\n\n")
    .map((p) => p.trim())
    .filter((p) => p && !p.startsWith("Source:"));
}

const FONT_CLASSES: Record<string, string> = {
  normal: "text-[17px] leading-[1.75]",
  large: "text-[20px] leading-[1.8]",
  xlarge: "text-[23px] leading-[1.85]",
};

export function ArticleBody({ content }: { content: string }) {
  const fontSize = useAppStore((state) => state.fontSize);
  const fontClass = FONT_CLASSES[fontSize] || FONT_CLASSES.normal;
  const paragraphs = cleanContent(content);

  if (paragraphs.length === 0) {
    return <p className="text-on-surface-variant italic">No content available.</p>;
  }

  return (
    <div className={`${fontClass} text-on-surface space-y-5 transition-all duration-200`}>
      {paragraphs.map((p, i) => {
        const isFirst = i === 0;
        return (
          <p
            key={i}
            className={
              isFirst
                ? "text-lg leading-relaxed font-medium text-on-surface"
                : ""
            }
          >
            {isFirst && (
              <span className="float-left text-[52px] leading-[0.85] font-black text-primary mr-2 mt-1">
                {p.charAt(0)}
              </span>
            )}
            {isFirst ? p.slice(1) : p}
          </p>
        );
      })}
    </div>
  );
}
