import { ActionLink, SectionBlock, SectionTitle } from "@/app/components/ui";
import type { CommunityVoiceItem } from "@/types";

interface VoicesSectionProps {
  voices: CommunityVoiceItem[];
}

export function VoicesSection({ voices }: VoicesSectionProps) {
  return (
    <SectionBlock>
      <SectionTitle
        title="Voices of our Community"
        description="Read reflections from students navigating growth, stress and self-discovery."
      />
      <div className="grid gap-4 md:grid-cols-3">
        {voices.map((voice) => (
          <a
            key={voice.id}
            href={voice.href}
            className="grid gap-2 rounded-2xl bg-white p-5 ring-1 ring-emerald-100 transition hover:bg-emerald-50"
          >
            <h3 className="text-lg font-semibold text-slate-900">{voice.title}</h3>
            <p className="text-sm text-slate-700">{voice.description}</p>
            <span className="text-sm font-semibold text-emerald-700">Read More Voices</span>
          </a>
        ))}
      </div>
      <div>
        <ActionLink href="/voices/submit" label="Submit your Reflection" />
      </div>
    </SectionBlock>
  );
}
