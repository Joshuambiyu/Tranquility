-- AlterTable
ALTER TABLE "VoiceSubmission"
ADD COLUMN "approvedAt" TIMESTAMP(3),
ADD COLUMN "descriptor" TEXT,
ADD COLUMN "isVoiceOfWeek" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "submissionType" TEXT NOT NULL DEFAULT 'inspiration',
ADD COLUMN "visibility" TEXT NOT NULL DEFAULT 'open';

-- CreateIndex
CREATE INDEX "VoiceSubmission_isVoiceOfWeek_idx" ON "VoiceSubmission"("isVoiceOfWeek");

-- Backfill approved rows for stable ordering and editorial selection.
UPDATE "VoiceSubmission"
SET "approvedAt" = COALESCE("approvedAt", "createdAt")
WHERE "status" = 'approved';