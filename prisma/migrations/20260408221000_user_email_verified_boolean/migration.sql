-- Better Auth expects `User.emailVerified` as BOOLEAN, not NextAuth's TIMESTAMP.
-- Non-null timestamps become verified=true; null becomes false.

ALTER TABLE "User" ALTER COLUMN "emailVerified" DROP DEFAULT;

ALTER TABLE "User"
  ALTER COLUMN "emailVerified" TYPE BOOLEAN
  USING (CASE WHEN "emailVerified" IS NOT NULL THEN true ELSE false END);

ALTER TABLE "User" ALTER COLUMN "emailVerified" SET DEFAULT false;
ALTER TABLE "User" ALTER COLUMN "emailVerified" SET NOT NULL;
