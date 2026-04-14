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

import { GET as getJournals, POST as saveJournal } from "@/app/api/journals/route";
import { prisma } from "@/lib/prisma";

const testEmailDomain = "@tranquilityhub.test";
const journalPrompt = "What's one thing you can do today to feel calmer?";

async function cleanupTestData() {
  await prisma.userJournal.deleteMany({
    where: {
      OR: [
        { prompt: journalPrompt },
        { answer: { startsWith: "Vitest journal" } },
      ],
    },
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

describe("journals integration", () => {
  it("rejects journal save when user is not authenticated", async () => {
    const response = await saveJournal(
      new Request("http://localhost:3000/api/journals", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          prompt: journalPrompt,
          answer: "Vitest journal entry without auth",
          stressLevel: "medium",
        }),
      }),
    );

    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.code).toBe("AUTH_REQUIRED");
  });

  it("saves a journal entry and returns it for the same user", async () => {
    const email = `${randomUUID()}${testEmailDomain}`;
    const user = await prisma.user.create({
      data: {
        email,
        name: "Vitest Journal User",
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

    const answer = `Vitest journal ${randomUUID()}`;

    const saveResponse = await saveJournal(
      new Request("http://localhost:3000/api/journals", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          prompt: journalPrompt,
          answer,
          stressLevel: "high",
        }),
      }),
    );

    const saveBody = await saveResponse.json();

    expect(saveResponse.status).toBe(201);
    expect(saveBody.message).toContain("saved");
    expect(saveBody.result).toBeDefined();
    expect(saveBody.result.tone).toBe("encouragement");
    expect(typeof saveBody.result.title).toBe("string");
    expect(saveBody.result.message).toContain("Return to");

    const dbRow = await prisma.userJournal.findFirst({
      where: {
        userId: user.id,
        answer,
      },
    });

    expect(dbRow).not.toBeNull();
    expect(dbRow?.resultTone).toBe(saveBody.result.tone);
    expect(dbRow?.resultTitle).toBe(saveBody.result.title);
    expect(dbRow?.resultMessage).toBe(saveBody.result.message);

    const getResponse = await getJournals();
    const getBody = await getResponse.json();

    expect(getResponse.status).toBe(200);
    expect(Array.isArray(getBody.journals)).toBe(true);
    expect(getBody.journals.length).toBeGreaterThan(0);
    expect(getBody.journals[0].answer).toBe(answer);
    expect(getBody.journals[0].stressLevel).toBe("high");
  });

  it("only returns entries for the signed-in user", async () => {
    const userA = await prisma.user.create({
      data: {
        email: `${randomUUID()}${testEmailDomain}`,
        name: "Vitest Journal A",
        emailVerified: true,
      },
    });

    const userB = await prisma.user.create({
      data: {
        email: `${randomUUID()}${testEmailDomain}`,
        name: "Vitest Journal B",
        emailVerified: true,
      },
    });

    await prisma.userJournal.create({
      data: {
        userId: userA.id,
        prompt: journalPrompt,
        answer: "Vitest journal from A",
        stressLevel: "low",
        resultTone: "quote",
        resultTitle: "Steady Energy",
        resultMessage: "Small choices matter.",
      },
    });

    await prisma.userJournal.create({
      data: {
        userId: userB.id,
        prompt: journalPrompt,
        answer: "Vitest journal from B",
        stressLevel: "medium",
        resultTone: "encouragement",
        resultTitle: "Gentle Reminder",
        resultMessage: "Keep moving gently.",
      },
    });

    mockSession = {
      user: {
        id: userA.id,
        email: userA.email,
        name: userA.name,
      },
    };

    const getResponse = await getJournals();
    const getBody = await getResponse.json();

    const answers = (getBody.journals as Array<{ answer: string }>).map((entry) => entry.answer);

    expect(answers).toContain("Vitest journal from A");
    expect(answers).not.toContain("Vitest journal from B");
  });

  it("deduplicates recent identical submissions", async () => {
    const email = `${randomUUID()}${testEmailDomain}`;
    const user = await prisma.user.create({
      data: {
        email,
        name: "Vitest Journal Duplicate User",
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

    const answer = `Vitest journal duplicate ${randomUUID()}`;

    const firstResponse = await saveJournal(
      new Request("http://localhost:3000/api/journals", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          prompt: journalPrompt,
          answer,
          stressLevel: "medium",
        }),
      }),
    );

    expect(firstResponse.status).toBe(201);
    const firstBody = await firstResponse.json();

    const secondResponse = await saveJournal(
      new Request("http://localhost:3000/api/journals", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          prompt: journalPrompt,
          answer,
          stressLevel: "medium",
        }),
      }),
    );

    expect(secondResponse.status).toBe(200);
    const secondBody = await secondResponse.json();

    expect(secondBody.duplicate).toBe(true);
    expect(secondBody.id).toBe(firstBody.id);

    const rows = await prisma.userJournal.findMany({
      where: {
        userId: user.id,
        answer,
      },
    });

    expect(rows).toHaveLength(1);
  });
});
