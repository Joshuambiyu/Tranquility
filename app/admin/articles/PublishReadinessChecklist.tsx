"use client";

import { useEffect, useMemo, useState } from "react";

type PublishChecks = {
  titleReady: boolean;
  reflectionReady: boolean;
  contentReady: boolean;
  slugReady: boolean;
};

function toSlugCandidate(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function evaluateChecks(form: HTMLFormElement): PublishChecks {
  const title = (form.elements.namedItem("title") as HTMLInputElement | null)?.value?.trim() ?? "";
  const slug = (form.elements.namedItem("slug") as HTMLInputElement | null)?.value?.trim() ?? "";
  const reflection =
    (form.elements.namedItem("reflectionMoment") as HTMLTextAreaElement | null)?.value?.trim() ?? "";
  const plainContent = (form.elements.namedItem("content") as HTMLInputElement | null)?.value?.trim() ?? "";

  const slugCandidate = toSlugCandidate(slug || title);

  return {
    titleReady: title.length >= 4,
    reflectionReady: reflection.length >= 10,
    contentReady: plainContent.length > 0,
    slugReady: slugCandidate.length > 0,
  };
}

function ChecklistItem({ label, passed }: { label: string; passed: boolean }) {
  return (
    <li className={`flex items-center gap-2 text-xs ${passed ? "text-emerald-700" : "text-slate-600"}`}>
      <span
        aria-hidden="true"
        className={`inline-block h-1.5 w-1.5 rounded-full ${passed ? "bg-emerald-600" : "bg-slate-400"}`}
      />
      {label}
    </li>
  );
}

export default function PublishReadinessChecklist({ formId }: { formId: string }) {
  const [checks, setChecks] = useState<PublishChecks>({
    titleReady: false,
    reflectionReady: false,
    contentReady: false,
    slugReady: false,
  });

  useEffect(() => {
    const form = document.getElementById(formId) as HTMLFormElement | null;

    if (!form) {
      return;
    }

    const update = () => {
      setChecks(evaluateChecks(form));
    };

    update();
    form.addEventListener("input", update);
    form.addEventListener("change", update);

    return () => {
      form.removeEventListener("input", update);
      form.removeEventListener("change", update);
    };
  }, [formId]);

  const readyCount = useMemo(
    () =>
      [checks.titleReady, checks.reflectionReady, checks.contentReady, checks.slugReady].filter(Boolean).length,
    [checks],
  );

  return (
    <section className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-700">
        Publish readiness ({readyCount}/4)
      </p>
      <ul className="grid gap-1">
        <ChecklistItem label="Title has at least 4 characters" passed={checks.titleReady} />
        <ChecklistItem label="Reflection moment has at least 10 characters" passed={checks.reflectionReady} />
        <ChecklistItem label="Article content is not empty" passed={checks.contentReady} />
        <ChecklistItem label="Slug can be generated" passed={checks.slugReady} />
      </ul>
      <p className="text-[11px] text-slate-500">
        Draft saves can be incomplete. Publish applies strict checks.
      </p>
    </section>
  );
}
