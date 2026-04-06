import { randomUUID } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { GET as getVoices } from "@/app/api/voices/route";
import { prisma } from "@/lib/prisma";
import {
  setVoiceOfWeek,
  updateVoiceSubmissionStatus,
} from "@/lib/voice-submissions";

async function cleanupTestData() {
  await prisma.voiceSubmission.deleteMany({
    where: {
      OR: [{ title: { startsWith: "Vitest voice" } }, { author: { startsWith: "Vitest" } }],
    },
  });
}

beforeEach(async () => {
  await cleanupTestData();
});

afterEach(async () => {
  await cleanupTestData();
});

describe("voices integration", () => {
  it("returns the selected voice of the week separately from the public feed", async () => {
    const featured = await prisma.voiceSubmission.create({
      data: {
        title: `Vitest voice featured ${randomUUID()}`,
        reflection: "Vitest featured reflection content that is long enough to be valid for public voice output.",
        author: "Vitest Featured Author",
        visibility: "anonymous",
        descriptor: "Shared quietly",
        status: "approved",
        isVoiceOfWeek: true,
        approvedAt: new Date(),
      },
    });

    const community = await prisma.voiceSubmission.create({
      data: {
        title: `Vitest voice community ${randomUUID()}`,
        reflection: "Vitest community reflection content that should appear in the public voices feed.",
        author: "Vitest Community Author",
        visibility: "open",
        descriptor: "Nairobi campus student",
        status: "approved",
        approvedAt: new Date(),
      },
    });

    await prisma.voiceSubmission.create({
      data: {
        title: `Vitest voice pending ${randomUUID()}`,
        reflection: "Vitest pending reflection content that should never appear in the public feed.",
        author: "Vitest Pending Author",
        visibility: "open",
        status: "pending",
      },
    });

    const response = await getVoices();
    const body = (await response.json()) as {
      voiceOfWeek: { id: string; visibility: string; descriptor?: string | null } | null;
      voices: Array<{ id: string; visibility: string; descriptor?: string | null }>;
    };

    expect(response.status).toBe(200);
    expect(body.voiceOfWeek?.id).toBe(featured.id);
    expect(body.voiceOfWeek?.visibility).toBe("anonymous");
    expect(body.voiceOfWeek?.descriptor).toBe("Shared quietly");
    expect(body.voices.map((voice) => voice.id)).toContain(community.id);
    expect(body.voices.map((voice) => voice.id)).not.toContain(featured.id);
  });

  it("approves pending submissions and keeps only one featured voice at a time", async () => {
    const first = await prisma.voiceSubmission.create({
      data: {
        title: `Vitest voice first ${randomUUID()}`,
        reflection: "Vitest first approved reflection content that is long enough for public display.",
        author: "Vitest First Author",
        visibility: "open",
        status: "approved",
        approvedAt: new Date(),
      },
    });

    const second = await prisma.voiceSubmission.create({
      data: {
        title: `Vitest voice second ${randomUUID()}`,
        reflection: "Vitest second reflection content that should become featured after approval.",
        author: "Vitest Second Author",
        visibility: "anonymous",
        status: "pending",
      },
    });

    await setVoiceOfWeek(first.id);
    await updateVoiceSubmissionStatus(second.id, "approved");
    await setVoiceOfWeek(second.id);

    const refreshedFirst = await prisma.voiceSubmission.findUnique({ where: { id: first.id } });
    const refreshedSecond = await prisma.voiceSubmission.findUnique({ where: { id: second.id } });

    expect(refreshedFirst?.isVoiceOfWeek).toBe(false);
    expect(refreshedSecond?.status).toBe("approved");
    expect(refreshedSecond?.approvedAt).not.toBeNull();
    expect(refreshedSecond?.isVoiceOfWeek).toBe(true);
  });
});