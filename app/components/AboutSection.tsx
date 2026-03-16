import { ActionLink, SectionBlock, SectionTitle } from "@/app/components/ui";

interface AboutSectionProps {
  description: string;
}

export function AboutSection({ description }: AboutSectionProps) {
  return (
    <SectionBlock>
      <SectionTitle title="About TranquilityHub" />
      <p className="text-base leading-relaxed text-[var(--text-muted)] lg:text-lg">{description}</p>
      <div>
        <ActionLink href="/about" label="Read Full About Page" />
      </div>
    </SectionBlock>
  );
}
