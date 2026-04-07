import { ActionLink } from "@/app/components/ui";

interface HeroSectionProps {
  siteName: string;
  tagline: string;
  ctaHref: string;
  ctaLabel: string;
}

export function HeroSection({ siteName, tagline, ctaHref, ctaLabel }: HeroSectionProps) {
  return (
    <section
      className="relative overflow-hidden rounded-xl p-8 shadow-sm ring-1 ring-[var(--border-muted)] sm:p-10 lg:p-12"
      style={{
        background: "linear-gradient(180deg, var(--hero-from), var(--hero-via), var(--hero-to))",
      }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-8 top-8 h-14 w-28 rounded-full blur-sm" style={{ background: "var(--hero-glow-a)" }} />
        <div className="absolute right-20 top-12 h-10 w-24 rounded-full blur-sm" style={{ background: "var(--hero-glow-b)" }} />
        <div className="absolute bottom-10 left-1/3 h-24 w-24 rounded-full blur-2xl" style={{ background: "var(--hero-glow-c)" }} />
      </div>
      <div className="relative grid gap-5">
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-emerald-700">Welcome</p>
        <h1 className="text-4xl font-semibold tracking-tight text-[var(--text-strong)] sm:text-5xl lg:text-5xl">{siteName}</h1>
        <p className="max-w-2xl text-lg leading-relaxed text-[var(--text-muted)] sm:text-xl lg:text-2xl">{tagline}</p>
        <div className="pt-2">
          <ActionLink href={ctaHref} label={ctaLabel} fadeIn />
        </div>
      </div>
    </section>
  );
}
