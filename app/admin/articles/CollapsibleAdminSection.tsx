"use client";

import { useState, type ReactNode } from "react";

type CollapsibleAdminSectionProps = {
  panelId: string;
  title: string;
  sectionClassName: string;
  children: ReactNode;
  defaultExpanded?: boolean;
};

export default function CollapsibleAdminSection({
  panelId,
  title,
  sectionClassName,
  children,
  defaultExpanded = true,
}: CollapsibleAdminSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <section className={sectionClassName}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            disabled={isExpanded}
            className="w-full rounded-full border border-emerald-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            aria-controls={panelId}
          >
            Reveal
          </button>
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            disabled={!isExpanded}
            className="w-full rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            aria-controls={panelId}
          >
            Collapse
          </button>
        </div>
      </div>

      <div id={panelId} className={isExpanded ? "grid gap-4" : "hidden"}>
        {children}
      </div>
    </section>
  );
}