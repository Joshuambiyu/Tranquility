import { randomUUID } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type MockSession = {
  user: {
    id: string;
    email?: string | null;
    name?: string | null;
  };
} | null;

const { getServerSessionMock } = vi.hoisted(() => ({
  getServerSessionMock: vi.fn(),
}));

let mockSession: MockSession = null;

vi.mock("@/lib/auth", async () => {
  const actual = await vi.importActual<typeof import("@/lib/auth")>("@/lib/auth");
  return {
    ...actual,
    getServerSession: getServerSessionMock,
  };
});

import { POST as submitVoice } from "@/app/api/voices/route";
import { prisma } from "@/lib/prisma";

const testEmailDomain = "@tranquilityhub.test";

async function cleanupTestData() {
  await prisma.voiceSubmission.deleteMany({
    where: {
      OR: [
        { title: { startsWith: "Vitest " } },
        { author: { startsWith: "Vitest " } },
      ],
    },
  });

  await prisma.contactSubmission.deleteMany({
    where: { email: { endsWith: testEmailDomain } },
  });

  await prisma.user.deleteMany({
    where: { email: { endsWith: testEmailDomain } },
  });
}

beforeEach(async () => {
  mockSession = null;
  getServerSessionMock.mockImplementation(async () => mockSession);
  await cleanupTestData();
});

afterEach(async () => {
  mockSession = null;
  getServerSessionMock.mockReset();
  await cleanupTestData();
});

describe("auth integration", () => {
  it("creates a pending voice submission for an authenticated session", async () => {
    const email = `${randomUUID()}${testEmailDomain}`;
    const user = await prisma.user.create({
      data: {
        email,
        name: "Vitest Route User",
        emailVerified: true,
      },
    });

    mockSession = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };

    const title = `Vitest ${randomUUID()}`;
    const response = await submitVoice(
      new Request("http://localhost:3000/api/voices", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          title,
          reflection:
            "Vitest reflection content is long enough to satisfy validation and prove the protected route writes to the database.",
          visibility: "anonymous",
          descriptor: "Vitest Nairobi student",
        }),
      }),
    );

    const responseBody = await response.json();
    const createdSubmission = await prisma.voiceSubmission.findFirst({
      where: { title },
    });

    expect(response.status).toBe(201);
    expect(responseBody.message).toContain("pending review");
    expect(createdSubmission).not.toBeNull();
    expect(createdSubmission?.status).toBe("pending");
    expect(createdSubmission?.author).toBe("Anonymous");
    expect(createdSubmission?.visibility).toBe("anonymous");
    expect(createdSubmission?.descriptor).toBe("Vitest Nairobi student");
    expect(createdSubmission?.isVoiceOfWeek).toBe(false);
    expect(createdSubmission?.userId).toBe(user.id);
  });
});