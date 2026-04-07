import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL:
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_NEXTAUTH_URL ||
    "http://localhost:3000",
});

export function useSession() {
  const sessionState = authClient.useSession();

  return {
    data: sessionState.data,
    status: sessionState.isPending
      ? ("loading" as const)
      : sessionState.data
        ? ("authenticated" as const)
        : ("unauthenticated" as const),
  };
}
