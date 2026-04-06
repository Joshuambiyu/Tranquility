import { ActionLink, Card, SectionBlock, SectionTitle } from "@/app/components/ui";
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
          <Card
            key={voice.id}
            href={voice.href}
            className="gap-2"
          >
            <h3 className="text-lg font-semibold text-[var(--text-strong)] lg:text-xl">{voice.title}</h3>
            <p className="text-sm leading-relaxed text-[var(--text-muted)] lg:text-base">{voice.description}</p>
            <span className="text-sm font-semibold text-emerald-700">Read More Voices</span>
          </Card>
        ))}
      </div>
      <div>
        <ActionLink href="/voices#share-your-voice" label="Submit your Voice" />
      </div>
    </SectionBlock>
  );
}
