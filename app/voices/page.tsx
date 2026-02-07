"use client";

import { useEffect, useMemo, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { SectionBlock, SectionTitle } from "@/app/components/ui";
import { FooterSection } from "@/app/components/FooterSection";
import {
  footerLinks,
  voiceOfWeek,
  voiceReflections,
  voicesIntro,
} from "@/app/data/homepageData";
import type { VoiceReflectionItem } from "@/types";

interface PersistedVoice {
  id: string;
  title: string;
  reflection: string;
  author: string;
}

export default function VoicesPage() {
  const { status } = useSession();
  const [title, setTitle] = useState("");
  const [reflection, setReflection] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [approvedVoices, setApprovedVoices] = useState<PersistedVoice[]>([]);

  useEffect(() => {
    const loadApprovedVoices = async () => {
      try {
        const response = await fetch("/api/voices", { cache: "no-store" });
        if (!response.ok) {
          return;
        }

        const result = (await response.json()) as { voices: PersistedVoice[] };
        setApprovedVoices(result.voices ?? []);
      } catch {
        setApprovedVoices([]);
      }
    };

    void loadApprovedVoices();
  }, []);

  const mergedVoices = useMemo<VoiceReflectionItem[]>(() => {
    const dbVoices: VoiceReflectionItem[] = approvedVoices.map((voice) => ({
      id: `db-${voice.id}`,
      title: voice.title,
      reflection: voice.reflection,
      author: voice.author,
    }));

    return [...dbVoices, ...voiceReflections];
  }, [approvedVoices]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/voices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          reflection,
        }),
      });

      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        if (response.status === 401) {
          setSubmitError(result.message ?? "Please sign in to submit your reflection.");
          return;
        }

        throw new Error(result.message ?? "Unable to submit reflection.");
      }

      setSubmitSuccess(
        result.message ?? "Your reflection has been submitted and is pending review.",
      );
      setTitle("");
      setReflection("");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to submit reflection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-[radial-gradient(circle_at_top_left,_#e3f0ea,_#eef6fb_40%,_#f7f8f4_75%)] text-slate-800">
      <main className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
        <SectionBlock className="gap-4">
          <SectionTitle title="Voices" description={voicesIntro} />
        </SectionBlock>

        <SectionBlock>
          <SectionTitle title="Voice of the Week" />
          <article className="grid gap-3 rounded-2xl bg-gradient-to-br from-emerald-50 via-cyan-50 to-white p-6 ring-1 ring-emerald-100">
            <h3 className="text-2xl font-semibold text-slate-900">{voiceOfWeek.title}</h3>
            <p className="text-slate-700">{voiceOfWeek.reflection}</p>
            <p className="text-sm font-medium text-emerald-700">- {voiceOfWeek.author}</p>
          </article>
        </SectionBlock>

        <SectionBlock>
          <SectionTitle title="Community Reflections" description="Short reflections shared by our readers and contributors." />
          <div className="grid gap-4 md:grid-cols-2">
            {mergedVoices.map((voice) => (
              <article
                key={voice.id}
                className="grid gap-3 rounded-2xl bg-emerald-50/60 p-6 ring-1 ring-emerald-100"
              >
                <h3 className="text-xl font-semibold text-slate-900">{voice.title}</h3>
                <p className="text-slate-700">{voice.reflection}</p>
                <p className="text-sm font-medium text-emerald-700">- {voice.author}</p>
              </article>
            ))}
          </div>
        </SectionBlock>

        <SectionBlock className="gap-4 bg-gradient-to-r from-white via-emerald-50/40 to-cyan-50/40">
          <SectionTitle title="Share your voice" />
          <p className="max-w-3xl text-slate-700">
            Do you have a reflection or thought you would like to share? TranquilityHub welcomes thoughtful perspectives from readers.
          </p>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Reflection title
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                maxLength={140}
                className="rounded-xl border border-emerald-200 bg-white px-4 py-3 text-slate-800 outline-none ring-emerald-300 transition focus:ring"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Your reflection
              <textarea
                rows={4}
                value={reflection}
                onChange={(event) => setReflection(event.target.value)}
                required
                maxLength={2000}
                className="rounded-xl border border-emerald-200 bg-white px-4 py-3 text-slate-800 outline-none ring-emerald-300 transition focus:ring"
              />
            </label>

            {status !== "authenticated" ? (
              <button
                type="button"
                onClick={() => signIn("google", { callbackUrl: "/voices" })}
                className="inline-grid w-fit place-items-center rounded-full border border-emerald-200 px-5 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
              >
                Sign in with Google to Submit
              </button>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting || status !== "authenticated"}
              className="inline-grid w-fit place-items-center rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Submitting..." : "Submit your Reflection"}
            </button>
          </form>

          {submitSuccess ? (
            <p className="rounded-xl bg-emerald-50 px-4 py-3 text-slate-700 ring-1 ring-emerald-100">
              {submitSuccess}
            </p>
          ) : null}
          {submitError ? (
            <p className="rounded-xl bg-rose-50 px-4 py-3 text-rose-700 ring-1 ring-rose-100">{submitError}</p>
          ) : null}
        </SectionBlock>
      </main>

      <div className="mx-auto grid w-full max-w-6xl px-5 pb-8 sm:px-8 lg:px-10">
        <FooterSection links={footerLinks} />
      </div>
    </div>
  );
}
