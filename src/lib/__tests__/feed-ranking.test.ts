import { describe, it, expect } from "vitest";
import { rankFeedByInterest, INTEREST_SLOT_EVERY } from "../feed-ranking";

type Candidate = { id: string; category: string };

function candidate(id: string, category = "National"): Candidate {
  return { id, category };
}

/**
 * `rankFeedByInterest` is the whole of the saves→feed loop that is testable in
 * isolation: saved stories produce a set of categories, and this turns that set
 * into a feed order. The rules it must not break are "no saves = no change"
 * (cold start) and "never a pure filter bubble".
 */
describe("rankFeedByInterest", () => {
  const interest = new Set(["Tech"]);

  it("returns the plain recency page when the reader has no interest profile", () => {
    const candidates = [
      candidate("a"),
      candidate("b"),
      candidate("c", "Tech"),
      candidate("d"),
      candidate("e", "Tech"),
    ];

    expect(rankFeedByInterest(candidates, new Set(), 3)).toEqual([
      candidate("a"),
      candidate("b"),
      candidate("c", "Tech"),
    ]);
  });

  it("is a no-op for a signed-out reader with an empty candidate pool", () => {
    expect(rankFeedByInterest([], interest, 10)).toEqual([]);
  });

  it("promotes a saved-category story from deeper in the pool onto the first page", () => {
    const candidates = [
      candidate("a"),
      candidate("b"),
      candidate("c"),
      candidate("d"),
      candidate("e"),
      candidate("match", "Tech"),
      candidate("f"),
    ];

    const unranked = candidates.slice(0, 4).map((c) => c.id);
    const ranked = rankFeedByInterest(candidates, interest, 4).map((c) => c.id);

    // Without the signal, "match" (sixth by recency) would not make the page.
    expect(unranked).not.toContain("match");
    expect(ranked).toContain("match");
    expect(ranked).not.toEqual(unranked);
  });

  it("places the first promotion in the third slot", () => {
    const candidates = [
      candidate("a"),
      candidate("b"),
      candidate("c"),
      candidate("d"),
      candidate("match", "Tech"),
    ];

    const ranked = rankFeedByInterest(candidates, interest, 5).map((c) => c.id);

    expect(ranked[INTEREST_SLOT_EVERY - 1]).toBe("match");
    expect(ranked.indexOf("match")).toBeLessThan(
      candidates.findIndex((c) => c.id === "match")
    );
  });

  it("caps promotions at one slot in three so the feed stays mixed", () => {
    const candidates = [
      candidate("m1", "Tech"),
      candidate("m2", "Tech"),
      candidate("m3", "Tech"),
      candidate("m4", "Tech"),
      candidate("m5", "Tech"),
      candidate("m6", "Tech"),
      candidate("n1"),
      candidate("n2"),
      candidate("n3"),
      candidate("n4"),
      candidate("n5"),
      candidate("n6"),
    ];

    const ranked = rankFeedByInterest(candidates, interest, 9);
    const matches = ranked.filter((c) => c.category === "Tech").length;
    const general = ranked.filter((c) => c.category !== "Tech").length;

    // Six of the newest twelve are Tech. An unbounded "sort by interest" would
    // fill the page with all six; the slot budget caps the page at three.
    expect(ranked).toHaveLength(9);
    expect(matches).toBe(Math.ceil(9 / INTEREST_SLOT_EVERY));
    expect(general).toBeGreaterThan(matches);
  });

  it("keeps general news on the page when the reader only saves one category", () => {
    const candidates = [
      candidate("m1", "Tech"),
      candidate("m2", "Tech"),
      candidate("m3", "Tech"),
      candidate("n1"),
      candidate("n2"),
      candidate("n3"),
      candidate("n4"),
      candidate("n5"),
      candidate("n6"),
      candidate("n7"),
    ];

    const ranked = rankFeedByInterest(candidates, interest, 9);
    const matches = ranked.filter((c) => c.category === "Tech").length;

    expect(ranked).toHaveLength(9);
    expect(matches).toBeLessThanOrEqual(Math.ceil(9 / INTEREST_SLOT_EVERY));
    // Not a filter bubble: general news still fills most of the page.
    expect(ranked.filter((c) => c.category !== "Tech").length).toBeGreaterThan(
      matches
    );
  });

  it("preserves recency order within both the matching and non-matching groups", () => {
    const candidates = [
      candidate("m1", "Tech"),
      candidate("n1"),
      candidate("m2", "Tech"),
      candidate("n2"),
      candidate("n3"),
      candidate("m3", "Tech"),
    ];

    const ranked = rankFeedByInterest(candidates, interest, 6).map((c) => c.id);

    expect(ranked.filter((id) => id.startsWith("m"))).toEqual(["m1", "m2", "m3"]);
    expect(ranked.filter((id) => id.startsWith("n"))).toEqual(["n1", "n2", "n3"]);
  });

  it("fills the tail from the remaining group rather than returning a short page", () => {
    const mostlyMatching = [
      candidate("m1", "Tech"),
      candidate("m2", "Tech"),
      candidate("m3", "Tech"),
      candidate("m4", "Tech"),
      candidate("n1"),
    ];
    // Only one general story exists, so it cannot fill its own slots — but the
    // page still ends with it rather than lifting the older general story to
    // the top ahead of newer matching stories.
    expect(rankFeedByInterest(mostlyMatching, interest, 4).map((c) => c.id)).toEqual([
      "m1",
      "m2",
      "m3",
      "n1",
    ]);

    const mostlyGeneral = [
      candidate("n1"),
      candidate("n2"),
      candidate("n3"),
      candidate("n4"),
      candidate("m1", "Tech"),
    ];
    const ranked = rankFeedByInterest(mostlyGeneral, interest, 5).map((c) => c.id);
    expect(ranked).toHaveLength(5);
    expect(ranked).toContain("m1");
    expect([...ranked].sort()).toEqual(["m1", "n1", "n2", "n3", "n4"]);
  });

  it("matches categories case-insensitively and ignores blank entries", () => {
    const candidates = [candidate("a"), candidate("b"), candidate("c"), candidate("d", "TECH")];

    const ranked = rankFeedByInterest(candidates, new Set([" tech ", ""]), 4);

    expect(ranked[INTEREST_SLOT_EVERY - 1]?.id).toBe("d");
  });

  it("never duplicates a candidate and is deterministic", () => {
    const candidates = [
      candidate("a"),
      candidate("b", "Tech"),
      candidate("c"),
      candidate("d", "Tech"),
      candidate("e"),
    ];

    const first = rankFeedByInterest(candidates, interest, 5).map((c) => c.id);
    const second = rankFeedByInterest(candidates, interest, 5).map((c) => c.id);

    expect(first).toEqual(second);
    expect(new Set(first).size).toBe(first.length);
    expect([...first].sort()).toEqual(["a", "b", "c", "d", "e"]);
  });

  it("returns nothing for a non-positive page size", () => {
    expect(rankFeedByInterest([candidate("a", "Tech")], interest, 0)).toEqual([]);
  });
});
