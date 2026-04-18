"use client";

import { useState, type ReactNode } from "react";

import { adminButtonClass } from "@/app/admin/adminDesign";

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
  defaultExpanded = false,
}: CollapsibleAdminSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <section className={sectionClassName}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        {!isExpanded ? (
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">Collapsed - tap Expand to view</p>
        ) : null}
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            disabled={isExpanded}
            className={adminButtonClass({ tone: "primary", size: "compact" })}
            aria-controls={panelId}
          >
            Expand
          </button>
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            disabled={!isExpanded}
            className={adminButtonClass({ tone: "secondary", size: "compact" })}
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