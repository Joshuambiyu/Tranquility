import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { voiceSubmissionSchema } from "@/lib/validators";

export async function GET() {
  const approvedVoices = await prisma.voiceSubmission.findMany({
    where: { status: "approved" },
    orderBy: { createdAt: "desc" },
    take: 6,
    select: {
      id: true,
      title: true,
      reflection: true,
      author: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ voices: approvedVoices });
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { message: "You need to sign in with Google to submit your voice." },
        { status: 401 },
      );
    }

    const payload = await request.json();
    const parsed = voiceSubmissionSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Please provide a title and reflection with enough detail." },
        { status: 400 },
      );
    }

    await prisma.voiceSubmission.create({
      data: {
        title: parsed.data.title,
        reflection: parsed.data.reflection,
        author: session.user.name ?? session.user.email ?? "Community member",
        userId: session.user.id,
        status: "pending",
      },
    });

    return NextResponse.json(
      {
        message:
          "Your reflection was submitted and is now pending review before it appears publicly.",
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { message: "Something went wrong while submitting your reflection." },
      { status: 500 },
    );
  }
}
