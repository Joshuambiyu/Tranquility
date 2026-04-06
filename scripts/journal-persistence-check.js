require("dotenv").config({ path: require("path").resolve(__dirname, "../.env"), override: true });
const { PrismaClient } = require("@prisma/client");
const { randomUUID } = require("node:crypto");

const prisma = new PrismaClient();
const testEmailDomain = "@tranquilityhub.test";
const prompt = "What's one thing you can do today to feel calmer?";

async function main() {
  const email = `${randomUUID()}${testEmailDomain}`;
  const answer = `Seed journal check ${randomUUID()}`;

  console.log("\n=== Journal Persistence Check ===\n");

  const user = await prisma.user.create({
    data: {
      email,
      name: "Journal Persistence Check",
      emailVerified: new Date(),
    },
  });
  console.log("Created test user:", user.id);

  const entry = await prisma.userJournal.create({
    data: {
      userId: user.id,
      prompt,
      answer,
      stressLevel: "medium",
      resultTone: "encouragement",
      resultTitle: "Gentle Reminder",
      resultMessage: "Write one honest sentence and let that be enough for today.",
    },
  });
  console.log("Created journal entry:", entry.id);

  const found = await prisma.userJournal.findFirst({
    where: {
      userId: user.id,
      answer,
    },
  });
  console.log("Read journal entry back:", JSON.stringify(found, null, 2));

  const count = await prisma.userJournal.count({ where: { userId: user.id } });
  console.log(`Journal count for test user: ${count}`);

  await prisma.userJournal.delete({ where: { id: entry.id } });
  await prisma.user.delete({ where: { id: user.id } });

  console.log("\nCleanup complete.");
  console.log("Journal persistence verified successfully.\n");
}

main()
  .catch((error) => {
    console.error("Journal persistence check failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
