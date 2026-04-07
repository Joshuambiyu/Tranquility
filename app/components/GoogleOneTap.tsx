"use client";

import { useEffect, useRef } from "react";
import { authClient, useSession } from "@/lib/auth-client";

export function GoogleOneTap() {
  const { status } = useSession();
  const promptedRef = useRef(false);

  useEffect(() => {
    if (status !== "unauthenticated" || promptedRef.current) {
      return;
    }

    promptedRef.current = true;

    void authClient.oneTap({
      callbackURL: window.location.pathname + window.location.search,
      fetchOptions: {
        onSuccess: () => {
          window.location.reload();
        },
      },
    });
  }, [status]);

  return null;
}
