-- Additive mobile-sync schema.
--
-- Applied by scripts/apply-mobile-sync-schema.mjs before every Vercel build, so
-- every statement is IF NOT EXISTS-guarded and nothing is dropped or altered:
-- running it against an already-migrated database must be a no-op. The local
-- development database receives the same file.
--
-- Why this is a script and not a Prisma migration: this schema has no migration
-- history (it was created with pushes), so there is no baseline to deploy onto.
-- These three tables are additive, so an idempotent file is enough.

-- CreateTable
CREATE TABLE IF NOT EXISTS "MobileBookmark" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "imageUrl" TEXT,
    "publisher" TEXT,
    "publishedAt" TIMESTAMP(3),
    "savedAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MobileBookmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "MobileReaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'like',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MobileReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "MobileFollow" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "label" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MobileFollow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "MobileBookmark_userId_updatedAt_idx" ON "MobileBookmark"("userId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "MobileBookmark_userId_itemId_key" ON "MobileBookmark"("userId", "itemId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "MobileReaction_userId_updatedAt_idx" ON "MobileReaction"("userId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "MobileReaction_userId_itemId_kind_key" ON "MobileReaction"("userId", "itemId", "kind");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "MobileFollow_userId_updatedAt_idx" ON "MobileFollow"("userId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "MobileFollow_userId_targetId_key" ON "MobileFollow"("userId", "targetId");

-- AddForeignKey
-- `ADD CONSTRAINT` has no IF NOT EXISTS form, so each one checks the catalogue
-- first: the foreign keys cascade with the User rows the sync route bootstraps.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'MobileBookmark_userId_fkey'
    ) THEN
        ALTER TABLE "MobileBookmark" ADD CONSTRAINT "MobileBookmark_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'MobileReaction_userId_fkey'
    ) THEN
        ALTER TABLE "MobileReaction" ADD CONSTRAINT "MobileReaction_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'MobileFollow_userId_fkey'
    ) THEN
        ALTER TABLE "MobileFollow" ADD CONSTRAINT "MobileFollow_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
