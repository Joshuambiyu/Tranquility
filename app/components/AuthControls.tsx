"use client";

import { useState } from "react";
import { authClient, useSession } from "@/lib/auth-client";
import { GoogleOneTap } from "@/app/components/GoogleOneTap";

const ONE_TAP_SUPPRESS_KEY = "oneTapSuppressed";

type AuthControlsProps = {
  variant?: "desktop" | "mobile";
};

function getInitials(nameOrEmail: string) {
  const compact = nameOrEmail.trim();
  if (!compact) {
    return "U";
  }

  const parts = compact.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }

  return compact.slice(0, 2).toUpperCase();
}

export function AuthControls({ variant = "desktop" }: AuthControlsProps) {
  const { data: session, status } = useSession();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const isMobile = variant === "mobile";

  const handleContinueWithGoogle = async () => {
    if (isSigningIn) {
      return;
    }

    setIsSigningIn(true);
    sessionStorage.setItem(ONE_TAP_SUPPRESS_KEY, "1");

    try {
      // Reset any stale auth/session state before starting a new Google flow.
      await authClient.signOut();
    } catch {
      // Ignore sign-out errors and continue to start a fresh sign-in attempt.
    }

    try {
      await authClient.signIn.social({ provider: "google", callbackURL: "/voices" });
    } finally {
      setIsSigningIn(false);
    }
  };

  if (status === "loading") {
    return <p className="text-xs text-slate-500">Checking session...</p>;
  }

  if (status === "authenticated" && session?.user) {
    const displayName = session.user?.name ?? session.user?.email ?? "Signed in user";
    const avatarLabel = getInitials(displayName);

    return (
      <div
        className={isMobile
          ? "grid gap-3"
          : "flex w-full items-center gap-3"}
      >
        <div className={isMobile ? "flex items-center gap-3 rounded-2xl border border-[var(--border-muted)] bg-[var(--surface-muted)] px-3 py-2.5" : "flex items-center gap-2"}>
          {session.user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={session.user.image}
              alt={displayName}
              className="h-9 w-9 rounded-full border border-[var(--border-muted)] object-cover"
            />
          ) : (
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-muted)] bg-emerald-50 text-xs font-semibold text-emerald-700">
              {avatarLabel}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-[var(--text-strong)]">{displayName}</p>
            <p className="text-[11px] text-[var(--text-muted)]">Signed in</p>
          </div>
        </div>

        <button
          type="button"
          onClick={async () => {
            await authClient.signOut();
            window.location.href = "/";
          }}
          className={isMobile
            ? "inline-flex w-full items-center justify-center rounded-xl border border-emerald-200 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
            : "inline-flex items-center justify-center rounded-full border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"}
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className={isMobile ? "grid gap-2" : "flex w-full items-center gap-2"}>
      <GoogleOneTap enabled={!isSigningIn} />
      <button
        type="button"
        onClick={handleContinueWithGoogle}
        disabled={isSigningIn}
        className={isMobile
          ? "inline-flex w-full items-center justify-center rounded-xl border border-emerald-200 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
          : "inline-flex items-center justify-center rounded-full border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"}
      >
        {isSigningIn ? "Starting Google sign-in..." : "Sign in with Google"}
      </button>
    </div>
  );
}
