import Image from "next/image";

const BLEND_MASK = "linear-gradient(to right, transparent 0%, transparent 25%, rgba(0,0,0,0.4) 50%, black 80%)";

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
}

export function BlendedImageLayer({
  imageSrc,
  imageAlt = "",
  sizes = "100vw",
  priority = true,
  showGradient = true,
  roundedClassName = "rounded-xl",
  objectPositionClassName = "object-right",
  opacity = 1.85,
  scale = 1.2,
}: BlendedImageLayerProps) {
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