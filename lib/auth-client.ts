import { createAuthClient } from "better-auth/react";
import { oneTapClient } from "better-auth/client/plugins";

// Always use the canonical www origin so OAuth cookies, state, and
// callbacks land on the same host.  Falls back to current origin in dev.
const baseURL =
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
  (typeof window !== "undefined" ? window.location.origin : undefined);

export const authClient = createAuthClient({
  ...(baseURL ? { baseURL } : {}),
  plugins: [
    oneTapClient({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "",
      autoSelect: false,
      cancelOnTapOutside: true,
      context: "signin",
    }),
  ],
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
