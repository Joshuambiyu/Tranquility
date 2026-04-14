-- CreateTable
CREATE TABLE "public"."AdminAccess" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "AdminAccess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminAccess_email_key" ON "public"."AdminAccess"("email");

-- CreateIndex
CREATE INDEX "AdminAccess_createdAt_idx" ON "public"."AdminAccess"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."AdminAccess" ADD CONSTRAINT "AdminAccess_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
