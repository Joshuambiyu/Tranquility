import Link from "next/link";
import { Card, SectionBlock } from "@/app/components/ui";

export default function NotFound() {
  return (
    <div className="grid min-h-screen bg-[radial-gradient(circle_at_top_left,_#d9efe5,_#edf4f8_42%,_#f7f8f4_78%)] text-foreground">
      <main className="mx-auto grid w-full max-w-6xl place-items-center px-5 py-10 sm:px-8 sm:py-14 lg:px-10 lg:py-16">
        <SectionBlock className="relative w-full max-w-4xl overflow-hidden lg:p-12">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-12 top-8 h-28 w-28 rounded-full bg-white/75 blur-3xl" />
            <div className="absolute right-8 top-0 h-24 w-24 rounded-full bg-[#dcebf4] blur-2xl" />
            <div className="absolute bottom-0 right-1/4 h-24 w-40 rounded-full bg-[#e0f1e6] blur-3xl" />
          </div>

          <div className="relative grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-end">
            <div className="grid gap-4">
              <p className="w-fit rounded-full border border-white/80 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700 shadow-sm backdrop-blur">
                Error 404
              </p>
              <h1 className="font-serif text-4xl font-semibold tracking-tight text-[var(--text-strong)] sm:text-5xl lg:text-6xl">
                This page drifted away.
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-[var(--text-muted)] sm:text-lg">
                The link may be outdated, the page may have moved, or the URL might be slightly off. Let&apos;s get you back to a calm place.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/"
                  className="inline-grid place-items-center rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
                >
                  Back to Home
                </Link>
                <Link
                  href="/search"
                  className="inline-grid place-items-center rounded-full border border-[var(--border-muted)] bg-[var(--surface)] px-6 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-[var(--accent-soft)]"
                >
                  Search Content
                </Link>
              </div>
            </div>

            <Card className="gap-3 rounded-2xl p-5 sm:p-6 lg:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Quick paths</p>
              <Link href="/journals" className="text-sm font-medium text-[var(--text-strong)] transition hover:text-emerald-700">
                Continue to Journals
              </Link>
              <Link href="/blog" className="text-sm font-medium text-[var(--text-strong)] transition hover:text-emerald-700">
                Read latest Articles
              </Link>
              <Link href="/contact" className="text-sm font-medium text-[var(--text-strong)] transition hover:text-emerald-700">
                Contact us
              </Link>
            </Card>
          </div>
        </SectionBlock>
      </main>
    </div>
  );
}
