//smart parent
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { AboutSection } from "@/app/components/AboutSection";
import { DailyReflectionSection } from "@/app/components/DailyReflectionSection";
import { FeaturedReflectionSection } from "@/app/components/FeaturedReflectionSection";
import { HelpsSection } from "@/app/components/HelpsSection";
import { HeroSection } from "@/app/components/HeroSection";
import { MissionSection } from "@/app/components/MissionSection";
import { RecentArticlesSection } from "@/app/components/RecentArticlesSection";
import { VoicesSection } from "@/app/components/VoicesSection";
import {
  aboutSnippet,
  communityVoices,
  featuredReflection,
  helpItems,
  heroContent,
  missionText,
  recentArticles,
  reflectionPrompt,
} from "@/app/data/homepageData";
import { submitJournalReflection } from "@/lib/journal-submission";
import type { ReflectionSubmissionState, StressLevel } from "@/types";

export default function Home() {
  const { status: authStatus } = useSession();
  const [reflectionAnswer, setReflectionAnswer] = useState("");
  const [stressLevel, setStressLevel] = useState<StressLevel>("medium");
  const [submissionState, setSubmissionState] =
    useState<ReflectionSubmissionState>({ status: "idle" });

  const handleReflectionSubmit = async () => {
    if (authStatus !== "authenticated") {
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
      const data = await submitJournalReflection({
        prompt: reflectionPrompt,
        answer: trimmed,
        stressLevel,
      });

      setSubmissionState({ status: "submitted", result: data.result });
      setReflectionAnswer("");
    } catch (error) {
      setSubmissionState({
        status: "error",
        message: error instanceof Error ? error.message : "Unable to save your reflection. Please try again.",
      });
    }
  };

  return (
    <div className="grid min-h-screen bg-background text-foreground">
      <main className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
        <HeroSection
          siteName={heroContent.siteName}
          tagline={heroContent.tagline}
          ctaHref={heroContent.ctaHref}
          ctaLabel={heroContent.ctaLabel}
        />

        <MissionSection mission={missionText} />
        <HelpsSection items={helpItems} />

        <DailyReflectionSection
          prompt={reflectionPrompt}
          answer={reflectionAnswer}
          stressLevel={stressLevel}
          submissionState={submissionState}
          isSignedIn={authStatus === "authenticated"}
          onAnswerChange={setReflectionAnswer}
          onStressChange={setStressLevel}
          onSubmit={handleReflectionSubmit}
        />

        <FeaturedReflectionSection reflection={featuredReflection} />
        <VoicesSection voices={communityVoices} />
        <RecentArticlesSection articles={recentArticles} />
        <AboutSection description={aboutSnippet} />
      </main>
    </div>
  );
}
