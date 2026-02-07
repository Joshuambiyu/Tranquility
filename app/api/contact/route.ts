import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { contactSubmissionSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = contactSubmissionSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Please provide a valid name, email, and message." },
        { status: 400 },
      );
    }

    const session = await getServerSession(authOptions);

    await prisma.contactSubmission.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        message: parsed.data.message,
        userId: session?.user?.id,
      },
    });

    return NextResponse.json({ message: "Thanks for your message." }, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Something went wrong while sending your message." },
      { status: 500 },
    );
  }
}
