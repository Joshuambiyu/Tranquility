"use client";

import { useFormStatus } from "react-dom";

type ActionSubmitButtonProps = {
  idleLabel: string;
  pendingLabel?: string;
  className: string;
};

export default function ActionSubmitButton({
  idleLabel,
  pendingLabel = "Working...",
  className,
}: ActionSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className={`${className} disabled:cursor-not-allowed disabled:opacity-60`}>
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
