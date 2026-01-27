import { ActionLink, SectionBlock, SectionTitle } from "@/app/components/ui";
import { FooterSection } from "@/app/components/FooterSection";
import {
  footerLinks,
  voiceOfWeek,
  voiceReflections,
  voicesIntro,
} from "@/app/data/homepageData";

export default function VoicesPage() {
  return (
    <div className="grid min-h-screen bg-[radial-gradient(circle_at_top_left,_#e3f0ea,_#eef6fb_40%,_#f7f8f4_75%)] text-slate-800">
      <main className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
        <SectionBlock className="gap-4">
          <SectionTitle title="Voices" description={voicesIntro} />
        </SectionBlock>

        <SectionBlock>
          <SectionTitle title="Voice of the Week" />
          <article className="grid gap-3 rounded-2xl bg-gradient-to-br from-emerald-50 via-cyan-50 to-white p-6 ring-1 ring-emerald-100">
            <h3 className="text-2xl font-semibold text-slate-900">{voiceOfWeek.title}</h3>
            <p className="text-slate-700">{voiceOfWeek.reflection}</p>
            <p className="text-sm font-medium text-emerald-700">- {voiceOfWeek.author}</p>
          </article>
        </SectionBlock>

        <SectionBlock>
          <SectionTitle title="Community Reflections" description="Short reflections shared by our readers and contributors." />
          <div className="grid gap-4 md:grid-cols-2">
            {voiceReflections.map((voice) => (
              <article
                key={voice.id}
                className="grid gap-3 rounded-2xl bg-emerald-50/60 p-6 ring-1 ring-emerald-100"
              >
                <h3 className="text-xl font-semibold text-slate-900">{voice.title}</h3>
                <p className="text-slate-700">{voice.reflection}</p>
                <p className="text-sm font-medium text-emerald-700">- {voice.author}</p>
              </article>
            ))}
          </div>
        </SectionBlock>

        <SectionBlock className="gap-4 bg-gradient-to-r from-white via-emerald-50/40 to-cyan-50/40">
          <SectionTitle title="Share your voice" />
          <p className="max-w-3xl text-slate-700">
            Do you have a reflection or thought you would like to share? TranquilityHub welcomes thoughtful perspectives from readers.
          </p>
          <div>
            <ActionLink href="/contact" label="Submit your Reflection" />
          </div>
        </SectionBlock>
      </main>

      <div className="mx-auto grid w-full max-w-6xl px-5 pb-8 sm:px-8 lg:px-10">
        <FooterSection links={footerLinks} />
      </div>
    </div>
  );
}
