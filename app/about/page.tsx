import Image from "next/image";
import { Card, SectionBlock, SectionTitle } from "@/app/components/ui";
import { aboutPageContent } from "@/app/data/homepageData";
import { Metadata } from "next";
export const metadata: Metadata = { title: { absolute: "About TranquilityHub — Our Story, Mission & Vision" } };
export default function AboutPage() {
  const introParagraph = aboutPageContent.paragraphs[0];
  const storyParagraphs = aboutPageContent.paragraphs.slice(1, 4);
  const closingThought = aboutPageContent.paragraphs[4];

  return (
    <div className="grid min-h-screen bg-background text-foreground">
      <main className="mx-auto grid w-full max-w-[84rem] gap-8 px-5 py-8 sm:px-8 sm:py-10 lg:gap-10 lg:px-10 xl:gap-12">
        <SectionBlock className="lg:p-12">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-8 top-10 h-32 w-32 rounded-full bg-white/70 blur-3xl" />
            <div className="absolute right-8 top-8 h-24 w-24 rounded-full bg-[#dcebf4] blur-2xl" />
            <div className="absolute bottom-0 right-1/4 h-28 w-40 rounded-full bg-[#e0f1e6] blur-3xl" />
          </div>

          <div className="relative grid gap-4 lg:grid-cols-12 lg:auto-rows-[minmax(8rem,auto)] xl:gap-5">
            <Card className="gap-5 rounded-[32px] p-7 sm:p-9 lg:col-span-12 lg:row-span-2 xl:p-12">
              <div className="inline-flex w-fit items-center rounded-full border border-white/80 bg-white/75 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700 shadow-sm backdrop-blur">
                Our Story
              </div>
              <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#4A7FA5] sm:text-4xl lg:text-5xl xl:text-6xl">
                About TranquilityHub
              </h1>
              <p className="max-w-2xl text-lg leading-relaxed text-[var(--text-muted)] sm:text-xl xl:text-[1.35rem]">
                {introParagraph}
              </p>
            </Card>

            <Card className="gap-5 rounded-[30px] p-6 sm:p-8 lg:col-span-12 lg:row-span-3 lg:p-10">
              <div className="grid gap-5">
                {storyParagraphs.map((para, i) => (
                  <p key={i} className="text-base leading-relaxed text-[var(--text-muted)] lg:text-lg">
                    {para}
                  </p>
                ))}
              </div>
            </Card>

            <Card className="gap-4 rounded-2xl p-5 lg:col-span-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Purpose</p>
                <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">A quieter digital space for reflection, balance, and thoughtful growth.</p>
              </div>
              <div className="h-px bg-[var(--border-muted)]" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Audience</p>
                <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">Students and young people navigating pressure, noise, and constant pace.</p>
              </div>
            </Card>

            <Card className="gap-2 rounded-2xl p-5 lg:col-span-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Promise</p>
              <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">Practical reflections and calm perspectives that feel useful, not heavy.</p>
            </Card>

            <Card className="gap-2 rounded-[24px] p-5 lg:col-span-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#4A7FA5]">Core Idea</p>
              <p className="mt-3 font-serif text-xl leading-relaxed text-[var(--text-strong)] sm:text-2xl">
                {closingThought}
              </p>
            </Card>
          </div>
        </SectionBlock>

        <SectionBlock className="relative overflow-hidden lg:p-12">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(201,219,232,0.3),transparent_65%)]" />
          <div className="relative aspect-[16/7] w-full overflow-hidden rounded-[24px] ring-2 ring-[var(--border-muted)] shadow-[0_20px_60px_rgba(15,23,42,0.08)] xl:aspect-[21/8]">
            <Image
              src="/featured-reflection.svg"
              alt="A journal and coffee on a calm, softly lit desk"
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
        </SectionBlock>

        <SectionBlock className="relative overflow-hidden">
          <div className="pointer-events-none absolute right-0 top-0 h-28 w-28 rounded-full bg-white/70 blur-3xl" />
          <SectionTitle title="From the Founder" />
          <blockquote className="relative rounded-[24px] border border-white/80 bg-white/85 px-6 py-6 text-base leading-relaxed text-[var(--text-muted)] shadow-sm ring-1 ring-[var(--border-muted)]/70 backdrop-blur-sm lg:px-8 lg:text-lg">
            <span className="mb-3 block font-serif text-4xl leading-none text-[#4A7FA5]">“</span>
            {aboutPageContent.founderNote}
          </blockquote>
        </SectionBlock>
      </main>
    </div>
  );
}
