"use client";

import { useFormStatus } from "react-dom";

export default function ArticleSubmitButtons({
  draftLabel,
  publishLabel,
}: {
  draftLabel: string;
  publishLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <button
        type="submit"
        name="submitIntent"
        value="draft"
        formNoValidate
        disabled={pending}
        className="inline-grid w-full place-items-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit"
      >
        {pending ? "Saving..." : draftLabel}
      </button>
      <button
        type="submit"
        name="submitIntent"
        value="publish"
        disabled={pending}
        className="inline-grid w-full place-items-center rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit"
      >
        {pending ? "Saving..." : publishLabel}
      </button>
    </div>
  );
}
