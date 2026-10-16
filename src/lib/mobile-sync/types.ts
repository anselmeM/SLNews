/**
 * Shapes for the mobile sync API (contract v1).
 *
 * The DTOs below are the wire format the Flutter app depends on, so they mirror
 * `SLNews-Mobile/docs/SYNC-API.md` rather than the Prisma rows: timestamps cross
 * the boundary as ISO-8601 strings and a deletion is the boolean `deleted`
 * rather than the `deletedAt` column. The `*Snapshot` types are the validated
 * client input, kept as `Date`s because that is what the driver binds.
 */

/** A reader's saved story, as the client sees it. */
export interface BookmarkDTO {
  itemId: string;
  title: string;
  sourceUrl: string | null;
  imageUrl: string | null;
  publisher: string | null;
  publishedAt: string | null;
  savedAt: string;
  updatedAt: string;
  deleted: boolean;
}

/** A reader's reaction to a story (`like` today). */
export interface ReactionDTO {
  itemId: string;
  kind: string;
  updatedAt: string;
  deleted: boolean;
}

/** A followed team, league, location, topic or publisher. */
export interface FollowDTO {
  targetId: string;
  kind: string;
  label: string | null;
  updatedAt: string;
  deleted: boolean;
}

export interface BookmarkSnapshot {
  itemId: string;
  title: string;
  sourceUrl: string | null;
  imageUrl: string | null;
  publisher: string | null;
  publishedAt: Date | null;
  savedAt: Date;
  updatedAt: Date;
  deleted: boolean;
}

export interface ReactionSnapshot {
  itemId: string;
  kind: string;
  updatedAt: Date;
  deleted: boolean;
}

export interface FollowSnapshot {
  targetId: string;
  kind: string;
  label: string | null;
  updatedAt: Date;
  deleted: boolean;
}

/** Every collection defaults to empty, so any subset may be pushed. */
export interface SyncPushPayload {
  bookmarks: BookmarkSnapshot[];
  reactions: ReactionSnapshot[];
  follows: FollowSnapshot[];
}

export interface SyncPullResult {
  bookmarks: BookmarkDTO[];
  reactions: ReactionDTO[];
  follows: FollowDTO[];
  hasMore: boolean;
}

/** A row the merge engine refused; the rest of the batch still applies. */
export interface RejectedRow {
  collection: SyncCollection;
  itemId: string;
  reason: string;
}

/** The server's rows for everything the client touched. */
export interface SyncState {
  bookmarks: BookmarkDTO[];
  reactions: ReactionDTO[];
  follows: FollowDTO[];
}

export interface SyncPushResult {
  applied: Record<SyncCollection, number>;
  rejected: RejectedRow[];
  state: SyncState;
}

export type SyncCollection = "bookmarks" | "reactions" | "follows";

/**
 * The only per-row rejection reason in v1. An equal-`updatedAt` push is
 * idempotent-applied rather than rejected: the stored row already *is* the
 * client's intent, so there is nothing to write and nothing to complain about.
 */
export const STALE_REASON = "stale";

/** A tombstone never changes without a strictly newer `updatedAt`. */
export const SYNC_LIMITS = {
  /** ≤ 500 rows per collection; over the cap is 413 (contract §Limits). */
  maxRowsPerCollection: 500,
  /** ≤ 200 KB body; over the cap is 413. */
  maxBodyBytes: 200 * 1024,
  /** Item and target ids are opaque; the contract caps them at 128 chars. */
  maxIdLength: 128,
  maxTitleLength: 512,
  maxUrlLength: 2048,
  maxLabelLength: 256,
  /** GET `limit` is 1–500 per collection, default 500. */
  defaultPullLimit: 500,
  minPullLimit: 1,
  maxPullLimit: 500,
  /** 60 requests / 15 min per user. */
  maxRequestsPerWindow: 60,
  rateLimitWindowMs: 15 * 60 * 1000,
} as const;
