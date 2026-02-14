import { randomUUID } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type MockSession = {
  user: {
    id: string;
    email?: string | null;
    name?: string | null;
  };
} | null;

const { getServerSessionMock, verifyIdTokenMock } = vi.hoisted(() => ({
  getServerSessionMock: vi.fn(),
  verifyIdTokenMock: vi.fn(),
}));

let mockSession: MockSession = null;

vi.mock("next-auth", () => ({
  getServerSession: getServerSessionMock,
}));

vi.mock("google-auth-library", () => ({
  OAuth2Client: class {
    verifyIdToken = verifyIdTokenMock;
  },
}));

import { POST as submitVoice } from "@/app/api/voices/route";
import { authorizeGoogleOneTapCredential } from "@/lib/auth";
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
  verifyIdTokenMock.mockReset();
  await cleanupTestData();
});

afterEach(async () => {
  mockSession = null;
  getServerSessionMock.mockReset();
  verifyIdTokenMock.mockReset();
  await cleanupTestData();
});

describe("auth integration", () => {
  it("upserts a user into Prisma from a verified Google One Tap credential", async () => {
    const email = `${randomUUID()}${testEmailDomain}`;

    verifyIdTokenMock
      .mockResolvedValueOnce({
        getPayload: () => ({
          email,
          email_verified: true,
          name: "Vitest First Pass",
          picture: "https://example.com/first.png",
        }),
      })
      .mockResolvedValueOnce({
        getPayload: () => ({
          email,
          email_verified: true,
          name: "Vitest Updated Pass",
          picture: "https://example.com/updated.png",
        }),
      });

    const firstResult = await authorizeGoogleOneTapCredential("first-token");
    const secondResult = await authorizeGoogleOneTapCredential("second-token");

    expect(firstResult?.email).toBe(email);
    expect(secondResult?.email).toBe(email);

    const storedUsers = await prisma.user.findMany({
      where: { email },
    });

    expect(storedUsers).toHaveLength(1);
    expect(storedUsers[0]?.name).toBe("Vitest Updated Pass");
    expect(storedUsers[0]?.image).toBe("https://example.com/updated.png");
    expect(storedUsers[0]?.emailVerified).not.toBeNull();
  });

  it("creates a pending voice submission for an authenticated session", async () => {
    const email = `${randomUUID()}${testEmailDomain}`;
    const user = await prisma.user.create({
      data: {
        email,
        name: "Vitest Route User",
        emailVerified: new Date(),
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
    expect(createdSubmission?.author).toBe("Vitest Route User");
    expect(createdSubmission?.userId).toBe(user.id);
  });
});