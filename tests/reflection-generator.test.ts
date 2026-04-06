import { describe, expect, it } from "vitest";
import { generateReflectionResult } from "@/lib/reflection-generator";

describe("reflection generator", () => {
  it("returns deterministic results for the same input", () => {
    const input = {
      prompt: "What's one thing you can do today to feel calmer?",
      answer: "I want to slow down, breathe, and protect a quieter evening.",
      stressLevel: "medium" as const,
    };

    const first = generateReflectionResult(input);
    const second = generateReflectionResult(input);

    expect(second).toEqual(first);
  });

  it("uses encouragement for high stress reflections", () => {
    const result = generateReflectionResult({
      prompt: "What's one thing you can do today to feel calmer?",
      answer: "I need to focus on one task because everything feels heavy and difficult.",
      stressLevel: "high",
    });

    expect(result.tone).toBe("encouragement");
    expect(result.message).toContain("Return to");
  });

  it("can return quote-led guidance for lower stress gratitude reflections", () => {
    const result = generateReflectionResult({
      prompt: "What's one thing you can do today to feel calmer?",
      answer: "I want to stay grateful for one small blessing and keep a calmer pace.",
      stressLevel: "low",
    });

    expect(result.tone).toBe("quote");
    expect(result.message).toContain("Let your focus stay close to");
  });
});
