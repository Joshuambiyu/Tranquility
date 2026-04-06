-- CreateTable
CREATE TABLE "UserJournal" (
    "id" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "stressLevel" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "resultTone" TEXT NOT NULL,
    "resultTitle" TEXT NOT NULL,
    "resultMessage" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserJournal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserJournal_userId_createdAt_idx" ON "UserJournal"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "UserJournal" ADD CONSTRAINT "UserJournal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
