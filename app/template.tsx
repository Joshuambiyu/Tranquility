import type { ReactNode } from "react";
import PageTransitionShell from "@/app/components/PageTransitionShell";

export default function AppTemplate({ children }: { children: ReactNode }) {
  return <PageTransitionShell>{children}</PageTransitionShell>;
}
