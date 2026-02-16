require("dotenv").config({ path: require("path").resolve(__dirname, "../.env"), override: true });
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const masked = (process.env.DATABASE_URL || "").replace(/:([^@]+)@/, ":***@");
  console.log("\n=== TranquilityHub DB Health Check ===");
  console.log("Connecting to:", masked, "\n");

  // --- Write ---
  const submission = await prisma.contactSubmission.create({
    data: {
      name: "DB Health Check",
      email: "healthcheck@tranquilityhub.test",
      message: "Automated write test to verify the Neon PostgreSQL connection and schema.",
    },
  });
  console.log("✅ Row created:", JSON.stringify(submission, null, 2));

  // --- Read back ---
  const found = await prisma.contactSubmission.findUnique({ where: { id: submission.id } });
  console.log("\n✅ Row read back:", JSON.stringify(found, null, 2));

  // --- Count all contact submissions ---
  const total = await prisma.contactSubmission.count();
  console.log(`\n📊 Total ContactSubmission rows in DB: ${total}`);

  // --- Show User table count ---
  const userCount = await prisma.user.count();
  console.log(`📊 Total User rows in DB: ${userCount}`);

  // --- Show VoiceSubmission count ---
  const voiceCount = await prisma.voiceSubmission.count();
  console.log(`📊 Total VoiceSubmission rows in DB: ${voiceCount}`);

  // --- Clean up the test row ---
  await prisma.contactSubmission.delete({ where: { id: submission.id } });
  console.log("\n🧹 Test row cleaned up.");
  console.log("\n✅ Database is healthy and schema is applied!\n");
}

main().catch((err) => {
  console.error("❌ DB health check failed:", err.message);
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
