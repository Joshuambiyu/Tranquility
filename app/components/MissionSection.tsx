import { SectionBlock, SectionTitle } from "@/app/components/ui";

interface MissionSectionProps {
  mission: string;
}

export function MissionSection({ mission }: MissionSectionProps) {
  return (
    <SectionBlock>
      <SectionTitle title="Mission Statement" />
      <p className="max-w-4xl text-lg text-slate-700">{mission}</p>
    </SectionBlock>
  );
}
