"use client";

import { useState } from "react";
import { SectionBlock, SectionTitle } from "@/app/components/ui";
import {
  journalingPrompts,
  mindfulnessIntro,
  mindfulnessPractices,
  recommendedBooks,
  resourceOfMonth,
  resourcesIntro,
} from "@/app/data/homepageData";

export default function ResourcesPage() {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const updateAnswer = (promptId: string, value: string) => {
    setAnswers((current) => ({ ...current, [promptId]: value }));
  };

  return (
    <div className="grid min-h-screen bg-background text-foreground">
      <main className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
        <SectionBlock className="gap-4">
          <SectionTitle title="Resources for Reflection and Growth" description={resourcesIntro} />
        </SectionBlock>

        <SectionBlock>
          <SectionTitle title="Journaling Prompts" description="Take a minute to answer one question and notice what comes up." />
          <div className="grid gap-4">
            {journalingPrompts.map((prompt) => (
              <article
                key={prompt.id}
                className="grid gap-3 rounded-xl bg-[var(--surface-muted)] p-5 ring-1 ring-[var(--border-muted)]"
              >
                <h3 className="text-lg font-semibold text-[var(--text-strong)]">{prompt.question}</h3>
                <textarea
                  value={answers[prompt.id] ?? ""}
                  onChange={(event) => updateAnswer(prompt.id, event.target.value)}
                  rows={3}
                  placeholder="Write your response here..."
                  className="rounded-xl border border-[var(--border-muted)] bg-[var(--surface)] px-4 py-3 text-[var(--text-strong)] outline-none ring-emerald-400 transition focus:ring"
                />
              </article>
            ))}
          </div>
        </SectionBlock>

        <SectionBlock>
          <SectionTitle title="Mindfulness Practices" description={mindfulnessIntro} />
          <div className="grid gap-4 md:grid-cols-3">
            {mindfulnessPractices.map((practice) => (
              <article
                key={practice.id}
                className="grid gap-2 rounded-xl bg-[var(--accent-soft-2)] p-5 ring-1 ring-[var(--border-muted)]"
              >
                <h3 className="text-lg font-semibold text-[var(--text-strong)]">{practice.title}</h3>
                <p className="text-[var(--text-muted)]">{practice.description}</p>
              </article>
            ))}
          </div>
        </SectionBlock>

        <SectionBlock>
          <SectionTitle title="Recommended Books" />
          <div className="grid gap-4 md:grid-cols-3">
            {recommendedBooks.map((book) => (
              <article
                key={book.id}
                className="grid gap-2 rounded-xl bg-[var(--accent-soft)] p-5 ring-1 ring-[var(--border-muted)]"
              >
                <h3 className="text-lg font-semibold text-[var(--text-strong)]">{book.title}</h3>
                <p className="text-sm text-[var(--text-muted)]">By {book.author}</p>
                <p className="text-[var(--text-muted)]">{book.reason}</p>
              </article>
            ))}
          </div>
        </SectionBlock>

        <SectionBlock className="bg-[var(--surface-muted)]">
          <SectionTitle title={resourceOfMonth.title} />
          <p className="text-[var(--text-muted)]">{resourceOfMonth.description}</p>
        </SectionBlock>
      </main>
    </div>
  );
}
