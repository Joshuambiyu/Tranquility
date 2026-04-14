"use client";

import { useEffect, useRef } from "react";
import { useToast } from "@/app/components/feedback/ToastProvider";

type ToastOnMountProps = {
  id: string;
  type: "success" | "error" | "info";
  title: string;
  message?: string;
  enabled?: boolean;
};

export default function ToastOnMount({
  id,
  type,
  title,
  message,
  enabled = true,
}: ToastOnMountProps) {
  const { showToast } = useToast();
  const lastShownIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (lastShownIdRef.current === id) {
      return;
    }

    lastShownIdRef.current = id;
    showToast({ type, title, message });
  }, [enabled, id, message, showToast, title, type]);

  return null;
}
