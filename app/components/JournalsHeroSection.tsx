import { BlendedImageLayer } from "@/app/components/BlendedImageLayer";
import { SectionBlock, SectionTitle } from "@/app/components/ui";

interface JournalsHeroSectionProps {
  title: string;
  description: string;
  helperText: string;
}

export function JournalsHeroSection({ title, description, helperText }: JournalsHeroSectionProps) {
  return (
    <SectionBlock className="relative gap-4 overflow-hidden lg:min-h-[19rem]" bgVariant="light">
      <BlendedImageLayer
        imageSrc="/images/journals-my-journals-image.jpeg"
        objectPositionClassName="object-[78%_86%] lg:object-[94%_88%]"
        opacity={1}
        scale={1.03}
      />

      <div className="relative max-w-3xl lg:max-w-[58%]">
        <SectionTitle title={title} description={description} />
      </div>
      <p className="relative max-w-3xl text-sm text-[var(--text-muted)] lg:max-w-[58%]">{helperText}</p>
    </SectionBlock>
  );
}