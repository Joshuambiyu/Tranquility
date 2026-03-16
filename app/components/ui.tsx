import Link from "next/link";
import type { ReactNode } from "react";

interface SectionBlockProps {
  children: ReactNode;
  className?: string;
}

interface SectionTitleProps {
  title: string;
  description?: string;
}

interface ActionLinkProps {
  href: string;
  label: string;
  fadeIn?: boolean;
}

export function SectionBlock({ children, className = "" }: SectionBlockProps) {
  return (
    <section
      className={`grid gap-6 rounded-xl bg-[var(--surface)] p-6 shadow-sm ring-1 ring-[var(--border-muted)] sm:p-8 lg:p-10 ${className}`}
    >
      {children} {/* children for reusability in wrapper component */}
    </section>
  );
}

export function SectionTitle({ title, description }: SectionTitleProps) {
  return (
    <header className="grid gap-2">
      <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-strong)] sm:text-3xl lg:text-4xl">{title}</h2>
      {description ? (
        <p className="max-w-3xl text-[15px] leading-relaxed text-[var(--text-muted)] sm:text-base lg:text-lg">
          {description}
        </p>
      ) : null}
    </header>
  );
}

export function ActionLink({ href, label, fadeIn = false }: ActionLinkProps) {
  return (
    <Link
      href={href}
      className={`inline-grid place-items-center rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800 lg:text-base ${fadeIn ? "animate-fade-in" : ""}`}
    >
      {label}
    </Link>
  );
}
