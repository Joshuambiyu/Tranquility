import { describe, expect, it } from "vitest";
import { generateReflectionResult } from "@/lib/reflection-generator";

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

    const result = await generateReflectionResult({
      prompt: "What's one thing you can do today to feel calmer?",
      answer: "I want to stay grateful for one small blessing and keep a calmer pace.",
      stressLevel: "low",
    });

    global.fetch = originalFetch;

    expect(result.tone).toBe("quote");
    expect(result.message).toContain("Stay close to what helps you breathe.");
    expect(result.message).toContain("Let your focus stay close to");
    expect(calls[0]).toContain("api.quotable.io/random?tags=");
    expect(calls[0]).toContain("wisdom%7C");
  });
});
