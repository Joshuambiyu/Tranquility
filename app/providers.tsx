"use client";

import type { ReactNode } from "react";
import { ToastProvider } from "@/app/components/feedback/ToastProvider";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return <ToastProvider>{children}</ToastProvider>;
}
