import path from "node:path";
import { config } from "dotenv";
import { afterAll } from "vitest";

config({
  path: path.resolve(process.cwd(), ".env"),
  override: true,
  quiet: true,
});

const env = process.env as Record<string, string | undefined>;
env.NODE_ENV = env.NODE_ENV ?? "test";

afterAll(async () => {
  const { prisma } = await import("@/lib/prisma");
  await prisma.$disconnect();
});