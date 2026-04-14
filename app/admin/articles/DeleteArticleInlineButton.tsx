"use client";

import { useFormStatus } from "react-dom";

export default function DeleteArticleInlineButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(event) => {
        if (pending) {
          event.preventDefault();
          return;
        }

        const shouldDelete = window.confirm("Delete this article permanently?");
        if (!shouldDelete) {
          event.preventDefault();
        }
      }}
      className="rounded-full border border-rose-300 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Deleting..." : "Delete"}
    </button>
  );
}
