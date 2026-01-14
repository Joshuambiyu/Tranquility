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
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Your short reflection
          <input
            value={answer}
            onChange={(event) => onAnswerChange(event.target.value)}
            type="text"
            placeholder="Write a short thought..."
            className="rounded-xl border border-sky-200 bg-white px-4 py-3 text-slate-900 outline-none ring-sky-300 transition focus:ring"
          />
        </label>

        <fieldset className="grid gap-2">
          <legend className="text-sm font-medium text-slate-700">How stressed are you today?</legend>
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
                      ? "bg-sky-600 text-white"
                      : "bg-sky-50 text-slate-700 ring-1 ring-sky-200 hover:bg-sky-100"
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
          className="rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
        >
          Submit Reflection
        </button>

        {submissionState.status === "submitted" ? (
          <p className="rounded-xl bg-sky-50 px-4 py-3 text-slate-700 ring-1 ring-sky-100">
            <span className="font-semibold text-slate-900">{submissionState.result.title}:</span>{" "}
            {submissionState.result.message}
          </p>
        ) : (
          <p className="text-sm text-slate-600">Submit to receive a gentle quote or journaling encouragement.</p>
        )}
      </div>
    </SectionBlock>
  );
}
