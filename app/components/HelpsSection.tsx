import { SectionBlock, SectionTitle } from "@/app/components/ui";
import type { HelpItem } from "@/types";

interface HelpsSectionProps {
  items: HelpItem[];
}

export function HelpsSection({ items }: HelpsSectionProps) {
  return (
    <SectionBlock>
      <SectionTitle title="How TranquilityHub Helps You" />
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <article key={item.title} className="grid gap-2 rounded-2xl bg-sky-50/80 p-5 ring-1 ring-sky-100">
            <h3 className="text-xl font-semibold text-slate-900">
              <span className="mr-2" aria-hidden>
                {item.icon}
              </span>
              {item.title}
            </h3>
            <p className="text-slate-700">{item.description}</p>
          </article>
        ))}
      </div>
    </SectionBlock>
  );
}
