"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { DailyReflectionSection } from "@/app/components/DailyReflectionSection";
import { JournalsHeroSection } from "@/app/components/JournalsHeroSection";
import { Card, SectionBlock, SectionTitle } from "@/app/components/ui";
import { reflectionPrompt } from "@/app/data/homepageData";
import { submitJournalReflection } from "@/lib/journal-submission";
import type { ReflectionSubmissionState, StressLevel } from "@/types";

type JournalEntry = {
  id: string;
  prompt: string;
  answer: string;
  stressLevel: string;
  resultTone: string;
  resultTitle: string;
  resultMessage: string;
  createdAt: string;
};

type JournalResponse = {
  journals: JournalEntry[];
};

export default function JournalsPage() {
  const { status } = useSession();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reflectionAnswer, setReflectionAnswer] = useState("");
  const [stressLevel, setStressLevel] = useState<StressLevel>("medium");
  const [submissionState, setSubmissionState] = useState<ReflectionSubmissionState>({ status: "idle" });

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (status !== "authenticated") {
      setLoading(false);
      setError("Sign in with Google to access your saved journal reflections.");
      return;
    }

    async function loadJournals() {
      try {
        setLoading(true);
        const response = await fetch("/api/journals");
        const data = (await response.json().catch(() => null)) as JournalResponse | { message?: string } | null;

        if (!response.ok) {
          throw new Error((data as { message?: string } | null)?.message ?? "Unable to load your journals right now.");
        }

        setEntries((data as JournalResponse).journals ?? []);
        setError(null);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Unable to load your journals right now.");
      } finally {
        setLoading(false);
      }
    }

    void loadJournals();
  }, [status]);

  const handleReflectionSubmit = async () => {
    if (status !== "authenticated") {
      setSubmissionState({
        status: "error",
        message: "Please sign in with Google before submitting a journal reflection.",
      });
      return;
    }

    const trimmed = reflectionAnswer.trim();
    if (!trimmed) {
      setSubmissionState({
        status: "error",
        message: "Please write a short reflection before submitting.",
      });
      return;
    }

    setSubmissionState({ status: "saving" });

    try {
      const created = await submitJournalReflection({
        prompt: reflectionPrompt,
        answer: trimmed,
        stressLevel,
      });

      setEntries((current) => {
        if (current.some((entry) => entry.id === created.id)) {
          return current;
        }

        return [
          {
            id: created.id,
            prompt: reflectionPrompt,
            answer: trimmed,
            stressLevel,
            resultTone: created.result.tone,
            resultTitle: created.result.title,
            resultMessage: created.result.message,
            createdAt: created.createdAt,
          },
          ...current,
        ];
      });
      setSubmissionState({ status: "submitted", result: created.result });
      setReflectionAnswer("");
      setError(null);
    } catch (caught) {
      setSubmissionState({
        status: "error",
        message: caught instanceof Error ? caught.message : "Unable to save your reflection. Please try again.",
      });
    }
  };

  return (
    <div className="grid min-h-screen bg-background text-foreground">
      <main className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
        <JournalsHeroSection
          title="My Journals"
          description="Your saved daily reflections are stored in your account so you can revisit your growth over time."
          helperText="Submit a new reflection here or review the ones you have already saved."
        />

        <DailyReflectionSection
          prompt={reflectionPrompt}
          answer={reflectionAnswer}
          stressLevel={stressLevel}
          submissionState={submissionState}
          isSignedIn={status === "authenticated"}
          onAnswerChange={setReflectionAnswer}
          onStressChange={setStressLevel}
          onSubmit={handleReflectionSubmit}
        />

        {loading ? (
          <SectionBlock>
            <p className="text-[var(--text-muted)]">Loading your journal entries...</p>
          </SectionBlock>
        ) : error ? (
          <SectionBlock>
            <Card>
              <p className="text-sm text-[var(--text-muted)]">{error}</p>
              <Link href="/auth/signin" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
                Sign in to continue
              </Link>
            </Card>
          </SectionBlock>
        ) : entries.length === 0 ? (
          <SectionBlock>
            <Card>
              <p className="text-[var(--text-muted)]">
                You do not have saved reflections yet. Use the Daily Reflection form above to add your first entry.
              </p>
              <p className="text-sm font-semibold text-emerald-700">
                Your next reflection will appear here after submission.
              </p>
            </Card>
          </SectionBlock>
        ) : (
          <SectionBlock>
            <SectionTitle title="Recent Entries" />
            <div className="grid gap-4 md:grid-cols-2">
              {entries.map((entry) => (
                <Card key={entry.id} className="gap-2">
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    {new Date(entry.createdAt).toLocaleString()} • Stress: {entry.stressLevel}
                  </p>
                  <p className="text-[var(--text-strong)]">{entry.answer}</p>
                </Card>
              ))}
            </div>
          </SectionBlock>
        )}
      </main>
    </div>
  );
}
