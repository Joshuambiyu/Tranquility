import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { generateReflectionResult } from "@/lib/reflection-generator";
import { prisma } from "@/lib/prisma";

beforeEach(async () => {
  await prisma.cachedQuote.deleteMany();
});

afterEach(async () => {
  await prisma.cachedQuote.deleteMany();
});

describe("reflection generator", () => {
  it("returns deterministic results for the same input", async () => {
    const input = {
      prompt: "What's one thing you can do today to feel calmer?",
      answer: "I want to slow down, breathe, and protect a quieter evening.",
      stressLevel: "medium" as const,
    };

    const first = await generateReflectionResult(input);
    const second = await generateReflectionResult(input);

    expect(second).toEqual(first);
  });

  it("uses encouragement for high stress reflections", async () => {
    const result = await generateReflectionResult({
      prompt: "What's one thing you can do today to feel calmer?",
      answer: "I need to focus on one task because everything feels heavy and difficult.",
      stressLevel: "high",
    });

    expect(result.tone).toBe("encouragement");
    expect(result.message).toContain("Return to");
  });

  it("can return quote-led guidance for lower stress gratitude reflections", async () => {
    const originalFetch = global.fetch;
    const calls: string[] = [];

    global.fetch = (async (input) => {
      const url = String(input);
      calls.push(url);

      return new Response(
        JSON.stringify({
          content: "Stay close to what helps you breathe.",
          author: "Tranquility Test",
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        },
      );
    }) as typeof fetch;

    try {
      const result = await generateReflectionResult({
        prompt: "What's one thing you can do today to feel calmer?",
        answer: "I want to stay grateful for one small blessing and keep a calmer pace.",
        stressLevel: "low",
      });

      expect(result.tone).toBe("quote");
      expect(result.message).toContain("Stay close to what helps you breathe.");
      expect(result.message).toContain("Let your focus stay close to");
      expect(calls[0]).toContain("api.quotable.io/random?tags=");
      expect(calls[0]).toContain("wisdom%7C");
    } finally {
      global.fetch = originalFetch;
    }
  });

  it("retries for better relevance before accepting a quote", async () => {
    const originalFetch = global.fetch;
    const quotableQuotes = [
      { content: "Success is near.", author: "A" },
      { content: "Dream bigger.", author: "B" },
      { content: "Calm breathing and rest build peace and quiet focus.", author: "C" },
    ];

    let callIndex = 0;
    global.fetch = (async () => {
      const quote = quotableQuotes[Math.min(callIndex, quotableQuotes.length - 1)];
      callIndex += 1;
      return new Response(JSON.stringify(quote), {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      });
    }) as typeof fetch;

    try {
      const result = await generateReflectionResult({
        prompt: "What's one thing you can do today to feel calmer?",
        answer: "I need to breathe, rest, and protect quiet time tonight.",
        stressLevel: "low",
      });

      expect(result.tone).toBe("quote");
      expect(result.message).toContain("Calm breathing and rest build peace and quiet focus.");
      expect(callIndex).toBeGreaterThanOrEqual(3);
    } finally {
      global.fetch = originalFetch;
    }
  });

  it("falls back to encouragement when external quotes are not relevant", async () => {
    const originalFetch = global.fetch;

    global.fetch = (async () =>
      new Response(
        JSON.stringify({
          content: "Winners never quit.",
          author: "Irrelevant",
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        },
      )) as typeof fetch;

    try {
      const result = await generateReflectionResult({
        prompt: "What's one thing you can do today to feel calmer?",
        answer: "I feel thankful for my family support and peaceful evening prayers today.",
        stressLevel: "low",
      });

      expect(result.tone).toBe("quote");
      expect(result.message).not.toContain("Winners never quit.");
      expect(result.message).toContain("Let your focus stay close to");
    } finally {
      global.fetch = originalFetch;
    }
  });

  it("reuses the persisted cache on repeated quote requests", async () => {
    const originalFetch = global.fetch;
    let fetchCalls = 0;

    global.fetch = (async () => {
      fetchCalls += 1;

      return new Response(
        JSON.stringify({
          content: "Quiet rest and breathing can steady the whole day.",
          author: "Cache Test",
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        },
      );
    }) as typeof fetch;

    try {
      const input = {
        prompt: "What's one thing you can do today to feel calmer?",
        answer: "I want to breathe and protect quiet rest tonight.",
        stressLevel: "low" as const,
      };

      const first = await generateReflectionResult(input);
      const second = await generateReflectionResult(input);

      expect(first.message).toContain("Quiet rest and breathing can steady the whole day.");
      expect(second.message).toContain("Quiet rest and breathing can steady the whole day.");
      expect(fetchCalls).toBe(1);
    } finally {
      global.fetch = originalFetch;
    }
  });
});
