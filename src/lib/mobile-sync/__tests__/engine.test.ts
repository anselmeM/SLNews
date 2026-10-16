/**
 * Merge-engine tests against an in-memory fake database.
 *
 * The route tests mock the engine's data access at the Prisma boundary only, but
 * the interesting half of the contract lives in SQL: what the `ON CONFLICT …
 * WHERE updatedAt >` guard and the recomputed `deletedAt` actually keep. The fake
 * below executes the two statements the engine issues against a table in a Map,
 * so the invariants (stale rejection, idempotency, tombstone, chunking) are
 * exercised rather than assumed — no live Neon dependency.
 */
import type { Prisma } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { applySync, pullChanges, type MobileSyncDb } from "../engine";
import type { BookmarkDbRow, FollowDbRow, ReactionDbRow } from "../engine";
import type { BookmarkSnapshot, FollowSnapshot, ReactionSnapshot } from "../types";

type Row = Record<string, unknown>;

const TABLES = ["mobileBookmark", "mobileReaction", "mobileFollow"] as const;
type TableName = (typeof TABLES)[number];

/** The engine emits Postgres table names; the maps are keyed by Prisma model. */
const MODEL_OF_TABLE: Record<string, TableName | undefined> = {
  '"MobileBookmark"': "mobileBookmark",
  '"MobileReaction"': "mobileReaction",
  '"MobileFollow"': "mobileFollow",
};

const COLUMNS: Record<TableName, string[]> = {
  mobileBookmark: [
    "id",
    "userId",
    "itemId",
    "title",
    "sourceUrl",
    "imageUrl",
    "publisher",
    "publishedAt",
    "savedAt",
    "updatedAt",
    "deletedAt",
  ],
  mobileReaction: ["id", "userId", "itemId", "kind", "updatedAt", "deletedAt"],
  mobileFollow: ["id", "userId", "targetId", "kind", "label", "updatedAt", "deletedAt"],
};

/**
 * The tuple groups the engine bound: `(…$2::text, $3::timestamp(3)…), (…)`.
 *
 * A regex cannot do this — the casts introduce nested parentheses
 * (`NULL::timestamp(3)`), so the groups are walked with a depth counter. Only
 * called for statements this engine builds, so the shape is known.
 */
function tuples(sql: string, values: unknown[]): unknown[][] {
  const body = sql.slice(sql.indexOf("(VALUES ") + "(VALUES ".length);
  const groups: string[] = [];
  let depth = 0;
  let start = -1;

  for (let index = 0; index < body.length; index += 1) {
    const char = body[index];
    if (char === "(") {
      if (depth === 0) start = index + 1;
      depth += 1;
      continue;
    }
    if (char === ")" && depth > 0) {
      depth -= 1;
      if (depth === 0 && start >= 0) groups.push(body.slice(start, index));
      // Past the tuples is the `AS source (…)` alias and the statement tail.
      if (depth === 0 && !/^\s*,/.test(body.slice(index + 1))) break;
    }
  }

  return groups
    .filter((group) => /^\s*\$\d+/.test(group))
    .map((group) =>
      [...group.matchAll(/\$(\d+)/g)].map((token) => values[Number(token[1]) - 1])
    );
}

/**
 * The column order of the tuples: `INSERT INTO "T" ("a", …)` for the insert, the
 * `AS source ("a", …)` alias for the guarded update.
 */
function columnList(sql: string): string[] {
  const match = /INSERT INTO "[^"]+" \(([^)]*)\)/.exec(sql) ?? /AS source \(([^)]*)\)/.exec(sql);
  if (!match?.[1]) return [];
  return match[1]
    .split(",")
    .map((column) => column.trim().replace(/^"|"$/g, ""))
    .filter(Boolean);
}

function keyOf(table: TableName, row: Row): string {
  return table === "mobileFollow" ? String(row.targetId) : String(row.itemId);
}

interface FakeDb {
  db: MobileSyncDb;
  tables: Record<TableName, Map<string, Row>>;
  statements: string[];
}

const DATE_COLUMNS = ["publishedAt", "savedAt", "updatedAt", "deletedAt"];

/**
 * Postgres returns `timestamp(3)` as a `Date`; coerce on the way in so a test
 * seed that spells a timestamp as a number does not silently compare as one.
 */
function typedRow(row: Row): Row {
  const typed: Row = { ...row };
  for (const column of DATE_COLUMNS) {
    const value = typed[column];
    if (typeof value === "number") typed[column] = new Date(value);
  }
  return typed;
}

