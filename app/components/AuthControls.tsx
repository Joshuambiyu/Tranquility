"use client";

import { authClient, useSession } from "@/lib/auth-client";
import { GoogleOneTap } from "@/app/components/GoogleOneTap";

export function AuthControls() {
  const { data: session, status } = useSession();

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
      <GoogleOneTap />
      <button
        type="button"
        onClick={() => authClient.signIn.social({ provider: "google", callbackURL: "/voices" })}
        className="inline-flex w-full items-center justify-center rounded-full border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 sm:w-auto sm:py-1.5"
      >
        Sign in with Google
      </button>
    </div>
  );
}
