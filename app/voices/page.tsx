"use client";

import { useEffect, useMemo, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { Card, SectionBlock, SectionTitle } from "@/app/components/ui";
import { AppError } from "@/lib/errors/app-error";
import { logClientError, parseApiError } from "@/lib/errors/client-error";
import {
  voiceOfWeek,
  voiceReflections,
  voicesIntro,
} from "@/app/data/homepageData";
import type { VoiceReflectionItem, VoiceSubmissionType, VoiceVisibility } from "@/types";

interface PersistedVoice {
  id: string;
  title: string;
  reflection: string;
  author: string;
  submissionType: VoiceSubmissionType;
  visibility: VoiceVisibility;
  descriptor?: string | null;
  isVoiceOfWeek: boolean;
}

const submissionTypeLabels: Record<VoiceSubmissionType, string> = {
  idea: "Idea",
  quote: "Quote",
  "book-read": "Book Read",
  inspiration: "Inspiration",
};

const visibilityLabels: Record<VoiceVisibility, string> = {
  open: "Open",
  anonymous: "Anonymous",
};

function VoiceMeta({ voice }: { voice: VoiceReflectionItem }) {
  return (
    <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
      {voice.submissionType ? (
        <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1">
          {submissionTypeLabels[voice.submissionType]}
        </span>
      ) : null}
      {voice.visibility ? (
        <span className="rounded-full border border-[var(--border-muted)] px-3 py-1 text-[var(--text-muted)]">
          {visibilityLabels[voice.visibility]}
        </span>
      ) : null}
    </div>
  );
}

function VoiceAttribution({ voice }: { voice: VoiceReflectionItem }) {
  return (
    <div className="grid gap-1 text-sm">
      <p className="font-medium text-emerald-700">- {voice.author}</p>
      {voice.descriptor ? <p className="text-[var(--text-muted)]">{voice.descriptor}</p> : null}
    </div>
  );
}

export default function VoicesPage() {
  const { status } = useSession();
  const [title, setTitle] = useState("");
  const [reflection, setReflection] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionType, setSubmissionType] = useState<VoiceSubmissionType>("idea");
  const [visibility, setVisibility] = useState<VoiceVisibility>("open");
  const [descriptor, setDescriptor] = useState("");
  const [selectedVoiceOfWeek, setSelectedVoiceOfWeek] = useState<PersistedVoice | null>(null);
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

        const result = (await response.json()) as {
          voiceOfWeek: PersistedVoice | null;
          voices: PersistedVoice[];
        };
        setSelectedVoiceOfWeek(result.voiceOfWeek ?? null);
        setApprovedVoices(result.voices ?? []);
      } catch {
        logClientError("Unable to load voices right now.", {
          scope: "voices.load",
        });
        setSelectedVoiceOfWeek(null);
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
      submissionType: voice.submissionType,
      visibility: voice.visibility,
      descriptor: voice.descriptor,
    }));

    return dbVoices.length > 0 ? dbVoices : voiceReflections;
  }, [approvedVoices]);

  const featuredVoice: VoiceReflectionItem = selectedVoiceOfWeek
    ? {
        id: `featured-${selectedVoiceOfWeek.id}`,
        title: selectedVoiceOfWeek.title,
        reflection: selectedVoiceOfWeek.reflection,
        author: selectedVoiceOfWeek.author,
        submissionType: selectedVoiceOfWeek.submissionType,
        visibility: selectedVoiceOfWeek.visibility,
        descriptor: selectedVoiceOfWeek.descriptor,
      }
    : voiceOfWeek;

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
          submissionType,
          visibility,
          descriptor,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          const authError = await parseApiError(
            response,
            "Please sign in to submit your reflection.",
          );
          setSubmitError(authError.message);
          return;
        }

        throw await parseApiError(response, "Unable to submit voice.");
      }

      const result = (await response.json()) as { message?: string };

      setSubmitSuccess(
        result.message ?? "Your voice has been submitted and is pending review.",
      );
      setTitle("");
      setReflection("");
      setDescriptor("");
      setSubmissionType("idea");
      setVisibility("open");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to submit voice.";
      setSubmitError(message);

      if (!(error instanceof AppError) || error.code === "INTERNAL_ERROR") {
        logClientError(error, {
          scope: "voices.submit",
        });
      }
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
          <Card className="gap-3 p-6">
            <VoiceMeta voice={featuredVoice} />
            <h3 className="text-2xl font-semibold text-[var(--text-strong)] lg:text-3xl">{featuredVoice.title}</h3>
            <p className="text-base leading-relaxed text-[var(--text-muted)] lg:text-lg">{featuredVoice.reflection}</p>
            <VoiceAttribution voice={featuredVoice} />
          </Card>
        </SectionBlock>

        <SectionBlock>
          <SectionTitle title="Community Reflections" description="Short reflections shared by our readers and contributors." />
          <div className="grid gap-4 md:grid-cols-2">
            {mergedVoices.map((voice) => (
              <Card
                key={voice.id}
                className="gap-3 p-6"
              >
                <VoiceMeta voice={voice} />
                <h3 className="text-xl font-semibold text-[var(--text-strong)] lg:text-2xl">{voice.title}</h3>
                <p className="text-base leading-relaxed text-[var(--text-muted)]">{voice.reflection}</p>
                <VoiceAttribution voice={voice} />
              </Card>
            ))}
          </div>
        </SectionBlock>

        <SectionBlock id="share-your-voice" className="gap-4">
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
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-[var(--text-muted)]">
                Voice type
                <select
                  value={submissionType}
                  onChange={(event) => setSubmissionType(event.target.value as VoiceSubmissionType)}
                  className="rounded-xl border border-[var(--border-muted)] bg-[var(--surface)] px-4 py-3 text-[var(--text-strong)] outline-none ring-emerald-400 transition focus:ring"
                >
                  {Object.entries(submissionTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-medium text-[var(--text-muted)]">
                Posting mode
                <select
                  value={visibility}
                  onChange={(event) => setVisibility(event.target.value as VoiceVisibility)}
                  className="rounded-xl border border-[var(--border-muted)] bg-[var(--surface)] px-4 py-3 text-[var(--text-strong)] outline-none ring-emerald-400 transition focus:ring"
                >
                  {Object.entries(visibilityLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
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
            <label className="grid gap-2 text-sm font-medium text-[var(--text-muted)]">
              Optional descriptor
              <input
                value={descriptor}
                onChange={(event) => setDescriptor(event.target.value)}
                maxLength={80}
                placeholder="Example: Nairobi campus student"
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
              {isSubmitting ? "Submitting..." : "Submit your Voice"}
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
