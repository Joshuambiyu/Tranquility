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

export interface VoiceReflectionItem {
  id: string;
  title: string;
  reflection: string;
  author: string;
}

export interface JournalingPromptItem {
  id: string;
  question: string;
}

export interface MindfulnessPracticeItem {
  id: string;
  title: string;
  description: string;
}

export interface RecommendedBookItem {
  id: string;
  title: string;
  author: string;
  reason: string;
}

export interface BlogPostPreview {
  id: string;
  title: string;
  author: string;
  publishedOn: string;
  imageSrc: string;
  imageAlt: string;
  excerpt: string;
  reflectionMoment: string;
  href: string;
}

export interface BlogArticle {
  slug: string;
  title: string;
  author: string;
  publishedOn: string;
  imageSrc: string;
  imageAlt: string;
  content: string[];
  reflectionMoment: string;
  relatedSlugs: string[];
}

export interface ReflectionResult {
  tone: ReflectionTone;
  title: string;
  message: string;
}

export type ReflectionSubmissionState =
  | { status: "idle" }
  | { status: "saving" }
  | { status: "error"; message: string }
  | { status: "submitted"; result: ReflectionResult };
