import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

// Background variants for sections
// To change the gradient across all sections, update --section-from/via/to in globals.css
export const SECTION_BG_VARIANTS = {
  sectionBlockBg: {
    className: "relative overflow-hidden",
    style: {
      background: "linear-gradient(135deg, var(--section-from) 0%, var(--section-via) 52%, var(--section-to) 100%)",
    },
  },
  default: {
    className: "",
    style: {},
  },
};

// Background variants for cards
export const CARD_BG_VARIANTS = {
  cardInSectionBg: "bg-[var(--accent-soft-2)]",
  muted: "bg-[var(--surface-muted)]",
  soft: "bg-[var(--accent-soft)]",
  surface: "bg-[var(--surface)]",
};

type SectionBgVariant = keyof typeof SECTION_BG_VARIANTS;
type CardBgVariant = keyof typeof CARD_BG_VARIANTS;

interface SectionBlockProps extends ComponentPropsWithoutRef<"section"> {
  children: ReactNode;
  bgVariant?: SectionBgVariant;
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

export function SectionBlock({
  children,
  className = "",
  bgVariant = "default",
  ...props
}: SectionBlockProps) {
  const bgConfig = SECTION_BG_VARIANTS[bgVariant];
  const baseClass = `grid gap-6 rounded-xl p-6 shadow-sm ring-1 ring-[var(--border-muted)] sm:p-8 lg:p-10`;

  // For default variant, include the default background
  const sectionClass =
    bgVariant === "default"
      ? `${baseClass} bg-[var(--surface)] ${bgConfig.className}`
      : `${baseClass} ${bgConfig.className}`;

  return (
    <section
      {...props}
      className={`${sectionClass} ${className}`}
      style={bgVariant === "default" ? undefined : bgConfig.style}
    >
      {children}
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

interface CardProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
  bgVariant?: CardBgVariant;
  href?: string;
}

export function Card({ children, bgVariant = "cardInSectionBg", href, className = "", ...props }: CardProps) {
  const bgClass = CARD_BG_VARIANTS[bgVariant];
  const baseClass = `grid gap-2 rounded-xl p-5 ring-1 ring-[var(--border-muted)] transition`;

  if (href) {
    return (
      <a
        href={href}
        {...(props as ComponentPropsWithoutRef<"a">)}
        className={`${baseClass} ${bgClass} hover:bg-[var(--accent-soft)] ${className}`}
      >
        {children}
      </a>
    );
  }

  return (
    <div {...props} className={`${baseClass} ${bgClass} ${className}`}>
      {children}
    </div>
  );
}
