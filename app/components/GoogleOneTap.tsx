"use client";

import { useCallback, useEffect, useRef } from "react";
import { authClient, useSession } from "@/lib/auth-client";

const ONE_TAP_SUPPRESS_KEY = "oneTapSuppressed";

export function GoogleOneTap({ onDismiss, enabled = true }: { onDismiss?: () => void; enabled?: boolean }) {
  const { status } = useSession();
  const promptedRef = useRef(false);
  const dismissedRef = useRef(false);

  const isLocalhost =
    typeof window !== "undefined" &&
    ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
  const allowLocalOneTap = process.env.NEXT_PUBLIC_ENABLE_LOCAL_ONE_TAP === "1";
  const shouldRunOneTap = enabled && (!isLocalhost || allowLocalOneTap);

  const dismissToFallback = useCallback((suppress = false) => {
    if (suppress) {
      sessionStorage.setItem(ONE_TAP_SUPPRESS_KEY, "1");
    }

    if (!dismissedRef.current && onDismiss) {
      dismissedRef.current = true;
      onDismiss();
    }
  }, [onDismiss]);

  useEffect(() => {
    if (!shouldRunOneTap) {
      window.google?.accounts.id.cancel?.();
      dismissToFallback(true);
      return;
    }

    if (status !== "unauthenticated" || promptedRef.current) {
      return;
    }

    if (sessionStorage.getItem(ONE_TAP_SUPPRESS_KEY) === "1") {
      dismissToFallback();
      return;
    }

    promptedRef.current = true;

    void authClient
      .oneTap({
        callbackURL: window.location.pathname + window.location.search,
        onPromptNotification: () => {
          dismissToFallback(true);
        },
        fetchOptions: {
          credentials: "include",
          onSuccess: () => {
            sessionStorage.removeItem(ONE_TAP_SUPPRESS_KEY);
            window.location.reload();
          },
          onError: () => {
            dismissToFallback(true);
          },
        },
      })
      .catch(() => {
        dismissToFallback(true);
      });

  }, [shouldRunOneTap, status, dismissToFallback]);

  return null;
}
