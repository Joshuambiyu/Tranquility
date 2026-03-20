"use client";

import { useEffect, useMemo, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { SectionBlock, SectionTitle } from "@/app/components/ui";
import { logClientError, parseApiError } from "@/lib/errors/client-error";
import {
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
          logClientError(await parseApiError(response, "Unable to load voices right now."), {
            scope: "voices.load",
          });
          return;
        }

        const result = (await response.json()) as { voices: PersistedVoice[] };
        setApprovedVoices(result.voices ?? []);
      } catch {
        logClientError("Unable to load voices right now.", {
          scope: "voices.load",
        });
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

      if (!response.ok) {
        if (response.status === 401) {
          const authError = await parseApiError(
            response,
            "Please sign in to submit your reflection.",
          );
          setSubmitError(authError.message);
          logClientError(authError, {
            scope: "voices.submit.auth",
          });
          return;
        }

        throw await parseApiError(response, "Unable to submit reflection.");
      }

      const result = (await response.json()) as { message?: string };

      setSubmitSuccess(
        result.message ?? "Your reflection has been submitted and is pending review.",
      );
      setTitle("");
      setReflection("");
    } catch (error) {
      logClientError(error, {
        scope: "voices.submit",
      });
      setSubmitError(error instanceof Error ? error.message : "Unable to submit reflection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-background text-foreground">
      <main className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
        <SectionBlock className="gap-4">
          <SectionTitle title="Voices" description={voicesIntro} />
        </SectionBlock>

        <SectionBlock>
          <SectionTitle title="Voice of the Week" />
          <article className="grid gap-3 rounded-xl bg-[var(--accent-soft)] p-6 ring-1 ring-[var(--border-muted)]">
            <h3 className="text-2xl font-semibold text-[var(--text-strong)] lg:text-3xl">{voiceOfWeek.title}</h3>
            <p className="text-base leading-relaxed text-[var(--text-muted)] lg:text-lg">{voiceOfWeek.reflection}</p>
            <p className="text-sm font-medium text-emerald-700">- {voiceOfWeek.author}</p>
          </article>
        </SectionBlock>

        <SectionBlock>
          <SectionTitle title="Community Reflections" description="Short reflections shared by our readers and contributors." />
          <div className="grid gap-4 md:grid-cols-2">
            {mergedVoices.map((voice) => (
              <article
                key={voice.id}
                className="grid gap-3 rounded-xl bg-[var(--surface-muted)] p-6 ring-1 ring-[var(--border-muted)]"
              >
                <h3 className="text-xl font-semibold text-[var(--text-strong)] lg:text-2xl">{voice.title}</h3>
                <p className="text-base leading-relaxed text-[var(--text-muted)]">{voice.reflection}</p>
                <p className="text-sm font-medium text-emerald-700">- {voice.author}</p>
              </article>
            ))}
          </div>
        </SectionBlock>

        <SectionBlock className="gap-4 bg-[var(--surface-muted)]">
          <SectionTitle title="Share your voice" />
          <p className="max-w-3xl text-[var(--text-muted)]">
            Do you have a reflection or thought you would like to share? TranquilityHub welcomes thoughtful perspectives from readers.
          </p>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <label className="grid gap-2 text-sm font-medium text-[var(--text-muted)]">
              Reflection title
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                maxLength={140}
                className="rounded-xl border border-[var(--border-muted)] bg-[var(--surface)] px-4 py-3 text-[var(--text-strong)] outline-none ring-emerald-400 transition focus:ring"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-[var(--text-muted)]">
              Your reflection
              <textarea
                rows={4}
                value={reflection}
                onChange={(event) => setReflection(event.target.value)}
                required
                maxLength={2000}
                className="rounded-xl border border-[var(--border-muted)] bg-[var(--surface)] px-4 py-3 text-[var(--text-strong)] outline-none ring-emerald-400 transition focus:ring"
              />
            </label>

            {status !== "authenticated" ? (
              <button
                type="button"
                onClick={() => signIn("google", { callbackUrl: "/voices" })}
                className="inline-grid w-fit place-items-center rounded-full border border-[var(--border-muted)] px-5 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-[var(--accent-soft)]"
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
            <p className="rounded-xl bg-[var(--accent-soft)] px-4 py-3 text-[var(--text-muted)] ring-1 ring-[var(--border-muted)]">
              {submitSuccess}
            </p>
          ) : null}
          {submitError ? (
            <p className="rounded-xl bg-rose-50 px-4 py-3 text-rose-700 ring-1 ring-rose-100">{submitError}</p>
          ) : null}
        </SectionBlock>
      </main>
    </div>
  );
}
