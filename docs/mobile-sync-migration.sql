-- CreateTable
CREATE TABLE "MobileBookmark" (
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
CREATE TABLE "MobileReaction" (
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
CREATE TABLE "MobileFollow" (
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
CREATE INDEX "MobileBookmark_userId_updatedAt_idx" ON "MobileBookmark"("userId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "MobileBookmark_userId_itemId_key" ON "MobileBookmark"("userId", "itemId");

-- CreateIndex
CREATE INDEX "MobileReaction_userId_updatedAt_idx" ON "MobileReaction"("userId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "MobileReaction_userId_itemId_kind_key" ON "MobileReaction"("userId", "itemId", "kind");

-- CreateIndex
CREATE INDEX "MobileFollow_userId_updatedAt_idx" ON "MobileFollow"("userId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "MobileFollow_userId_targetId_key" ON "MobileFollow"("userId", "targetId");

-- AddForeignKey
ALTER TABLE "MobileBookmark" ADD CONSTRAINT "MobileBookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MobileReaction" ADD CONSTRAINT "MobileReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MobileFollow" ADD CONSTRAINT "MobileFollow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
