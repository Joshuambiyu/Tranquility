//smart parent
"use client";

import { useState } from "react";
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
  stressGuidance,
} from "@/app/data/homepageData";
import type { ReflectionResult, ReflectionSubmissionState, StressLevel } from "@/types";

export default function Home() {
  const [reflectionAnswer, setReflectionAnswer] = useState("");
  const [stressLevel, setStressLevel] = useState<StressLevel>("medium");
  const [submissionState, setSubmissionState] =
    useState<ReflectionSubmissionState>({ status: "idle" });

  const handleReflectionSubmit = () => {
    const trimmed = reflectionAnswer.trim();
    const baseResult = stressGuidance[stressLevel];

    const result: ReflectionResult =
      trimmed.length > 0
        ? {
            ...baseResult,
            message: `${baseResult.message} Your focus for today: \"${trimmed}\".`,
          }
        : baseResult;

    setSubmissionState({ status: "submitted", result });
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
