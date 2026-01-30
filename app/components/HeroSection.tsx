import { ActionLink } from "@/app/components/ui";

interface HeroSectionProps {
  siteName: string;
  tagline: string;
  ctaHref: string;
  ctaLabel: string;
}

export function HeroSection({ siteName, tagline, ctaHref, ctaLabel }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-emerald-100 via-cyan-50 to-white p-10 shadow-sm ring-1 ring-emerald-100 sm:p-14">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-8 top-8 h-14 w-28 rounded-full bg-white/80 blur-sm" />
        <div className="absolute right-20 top-12 h-10 w-24 rounded-full bg-white/70 blur-sm" />
        <div className="absolute bottom-10 left-1/3 h-24 w-24 rounded-full bg-cyan-100/60 blur-2xl" />
      </div>
      <div className="relative grid gap-5">
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-emerald-700">Welcome</p>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-6xl">{siteName}</h1>
        <p className="max-w-xl text-xl text-slate-700 sm:text-2xl">{tagline}</p>
        <div className="pt-2">
          <ActionLink href={ctaHref} label={ctaLabel} fadeIn />
        </div>
      </div>
    </section>
  );
}
