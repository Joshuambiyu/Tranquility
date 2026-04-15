/* eslint-disable @typescript-eslint/no-require-imports */
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const AUTHOR = "Wanjiru Mbiyu";

const midnightArticles = [
  {
    slug: "the-company-you-keep",
    title: "The Company You Keep: How Relationships Shape Our Well-Being",
    excerpt:
      "The people we surround ourselves with have a powerful influence on our thoughts, emotions, and growth. This piece examines how choosing the right relationships can support your well-being and personal development.",
    reflectionMoment:
      "How have friendships that you have impacted you mentally and socially?",
    content: [
      "The environment around us profoundly influences our daily mood, particularly the people we interact with. Every person we meet brings a unique perspective into our lives, often carrying lessons that shape how we think and feel.",
      "Yet, we often overlook the impact our friends have on us. As social beings, human connection is essential, we are not designed to thrive in isolation. This natural inclination draws us toward new relationships, especially with those who seem friendly and relatable. Over time, however, we may drift away from family or long-standing bonds, and it is often in these moments that we begin to see people’s true colors.",
      "When relationships reach this stage, individuals may choose to focus on themselves, leading to separation or conflict. These situations can create emotional strain, often stemming from small, overlooked issues that build over time. Left unchecked, they can take a toll on mental well-being. This raises an important question: how can we protect our emotional health, and is every friendship worth maintaining?",
      "The relationships we maintain alongside work and studies should be healthy and restorative. They should provide a sense of relief and renewal amid demanding schedules. While advice about choosing the right company often emphasizes moral character, the reality is broader: the people around us influence our emotional awareness, personal growth, and overall outlook.",
      "Healthy friendships challenge us to grow emotionally, socially, mentally, and even spiritually. A strong support system motivates and encourages us, while the energy of those around us can directly affect our mood. Positive, uplifting individuals inspire confidence and resilience, whereas toxic or negative environments drain energy and can lead to emotional exhaustion or burnout. Supportive friends foster a sense of belonging, helping us feel valued and understood.",
      "As life progresses, we meet new people who play varying roles in our journey. Over time, the focus naturally shifts from the quantity of friendships to their quality. Choosing the right people to grow with becomes essential. Dependable and trustworthy friends make a meaningful difference in both personal and academic pursuits. True friendship eases life’s burdens, offering encouragement and room for growth without judgment.",
      "Ultimately, healthy relationships bring out the best in us. Surrounding yourself with positive, supportive individuals cultivates emotional balance, clarity, and resilience. Cherish friendships with those who understand your past, accept who you are, and encourage the person you are becoming.",
    ],
  },
  {
    slug: "the-quiet-power-of-reflection",
    title: "The Quiet Power of Reflection",
    excerpt:
      "Reflection is often ignored in a fast-paced world, yet it is essential for growth and self-awareness. This blog explores how pausing to reflect can bring clarity, direction, and deeper understanding.",
    reflectionMoment:
      "What makes you feel like you could do some reflection today?",
    content: [
      "In a fast-moving world, reflection is often overlooked. We are constantly focused on what comes next: tasks, goals, and responsibilities, leaving little room to pause and look inward. Yet, it is through reflection that we gain the clarity needed to move forward with purpose.",
      "Reflection is not simply about thinking, it is about understanding. It allows us to process our experiences, recognize patterns in our behavior, and learn from both our successes and our mistakes. Without it, we move from one moment to the next without fully grasping what those moments are teaching us.",
      "Taking time to reflect creates a sense of awareness. It helps us identify what is working in our lives and what is not. More importantly, it gives us the opportunity to make intentional changes instead of repeating the same patterns unconsciously.",
      "In many cases, the lack of reflection leads to mental clutter. Thoughts build up, emotions go unprocessed, and over time, this can create a sense of confusion or overwhelm. Reflection acts as a reset, it clears the mind and brings a sense of order to our thoughts.",
      "It is important to understand that reflection does not require long periods of time. Even small, consistent moments of stillness can make a significant difference. Whether it is at the end of the day or during a quiet break, these moments allow us to reconnect with ourselves.",
      "Reflection also fuels growth. When we take the time to evaluate our actions and decisions, we become more self-aware. That awareness is what enables us to improve, adapt, and move forward with greater clarity.",
      "In the end, reflection is not a luxury, it is a necessity. It is the quiet process that shapes our understanding, guides our decisions, and supports our personal growth. Sometimes, the progress we seek is not found in constant action, but in taking the time to pause and truly reflect.",
    ],
  },
  {
    slug: "silent-moment",
    title: "Silent Moment: Reclaiming Clarity in Stillness",
    excerpt:
      "Amid constant noise and distraction, silence offers something rare—clarity. Discover how taking intentional moments of stillness can help you reconnect with yourself and restore mental balance.",
    reflectionMoment:
      "What benefit do you find out of creating moments of silence for yourself?",
    content: [
      "Amid constant noise and distraction, silence offers something rare: clarity. Taking intentional moments of stillness can help you reconnect with yourself and restore mental balance.",
      "Even a short pause without notifications, conversations, or background noise can lower mental clutter and give your thoughts room to settle. In that space, it becomes easier to hear what you are actually feeling and what you need next.",
      "Silence is not emptiness. It is recovery for attention, emotions, and perspective. The habit of choosing a silent moment each day can become a practical anchor for calm and self-awareness.",
    ],
  },
  {
    slug: "rest-for-clarity",
    title: "Rest for Clarity: What We Lose When We Never Pause",
    excerpt:
      "In a world that glorifies constant effort, rest is often overlooked. This piece explores how stepping back is not a weakness, but a necessary part of gaining clarity and sustaining meaningful progress.",
    reflectionMoment:
      "How much overwhelming has your last week been?",
    content: [
      "Starting the final year of high school often comes with a shift in mindset. Suddenly, everything feels more serious. The pressure increases, expectations rise, and for many of us, rest begins to feel like a luxury we cannot afford.",
      "There is a common belief we tend to adopt during this period: sacrifice now so we can rest later. At first, it sounds reasonable, even necessary. But over time, it raises an important question: what does that sacrifice actually cost us?",
      "In the pursuit of success, we gradually give up moments of rest, reflection, and stillness. Our days become filled with constant activity: studying, planning, and trying to stay ahead. While this may look productive on the surface, it often leads to mental exhaustion rather than clarity.",
      "What many of us fail to realize is that rest is not a distraction from progress, it is part of it.",
      "Without rest, our ability to think clearly begins to decline. We struggle to focus, our concentration weakens, and even simple tasks start to feel overwhelming. The mind, much like the body, requires time to recover. Without that recovery, we are not operating at our best, we are simply pushing through fatigue.",
      "Rest also creates space for reflection. It allows us to step back, process our experiences, and gain a better understanding of ourselves and our goals. In those quiet moments, we often find clarity that constant activity cannot provide.",
      "This does not mean abandoning responsibility or avoiding hard work. Rather, it is about recognizing that sustainable progress requires balance. Working endlessly without pause is not strength, it is a fast path to burnout.",
      "If we truly want to perform at our best, we must begin to value rest as much as effort. Sometimes, the clarity we are searching for does not come from doing more, but from allowing ourselves the time to pause, breathe, and reset.",
    ],
  },
];

async function main() {
  for (const article of midnightArticles) {
    await prisma.article.upsert({
      where: {
        slug: article.slug,
      },
      update: {
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        author: AUTHOR,
        imageSrc: "",
        imageAlt: article.title,
        reflectionMoment: article.reflectionMoment,
        isFeatured: false,
        status: "published",
      },
      create: {
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        author: AUTHOR,
        imageSrc: "",
        imageAlt: article.title,
        reflectionMoment: article.reflectionMoment,
        isFeatured: false,
        status: "published",
      },
    });

    console.log(`Upserted article: ${article.slug}`);
  }

  const count = await prisma.article.count({
    where: {
      slug: { in: midnightArticles.map((article) => article.slug) },
    },
  });

  console.log(`Done. Midnight seed articles in DB: ${count}/${midnightArticles.length}`);
}

main()
  .catch((error) => {
    console.error("Midnight article seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
