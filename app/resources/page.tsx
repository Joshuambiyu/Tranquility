"use client";

import { useState } from "react";
import { FooterSection } from "@/app/components/FooterSection";
import { SectionBlock, SectionTitle } from "@/app/components/ui";
import {
  footerLinks,
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
    <div className="grid min-h-screen bg-[radial-gradient(circle_at_top_right,_#dbe9f3,_#f0f6f2_40%,_#f7f8f4_75%)] text-slate-800">
      <main className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
        <SectionBlock className="gap-4">
          <SectionTitle title="Resources for Reflection and Growth" description={resourcesIntro} />
        </SectionBlock>

        <SectionBlock>
          <SectionTitle title="Journaling Prompts" description="Take a minute to answer one question and notice what comes up." />
          <div className="grid gap-4">
            {journalingPrompts.map((prompt) => (
              <article key={prompt.id} className="grid gap-3 rounded-2xl bg-white p-5 ring-1 ring-emerald-100">
                <h3 className="text-lg font-semibold text-slate-900">{prompt.question}</h3>
                <textarea
                  value={answers[prompt.id] ?? ""}
                  onChange={(event) => updateAnswer(prompt.id, event.target.value)}
                  rows={3}
                  placeholder="Write your response here..."
                  className="rounded-xl border border-emerald-200 bg-emerald-50/20 px-4 py-3 text-slate-800 outline-none ring-emerald-300 transition focus:ring"
                />
              </article>
            ))}
          </div>
        </SectionBlock>

        <SectionBlock>
          <SectionTitle title="Mindfulness Practices" description={mindfulnessIntro} />
          <div className="grid gap-4 md:grid-cols-3">
            {mindfulnessPractices.map((practice) => (
              <article key={practice.id} className="grid gap-2 rounded-2xl bg-cyan-50/60 p-5 ring-1 ring-cyan-100">
                <h3 className="text-lg font-semibold text-slate-900">{practice.title}</h3>
                <p className="text-slate-700">{practice.description}</p>
              </article>
            ))}
          </div>
        </SectionBlock>

        <SectionBlock>
          <SectionTitle title="Recommended Books" />
          <div className="grid gap-4 md:grid-cols-3">
            {recommendedBooks.map((book) => (
              <article key={book.id} className="grid gap-2 rounded-2xl bg-emerald-50/60 p-5 ring-1 ring-emerald-100">
                <h3 className="text-lg font-semibold text-slate-900">{book.title}</h3>
                <p className="text-sm text-slate-700">By {book.author}</p>
                <p className="text-slate-700">{book.reason}</p>
              </article>
            ))}
          </div>
        </SectionBlock>

        <SectionBlock className="bg-gradient-to-r from-white via-cyan-50/50 to-emerald-50/50">
          <SectionTitle title={resourceOfMonth.title} />
          <p className="text-slate-700">{resourceOfMonth.description}</p>
        </SectionBlock>
      </main>

      <div className="mx-auto grid w-full max-w-6xl px-5 pb-8 sm:px-8 lg:px-10">
        <FooterSection links={footerLinks} />
      </div>
    </div>
  );
}
