"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { GoogleOneTap } from "@/app/components/GoogleOneTap";

export function AuthControls() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p className="text-xs text-slate-500">Checking session...</p>;
  }

  if (status === "authenticated" && session.user) {
    return (
      <div className="inline-flex items-center gap-2">
        <p className="hidden text-xs text-slate-600 sm:block">{session.user.name ?? session.user.email}</p>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="rounded-full border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2">
      <GoogleOneTap />
      <button
        type="button"
        onClick={() => signIn("google")}
        className="rounded-full border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
      >
        Sign in with Google
      </button>
    </div>
  );
}
