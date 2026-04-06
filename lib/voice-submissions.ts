import { prisma } from "@/lib/prisma";
import type { VoiceSubmissionStatus } from "@/types";

const publicVoiceSelect = {
  id: true,
  title: true,
  reflection: true,
  author: true,
  visibility: true,
  descriptor: true,
  isVoiceOfWeek: true,
  createdAt: true,
} as const;

const DEFAULT_COMMUNITY_PAGE_SIZE = 4;
const MAX_COMMUNITY_PAGE_SIZE = 12;

function normalizePositiveInteger(value: number, fallback: number) {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  const rounded = Math.floor(value);
  return rounded >= 1 ? rounded : fallback;
}

export async function getPublicVoiceFeed(options?: {
  communityPage?: number;
  pageSize?: number;
}) {
  const communityPage = normalizePositiveInteger(options?.communityPage ?? 1, 1);
  const requestedPageSize = normalizePositiveInteger(
    options?.pageSize ?? DEFAULT_COMMUNITY_PAGE_SIZE,
    DEFAULT_COMMUNITY_PAGE_SIZE,
  );
  const pageSize = Math.min(requestedPageSize, MAX_COMMUNITY_PAGE_SIZE);

  const voiceOfWeek = await prisma.voiceSubmission.findFirst({
    where: {
      status: "approved",
      isVoiceOfWeek: true,
    },
    orderBy: [{ approvedAt: "desc" }, { createdAt: "desc" }],
    select: publicVoiceSelect,
  });

  const communityWhere = {
    status: "approved",
    ...(voiceOfWeek ? { id: { not: voiceOfWeek.id } } : {}),
  } as const;

  const skip = (communityPage - 1) * pageSize;

  const [voices, totalCommunityVoices] = await prisma.$transaction([
    prisma.voiceSubmission.findMany({
      where: communityWhere,
      orderBy: [{ approvedAt: "desc" }, { createdAt: "desc" }],
      skip,
      take: pageSize,
      select: publicVoiceSelect,
    }),
    prisma.voiceSubmission.count({
      where: communityWhere,
    }),
  ]);

  const hasMore = skip + voices.length < totalCommunityVoices;

  return {
    voiceOfWeek,
    voices,
    pagination: {
      communityPage,
      pageSize,
      totalCommunityVoices,
      hasMore,
    },
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