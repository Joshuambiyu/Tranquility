import type { ReflectionResult, ReflectionTone, StressLevel } from "@/types";

type ReflectionTheme = "rest" | "focus" | "gratitude" | "connection" | "courage" | "clarity";

type ExternalQuote = {
  text: string;
  author?: string;
};

const themeTags: Record<ReflectionTheme, string[]> = {
  rest: ["wisdom", "inspirational"],
  focus: ["success", "inspirational"],
  gratitude: ["wisdom", "friendship"],
  connection: ["friendship", "wisdom"],
  courage: ["inspirational", "success"],
  clarity: ["wisdom", "inspirational"],
};

const themeKeywords: Record<ReflectionTheme, string[]> = {
  rest: ["rest", "calm", "peace", "slow", "breathe", "quiet"],
  focus: ["focus", "priority", "discipline", "goal", "attention", "work"],
  gratitude: ["gratitude", "grateful", "thankful", "appreciate", "blessing"],
  connection: ["friend", "family", "support", "community", "share", "care"],
  courage: ["courage", "brave", "fear", "strength", "difficult", "risk"],
  clarity: ["clarity", "understand", "direction", "truth", "mind", "reflect"],
};

const encouragementLibrary: Record<ReflectionTheme, string[]> = {
  rest: [
    "Let your answer become permission to slow one part of the day down. Choose one calming action and protect it.",
    "Give yourself a smaller target today. A gentle rhythm will carry you farther than force.",
  ],
  focus: [
    "Keep your attention on one meaningful task before you ask anything else of yourself today.",
    "Turn your reflection into one clear next action. Simplicity will help your mind settle.",
  ],
  gratitude: [
    "Hold onto what is already working, even if it feels small. That steadiness matters.",
    "Let this reflection guide one thankful choice today, especially in a rushed moment.",
  ],
  connection: [
    "If this feels heavy, let one trusted person share a small part of it with you.",
    "Care grows stronger when it is expressed. Reach out, even briefly, if that would help today.",
  ],
  courage: [
    "You do not need to solve everything now. Pick one brave, manageable step and let that be enough.",
    "Honor the difficulty without surrendering to it. One grounded action is real progress.",
  ],
  clarity: [
    "Your reflection already contains direction. Write down the clearest sentence and return to it later.",
    "Try reducing the day to one priority, one boundary, and one kindness toward yourself.",
  ],
};

const titleMap: Record<StressLevel, Record<ReflectionTheme, string>> = {
  low: {
    rest: "Quiet Pace",
    focus: "Steady Focus",
    gratitude: "Steady Energy",
    connection: "Shared Calm",
    courage: "Quiet Courage",
    clarity: "Clear Ground",
  },
  medium: {
    rest: "Gentle Reset",
    focus: "Gentle Focus",
    gratitude: "Grounded Gratitude",
    connection: "Stay Connected",
    courage: "Keep Going Gently",
    clarity: "Gentle Reminder",
  },
  high: {
    rest: "Take It Slowly",
    focus: "One Thing First",
    gratitude: "Hold One Good Thing",
    connection: "Do Not Carry It Alone",
    courage: "Small Brave Step",
    clarity: "Breathe, Then Begin",
  },
};

function hashSeed(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function pickDeterministic<T>(items: T[], seed: string) {
  return items[hashSeed(seed) % items.length] ?? items[0];
}

function normalizeQuote(rawText: string, rawAuthor?: string): ExternalQuote | null {
  const text = rawText.trim();
  if (!text) {
    return null;
  }

  const author = rawAuthor?.trim();
  return {
    text,
    ...(author ? { author } : {}),
  };
}

function tokenize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 4);
}

function scoreQuoteRelevance(quote: ExternalQuote, answer: string, theme: ReflectionTheme) {
  const quoteTokens = new Set(tokenize(quote.text));
  const answerTokens = tokenize(answer);
  const answerOverlap = answerTokens.filter((token) => quoteTokens.has(token)).length;
  const themeOverlap = themeKeywords[theme].filter((token) => quoteTokens.has(token)).length;

  return answerOverlap * 2 + themeOverlap;
}

