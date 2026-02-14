import path from "node:path";
import { config } from "dotenv";
import { afterAll } from "vitest";

config({
  path: path.resolve(process.cwd(), ".env"),
  override: true,
  quiet: true,
});

process.env.NODE_ENV = "test";

afterAll(async () => {
  const { prisma } = await import("@/lib/prisma");
  await prisma.$disconnect();
});