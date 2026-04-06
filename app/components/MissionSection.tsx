import { SectionBlock, SectionTitle } from "@/app/components/ui";

interface MissionSectionProps {
  mission: string;
}

export function MissionSection({ mission }: MissionSectionProps) {
  return (
    <SectionBlock bgVariant="sectionBlockBg">
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -left-8 top-6 h-28 w-28 rounded-full blur-2xl"
          style={{ background: "var(--mission-glow-a)" }}
        />
        <div
          className="absolute right-8 bottom-2 h-24 w-40 rounded-full blur-2xl"
          style={{ background: "var(--mission-glow-b)" }}
        />
      </div>

      <div className="relative grid gap-6">
        <SectionTitle title="Mission Statement" />
        <p className="max-w-4xl text-base leading-relaxed text-[var(--text-muted)] lg:text-xl">{mission}</p>
      </div>
    </SectionBlock>
  );
}
