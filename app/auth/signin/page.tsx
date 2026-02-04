"use client";

import { signIn } from "next-auth/react";

export default function SignInPage() {
  return (
    <main className="mx-auto grid min-h-[70vh] w-full max-w-3xl place-items-center px-5 py-10 sm:px-8 lg:px-10">
      <section className="grid w-full gap-5 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-emerald-100">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Sign in to TranquilityHub</h1>
        <p className="text-slate-700">
          Use Google Sign-In to submit your voice and access protected community features.
        </p>
        <div>
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/voices" })}
            className="rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            Continue with Google
          </button>
        </div>
      </section>
    </main>
  );
}
