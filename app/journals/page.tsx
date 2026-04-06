"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, SectionBlock, SectionTitle } from "@/app/components/ui";

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

  return (
    <div className="grid min-h-screen bg-background text-foreground">
      <main className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
        <SectionBlock className="gap-4">
          <SectionTitle
            title="My Journals"
            description="Your saved daily reflections are stored in your account so you can revisit your growth over time."
          />
          <p className="text-sm text-[var(--text-muted)]">
            New reflections from the home page will appear here after submission.
          </p>
        </SectionBlock>

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
                You do not have saved reflections yet. Start from the Daily Reflection section on the home page.
              </p>
              <Link href="/" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
                Go to Daily Reflection
              </Link>
            </Card>
          </SectionBlock>
        ) : (
          <SectionBlock>
            <SectionTitle title="Recent Entries" />
            <div className="grid gap-4 md:grid-cols-2">
              {entries.map((entry) => (
                <Card key={entry.id} className="gap-3">
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    {new Date(entry.createdAt).toLocaleString()} • Stress: {entry.stressLevel}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">{entry.prompt}</p>
                  <p className="text-[var(--text-strong)]">{entry.answer}</p>
                  <p className="rounded-xl bg-[var(--card-in-section-bg)] px-3 py-2 text-sm text-[var(--text-muted)] ring-1 ring-[var(--border-muted)]">
                    <span className="font-semibold text-[var(--text-strong)]">{entry.resultTitle}:</span> {entry.resultMessage}
                  </p>
                </Card>
              ))}
            </div>
          </SectionBlock>
        )}
      </main>
    </div>
  );
}
