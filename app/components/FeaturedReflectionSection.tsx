import Image from "next/image";
import { ActionLink, SectionBlock, SectionTitle } from "@/app/components/ui";
import type { FeaturedReflection } from "@/types";

interface FeaturedReflectionSectionProps {
  reflection: FeaturedReflection;
}

export function FeaturedReflectionSection({ reflection }: FeaturedReflectionSectionProps) {
  return (
    <SectionBlock>
      <SectionTitle title="Featured Reflection of the Week" />
      <div className="grid gap-6 md:grid-cols-[1.2fr_1fr] md:items-center">
        <div className="grid gap-4">
          <h3 className="text-2xl font-semibold text-slate-900">{reflection.title}</h3>
          <p className="text-slate-700">{reflection.summary}</p>
          <div>
            <ActionLink href={reflection.href} label="Read the Reflection" />
          </div>
        </div>
        <div className="relative h-52 overflow-hidden rounded-2xl ring-1 ring-sky-100">
          <Image
            src={reflection.imageSrc}
            alt={reflection.imageAlt}
            fill
            sizes="(max-width: 768px) 100vw, 40vw"
            className="object-cover"
          />
        </div>
      </div>
    </SectionBlock>
  );
}