function fakeDb(seed: Partial<Record<TableName, Row[]>> = {}): FakeDb {
  const tables: Record<TableName, Map<string, Row>> = {
    mobileBookmark: new Map(),
    mobileReaction: new Map(),
    mobileFollow: new Map(),
  };
  for (const table of TABLES) {
    for (const row of seed[table] ?? []) {
      const typed = typedRow(row);
      tables[table].set(`${typed.userId}|${keyOf(table, typed)}`, typed);
    }
  }

  const statements: string[] = [];

  const findMany = (table: TableName) => async (args: unknown) => {
    const { where } = args as {
      where: {
        userId?: string;
        itemId?: { in?: string[] };
        targetId?: { in?: string[] };
        updatedAt?: { gt?: Date };
      };
    };
    // Follows are keyed by `targetId`, the other two by `itemId`.
    const keyColumn = table === "mobileFollow" ? "targetId" : "itemId";
    const keyFilter = table === "mobileFollow" ? where.targetId : where.itemId;

    return [...tables[table].values()].filter((row) => {
      if (where.userId && row.userId !== where.userId) return false;
      const ids = keyFilter?.in;
      if (ids && !ids.includes(String(row[keyColumn]))) return false;
      if (where.updatedAt?.gt) {
        const at = (row.updatedAt as Date).getTime();
        if (!(at > where.updatedAt.gt.getTime())) return false;
      }
      return true;
    });
  };

  const executeRaw = async (query: Prisma.Sql) => {
    const sql = query.text;
    const values = query.values as unknown[];
    statements.push(sql);
    const insert = sql.trimStart().startsWith("INSERT");
    // SQL names the table as Postgres does (`"MobileBookmark"`); the maps below
    // are keyed the way Prisma names the model (`mobileBookmark`).
    const table = MODEL_OF_TABLE[sql.match(/"Mobile(Bookmark|Reaction|Follow)"/)?.[0] ?? ""];
    if (!table) return 0;

    if (insert) {
      const columns = columnList(sql);
      for (const tuple of tuples(sql, values)) {
        const row: Row = {};
        columns.forEach((column, index) => {
          row[column] = tuple[index];
        });
        const typed = typedRow(row);
        tables[table].set(`${typed.userId}|${keyOf(table, typed)}`, typed);
      }
      return 1;    }

    // UPDATE … SET "col" = excluded."col" … FROM (VALUES …) WHERE source."updatedAt" > target."updatedAt"
    const sourceColumns = COLUMNS[table];
    let updated = 0;
    for (const tuple of tuples(sql, values)) {
      const source: Row = {};
      sourceColumns.forEach((column, index) => {
        source[column] = tuple[index];
      });
      const key = `${source.userId}|${keyOf(table, source)}`;
      const target = tables[table].get(key);
      if (!target) continue;
      if (!((source.updatedAt as Date).getTime() > (target.updatedAt as Date).getTime())) {
        continue;
      }
      sourceColumns.forEach((column) => {
        target[column] = source[column];
      });
      updated += 1;
    }
    return updated;
  };

  // The engine declares its row shapes; this fake shadows one table at a time,
  // so the returned rows are whatever that table's columns are.
  const asRows = <T,>(finder: (args: unknown) => Promise<Row[]>): ((args: unknown) => Promise<T[]>) =>
    finder as unknown as (args: unknown) => Promise<T[]>;

  const db: MobileSyncDb = {
    mobileBookmark: { findMany: asRows<BookmarkDbRow>(findMany("mobileBookmark")) },
    mobileReaction: { findMany: asRows<ReactionDbRow>(findMany("mobileReaction")) },
    mobileFollow: { findMany: asRows<FollowDbRow>(findMany("mobileFollow")) },
    $executeRaw: executeRaw,
    $transaction: async (fn) => fn(db),
  };

  return { db, tables, statements };
}

const USER = "user_probe";

function at(offsetMs: number): Date {
  return new Date(new Date("2026-10-16T05:00:00.000Z").getTime() + offsetMs);
}

function bookmark(overrides: Partial<BookmarkSnapshot> = {}): BookmarkSnapshot {
  return {
    itemId: "slnews-api:4821",
    title: "Leone Stars level with Guinea",
    sourceUrl: "https://example.test/a",
    imageUrl: null,
    publisher: "Example",
    publishedAt: at(-3_600_000),
    savedAt: at(0),
    updatedAt: at(0),
    deleted: false,
    ...overrides,
  };
}

function reaction(overrides: Partial<ReactionSnapshot> = {}): ReactionSnapshot {
  return { itemId: "slnews-api:4821", kind: "like", updatedAt: at(0), deleted: false, ...overrides };
}

