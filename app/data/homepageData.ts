import type {
  ArticleCardItem,
  CommunityVoiceItem,
  FeaturedReflection,
  HelpItem,
  NavLinkItem,
  ReflectionResult,
  StressLevel,
} from "@/types";

export const heroContent = {
  siteName: "TranquilityHub",
  tagline: "Pause. Reflect. Grow",
  ctaHref: "/blog",
  ctaLabel: "Explore Reflections",
} as const;

export const missionText =
  "TranquilityHub seeks to create a calm digital space where people can pause, reflect, and grow in a fast-moving world.";

export const aboutSnippet =
  "TranquilityHub is a mindful space designed to help you reset, reflect, and grow through intentional digital experiences.";

export const reflectionPrompt = "What's one thing you can do today to feel calmer?";

export const helpItems: HelpItem[] = [
  {
    icon: "📝",
    title: "Reflect",
    description:
      "Pause and explore your thoughts with guided reflections and mindful prompts.",
  },
  {
    icon: "🌿",
    title: "Find Clarity",
    description:
      "Learn how to focus on what truly matters in your day-to-day life.",
  },
  {
    icon: "✨",
    title: "Grow",
    description:
      "Develop habits that support mindfulness, balance, and personal growth.",
  },
];

export const featuredReflection: FeaturedReflection = {
  title: "A Quiet Morning Reset",
  summary:
    "Discover a gentle five-minute ritual that helps you slow down, reset your mind, and begin the day with intention.",
  href: "/blog/quiet-morning-reset",
  imageSrc: "/featured-reflection.svg",
  imageAlt: "Sunrise over soft clouds",
};

export const communityVoices: CommunityVoiceItem[] = [
  {
    id: "voice-1",
    title: "Balancing deadlines with self-kindness",
    description: "How one student learned to breathe before reacting to pressure.",
    href: "/voices/balancing-deadlines-self-kindness",
  },
  {
    id: "voice-2",
    title: "Finding calm during exam week",
    description: "A short reflection on routines that reduce overwhelm.",
    href: "/voices/finding-calm-exam-week",
  },
  {
    id: "voice-3",
    title: "Small pauses, big perspective shifts",
    description: "A practical story about reclaiming focus in a noisy schedule.",
    href: "/voices/small-pauses-big-perspective-shifts",
  },
];

export const recentArticles: ArticleCardItem[] = [
  {
    id: "article-1",
    title: "Mindful study breaks that actually work",
    description: "Three tiny reset habits you can apply between tasks.",
    href: "/blog/mindful-study-breaks",
  },
  {
    id: "article-2",
    title: "Clarity journaling for busy minds",
    description: "Prompt patterns to turn racing thoughts into direction.",
    href: "/blog/clarity-journaling",
  },
  {
    id: "article-3",
    title: "Reset rituals after a long day",
    description: "A calming routine to help you wind down with intention.",
    href: "/blog/reset-rituals",
  },
  {
    id: "article-4",
    title: "Staying grounded in fast-moving weeks",
    description: "Anchor habits that keep you centered when schedules get full.",
    href: "/blog/staying-grounded",
  },
];

export const footerLinks: NavLinkItem[] = [
  { label: "Home", href: "/" },
  { label: "Blog", href: "/blog" },
  { label: "Voices", href: "/voices" },
  { label: "Resources", href: "/resources" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const stressGuidance: Record<StressLevel, ReflectionResult> = {
  low: {
    tone: "quote",
    title: "Steady Energy",
    message:
      "\"Peace comes from tiny choices repeated with care.\" Try journaling one gratitude before lunch.",
  },
  medium: {
    tone: "encouragement",
    title: "Gentle Reminder",
    message:
      "You are carrying a lot. Pause for two calm breaths, then write one sentence about what matters most today.",
  },
  high: {
    tone: "encouragement",
    title: "Take It Slowly",
    message:
      "Your feelings are valid. Start with a two-minute brain dump, then pick a single next step.",
  },
};
