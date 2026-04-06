require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const seededArticles = [
  {
    slug: "quiet-morning-reset",
    title: "A Quiet Morning Reset",
    excerpt: "A practical five-minute routine for calmer mornings when your mind feels crowded.",
    author: "TranquilityHub Team",
    imageSrc: "/featured-reflection.svg",
    imageAlt: "Sunrise over soft clouds",
    reflectionMoment: "Which part of your morning most affects your mindset for the rest of the day?",
    isFeatured: true,
    content: [
      "When your mornings begin with urgency, your thoughts can stay scattered all day. A quiet reset does not need to be long to be effective.",
      "Start by placing your phone face down and taking five steady breaths. Let your body settle before your inbox takes over your attention.",
      "Write one sentence in your journal: What matters most today? This single sentence creates direction and reduces decision fatigue.",
      "Close with one practical commitment such as drinking water, stretching, or reviewing your top priority for ten focused minutes.",
    ],
  },
  {
    slug: "mindful-study-breaks",
    title: "Mindful study breaks that actually work",
    excerpt: "Three short reset habits you can apply between tasks.",
    author: "Editorial",
    imageSrc: "/featured-reflection.svg",
    imageAlt: "Notebook and coffee on a desk",
    reflectionMoment: "What does a productive break look like for you?",
    isFeatured: false,
    content: [
      "Most breaks fail because they are unplanned. Mindful breaks work when they are intentional and short.",
      "Try a 4-4-6 breathing cycle for one minute, then stand and stretch your shoulders and neck for two minutes.",
      "Before returning to work, write the next tiny step of your task. This reduces friction and helps you restart quickly.",
    ],
  },
  {
    slug: "clarity-journaling",
    title: "Clarity journaling for busy minds",
    excerpt: "Prompt patterns to turn racing thoughts into direction.",
    author: "Guest Writer",
    imageSrc: "/featured-reflection.svg",
    imageAlt: "Person writing in journal",
    reflectionMoment: "What thought are you ready to write down and release?",
    isFeatured: false,
    content: [
      "Journaling is not about writing perfectly. It is about turning mental noise into visible words you can work with.",
      "Use a three-line structure: What am I feeling? What is making this hard? What is one helpful next step?",
      "When thoughts repeat, name them directly. Naming often lowers their intensity and helps you move forward with clarity.",
    ],
  },
  {
    slug: "reset-rituals",
    title: "Reset rituals after a long day",
    excerpt: "A calming routine to help you wind down with intention.",
    author: "Community",
    imageSrc: "/featured-reflection.svg",
    imageAlt: "Warm light in a calm room",
    reflectionMoment: "How do you want to feel before you sleep tonight?",
    isFeatured: false,
    content: [
      "Ending your day with intention helps your mind transition from pressure to rest.",
      "Start with a two-minute brain dump. Place unfinished tasks on paper so your mind does not carry them overnight.",
      "Choose one calming signal: warm tea, light stretching, or soft music.",
    ],
  },
  {
    slug: "grounding-in-fast-weeks",
    title: "Staying grounded in fast-moving weeks",
    excerpt: "Anchor habits that keep you centered when schedules get full.",
    author: "Editorial",
    imageSrc: "/featured-reflection.svg",
    imageAlt: "Journal and tea near a window",
    reflectionMoment: "What one habit keeps you grounded when your week gets noisy?",
    isFeatured: false,
    content: [
      "Fast weeks can make everything feel urgent. Grounding habits restore perspective before overwhelm takes over.",
      "Use one anchor habit each morning: breathe, list one priority, then begin.",
    ],
  },
  {
    slug: "digital-boundaries-for-calm",
    title: "Digital boundaries for calmer focus",
    excerpt: "Small phone habits that reduce mental fragmentation.",
    author: "TranquilityHub Team",
    imageSrc: "/featured-reflection.svg",
    imageAlt: "Phone resting on a closed notebook",
    reflectionMoment: "Which digital habit leaves your mind most scattered?",
    isFeatured: false,
    content: [
      "Attention leaks happen quietly. Notifications, quick checks, and tab hopping can drain your focus faster than you realize.",
      "Set two no-phone windows each day and protect them like meetings with yourself.",
    ],
  },
  {
    slug: "micro-pauses-that-work",
    title: "Micro-pauses that actually restore your mind",
    excerpt: "Why 60-second pauses can change decision quality.",
    author: "Guest Writer",
    imageSrc: "/featured-reflection.svg",
    imageAlt: "Hands resting quietly on a desk",
    reflectionMoment: "When do you most need a 60-second pause?",
    isFeatured: false,
    content: [
      "You do not always need long breaks. A short pause at the right moment can reset stress and improve your next choice.",
      "Pair micro-pauses with transitions between tasks for better consistency.",
    ],
  },
  {
    slug: "gentle-evening-checkin",
    title: "A gentle evening check-in for better rest",
    excerpt: "A 5-minute reflection pattern before sleep.",
    author: "Community",
    imageSrc: "/featured-reflection.svg",
    imageAlt: "Lamp light near a bedside journal",
    reflectionMoment: "What would help you close today with peace?",
    isFeatured: false,
    content: [
      "Evening reflection helps your mind close open loops before bedtime.",
      "Write three lines: what drained me, what restored me, what I release tonight.",
    ],
  },
  {
    slug: "single-task-power",
    title: "The power of single-task focus",
    excerpt: "How doing one thing well improves clarity and momentum.",
    author: "Editorial",
    imageSrc: "/featured-reflection.svg",
    imageAlt: "Minimal desk setup with one notebook",
    reflectionMoment: "What one task deserves your full attention today?",
    isFeatured: false,
    content: [
      "Single-tasking lowers context switching and gives your mind a cleaner path through difficult work.",
      "Choose one priority and commit to it for a focused block before checking messages.",
    ],
  },
  {
    slug: "calm-conversations",
    title: "Breathe before hard conversations",
    excerpt: "A small pause that changes how conflict unfolds.",
    author: "Guest Contributor",
    imageSrc: "/featured-reflection.svg",
    imageAlt: "Two chairs facing each other",
    reflectionMoment: "What helps you stay grounded in difficult conversations?",
    isFeatured: false,
    content: [
      "Conflict escalates quickly when we react from urgency. A short breath can create room for a wiser response.",
      "Practice one breath before replying in moments of tension.",
    ],
  },
  {
    slug: "weekly-reflection-loop",
    title: "Build a weekly reflection loop",
    excerpt: "Track what helps, what hurts, and what to adjust next week.",
    author: "TranquilityHub Team",
    imageSrc: "/featured-reflection.svg",
    imageAlt: "Weekly planner open on a desk",
    reflectionMoment: "What one adjustment would improve your next week?",
    isFeatured: false,
    content: [
      "Weekly review creates feedback for your real life, not an ideal one.",
      "Look at your week with honesty: what gave energy, what took energy, what should change.",
    ],
  },
  {
    slug: "mindful-commute-reset",
    title: "Turn your commute into a mindful reset",
    excerpt: "Use transitions to clear mental noise and arrive calmer.",
    author: "Community",
    imageSrc: "/featured-reflection.svg",
    imageAlt: "Road at sunrise",
    reflectionMoment: "How can your daily transitions support calm instead of rush?",
    isFeatured: false,
    content: [
      "Commutes are transition spaces. They can either amplify stress or become a reset ritual.",
      "Choose one simple commute practice: slower breathing, no doom scroll, or a clear intention for arrival.",
    ],
  },
];

async function main() {
  for (const article of seededArticles) {
    await prisma.article.upsert({
      where: {
        slug: article.slug,
      },
      update: {
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        author: article.author,
        imageSrc: article.imageSrc,
        imageAlt: article.imageAlt,
        reflectionMoment: article.reflectionMoment,
        isFeatured: article.isFeatured,
        status: "published",
      },
      create: {
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        author: article.author,
        imageSrc: article.imageSrc,
        imageAlt: article.imageAlt,
        reflectionMoment: article.reflectionMoment,
        isFeatured: article.isFeatured,
        status: "published",
      },
    });
  }

  const count = await prisma.article.count({ where: { status: "published" } });
  console.log(`Seeded/updated ${seededArticles.length} articles. Published total: ${count}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });