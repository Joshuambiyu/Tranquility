"use client";


import { useState } from "react";
import { authClient, useSession } from "@/lib/auth-client";
import { GoogleOneTap } from "@/app/components/GoogleOneTap";

const ONE_TAP_SUPPRESS_KEY = "oneTapSuppressed";

export function AuthControls() {
  const { data: session, status } = useSession();
  const [isSigningIn, setIsSigningIn] = useState(false);

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
    return (
      <div className="flex w-full flex-col items-stretch gap-2 sm:inline-flex sm:w-auto sm:flex-row sm:items-center">
        <p className="hidden text-xs text-slate-600 sm:block">{session.user?.name ?? session.user?.email}</p>
        <button
          type="button"
          onClick={async () => {
            await authClient.signOut();
            window.location.href = "/";
          }}
          className="inline-flex w-full items-center justify-center rounded-full border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 sm:w-auto sm:py-1.5"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-stretch gap-2 sm:inline-flex sm:w-auto sm:flex-row sm:items-center">
      <GoogleOneTap enabled={!isSigningIn} />
      <button
        type="button"
        onClick={handleContinueWithGoogle}
        disabled={isSigningIn}
        className="inline-flex w-full items-center justify-center rounded-full border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 sm:w-auto sm:py-1.5"
      >
        {isSigningIn ? "Starting Google sign-in..." : "Sign in with Google"}
      </button>
    </div>
  );
}
