import { AppError } from "@/lib/errors/app-error";

type ApiErrorPayload = {
  message?: string;
  code?: string;
  details?: Record<string, unknown>;
};

export async function parseApiError(response: Response, fallbackMessage: string) {
  let payload: ApiErrorPayload | undefined;

  try {
    payload = (await response.json()) as ApiErrorPayload;
  } catch {
    payload = undefined;
  }

  const message = payload?.message ?? fallbackMessage;
  const code = (payload?.code ?? "INTERNAL_ERROR") as AppError["code"];

  return new AppError(message, {
    code,
    statusCode: response.status,
    details: payload?.details,
  });
}

export function logClientError(error: unknown, context: { scope: string; extra?: Record<string, unknown> }) {
  console.error("CLIENT_ERROR", {
    scope: context.scope,
    extra: context.extra,
    error: error instanceof Error ? error.message : error,
  });
}
