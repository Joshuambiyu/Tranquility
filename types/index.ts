export type StressLevel = "low" | "medium" | "high";

export type ReflectionTone = "quote" | "encouragement";

export interface NavLinkItem {
  label: string;
  href: string;
}

export interface HelpItem {
  icon: string;
  title: string;
  description: string;
}

export interface ArticleCardItem {
  id: string;
  title: string;
  description: string;
  href: string;
}

export interface FeaturedReflection {
  title: string;
  summary: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
}

export interface CommunityVoiceItem {
  id: string;
  title: string;
  description: string;
  href: string;
}

export interface ReflectionResult {
  tone: ReflectionTone;
  title: string;
  message: string;
}

export type ReflectionSubmissionState =
  | { status: "idle" }
  | { status: "submitted"; result: ReflectionResult };
