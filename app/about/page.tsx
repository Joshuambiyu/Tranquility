import Image from "next/image";
import { FooterSection } from "@/app/components/FooterSection";
import { SectionBlock, SectionTitle } from "@/app/components/ui";
import { aboutPageContent, footerLinks } from "@/app/data/homepageData";

export default function AboutPage() {
  return (
    <div className="grid min-h-screen bg-[radial-gradient(circle_at_top_left,_#ddebe3,_#edf5fb_40%,_#f7f8f4_75%)] text-slate-800">
      <main className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
        <SectionBlock>
          <SectionTitle title="About" />
          <p className="max-w-4xl text-lg text-slate-700">{aboutPageContent.mission}</p>
        </SectionBlock>

        <SectionBlock>
          <SectionTitle title="Our Story" />
          <div className="grid gap-6 md:grid-cols-[1fr_1fr] md:items-center">
            <p className="text-slate-700">{aboutPageContent.story}</p>
            <div className="relative h-52 overflow-hidden rounded-2xl ring-1 ring-emerald-100 sm:h-60">
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
          <p className="text-slate-700">{aboutPageContent.founderNote}</p>
        </SectionBlock>

        <SectionBlock className="bg-gradient-to-r from-white via-emerald-50/50 to-cyan-50/50">
          <SectionTitle title="Closing Reflection" />
          <p className="text-slate-700">{aboutPageContent.closing}</p>
        </SectionBlock>
      </main>

      <div className="mx-auto grid w-full max-w-6xl px-5 pb-8 sm:px-8 lg:px-10">
        <FooterSection links={footerLinks} />
      </div>
    </div>
  );
}
