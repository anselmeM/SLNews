"use client";

function cleanContent(content: string): string[] {
  // Split into paragraphs, filter out the "Source:" attribution line
  return content
    .split("\n\n")
    .map((p) => p.trim())
    .filter((p) => p && !p.startsWith("Source:"));
}

export function ArticleBody({ content }: { content: string }) {
  const paragraphs = cleanContent(content);

  if (paragraphs.length === 0) {
    return <p className="text-on-surface-variant italic">No content available.</p>;
  }

  return (
    <div className="text-[17px] leading-[1.75] text-on-surface space-y-5">
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
