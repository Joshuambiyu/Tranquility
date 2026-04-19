"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { authClient, useSession } from "@/lib/auth-client";
import { useToast } from "@/app/components/feedback/ToastProvider";
import { VoicesFeedLoading } from "@/app/components/loading/PageSkeletons";
import { Card, SectionBlock, SectionTitle } from "@/app/components/ui";
import { AppError } from "@/lib/errors/app-error";
import { logClientError, parseApiError } from "@/lib/errors/client-error";
import { voicesIntro } from "@/app/data/homepageData";
import type { VoiceReflectionItem, VoiceVisibility } from "@/types";

interface PersistedVoice {
  id: string;
  title: string;
  reflection: string;
  author: string;
  visibility: VoiceVisibility;
  descriptor?: string | null;
  isVoiceOfWeek: boolean;
}

const COMMUNITY_PAGE_SIZE = 4;

function ReflectionPreview({
  voice,
  maxChars,
}: {
  voice: VoiceReflectionItem;
  maxChars: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const isLong = voice.reflection.length > maxChars;
  const visibleText = isLong && !expanded
    ? `${voice.reflection.slice(0, maxChars).trimEnd()}...`
    : voice.reflection;

  return (
    <div className="grid gap-2">
      <p className="text-base leading-relaxed text-[var(--text-muted)] lg:text-lg">
        &quot;{visibleText}&quot;
      </p>
      {isLong ? (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="w-fit text-xs font-medium text-emerald-700 transition hover:text-emerald-800"
        >
          {expanded ? "See less" : "See more"}
        </button>
      ) : null}
      <VoiceAttribution voice={voice} />
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
  const { showToast } = useToast();
  const [isDesktop, setIsDesktop] = useState(false);
  const [title, setTitle] = useState("");
  const [reflection, setReflection] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shareAnonymously, setShareAnonymously] = useState(false);
  const [descriptor, setDescriptor] = useState("");
  const [selectedVoiceOfWeek, setSelectedVoiceOfWeek] = useState<PersistedVoice | null>(null);
  const [approvedVoices, setApprovedVoices] = useState<PersistedVoice[]>([]);
  const [isLoadingInitialVoices, setIsLoadingInitialVoices] = useState(true);
  const [communityPage, setCommunityPage] = useState(1);
  const [hasMoreCommunityVoices, setHasMoreCommunityVoices] = useState(false);
  const [isLoadingMoreCommunityVoices, setIsLoadingMoreCommunityVoices] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const apply = () => setIsDesktop(mediaQuery.matches);

    apply();
    mediaQuery.addEventListener("change", apply);

    return () => {
      mediaQuery.removeEventListener("change", apply);
    };
  }, []);

  const loadApprovedVoices = useCallback(async (page: number, append: boolean) => {
    try {
      if (!append) {
        setIsLoadingInitialVoices(true);
      }

      if (append) {
        setIsLoadingMoreCommunityVoices(true);
      }

      const response = await fetch(
        `/api/voices?communityPage=${page}&pageSize=${COMMUNITY_PAGE_SIZE}`,
        { cache: "no-store" },
      );
      if (!response.ok) {
        logClientError(await parseApiError(response, "Unable to load voices right now."), {
          scope: "voices.load",
        });
        if (!append) {
          showToast({
            type: "error",
            title: "Unable to load voices",
            message: "Please refresh and try again.",
          });
        }
        return;
      }

      const result = (await response.json()) as {
        voiceOfWeek: PersistedVoice | null;
        voices: PersistedVoice[];
        pagination?: {
          communityPage?: number;
          hasMore?: boolean;
        };
      };

      setSelectedVoiceOfWeek(result.voiceOfWeek ?? null);
      setApprovedVoices((current) => {
        if (!append) {
          return result.voices ?? [];
        }

        const existingIds = new Set(current.map((voice) => voice.id));
        const nextItems = (result.voices ?? []).filter((voice) => !existingIds.has(voice.id));
        return [...current, ...nextItems];
      });
      setCommunityPage(result.pagination?.communityPage ?? page);
      setHasMoreCommunityVoices(Boolean(result.pagination?.hasMore));
    } catch {
      logClientError("Unable to load voices right now.", {
        scope: "voices.load",
      });

      if (!append) {
        showToast({
          type: "error",
          title: "Unable to load voices",
          message: "Please refresh and try again.",
        });
      }

      if (!append) {
        setSelectedVoiceOfWeek(null);
        setApprovedVoices([]);
        setCommunityPage(1);
        setHasMoreCommunityVoices(false);
      }
    } finally {
      if (!append) {
        setIsLoadingInitialVoices(false);
      }

      if (append) {
        setIsLoadingMoreCommunityVoices(false);
      }
    }
  }, [showToast]);

  useEffect(() => {
    void loadApprovedVoices(1, false);
  }, [loadApprovedVoices]);

  const handleLoadMoreCommunityVoices = async () => {
    if (isLoadingMoreCommunityVoices || !hasMoreCommunityVoices) {
      return;
    }

    await loadApprovedVoices(communityPage + 1, true);
  };

  const mergedVoices = useMemo<VoiceReflectionItem[]>(() => {
    return approvedVoices.map((voice) => ({
      id: `db-${voice.id}`,
      title: voice.title,
      reflection: voice.reflection,
      author: voice.author,
      visibility: voice.visibility,
      descriptor: voice.descriptor,
    }));
  }, [approvedVoices]);

  const featuredVoice: VoiceReflectionItem | null = selectedVoiceOfWeek
    ? {
        id: `featured-${selectedVoiceOfWeek.id}`,
        title: selectedVoiceOfWeek.title,
        reflection: selectedVoiceOfWeek.reflection,
        author: selectedVoiceOfWeek.author,
        visibility: selectedVoiceOfWeek.visibility,
        descriptor: selectedVoiceOfWeek.descriptor,
      }
    : null;

  const featuredPreviewChars = isDesktop ? 440 : 260;
  const communityPreviewChars = isDesktop ? 300 : 180;

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
          visibility: shareAnonymously ? "anonymous" : "open",
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
      showToast({
        type: "success",
        title: "Voice submitted",
        message: result.message ?? "Your voice has been submitted and is pending review.",
      });
      setTitle("");
      setReflection("");
      setDescriptor("");
      setShareAnonymously(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to submit voice.";
      setSubmitError(message);
      showToast({
        type: "error",
        title: "Unable to submit voice",
        message,
      });

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
          {isLoadingInitialVoices ? (
            <Card className="gap-3 p-6">
              <div aria-hidden="true" className="th-shimmer h-8 w-3/5 rounded-xl" />
              <div aria-hidden="true" className="th-shimmer h-4 w-full rounded-xl" />
              <div aria-hidden="true" className="th-shimmer h-4 w-[92%] rounded-xl" />
              <div aria-hidden="true" className="th-shimmer h-4 w-[78%] rounded-xl" />
            </Card>
          ) : featuredVoice ? (
            <Card className="gap-3 p-6">
              <h3 className="text-2xl font-semibold text-[var(--text-strong)] lg:text-3xl">{featuredVoice.title}</h3>
              <ReflectionPreview voice={featuredVoice} maxChars={featuredPreviewChars} />
            </Card>
          ) : (
            <Card className="gap-3 p-6">
              <p className="text-sm text-[var(--text-muted)]">
                No Voice of the Week has been selected yet.
              </p>
            </Card>
          )}
        </SectionBlock>

        <SectionBlock>
          <SectionTitle title="Community Reflections" description="Short reflections shared by our readers and contributors." />
          {isLoadingInitialVoices ? (
            <VoicesFeedLoading />
          ) : mergedVoices.length === 0 ? (
            <Card className="gap-3 p-6">
              <p className="text-sm text-[var(--text-muted)]">
                No approved community reflections yet. Submitted voices appear here after admin approval.
              </p>
            </Card>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {mergedVoices.map((voice) => (
                  <Card
                    key={voice.id}
                    className="h-full gap-3 p-6"
                  >
                    <h3 className="text-xl font-semibold text-[var(--text-strong)] lg:text-2xl">{voice.title}</h3>
                    <ReflectionPreview voice={voice} maxChars={communityPreviewChars} />
                  </Card>
                ))}
              </div>

              {hasMoreCommunityVoices ? (
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={handleLoadMoreCommunityVoices}
                    disabled={isLoadingMoreCommunityVoices}
                    className="rounded-full border border-[var(--border-muted)] px-5 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-[var(--accent-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoadingMoreCommunityVoices ? "Loading voices..." : "See more voices"}
                  </button>
                </div>
              ) : null}
            </>
          )}
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
            <label className="flex items-center gap-3 rounded-xl border border-[var(--border-muted)] bg-[var(--surface)] px-4 py-3 text-sm font-medium text-[var(--text-muted)]">
              <input
                type="checkbox"
                checked={shareAnonymously}
                onChange={(event) => setShareAnonymously(event.target.checked)}
                className="h-4 w-4 rounded border-[var(--border-muted)] text-emerald-700 focus:ring-emerald-400"
              />
              Don&apos;t wanna share name (post anonymously)
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
                onClick={() => authClient.signIn.social({ provider: "google", callbackURL: "/voices" })}
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
