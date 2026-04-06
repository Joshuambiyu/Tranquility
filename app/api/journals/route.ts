import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ApiError, toErrorResponse } from "@/lib/errors/api-error";
import { prisma } from "@/lib/prisma";
import { generateReflectionResult } from "@/lib/reflection-generator";
import { journalSubmissionSchema } from "@/lib/validators";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return toErrorResponse(
        new ApiError("You need to sign in with Google to view your journal.", {
          statusCode: 401,
          code: "AUTH_REQUIRED",
        }),
        {
          fallbackMessage: "Authentication is required.",
          route: "GET /api/journals",
        },
      );
    }

    const journals = await prisma.userJournal.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 30,
      select: {
        id: true,
        prompt: true,
        answer: true,
        stressLevel: true,
        resultTone: true,
        resultTitle: true,
        resultMessage: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ journals });
  } catch (error) {
    return toErrorResponse(error, {
      fallbackMessage: "Something went wrong while loading your journal entries.",
      route: "GET /api/journals",
    });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return toErrorResponse(
        new ApiError("You need to sign in with Google to save your reflection.", {
          statusCode: 401,
          code: "AUTH_REQUIRED",
        }),
        {
          fallbackMessage: "Authentication is required.",
          route: "POST /api/journals",
        },
      );
    }

    const payload = await request.json();
    const parsed = journalSubmissionSchema.safeParse(payload);

    if (!parsed.success) {
      return toErrorResponse(parsed.error, {
        fallbackMessage: "Please complete your reflection before submitting.",
        route: "POST /api/journals",
      });
    }

    const result = await generateReflectionResult({
      prompt: parsed.data.prompt,
      answer: parsed.data.answer,
      stressLevel: parsed.data.stressLevel,
    });

    const created = await prisma.userJournal.create({
      data: {
        userId: session.user.id,
        prompt: parsed.data.prompt,
        answer: parsed.data.answer,
        stressLevel: parsed.data.stressLevel,
        resultTone: result.tone,
        resultTitle: result.title,
        resultMessage: result.message,
      },
      select: {
        id: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        id: created.id,
        createdAt: created.createdAt,
        message: "Your reflection was saved to your journal.",
        result,
      },
      { status: 201 },
    );
  } catch (error) {
    return toErrorResponse(error, {
      fallbackMessage: "Something went wrong while saving your reflection.",
      route: "POST /api/journals",
    });
  }
}