function follow(overrides: Partial<FollowSnapshot> = {}): FollowSnapshot {
  return { targetId: "team:lal", kind: "team", label: "Lakers", updatedAt: at(0), deleted: false, ...overrides };
}

function emptyPayload() {
  return { bookmarks: [], reactions: [], follows: [] };
}

/**
 * A row as Prisma would return it — every column present, because the DTOs read
 * them unconditionally.
 */
function storedBookmark(overrides: Row = {}): Row {
  return {
    userId: USER,
    itemId: "slnews-api:4821",
    title: "stored",
    sourceUrl: null,
    imageUrl: null,
    publisher: null,
    publishedAt: null,
    savedAt: at(0),
    updatedAt: at(0),
    deletedAt: null,
    ...overrides,
  };
}

function storedReaction(overrides: Row = {}): Row {
  return {
    userId: USER,
    itemId: "slnews-api:4821",
    kind: "like",
    updatedAt: at(0),
    deletedAt: null,
    ...overrides,
  };
}

function storedFollow(overrides: Row = {}): Row {
  return {
    userId: USER,
    targetId: "team:lal",
    kind: "team",
    label: "Lakers",
    updatedAt: at(0),
    deletedAt: null,
    ...overrides,
  };
}

describe("applySync — last write wins", () => {
  it("applies a newer row and reports the state the server now holds", async () => {
    const { db, tables } = fakeDb();
    const result = await applySync(db, USER, {
      ...emptyPayload(),
      bookmarks: [bookmark()],
    });

    expect(result.applied.bookmarks).toBe(1);
    expect(result.rejected).toEqual([]);
    expect(result.state.bookmarks).toHaveLength(1);
    expect(result.state.bookmarks[0]).toMatchObject({
      itemId: "slnews-api:4821",
      title: "Leone Stars level with Guinea",
      deleted: false,
      updatedAt: at(0).toISOString(),
    });
    expect(tables.mobileBookmark.get(`${USER}|slnews-api:4821`)).toMatchObject({
      title: "Leone Stars level with Guinea",
      deletedAt: null,
    });
  });

  it("rejects an older row as stale and writes nothing", async () => {
    const { db, statements } = fakeDb({
      mobileBookmark: [storedBookmark({ title: "v2", updatedAt: at(60_000) })],
    });

    const result = await applySync(db, USER, {
      ...emptyPayload(),
      bookmarks: [bookmark({ title: "v1", updatedAt: at(0) })],
    });

    expect(result.applied.bookmarks).toBe(0);
    expect(result.rejected).toEqual([
      { collection: "bookmarks", itemId: "slnews-api:4821", reason: "stale" },
    ]);
    // The client still learns the authoritative row.
    expect(result.state.bookmarks[0]?.title).toBe("v2");
    expect(statements).toEqual([]);
  });

  it("treats an equal timestamp as idempotent: applied, not stale, and no write", async () => {
    const { db, statements } = fakeDb({
      mobileReaction: [storedReaction()],
    });

    const result = await applySync(db, USER, {
      ...emptyPayload(),
      reactions: [reaction()],
    });

    expect(result.applied.reactions).toBe(0);
    expect(result.rejected).toEqual([]);
    expect(result.state.reactions[0]).toMatchObject({ itemId: "slnews-api:4821", deleted: false });
    expect(statements).toEqual([]);
  });

  it("applies newer rows and rejects older ones in the same batch", async () => {
    const { db } = fakeDb({
      mobileBookmark: [storedBookmark({ itemId: "a" })],
    });

    const result = await applySync(db, USER, {
      ...emptyPayload(),
      bookmarks: [
        bookmark({ itemId: "a", title: "older", updatedAt: at(-60_000) }),
        bookmark({ itemId: "b", title: "new", updatedAt: at(60_000) }),
      ],
    });

    expect(result.applied.bookmarks).toBe(1);
    expect(result.rejected).toHaveLength(1);
    expect(result.rejected[0]).toMatchObject({ itemId: "a", reason: "stale" });
    expect(result.state.bookmarks.map((row) => row.itemId).sort()).toEqual(["a", "b"]);
  });
});

