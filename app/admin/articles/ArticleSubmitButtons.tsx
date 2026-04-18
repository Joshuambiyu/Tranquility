"use client";

import { useMemo } from "react";
import { useFormStatus } from "react-dom";

import { adminButtonClass } from "@/app/admin/adminDesign";

function buildToken() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function ArticleSubmitButtons({
  draftLabel,
  publishLabel,
}: {
  draftLabel: string;
  publishLabel: string;
}) {
  const { pending } = useFormStatus();
  const submitToken = useMemo(() => buildToken(), []);

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <input type="hidden" name="submitToken" value={submitToken} />

      <button
        type="submit"
        name="submitIntent"
        value="draft"
        formNoValidate
        disabled={pending}
        className={adminButtonClass({ tone: "secondary" })}
      >
        {pending ? "Saving..." : draftLabel}
      </button>
      <button
        type="submit"
        name="submitIntent"
        value="publish"
        disabled={pending}
        className={adminButtonClass({ tone: "primary" })}
      >
        {pending ? "Saving..." : publishLabel}
      </button>
    </div>
  );
}
