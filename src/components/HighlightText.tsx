import React from "react";

export default function HighlightText({
  text,
  query,
  className = "",
}: {
  text: string;
  query?: string;
  className?: string;
}) {
  if (!query || !query.trim() || !text) {
    return <span className={className}>{text}</span>;
  }

  // Escape special regex characters
  const sanitizedQuery = query
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");

  if (!sanitizedQuery) {
    return <span className={className}>{text}</span>;
  }

  const regex = new RegExp(`(${sanitizedQuery})`, "gi");
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark
            key={index}
            className="bg-primary/20 text-primary font-semibold rounded px-0.5"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
}
