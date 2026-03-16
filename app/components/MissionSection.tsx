import { SectionBlock, SectionTitle } from "@/app/components/ui";

interface MissionSectionProps {
  mission: string;
}

export function MissionSection({ mission }: MissionSectionProps) {
  return (
    <SectionBlock>
      <SectionTitle title="Mission Statement" />
      <p className="max-w-4xl text-base leading-relaxed text-[var(--text-muted)] lg:text-xl">{mission}</p>
    </SectionBlock>
  );
}
