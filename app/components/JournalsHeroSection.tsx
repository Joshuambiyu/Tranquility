import { BlendedImageLayer } from "@/app/components/BlendedImageLayer";
import { SectionBlock, SectionTitle } from "@/app/components/ui";

interface JournalsHeroSectionProps {
  title: string;
  description: string;
  helperText: string;
}

export function JournalsHeroSection({ title, description, helperText }: JournalsHeroSectionProps) {
  return (
    <SectionBlock className="relative gap-4 overflow-hidden" bgVariant="default">
      <BlendedImageLayer
        imageSrc="/images/journals-my-journals-image.jpeg"
        desktopRightFadeLayout
        objectPositionClassName="object-right"
        desktopRightWidthClassName="lg:w-[50%] xl:w-[46%]"
      />

      <div className="relative">
        <SectionTitle title={title} description={description} />
      </div>
      <p className="relative text-sm text-[var(--text-muted)]">{helperText}</p>
    </SectionBlock>
  );
}