import type {
  ArticleCardItem,
  BlogArticle,
  BlogPostPreview,
  CommunityVoiceItem,
  FeaturedReflection,
  HelpItem,
  JournalingPromptItem,
  MindfulnessPracticeItem,
  NavLinkItem,
  RecommendedBookItem,
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
  "TranquilityHub is a space created for reflection in a fast-moving world. Through thoughtful ideas, shared voices and meaningful resources, it encourages people to pause, think deeply and grow.";

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
  { label: "Journals", href: "/journals" },
  { label: "Voices", href: "/voices" },
  { label: "Resources", href: "/resources" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

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

export const blogArticles: BlogArticle[] = [
  {
    slug: "quiet-morning-reset",
    title: "A Quiet Morning Reset",
    author: "TranquilityHub Team",
    publishedOn: "March 20, 2026",
    imageSrc: "/featured-reflection.svg",
    imageAlt: "Sunrise over soft clouds",
    content: [
      "When your mornings begin with urgency, your thoughts can stay scattered all day. A quiet reset does not need to be long to be effective.",
      "Start by placing your phone face down and taking five steady breaths. Let your body settle before your inbox takes over your attention.",
      "Write one sentence in your journal: What matters most today? This single sentence creates direction and reduces decision fatigue.",
      "Close with one practical commitment such as drinking water, stretching, or reviewing your top priority for ten focused minutes.",
    ],
    reflectionMoment:
      "Which part of your morning most affects your mindset for the rest of the day?",
    relatedSlugs: ["mindful-study-breaks", "clarity-journaling"],
  },
  {
    slug: "mindful-study-breaks",
    title: "Mindful study breaks that actually work",
    author: "Editorial",
    publishedOn: "March 12, 2026",
    imageSrc: "/featured-reflection.svg",
    imageAlt: "Notebook and coffee on a desk",
    content: [
      "Most breaks fail because they are unplanned. Mindful breaks work when they are intentional and short.",
      "Try a 4-4-6 breathing cycle for one minute, then stand and stretch your shoulders and neck for two minutes.",
      "Before returning to work, write the next tiny step of your task. This reduces friction and helps you restart quickly.",
      "Consistency matters more than duration. Three mindful breaks in a day can improve focus more than one long break.",
    ],
    reflectionMoment: "What does a productive break look like for you?",
    relatedSlugs: ["clarity-journaling", "reset-rituals"],
  },
  {
    slug: "clarity-journaling",
    title: "Clarity journaling for busy minds",
    author: "Guest Writer",
    publishedOn: "March 8, 2026",
    imageSrc: "/featured-reflection.svg",
    imageAlt: "Person writing in journal",
    content: [
      "Journaling is not about writing perfectly. It is about turning mental noise into visible words you can work with.",
      "Use a three-line structure: What am I feeling? What is making this hard? What is one helpful next step?",
      "When thoughts repeat, name them directly. Naming often lowers their intensity and helps you move forward with clarity.",
      "Keep entries short but frequent. A few honest lines each day are more valuable than occasional long entries.",
    ],
    reflectionMoment: "What thought are you ready to write down and release?",
    relatedSlugs: ["quiet-morning-reset", "reset-rituals"],
  },
  {
    slug: "reset-rituals",
    title: "Reset rituals after a long day",
    author: "Community",
    publishedOn: "March 2, 2026",
    imageSrc: "/featured-reflection.svg",
    imageAlt: "Warm light in a calm room",
    content: [
      "Ending your day with intention helps your mind transition from pressure to rest.",
      "Start with a two-minute brain dump. Place unfinished tasks on paper so your mind does not carry them overnight.",
      "Choose one calming signal: warm tea, light stretching, or soft music. Repeat it nightly to create a reliable wind-down cue.",
      "Finish by noting one thing that went well today. This builds emotional balance and perspective over time.",
    ],
    reflectionMoment: "How do you want to feel before you sleep tonight?",
    relatedSlugs: ["mindful-study-breaks", "quiet-morning-reset"],
  },
];

export const blogArticleBySlug = Object.fromEntries(
  blogArticles.map((article) => [article.slug, article]),
) as Record<string, BlogArticle>;

export const aboutPageContent = {
  paragraphs: [
    "TranquilityHub was created with a simple idea in mind: in a world that moves faster every day, people deserve a moment to pause, reflect and reconnect with themselves.",
    "As technology continues to reshape how we live, study and communicate, it has also become easier to overlook something essential — our mental well-being. Many of us move from one responsibility to the next without taking time to breathe, think and understand what we are truly feeling.",
    "TranquilityHub exists to create a small digital space for reflection, balance and thoughtful growth. Through articles, reflections, and practical resources, the platform encourages readers to slow down and think more intentionally about their lives, their goals, and their well-being.",
    "This website is especially aimed at students and young people who often face pressure from academics, expectations, and the fast pace of modern life. TranquilityHub hopes to offer ideas and perspectives that make that journey a little clearer and a little calmer.",
    "At its heart, TranquilityHub is not just about mental wellness — it is about creating moments of clarity in a noisy world.",
  ],
  founderNote:
    "I created TranquilityHub because I believe reflection is one of the most powerful tools we have for growth. As a student, I've seen how easy it is for people our age to feel overwhelmed by expectations and the fast pace of life. TranquilityHub is my attempt to create a space where reflection and mental clarity are encouraged.",
};

export const contactPageContent = {
  intro:
    "We would love to hear from you. Reach out for collaboration, questions, or thoughtful feedback.",
  email: "hello@tranquilityhub.org",
};
