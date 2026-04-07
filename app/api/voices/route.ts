import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { ApiError, toErrorResponse } from "@/lib/errors/api-error";
import { getPublicVoiceFeed } from "@/lib/voice-submissions";
import { prisma } from "@/lib/prisma";
import { voiceSubmissionSchema } from "@/lib/validators";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const communityPage = Number(url.searchParams.get("communityPage") ?? "1");
    const pageSize = Number(url.searchParams.get("pageSize") ?? "4");

    const publicFeed = await getPublicVoiceFeed({
      communityPage,
      pageSize,
    });

    return NextResponse.json(publicFeed);
  } catch (error) {
    return toErrorResponse(error, {
      fallbackMessage: "Something went wrong while loading voices.",
      route: "GET /api/voices",
    });
  }
}


export async function POST(request: Request) {
  try {
    const session = await getServerSession();
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

    const author =
      parsed.data.visibility === "anonymous"
        ? "Anonymous"
        : session.user?.name ?? session.user?.email ?? "Community member";

    await prisma.voiceSubmission.create({
      data: {
        title: parsed.data.title,
        reflection: parsed.data.reflection,
        author,
        visibility: parsed.data.visibility,
        descriptor: parsed.data.descriptor,
        userId: session.user.id,
        status: "pending",
      },
    });

    return NextResponse.json(
      {
        message:
          "Your voice was submitted and is now pending review before it appears publicly.",
      },
      { status: 201 },
    );
  } catch (error) {
    return toErrorResponse(error, {
      fallbackMessage: "Something went wrong while submitting your voice.",
      route: "POST /api/voices",
    });
  }
}
