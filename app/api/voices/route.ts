import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ApiError, toErrorResponse } from "@/lib/errors/api-error";
import { prisma } from "@/lib/prisma";
import { voiceSubmissionSchema } from "@/lib/validators";

export async function GET() {
  try {
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
  } catch (error) {
    return toErrorResponse(error, {
      fallbackMessage: "Something went wrong while loading voices.",
      route: "GET /api/voices",
    });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return toErrorResponse(
        new ApiError("You need to sign in with Google to submit your voice.", {
          statusCode: 401,
          code: "AUTH_REQUIRED",
        }),
        {
          fallbackMessage: "You need to sign in with Google to submit your voice.",
          route: "POST /api/voices",
        },
      );
    }

    const payload = await request.json();
    const parsed = voiceSubmissionSchema.safeParse(payload);

    if (!parsed.success) {
      return toErrorResponse(parsed.error, {
        fallbackMessage: "Please provide a title and reflection with enough detail.",
        route: "POST /api/voices",
      });
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
  } catch (error) {
    return toErrorResponse(error, {
      fallbackMessage: "Something went wrong while submitting your reflection.",
      route: "POST /api/voices",
    });
  }
}
