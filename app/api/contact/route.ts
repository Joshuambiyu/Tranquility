import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { ApiError, logServerError, toErrorResponse } from "@/lib/errors/api-error";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { contactSubmissionSchema } from "@/lib/validators";
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const contactRecipient = process.env.CONTACT_NOTIFY_TO;
const fromEmail = process.env.RESEND_FROM_EMAIL;
const contactRateLimitWindowMs = Number(process.env.CONTACT_RATE_LIMIT_WINDOW_MS ?? "60000");
const contactRateLimitMax = Number(process.env.CONTACT_RATE_LIMIT_MAX ?? "5");

const resend = resendApiKey ? new Resend(resendApiKey) : null;

function getClientIdentifier(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  const ip = forwardedFor?.split(",")[0]?.trim() || realIp?.trim() || "unknown";

  return `contact:${ip}`;
}

export async function POST(request: Request) {
  try {
    const rateLimit = checkRateLimit(getClientIdentifier(request), {
      windowMs: Number.isFinite(contactRateLimitWindowMs) ? contactRateLimitWindowMs : 60000,
      maxRequests: Number.isFinite(contactRateLimitMax) ? contactRateLimitMax : 5,
    });

    if (!rateLimit.allowed) {
      const response = toErrorResponse(
        new ApiError("Too many messages sent in a short period. Please try again in a minute.", {
          statusCode: 429,
          code: "RATE_LIMITED",
          details: {
            retryAfterSeconds: rateLimit.retryAfterSeconds,
          },
        }),
        {
          fallbackMessage: "Too many requests.",
          route: "POST /api/contact",
        },
      );

      response.headers.set("Retry-After", String(rateLimit.retryAfterSeconds));
      return response;
    }

    const payload = await request.json();
    const parsed = contactSubmissionSchema.safeParse(payload);

    if (!parsed.success) {
      return toErrorResponse(parsed.error, {
        fallbackMessage: "Please check your name, email, and message and try again.",
        route: "POST /api/contact",
      });
    }

    if (parsed.data.website) {
      logServerError(
        new ApiError("Potential spam blocked by honeypot.", {
          statusCode: 400,
          code: "VALIDATION_ERROR",
        }),
        {
          route: "POST /api/contact",
          stage: "honeypot",
          extra: {
            field: "website",
          },
        },
      );

      return NextResponse.json(
        {
          message: "Thanks for your message.",
          emailSent: false,
        },
        { status: 201 },
      );
    }

    const session = await getServerSession();

    const submission = await prisma.contactSubmission.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        message: parsed.data.message,
        userId: session?.user?.id,
      },
    });

    let emailSent = false;

    if (resend && contactRecipient && fromEmail) {
      try {
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
        emailSent = true;
      } catch (error) {
        logServerError(error, {
          route: "POST /api/contact",
          stage: "resend.send",
          extra: {
            submissionId: submission.id,
          },
        });
      }
    } else {
      logServerError(
        new ApiError("Email notification skipped due to missing configuration.", {
          statusCode: 500,
          code: "INTERNAL_ERROR",
        }),
        {
          route: "POST /api/contact",
          stage: "resend.config",
          extra: {
            hasApiKey: Boolean(resendApiKey),
            hasRecipient: Boolean(contactRecipient),
            hasFromEmail: Boolean(fromEmail),
          },
        },
      );
    }

    return NextResponse.json(
      {
        message: "Thanks for your message.",
        emailSent,
      },
      { status: 201 },
    );
  } catch (error) {
    return toErrorResponse(error, {
      fallbackMessage: "Something went wrong while sending your message.",
      route: "POST /api/contact",
    });
  }
}
