"use client";

import { useState } from "react";
import { Card, SectionBlock, SectionTitle } from "@/app/components/ui";
import { journalingPrompts } from "@/app/data/homepageData";

export function JournalingPromptsSection() {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  return (
    <SectionBlock>
      <SectionTitle
        title="Journaling Prompts"
        description="Take a minute to answer one question and notice what comes up."
      />
      <div className="grid gap-4">
        {journalingPrompts.map((prompt) => (
          <Card key={prompt.id} className="gap-3">
            <h3 className="text-lg font-semibold text-[var(--text-strong)]">{prompt.question}</h3>
            <textarea
              value={answers[prompt.id] ?? ""}
              onChange={(event) =>
                setAnswers((current) => ({ ...current, [prompt.id]: event.target.value }))
              }
              rows={3}
              placeholder="Write your response here..."
              className="rounded-xl border border-[var(--border-muted)] bg-[var(--surface)] px-4 py-3 text-[var(--text-strong)] outline-none ring-emerald-400 transition focus:ring"
            />
          </Card>
        ))}
      </div>
    </SectionBlock>
  );
}
