import path from "node:path";
import { config } from "dotenv";
import { afterAll } from "vitest";

config({
  path: path.resolve(process.cwd(), ".env"),
  override: true,
  quiet: true,
});

Object.defineProperty(process.env, "NODE_ENV", {
  value: "test",
  configurable: true,
  writable: true,
});

afterAll(async () => {
  const { prisma } = await import("@/lib/prisma");
  await prisma.$disconnect();
});