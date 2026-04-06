import { SectionBlock, SectionTitle, CARD_BG_VARIANTS } from "@/app/components/ui";
import type { HelpItem } from "@/types";

interface HelpsSectionProps {
  items: HelpItem[];
}

export function HelpsSection({ items }: HelpsSectionProps) {
  return (
    <SectionBlock bgVariant="sectionBlockBg">
      <SectionTitle title="How TranquilityHub Helps You" />
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.title}
            className={`grid gap-2 rounded-xl p-5 ring-1 ring-[var(--border-muted)] ${CARD_BG_VARIANTS.cardInSectionBg}`}
          >
            <h3 className="text-xl font-semibold text-[var(--text-strong)] lg:text-2xl">
              <span className="mr-2" aria-hidden>
                {item.icon}
              </span>
              {item.title}
            </h3>
            <p className="text-[15px] leading-relaxed text-[var(--text-muted)] lg:text-base">{item.description}</p>
          </article>
        ))}
      </div>
    </SectionBlock>
  );
}