describe("applySync — tombstones", () => {
  it("records a tombstone and keeps updatedAt so the row is not resurrected", async () => {
    const { db, tables } = fakeDb();

    const applied = await applySync(db, USER, {
      ...emptyPayload(),
      bookmarks: [bookmark({ deleted: true })],
    });
    expect(applied.applied.bookmarks).toBe(1);
    expect(applied.state.bookmarks[0]?.deleted).toBe(true);
    expect(tables.mobileBookmark.get(`${USER}|slnews-api:4821`)).toMatchObject({
      deletedAt: at(0),
      updatedAt: at(0),
    });

    const resurrect = await applySync(db, USER, {
      ...emptyPayload(),
      bookmarks: [bookmark({ title: "resurrect", updatedAt: at(-1) })],
    });

    expect(resurrect.rejected).toEqual([
      { collection: "bookmarks", itemId: "slnews-api:4821", reason: "stale" },
    ]);
    expect(resurrect.state.bookmarks[0]?.deleted).toBe(true);
    expect(resurrect.state.bookmarks[0]?.title).toBe("Leone Stars level with Guinea");
  });

  it("lets a genuinely newer edit win after a delete", async () => {
    const { db, tables } = fakeDb({
      mobileBookmark: [storedBookmark({ title: "v1", deletedAt: at(0) })],
    });

    const result = await applySync(db, USER, {
      ...emptyPayload(),
      bookmarks: [bookmark({ title: "re-saved", updatedAt: at(60_000) })],
    });

    expect(result.applied.bookmarks).toBe(1);
    expect(result.state.bookmarks[0]?.deleted).toBe(false);
    expect(tables.mobileBookmark.get(`${USER}|slnews-api:4821`)).toMatchObject({
      title: "re-saved",
      deletedAt: null,
    });
  });

  it("ignores the client's hint that a row is live when the stored row is a tombstone", async () => {
    // The engine derives deletedAt from the winning updatedAt; a client cannot
    // smuggle `deleted: false` past a newer tombstone.
    const { db, tables } = fakeDb({
      mobileFollow: [
        storedFollow({ label: null, updatedAt: at(60_000), deletedAt: at(60_000) }),
      ],
    });

    const result = await applySync(db, USER, {
      ...emptyPayload(),
      follows: [follow({ updatedAt: at(60_000), deleted: false })],
    });

    expect(result.rejected).toEqual([]);
    expect(result.applied.follows).toBe(0);
    expect(result.state.follows[0]?.deleted).toBe(true);
    expect((tables.mobileFollow.get(`${USER}|team:lal`)?.deletedAt as Date)?.getTime()).toBe(
      at(60_000).getTime()
    );
  });
});

describe("applySync — batching and isolation", () => {
  it("stays correct when a collection exceeds the write chunk size", async () => {
    const { db, tables, statements } = fakeDb();
    const rows = Array.from({ length: 700 }, (_, index) =>
      follow({ targetId: `team:t${index}`, updatedAt: at(index) })
    );

    const result = await applySync(db, USER, { ...emptyPayload(), follows: rows });

    expect(result.applied.follows).toBe(700);
    expect(tables.mobileFollow.size).toBe(700);
    // 700 rows / 300 per chunk = 3 chunks × (insert + update).
    expect(statements).toHaveLength(6);
  });

  it("leaves other users' rows untouched", async () => {
    const { db, tables } = fakeDb({
      mobileBookmark: [storedBookmark({ userId: "someone_else", itemId: "a", title: "theirs" })],
    });

    const result = await applySync(db, USER, {
      ...emptyPayload(),
      bookmarks: [bookmark({ itemId: "a", title: "mine" })],
    });

    expect(result.applied.bookmarks).toBe(1);
    expect(tables.mobileBookmark.get("someone_else|a")?.title).toBe("theirs");
    expect(tables.mobileBookmark.get(`${USER}|a`)?.title).toBe("mine");
  });

  it("returns state for every collection the client touched", async () => {
    const { db } = fakeDb();
    const result = await applySync(db, USER, {
      bookmarks: [bookmark()],
      reactions: [reaction()],
      follows: [follow()],
    });

    expect(result.applied).toEqual({ bookmarks: 1, reactions: 1, follows: 1 });
    expect(result.state.bookmarks).toHaveLength(1);
    expect(result.state.reactions).toHaveLength(1);
    expect(result.state.follows).toHaveLength(1);
  });
});

