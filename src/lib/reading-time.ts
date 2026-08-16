/**
 * Calculates estimated reading time for article text based on standard ~200 words per minute.
 */
export function calculateReadingTime(text: string | null | undefined): {
  minutes: number;
  text: string;
  words: number;
} {
  if (!text || typeof text !== "string") {
    return { minutes: 1, text: "1 min read", words: 0 };
  }

  const clean = text.trim();
  if (!clean) {
    return { minutes: 1, text: "1 min read", words: 0 };
  }

  const words = clean.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));

  return {
    minutes,
    text: `${minutes} min read`,
    words,
  };
}
