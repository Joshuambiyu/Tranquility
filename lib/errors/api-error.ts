import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "@/lib/errors/app-error";

export class ApiError extends AppError {}

function normalizeError(error: unknown, fallbackMessage: string): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof ZodError) {
    const firstIssue = error.issues[0];

    return new ApiError(firstIssue?.message ?? "Please check your input and try again.", {
      statusCode: 400,
      code: "VALIDATION_ERROR",
      details: {
        issues: error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      },
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return new ApiError("This record already exists.", {
        statusCode: 409,
        code: "DB_CONSTRAINT_ERROR",
      });
    }

    return new ApiError("A database error occurred while processing your request.", {
      statusCode: 500,
      code: "DB_QUERY_ERROR",
      details: { prismaCode: error.code },
    });
  }

  if (
    error instanceof Prisma.PrismaClientInitializationError ||
    (error instanceof Error && /postgresql connection|\bclosed\b/i.test(error.message))
  ) {
    return new ApiError("Service is temporarily unavailable. Please try again shortly.", {
      statusCode: 503,
      code: "DB_UNAVAILABLE",
    });
  }

  return new ApiError(fallbackMessage, {
    statusCode: 500,
    code: "INTERNAL_ERROR",
  });
}

type ErrorLogContext = {
  route: string;
  stage?: string;
  extra?: Record<string, unknown>;
};

export function logServerError(error: unknown, context: ErrorLogContext) {
  const normalized = normalizeError(error, "Unexpected server error.");

  console.error("API_ERROR", {
    route: context.route,
    stage: context.stage ?? "unknown",
    code: normalized.code,
    message: normalized.message,
    details: normalized.details,
    extra: context.extra,
    cause: error instanceof Error ? error.message : error,
  });
}

export function toErrorResponse(error: unknown, options: { fallbackMessage: string; route: string }) {
  const normalized = normalizeError(error, options.fallbackMessage);

  logServerError(error, {
    route: options.route,
  });

  return NextResponse.json(
    {
      message: normalized.message,
      code: normalized.code,
      ...(normalized.details ? { details: normalized.details } : {}),
    },
    { status: normalized.statusCode },
  );
}
