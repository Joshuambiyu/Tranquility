-- CreateTable
CREATE TABLE "public"."ResourceOfMonth" (
    "id" TEXT NOT NULL,
    "monthKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "linkUrl" TEXT,
    "linkLabel" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "ResourceOfMonth_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ResourceOfMonth_monthKey_key" ON "public"."ResourceOfMonth"("monthKey");

-- CreateIndex
CREATE INDEX "ResourceOfMonth_status_monthKey_idx" ON "public"."ResourceOfMonth"("status", "monthKey");

-- CreateIndex
CREATE INDEX "ResourceOfMonth_isCurrent_idx" ON "public"."ResourceOfMonth"("isCurrent");

-- AddForeignKey
ALTER TABLE "public"."ResourceOfMonth" ADD CONSTRAINT "ResourceOfMonth_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
