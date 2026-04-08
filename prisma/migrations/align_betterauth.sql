-- Align Account and Session tables with BetterAuth expected schema.
-- Migrates data from NextAuth column names to BetterAuth column names.

-- 1. Account: add new columns with defaults first
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "accountId" TEXT;
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "providerId" TEXT;
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "accessToken" TEXT;
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "refreshToken" TEXT;
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "idToken" TEXT;
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "accessTokenExpiresAt" TIMESTAMP(3);
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "refreshTokenExpiresAt" TIMESTAMP(3);
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "scope" TEXT;
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "password" TEXT;

-- 2. Copy data from old NextAuth columns to new BetterAuth columns
UPDATE "Account" SET "accountId" = "providerAccountId" WHERE "accountId" IS NULL AND "providerAccountId" IS NOT NULL;
UPDATE "Account" SET "providerId" = "provider" WHERE "providerId" IS NULL AND "provider" IS NOT NULL;
UPDATE "Account" SET "accessToken" = "access_token" WHERE "accessToken" IS NULL;
UPDATE "Account" SET "refreshToken" = "refresh_token" WHERE "refreshToken" IS NULL;
UPDATE "Account" SET "idToken" = "id_token" WHERE "idToken" IS NULL;

-- 3. Make the new columns required now that data is filled
ALTER TABLE "Account" ALTER COLUMN "accountId" SET NOT NULL;
ALTER TABLE "Account" ALTER COLUMN "providerId" SET NOT NULL;

-- 4. Drop old NextAuth columns
ALTER TABLE "Account" DROP COLUMN IF EXISTS "providerAccountId";
ALTER TABLE "Account" DROP COLUMN IF EXISTS "provider";
ALTER TABLE "Account" DROP COLUMN IF EXISTS "access_token";
ALTER TABLE "Account" DROP COLUMN IF EXISTS "refresh_token";
ALTER TABLE "Account" DROP COLUMN IF EXISTS "id_token";
ALTER TABLE "Account" DROP COLUMN IF EXISTS "expires_at";
ALTER TABLE "Account" DROP COLUMN IF EXISTS "token_type";
ALTER TABLE "Account" DROP COLUMN IF EXISTS "type";
ALTER TABLE "Account" DROP COLUMN IF EXISTS "session_state";
ALTER TABLE "Account" DROP COLUMN IF EXISTS "sessionState";
ALTER TABLE "Account" DROP COLUMN IF EXISTS "refreshTokenExpiresIn";
ALTER TABLE "Account" DROP COLUMN IF EXISTS "expiresAt";

-- 5. Drop old unique constraint and add new one
ALTER TABLE "Account" DROP CONSTRAINT IF EXISTS "Account_provider_providerAccountId_key";
ALTER TABLE "Account" ADD CONSTRAINT "Account_providerId_accountId_key" UNIQUE ("providerId", "accountId");

-- 6. Session: add missing BetterAuth columns, copy data, drop old ones
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "token" TEXT;
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP(3);
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "ipAddress" TEXT;
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "userAgent" TEXT;
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Copy sessionToken → token for existing sessions
UPDATE "Session" SET "token" = "sessionToken" WHERE "token" IS NULL AND "sessionToken" IS NOT NULL;
UPDATE "Session" SET "expiresAt" = "expires" WHERE "expiresAt" IS NULL AND "expires" IS NOT NULL;

-- Generate tokens for any remaining null tokens
UPDATE "Session" SET "token" = gen_random_uuid()::TEXT WHERE "token" IS NULL;
UPDATE "Session" SET "expiresAt" = NOW() + INTERVAL '30 days' WHERE "expiresAt" IS NULL;

-- Make required columns NOT NULL
ALTER TABLE "Session" ALTER COLUMN "token" SET NOT NULL;
ALTER TABLE "Session" ALTER COLUMN "expiresAt" SET NOT NULL;

-- Add unique constraint on token if not exists
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Session_token_key') THEN
    ALTER TABLE "Session" ADD CONSTRAINT "Session_token_key" UNIQUE ("token");
  END IF;
END $$;

-- Drop old NextAuth columns
ALTER TABLE "Session" DROP COLUMN IF EXISTS "sessionToken";
ALTER TABLE "Session" DROP COLUMN IF EXISTS "expires";

-- 7. Drop old VerificationToken table and create Verification table
DROP TABLE IF EXISTS "VerificationToken";
CREATE TABLE IF NOT EXISTS "Verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Verification_identifier_value_key" ON "Verification"("identifier", "value");
