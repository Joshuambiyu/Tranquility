import type { ReflectionResult, StressLevel } from "@/types";

export interface SavedJournalReflection {
  id: string;
  createdAt: string;
  message: string;
  duplicate?: boolean;
  result: ReflectionResult;
}

export async function submitJournalReflection(input: {
  prompt: string;
  answer: string;
  stressLevel: StressLevel;
}): Promise<SavedJournalReflection> {
  const response = await fetch("/api/journals", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data = (await response.json().catch(() => null)) as
    | SavedJournalReflection
    | { message?: string }
    | null;

  if (!response.ok) {
    throw new Error(data?.message ?? "Unable to save your reflection. Please try again.");
  }

  return data as SavedJournalReflection;
}