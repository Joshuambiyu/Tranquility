"use client";

import { useFormStatus } from "react-dom";

import { adminButtonClass } from "@/app/admin/adminDesign";

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
      className={adminButtonClass({ tone: "danger", size: "compact", fullWidth: false })}
    >
      {pending ? "Deleting..." : "Delete"}
    </button>
  );
}
