import type { ReflectionResult, ReflectionTone, StressLevel } from "@/types";

type ReflectionTheme = "rest" | "focus" | "gratitude" | "connection" | "courage" | "clarity";

type ExternalQuote = {
  text: string;
  author?: string;
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

async function fetchFromQuotable(signal: AbortSignal): Promise<ExternalQuote | null> {
  const response = await fetch("https://api.quotable.io/random", {
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

async function fetchExternalQuote(): Promise<ExternalQuote | null> {
  const timeout = AbortSignal.timeout(3000);

  const providers: Array<() => Promise<ExternalQuote | null>> = [
    () => fetchFromQuotable(timeout),
    () => fetchFromZenQuotes(timeout),
  ];

  for (const provider of providers) {
    try {
      const quote = await provider();
      if (quote) {
        return quote;
      }
    } catch {
      // Ignore provider failure and try the next provider.
    }
  }

  return null;
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
    const quote = await fetchExternalQuote();

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
