import Link from "next/link";
import { BlendedImageLayer } from "@/app/components/BlendedImageLayer";
import { SectionBlock, SectionTitle } from "@/app/components/ui";
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
      <article className="relative grid gap-5 md:grid-cols-[1.1fr_1fr] md:items-center">
        <div className="grid gap-3">
          <h3 className="text-2xl font-semibold text-[var(--text-strong)]">{reflection.title}</h3>
          <p className="text-[var(--text-muted)]">{reflection.summary}</p>
          <Link href={reflection.href} className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
            Read full reflection
          </Link>
        </div>
        <div className="hidden h-52 md:block" aria-hidden="true" />
      </article>
    </SectionBlock>
  );
}
