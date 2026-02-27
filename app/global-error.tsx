"use client";

import { useEffect } from "react";
import { logClientError } from "@/lib/errors/client-error";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    logClientError(error, {
      scope: "app.global-error",
      extra: {
        digest: error.digest,
      },
    });
  }, [error]);

  return (
    <html lang="en">
      <body className="grid min-h-screen place-items-center bg-[#f7f8f4] px-6 py-10 text-slate-900">
        <div className="grid max-w-xl gap-4 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="text-slate-700">
            We hit an unexpected issue while loading this page. Please try again.
          </p>
          <button
            type="button"
            onClick={reset}
            className="inline-grid w-fit place-items-center rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
