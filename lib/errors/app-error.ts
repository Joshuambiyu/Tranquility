export type AppErrorCode =
  | "VALIDATION_ERROR"
  | "AUTH_REQUIRED"
  | "RATE_LIMITED"
  | "DB_UNAVAILABLE"
  | "DB_CONSTRAINT_ERROR"
  | "DB_QUERY_ERROR"
  | "NETWORK_ERROR"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly statusCode?: number;
  readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    options: { //Clear and self-documenting parameters for error construction, ensuring consistent error handling across the application.
      code: AppErrorCode;
      statusCode?: number;
      details?: Record<string, unknown>;
    },
  ) {
    super(message);
    this.name = "AppError";
    this.code = options.code;
    this.statusCode = options.statusCode;
    this.details = options.details;
  }
}

export function normalizeUnknownError(
  error: unknown,
  fallbackMessage: string,
  fallbackCode: AppErrorCode = "INTERNAL_ERROR",
): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(error.message || fallbackMessage, {
      code: fallbackCode,
    });
  }

  return new AppError(fallbackMessage, {
    code: fallbackCode,
  });
}

export function toUserMessage(error: unknown, fallbackMessage: string): string {
  return normalizeUnknownError(error, fallbackMessage).message;
}
