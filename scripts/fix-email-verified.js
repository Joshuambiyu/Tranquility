/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");

async function main() {
  const prisma = new PrismaClient();

  try {
    await prisma.$executeRawUnsafe(`
DO $$
DECLARE
  col_type text;
BEGIN
  SELECT data_type
  INTO col_type
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'User'
    AND column_name = 'emailVerified';

  IF col_type IS NULL THEN
    RAISE EXCEPTION 'Column public."User"."emailVerified" does not exist';
  END IF;

  IF col_type IN ('timestamp without time zone', 'timestamp with time zone') THEN
    EXECUTE 'ALTER TABLE "User" ALTER COLUMN "emailVerified" DROP DEFAULT';
    EXECUTE 'ALTER TABLE "User" ALTER COLUMN "emailVerified" TYPE BOOLEAN USING (CASE WHEN "emailVerified" IS NOT NULL THEN true ELSE false END)';
  ELSE
    EXECUTE 'UPDATE "User" SET "emailVerified" = false WHERE "emailVerified" IS NULL';
  END IF;

  EXECUTE 'ALTER TABLE "User" ALTER COLUMN "emailVerified" SET DEFAULT false';
  EXECUTE 'ALTER TABLE "User" ALTER COLUMN "emailVerified" SET NOT NULL';
END $$;
    `);

    console.log("Fixed User.emailVerified: nulls normalized, default set to false, NOT NULL enforced.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Failed to repair User.emailVerified:", error);
  process.exit(1);
});