describe("applySync — SQL against the real schema", () => {
  // The fake understands the statements structurally, so a column name typo would
  // slip past every test above and only surface against Neon. These assertions
  // pin the statements to `prisma/schema.prisma`.
  const schema: Record<TableName, { table: string; key: string; nullable: string[] }> = {
    mobileBookmark: {
      table: "MobileBookmark",
      key: "itemId",
      nullable: ["sourceUrl", "imageUrl", "publisher", "publishedAt"],
    },
    mobileReaction: { table: "MobileReaction", key: "itemId", nullable: [] },
    mobileFollow: { table: "MobileFollow", key: "targetId", nullable: ["label"] },
  };

  it.each(TABLES)("writes %s with its own columns and key", async (table) => {
    const { table: tableName, key, nullable } = schema[table];
    const { db, statements } = fakeDb();
    const payload = {
      bookmarks: table === "mobileBookmark" ? [bookmark()] : [],
      reactions: table === "mobileReaction" ? [reaction()] : [],
      follows: table === "mobileFollow" ? [follow()] : [],
    };

    await applySync(db, USER, payload);

    expect(statements).toHaveLength(2);
    const [insert = "", update = ""] = statements;
    expect(insert).toContain(`INSERT INTO "${tableName}"`);
    expect(update).toContain(`UPDATE "${tableName}"`);
    // The guarded update joins on this table's key column, not a hardcoded one.
    expect(update).toContain(`target."${key}" = source."${key}"`);
    expect(update).toContain('target."userId" = source."userId"');
    expect(update).toContain('source."updatedAt" > target."updatedAt"');
    // `excluded` is only valid inside ON CONFLICT DO UPDATE; this is a plain
    // UPDATE ... FROM, so the incoming row is the `source` alias.
    expect(update).toContain(`"${key}" = source."${key}"`);
    expect(update).not.toContain("excluded");
    // The id is generated by the engine, never overwritten on update, and
    // createdAt keeps its DB default.
    expect(insert).toContain('"id"');
    expect(update).not.toContain('"id" = source."id"');
    expect(insert).not.toContain('"createdAt"');
    for (const column of nullable) {
      expect(insert).toContain(`"${column}"`);
    }
  });

  it.each(TABLES)("casts %s columns so a VALUES list is not all text", async (table) => {
    const { db, statements } = fakeDb();
    const payload = {
      bookmarks: table === "mobileBookmark" ? [bookmark()] : [],
      reactions: table === "mobileReaction" ? [reaction()] : [],
      follows: table === "mobileFollow" ? [follow()] : [],
    };

    await applySync(db, USER, payload);

    const insert = statements[0] ?? "";
    // Timestamps are the ones Postgres refuses as text (42804).
    for (const column of ["savedAt", "updatedAt", "deletedAt"]) {
      if (insert.includes(`"${column}"`)) {
        expect(insert).toContain("::timestamp(3)");
      }
    }
    expect(insert).toContain("::text");
  });

  it("generates an id for each written row", async () => {
    const { db, tables } = fakeDb();

    await applySync(db, USER, {
      bookmarks: [bookmark()],
      reactions: [reaction()],
      follows: [follow()],
    });

    const ids = [
      tables.mobileBookmark.get(`${USER}|slnews-api:4821`)?.id,
      tables.mobileReaction.get(`${USER}|slnews-api:4821`)?.id,
      tables.mobileFollow.get(`${USER}|team:lal`)?.id,
    ];
    for (const id of ids) {
      expect(typeof id).toBe("string");
      expect(id).toMatch(/^[0-9a-f-]{36}$/);
    }
    // Distinct rows get distinct ids.
    expect(new Set(ids).size).toBe(3);
  });
});

describe("pullChanges", () => {
  const seed: Partial<Record<TableName, Row[]>> = {
    mobileBookmark: [
      storedBookmark({ itemId: "old", title: "old", updatedAt: at(-60_000) }),
      storedBookmark({ itemId: "new", title: "new", updatedAt: at(60_000), deletedAt: at(60_000) }),
    ],
    mobileReaction: [storedReaction({ itemId: "new", updatedAt: at(120_000) })],
    mobileFollow: [],
  };

  it("returns everything, tombstones included, when since is omitted", async () => {
    const { db } = fakeDb(seed);
    const result = await pullChanges(db, USER, { since: null, limit: 500 });

    expect(result.hasMore).toBe(false);
    expect(result.bookmarks).toHaveLength(2);
    expect(result.bookmarks.find((row) => row.itemId === "new")?.deleted).toBe(true);
    expect(result.reactions).toHaveLength(1);
  });

  it("filters by since and still exposes the tombstone", async () => {
    const { db } = fakeDb(seed);
    const result = await pullChanges(db, USER, { since: at(0), limit: 500 });

    expect(result.bookmarks.map((row) => row.itemId)).toEqual(["new"]);
    expect(result.bookmarks[0]?.deleted).toBe(true);
  });

  it("applies the limit per collection and reports hasMore", async () => {
    const { db } = fakeDb(seed);
    const result = await pullChanges(db, USER, { since: null, limit: 1 });

    expect(result.bookmarks).toHaveLength(1);
    expect(result.hasMore).toBe(true);
  });

  it("does not report hasMore when every collection fits", async () => {
    const { db } = fakeDb(seed);
    const result = await pullChanges(db, USER, { since: null, limit: 2 });

    expect(result.hasMore).toBe(false);
  });
});
