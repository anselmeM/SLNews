/**
 * Feed ranking by the reader's interest profile.
 *
 * Saving a story used to be a dead end: the bookmark only reached `/saved`,
 * `/offline` and a badge count, so the Investment phase of the habit loop never
 * improved the next visit. `rankFeedByInterest` closes that loop — saved
 * stories contribute the categories the reader cares about, and matching
 * stories are promoted into the next page of the feed.
 *
 * The promotion is deliberately **bounded**, not a filter: one matching story
 * in every `INTEREST_SLOT_EVERY` slots. A reader who only ever saves Tech
 * stories still gets national and world news; Tech just arrives sooner. An
 * unbounded sort by interest is how a news feed becomes a filter bubble, which
 * is the failure mode Eyal's own Manipulation Matrix warns about.
 */

/** Promote one interest-matching story per this many feed slots (1 in 3). */
export const INTEREST_SLOT_EVERY = 3;

/**
 * Reorders one page of feed candidates so interest matches surface earlier,
 * capped at `1 / INTEREST_SLOT_EVERY` of the page.
 *
 * `candidates` must arrive in the feed's natural (recency) order; relative
 * order is preserved inside both the matching and non-matching groups, so the
 * result stays stable and deterministic. With an empty interest profile this is
 * exactly `candidates.slice(0, take)` — the cold-start path for signed-out
 * readers, new accounts, and anyone who has saved nothing yet.
 */
export function rankFeedByInterest<T extends { id: string; category: string }>(
  candidates: readonly T[],
  interestCategories: ReadonlySet<string>,
  take: number
): T[] {
  const pageSize = Math.max(0, Math.floor(take));
  if (pageSize === 0) return [];

  const interest = normalized(interestCategories);
  if (interest.size === 0) return candidates.slice(0, pageSize);

  const matching: T[] = [];
  const rest: T[] = [];
  for (const candidate of candidates) {
    if (interest.has(candidate.category.trim().toLowerCase())) {
      matching.push(candidate);
    } else {
      rest.push(candidate);
    }
  }

  const ranked: T[] = [];

  while (ranked.length < pageSize) {
    const slot = ranked.length;
    const isPromotionSlot = slot % INTEREST_SLOT_EVERY === INTEREST_SLOT_EVERY - 1;
    // General news keeps its own slots unless there is not enough of it left to
    // fill them — then the most recent candidate wins, so a scarce general
    // story is never lifted above newer matching stories.
    const restCanCoverOwnSlots =
      rest.length >= nonPromotionSlotsLeft(slot, pageSize);
    const preferMatching =
      (isPromotionSlot && matching.length > 0) ||
      (rest.length === 0 && matching.length > 0) ||
      (matching.length > 0 && !restCanCoverOwnSlots && !isPromotionSlot);

    const next = preferMatching ? matching.shift() : rest.shift() ?? matching.shift();
    if (!next) break;
    ranked.push(next);
  }

  return ranked;
}

/** Non-promotion slots between `from` (inclusive) and `pageSize` (exclusive). */
function nonPromotionSlotsLeft(from: number, pageSize: number): number {
  let count = 0;
  for (let slot = from; slot < pageSize; slot++) {
    if (slot % INTEREST_SLOT_EVERY !== INTEREST_SLOT_EVERY - 1) count++;
  }
  return count;
}

function normalized(categories: ReadonlySet<string>): Set<string> {
  const out = new Set<string>();
  for (const category of categories) {
    const value = category.trim().toLowerCase();
    if (value) out.add(value);
  }
  return out;
}
