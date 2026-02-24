import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { contactSubmissionSchema } from "@/lib/validators";
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const contactRecipient = process.env.CONTACT_NOTIFY_TO;
const fromEmail = process.env.RESEND_FROM_EMAIL;

const resend = resendApiKey ? new Resend(resendApiKey) : null;

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

    if (resend && contactRecipient && fromEmail) {
      await resend.emails.send({
        from: fromEmail,
        to: contactRecipient,
        replyTo: parsed.data.email,
        subject: `New contact message from ${parsed.data.name}`,
        text: [
          `Name: ${parsed.data.name}`,
          `Email: ${parsed.data.email}`,
          "",
          "Message:",
          parsed.data.message,
        ].join("\n"),
      });
    }

    return NextResponse.json({ message: "Thanks for your message." }, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Something went wrong while sending your message." },
      { status: 500 },
    );
  }
}
