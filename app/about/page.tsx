import Image from "next/image";
import { SectionBlock, SectionTitle } from "@/app/components/ui";
import { aboutPageContent } from "@/app/data/homepageData";

export default function AboutPage() {
  return (
    <div className="grid min-h-screen bg-background text-foreground">
      <main className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-8 sm:px-8 sm:py-10 lg:px-10">

        <SectionBlock>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#4A7FA5] sm:text-4xl lg:text-5xl">
            About TranquilityHub
          </h1>
          <div className="grid gap-5">
            {aboutPageContent.paragraphs.map((para, i) => (
              <p key={i} className="text-base leading-relaxed text-[var(--text-muted)] lg:text-lg">
                {para}
              </p>
            ))}
          </div>
        </SectionBlock>

        <SectionBlock>
          <div className="relative aspect-[16/7] w-full overflow-hidden rounded-xl ring-2 ring-[var(--border-muted)]">
            <Image
              src="/featured-reflection.svg"
              alt="A journal and coffee on a calm, softly lit desk"
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
        </SectionBlock>

        <SectionBlock>
          <SectionTitle title="From the Founder" />
          <p className="text-base leading-relaxed text-[var(--text-muted)] lg:text-lg">
            {aboutPageContent.founderNote}
          </p>
        </SectionBlock>

      </main>
    </div>
  );
}
