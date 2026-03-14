import { SectionBlock, SectionTitle } from "@/app/components/ui";
import type { ReflectionSubmissionState, StressLevel } from "@/types";

interface DailyReflectionSectionProps {
  prompt: string;
  answer: string;
  stressLevel: StressLevel;
  submissionState: ReflectionSubmissionState;
  onAnswerChange: (value: string) => void;
  onStressChange: (value: StressLevel) => void;
  onSubmit: () => void;
}

const stressOptions: StressLevel[] = ["low", "medium", "high"];

export function DailyReflectionSection({
  prompt,
  answer,
  stressLevel,
  submissionState,
  onAnswerChange,
  onStressChange,
  onSubmit,
}: DailyReflectionSectionProps) {
  return (
    <SectionBlock>
      <SectionTitle title="Daily Reflection" description={prompt} />
      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-[var(--text-muted)]">
          Your short reflection
          <input
            value={answer}
            onChange={(event) => onAnswerChange(event.target.value)}
            type="text"
            placeholder="Write a short thought..."
            className="rounded-xl border border-[var(--border-muted)] bg-[var(--surface)] px-4 py-3 text-[var(--text-strong)] outline-none ring-emerald-400 transition focus:ring"
          />
        </label>

        <fieldset className="grid gap-2">
          <legend className="text-sm font-medium text-[var(--text-muted)]">How stressed are you today?</legend>
          <div className="grid grid-cols-3 gap-2">
            {stressOptions.map((option) => {
              const isSelected = stressLevel === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => onStressChange(option)}
                  className={`rounded-xl px-3 py-2 text-sm font-semibold capitalize transition ${
                    isSelected
                      ? "bg-emerald-700 text-white"
                      : "bg-[var(--accent-soft-2)] text-[var(--text-muted)] ring-1 ring-[var(--border-muted)] hover:bg-[var(--accent-soft)]"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>

      <div className="grid gap-3 sm:grid-cols-[auto_1fr] sm:items-center">
        <button
          type="button"
          onClick={onSubmit}
          className="rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
        >
          Submit Reflection
        </button>

        {submissionState.status === "submitted" ? (
          <p className="rounded-xl bg-[var(--accent-soft-2)] px-4 py-3 text-[var(--text-muted)] ring-1 ring-[var(--border-muted)]">
            <span className="font-semibold text-[var(--text-strong)]">{submissionState.result.title}:</span>{" "}
            {submissionState.result.message}
          </p>
        ) : (
          <p className="text-sm text-[var(--text-muted)]">Submit to receive a gentle quote or journaling encouragement.</p>
        )}
      </div>
    </SectionBlock>
  );
}
