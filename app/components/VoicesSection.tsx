import { ActionLink, SectionBlock, SectionTitle, CARD_BG_VARIANTS } from "@/app/components/ui";
import type { CommunityVoiceItem } from "@/types";

interface VoicesSectionProps {
  voices: CommunityVoiceItem[];
}

export function VoicesSection({ voices }: VoicesSectionProps) {
  return (
    <SectionBlock bgVariant="sectionBlockBg">
      <SectionTitle
        title="Voices of our Community"
        description="Read reflections from students navigating growth, stress and self-discovery."
      />
      <div className="grid gap-4 md:grid-cols-3">
        {voices.map((voice) => (
          <a
            key={voice.id}
            href={voice.href}
            className="grid gap-2 rounded-xl bg-[var(--accent-soft-2)] p-5 ring-1 ring-[var(--border-muted)] transition hover:bg-[var(--accent-soft)]"
          >
            <h3 className="text-lg font-semibold text-[var(--text-strong)] lg:text-xl">{voice.title}</h3>
            <p className="text-sm leading-relaxed text-[var(--text-muted)] lg:text-base">{voice.description}</p>
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
