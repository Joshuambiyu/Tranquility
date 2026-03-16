import Image from "next/image";
import { SectionBlock, SectionTitle } from "@/app/components/ui";
import { aboutPageContent } from "@/app/data/homepageData";

export default function AboutPage() {
  return (
    <div className="grid min-h-screen bg-background text-foreground">
      <main className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
        <SectionBlock>
          <SectionTitle title="About" />
          <p className="max-w-4xl text-base leading-relaxed text-[var(--text-muted)] lg:text-xl">
            {aboutPageContent.mission}
          </p>
        </SectionBlock>

        <SectionBlock>
          <SectionTitle title="Our Story" />
          <div className="grid gap-6 md:grid-cols-[1fr_1fr] md:items-center">
            <p className="text-base leading-relaxed text-[var(--text-muted)] lg:text-lg">{aboutPageContent.story}</p>
            <div className="relative h-52 overflow-hidden rounded-xl ring-1 ring-[var(--border-muted)] sm:h-60">
              <Image
                src="/featured-reflection.svg"
                alt="Calm sunrise symbolizing reflection and growth"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </SectionBlock>

        <SectionBlock>
          <SectionTitle title="From the Founder" />
          <p className="text-base leading-relaxed text-[var(--text-muted)] lg:text-lg">{aboutPageContent.founderNote}</p>
        </SectionBlock>

        <SectionBlock className="bg-[var(--surface-muted)]">
          <SectionTitle title="Closing Reflection" />
          <p className="text-base leading-relaxed text-[var(--text-muted)] lg:text-lg">{aboutPageContent.closing}</p>
        </SectionBlock>
      </main>
    </div>
  );
}
