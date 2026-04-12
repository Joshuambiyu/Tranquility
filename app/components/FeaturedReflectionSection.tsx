import { BlendedImageLayer } from "@/app/components/BlendedImageLayer";
import { ActionLink, SectionBlock, SectionTitle } from "@/app/components/ui";
import type { FeaturedReflection } from "@/types";

interface FeaturedReflectionSectionProps {
  reflection: FeaturedReflection;
}

export function FeaturedReflectionSection({ reflection }: FeaturedReflectionSectionProps) {
  return (
    <SectionBlock className="relative overflow-hidden" bgVariant="default">
      <BlendedImageLayer imageSrc={reflection.imageSrc} />

      <div className="relative">
        <SectionTitle title="Featured Reflection of the Week" />
      </div>
      <div className="relative grid gap-6 md:grid-cols-[1.2fr_1fr] md:items-center">
        <div className="grid gap-4">
          <h3 className="text-2xl font-semibold text-[var(--text-strong)] lg:text-3xl">{reflection.title}</h3>
          <p className="text-base leading-relaxed text-[var(--text-muted)] lg:text-lg">{reflection.summary}</p>
          <div>
            <ActionLink href={reflection.href} label="Read the Reflection" />
          </div>
        </div>
        <div className="hidden h-52 md:block" aria-hidden="true" />
      </div>
    </SectionBlock>
  );
}
