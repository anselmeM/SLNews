import { describe, it, expect } from "vitest";
import { calculateReadingTime } from "@/lib/reading-time";

describe("calculateReadingTime", () => {
  it("returns 1 min read for empty or null text", () => {
    expect(calculateReadingTime(null)).toEqual({ minutes: 1, text: "1 min read", words: 0 });
    expect(calculateReadingTime("")).toEqual({ minutes: 1, text: "1 min read", words: 0 });
    expect(calculateReadingTime("   ")).toEqual({ minutes: 1, text: "1 min read", words: 0 });
  });

  it("calculates 1 min read for short snippets under 200 words", () => {
    const text = "This is a short breaking news alert about Sierra Leone.";
    const result = calculateReadingTime(text);
    expect(result.minutes).toBe(1);
    expect(result.text).toBe("1 min read");
    expect(result.words).toBe(10);
  });

  it("calculates accurate reading time for longer text", () => {
    const words = Array(500).fill("news").join(" ");
    const result = calculateReadingTime(words);
    expect(result.minutes).toBe(3);
    expect(result.text).toBe("3 min read");
    expect(result.words).toBe(500);
  });
});
