import { prisma } from "@/lib/prisma";

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