async function fetchFromQuotable(theme: ReflectionTheme, signal: AbortSignal): Promise<ExternalQuote | null> {
  const tags = themeTags[theme].join("|");
  const response = await fetch(`https://api.quotable.io/random?tags=${encodeURIComponent(tags)}&maxLength=180`, {
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    return null;
  }

  const body = (await response.json()) as { content?: string; author?: string };
  if (!body.content) {
    return null;
  }

  return normalizeQuote(body.content, body.author);
}

async function fetchFromZenQuotes(signal: AbortSignal): Promise<ExternalQuote | null> {
  const response = await fetch("https://zenquotes.io/api/random", {
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    return null;
  }

  const body = (await response.json()) as Array<{ q?: string; a?: string }>;
  const first = body[0];
  if (!first?.q) {
    return null;
  }

  return normalizeQuote(first.q, first.a);
}

async function fetchRelatedQuote(input: { theme: ReflectionTheme; answer: string }): Promise<ExternalQuote | null> {
  const quotableTimeout = AbortSignal.timeout(3500);

  // Try multiple themed quotes and keep the one most related to the journal answer.
  let bestMatch: ExternalQuote | null = null;
  let bestScore = -1;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const candidate = await fetchFromQuotable(input.theme, quotableTimeout);
      if (candidate) {
        const score = scoreQuoteRelevance(candidate, input.answer, input.theme);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = candidate;
        }
      }
    } catch {
      // Ignore provider failure and continue.
    }
  }

  if (bestMatch) {
    return bestMatch;
  }

  const zenTimeout = AbortSignal.timeout(2500);
  try {
    const zenQuote = await fetchFromZenQuotes(zenTimeout);
    if (!zenQuote) {
      return null;
    }

    // Keep fallback quotes only when they loosely match the topic.
    const score = scoreQuoteRelevance(zenQuote, input.answer, input.theme);
    return score > 0 ? zenQuote : null;
  } catch {
    return null;
  }
}

function inferTheme(answer: string): ReflectionTheme {
  const normalized = answer.toLowerCase();

  if (/(sleep|rest|pause|slow|calm|breathe|breath|quiet)/.test(normalized)) {
    return "rest";
  }

  if (/(study|work|focus|priority|task|routine|discipline|plan)/.test(normalized)) {
    return "focus";
  }

  if (/(thank|grateful|gratitude|appreciate|blessing)/.test(normalized)) {
    return "gratitude";
  }

  if (/(friend|family|talk|share|community|support|help)/.test(normalized)) {
    return "connection";
  }

  if (/(fear|afraid|courage|hard|difficult|brave|risk)/.test(normalized)) {
    return "courage";
  }

  return "clarity";
}

function determineTone(stressLevel: StressLevel, theme: ReflectionTheme): ReflectionTone {
  if (stressLevel === "high") {
    return "encouragement";
  }

  if (stressLevel === "medium") {
    return theme === "gratitude" ? "quote" : "encouragement";
  }

  return theme === "focus" || theme === "clarity" ? "encouragement" : "quote";
}

function extractFocus(answer: string) {
  const compact = answer.replace(/\s+/g, " ").trim();
  const firstSentence = compact.split(/[.!?]/)[0]?.trim() ?? compact;
  const clipped = firstSentence.slice(0, 90).trim();
  return clipped || "what matters most today";
}

export async function generateReflectionResult(input: {
  prompt: string;
  answer: string;
  stressLevel: StressLevel;
}): Promise<ReflectionResult> {
  const theme = inferTheme(input.answer);
  const tone = determineTone(input.stressLevel, theme);
  const seed = `${input.prompt}:${input.answer}:${input.stressLevel}`;
  const focus = extractFocus(input.answer);
  const title = titleMap[input.stressLevel][theme];

  if (tone === "quote") {
    const quote = await fetchRelatedQuote({ theme, answer: input.answer });

    if (quote) {
      const attributedQuote = quote.author ? `"${quote.text}" — ${quote.author}` : `"${quote.text}"`;
      return {
        tone,
        title,
        message: `${attributedQuote} Let your focus stay close to "${focus}" today.`,
      };
    }

    const fallback = pickDeterministic(encouragementLibrary[theme], seed);
    return {
      tone,
      title,
      message: `${fallback} Let your focus stay close to "${focus}" today.`,
    };
  }

  const encouragement = pickDeterministic(encouragementLibrary[theme], seed);
  return {
    tone,
    title,
    message: `${encouragement} Return to "${focus}" whenever the day starts to scatter your attention.`,
  };
}
