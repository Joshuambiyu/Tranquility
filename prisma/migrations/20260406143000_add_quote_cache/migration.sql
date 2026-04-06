-- CreateTable
CREATE TABLE "CachedQuote" (
    "id" TEXT NOT NULL,
    "theme" TEXT NOT NULL,
    "answerSignature" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "author" TEXT,
    "source" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CachedQuote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CachedQuote_theme_answerSignature_key" ON "CachedQuote"("theme", "answerSignature");

-- CreateIndex
CREATE INDEX "CachedQuote_expiresAt_idx" ON "CachedQuote"("expiresAt");