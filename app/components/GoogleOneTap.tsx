"use client";

import Script from "next/script";
import { useEffect, useMemo, useRef } from "react";
import { signIn, useSession } from "next-auth/react";

export function GoogleOneTap() {
  const { status } = useSession();
  const initialized = useRef(false);

  const clientId = useMemo(() => process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "", []);

  useEffect(() => {
    if (status !== "unauthenticated") {
      return;
    }

    if (!clientId || initialized.current || !window.google) {
      return;
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      auto_select: false,
      cancel_on_tap_outside: true,
      callback: async ({ credential }) => {
        if (!credential) {
          return;
        }

        await signIn("googleonetap", {
          credential,
          callbackUrl: window.location.href,
        });
      },
    });

    window.google.accounts.id.prompt();
    initialized.current = true;

    return () => {
      if (window.google) {
        window.google.accounts.id.cancel();
      }
      initialized.current = false;
    };
  }, [clientId, status]);

  if (!clientId) {
    return null;
  }

  return <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />;
}
