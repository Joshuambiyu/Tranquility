import type {
  ArticleCardItem,
  BlogPostPreview,
  CommunityVoiceItem,
  FeaturedReflection,
  HelpItem,
  JournalingPromptItem,
  MindfulnessPracticeItem,
  NavLinkItem,
  RecommendedBookItem,
  ReflectionResult,
  StressLevel,
  VoiceReflectionItem,
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

export const voicesIntro =
  "Voices is a space where different reflections and perspectives come together. Here thoughts from readers and contributors are shared to inspire calm thinking, growth and understanding.";

export const voiceOfWeek: VoiceReflectionItem = {
  id: "voice-week-1",
  title: "Finding quiet in busy days",
  reflection:
    "Sometimes clarity appears in the small pauses between our responsibilities.",
  author: "Anonymous",
};

export const voiceReflections: VoiceReflectionItem[] = [
  {
    id: "voice-card-1",
    title: "Steadier mornings",
    reflection:
      "I started taking ten silent minutes before touching my phone and it changed the tone of my day.",
    author: "A reader in Nairobi",
  },
  {
    id: "voice-card-2",
    title: "Breathe before replying",
    reflection:
      "My most practical growth habit has been one deep breath before difficult conversations.",
    author: "Campus contributor",
  },
  {
    id: "voice-card-3",
    title: "A notebook beside the bed",
    reflection:
      "Writing one line each night helps me end the day with gratitude instead of pressure.",
    author: "Anonymous",
  },
  {
    id: "voice-card-4",
    title: "Walking for perspective",
    reflection:
      "A short walk without headphones helps me sort out noisy thoughts into useful priorities.",
    author: "Guest writer",
  },
];

export const resourcesIntro =
  "This page gathers helpful tools and resources that support reflection, mental clarity and personal growth. Whether through journaling prompts, recommended readings or mindfulness practices, these resources are designed to help you slow down and think more deeply.";

export const journalingPrompts: JournalingPromptItem[] = [
  {
    id: "prompt-1",
    question: "What challenge recently helped you grow?",
  },
  {
    id: "prompt-2",
    question: "What small habit helps you feel grounded when your day is full?",
  },
  {
    id: "prompt-3",
    question: "Where in your current routine do you need more kindness toward yourself?",
  },
];

export const mindfulnessIntro =
  "Sometimes clarity comes from small moments of stillness. These practices encourage you to pause and reconnect with your thoughts.";

export const mindfulnessPractices: MindfulnessPracticeItem[] = [
  {
    id: "practice-1",
    title: "Healthy practice: Digital breaks from social media",
    description:
      "Take one intentional 30-minute break daily and use it for a short walk, stretching, or breathing practice.",
  },
  {
    id: "practice-2",
    title: "Five-minute grounding reset",
    description:
      "Name 5 things you can see, 4 you can feel, 3 you can hear, 2 you can smell, and 1 you can taste.",
  },
  {
    id: "practice-3",
    title: "Single-task hour",
    description:
      "Set one focused hour for your most important task with notifications off and a clear intention.",
  },
];

export const recommendedBooks: RecommendedBookItem[] = [
  {
    id: "book-1",
    title: "The Things You Can See Only When You Slow Down",
    author: "Haemin Sunim",
    reason: "Gentle reflections on calm, balance, and mindful daily living.",
  },
  {
    id: "book-2",
    title: "Atomic Habits",
    author: "James Clear",
    reason: "Practical systems for building healthy patterns one step at a time.",
  },
  {
    id: "book-3",
    title: "The Gifts of Imperfection",
    author: "Brene Brown",
    reason: "A grounded guide to self-acceptance, courage, and emotional clarity.",
  },
];

export const resourceOfMonth = {
  title: "Resource of the Month: Weekly Reflection Template",
  description:
    "Use this 10-minute weekly check-in to review what drained you, what restored you, and one intention for next week.",
};

export const blogPageIntro =
  "Reflection is where growth becomes visible. Explore thoughtful writing from our community and editors.";

export const featuredBlogPost: BlogPostPreview = {
  id: "blog-featured-1",
  title: "A Quiet Morning Reset",
  author: "TranquilityHub Team",
  publishedOn: "March 20, 2026",
  imageSrc: "/featured-reflection.svg",
  imageAlt: "Sunrise over soft clouds",
  excerpt:
    "A practical five-minute routine for calmer mornings when your mind feels crowded.",
  reflectionMoment: "Which part of your morning most affects your mindset for the rest of the day?",
  href: "/blog/quiet-morning-reset",
};

export const blogPosts: BlogPostPreview[] = [
  {
    id: "blog-1",
    title: "Mindful study breaks that actually work",
    author: "Editorial",
    publishedOn: "March 12, 2026",
    imageSrc: "/featured-reflection.svg",
    imageAlt: "Notebook and coffee on a desk",
    excerpt: "Three short reset habits you can apply between tasks.",
    reflectionMoment: "What does a productive break look like for you?",
    href: "/blog/mindful-study-breaks",
  },
  {
    id: "blog-2",
    title: "Clarity journaling for busy minds",
    author: "Guest Writer",
    publishedOn: "March 8, 2026",
    imageSrc: "/featured-reflection.svg",
    imageAlt: "Person writing in journal",
    excerpt: "Prompt patterns to turn racing thoughts into direction.",
    reflectionMoment: "What thought are you ready to write down and release?",
    href: "/blog/clarity-journaling",
  },
  {
    id: "blog-3",
    title: "Reset rituals after a long day",
    author: "Community",
    publishedOn: "March 2, 2026",
    imageSrc: "/featured-reflection.svg",
    imageAlt: "Warm light in a calm room",
    excerpt: "A calming routine to help you wind down with intention.",
    reflectionMoment: "How do you want to feel before you sleep tonight?",
    href: "/blog/reset-rituals",
  },
];

export const aboutPageContent = {
  mission:
    "TranquilityHub exists to create digital spaces that make people feel calmer, clearer, and more grounded.",
  story:
    "What began as a small journaling idea became a shared platform where mindful reflection can live online without noise.",
  founderNote:
    "From the founder: We believe that even one honest reflection can change the direction of a day.",
  closing:
    "Take a breath. Keep what serves you. Let go of what does not.",
};

export const contactPageContent = {
  intro:
    "We would love to hear from you. Reach out for collaboration, questions, or thoughtful feedback.",
  email: "hello@tranquilityhub.org",
};
