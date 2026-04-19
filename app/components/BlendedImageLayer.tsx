import Image from "next/image";

const BLEND_MASK = "linear-gradient(to right, transparent 0%, transparent 25%, rgba(0,0,0,0.4) 50%, black 80%)";
const DESKTOP_RIGHT_PANEL_MASK = "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.55) 38%, black 68%)";

interface BlendedImageLayerProps {
  imageSrc: string;
  imageAlt?: string;
  sizes?: string;
  priority?: boolean;
  showGradient?: boolean;
  roundedClassName?: string;
  objectPositionClassName?: string;
  opacity?: number;
  scale?: number;
  desktopRightFadeLayout?: boolean;
  desktopRightWidthClassName?: string;
}

export function BlendedImageLayer({
  imageSrc,
  imageAlt = "",
  sizes = "100vw",
  priority = true,
  showGradient = true,
  roundedClassName = "rounded-xl",
  objectPositionClassName = "object-right",
  opacity = 0.92,
  scale = 1.2,
  desktopRightFadeLayout = false,
  desktopRightWidthClassName = "lg:w-[48%] xl:w-[44%]",
}: BlendedImageLayerProps) {
  if (desktopRightFadeLayout) {
    return (
      <>
        {showGradient ? (
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "linear-gradient(180deg, var(--hero-from), var(--hero-via), var(--hero-to))" }}
          />
        ) : null}

        <div className={`pointer-events-none absolute inset-0 overflow-hidden ${roundedClassName} lg:hidden`}>
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes={sizes}
            className={`object-cover ${objectPositionClassName}`}
            style={{
              opacity,
              transform: "scale(1.08)",
              maskImage: BLEND_MASK,
              WebkitMaskImage: BLEND_MASK,
            }}
            priority={priority}
          />
        </div>

        <div className={`pointer-events-none absolute inset-y-0 right-0 hidden overflow-hidden lg:block ${desktopRightWidthClassName}`}>
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes="(min-width: 1280px) 520px, (min-width: 1024px) 46vw, 100vw"
            className={`object-cover ${objectPositionClassName}`}
            style={{
              opacity: 0.98,
              transform: "scale(1.02)",
              maskImage: DESKTOP_RIGHT_PANEL_MASK,
              WebkitMaskImage: DESKTOP_RIGHT_PANEL_MASK,
            }}
            priority={priority}
          />
        </div>
      </>
    );
  }

  return (
    <>
      {showGradient ? (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(180deg, var(--hero-from), var(--hero-via), var(--hero-to))" }}
        />
      ) : null}

      <div className={`pointer-events-none absolute inset-0 overflow-hidden ${roundedClassName}`}>
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes={sizes}
          className={`object-cover ${objectPositionClassName}`}
          style={{
            opacity,
            transform: `scale(${scale})`,
            maskImage: BLEND_MASK,
            WebkitMaskImage: BLEND_MASK,
          }}
          priority={priority}
        />
      </div>
    </>
  );
}