import Image from "next/image";
import { ActionLink, SectionBlock, SectionTitle } from "@/app/components/ui";
import type { FeaturedReflection } from "@/types";

interface FeaturedReflectionSectionProps {
  reflection: FeaturedReflection;
}

export function FeaturedReflectionSection({ reflection }: FeaturedReflectionSectionProps) {
  return (
    <SectionBlock className="relative overflow-hidden" bgVariant="default">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(180deg, var(--hero-from), var(--hero-via), var(--hero-to))" }}
      />
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
        <Image
          src={reflection.imageSrc}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-right"
          style={{
            opacity: 1.85,
            transform: "scale(1.2)",
            maskImage: "linear-gradient(to right, transparent 0%, transparent 25%, rgba(0,0,0,0.4) 50%, black 80%)",
            WebkitMaskImage: "linear-gradient(to right, transparent 0%, transparent 25%, rgba(0,0,0,0.4) 50%, black 80%)",
          }}
          priority
        />
      </div>

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
