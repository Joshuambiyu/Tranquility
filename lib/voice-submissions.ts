import { prisma } from "@/lib/prisma";
import type { VoiceSubmissionStatus } from "@/types";

const publicVoiceSelect = {
  id: true,
  title: true,
  reflection: true,
  author: true,
  submissionType: true,
  visibility: true,
  descriptor: true,
  isVoiceOfWeek: true,
  createdAt: true,
} as const;

export async function getPublicVoiceFeed() {
  const voiceOfWeek = await prisma.voiceSubmission.findFirst({
    where: {
      status: "approved",
      isVoiceOfWeek: true,
    },
    orderBy: [{ approvedAt: "desc" }, { createdAt: "desc" }],
    select: publicVoiceSelect,
  });

  const voices = await prisma.voiceSubmission.findMany({
    where: {
      status: "approved",
      ...(voiceOfWeek ? { id: { not: voiceOfWeek.id } } : {}),
    },
    orderBy: [{ approvedAt: "desc" }, { createdAt: "desc" }],
    take: 6,
    select: publicVoiceSelect,
  });

  return {
    voiceOfWeek,
    voices,
  };
}

export async function updateVoiceSubmissionStatus(
  voiceId: string,
  status: VoiceSubmissionStatus,
) {
  const existingVoice = await prisma.voiceSubmission.findUnique({
    where: { id: voiceId },
    select: {
      id: true,
      status: true,
      approvedAt: true,
      isVoiceOfWeek: true,
    },
  });

  if (!existingVoice) {
    throw new Error("Voice submission not found.");
  }

  if (status === "approved") {
    return prisma.voiceSubmission.update({
      where: { id: voiceId },
      data: {
        status,
        approvedAt: existingVoice.approvedAt ?? new Date(),
      },
    });
  }

  return prisma.voiceSubmission.update({
    where: { id: voiceId },
    data: {
      status,
      approvedAt: null,
      isVoiceOfWeek: false,
    },
  });
}

export async function setVoiceOfWeek(voiceId: string) {
  return prisma.$transaction(async (transaction) => {
    const existingVoice = await transaction.voiceSubmission.findUnique({
      where: { id: voiceId },
      select: {
        id: true,
        status: true,
      },
    });

    if (!existingVoice) {
      throw new Error("Voice submission not found.");
    }

    if (existingVoice.status !== "approved") {
      throw new Error("Only approved voices can be selected as Voice of the Week.");
    }

    await transaction.voiceSubmission.updateMany({
      where: { isVoiceOfWeek: true },
      data: { isVoiceOfWeek: false },
    });

    return transaction.voiceSubmission.update({
      where: { id: voiceId },
      data: { isVoiceOfWeek: true },
    });
  });
}

export async function clearVoiceOfWeek(voiceId: string) {
  return prisma.voiceSubmission.update({
    where: { id: voiceId },
    data: { isVoiceOfWeek: false },
  });
}